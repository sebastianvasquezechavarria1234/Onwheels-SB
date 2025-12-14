import React from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";


export const Card = ({ product }) => {
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

  // Resumen de variantes (Total colores/tallas)
  const variantSummary = variantes && variantes.length > 0 
    ? `${variantes.length} opciones disponibles`
    : "Sin variantes";

  return (
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
               <p className="text-xs opacity-80">{variantSummary}</p>
            </div>
            <p className="font-primary text-[22px] md:text-[28px]">
              {formatPrice(precio_venta)}
            </p>
          </div>

          <button className="btn flex justify-center items-center bg-[var(--color-blue)] gap-[10px] w-full mt-[20px] max-md:mt-[10px] py-2 rounded-lg hover:brightness-110 transition">
            <ShoppingCart size={20} strokeWidth={2} color="currentColor" />
            <span className="text-sm font-medium">Añadir al carrito</span>
          </button>
        </div>
      </picture>
    </Link>
  );
};
