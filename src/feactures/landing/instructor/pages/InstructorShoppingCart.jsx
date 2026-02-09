import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InstructorLayout } from "../layout/InstructorLayout";
import { CreditCard, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCart, updateQuantity, removeFromCart } from "../../../../services/cartService";

export const UsersShoppingCart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    // Cargar carrito
    useEffect(() => {
        loadCart();

        // Escuchar cambios en el carrito
        const handleCartUpdate = () => loadCart();
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const loadCart = () => {
        try {
            const cartData = getCart();
            setCart(cartData);
        } catch (error) {
            showNotification("Error al cargar el carrito", "error");
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleUpdateQuantity = (id_variante, newQty) => {
        try {
            updateQuantity(id_variante, newQty);
            showNotification("Cantidad actualizada", "success");
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
        navigate("/users/checkout");
    };

    if (loading) {
        return (
            <InstructorLayout>
                <div className="pt-[120px] max-w-[1500px] mx-auto p-[20px] text-center">
                    <p>Cargando carrito...</p>
                </div>
            </InstructorLayout>
        );
    }

    return (
        <InstructorLayout>
            <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
                <div className="w-[75%] max-lg:w-full">
                    <h2 className="mb-[20px] max-md:mb-[20px]">Carrito de compras</h2>

                    {cart.items.length === 0 ? (
                        <div className="p-[60px] border-1 border-black/20 rounded-[30px] text-center">
                            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
                            <h3 className="mb-2">Tu carrito está vacío</h3>
                            <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                            <button
                                onClick={() => navigate("/users/store")}
                                className="px-6 py-3 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition"
                            >
                                Ir a la tienda
                            </button>
                        </div>
                    ) : (
                        <article className="p-[30px] border-1 border-black/20 rounded-[30px] max-md:p-[10px] max-md:rounded-[20px]">
                            {/* Header */}
                            <div className="flex border-b border-black/20 pb-[30px] max-md:pb-[10px]">
                                <h4 className="w-[45%] max-md:text-[11px] max-md:w-[50%]">Producto</h4>
                                <h4 className="w-[20%] max-md:text-[11px] max-md:w-[20%]">Cantidad</h4>
                                <h4 className="w-[20%] max-md:text-[11px] max-md:w-[15%]">Total</h4>
                                <h4 className="w-[15%] max-md:text-[11px] max-md:w-[15%] text-center">Acciones</h4>
                            </div>

                            {/* Items */}
                            <div className="flex flex-col gap-[20px] pt-[30px] max-md:pt-[10px]">
                                <AnimatePresence>
                                    {cart.items.map((item) => (
                                        <motion.div
                                            key={item.id_variante}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex items-center gap-[20px] pb-[20px] border-b border-black/10 last:border-0"
                                        >
                                            {/* Producto Info */}
                                            <div className="w-[45%] flex items-center gap-[15px] max-md:w-[50%]">
                                                <div className="w-[80px] h-[80px] rounded-[15px] overflow-hidden bg-gray-100 flex-shrink-0 max-md:w-[50px] max-md:h-[50px]">
                                                    {item.imagen ? (
                                                        <img
                                                            src={item.imagen}
                                                            alt={item.nombre_producto}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <ShoppingBag size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold truncate max-md:text-[12px]">{item.nombre_producto}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-black/20"
                                                            style={{ backgroundColor: item.codigo_hex }}
                                                            title={item.nombre_color}
                                                        />
                                                        <span className="text-sm text-gray-600 max-md:text-[10px]">
                                                            {item.nombre_color} / {item.nombre_talla}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 max-md:text-[10px]">
                                                        ${item.price.toLocaleString()} c/u
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Cantidad */}
                                            <div className="w-[20%] max-md:w-[20%]">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 w-fit">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id_variante, item.qty - 1)}
                                                        disabled={item.qty <= 1}
                                                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed max-md:w-6 max-md:h-6"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold max-md:text-[12px]">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id_variante, item.qty + 1)}
                                                        disabled={item.qty >= item.stockMax}
                                                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed max-md:w-6 max-md:h-6"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 max-md:text-[9px]">
                                                    Stock: {item.stockMax}
                                                </p>
                                            </div>

                                            {/* Total */}
                                            <div className="w-[20%] max-md:w-[15%]">
                                                <p className="font-bold max-md:text-[12px]">
                                                    ${(item.qty * item.price).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Acciones */}
                                            <div className="w-[15%] max-md:w-[15%] text-center">
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
                    )}
                </div>

                {/* Resumen */}
                <div className="w-[25%] mt-[115px] border-1 rounded-[30px] border-black/20 p-[30px] max-lg:w-full max-md:p-[10px] max-lg:pl-0 max-lg:mt-[0px] max-md:rounded-[20px]">
                    <div className="sticky top-[200px] max-lg:top-[0px]">
                        <h3 className="text-lg font-bold mb-4">Resumen del pedido</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <p className="font-semibold">Subtotal</p>
                                <p>${cart.total.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Productos ({cart.itemCount})</p>
                                <p>{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</p>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-black/20">
                                <p className="font-bold text-lg">Total</p>
                                <p className="font-bold text-lg text-[var(--color-blue)]">
                                    ${cart.total.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.items.length === 0}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            <CreditCard size={20} />
                            <span className="font-semibold">Proceder al pago</span>
                        </button>

                        <button
                            onClick={() => navigate("/users/store")}
                            className="w-full mt-3 px-6 py-3 border-2 border-black/20 rounded-full hover:bg-gray-50 transition"
                        >
                            Continuar comprando
                        </button>
                    </div>
                </div>
            </section>

            {/* Notificación */}
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
        </InstructorLayout>
    );
};