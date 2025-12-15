import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { CreditCard, ShoppingCart, ArrowLeft } from "lucide-react";

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null); // id_color
  const [selectedSize, setSelectedSize] = useState(null);   // id_talla
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/productos/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Opcional: Auto-seleccionar primera variante si existe
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
        <div className="pt-[150px] text-center min-h-[50vh]">Cargando detalles...</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-[150px] text-center min-h-[50vh]">Producto no encontrado.</div>
      </Layout>
    );
  }

  const {
    nombre_producto,
    descripcion,
    precio, // precio_venta viene como "precio" desde el controller
    imagen_producto,
    variantes = []
  } = product;

  // Formateador dinero
  const formatPrice = (val) => {
    const num = Number(val);
    return isNaN(num) ? val : `$${new Intl.NumberFormat("es-CO").format(num)}`;
  };

  // Lógica de Variantes:
  // 1. Obtener colores únicos disponibles
  const uniqueColors = [];
  const colorMap = new Map();
  variantes.forEach(v => {
    if (v.id_color && !colorMap.has(v.id_color)) {
      colorMap.set(v.id_color, true);
      uniqueColors.push({ 
        id: v.id_color, 
        name: v.nombre_color, 
        hex: v.color_hex 
      });
    }
  });

  // 2. Obtener tallas disponibles para el color seleccionado (si hay color seleccionado)
  //    Si no hay color seleccionado, mostramos todas las tallas únicas o deshabilitadas.
  //    Aquí filtraremos las tallas válidas para el color actual.
  let availableSizes = [];
  if (selectedColor) {
    availableSizes = variantes
      .filter(v => v.id_color === selectedColor && v.stock > 0)
      .map(v => ({ id: v.id_talla, name: v.nombre_talla, stock: v.stock, id_variante: v.id_variante }));
  } else {
    // Si no ha elegido color, podríamos mostrar todas las tallas únicas disponibles en general
    const sizeMap = new Map();
    variantes.forEach(v => {
       if(v.id_talla && !sizeMap.has(v.id_talla) && v.stock > 0) {
         sizeMap.set(v.id_talla, true);
         availableSizes.push({ id: v.id_talla, name: v.nombre_talla, stock: null }); 
       }
    });
  }

  // Manejadores
  const handleColorSelect = (cId) => {
    setSelectedColor(cId);
    setSelectedSize(null); // Reset talla al cambiar color
  };

  const handleSizeSelect = (sId) => {
    setSelectedSize(sId);
  };

  const handleAddToCart = () => {
    if (variantes.length > 0) {
       if (!selectedColor) return alert("Por favor selecciona un color");
       if (!selectedSize) return alert("Por favor selecciona una talla");
    }
    alert(`Añadido al carrito: ${nombre_producto} (Cant: ${qty})`);
    // Aquí iría la lógica real del contexto de carrito
  };

  return (
    <Layout>
      <section className="pt-[120px] max-w-[1200px] mx-auto p-[20px] max-md:p-[10px] flex gap-[40px] max-lg:flex-col min-h-[80vh]">
        
        {/* Gallery / Image */}
        <article className="w-[60%] max-lg:w-full max-lg:pt-[45px]">
          <picture className="w-full h-[500px] block rounded-[30px] overflow-hidden max-lg:h-[90vw] border border-gray-100 shadow-sm relative sticky top-[120px]">
            <Link to="/store" className="absolute top-5 left-5 bg-white/80 p-2 rounded-full hover:bg-white transition z-10">
                <ArrowLeft size={24} />
            </Link>
            <img
              className="w-full h-full object-cover object-center"
              src={imagen_producto || "/bg_hero_shop.jpg"}
              alt={nombre_producto}
            />
          </picture>
        </article>

        {/* Info & Selectors */}
        <article className="w-[40%] max-lg:w-full">
          <div className="flex gap-[20px] items-center mb-[20px]">
            <p className="text-green-700 font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Disponible
            </p>
            <span className="w-[1px] h-[15px] block bg-gray-300"></span>
            <p className="text-gray-500 text-sm">Envío a todo Medellín</p>
          </div>

          <h1 className="font-primary text-4xl mb-2">{nombre_producto}</h1>
          <h2 className="font-primary text-3xl mb-[20px] text-[var(--color-blue)]">
            {formatPrice(precio)}
          </h2>
          
          <p className="mb-[30px] text-gray-600 leading-relaxed">
            {descripcion}
          </p>

          {/* Variants Section */}
          {uniqueColors.length > 0 && (
            <div className="mb-6">
              <p className="font-medium mb-3">Color:</p>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleColorSelect(c.id)}
                    className={`w-[50px] h-[50px] rounded-full border-2 transition-all flex justify-center items-center
                        ${selectedColor === c.id ? "border-blue-600 ring-2 ring-blue-100 scale-110" : "border-gray-200 hover:border-gray-400"}
                    `}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.id && <span className="block w-2 h-2 bg-white rounded-full shadow-md"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(availableSizes.length > 0 || uniqueColors.length === 0) && variantes.length > 0 && (
             <div className="mb-8">
                <p className="font-medium mb-3">Talla {selectedColor ? "" : "(Selecciona un color primero)"}:</p>
                <div className="flex flex-wrap gap-3">
                    {availableSizes.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleSizeSelect(s.id)}
                            disabled={!selectedColor && uniqueColors.length > 0} 
                            className={`min-w-[50px] h-[50px] px-4 rounded-xl border-2 font-medium text-sm transition-all
                                ${selectedSize === s.id 
                                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"}
                                ${(!selectedColor && uniqueColors.length > 0) ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
             </div>
          )}

          {/* Quantity */}
          <div className="mb-8 flex items-center gap-5">
             <div className="flex items-center border border-gray-300 rounded-full h-[50px]">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-[50px] h-full hover:bg-gray-100 rounded-l-full font-bold text-xl">-</button>
                <span className="w-[50px] text-center font-medium text-lg">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-[50px] h-full hover:bg-gray-100 rounded-r-full font-bold text-xl">+</button>
             </div>
             {/* Stock Info could go here if selectedSize is set */}
          </div>

          <div className="flex flex-col gap-[15px]">
            <button 
                onClick={handleAddToCart}
                className="btn bg-[var(--color-blue)] text-white flex items-center justify-center gap-[10px] h-[55px] rounded-xl hover:brightness-110 transition shadow-lg shadow-blue-500/30"
            >
              <ShoppingCart size={22} />
              Añadir al carrito
            </button>
            <button className="btn bg-gray-900 text-white flex justify-center gap-[10px] items-center h-[55px] rounded-xl hover:bg-black transition">
              <CreditCard size={22} />
              Comprar ahora
            </button>
          </div>

        </article>
      </section>
    </Layout>
  );
};