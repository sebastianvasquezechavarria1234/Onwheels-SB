import React, { useState } from "react";
import { ShoppingCart, X, Check, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import { getProductDetailPath } from "../../../../utils/roleHelpers";

export const Card = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  if (!product) return null;

  const {
    imagen,
    nombre_producto,
    precio_venta,
    variantes
  } = product;

  // Formateador de precios
  const formatPrice = (val) => {
    if (val == null) return "";
    const num = Number(val);
    if (Number.isNaN(num)) return val;
    return `$${new Intl.NumberFormat("es-CO").format(num)}`;
  };

  // Validation helper
  const isValidImage = (url) => {
    if (!url) return false;
    if (url.startsWith('data:image')) return url.length > 30; // Check for actual content
    return true;
  };

  const imgSrc = isValidImage(imagen) ? imagen : "/bg_hero_shop.jpg";
  const productDetailLink = getProductDetailPath(user, product.id_producto);

  // Lógica de variantes
  const uniqueColors = variantes && variantes.length > 0
    ? Array.from(new Map(variantes.map(v => [v.id_color, v])).values())
    : [];

  const availableSizes = selectedColor
    ? variantes.filter(v => v.id_color === selectedColor.id_color)
    : [];

  const selectedVariant = selectedColor && selectedSize
    ? variantes.find(v => v.id_color === selectedColor.id_color && v.id_talla === selectedSize.id_talla)
    : null;

  const maxStock = selectedVariant ? selectedVariant.stock : 0;

  // Manejador de "Añadir al carrito" (Botón de la tarjeta)
  const handleOpenModal = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Strict Auth Check
    if (!user) {
      toast.warning("Debes iniciar sesión para agregar productos al carrito", { login: true, register: true });
      return;
    }

    if (!variantes || variantes.length === 0) {
      toast.error("Este producto no tiene stock disponible");
      return;
    }

    setShowModal(true);
  };

  // Manejador Confirmar en Modal
  const handleConfirmAdd = () => {
    if (!user) {
      setShowModal(false);
      toast.warning("Debes iniciar sesión para agregar productos al carrito", { login: true, register: true });
      return;
    }

    if (!selectedVariant) {
      toast.error("Selecciona color y talla");
      return;
    }

    if (quantity <= 0 || quantity > maxStock) {
      toast.error(`Stock insuficiente. Máx: ${maxStock}`);
      return;
    }

    try {
      addToCart(product, selectedVariant, quantity);

      // RICH SUCCESS TOAST
      toast.custom(
        <div className="p-5 font-primary">
          <div className="flex items-center gap-2 mb-3 text-green-400 text-sm font-medium">
            <Check size={16} /> Artículo agregado a tu carrito
          </div>
          <div className="flex gap-4 mb-4">
            <img src={imgSrc} alt={nombre_producto} className="w-16 h-16 rounded-lg object-cover bg-white" />
            <div>
              <p className="text-white font-bold text-sm line-clamp-2">{nombre_producto}</p>
              <p className="text-gray-400 text-xs mt-1">{selectedColor?.nombre_color} / {selectedVariant?.nombre_talla}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/users/shoppingCart" className="block w-full text-center py-2.5 rounded-full border border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-colors">
              Ver carrito
            </Link>
            <Link to="/users/checkout" className="block w-full text-center py-2.5 rounded-full bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={16} />
              PAGAR AHORA
            </Link>
            <button
              onClick={() => toast.dismiss()} /* Need helper or just let auto-close */
              className="block w-full text-center text-xs text-gray-400 hover:text-white mt-2 underline"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      );

      setShowModal(false);
      // Reset
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {/* Compact Card Design */}
      <div className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 relative">
        <Link to={productDetailLink} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={imgSrc}
            alt={nombre_producto}
          />
          {/* Badge */}
          {variantes?.length > 0 && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm text-gray-800">
              {variantes.length} opciones
            </span>
          )}
        </Link>

        {/* Info Compacta */}
        <div className="p-3">
          <Link to={productDetailLink} className="block mb-1">
            <h4 className="font-primary font-semibold text-gray-800 text-sm leading-tight line-clamp-2 hover:text-blue-600 transition-colors h-[40px]">
              {nombre_producto}
            </h4>
          </Link>

          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-gray-900">{formatPrice(precio_venta)}</span>

            <button
              onClick={handleOpenModal}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-blue-600 transition-colors shadow-md"
              title="Añadir al carrito"
            >
              <ShoppingCart size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Mantenido similar pero integrado con Toast/Context */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 truncate pr-4">{nombre_producto}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              {/* Color */}
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Color</span>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((c) => (
                    <button
                      key={c.id_color}
                      onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor?.id_color === c.id_color ? 'border-blue-600 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: c.codigo_hex || '#000' }}
                      title={c.nombre_color}
                    >
                      {selectedColor?.id_color === c.id_color && <Check size={12} className="text-white invert mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Talla */}
              {selectedColor && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Talla</span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s.id_talla}
                        onClick={() => setSelectedSize(s)}
                        disabled={s.stock === 0}
                        className={`px-3 py-1 text-sm rounded-md border font-medium transition-colors
                                    ${selectedSize?.id_talla === s.id_talla ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}
                                    ${s.stock === 0 ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}
                                `}
                      >
                        {s.nombre_talla}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad/Add */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleConfirmAdd}
                  disabled={!selectedVariant}
                  className="w-full h-11 bg-black text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Añadir — {selectedVariant ? formatPrice(precio_venta * quantity) : formatPrice(precio_venta)}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
