import React, { useState, useMemo } from "react";
import { 
    Search, ShoppingCart, Plus, Minus, ArrowLeft, Package, 
    CheckCircle, AlertTriangle, X, ChevronRight, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, configUi } from "../../configuracion/configUi";
import { useToast } from "../../../../../../context/ToastContext";

<<<<<<< HEAD
/**
 * ProductSelectorView
 * 
 * Reusable modal-like view to browse and select products with their variants (size/color).
 * Used in Compras, Pedidos and Ventas.
 */
export const ProductSelectorView = ({ allProducts = [], onAdd, onClose, checkStock = false }) => {
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState("");
=======
export const ProductSelectorView = ({ onClose, onAdd, allProducts, checkStock = false, currentItems = [] }) => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';

    const [productSearch, setProductSearch] = useState("");
>>>>>>> 9c6bd4a6080a40daef3990d855cfce188d7a1d80
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
<<<<<<< HEAD
            {/* Header / Search */}
            <div className="bg-white px-8 py-6 border-b border-indigo-50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#16315f] hover:bg-indigo-50 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-[#16315f] tracking-tight">Catálogo de Artículos</h2>
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
                                    "h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center transition-colors",
                                    selectedProduct?.id_producto === p.id_producto ? "bg-white/10" : "bg-indigo-100/50"
                                )}>
                                    {p.url_imagen || p.imagen ? (
                                        <img src={p.url_imagen || p.imagen} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={20} className={selectedProduct?.id_producto === p.id_producto ? "text-indigo-200" : "text-indigo-400"} />
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
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="overflow-hidden rounded-[2.5rem] bg-[#16315f] text-white shadow-2xl shadow-indigo-900/40 relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            
                                            <div className="p-8 pb-4 grid grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between opacity-60">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.2em]">Cantidad</label>
                                                        <span className="text-[10px] font-black">{selectedVariant.stock_actual || 0} Disponibles</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-2 border border-white/10 transition-colors focus-within:bg-white/15">
                                                        <button 
                                                            onClick={() => setQty(Math.max(1, qty - 1))} 
                                                            className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                                                        >
                                                            <Minus size={18} />
                                                        </button>
                                                        <input 
                                                            type="number" 
                                                            value={qty} 
                                                            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                            className="flex-1 bg-transparent text-center font-black text-2xl border-none focus:ring-0 p-0"
                                                        />
                                                        <button 
                                                            onClick={() => setQty(qty + 1)} 
                                                            className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Precio Unitario Ajustado</label>
                                                    <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-3 pl-6 border border-white/10 focus-within:bg-white/15">
                                                        <span className="text-xl font-black opacity-30">$</span>
                                                        <input 
                                                            type="number" 
                                                            value={priceField} 
                                                            onChange={(e) => setPriceField(e.target.value)}
                                                            className="flex-1 bg-transparent font-black text-2xl border-none focus:ring-0 p-0 tabular-nums"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 pt-0 flex items-center justify-between mt-4">
                                                <div className="bg-white/5 py-4 px-8 rounded-3xl border border-white/10 min-w-[200px]">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-50 mb-1">Impacto Total</p>
                                                    <p className="text-3xl font-black tabular-nums tracking-tighter leading-none">${(qty * priceField).toLocaleString()}</p>
                                                </div>
                                                <button 
                                                    onClick={handleAddItem}
                                                    className="h-20 px-12 rounded-[1.8rem] bg-white text-[#16315f] font-black uppercase tracking-widest flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 group"
                                                >
                                                    <Plus size={24} className="transition-transform group-hover:rotate-90 duration-500" />
                                                    <span>Incluir en Orden</span>
                                                </button>
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
=======
            <div className={configUi.modalHeader}>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className={configUi.actionButton} title="Volver">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className={configUi.modalTitle}>Seleccionar Productos</h2>
                        <p className={configUi.modalSubtitle}>Añadir ítems a la orden actual</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className={configUi.modalClose}><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden min-h-0 bg-[#fbfdff]">
                {/* Left side: Product List */}
                <div className="w-full md:w-[400px] flex flex-col border-r border-[#d7e5f8] bg-white text-left">
                    <div className="p-4 border-b border-[#f0f6ff] shrink-0">
                        <div className={configUi.searchWrap + " w-full"}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Filtrar por nombre o referencia..."
                                className={configUi.inputWithIcon + " py-2.5"}
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                        {filteredProducts.length === 0 ? (
                            <div className={configUi.emptyState + " py-20"}>
                                <Package size={32} className="mx-auto opacity-20 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Sin coincidencias</p>
                            </div>
                        ) : (
                            filteredProducts.map(p => {
                                const isSelected = selectedProduct?.id_producto === p.id_producto;
                                const totalStock = (p.variantes || []).reduce((acc, v) => acc + (v.stock || 0), 0);
                                return (
                                    <button
                                        key={p.id_producto}
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            setSelectedVariant(null);
                                            setError("");
                                            setNewItemData({ cantidad: 1, precio_unitario: p.precio || "" });
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                            isSelected
                                                ? "bg-[#16315f] border-[#16315f] shadow-md"
                                                : "bg-white border-[#d7e5f8] hover:bg-[#f0f6ff] hover:border-[#9fbce7]"
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                                            {p.imagen || p.url_imagen || (p.imagenes && p.imagenes[0]?.url_imagen) ? (
                                                <img src={p.imagen || p.url_imagen || p.imagenes[0]?.url_imagen} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={18} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-[#16315f]")}>{p.nombre_producto}</h4>
                                            <div className={cn("flex items-center gap-2 mt-0.5 text-[10px] font-bold", isSelected ? "text-white/60" : "text-[#6b84aa]")}>
                                                <span>{p.variantes?.length || 0} variantes</span>
                                                <span>·</span>
                                                <span className={(!isSelected && totalStock <= 5) ? "text-rose-400" : ""}>{totalStock} en stock</span>
                                            </div>
                                        </div>
                                        {isSelected && <CheckCircle size={16} className="text-white/80 shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right side: Variant picker and Form */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className={configUi.modalContent + " flex-1 overflow-y-auto"}>
                        <AnimatePresence mode="wait">
                            {!selectedProduct ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="h-full flex flex-col items-center justify-center py-20 text-center opacity-30"
                                >
                                    <ShoppingCart size={64} />
                                    <div className="mt-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#16315f]">Seleccione un Producto</h3>
                                        <p className="text-xs font-bold text-[#6a85ad] mt-1">Configure las variantes para añadir a la orden</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="detail"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Selecciona variante (Color / Talla)</label>
                                        {!selectedProduct.variantes || selectedProduct.variantes.length === 0 ? (
                                            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                                                Este producto no tiene variantes configuradas.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedProduct.variantes.map(v => {
                                                    const isVarSelected = (selectedVariant?.id_variante || selectedVariant?.id_producto_variante) === (v.id_variante || v.id_producto_variante);
                                                    const outOfStock = v.stock <= 0;
                                                    return (
                                                        <button
                                                            key={v.id_variante || v.id_producto_variante}
                                                            onClick={() => { if (!outOfStock) { setSelectedVariant(v); setError(""); } }}
                                                            disabled={outOfStock}
                                                            className={cn(
                                                                "p-3 rounded-xl border text-left transition-all",
                                                                outOfStock
                                                                    ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                                                    : isVarSelected
                                                                        ? "border-[#16315f] bg-[#16315f] text-white shadow-md"
                                                                        : "border-[#d7e5f8] bg-[#fbfdff] text-[#5f7396] hover:border-[#9fbce7] hover:bg-[#f0f6ff]"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {v.codigo_hex && (
                                                                    <div
                                                                        className="w-3 h-3 rounded-full border border-white/40 shadow-sm shrink-0"
                                                                        style={{ backgroundColor: v.codigo_hex }}
                                                                    />
                                                                )}
                                                                <span className="text-xs font-bold truncate">
                                                                    {v.nombre_color || v.color || 'Único'} / {v.nombre_talla || v.talla || 'Única'}
                                                                </span>
                                                            </div>
                                                            <span className={cn("text-[10px] font-bold", isVarSelected ? "text-white/70" : outOfStock ? "text-rose-400" : "text-[#6b84aa]")}>
                                                                {outOfStock ? "Sin stock" : `${v.stock} disponibles`}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className={configUi.formSection + " grid grid-cols-1 md:grid-cols-2 gap-6 relative"}>
                                        <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Cantidad a Ingresar</label>
                                            <input
                                                type="number"
                                                value={newItemData.cantidad}
                                                onChange={(e) => {
                                                    setNewItemData({ ...newItemData, cantidad: e.target.value });
                                                    setError("");
                                                }}
                                                className={configUi.fieldInput}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Precio Unitario</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    value={newItemData.precio_unitario}
                                                    onChange={(e) => {
                                                        setNewItemData({ ...newItemData, precio_unitario: e.target.value });
                                                        setError("");
                                                    }}
                                                    className={configUi.fieldInput + " pl-8"}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-[#f0f6ff] border border-[#d7e5f8] rounded-2xl flex items-center justify-between shadow-inner">
                                        <div>
                                            <div className="text-[10px] font-black text-[#6b84aa] uppercase tracking-widest">Subtotal estimado</div>
                                            <div className="text-xl font-black text-[#16315f] mt-0.5">
                                                ${((parseInt(newItemData.cantidad) || 0) * (parseFloat(newItemData.precio_unitario) || 0)).toLocaleString('es-CO')}
                                            </div>
                                            {error && (
                                                <div className="mt-2 text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-pulse">
                                                    <AlertCircle size={12} />
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleAddItem}
                                            disabled={!newItemData.cantidad || !newItemData.precio_unitario || !selectedVariant}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#16315f] text-white text-xs font-black rounded-xl hover:bg-[#0d2248] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-95"
                                        >
                                            <ShoppingCart size={14} />
                                            Agregar a la lista
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
>>>>>>> 9c6bd4a6080a40daef3990d855cfce188d7a1d80
                </div>
            </div>
        </motion.div>
    );
};
