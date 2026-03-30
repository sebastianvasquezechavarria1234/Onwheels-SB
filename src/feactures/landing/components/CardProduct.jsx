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
    <div className="bg-[#121821] shadow-xl shadow-[#0B0F14]/80 border border-gray-800 rounded-[1.5rem] p-4 md:p-6 flex flex-col sm:flex-row gap-5 md:gap-8 items-center transition-all hover:border-gray-700 hover:bg-[#151c26]">
      {/* Imagen */}
      <div className="flex-shrink-0 relative">
        <picture className="rounded-2xl w-28 h-28 block overflow-hidden bg-[#0B0F14] border border-gray-800 shadow-inner">
          {imagen ? (
            <img className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" src={imagen} alt={nombre_producto} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0B0F14] text-gray-700">
              <ShoppingBag size={36} />
            </div>
          )}
        </picture>
      </div>

      {/* Información */}
      <div className="flex-grow text-center sm:text-left min-w-0 w-full sm:w-auto">
        <h4 className="text-xl font-black text-white truncate mb-2 leading-tight">{nombre_producto}</h4>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
          <span className="bg-[#1E3A8A]/10 text-[#3b82f6] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#1E3A8A]/20">Color: {nombre_color}</span>
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Talla: {nombre_talla}</span>
        </div>
        <p className="text-lg font-black text-white">{format(price)}</p>
      </div>

      {/* Controles y Subtotal */}
      <div className="flex flex-row sm:flex-row items-center gap-4 md:gap-10 w-full sm:w-auto justify-between sm:justify-end">
        {/* Cantidad */}
        <div className="flex items-center border border-gray-700 rounded-xl overflow-hidden bg-[#0B0F14] shadow-inner">
          <button
            onClick={() => updateQuantity(id_variante, qty - 1)}
            disabled={qty <= 1}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Minus size={16} strokeWidth={3} />
          </button>
          <div className="w-12 text-center text-sm font-black text-white border-x border-gray-700 py-2 bg-[#151c26]">
            {qty}
          </div>
          <button
            onClick={() => updateQuantity(id_variante, qty + 1)}
            disabled={qty >= maxStock}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right hidden sm:block min-w-[120px]">
          <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest mb-1">Subtotal</p>
          <h3 className="font-black text-xl text-emerald-400">{format(total)}</h3>
        </div>

        {/* Eliminar */}
        <button
          onClick={() => removeFromCart(id_variante)}
          className="p-3 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-500 group focus:outline-none focus:ring-2 focus:ring-red-500/50"
          title="Eliminar producto"
        >
          <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
