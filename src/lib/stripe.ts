import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2024-04-10',
    typescript: true,
} as any);

export const PLANS = [
    {
        name: 'Starter',
        slug: 'starter',
        priceId: process.env.STRIPE_PRICE_ID_STARTER, // e.g., price_123...
        price: 299,
        features: ['Up to 50 Products', 'Basic Analytics', 'Standard Support']
    },
    {
        name: 'Pro',
        slug: 'pro',
        priceId: process.env.STRIPE_PRICE_ID_PRO,
        price: 599,
        features: ['Unlimited Products', 'Advanced Analytics', 'Priority Support', 'Custom Domain']
    }
];
