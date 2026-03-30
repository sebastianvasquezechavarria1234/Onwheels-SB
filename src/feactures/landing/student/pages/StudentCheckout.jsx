import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StudentLayout } from "../layout/StudentLayout";
import { Check, AlertTriangle, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "../../../../hooks/useCheckout";

export const StudentCheckout = () => {
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
        navigate(`/student/orderConfirm?orderId=${result.orderId}`);
      }, 1500);
    } else {
      showNotification(result.message, "error");
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="pt-24 min-h-screen flex items-center justify-center bg-[#0B0F14]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
        </div>
      </StudentLayout>
    );
  }

  if (cart.items.length === 0) {
    return (
      <StudentLayout>
        <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-[#0B0F14] text-white">
          <ShoppingBag size={48} className="text-gray-500 mb-6" />
          <h3 className="text-2xl font-black mb-4">El carrito está vacío</h3>
          <button onClick={() => navigate("/student/shoppingCart")} className="text-[#1E3A8A] hover:underline font-bold">
            Volver al carrito
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-[#0B0F14] min-h-screen text-white font-primary pb-24">
        <section className="pt-[120px] max-w-7xl mx-auto px-4 sm:px-6 flex gap-10 max-lg:flex-col">
          <div className="w-[65%] max-lg:w-full">
            <div className="mb-6">
              <button
                onClick={() => navigate("/student/shoppingCart")}
                className="flex items-center gap-2 text-[#9CA3AF] hover:text-white mb-6 tracking-wider text-xs font-bold transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al carrito
              </button>
              <h2 className="text-3xl font-black text-white tracking-tight">Información de envío y pago</h2>
            </div>

            <form onSubmit={onConfirm} className="p-5 md:p-8 bg-[#121821] border border-gray-800 rounded-[2rem] shadow-xl">
              {/* Información de Envío */}
              <div className="mb-10">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 tracking-wide">
                  📍 Información de Envío
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <label className="block">
                    <p className="mb-2 text-sm font-bold text-[#9CA3AF] tracking-wider">Dirección completa *</p>
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleInputChange}
                      className={`w-full bg-[#0B0F14] border px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all ${errors.direccion ? 'border-red-500' : 'border-gray-800 focus:border-transparent'}`}
                      placeholder="Calle 123 #45-67, Medellín, Antioquia"
                    />
                    {errors.direccion && (
                      <p className="text-red-500 text-xs font-bold mt-2">{errors.direccion}</p>
                    )}
                  </label>

                  <label className="block">
                    <p className="mb-2 text-sm font-bold text-[#9CA3AF] tracking-wider">Teléfono de contacto *</p>
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleInputChange}
                      className={`w-full bg-[#0B0F14] border px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all ${errors.telefono ? 'border-red-500' : 'border-gray-800 focus:border-transparent'}`}
                      placeholder="+57 300 123 4567"
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-xs font-bold mt-2">{errors.telefono}</p>
                    )}
                  </label>

                  <label className="block">
                    <p className="mb-2 text-sm font-bold text-[#9CA3AF] tracking-wider">Instrucciones de entrega (opcional)</p>
                    <textarea
                      name="instrucciones_entrega"
                      value={form.instrucciones_entrega}
                      onChange={handleInputChange}
                      className="w-full bg-[#0B0F14] border border-gray-800 focus:border-transparent px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all"
                      rows={3}
                      placeholder="Ej: Tocar el timbre, dejar con el portero, etc."
                    />
                  </label>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="mb-10">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 tracking-wide">
                  💳 Método de Pago
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Contraentrega", "Transferencia"].map((metodo) => (
                    <label
                      key={metodo}
                      className={`flex items-center justify-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${form.metodo_pago === metodo
                        ? "border-[#1E3A8A] bg-[#1E3A8A]/10 text-white shadow-inner shadow-[#1E3A8A]/20"
                        : "border-gray-800 bg-[#0B0F14] text-[#9CA3AF] hover:border-gray-600 hover:text-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="metodo_pago"
                        value={metodo}
                        checked={form.metodo_pago === metodo}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[#1E3A8A]"
                      />
                      <span className="font-bold text-sm tracking-wide">{metodo}</span>
                    </label>
                  ))}
                </div>


              </div>

              {/* Botón de Confirmar */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#DC2626] text-white rounded-2xl hover:bg-red-700 transition-all font-black tracking-widest text-sm shadow-xl shadow-[#DC2626]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Check size={20} className="group-hover:scale-110 transition-transform" />
                {submitting ? "Procesando..." : `Pagar $${cart.total.toLocaleString()}`}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="w-[35%] lg:mt-16 max-lg:w-full">
            <div className="sticky top-24 bg-[#121821] border border-gray-800 rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E3A8A] rounded-full -mr-16 -mt-16 opacity-10 blur-2xl"></div>

              <h3 className="text-xl font-black text-white mb-6 tracking-tight relative z-10">Resumen del pedido</h3>

              <div className="mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {cart.items.map((item) => (
                  <div key={item.id_variante} className="flex gap-4 mb-4 pb-4 border-b border-gray-800 last:border-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#0B0F14] border border-gray-800 flex-shrink-0 flex items-center justify-center">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag size={24} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-white truncate">{item.nombre_producto}</h4>
                      <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mt-0.5">
                        {item.nombre_color} / {item.nombre_talla}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">x{item.qty}</span>
                        <span className="font-black text-sm text-white">${(item.qty * item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-800 relative z-10">
                <div className="flex justify-between text-sm font-bold text-[#9CA3AF] tracking-wide">
                  <p>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</p>
                  <p className="text-white">${cart.total.toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#9CA3AF] tracking-wide">
                  <p>Envío</p>
                  <p className="text-emerald-400">GRATIS</p>
                </div>
                <div className="flex justify-between items-baseline pt-6 border-t border-gray-800">
                  <p className="font-black text-lg text-white tracking-tighter">Total</p>
                  <div className="text-right">
                    <p className="font-black text-3xl text-emerald-400 leading-none">${cart.total.toLocaleString()}</p>
                    <span className="text-[10px] text-[#9CA3AF] uppercase font-black tracking-widest mt-1 block">COP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

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
    </StudentLayout>
  );
};
