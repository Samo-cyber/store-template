import { supabase } from './supabase';

export interface OrderData {
    customer_name: string;
    customer_email: string;
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
        const { data: orderId, error } = await supabase.rpc('create_order', {
            p_customer_name: orderData.customer_name,
            p_customer_email: orderData.customer_email,
            p_customer_phone: orderData.customer_phone,
            p_address: orderData.address,
            p_total_amount: orderData.total_amount,
            p_items: orderData.items
        });

        if (error) throw error;

        return { success: true, orderId };

    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, error };
    }
}
