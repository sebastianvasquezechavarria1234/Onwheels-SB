import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsersLayout } from "../layout/UsersLayout";
import { Check, AlertTriangle, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "../../../../hooks/useCheckout";

export const UsersCheckout = () => {
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
      setTimeout(() => {
        // Redirigir usando el ID de la orden retornado por el hook
        navigate(`/users/orderConfirm?orderId=${result.orderId || 'success'}`);
      }, 1500);
    } else {
      showNotification(result.message, "error");
    }
  };

  if (loading) {
    return (
      <UsersLayout>
        <div className="pt-[120px] max-w-[1500px] mx-auto p-[20px] text-center">
          <p>Cargando información...</p>
        </div>
      </UsersLayout>
    );
  }

  if (cart.items.length === 0) {
    return (
      <UsersLayout>
        <div className="pt-[120px] max-w-[1500px] mx-auto p-[20px] text-center">
          <h3 className="mb-4">El carrito está vacío</h3>
          <button onClick={() => navigate("/users/shoppingCart")} className="text-blue-600 underline">
            Volver al carrito
          </button>
        </div>
      </UsersLayout>
    )
  }

  return (
    <UsersLayout>
      <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
        <div className="w-[65%] max-lg:w-full">
          <div className="mb-6">
            <button
              onClick={() => navigate("/users/shoppingCart")}
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
            >
              <ArrowLeft size={20} />
              Volver al carrito
            </button>
            <h2 className="mb-[20px] max-md:mb-[20px]">Información de envío y pago</h2>
          </div>

          <form onSubmit={onConfirm} className="p-[30px] border-1 border-black/20 rounded-[30px] max-md:p-[10px] max-md:rounded-[20px]">
            {/* Información de Envío */}
            <div className="mb-[30px] max-md:mb-[20px]">
              <h3 className="text-lg font-bold mb-[20px] flex items-center gap-2">
                📍 Información de Envío
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <p className="mb-2 font-medium">Dirección completa *</p>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.direccion ? 'border-red-500' : ''}`}
                    placeholder="Calle 123 #45-67, Medellín, Antioquia"
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
                  )}
                </label>

                <label className="block">
                  <p className="mb-2 font-medium">Teléfono de contacto *</p>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleInputChange}
                    className={`input w-full ${errors.telefono ? 'border-red-500' : ''}`}
                    placeholder="+57 300 123 4567"
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                  )}
                </label>

                <label className="block">
                  <p className="mb-2 font-medium">Instrucciones de entrega (opcional)</p>
                  <textarea
                    name="instrucciones_entrega"
                    value={form.instrucciones_entrega}
                    onChange={handleInputChange}
                    className="input w-full"
                    rows={3}
                    placeholder="Ej: Tocar el timbre, dejar con el portero, etc."
                  />
                </label>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="mb-[30px] max-md:mb-[20px]">
              <h3 className="text-lg font-bold mb-[20px] flex items-center gap-2">
                💳 Método de Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Efectivo", "Transferencia", "Tarjeta"].map((metodo) => (
                  <label
                    key={metodo}
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition ${form.metodo_pago === metodo
                      ? "border-[var(--color-blue)] bg-blue-50"
                      : "border-black/20 hover:border-black/40"
                      }`}
                  >
                    <input
                      type="radio"
                      name="metodo_pago"
                      value={metodo}
                      checked={form.metodo_pago === metodo}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{metodo}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Importante
                </h4>
                <p className="text-sm text-blue-800">
                  El pago se realizará contra entrega. Asegúrate de tener el monto exacto si eliges efectivo.
                </p>
              </div>
            </div>

            {/* Botón de Confirmar */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold"
            >
              <Check size={20} />
              {submitting ? "Procesando..." : `Pagar $${cart.total.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Resumen del Pedido */}
        <div className="w-[35%] mt-[85px] border-1 rounded-[30px] border-black/20 p-[30px] max-lg:w-full max-md:p-[10px] max-lg:mt-[0px] max-md:rounded-[20px]">
          <div className="sticky top-[200px] max-lg:top-[0px]">
            <h3 className="text-lg font-bold mb-4">Resumen del pedido</h3>

            <div className="mb-6 max-h-[400px] overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id_variante} className="flex gap-3 mb-4 pb-4 border-b border-black/10 last:border-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.imagen ? (
                      <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.nombre_producto}</h4>
                    <p className="text-xs text-gray-600">
                      {item.nombre_color} / {item.nombre_talla}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">x{item.qty}</span>
                      <span className="font-semibold text-sm">${(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-black/20">
              <div className="flex justify-between text-sm">
                <p>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</p>
                <p>${cart.total.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Envío</p>
                <p className="text-green-600 font-semibold">GRATIS</p>
              </div>
              <div className="flex justify-between pt-3 border-t border-black/20">
                <p className="font-bold text-lg">Total</p>
                <p className="font-bold text-lg text-[var(--color-blue)]">
                  ${cart.total.toLocaleString()}
                </p>
              </div>
            </div>
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
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium z-50 max-w-md ${notification.type === "error" ? "bg-red-600" : "bg-green-600"
              }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </UsersLayout>
  );
};

