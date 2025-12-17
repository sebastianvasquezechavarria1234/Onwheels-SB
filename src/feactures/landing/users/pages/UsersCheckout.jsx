import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UsersLayout } from "../layout/UsersLayout";
import { Check, AlertTriangle, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCart, clearCart } from "../../../../services/cartService";
import { createVenta } from "../../../dashboards/admin/pages/services/ventasService";

export const UsersCheckout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    direccion: "",
    telefono: "",
    metodo_pago: "Efectivo",
    instrucciones_entrega: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar carrito
    const cartData = getCart();
    setCart(cartData);

    // Cargar usuario
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        showNotification("Debes iniciar sesión para continuar", "error");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      setUser(userData);

      // Pre-llenar datos si existen
      setForm(prev => ({
        ...prev,
        telefono: userData.telefono || "",
      }));
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      showNotification("Error al cargar datos de usuario", "error");
    } finally {
      setLoading(false);
    }

    // Verificar que hay items en el carrito
    if (cartData.items.length === 0) {
      showNotification("El carrito está vacío", "error");
      setTimeout(() => navigate("/users/shoppingCart"), 2000);
    }
  }, [navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria";
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(form.telefono)) {
      newErrors.telefono = "Formato de teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Por favor completa todos los campos requeridos", "error");
      return;
    }

    if (cart.items.length === 0) {
      showNotification("El carrito está vacío", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Preparar payload según formato de Ventas API
      const payload = {
        id_usuario: user.id_usuario,
        fecha_venta: new Date().toISOString(),
        metodo_pago: form.metodo_pago,
        direccion: form.direccion,
        telefono: form.telefono,
        items: cart.items.map(item => ({
          id_variante: item.id_variante,
          cantidad: item.qty,
        }))
      };

      console.log("📦 Enviando orden:", payload);

      // Crear venta
      const response = await createVenta(payload);

      console.log("✅ Orden creada:", response);

      // Limpiar carrito
      clearCart();

      // Mostrar notificación de éxito
      showNotification("¡Compra realizada exitosamente!", "success");

      // Redirigir a confirmación con el ID de la venta
      setTimeout(() => {
        navigate(`/users/orderConfirm?orderId=${response.id_venta || 'success'}`);
      }, 1500);

    } catch (error) {
      console.error("❌ Error al crear orden:", error);

      let errorMessage = "Error al procesar la compra";

      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <UsersLayout>
        <div className="pt-[120px] max-w-[1500px] mx-auto p-[20px] text-center">
          <p>Cargando...</p>
        </div>
      </UsersLayout>
    );
  }

  return (
    <UsersLayout>
      <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
        <div className="w-[65%] max-lg:w-full">
          <h2 className="mb-[20px] max-md:mb-[20px]">Información de envío y pago</h2>

          <form onSubmit={handleSubmit} className="p-[30px] border-1 border-black/20 rounded-[30px] max-md:p-[10px] max-md:rounded-[20px]">
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
                    value={form.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    className={`input w-full ${errors.direccion ? 'border-red-500' : ''}`}
                    placeholder="Calle 123 #45-67, Medellín, Antioquia"
                    required
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
                  )}
                </label>

                <label className="block">
                  <p className="mb-2 font-medium">Teléfono de contacto *</p>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    className={`input w-full ${errors.telefono ? 'border-red-500' : ''}`}
                    placeholder="+57 300 123 4567"
                    required
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                  )}
                </label>

                <label className="block">
                  <p className="mb-2 font-medium">Instrucciones de entrega (opcional)</p>
                  <textarea
                    value={form.instrucciones_entrega}
                    onChange={(e) => handleInputChange("instrucciones_entrega", e.target.value)}
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
                      onChange={(e) => handleInputChange("metodo_pago", e.target.value)}
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
              disabled={submitting || cart.items.length === 0}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold"
            >
              <Check size={20} />
              {submitting ? "Procesando..." : "Confirmar compra"}
            </button>
          </form>
        </div>

        {/* Resumen del Pedido */}
        <div className="w-[35%] mt-[115px] border-1 rounded-[30px] border-black/20 p-[30px] max-lg:w-full max-md:p-[10px] max-lg:mt-[0px] max-md:rounded-[20px]">
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
