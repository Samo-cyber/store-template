"use client";

import { useEffect } from "react";

export function NoImageDownload() {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName === 'IMG') {
                e.preventDefault();
            }
        };

        const handleDragStart = (e: DragEvent) => {
            if ((e.target as HTMLElement).tagName === 'IMG') {
                e.preventDefault();
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('dragstart', handleDragStart);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    return null;
}
