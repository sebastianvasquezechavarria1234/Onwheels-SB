import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", action = null) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, action }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    /**
     * Helper methods
     */
    const toast = {
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
        warning: (msg, action) => addToast(msg, "warning", action),
        info: (msg) => addToast(msg, "info"),
        custom: (content) => addToast(content, "custom"),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
                            min-w-[300px] max-w-[400px] p-4 rounded-xl shadow-2xl flex items-start gap-3 text-sm animate-in slide-in-from-right fade-in duration-300 relative overflow-hidden
                            ${t.type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-800' : ''}
                            ${t.type === 'error' ? 'bg-white border-l-4 border-red-500 text-gray-800' : ''}
                            ${t.type === 'warning' ? 'bg-white border-l-4 border-orange-500 text-gray-800' : ''}
                            ${t.type === 'info' ? 'bg-white border-l-4 border-blue-500 text-gray-800' : ''}
                            ${t.type === 'custom' ? 'bg-[#0f172a] text-white border-0 p-0 rounded-2xl' : ''}
                        `}
                    >
                        {/* Custom Rich Content */}
                        {t.type === 'custom' ? (
                            <div className="w-full">
                                {t.message}
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`
                                    mt-0.5
                                    ${t.type === 'success' ? 'text-green-500' : ''}
                                    ${t.type === 'error' ? 'text-red-500' : ''}
                                    ${t.type === 'warning' ? 'text-orange-500' : ''}
                                    ${t.type === 'info' ? 'text-blue-500' : ''}
                                `}>
                                    {t.type === 'success' && <Check size={18} />}
                                    {t.type === 'error' && <X size={18} />}
                                    {t.type === 'warning' && <AlertTriangle size={18} />}
                                    {t.type === 'info' && <Info size={18} />}
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium leading-relaxed">{t.message}</p>
                                    {t.action && (
                                        <div className="mt-2 flex gap-3">
                                            {t.action.login && (
                                                <Link to="/login" className="text-orange-600 font-bold hover:underline">
                                                    Iniciar Sesión
                                                </Link>
                                            )}
                                            {t.action.register && (
                                                <Link to="/register" className="text-gray-600 font-bold hover:underline">
                                                    Registrarse
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
