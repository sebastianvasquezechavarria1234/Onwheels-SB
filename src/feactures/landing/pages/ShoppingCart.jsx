import React, { useEffect, useState } from "react";
import { Layout } from "../layout/Layout";
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { CreditCard, ShoppingBag, ArrowRight, UserCircle2, LogIn } from "lucide-react";
import CardProduct from "../components/CardProduct";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext"; // Import useAuth
import { LoginRequiredModal } from "../components/LoginRequiredModal";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getCheckoutPath } from "../../../utils/roleHelpers"; // Import helper

export const ShoppingCart = () => {
    const { cart, clearCart, isLoaded } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth(); // Use useAuth hook
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Removed manual localStorage effect

    const format = (n) =>
        n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

    const handleCheckout = (e) => {
        // Strict check for user existence AND token
        if (!user || Object.keys(user).length === 0 || !localStorage.getItem("token")) {
            e.preventDefault();
            e.stopPropagation();
            setShowLoginModal(true);
            return;
        }

        // Dynamic redirect based on role
        const checkoutPath = getCheckoutPath(user);
        navigate(checkoutPath);
    };

    if (!isLoaded) return null; // Wait for cart to load

    // 1. Empty State (Modified to handle both auth/guest empty)
    if (cart.items.length === 0) {
        return (
            <Layout>
                <section className="pt-[150px] max-w-[1500px] mx-auto p-[20px] min-h-[60vh] flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-6">
                        <ShoppingBag size={64} className="text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-600 mb-8">¡Explora nuestra tienda y encuentra los mejores productos para ti!</p>
                    <Link
                        to="/store"
                        className="px-8 py-3 bg-[var(--color-blue)] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                    >
                        Ir a la Tienda
                    </Link>
                </section>
            </Layout>
        );
    }

    // 3. Cart with Items
    return (
        <Layout>
            <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
                <div className="w-[70%] max-lg:w-full">
                    <div className="flex items-center justify-between mb-[20px]">
                        <h2 className="text-3xl font-bold">Carrito de compras</h2>
                        <button
                            onClick={clearCart}
                            className="text-red-500 hover:text-red-700 text-sm font-medium underline"
                        >
                            Vaciar carrito
                        </button>
                    </div>

                    <article className="p-[30px] border border-gray-200 shadow-sm rounded-[30px] max-md:p-[15px] max-md:rounded-[20px] bg-white">
                        {/* Header  */}
                        <div className="flex border-b border-gray-100 pb-[20px] mb-[20px] text-gray-500 font-medium text-sm">
                            <h4 className="w-[40%] max-lg:w-[50%]">Producto</h4>
                            <h4 className="w-[25%] max-lg:w-[22%]">Cantidad</h4>
                            <h4 className="w-[25%] max-lg:w-[20%]">Total</h4>
                            <h4 className="w-[10%] max-lg:w-[5%] text-right"></h4>
                        </div>

                        <div className="flex flex-col gap-[20px]">
                            {cart.items.map((item) => (
                                <CardProduct key={item.id_variante} item={item} />
                            ))}
                        </div>
                    </article>

                </div>

                {/* Summary Section */}
                <div className="w-[30%] mt-[60px] max-lg:w-full max-lg:mt-0">
                    <div className="sticky top-[120px] border border-gray-200 shadow-sm rounded-[30px] p-[30px] bg-white max-md:p-[20px]">
                        <h3 className="text-xl font-bold mb-6">Resumen de compra</h3>

                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <p>Subtotal</p>
                                <p>{format(cart.total)}</p>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <p>Envío</p>
                                <p className="text-green-600 font-medium">Gratis</p>
                            </div>
                            <div className="border-t border-gray-100 my-2"></div>
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <p>Total</p>
                                <p>{format(cart.total)}</p>
                            </div>
                        </div>

                        <form className="mb-6">
                            <label className="block">
                                <p className="mb-2 text-sm font-medium text-gray-700">Instrucciones especiales (opcional):</p>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                    rows="3"
                                    placeholder="Notas para el envío..."
                                ></textarea>
                            </label>
                        </form>

                        {!user && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-sm text-yellow-800">
                                <UserCircle2 className="shrink-0" size={20} />
                                <p>Inicia sesión para finalizar tu compra y guardar tu historial.</p>
                            </div>
                        )}

                        <div onClick={handleCheckout}>
                            <div onClick={handleCheckout} className="cursor-pointer">
                                <div className="w-full py-3 px-6 bg-[var(--color-blue)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                                    <span>Continuar Compra</span>
                                    <ArrowRight className="bg-white/20 rounded-full p-1" size={24} />
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-center text-gray-400">
                            Impuestos incluidos. El envío se calcula en el checkout.
                        </p>
                    </div>
                </div>

            </section>

            {/* Guest Login Modal */}
            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />

        </Layout>
    )
};