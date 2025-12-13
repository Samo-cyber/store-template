import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    const body = await request.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const storeId = session.metadata.storeId;

        await supabaseAdmin
            .from('stores')
            .update({
                stripe_subscription_id: subscription.id,
                stripe_customer_id: session.customer,
                subscription_status: subscription.status,
                plan_type: session.metadata.planSlug, // Ensure we pass this in checkout
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', storeId);
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any;
        // Find store by customer ID
        // Note: Ideally we store storeId in subscription metadata too, but customer ID is unique enough per store usually if 1:1

        await supabaseAdmin
            .from('stores')
            .update({
                subscription_status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_customer_id', subscription.customer);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;

        await supabaseAdmin
            .from('stores')
            .update({
                subscription_status: 'canceled',
                plan_type: 'free'
            })
            .eq('stripe_customer_id', subscription.customer);
    }

    return NextResponse.json({ received: true });
}
