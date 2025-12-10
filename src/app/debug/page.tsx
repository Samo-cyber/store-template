"use client";

import { useState, useEffect } from "react";
import { getFreeShippingSettings } from "@/lib/settings";

export default function DebugPage() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getFreeShippingSettings().then(setSettings);
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Debug Settings</h1>
            <pre className="bg-slate-900 text-white p-4 rounded-xl overflow-auto">
                {JSON.stringify(settings, null, 2)}
            </pre>
            <div className="mt-4">
                <p>Current Time: {new Date().toISOString()}</p>
            </div>
        </div>
    );
}
