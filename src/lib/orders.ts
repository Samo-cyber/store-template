import { supabase } from './supabase';

export interface OrderData {
    customer_name: string;
    customer_phone: string;
    address: {
        street: string;
        city: string;
        governorate: string;
        zipCode?: string;
    };
    items: {
        id: string;
        quantity: number;
        price: number;
    }[];
    total_amount: number;
}

export async function submitOrder(orderData: OrderData) {
    try {
        if (!supabase) {
            console.warn("Supabase not configured. Mocking order submission.");
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, orderId: "mock-order-id-" + Math.random().toString(36).substr(2, 9) };
        }

        const { data: orderId, error } = await supabase.rpc('create_order', {
            p_customer_name: orderData.customer_name,
            p_customer_phone: orderData.customer_phone,
            p_address: orderData.address,
            p_total_amount: orderData.total_amount,
            p_items: orderData.items
        });

        if (error) throw error;

        return { success: true, orderId };

    } catch (error: any) {
        console.error('Error submitting order:', error);
        return { success: false, error: error.message || "Unknown error occurred" };
    }
}
