import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, AlertTriangle, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "../../../../hooks/useCheckout";

export const AdminCheckout = () => {
    const navigate = useNavigate();
    const {
        cart,
        loading,
        submitting,
        form,
        errors,
        handleInputChange,
        submitOrder
    } = useCheckout();

    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
    };

    const onConfirm = async (e) => {
        e.preventDefault();
        const result = await submitOrder();

        if (result.success) {
            showNotification("¡Compra realizada exitosamente!", "success");
            // Usamos una ruta de confirmación générique si existe, o volvemos al dashboard
            setTimeout(() => {
                navigate("/admin/dashboard"); // O una pagina de confirmacion si Admin la tiene
            }, 1500);
        } else {
            showNotification(result.message, "error");
        }
    };

    if (loading) {
        return (
            <div className="p-[30px] text-center">
                <p>Cargando información...</p>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="p-[30px] text-center">
                <h3 className="mb-4">El carrito está vacío</h3>
                <button onClick={() => navigate("/admin/store")} className="text-blue-600 underline">
                    Volver a la tienda
                </button>
            </div>
        )
    }

    return (
        <section className="relative w-full bg-[var(--gray-bg-body)] side_bar p-[30px]">
            <div className="mb-6">
                <button
                    onClick={() => navigate("/admin/shoppingCart")}
                    className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
                >
                    <ArrowLeft size={20} />
                    Volver al carrito
                </button>
                <h2 className="font-primary">Finalizar Compra</h2>
            </div>

            <div className="flex gap-[30px] max-lg:flex-col">
                {/* Formulario */}
                <div className="w-[65%] max-lg:w-full">
                    <form onSubmit={onConfirm} className="p-[30px] border-1 border-black/20 rounded-[30px] bg-white">
                        <div className="mb-[30px]">
                            <h3 className="text-lg font-bold mb-[20px]">Información de envío</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 font-medium">Dirección de entrega</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={form.direccion}
                                        onChange={handleInputChange}
                                        className={`input w-full p-3 border rounded-lg ${errors.direccion ? 'border-red-500' : ''}`}
                                        placeholder="Calle 123 #45-67"
                                    />
                                    {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">Teléfono de contacto</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={form.telefono}
                                        onChange={handleInputChange}
                                        className={`input w-full p-3 border rounded-lg ${errors.telefono ? 'border-red-500' : ''}`}
                                        placeholder="+57 300 123 4567"
                                    />
                                    {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium">Instrucciones (Opcional)</label>
                                    <textarea
                                        name="instrucciones_entrega"
                                        value={form.instrucciones_entrega}
                                        onChange={handleInputChange}
                                        className="input w-full p-3 border rounded-lg"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-[30px]">
                            <h3 className="text-lg font-bold mb-[20px]">Método de pago</h3>
                            <div className="flex gap-4">
                                {["Efectivo", "Transferencia", "Tarjeta"].map((metodo) => (
                                    <label key={metodo} className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 flex-1">
                                        <input
                                            type="radio"
                                            name="metodo_pago"
                                            value={metodo}
                                            checked={form.metodo_pago === metodo}
                                            onChange={handleInputChange}
                                        />
                                        <span>{metodo}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition font-bold disabled:opacity-50"
                        >
                            {submitting ? "Procesando..." : `Pagar $${cart.total.toLocaleString()}`}
                        </button>
                    </form>
                </div>

                {/* Resumen Lateral */}
                <div className="w-[35%] max-lg:w-full">
                    <div className="p-[30px] border-1 border-black/20 rounded-[30px] bg-white sticky top-[100px]">
                        <h3 className="text-lg font-bold mb-[20px]">Resumen</h3>
                        <div className="space-y-3 mb-6">
                            {cart.items.map(item => (
                                <div key={item.id_variante} className="flex justify-between text-sm">
                                    <span className="truncate w-[60%]">{item.qty}x {item.nombre_producto}</span>
                                    <span>${(item.qty * item.price).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-[var(--color-blue)]">${cart.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

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
