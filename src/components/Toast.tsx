'use client';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastFn = (message: string) => void;

const ToastContext = createContext<ToastFn>(() => { }); //no-op if consumer outside provider

export function ToastProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toast = useCallback((m: string) => {
        setMessage(m);
        if (timer.current) clearTimeout(timer.current); // a new toast cancels the old timer
        timer.current = setTimeout(() => setMessage(null), 2600);
    }, []);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {message && <div className="toast" role="stage">{message}</div>}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);