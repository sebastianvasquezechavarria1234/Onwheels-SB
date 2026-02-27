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
        <div className="pt-20 lg:pt-24 bg-[#0B0F14] min-h-screen flex flex-col font-primary text-white">
            {/* Hero Section */}
            <section className="bg-[#121821] border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
                                <span>/</span>
                                <span className="text-white underline underline-offset-4 decoration-[#1E3A8A]/50">Carrito</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                                Carrito de Compras
                            </h1>
                            <p className="text-[#9CA3AF] font-bold text-[10px] lg:text-xs max-w-md uppercase tracking-wider opacity-70">
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
                    <div className="bg-[#121821] border border-gray-800 shadow-xl rounded-[2rem] p-12 text-center flex flex-col items-center max-w-2xl mx-auto transition-all hover:shadow-2xl hover:border-gray-700">
                        <div className="w-24 h-24 bg-[#0B0F14] flex items-center justify-center rounded-full text-gray-500 mb-6 shadow-inner ring-8 ring-[#0B0F14]/50">
                            <ShoppingBag size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3 font-primary">Tu carrito está vacío</h2>
                        <p className="text-[#9CA3AF] mb-8 max-w-sm mx-auto leading-relaxed font-medium">Parece que aún no has agregado nada a tu carrito. ¡Explora nuestra tienda y encuentra algo increíble!</p>
                        <Link to="/store" className="bg-[#1E3A8A] text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-xl shadow-[#1E3A8A]/20 active:scale-95 tracking-widest uppercase text-xs">
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

                            <div className="mt-8 p-6 bg-[#121821] rounded-2xl border border-gray-800/50">
                                <p className="text-xs text-center lg:text-left text-[#9CA3AF] font-medium leading-relaxed">
                                    El envío se calcula al momento del checkout.<br />
                                    Todos los precios mostrados incluyen impuestos (IVA).<br />
                                    Compra segura y protegida.
                                </p>
                            </div>
                        </div>

                        {/* Order Summary Section */}
                        <div className="lg:col-span-1 sticky top-24 ">
                            <div className="bg-[#121821] border border-gray-800 shadow-2xl rounded-[2rem] p-6 md:p-8 overflow-hidden relative">
                                {/* Decorative element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E3A8A] rounded-full -mr-16 -mt-16 opacity-10 blur-2xl"></div>

                                <h3 className="text-xl font-black text-white mb-8 pb-4 border-b border-gray-800 relative font-primary">Resumen de Orden</h3>

                                <div className="space-y-4 mb-8 relative">
                                    <div className="flex justify-between text-[#9CA3AF] font-bold text-sm uppercase tracking-wide">
                                        <span>Items ({cart.itemCount})</span>
                                        <span className="text-white">{format(cart.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#9CA3AF] font-bold text-sm uppercase tracking-wide pb-4">
                                        <span>Envío Estimado</span>
                                        <span className="text-emerald-400">Gratis</span>
                                    </div>

                                    <div className="pt-8 border-t border-gray-800 space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-black text-white text-lg font-primary uppercase tracking-tighter">Total a pagar</span>
                                            <div className="text-right">
                                                <span className="block text-3xl font-black text-emerald-400 font-primary leading-none tracking-tight">{format(cart.total)}</span>
                                                <span className="text-[10px] text-[#9CA3AF] uppercase font-black tracking-widest mt-2 block">COP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Login Notification for Guests */}
                                {(!user || (!user.id && !user.id_usuario && !user.email)) && (
                                    <div className="bg-[#0B0F14] border border-gray-800 p-5 rounded-2xl mb-8 relative">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[#121821] p-2.5 rounded-xl text-[#1E3A8A] shadow-md flex-shrink-0">
                                                <LogIn size={20} className="animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-white text-xs mb-1 tracking-tight uppercase">Inicia sesión</h4>
                                                <p className="text-[10px] text-[#9CA3AF] leading-relaxed font-bold">
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
                                            ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                                            : "bg-[#DC2626] text-white hover:bg-red-700 shadow-xl shadow-[#DC2626]/20"
                                            }`}
                                    >
                                        <span className="text-base tracking-widest uppercase">Finalizar Compra</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <Link to="/store" className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black text-[#9CA3AF] hover:text-white transition-all group tracking-[0.2em] uppercase">
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