"use client";

import { useState } from "react";
import { X, Smartphone, Monitor, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

interface LivePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
}

export function LivePreviewModal({ isOpen, onClose, url }: LivePreviewModalProps) {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full h-full flex flex-col">
                {/* Toolbar */}
                <div className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white font-medium">معاينة المتجر</h2>
                        <div className="flex items-center bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Monitor className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Smartphone className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2 border-white/20 text-white hover:bg-white/10">
                                <ExternalLink className="w-4 h-4" />
                                فتح في نافذة جديدة
                            </Button>
                        </a>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-slate-950 flex items-center justify-center p-8 overflow-hidden">
                    <div
                        className={`transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden ${viewMode === 'mobile'
                                ? 'w-[375px] h-[812px] rounded-[3rem] border-8 border-slate-800'
                                : 'w-full h-full rounded-lg border border-slate-800'
                            }`}
                    >
                        <iframe
                            src={url}
                            className="w-full h-full"
                            title="Store Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
