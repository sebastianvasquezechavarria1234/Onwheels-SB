import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../../context/CartContext";

export default function CardProduct({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  if (!item) return null;

  const {
    id_variante,
    nombre_producto,
    nombre_color,
    nombre_talla,
    qty,
    price,
    imagen
  } = item;

  const total = price * qty;
  const maxStock = item.stock || 999;

  const format = (n) =>
    n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  return (
    <article className="flex items-center w-full border-b border-gray-100 pb-4 last:border-0">
      <div className="flex w-[40%] gap-[20px] items-center max-md:gap-[10px] max-lg:w-[50%]!">
        <picture className="rounded-[20px] w-[100px] h-[100px] block overflow-hidden max-lg:w-[50px] max-lg:h-[50px] max-md:rounded-[10px] bg-gray-100 flex-shrink-0">
          {imagen ? (
            <img className="w-full h-full object-cover" src={imagen} alt="bg products" />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
        </picture>
        <div className="flex flex-col min-w-0">
          <h4 className="font-primary font-bold text-gray-800 truncate pr-4">{nombre_producto}</h4>
          <p className="text-sm text-gray-500">
            {nombre_color} / {nombre_talla}
          </p>
          <p className="text-sm font-semibold text-[var(--color-blue)] md:hidden">
            {format(price)}
          </p>
        </div>
      </div>

      {/* Cantidad */}
      <div className="w-[25%] max-lg:w-[22%]">
        <div className="inline-flex items-center border border-gray-200 p-1 rounded-full gap-2 bg-white">
          <button
            onClick={() => updateQuantity(id_variante, qty - 1)}
            aria-label="Restar cantidad"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 duration-200 disabled:opacity-50"
            disabled={qty <= 1}
          >
            <Minus size={16} />
          </button>

          <span className="w-8 text-center font-medium text-sm">{qty}</span>

          <button
            onClick={() => updateQuantity(id_variante, qty + 1)}
            aria-label="Sumar cantidad"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 duration-200 disabled:opacity-50"
            disabled={qty >= maxStock}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="w-[25%] max-lg:w-[20%]">
        <h3 className="font-bold text-lg text-gray-800 max-lg:text-[14px]">{format(total)}</h3>
      </div>

      {/* Acciones */}
      <div className="w-[10%] max-lg:w-[5%] flex justify-end">
        <button
          onClick={() => removeFromCart(id_variante)}
          className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
        >
          <Trash2 size={18} strokeWidth={2} />
        </button>
      </div>
      
    </article>
    
  );
}
