import React, { useState } from "react";
import { ShoppingCart, X, Check, Eye, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { useToast } from "../../../../context/ToastContext";
import { getProductDetailPath, getCartPath } from "../../../../utils/roleHelpers";
import { LoginRequiredModal } from "../LoginRequiredModal";

export const Card = ({ product }) => {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  // Card might not be inside a Router context if used in a portal? usually it is.
  // useNavigate is safe if Card is child of Router.

  if (!product) return null;

  const API_URL = "http://localhost:3000";

  const {
    nombre_producto,
    precio_venta,
    variantes,
    imagenes
  } = product;

  // Formateador de precios
  const formatPrice = (val) => {
    if (val == null) return "";
    const num = Number(val);
    if (Number.isNaN(num)) return val;
    return `$${new Intl.NumberFormat("es-CO").format(num)}`;
  };

  // Validation helper
  const getImageUrl = (imgObj) => {
    if (!imgObj || !imgObj.url_imagen) return null;
    const url = imgObj.url_imagen;
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    return `${API_URL}${url}`;
  };

  // Multiple images logic
  const validImages = (imagenes || []).filter(img => img && img.url_imagen);
  const imgSrcMain = validImages.length > 0 ? getImageUrl(validImages[0]) : "/bg_hero_shop.jpg";
  const imgSrcHover = validImages.length > 1 ? getImageUrl(validImages[1]) : null;
  const productDetailLink = getProductDetailPath(user, product.id_producto);
  const cartPath = getCartPath(user);

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
              <img src={imgSrcMain} alt={nombre_producto} className="w-full h-full rounded-xl object-cover bg-[#0B0F14] shadow-sm" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-white font-bold text-sm leading-snug line-clamp-2">{nombre_producto}</p>
              <p className="text-zinc-400 text-xs mt-1 font-medium">{selectedColor?.nombre_color} / {selectedVariant?.nombre_talla}</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link to={cartPath} className="block w-full text-center py-2.5 rounded-xl border border-zinc-600 text-zinc-300 font-bold text-xs hover:bg-zinc-800 hover:text-white transition-all uppercase tracking-wide">
              Ver carrito
            </Link>

            {user && (user.id || user.id_usuario) ? (
              <button
                onClick={() => {
                  toast.dismiss();
                  if (!localStorage.getItem("token")) {
                    setShowLoginModal(true);
                  } else {
                    // Redirect to shopping cart for checkout flow
                    window.location.href = cartPath;
                  }
                }}
                className="block w-full text-center py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-white/10"
              >
                <ShoppingBag size={14} />
                Pagar Ahora
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toast.dismiss();
                  window.location.href = cartPath;
                }}
                className="block w-full text-center py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-white/10"
              >
                <ShoppingBag size={14} />
                Ver Carrito
              </button>
            )}
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
    <>
      <div className="group flex flex-col h-full bg-[#121821] rounded-2xl overflow-hidden border border-gray-800/50 hover:border-[#1E3A8A]/50 hover:shadow-xl hover:shadow-[#1E3A8A]/10 hover:-translate-y-1 transition-all duration-300 relative">
        {/* ... existing Card content ... */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#0B0F14]">
          <Link to={productDetailLink}>
            <img
              className="w-full h-full object-cover transition-opacity duration-500"
              src={imgSrcMain}
              alt={nombre_producto}
            />
            {imgSrcHover && (
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                src={imgSrcHover}
                alt={`${nombre_producto} hover`}
              />
            )}
          </Link>

          {/* Selector Overlay - Inline Slide Up */}
          <AnimatePresence>
            {showSelector && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute inset-0 bg-[#0F172A]/95 backdrop-blur-md z-20 flex flex-col p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Opciones</span>
                  <button onClick={toggleSelector} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                  {/* Colors */}
                  <div>
                    <span className="text-xs font-bold text-slate-200 mb-2 block uppercase">1. Color</span>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((c) => (
                        <button
                          key={c.id_color}
                          onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor?.id_color === c.id_color ? 'border-blue-500 scale-110' : 'border-slate-600'}`}
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
                    <span className="text-xs font-bold text-slate-200 mb-2 block uppercase">2. Talla</span>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((s) => (
                        <button
                          key={s.id_talla}
                          onClick={() => setSelectedSize(s)}
                          disabled={s.stock === 0}
                          className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors
                                    ${selectedSize?.id_talla === s.id_talla ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}
                                    ${s.stock === 0 ? 'opacity-40 cursor-not-allowed bg-slate-900' : ''}
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
                <div className="mt-auto pt-3 border-t border-slate-700">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || maxStock === 0}
                    className="w-full h-10 bg-[#DC2626] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 disabled:bg-slate-700 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    {maxStock === 0 && selectedVariant ? 'Agotado' : 'Agregar al carrito'}
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge */}
          {!showSelector && variantes?.length > 0 && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-[#0F172A]/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wide rounded-md shadow-lg text-white border border-slate-700">
              {variantes.length > 1 ? `+${variantes.length}` : '1'} opc
            </span>
          )}
        </div>

        {/* Info Compacta */}
        <div className="p-4 bg-[#121821] flex flex-col flex-1">
          <Link to={productDetailLink} className="block mb-2">
            <h4 className="font-primary font-bold text-white text-lg leading-tight line-clamp-2 hover:text-[#1E3A8A] transition-colors cursor-pointer">
              {nombre_producto}
            </h4>
          </Link>

          {/* Category/Tag placeholder if needed, otherwise just space */}
          {/* <p className="text-xs text-slate-400 font-medium mb-3">Categoria</p> */}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">Precio</span>
              <span className="font-bold text-white text-lg">{formatPrice(precio_venta)}</span>
            </div>

            <button
              onClick={toggleSelector}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg
                ${showSelector ? 'bg-gray-800 text-white rotate-180' : 'bg-[#1E3A8A] text-white hover:bg-blue-800 hover:scale-105 shadow-[#1E3A8A]/20'}`}
              title="Seleccionar opciones"
            >
              {showSelector ? <X size={18} /> : <ShoppingCart size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );

};
