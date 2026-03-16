import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UsersLayout } from "../layout/UsersLayout";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { getHomePath, getStoreHomePath } from "../../../../utils/roleHelpers";

export const UsersOrderConfirm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const orderId = searchParams.get("orderId");
  const orderId = searchParams.get("orderId");

  return (
    <UsersLayout>
      <div className="bg-[#0B0F14] min-h-screen text-white font-primary pb-24 flex items-center">
        <section className="w-full max-w-[700px] mx-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 md:p-12 shadow-2xl text-center relative overflow-hidden"
          >
            {/* Decorative Background Blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

            {/* Icono de éxito */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block mb-8 relative z-10"
            >
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                <CheckCircle size={48} className="text-emerald-400" />
              </div>
            </motion.div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter relative z-10 text-white shadow-sm">
              ¡Compra exitosa!
            </h1>

            <p className="text-[#9CA3AF] mb-10 text-base font-medium relative z-10 max-w-sm mx-auto">
              Tu pedido ha sido procesado y está listo para ser preparado.
            </p>

            {/* Información del pedido */}
            <div className="bg-[#0B0F14] border border-gray-800 rounded-2xl p-6 md:p-8 mb-10 relative z-10 text-left shadow-inner">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                <div className="bg-[#1E3A8A]/20 p-2.5 rounded-xl text-[#3b82f6]">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-wide text-white">Detalles del pedido</h3>
                  {orderId && orderId !== 'success' && (
                    <p className="text-xs text-[#9CA3AF] font-bold mt-1">Orden #{orderId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#121821] p-4 rounded-xl border border-gray-800/50">
                  <span className="text-xs font-bold text-[#9CA3AF] tracking-wider">Estado</span>
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-lg text-xs font-black tracking-wider">Pendiente</span>
                </div>
                <div className="flex justify-between items-center bg-[#121821] p-4 rounded-xl border border-gray-800/50">
                  <span className="text-xs font-bold text-[#9CA3AF] tracking-wider">Método de pago</span>
                  <span className="text-white font-bold text-sm tracking-wide">Contra entrega</span>
                </div>
                <div className="flex justify-between items-center bg-[#121821] p-4 rounded-xl border border-gray-800/50">
                  <span className="text-xs font-bold text-[#9CA3AF] tracking-wider">Tiempo estimado</span>
                  <span className="text-white font-bold text-sm tracking-wide">2-3 días hábiles</span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-[#1E3A8A]/10 border border-[#1E3A8A]/30 rounded-2xl p-6 mb-10 relative z-10 text-left">
              <h4 className="font-black text-[#3b82f6] mb-2 tracking-wide text-sm">📧 Confirmación enviada</h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed font-medium">
                Hemos enviado un correo electrónico con los detalles de tu pedido.
                Recibirás actualizaciones sobre el estado de tu envío muy pronto.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => navigate(getStoreHomePath(user))}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#1E3A8A] text-white rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-[#1E3A8A]/20 font-black tracking-widest text-xs group"
              >
                <ShoppingBag size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                Seguir comprando
              </button>

              <button
                onClick={() => navigate(getHomePath(user))}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#0B0F14] border border-gray-800 text-white rounded-2xl hover:bg-gray-800 hover:border-gray-600 transition-all font-black tracking-widest text-xs group"
              >
                <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                Ir al inicio
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </UsersLayout>
  );
};

export default UsersOrderConfirm;