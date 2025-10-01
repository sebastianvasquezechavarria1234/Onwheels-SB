import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Card - componente que consume /getProductos y muestra el primer producto.
 * Campos usados: imagen_producto, nombre_producto, descripcion, precio
 */
export const Card = () => {
  const [product, setProduct] = useState(null); // objeto producto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:3000/getProductos", {
          method: "GET",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Error al consultar la API");

        const data = await res.json();

        // Asumimos que la API devuelve un array de productos.
        // Si devuelve un objeto, ajusta según corresponda.
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setProduct(null);
        } else if (Array.isArray(data)) {
          setProduct(data[0]); // usamos el primer producto
        } else {
          setProduct(data); // por si la API devuelve un objeto único
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("No se pudo obtener los productos.");
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, []);

  // Helper para formatear precio (Colombia)
  const formatPrice = (val) => {
    if (val == null) return "";
    const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : Number(val);
    if (Number.isNaN(num)) return val;
    return `$${new Intl.NumberFormat("es-CO").format(num)}`;
  };

  // Estados de UI
  if (loading) {
    return (
      <div className="p-6 rounded-[12px] bg-white/5 text-center">
        Cargando producto...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-[12px] bg-red-100 text-red-700 text-center">
        {error} — No hay productos.
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 rounded-[12px] bg-gray-50 text-center">
        No hay productos
      </div>
    );
  }

  // Campos que usaremos del producto (según tu imagen / SQL)
  const {
    imagen_producto,
    nombre_producto,
    descripcion,
    precio, // si tu API usa "precio" (ver imagen)
  } = product;

  // Si imagen_producto es una ruta relativa que viene sin host, puedes
  // prefijar el host si es necesario (ej: http://localhost:3000/uploads/...)
  const imgSrc = imagen_producto || "/bg_hero_shop.jpg";

  return (
    <Link to="" className="group">
      <picture className="relative w-full h-[430px] flex rounded-[30px] overflow-hidden max-md:h-[300px]">
        <img
          className="absolute -z-10 w-full h-full object-cover scale-[1.1] group-hover:scale-[1] duration-300 brightness-80 group-hover:brightness-100"
          src={imgSrc}
          alt={nombre_producto || "producto"}
        />
        <h4 className="font-primary absolute top-[10px] left-[10px] bg-white p-[6px_15px] rounded-full">
          {nombre_producto}
        </h4>

        {/* Gradient */}
        <div className="absolute bottom-[-40%] group-hover:bottom-[-0%] left-0 gradient-backdrop p-[20px] text-white backdrop-[20px] z-30 duration-300 max-md:p-[15px] max-md:bottom-[-20%]">
          <div className="flex justify-between items-center">
            <p className="line-clamp-2 w-[70%]">
              {descripcion}
            </p>
            <p className="font-primary text-[35px]">
              {formatPrice(precio)}
            </p>
          </div>

          <button className="btn flex justify-center items-center bg-[var(--color-blue)] gap-[10px] w-full mt-[20px] max-md:mt-[0px]">
            <ShoppingCart size={20} strokeWidth={2} color="currentColor" />
            Añadir al carrito de compras
          </button>
        </div>
      </picture>
    </Link>
  );
};
