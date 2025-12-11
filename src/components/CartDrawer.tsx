"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function CartDrawer() {
    const { items, isCartOpen, toggleCart, removeFromCart, cartTotal, addToCart } = useCart();
    const historyPushedRef = useRef(false);

    // Handle back button behavior
    useEffect(() => {
        if (isCartOpen) {
            // Push state when cart opens
            window.history.pushState({ cartOpen: true }, "");
            historyPushedRef.current = true;

            const handlePopState = () => {
                // If back button is pressed, close the cart
                // The state is already popped by the browser
                historyPushedRef.current = false; // Prevent cleanup from popping again
                toggleCart();
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                // If we are closing and history was pushed (and not popped by back button), pop it now
                if (historyPushedRef.current) {
                    window.history.back();
                    historyPushedRef.current = false;
                }
            };
        }
    }, [isCartOpen, toggleCart]);

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l bg-background shadow-xl sm:max-w-md"
                    >
                        <div className="flex items-center justify-between px-4 py-4 border-b">
                            <h2 className="text-lg font-semibold">سلة التسوق</h2>
                            <Button variant="ghost" size="icon" onClick={toggleCart}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center space-y-2 text-muted-foreground">
                                    <p>سلة التسوق فارغة.</p>
                                    <Button variant="link" onClick={toggleCart}>
                                        تابع التسوق
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 space-x-4 rounded-lg border p-3">
                                            <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted/50">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-medium leading-none">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.price.toFixed(2)} ج.م
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center border rounded-md">
                                                    {/* Simple quantity controls could go here, for now just remove */}
                                                    <span className="px-2 text-sm">{item.quantity}</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="border-t p-4 space-y-4">
                                <div className="flex items-center justify-between font-medium">
                                    <span>المجموع</span>
                                    <span>{cartTotal.toFixed(2)} ج.م</span>
                                </div>
                                <Link href="/checkout" onClick={toggleCart} className="block w-full">
                                    <Button className="w-full" size="lg">
                                        إتمام الشراء
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
