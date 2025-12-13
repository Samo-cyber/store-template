import { NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function getUser(request: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get('user_session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { planSlug, storeId } = body;

        const plan = PLANS.find(p => p.slug === planSlug);
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Verify ownership
        const { data: store } = await supabaseAdmin
            .from('stores')
            .select('id, stripe_customer_id, email') // Assuming stores has email or we fetch from user
            .eq('id', storeId)
            .eq('owner_id', user.userId)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Get or Create Customer
        let customerId = store.stripe_customer_id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email as string,
                metadata: {
                    storeId: storeId,
                    userId: user.userId as string
                }
            });
            customerId = customer.id;

            await supabaseAdmin
                .from('stores')
                .update({ stripe_customer_id: customerId })
                .eq('id', storeId);
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: plan.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : 'http://localhost:3000'}/store/${store.id}/admin/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : 'http://localhost:3000'}/store/${store.id}/admin/billing?canceled=true`,
            metadata: {
                storeId: storeId,
                planSlug: plan.slug
            },
            subscription_data: {
                metadata: {
                    storeId: storeId
                }
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
