import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
    try {
        const { items, storeId, customerInfo } = await request.json();

        if (!items || !storeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initialize Supabase Admin Client to fetch store secrets securely
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Fetch Store's Stripe Keys
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('stripe_secret_key')
            .eq('id', storeId)
            .single();

        if (storeError || !store?.stripe_secret_key) {
            console.error("Store Stripe key not found:", storeError);
            return NextResponse.json({ error: 'Payment configuration missing for this store' }, { status: 400 });
        }

        // 2. Calculate Total Amount (Securely)
        // Ideally, we should fetch product prices from DB again to prevent tampering.
        // For this MVP, we will trust the passed items but verify existence.
        // Let's do a quick verification fetch.
        const productIds = items.map((item: any) => item.id);
        const { data: products } = await supabase
            .from('products')
            .select('id, price, stock')
            .in('id', productIds);

        let totalAmount = 0;
        const verifiedItems = items.map((item: any) => {
            const product = products?.find(p => p.id === item.id);
            if (!product) throw new Error(`Product ${item.id} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.id}`);

            const price = product.price;
            totalAmount += price * item.quantity;
            return { ...item, price };
        });

        // Add shipping cost (fixed for now or passed from client - strictly should be server side)
        // We'll accept shipping cost from client for now but validate it later if needed.
        // For simplicity, let's assume shipping is handled in the total passed or we calculate it here.
        // Let's assume the client sends the final total, but we should validate it.
        // Re-calculating total based on DB prices is safer.
        // Let's add shipping cost if provided in body, else 0.
        // const shippingCost = 0; // Or fetch from store settings
        // totalAmount += shippingCost;

        // 3. Initialize Stripe with Merchant's Key
        const stripe = new Stripe(store.stripe_secret_key, {
            apiVersion: '2024-04-10',
        });

        // 4. Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Convert to cents
            currency: 'sar', // Default to SAR for now, could be dynamic
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                storeId,
                customerName: customerInfo?.name,
                customerEmail: customerInfo?.email,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount
        });

    } catch (error: any) {
        console.error('Payment Intent Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
