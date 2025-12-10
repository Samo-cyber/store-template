"use client";

import { Button } from "@/components/ui/Button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export function QuantitySelector({ quantity, onIncrease, onDecrease }: QuantitySelectorProps) {
    return (
        <div className="flex items-center border rounded-md w-fit">
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={onDecrease}
                disabled={quantity <= 1}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <div className="w-12 text-center font-medium">{quantity}</div>
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none"
                onClick={onIncrease}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
