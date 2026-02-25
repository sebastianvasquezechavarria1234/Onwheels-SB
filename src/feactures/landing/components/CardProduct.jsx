import React from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
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
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 md:gap-6 items-center transition-all hover:shadow-md">
      {/* Imagen */}
      <div className="flex-shrink-0">
        <picture className="rounded-lg w-24 h-24 block overflow-hidden bg-gray-50 border border-gray-100">
          {imagen ? (
            <img className="w-full h-full object-cover" src={imagen} alt={nombre_producto} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
              <ShoppingBag size={32} />
            </div>
          )}
        </picture>
      </div>

      {/* Información */}
      <div className="flex-grow text-center sm:text-left min-w-0 w-full sm:w-auto">
        <h4 className="text-lg font-bold text-black truncate mb-1">{nombre_producto}</h4>
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-3 text-sm text-gray-500 mb-2">
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">Color: {nombre_color}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">Talla: {nombre_talla}</span>
        </div>
        <p className="text-lg font-semibold text-blue-900">{format(price)}</p>
      </div>

      {/* Controles y Subtotal */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full sm:w-auto justify-between sm:justify-end">
        {/* Cantidad */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => updateQuantity(id_variante, qty - 1)}
            disabled={qty <= 1}
            className="px-3 py-1.5 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Minus size={16} />
          </button>
          <div className="w-10 text-center text-sm font-bold border-x border-gray-100 py-1">
            {qty}
          </div>
          <button
            onClick={() => updateQuantity(id_variante, qty + 1)}
            disabled={qty >= maxStock}
            className="px-3 py-1.5 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right hidden md:block min-w-[100px]">
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Subtotal</p>
          <h3 className="font-bold text-lg text-blue-900">{format(total)}</h3>
        </div>

        {/* Eliminar */}
        <button
          onClick={() => removeFromCart(id_variante)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all group"
          title="Eliminar producto"
        >
          <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
