import React, { useState } from "react";
import { ShoppingCart, X, Check, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import { getProductDetailPath } from "../../../../utils/roleHelpers";

export const Card = ({ product }) => {
  const [showSelector, setShowSelector] = useState(false);
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

  // Toggle Selector
  const toggleSelector = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Si ya está abierto, cerrarlo
    if (showSelector) {
      setShowSelector(false);
      resetSelection();
      return;
    }

    if (!variantes || variantes.length === 0) {
      toast.error("Este producto no tiene stock disponible");
      return;
    }

    setShowSelector(true);
  };

  const resetSelection = () => {
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  };

  // Add to Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant) {
      toast.error("Selecciona color y talla");
      return;
    }

    if (maxStock <= 0) {
      toast.error("Sin stock disponible");
      return;
    }

    try {
      addToCart(product, selectedVariant, 1);

      // RICH SUCCESS TOAST - Enhanced Visibility
      toast.custom(
        <div className="p-6 font-primary bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-4 text-emerald-400 text-base font-bold">
            <div className="bg-emerald-500/20 p-1.5 rounded-full">
              <Check size={18} />
            </div>
            ¡Agregado al carrito!
          </div>
          <div className="flex gap-5 mb-6">
            <div className="relative w-16 h-16 shrink-0">
              <img src={imgSrc} alt={nombre_producto} className="w-full h-full rounded-xl object-cover bg-white shadow-sm" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-white font-bold text-sm leading-snug line-clamp-2">{nombre_producto}</p>
              <p className="text-zinc-400 text-xs mt-1 font-medium">{selectedColor?.nombre_color} / {selectedVariant?.nombre_talla}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link to={user ? "/users/shoppingCart" : "/shoppingCart"} className="block w-full text-center py-2.5 rounded-xl border border-zinc-600 text-zinc-300 font-bold text-xs hover:bg-zinc-800 hover:text-white transition-all uppercase tracking-wide">
              Ver carrito
            </Link>
            <Link to={user ? "/users/checkout" : "/shoppingCart"} className="block w-full text-center py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-white/10">
              <ShoppingBag size={14} />
              {user ? "Pagar Ahora" : "Ir a Pagar"}
            </Link>
          </div>
        </div>
      );

      setShowSelector(false);
      resetSelection();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <Link to={productDetailLink}>
          <img
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            src={imgSrc}
            alt={nombre_producto}
          />
        </Link>

        {/* Selector Overlay - Inline Slide Up */}
        <AnimatePresence>
          {showSelector && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Opciones</span>
                <button onClick={toggleSelector} className="text-gray-400 hover:text-black p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {/* Colors */}
                <div>
                  <span className="text-xs font-bold text-gray-900 mb-2 block uppercase">1. Color</span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((c) => (
                      <button
                        key={c.id_color}
                        onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor?.id_color === c.id_color ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                        style={{ backgroundColor: c.color_hex || c.codigo_hex || '#000' }}
                        title={c.nombre_color}
                      >
                        {selectedColor?.id_color === c.id_color && <Check size={12} className="text-white invert mix-blend-difference" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className={`transition-opacity duration-300 ${!selectedColor ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <span className="text-xs font-bold text-gray-900 mb-2 block uppercase">2. Talla</span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s.id_talla}
                        onClick={() => setSelectedSize(s)}
                        disabled={s.stock === 0}
                        className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors
                                    ${selectedSize?.id_talla === s.id_talla ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}
                                    ${s.stock === 0 ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}
                                `}
                      >
                        {s.nombre_talla}
                      </button>
                    ))}
                    {availableSizes.length === 0 && selectedColor && <p className="text-xs text-red-500 font-medium">Sin stock</p>}
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <div className="mt-auto pt-3 border-t border-gray-100">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || maxStock === 0}
                  className="w-full h-10 bg-black text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {maxStock === 0 && selectedVariant ? 'Agotado' : 'Agregar'}
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {!showSelector && variantes?.length > 0 && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm text-gray-800 border border-gray-100">
            {variantes.length > 1 ? `+${variantes.length}` : '1'} opc
          </span>
        )}
      </div>

      {/* Info Compacta */}
      <div className="p-3">
        <Link to={productDetailLink} className="block mb-1">
          <h4 className="font-primary font-black text-gray-950 text-xl leading-none tracking-tight line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
            {nombre_producto}
          </h4>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gray-900 text-lg">{formatPrice(precio_venta)}</span>

          <button
            onClick={toggleSelector}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm
                ${showSelector ? 'bg-gray-900 text-white rotate-180' : 'bg-black text-white hover:bg-gray-800'}`}
            title="Seleccionar opciones"
          >
            {showSelector ? <X size={16} /> : <ShoppingCart size={16} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
};
