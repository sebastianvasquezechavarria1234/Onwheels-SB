import React, { useEffect, useState } from "react";
import { Layout } from "../layout/Layout";
import { ShoppingBag, ArrowRight, LogIn, Trash2 } from "lucide-react";
import CardProduct from "../components/CardProduct";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { LoginRequiredModal } from "../components/LoginRequiredModal";
import { Link, useNavigate } from "react-router-dom";
import { getCheckoutPath as getRoleBasedCheckoutPath } from "../../../utils/roleHelpers";

export const ShoppingCartContent = () => {
    const { cart, clearCart, isLoaded } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Function to get the checkout path based on role
    const getCheckoutPath = () => {
        if (!user || (!user.id && !user.id_usuario && !user.email)) {
            return "/login";
        }
        try {
            return getRoleBasedCheckoutPath(user);
        } catch (error) {
            console.error("Error getting role-based checkout path:", error);
            return "/users/payments";
        }
    };

    const handleCheckoutAction = () => {
        if (!user || (!user.id && !user.id_usuario && !user.email)) {
            setShowLoginModal(true);
            return;
        }
        const checkoutPath = getCheckoutPath();
        navigate(checkoutPath);
    };

    const format = (n) =>
        n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

    if (!isLoaded) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
    );

    return (
        <div className="pt-20 lg:pt-24 bg-white min-h-screen flex flex-col font-primary">
            {/* Hero Section */}
            <section className="bg-gray-100 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Link to="/" className="hover:text-blue-900 transition-colors">Inicio</Link>
                                <span>/</span>
                                <span className="text-blue-950 underline underline-offset-4 decoration-blue-900/20">Carrito</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-blue-950 tracking-tight leading-none">
                                Carrito de Compras
                            </h1>
                            <p className="text-gray-700 font-bold text-[10px] lg:text-xs max-w-md uppercase tracking-wider opacity-70">
                                Revisa tus productos cuidadosamente antes de finalizar tu compra.
                            </p>
                        </div>
                        {cart.items.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-red-600 hover:text-red-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all group border-b border-transparent hover:border-red-600/20 pb-1"
                            >
                                <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                                Vaciar carrito
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full">

                {cart.items.length === 0 ? (
                    <div className="bg-blue-900 border border-gray-100 shadow-xl rounded-[2rem] p-12 text-center flex flex-col items-center max-w-2xl mx-auto transition-all hover:shadow-2xl">
                        <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-full text-gray-300 mb-6 shadow-inner ring-8 ring-gray-50/50">
                            <ShoppingBag size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-black mb-3 font-primary">Tu carrito está vacío</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed font-medium">Parece que aún no has agregado nada a tu carrito. ¡Explora nuestra tienda y encuentra algo increíble!</p>
                        <Link to="/store" className="bg-blue-900 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 tracking-widest uppercase text-xs">
                            Volver a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* Lista de Productos */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex flex-col gap-4">
                                {cart.items.map((item) => (
                                    <CardProduct key={item.id_variante} item={item} />
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="text-xs text-center lg:text-left text-gray-400 font-medium leading-relaxed">
                                    El envío se calcula al momento del checkout.<br />
                                    Todos los precios mostrados incluyen impuestos (IVA).<br />
                                    Compra segura y protegida.
                                </p>
                            </div>
                        </div>

                        {/* Order Summary Section */}
                        <div className="lg:col-span-1 sticky top-24 ">
                            <div className="white border border-gray-100 shadow-2xl rounded-[2rem] p-6 md:p-8 overflow-hidden relative">
                                {/* Decorative element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

                                <h3 className="text-xl font-black text-black mb-8 pb-4 border-b border-gray-50 relative font-primary">Resumen de Orden</h3>

                                <div className="space-y-4 mb-8 relative">
                                    <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-wide">
                                        <span>Items ({cart.itemCount})</span>
                                        <span className="text-black">{format(cart.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 font-bold text-sm uppercase tracking-wide pb-4">
                                        <span>Envío Estimado</span>
                                        <span className="text-green-600">Gratis</span>
                                    </div>

                                    <div className="pt-8 border-t border-gray-100 space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-black text-black text-lg font-primary uppercase tracking-tighter">Total a pagar</span>
                                            <div className="text-right">
                                                <span className="block text-3xl font-black text-blue-900 font-primary leading-none tracking-tight">{format(cart.total)}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2 block">COP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Login Notification for Guests */}
                                {(!user || (!user.id && !user.id_usuario && !user.email)) && (
                                    <div className="bg-blue-50/80 border border-blue-100/50 p-5 rounded-2xl mb-8 relative">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-white p-2.5 rounded-xl text-blue-900 shadow-md flex-shrink-0">
                                                <LogIn size={20} className="animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-blue-900 text-xs mb-1 tracking-tight uppercase">Inicia sesión</h4>
                                                <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                                                    Identifícate para procesar tu pedido de forma rápida y segura.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 relative">
                                    <button
                                        onClick={handleCheckoutAction}
                                        className={`w-full py-5 px-6 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] group ${(!user || (!user.id && !user.id_usuario && !user.email))
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-900 text-white hover:bg-black shadow-xl shadow-blue-900/30"
                                            }`}
                                    >
                                        <span className="text-base tracking-widest uppercase">Finalizar Compra</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <Link to="/store" className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black text-gray-400 hover:text-black transition-all group tracking-[0.2em] uppercase">
                                        <span className="group-hover:-translate-x-1 transition-transform">← Seguir Comprando</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <LoginRequiredModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                />
            </div>
        </div>
    );
};

export const ShoppingCart = () => {
    return (
        <Layout>
            <ShoppingCartContent />
        </Layout>
    );
};