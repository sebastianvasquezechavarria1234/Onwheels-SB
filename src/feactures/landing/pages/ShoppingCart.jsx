import React, { useEffect, useState } from "react";
import { Layout } from "../layout/Layout";
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { CreditCard, ShoppingBag, ArrowRight, UserCircle2, LogIn } from "lucide-react";
import CardProduct from "../components/CardProduct";
import { useCart } from "../../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export const ShoppingCart = () => {
    const { cart, clearCart, isLoaded } = useCart();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const format = (n) =>
        n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

    const handleCheckout = (e) => {
        if (!user) {
            e.preventDefault();
            setShowLoginModal(true);
        }
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
                            <BtnLinkIcon
                                title={user ? "Continuar Compra" : "Iniciar Sesión para Comprar"}
                                link={user ? "/users/checkout" : "#"}
                                style="bg-[var(--color-blue)]! text-white w-full hover:shadow-lg transition-all"
                                styleIcon="bg-white/20 text-white!"
                            >
                                {user ? <ArrowRight className="text-white" /> : <LogIn className="text-white" />}
                            </BtnLinkIcon>
                        </div>

                        <p className="mt-4 text-xs text-center text-gray-400">
                            Impuestos incluidos. El envío se calcula en el checkout.
                        </p>
                    </div>
                </div>

            </section>

            {/* Guest Login Modal */}
            <AnimatePresence>
                {showLoginModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowLoginModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="text-center mb-8">
                                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-blue)] mb-4">
                                    <ShoppingBag size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">¡Casi listo!</h3>
                                <p className="text-gray-600">
                                    Para completar tu compra, necesitas iniciar sesión o crear una cuenta.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Link
                                    to="/login"
                                    className="flex w-full items-center justify-center gap-2 py-3.5 bg-[var(--color-blue)] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex w-full items-center justify-center gap-2 py-3.5 bg-white text-gray-900 border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Crear Cuenta
                                </Link>
                                <button
                                    onClick={() => setShowLoginModal(false)}
                                    className="w-full py-2 text-gray-400 font-medium text-sm hover:text-gray-600"
                                >
                                    Seguir viendo productos
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </Layout>
    )
}