import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StudentLayout } from "../layout/StudentLayout";
import { CheckCircle, Package, Home, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export const StudentOrderConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown para redirección automática
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <StudentLayout>
      <section className="pt-[120px] max-w-[800px] mx-auto p-[20px] max-md:p-[10px] max-md:pt-[80px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Icono de éxito */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </motion.div>

          {/* Título */}
          <h1 className="text-3xl font-bold mb-4 max-md:text-2xl">
            ¡Compra realizada exitosamente!
          </h1>

          <p className="text-gray-600 mb-8 text-lg">
            Tu pedido ha sido procesado correctamente
          </p>

          {/* Información del pedido */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8 max-md:p-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package size={24} className="text-[var(--color-blue)]" />
              <h3 className="text-xl font-semibold">Detalles del pedido</h3>
            </div>

            {orderId && orderId !== 'success' && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Número de pedido</p>
                <p className="text-2xl font-bold text-[var(--color-blue)]">#{orderId}</p>
              </div>
            )}

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Estado</span>
                <span className="font-semibold text-orange-600">Pendiente</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Método de pago</span>
                <span className="font-semibold">Contra entrega</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tiempo estimado</span>
                <span className="font-semibold">2-3 días hábiles</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 max-md:p-4">
            <h4 className="font-bold text-blue-900 mb-3">📧 Confirmación enviada</h4>
            <p className="text-sm text-blue-800">
              Hemos enviado un correo electrónico con los detalles de tu pedido.
              Recibirás actualizaciones sobre el estado de tu envío.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 justify-center max-md:flex-col">
            <button
              onClick={() => navigate("/student/store")}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition shadow-lg font-semibold"
            >
              <ShoppingBag size={20} />
              Continuar comprando
            </button>

            <button
              onClick={() => navigate("/student/home")}
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-black/20 rounded-full hover:bg-gray-50 transition font-semibold"
            >
              <Home size={20} />
              Ir al inicio
            </button>
          </div>

          {/* Mensaje de redirección */}
          {countdown > 0 && (
            <p className="text-sm text-gray-500 mt-6">
              Serás redirigido a la tienda en {countdown} segundos...
            </p>
          )}
          {countdown === 0 && navigate("/student/store")}
        </motion.div>
      </section>
    </StudentLayout>
  );
};

export default StudentOrderConfirm;