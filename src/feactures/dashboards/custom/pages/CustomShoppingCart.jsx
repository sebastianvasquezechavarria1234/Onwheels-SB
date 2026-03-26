"use client"

import React from "react";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBasket,
  Package,
  Truck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { configUi, cn } from "../../admin/pages/configuracion/configUi";
import { motion, AnimatePresence } from "framer-motion";

export const CustomShoppingCart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, isLoaded } = useCart();
    const navigate = useNavigate();

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className={configUi.pageShell}>
               <div className={configUi.headerRow}>
                    <div className={configUi.titleWrap}>
                        <h2 className={configUi.title}>Carrito de Compras</h2>
                        <span className={configUi.countBadge}>0 ARTÍCULOS</span>
                    </div>
                </div>
                <div className={cn(configUi.tableCard, "mt-6 p-20 text-center flex flex-col items-center justify-center")}>
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100">
                        <ShoppingBasket size={48} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-[#16315f] uppercase tracking-tight">Tu carrito está vacío</h3>
                    <p className="text-slate-400 mt-2 mb-8 max-w-xs font-medium">Parece que aún no has agregado productos a tu selección actual.</p>
                    <Link to="/custom/store" className={configUi.primaryButton}>
                        Explorar Tienda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={configUi.pageShell}>
            {/* Header */}
            <div className={configUi.headerRow}>
                <div className={configUi.titleWrap}>
                    <h2 className={configUi.title}>Carrito de Compras</h2>
                    <span className={configUi.countBadge}>{cart.itemCount} ARTÍCULOS</span>
                </div>
                <div className={configUi.toolbar}>
                    <button 
                        onClick={clearCart}
                        className={cn(configUi.secondaryButton, "text-rose-500 hover:bg-rose-50 hover:border-rose-100")}
                    >
                        <Trash2 size={16} />
                        Vaciar Carrito
                    </button>
                    <Link to="/custom/store" className={configUi.primaryButton}>
                        Seguir Comprando
                    </Link>
                </div>
            </div>

            <div className="flex flex-col xl:grid xl:grid-cols-3 gap-8 mt-6">
                {/* Product List */}
                <div className="xl:col-span-2 space-y-4">
                    <AnimatePresence>
                        {cart.items.map((item, idx) => (
                            <motion.div
                                key={item.id_variante}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(configUi.tableCard, "p-4 flex flex-col sm:flex-row items-center gap-6")}
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                                    {item.imagen ? (
                                        <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={32} className="text-slate-200" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <h4 className="font-black text-sm text-[#16315f] uppercase tracking-tight truncate">{item.nombre_producto}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1 uppercase">
                                        {item.nombre_color} • {item.nombre_talla}
                                    </p>
                                    <p className="text-xs font-black text-indigo-500 mt-2">
                                        ${Number(item.price).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                    <button 
                                        onClick={() => updateQuantity(item.id_variante, item.qty - 1)}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#16315f] hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-xs font-black text-[#16315f]">{item.qty}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.id_variante, item.qty + 1)}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#16315f] hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="text-right min-w-[100px]">
                                    <p className="text-sm font-black text-[#16315f]">
                                        ${(item.qty * item.price).toLocaleString()}
                                    </p>
                                    <button 
                                        onClick={() => removeFromCart(item.id_variante)}
                                        className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1 hover:text-rose-600 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary Card */}
                <div className="xl:col-span-1">
                    <div className={cn(configUi.tableCard, "p-8 sticky top-6")}>
                        <h3 className="text-sm font-black text-[#16315f] mb-8 uppercase tracking-widest flex items-center gap-2">
                           <ShoppingBag size={18} className="text-indigo-400" />
                           Resumen de Orden
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-[#16315f]">${cart.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Truck size={12} /> Envío</span>
                                <span className="text-emerald-500 font-black italic">GRATIS</span>
                            </div>
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-baseline mb-8">
                                    <span className="font-black text-xs text-slate-400 uppercase tracking-[.2em]">Total</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-[#16315f] tracking-tighter">${cart.total.toLocaleString()}</span>
                                        <span className="text-[9px] text-slate-300 uppercase font-black tracking-[.3em] block mt-1">COP</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/custom/checkout")}
                            className={cn(configUi.primaryButton, "w-full py-5 text-sm uppercase tracking-[0.2em] font-black shadow-2xl shadow-indigo-200")}
                        >
                            <span className="flex items-center gap-2">
                                Continuar al Pago
                                <ArrowRight size={18} />
                            </span>
                        </button>
                        
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6 leading-relaxed">
                            Proceso de pago 100% seguro <br /> con cifrado de grado bancario
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
