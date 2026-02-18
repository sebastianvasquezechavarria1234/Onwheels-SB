import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { CreditCard, ShoppingCart, ArrowLeft, Check, AlertTriangle, ShoppingBag } from "lucide-react";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import { getStoreHomePath } from "../../../utils/roleHelpers";
import { LoginRequiredModal } from "../components/LoginRequiredModal";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null); // id_color (obj)
  const [selectedSize, setSelectedSize] = useState(null);   // id_talla (obj)
  const [qty, setQty] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const backLink = getStoreHomePath(user);

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
      <Layout>
        <div className="pt-[150px] min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-[150px] min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
          <AlertTriangle size={48} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
          <Link to={backLink} className="text-blue-600 hover:underline">Volver a la tienda</Link>
        </div>
      </Layout>
    );
  }

  const {
    nombre_producto,
    descripcion,
    precio, // precio_venta comes as "precio" from controller
    imagen_producto,
    variantes = []
  } = product;

  // Helpers
  const formatPrice = (val) => {
    const num = Number(val);
    return isNaN(num) ? val : `$${new Intl.NumberFormat("es-CO").format(num)}`;
  };

  // Logic: Unique Colors
  const uniqueColors = [];
  const colorMap = new Map();
  variantes.forEach(v => {
    if (v.id_color && !colorMap.has(v.id_color)) {
      colorMap.set(v.id_color, true);
      uniqueColors.push({ id: v.id_color, name: v.nombre_color, hex: v.color_hex });
    }
  });

  // Logic: Available Sizes based on Color
  let availableSizes = [];
  if (selectedColor) {
    availableSizes = variantes
      .filter(v => v.id_color === selectedColor.id && v.stock > 0)
      .map(v => ({ id: v.id_talla, name: v.nombre_talla, stock: v.stock, id_variante: v.id_variante }));
  } else {
    // Show all unique sizes as enabled if no color selected (optional UX choice, strictly speaking usually disabled until color picked)
    // But better UX: Show all unique sizes but visually distinct. 
    // Simplify: User must pick Color first.
  }

  // Get current variant (for stock check)
  const currentVariant = selectedColor && selectedSize
    ? variantes.find(v => v.id_color === selectedColor.id && v.id_talla === selectedSize.id)
    : null;

  const maxStock = currentVariant ? currentVariant.stock : 0;



  // Actions
  const handleAddToCart = () => {
    // ... (existing logic)
    // 2. Validations
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

    // 3. Action
    try {
      // Construct product object compatible with addToCart expectations
      // ProductDetails API returns `precio`, stored items expect `precio_venta`
      // We normalize here
      const productToAdd = { ...product, precio_venta: precio, imagen: imagen_producto };

      addToCart(productToAdd, currentVariant, qty);

      // RICH SUCCESS TOAST
      toast.custom(
        <div className="p-5 font-primary bg-white rounded-xl shadow-2xl border border-gray-100 max-w-sm">
          <div className="flex items-center gap-2 mb-3 text-green-600 text-sm font-bold uppercase tracking-wide">
            <Check size={16} strokeWidth={3} /> Artículo agregado
          </div>
          <div className="flex gap-4 mb-4">
            <img src={imagen_producto || "/bg_hero_shop.jpg"} alt={nombre_producto} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
            <div>
              <p className="text-gray-900 font-bold text-sm line-clamp-2">{nombre_producto}</p>
              <p className="text-gray-500 text-xs mt-1 font-medium">{selectedColor?.name} / {selectedSize?.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/shoppingCart" className="block w-full text-center py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-xs hover:border-gray-900 hover:text-gray-900 transition-all uppercase tracking-wide">
              Ver carrito
            </Link>
            <button
              onClick={() => {
                toast.dismiss();
                handleBuyNow();
              }}
              className="block w-full text-center py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-gray-900/20"
            >
              <ShoppingBag size={14} />
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
    // Strict check for user AND token
    if (!user || Object.keys(user).length === 0 || !localStorage.getItem("token")) {
      setShowLoginModal(true);
      return;
    }

    if (variantes.length > 0 && (!selectedColor || !selectedSize)) {
      toast.error("Selecciona color y talla para comprar");
      return;
    }

    try {
      // Logic for immediate checkout (add to cart then redirect)
      const productToAdd = { ...product, precio_venta: precio, imagen: imagen_producto };
      addToCart(productToAdd, currentVariant, qty);
      import { getStoreHomePath, getCheckoutPath } from "../../../utils/roleHelpers";

      // ... inside handleBuyNow ...

      // Logic for immediate checkout (add to cart then redirect)
      const productToAdd = { ...product, precio_venta: precio, imagen: imagen_producto };
      addToCart(productToAdd, currentVariant, qty);

      const checkoutPath = getCheckoutPath(user);
      navigate(checkoutPath);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Layout>
      <section className="pt-[140px] max-w-[1200px] mx-auto p-4 md:p-8 min-h-[90vh]">
        {/* ... existing content ... */}
        <Link to={backLink} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="font-medium">Volver a la tienda</span>
        </Link>

        {/* ... existing product detail structure ... */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Image */}
          <div className="w-full lg:w-[55%]">
            <div className="bg-gray-50 rounded-[2rem] aspect-[4/5] lg:aspect-square overflow-hidden shadow-sm relative">
              <img
                src={imagen_producto && imagen_producto.length > 30 ? imagen_producto : "/bg_hero_shop.jpg"}
                alt={nombre_producto}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[45%] flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
                Nuevo Ingreso
              </span>
              <h1 className="font-primary text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {nombre_producto}
              </h1>
              <p className="font-primary text-3xl text-gray-900 font-medium">
                {formatPrice(precio)}
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full my-8"></div>

            <p className="text-gray-600 leading-relaxed text-lg mb-8 font-light">
              {descripcion}
            </p>

            {/* Selectors */}
            {uniqueColors.length > 0 && (
              <div className="mb-8">
                <span className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Color</span>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ring-offset-2
                                        ${selectedColor?.id === c.id ? 'ring-2 ring-gray-900 scale-110' : 'hover:scale-110'}
                                    `}
                      style={{ backgroundColor: c.hex || '#000' }}
                      title={c.name}
                    >
                      {selectedColor?.id === c.id && <Check size={16} className="text-white invert mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueColors.length > 0 && (
              <div className="mb-8 opacity-100 transition-opacity">
                <div className="flex justify-between items-center mb-3">
                  <span className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Talla</span>
                  {!selectedColor && (
                    <span className="text-xs text-red-500 font-medium">* Selecciona un color primero</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* If no color selected, we can show placeholder sizes or nothing. Requirement says "Chips well defined" */}
                  {selectedColor ? (
                    availableSizes.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s)}
                        disabled={s.stock === 0}
                        className={`min-w-[3.5rem] h-12 px-4 rounded-xl border flex items-center justify-center text-sm font-medium transition-all
                                            ${selectedSize?.id === s.id
                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}
                                            ${s.stock === 0 ? 'opacity-40 cursor-not-allowed bg-gray-50 decoration-slice' : ''}
                                        `}
                      >
                        {s.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm italic">Opciones disponibles según color...</div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-10">
              <span className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Cantidad</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors text-lg font-medium"
                  >-</button>
                  <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors text-lg font-medium"
                  >+</button>
                </div>
                {currentVariant && <span className="text-sm text-gray-500">{currentVariant.stock} disponibles</span>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold text-lg hover:border-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Agregar
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </section>

      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
};