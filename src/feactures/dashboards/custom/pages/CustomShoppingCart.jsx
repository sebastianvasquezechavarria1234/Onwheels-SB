import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../../context/CartContext";

export const CustomShoppingCart = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity } = useCart();
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleUpdateQuantity = (id_variante, newQty) => {
        try {
            updateQuantity(id_variante, newQty);
        } catch (error) {
            showNotification(error.message, "error");
        }
    };

    const handleRemoveItem = (id_variante, nombre) => {
        try {
            removeFromCart(id_variante);
            showNotification(`${nombre} eliminado del carrito`, "success");
        } catch (error) {
            showNotification(error.message, "error");
        }
    };

    const handleCheckout = () => {
        if (cart.items.length === 0) {
            showNotification("El carrito está vacío", "error");
            return;
        }
        navigate("/custom/checkout");
    };

    return (
        <section className="relative w-full bg-[var(--gray-bg-body)] p-[30px] min-h-screen">
            <h2 className="font-primary mb-[30px]">Carrito de compras</h2>

            {cart.items.length === 0 ? (
                <div className="p-[60px] border-1 border-black/20 rounded-[30px] text-center bg-white">
                    <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2">Tu carrito está vacío</h3>
                    <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                    <button
                        onClick={() => navigate("/custom/store")}
                        className="px-6 py-3 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition"
                    >
                        Ir a la tienda
                    </button>
                </div>
            ) : (
                <div className="flex gap-[30px] max-lg:flex-col">
                    <div className="flex-1">
                        <article className="p-[30px] border-1 border-black/20 rounded-[30px] bg-white">
                            <div className="flex border-b border-black/20 pb-[20px] mb-[20px] font-semibold">
                                <div className="w-[45%]">Producto</div>
                                <div className="w-[20%]">Cantidad</div>
                                <div className="w-[20%]">Total</div>
                                <div className="w-[15%] text-center">Acciones</div>
                            </div>

                            <div className="flex flex-col gap-[20px]">
                                <AnimatePresence>
                                    {cart.items.map((item) => (
                                        <motion.div
                                            key={item.id_variante}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex items-center gap-[20px] pb-[20px] border-b border-black/10 last:border-0"
                                        >
                                            <div className="w-[45%] flex items-center gap-[15px]">
                                                <div className="w-[80px] h-[80px] rounded-[15px] overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {item.imagen ? (
                                                        <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <ShoppingBag size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold truncate">{item.nombre_producto}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-black/20"
                                                            style={{ backgroundColor: item.codigo_hex }}
                                                            title={item.nombre_color}
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            {item.nombre_color} / {item.nombre_talla}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">${item.price.toLocaleString()} c/u</p>
                                                </div>
                                            </div>

                                            <div className="w-[20%]">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 w-fit">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id_variante, item.qty - 1)}
                                                        disabled={item.qty <= 1}
                                                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id_variante, item.qty + 1)}
                                                        disabled={item.qty >= item.stockMax}
                                                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Stock: {item.stockMax}</p>
                                            </div>

                                            <div className="w-[20%]">
                                                <p className="font-bold">${(item.qty * item.price).toLocaleString()}</p>
                                            </div>

                                            <div className="w-[15%] text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id_variante, item.nombre_producto)}
                                                    className="p-2 rounded-full hover:bg-red-50 text-red-600 transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </article>
                    </div>

                    <div className="w-[350px] max-lg:w-full">
                        <div className="sticky top-[100px] border-1 rounded-[30px] border-black/20 p-[30px] bg-white">
                            <h3 className="text-lg font-bold mb-4">Resumen del pedido</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Subtotal</span>
                                    <span>${cart.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Productos ({cart.itemCount})</span>
                                    <span>{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-black/20">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-lg text-[var(--color-blue)]">
                                        ${cart.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.items.length === 0}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold mb-3"
                            >
                                <CreditCard size={20} />
                                <span>Proceder al pago</span>
                            </button>

                            <button
                                onClick={() => navigate("/custom/store")}
                                className="w-full px-6 py-3 border-2 border-black/20 rounded-full hover:bg-gray-50 transition"
                            >
                                Continuar comprando
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium z-50 ${notification.type === "error" ? "bg-red-600" : "bg-green-600"
                            }`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
