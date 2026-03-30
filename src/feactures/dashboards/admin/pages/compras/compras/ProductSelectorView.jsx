import React, { useState, useMemo } from "react";
import {
    Search, ShoppingCart, Plus, Minus, ArrowLeft, Package,
    CheckCircle, AlertTriangle, X, ChevronRight, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, configUi } from "../../configuracion/configUi";
import { useToast } from "../../../../../../context/ToastContext";

/**
 * ProductSelectorView
 *
 * Reusable modal-like view to browse and select products with their variants (size/color).
 * Used in Compras, Pedidos and Ventas.
 */
export const ProductSelectorView = ({ allProducts = [], onAdd, onClose, checkStock = false }) => {
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);
    const [priceField, setPriceField] = useState(0);

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return allProducts;
        return allProducts.filter(p =>
            p.nombre_producto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.referencia?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allProducts, searchQuery]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);
        setQty(1);
        // Default price based on context (checkStock = true implies Venta/Pedido, so use precio_venta)
        const defaultPrice = checkStock ? (product.precio_venta || 0) : (product.precio_compra || 0);
        setPriceField(defaultPrice);
    };

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) return;

        // Validation for negative quantity or zero
        if (qty <= 0) return;

        // Stock check if enabled
        if (checkStock && qty > (selectedVariant.stock_actual || 0)) {
            toast.error("Stock Insuficiente", {
                description: `Solo hay ${selectedVariant.stock_actual} unidades disponibles.`
            });
            return;
        }

        onAdd({
            product: selectedProduct,
            variant: selectedVariant,
            cantidad: qty,
            precio_unitario: Number(priceField)
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col h-full overflow-hidden bg-slate-50/30 rounded-[2.5rem]"
        >
            {/* Header / Search */}
            <div className="bg-white px-8 py-6 border-b border-indigo-50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#16315f] hover:bg-indigo-50 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-light text-[#16315f] tracking-tight">Catálogo de Artículos</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explora e incorpora productos al documento</p>
                    </div>
                </div>

                <div className="relative w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#16315f] transition-colors" size={18} />
                    <input
                        type="search"
                        placeholder="Buscar por nombre o ref..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-6 rounded-2xl bg-slate-100/50 border-none focus:ring-2 focus:ring-indigo-100 font-bold text-[#16315f] transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Product List */}
                <div className="w-1/3 border-r border-indigo-50 bg-white/50 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center">
                            <Package size={40} className="mb-3" />
                            <p className="text-xs font-black uppercase tracking-widest">Sin Coincidencias</p>
                        </div>
                    ) : (
                        filteredProducts.map((p) => (
                            <button
                                key={p.id_producto}
                                onClick={() => handleSelectProduct(p)}
                                className={cn(
                                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group",
                                    selectedProduct?.id_producto === p.id_producto
                                        ? "bg-[#16315f] border-[#16315f] text-white shadow-lg shadow-blue-100"
                                        : "bg-white border-transparent hover:border-indigo-100 hover:bg-indigo-50/50 text-[#16315f]"
                                )}
                            >
                                <div className={cn(
                                    "h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center transition-colors border border-slate-200",
                                    selectedProduct?.id_producto === p.id_producto ? "bg-white/10 border-transparent" : "bg-white"
                                )}>
                                    {p.url_imagen || p.imagen || p.imagen_url || (p.imagenes && p.imagenes[0]?.url_imagen) ? (
                                        <img src={p.url_imagen || p.imagen || p.imagen_url || (p.imagenes && p.imagenes[0]?.url_imagen)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={20} className={selectedProduct?.id_producto === p.id_producto ? "text-indigo-200" : "text-slate-300"} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-extrabold text-sm truncate uppercase tracking-tight leading-tight">{p.nombre_producto}</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest leading-none mt-1",
                                        selectedProduct?.id_producto === p.id_producto ? "text-indigo-200" : "text-slate-400"
                                    )}>REF: {p.referencia || '—'}</p>
                                </div>
                                <ChevronRight size={14} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", selectedProduct?.id_producto === p.id_producto && "opacity-40")} />
                            </button>
                        ))
                    )}
                </div>

                {/* Main: Selection Area */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key={selectedProduct.id_producto}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-3xl mx-auto space-y-10 pb-10"
                            >
                                {/* Header Info */}
                                <div className="flex items-start gap-10">
                                    <div className="w-56 h-56 rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-100/50 p-3 border border-indigo-50/50 flex flex-col group overflow-hidden">
                                        <div className="flex-1 rounded-[1.8rem] bg-slate-50 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                                            {selectedProduct.url_imagen || selectedProduct.imagen ? (
                                                <img src={selectedProduct.url_imagen || selectedProduct.imagen} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={70} className="text-indigo-100" strokeWidth={1} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 leading-none">Activo</span>
                                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 leading-none">{selectedProduct.categoria || "Gral"}</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-[#16315f] tracking-tighter uppercase leading-[0.9]">{selectedProduct.nombre_producto}</h3>
                                        <p className="text-slate-400 text-sm font-bold mt-4 leading-relaxed line-clamp-3">{selectedProduct.descripcion || "Este producto es parte de nuestro catálogo premium. Seleccione una variante para ver detalles de stock."}</p>
                                    </div>
                                </div>

                                {/* Variants Section */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-indigo-50/50">
                                        <span className="text-[11px] font-black text-[#6b84aa] uppercase tracking-[0.2em]">Seleccionar Referencia / Talla</span>
                                        <span className="text-[10px] font-bold text-indigo-400 italic">Existencia actual en bodega</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedProduct.variantes && selectedProduct.variantes.length > 0 ? (
                                            selectedProduct.variantes.map((v) => (
                                                <button
                                                    key={v.id_variante || v.id_producto_variante}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={cn(
                                                        "p-5 rounded-3xl border-2 transition-all flex items-center gap-5 text-left group relative",
                                                        (selectedVariant?.id_variante === (v.id_variante || v.id_producto_variante) || selectedVariant?.id_producto_variante === (v.id_variante || v.id_producto_variante))
                                                            ? "bg-white border-indigo-500 ring-8 ring-indigo-500/5 shadow-xl shadow-indigo-100/50"
                                                            : "bg-white border-transparent hover:border-indigo-100 hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    <div className="h-12 w-12 rounded-[1rem] flex items-center justify-center font-black text-[12px] shadow-inner border border-white" style={{ backgroundColor: v.codigo_hex || '#f1f5f9', color: v.codigo_hex ? 'transparent' : '#64748b' }}>
                                                        {v.nombre_talla || v.talla || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-black text-sm text-[#16315f] leading-none mb-1.5 uppercase tracking-tight">{v.nombre_color || v.color} / {v.nombre_talla || v.talla}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("h-2 w-2 rounded-full", (v.stock_actual > 0 ? "bg-emerald-400" : "bg-rose-400"))} />
                                                            <p className="text-[10px] font-bold text-slate-400 tracking-tight">Bodega: <span className={cn("font-black", v.stock_actual > 0 ? "text-emerald-500" : "text-rose-500")}>{v.stock_actual || 0} u.</span></p>
                                                        </div>
                                                    </div>
                                                    {(selectedVariant?.id_variante === (v.id_variante || v.id_producto_variante) || selectedVariant?.id_producto_variante === (v.id_variante || v.id_producto_variante)) && (
                                                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                                                            <CheckCircle size={20} className="text-indigo-600 fill-indigo-50" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-12 rounded-3xl border-2 border-dashed border-indigo-100 bg-indigo-50/10 flex flex-col items-center justify-center opacity-60">
                                                <AlertTriangle size={30} className="text-indigo-300 mb-3" />
                                                <p className="text-xs font-black uppercase tracking-widest text-[#16315f]">Sin configuraciones disponibles</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Panel */}
                                <AnimatePresence>
                                    {selectedVariant && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="overflow-hidden rounded-[2rem] bg-[#16315f] text-white shadow-2xl shadow-[#16315f]/20 relative mt-4"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                                            <div className="p-5 flex flex-col gap-4 relative z-10">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between opacity-70">
                                                            <label className="text-[9px] font-bold uppercase tracking-[0.1em]">Cantidad</label>
                                                            <span className="text-[9px]">{selectedVariant.stock_actual || 0} Bodega</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1.5 border border-white/10">
                                                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-8 w-8 flex items-center justify-center rounded-[0.6rem] bg-white/10 hover:bg-white/20 active:scale-95"><Minus size={14}/></button>
                                                            <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value)||1))} className="flex-1 bg-transparent text-center font-bold text-lg border-none focus:ring-0 p-0" />
                                                            <button onClick={() => setQty(qty + 1)} className="h-8 w-8 flex items-center justify-center rounded-[0.6rem] bg-white/10 hover:bg-white/20 active:scale-95"><Plus size={14}/></button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-70">Precio Unitario Ajustado</label>
                                                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-1.5 border border-white/10 h-[44px]">
                                                            <span className="text-sm opacity-50">$</span>
                                                            <input type="number" value={priceField} onChange={(e) => setPriceField(e.target.value)} className="w-full bg-transparent font-bold text-lg border-none focus:ring-0 p-0 tabular-nums" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-1">
                                                    <div>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Impacto Total</p>
                                                        <p className="text-2xl font-black tabular-nums leading-none">${(qty * priceField).toLocaleString()}</p>
                                                    </div>
                                                    <button onClick={handleAddItem} className="h-11 px-5 rounded-xl bg-white text-[#16315f] font-black tracking-widest uppercase text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl group">
                                                        <Plus size={14} className="transition-transform group-hover:rotate-90 duration-300" /> Incluir en Orden
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-200 mb-8 border border-white shadow-inner">
                                    <ShoppingCart size={60} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#16315f] uppercase tracking-tighter">Panel de Selección</h3>
                                <p className="text-slate-400 text-sm font-bold max-w-xs mt-3 leading-relaxed">Localice el artículo deseado en el catálogo lateral para proceder con la selección de variantes y configuración de la línea.</p>
                                <div className="mt-10 flex gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-indigo-50 shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Paso 1: Buscar</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-indigo-50 shadow-sm">
                                        <div className="h-2 w-2 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Paso 2: Configurar</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
