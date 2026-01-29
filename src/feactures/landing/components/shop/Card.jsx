import React, { useState, useEffect } from "react";
import { ShoppingCart, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart } from "../../../../services/cartService";

export const Card = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [availableVariants, setAvailableVariants] = useState([]);

  if (!product) return null;

  const {
    imagen,
    nombre_producto,
    descripcion,
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

  // Imagen por defecto
  const imgSrc = imagen || "/bg_hero_shop.jpg";

  // Obtener colores únicos
  const uniqueColors = variantes && variantes.length > 0
    ? Array.from(new Map(variantes.map(v => [v.id_color, v])).values())
    : [];

  // Obtener tallas disponibles para el color seleccionado
  const availableSizes = selectedColor
    ? variantes.filter(v => v.id_color === selectedColor.id_color)
    : [];

  // Obtener variante seleccionada
  const selectedVariant = selectedColor && selectedSize
    ? variantes.find(v => v.id_color === selectedColor.id_color && v.id_talla === selectedSize.id_talla)
    : null;

  const maxStock = selectedVariant ? selectedVariant.stock : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variantes || variantes.length === 0) {
      showNotification("Este producto no tiene variantes disponibles", "error");
      return;
    }

    setShowModal(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedVariant) {
      showNotification("Por favor selecciona color y talla", "error");
      return;
    }

    if (quantity <= 0 || quantity > maxStock) {
      showNotification(`Cantidad inválida. Stock disponible: ${maxStock}`, "error");
      return;
    }

    try {
      addToCart(product, selectedVariant, quantity);
      showNotification(`${nombre_producto} agregado al carrito`, "success");
      setShowModal(false);
      // Reset selections
      setSelectedColor(null);
      setSelectedSize(null);
      setQuantity(1);
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  return (
    <>
      <Link to={`/store/product/${product.id_producto}`} className="group">
        <picture className="relative w-full h-[430px] flex rounded-[30px] overflow-hidden max-md:h-[300px]">
          <img
            className="absolute -z-10 w-full h-full object-cover scale-[1.1] group-hover:scale-[1] duration-300 brightness-80 group-hover:brightness-100"
            src={imgSrc}
            alt={nombre_producto || "producto"}
          />
          <h4 className="font-primary absolute top-[10px] left-[10px] bg-white p-[6px_15px] rounded-full text-sm">
            {nombre_producto}
          </h4>

          {/* Gradient Overlay */}
          <div className="absolute bottom-[-40%] group-hover:bottom-[-0%] left-0 gradient-backdrop p-[20px] text-white backdrop-[20px] z-30 duration-300 max-md:p-[15px] max-md:bottom-[-20%] w-full">
            <div className="flex justify-between items-center">
              <div className="w-[70%]">
                <p className="line-clamp-2 text-sm mb-1">{descripcion}</p>
                <p className="text-xs opacity-80">
                  {variantes && variantes.length > 0 ? `${variantes.length} opciones` : "Sin variantes"}
                </p>
              </div>
              <p className="font-primary text-[22px] md:text-[28px]">
                {formatPrice(precio_venta)}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn flex justify-center items-center bg-[var(--color-blue)] gap-[10px] w-full mt-[20px] max-md:mt-[10px] py-2 rounded-lg hover:brightness-110 transition"
            >
              <ShoppingCart size={20} strokeWidth={2} color="currentColor" />
              <span className="text-sm font-medium">Añadir al carrito</span>
            </button>
          </div>
        </picture>
      </Link>

      {/* Modal de Selección de Variantes */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{nombre_producto}</h3>
                  <p className="text-xl text-[var(--color-blue)] font-semibold">{formatPrice(precio_venta)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Selección de Color */}
              <div className="mb-6">
                <p className="font-semibold mb-3">Color:</p>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((colorVariant) => (
                    <button
                      key={colorVariant.id_color}
                      onClick={() => {
                        setSelectedColor(colorVariant);
                        setSelectedSize(null); // Reset size when color changes
                      }}
                      className={`flex items-center gap-2 px-4 py-2 border-2 rounded-full transition ${selectedColor?.id_color === colorVariant.id_color
                          ? "border-[var(--color-blue)] bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: colorVariant.codigo_hex || "#000" }}
                      />
                      <span className="text-sm font-medium">{colorVariant.nombre_color}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selección de Talla */}
              {selectedColor && (
                <div className="mb-6">
                  <p className="font-semibold mb-3">Talla:</p>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((sizeVariant) => (
                      <button
                        key={sizeVariant.id_talla}
                        onClick={() => setSelectedSize(sizeVariant)}
                        disabled={sizeVariant.stock === 0}
                        className={`px-6 py-3 border-2 rounded-full transition font-medium ${selectedSize?.id_talla === sizeVariant.id_talla
                            ? "border-[var(--color-blue)] bg-blue-50"
                            : sizeVariant.stock === 0
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {sizeVariant.nombre_talla}
                        {sizeVariant.stock === 0 && " (Agotado)"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              {selectedVariant && (
                <div className="mb-6">
                  <p className="font-semibold mb-3">Cantidad:</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Stock disponible: {maxStock}</p>
                  </div>
                </div>
              )}

              {/* Botón Agregar */}
              <button
                onClick={handleConfirmAdd}
                disabled={!selectedVariant}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-blue)] text-white rounded-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Check size={20} />
                Agregar al carrito
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium z-[10000] ${notification.type === "error" ? "bg-red-600" : "bg-green-600"
              }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
