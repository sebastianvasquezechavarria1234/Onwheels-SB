import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { CreditCard, ShoppingCart, ArrowLeft, Check, AlertTriangle, ShoppingBag, Plus, Minus } from "lucide-react";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import { getStoreHomePath, getCheckoutPath } from "../../../utils/roleHelpers";
import { LoginRequiredModal } from "../components/LoginRequiredModal";

export const ProductDetailsContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const backLink = getStoreHomePath(user) || "/store";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/productos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-[150px] min-h-[60vh] flex items-center justify-center bg-[#0B0F14]">
        <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-[150px] min-h-[60vh] flex flex-col items-center justify-center text-center p-4 bg-[#0B0F14]">
        <AlertTriangle size={48} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Producto no encontrado</h2>
        <Link to={backLink} className="text-[#1E3A8A] hover:underline font-medium">Volver a la tienda</Link>
      </div>
    );
  }

  const API_URL = "http://localhost:3000";

  const {
    nombre_producto,
    descripcion,
    precio,
    descuento,
    imagen_producto,
    imagenes,
    variantes = []
  } = product;

  const getImageUrl = (url) => {
    if (!url) return "/bg_hero_shop.jpg";
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    return `${API_URL}${url}`;
  };

  const validImages = (imagenes || []).filter(img => img && img.url_imagen).map(img => getImageUrl(img.url_imagen));
  const mainImage = validImages.length > 0 ? validImages[0] : getImageUrl(imagen_producto);
  const allImages = validImages.length > 0 ? validImages : [mainImage];

  const formatPrice = (val) => {
    const num = Number(val);
    return isNaN(num) ? val : `$${new Intl.NumberFormat("es-CO").format(num)}`;
  };

  const uniqueColors = [];
  const colorMap = new Map();
  variantes.forEach(v => {
    if (v.id_color && !colorMap.has(v.id_color)) {
      colorMap.set(v.id_color, true);
      uniqueColors.push({ id: v.id_color, name: v.nombre_color, hex: v.color_hex });
    }
  });

  let availableSizes = [];
  if (selectedColor) {
    availableSizes = variantes
      .filter(v => v.id_color === selectedColor.id && v.stock > 0)
      .map(v => ({ id: v.id_talla, name: v.nombre_talla, stock: v.stock, id_variante: v.id_variante }));
  }

  const currentVariant = selectedColor && selectedSize
    ? variantes.find(v => v.id_color === selectedColor.id && v.id_talla === selectedSize.id)
    : null;

  const maxStock = currentVariant ? currentVariant.stock : 0;

  const handleAddToCart = () => {
    if (variantes.length > 0) {
      if (!selectedColor) {
        toast.error("Por favor selecciona un color");
        return;
      }
      if (!selectedSize) {
        toast.error("Por favor selecciona una talla");
        return;
      }
    }

    if (!currentVariant && variantes.length > 0) {
      toast.error("Variante no disponible");
      return;
    }

    try {
      const priceToUse = descuento > 0 ? precio - (precio * descuento / 100) : precio;
      const productToAdd = { ...product, precio_venta: priceToUse, imagen: mainImage };

      addToCart(productToAdd, currentVariant, qty);

      toast.custom(
        <div className="p-5 font-primary bg-[#121821] rounded-xl shadow-2xl border border-gray-800 max-w-sm">
          <div className="flex items-center gap-2 mb-3 text-emerald-500 text-sm font-bold uppercase tracking-wide">
            <Check size={16} strokeWidth={3} /> Artículo agregado
          </div>
          <div className="flex gap-4 mb-4">
            <img src={mainImage} alt={nombre_producto} className="w-16 h-16 rounded-lg object-cover bg-[#0B0F14]" />
            <div>
              <p className="text-white font-bold text-sm line-clamp-2">{nombre_producto}</p>
              <p className="text-[#9CA3AF] text-xs mt-1 font-medium">{selectedColor?.name} / {selectedSize?.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/shoppingCart" className="block w-full text-center py-2.5 rounded-xl border border-gray-700 text-[#9CA3AF] font-bold text-xs hover:border-gray-500 hover:text-white transition-all uppercase tracking-wide">
              Ver carrito
            </Link>
            <button
              onClick={() => {
                toast.dismiss();
                handleBuyNow();
              }}
              className="block w-full text-center py-2.5 rounded-xl bg-[#1E3A8A] text-white font-bold text-xs hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-[#1E3A8A]/20"
            >
              Pagar Ahora
            </button>
          </div>
        </div>
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBuyNow = () => {
    if (!user || Object.keys(user).length === 0 || !localStorage.getItem("token")) {
      toast.error("Debes iniciar sesión para comprar este producto");
      return;
    }

    if (variantes.length > 0 && (!selectedColor || !selectedSize)) {
      toast.error("Selecciona color y talla para comprar");
      return;
    }

    try {
      const priceToUse = descuento > 0 ? precio - (precio * descuento / 100) : precio;
      const productToAdd = { ...product, precio_venta: priceToUse, imagen: mainImage };
      addToCart(productToAdd, currentVariant, qty);

      const checkoutPath = getCheckoutPath(user);
      navigate(checkoutPath);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-[#0B0F14] min-h-screen text-white pb-24">
      <section className="pt-[120px] lg:pt-[140px] max-w-[1200px] mx-auto p-4 md:p-8">

        <Link to={backLink} className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white mb-8 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-[#121821] flex items-center justify-center group-hover:bg-gray-800 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="font-medium text-sm tracking-wide">Volver a la tienda</span>
        </Link>

        <div className="flex flex-col lg:flex-row-reverse gap-10 lg:gap-16">

          {/* Left: Image Gallery (Actually Right physically due to design, but logic is left) */}
          <div className="w-full lg:w-[55%] flex flex-col lg:flex-row-reverse gap-4">
            {/* Main Image */}
            <div className="flex-1 bg-[#121821] rounded-3xl aspect-[4/5] lg:aspect-auto lg:h-[700px] overflow-hidden shadow-sm relative border border-gray-800/50">
              <img
                src={allImages[selectedImageIndex]}
                alt={nombre_producto}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            </div>

            {/* Thumbnails Sidebar / Bottom */}
            {allImages.length > 1 && (
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 custom-scrollbar w-full lg:w-24 shrink-0">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 lg:w-full lg:h-32 rounded-2xl overflow-hidden shrink-0 border border-transparent transition-all ${selectedImageIndex === idx ? 'opacity-100 shadow-xl shadow-[#1E3A8A]/20 ring-2 ring-[#1E3A8A]' : 'opacity-50 hover:opacity-100 hover:border-gray-700'}`}
                  >
                    <img src={img} alt={`${nombre_producto} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center">
            <div className="mb-4">
              <h1 className="font-primary text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                {nombre_producto}
              </h1>
              {descuento > 0 ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="font-primary text-3xl lg:text-4xl text-emerald-400 font-bold tracking-tight">
                      {formatPrice(precio - (precio * descuento / 100))}
                    </p>
                    <span className="bg-[#DC2626] text-white text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">
                      -{descuento}%
                    </span>
                  </div>
                  <p className="font-primary text-lg text-[#9CA3AF] line-through decoration-[#DC2626]/60 decoration-2">
                    {formatPrice(precio)}
                  </p>
                </div>
              ) : (
                <p className="font-primary text-3xl lg:text-4xl text-emerald-400 font-bold tracking-tight">
                  {formatPrice(precio)}
                </p>
              )}
            </div>

            <div className="h-px bg-gray-800/60 w-full my-8"></div>

            <p className="text-[#9CA3AF] leading-relaxed text-[15px] sm:text-base mb-8 font-light tracking-wide">
              {descripcion}
            </p>

            {/* Selectors */}
            {uniqueColors.length > 0 && (
              <div className="mb-8">
                <span className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">Seleccionar Color</span>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedColor(c); setSelectedSize(null); setQty(1); }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ring-offset-4 ring-offset-[#0B0F14] border border-gray-700/50
                                        ${selectedColor?.id === c.id ? 'ring-2 ring-[#1E3A8A] scale-110 shadow-lg shadow-[#1E3A8A]/20' : 'hover:scale-110'}
                                    `}
                      style={{ backgroundColor: c.hex || '#000' }}
                      title={c.name}
                    >
                      {selectedColor?.id === c.id && <Check size={18} className="text-white invert mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueColors.length > 0 && (
              <div className="mb-8 transition-opacity duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Seleccionar Talla</span>
                  {!selectedColor && (
                    <span className="text-xs text-red-400 font-medium">* Elige color primero</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedColor ? (
                    availableSizes.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s)}
                        disabled={s.stock === 0}
                        className={`min-w-[4rem] h-12 px-5 rounded-xl border flex items-center justify-center text-sm font-bold transition-all duration-300
                                            ${selectedSize?.id === s.id
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-lg shadow-[#1E3A8A]/30 scale-105'
                            : 'bg-[#121821] text-[#9CA3AF] border-gray-800 hover:border-gray-500 hover:text-white'}
                                            ${s.stock === 0 ? 'opacity-30 cursor-not-allowed bg-black decoration-slice line-through' : ''}
                                        `}
                      >
                        {s.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-600 text-sm font-medium bg-[#121821] px-4 py-3 rounded-xl border border-gray-800/80">Esperando selección de color...</div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-10">
              <span className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">Cantidad</span>
              <div className="flex items-center gap-5">
                <div className="flex items-center bg-[#0B0F14] rounded-xl p-1 w-fit border border-gray-800 shadow-inner">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-[#121821] hover:text-[#1E3A8A] text-[#9CA3AF] transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-white text-lg">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    disabled={currentVariant && qty >= currentVariant.stock}
                    className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-[#121821] hover:text-[#1E3A8A] text-[#9CA3AF] disabled:opacity-30 disabled:hover:text-[#9CA3AF] transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {currentVariant && (
                  <span className={`text-sm font-medium ${currentVariant.stock < 5 ? 'text-amber-500' : 'text-[#9CA3AF]'}`}>
                    {currentVariant.stock} disponibles
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-[#121821] border border-gray-700 text-white rounded-2xl font-bold text-sm tracking-wide hover:border-gray-500 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                AGREGAR AL CARRITO
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-14 bg-[#DC2626] text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-red-700 hover:shadow-xl hover:shadow-[#DC2626]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                COMPRAR AHORA
              </button>
            </div>

          </div>
        </div>

        <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </section>
    </div>
  );
};

export const ProductDetails = () => {
  return (
    <Layout>
      <ProductDetailsContent />
    </Layout>
  );
};