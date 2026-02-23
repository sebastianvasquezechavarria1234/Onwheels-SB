import React from "react";
import ReactDOM from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle2, LogIn } from "lucide-react";

export const LoginRequiredModal = ({ isOpen, onClose }) => {
    // Hooks must be inside the component
    const location = useLocation();

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header / Banner */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                                <UserCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold">¡Inicia Sesión!</h3>
                            <p className="text-blue-100 text-sm mt-1">Para continuar con tu compra</p>
                        </div>

                        {/* Content */}
                        <div className="p-8 pt-6">
                            <p className="text-center text-gray-600 mb-8 leading-relaxed">
                                Para finalizar tu pedido, necesitas tener una cuenta.
                                <br />
                                <strong>Regístrate</strong> o <strong>inicia sesión</strong> para continuar.
                            </p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    state={{ from: location, intent: 'checkout' }}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all transform active:scale-[0.98]"
                                >
                                    <LogIn size={18} />
                                    Iniciar Sesión
                                </Link>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">O</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                <Link
                                    to="/register"
                                    state={{ from: location, intent: 'checkout' }}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 hover:border-gray-300 transition-all transform active:scale-[0.98]"
                                >
                                    Crear Cuenta Nueva
                                </Link>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full mt-6 text-center text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                            >
                                Seguir viendo productos
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
