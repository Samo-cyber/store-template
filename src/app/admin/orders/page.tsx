"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";

interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    status: string;
    created_at: string;
    address: any;
}

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
        title: string;
        image_url: string;
    };
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setLoading(true);

        if (!supabase) {
            setOrders([]);
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    }

    async function updateStatus(id: string, newStatus: string) {
        if (!supabase) return;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            loadOrders();
        } else {
            alert("حدث خطأ أثناء تحديث الحالة");
        }
    }

    async function loadOrderItems(orderId: string) {
        setItemsLoading(true);

        if (!supabase) {
            setSelectedOrderItems([]);
            setItemsLoading(false);
            return;
        }

        const { data } = await supabase
            .from('order_items')
            .select(`
                *,
                products (
                    title,
                    image_url
                )
            `)
            .eq('order_id', orderId);

        if (data) setSelectedOrderItems(data as any);
        setItemsLoading(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500';
            case 'processing': return 'bg-blue-500/10 text-blue-500';
            case 'shipped': return 'bg-purple-500/10 text-purple-500';
            case 'delivered': return 'bg-green-500/10 text-green-500';
            case 'cancelled': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار';
            case 'processing': return 'جاري التجهيز';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">الطلبات</h1>
                <p className="text-muted-foreground">إدارة ومتابعة طلبات العملاء</p>
            </div>

            <div className="border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-sm text-right">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-4 font-medium text-muted-foreground">رقم الطلب</th>
                            <th className="p-4 font-medium text-muted-foreground">العميل</th>
                            <th className="p-4 font-medium text-muted-foreground">الإجمالي</th>
                            <th className="p-4 font-medium text-muted-foreground">التاريخ</th>
                            <th className="p-4 font-medium text-muted-foreground">الحالة</th>
                            <th className="p-4 font-medium text-muted-foreground">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                                <td className="p-4">
                                    <div className="font-medium">{order.customer_name}</div>
                                    <div className="text-muted-foreground text-xs">{order.customer_phone}</div>
                                </td>
                                <td className="p-4 font-bold">{order.total_amount} ج.م</td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                </td>
                                <td className="p-4">
                                    <select
                                        className={`px-2 py-1 rounded-full text-xs border-none outline-none cursor-pointer ${getStatusColor(order.status)}`}
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                    >
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="processing">جاري التجهيز</option>
                                        <option value="shipped">تم الشحن</option>
                                        <option value="delivered">تم التوصيل</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => loadOrderItems(order.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>تفاصيل الطلب</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground mb-1">العنوان</p>
                                                        <p>{order.address?.street}, {order.address?.city}, {order.address?.governorate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground mb-1">معلومات الاتصال</p>
                                                        <p>{order.customer_email}</p>
                                                        <p>{order.customer_phone}</p>
                                                    </div>
                                                </div>

                                                <div className="border rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted">
                                                            <tr>
                                                                <th className="p-3 text-right">المنتج</th>
                                                                <th className="p-3 text-right">الكمية</th>
                                                                <th className="p-3 text-right">السعر</th>
                                                                <th className="p-3 text-right">المجموع</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {itemsLoading ? (
                                                                <tr>
                                                                    <td colSpan={4} className="p-4 text-center">
                                                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                                    </td>
                                                                </tr>
                                                            ) : selectedOrderItems.map((item) => (
                                                                <tr key={item.id}>
                                                                    <td className="p-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                                                                                <img src={item.products?.image_url} className="h-full w-full object-cover" />
                                                                            </div>
                                                                            <span>{item.products?.title}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">{item.quantity}</td>
                                                                    <td className="p-3">{item.price_at_purchase} ج.م</td>
                                                                    <td className="p-3 font-medium">{(item.quantity * item.price_at_purchase).toFixed(2)} ج.م</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
