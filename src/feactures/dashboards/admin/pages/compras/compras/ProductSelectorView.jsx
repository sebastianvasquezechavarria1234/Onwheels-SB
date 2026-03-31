import React, { useState, useMemo } from "react";
import { 
    X, Search, Package, Plus, Image as ImageIcon, 
    ExternalLink, ArrowLeft, CheckCircle, ShoppingCart, 
    AlertCircle, Minus, ChevronRight, TrendingUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn, configUi } from "../../configuracion/configUi";

export const ProductSelectorView = ({ 
    onClose, onAdd, allProducts, 
    checkStock = false, currentItems = [],
    availableColors = [], availableSizes = []
}) => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const productPath = basePath === '/custom' ? 'productos' : 'products';

    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [manualMode, setManualMode] = useState(false);
    const [manualConfig, setManualConfig] = useState({ id_color: "", id_talla: "" });
    const [qty, setQty] = useState(1);
    const [priceField, setPriceField] = useState("");
    const [error, setError] = useState("");

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p =>
            p.nombre_producto?.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
        );
    }, [allProducts, productSearch]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);
        setManualMode(false);
        setManualConfig({ id_color: "", id_talla: "" });
        setQty(1);
        setPriceField(product.precio_compra || product.precio || "");
        setError("");
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;

        let finalVariant = selectedVariant;

        if (manualMode) {
            if (!manualConfig.id_color || !manualConfig.id_talla) {
                setError("Seleccione Color y Talla");
                return;
            }
            const colorObj = availableColors.find(c => String(c.id_color) === String(manualConfig.id_color));
            const tallaObj = availableSizes.find(t => String(t.id_talla) === String(manualConfig.id_talla));
            
            finalVariant = {
                id_variante: null,
                id_color: colorObj.id_color,
                nombre_color: colorObj.nombre_color || colorObj.color,
                codigo_hex: colorObj.codigo_hex,
                id_talla: tallaObj.id_talla,
                nombre_talla: tallaObj.nombre_talla || tallaObj.talla,
                stock: 0
            };
        }

        if (!finalVariant) {
            setError("Seleccione una variante o configure una nueva");
            return;
        }

        const cantidad = parseInt(qty) || 0;
        if (cantidad <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }

        if (checkStock && finalVariant.id_variante) {
            const existingItem = currentItems.find(it => it.id_variante === finalVariant.id_variante);
            const existingQty = existingItem ? (existingItem.qty || existingItem.cantidad || 0) : 0;
            const totalQty = existingQty + cantidad;

            if (totalQty > (finalVariant.stock || 0)) {
                setError(`Stock insuficiente. Ya tienes ${existingQty} en la lista. Máximo disponible: ${finalVariant.stock}`);
                return;
            }
        }

        onAdd({
            product: selectedProduct,
            variant: finalVariant,
            cantidad: cantidad,
            precio_unitario: parseFloat(priceField) || 0
        });
        
        // Reset after add
        if (!manualMode) setSelectedVariant(null);
        setQty(1);
        setError("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(configUi.modalPanel, "flex flex-col h-full min-h-0 border-[#bfd1f4] shadow-[0_20px_60px_-15px_rgba(34,58,99,0.3)]")}
        >
            {/* Modal Header */}
            <div className={configUi.modalHeader}>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className={configUi.actionButton} title="Volver">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-light text-[#16315f] tracking-tight">Catálogo de Artículos</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explora e incorpora productos al documento</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={`${basePath}/${productPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={configUi.secondaryButton + " gap-2 h-10 px-4"}
                    >
                        <Plus size={14} />
                        Nuevo Registro
                        <ExternalLink size={12} className="opacity-40" />
                    </a>
                    <button onClick={onClose} className={configUi.modalClose}><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Product List */}
                <div className="w-1/3 border-r border-indigo-50 bg-white flex flex-col min-h-0">
                    <div className="p-4 border-b border-indigo-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                placeholder="Buscar en catálogo..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar text-left flex flex-col items-start">
                        {filteredProducts.length === 0 ? (
                            <div className="py-20 text-center opacity-30 flex flex-col items-center w-full">
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
                                            : "bg-white border-transparent hover:border-indigo-100 hover:bg-slate-50 text-[#16315f]"
                                    )}
                                >
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors border",
                                        selectedProduct?.id_producto === p.id_producto ? "bg-white/10 border-transparent" : "bg-slate-50 border-slate-100"
                                    )}>
                                        {p.url_imagen || p.imagen || (p.imagenes && p.imagenes[0]?.url_imagen) ? (
                                            <img src={p.url_imagen || p.imagen || (p.imagenes && p.imagenes[0]?.url_imagen)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={20} className={selectedProduct?.id_producto === p.id_producto ? "text-indigo-200" : "text-slate-300"} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-extrabold text-sm truncate uppercase tracking-tight leading-tight">{p.nombre_producto}</p>
                                        <p className={cn(
                                            "text-[9px] font-black uppercase tracking-widest leading-none mt-1",
                                            selectedProduct?.id_producto === p.id_producto ? "text-indigo-200" : "text-slate-400"
                                        )}>REF: {p.referencia || p.codigo_referencia || '—'}</p>
                                    </div>
                                    <ChevronRight size={14} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", selectedProduct?.id_producto === p.id_producto && "opacity-40")} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar relative p-10">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key={selectedProduct.id_producto}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-3xl mx-auto space-y-10 pb-10"
                            >
                                {/* Selected Product Header */}
                                <div className="flex items-start gap-10">
                                    <div className="w-56 h-56 rounded-[2.5rem] bg-white shadow-2xl shadow-indigo-100/50 p-3 border border-indigo-50/50 flex flex-col group overflow-hidden">
                                        <div className="flex-1 rounded-[1.8rem] bg-slate-50 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                                            {selectedProduct.url_imagen || selectedProduct.imagen || (selectedProduct.imagenes && selectedProduct.imagenes[0]?.url_imagen) ? (
                                                <img src={selectedProduct.url_imagen || selectedProduct.imagen || (selectedProduct.imagenes && selectedProduct.imagenes[0]?.url_imagen)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={40} className="text-slate-200" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 py-4 text-left">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Producto Base</span>
                                            <span className="text-[10px] font-bold text-slate-300">#{selectedProduct.id_producto}</span>
                                        </div>
                                        <h3 className="text-4xl font-light text-[#16315f] tracking-tighter leading-none mb-4">{selectedProduct.nombre_producto}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">{selectedProduct.descripcion || "Este artículo no cuenta con una descripción técnica detallada en el sistema."}</p>
                                    </div>
                                </div>

                                {/* Variant Selection */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp size={16} className="text-indigo-400" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Variantes en Existencia</h4>
                                        </div>
                                        {!checkStock && (
                                            <button 
                                                onClick={() => { setManualMode(!manualMode); setSelectedVariant(null); setError(""); }}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    manualMode 
                                                        ? "bg-[#16315f] text-white border-[#16315f]" 
                                                        : "bg-white text-indigo-500 border-indigo-100 hover:bg-indigo-50"
                                                )}
                                            >
                                                {manualMode ? "Ver Existentes" : "Nueva Combinación"}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!manualMode ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {(!selectedProduct.variantes || selectedProduct.variantes.length === 0) ? (
                                                <div className="col-span-full p-8 rounded-3xl bg-white border border-indigo-50 border-dashed text-center">
                                                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                                                    <p className="text-xs font-medium text-slate-400">Sin variantes registradas</p>
                                                    {!checkStock && (
                                                        <button 
                                                            onClick={() => setManualMode(true)}
                                                            className="mt-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                                                        >
                                                            Configurar Nueva Variante
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                selectedProduct.variantes.map(v => {
                                                    const isVarSelected = (selectedVariant?.id_variante || selectedVariant?.id_producto_variante) === (v.id_variante || v.id_producto_variante);
                                                    const outOfStock = v.stock <= 0 && checkStock;
                                                    return (
                                                        <button
                                                            key={v.id_variante || v.id_producto_variante}
                                                            onClick={() => { if (!outOfStock) { setSelectedVariant(v); setError(""); } }}
                                                            disabled={outOfStock}
                                                            className={cn(
                                                                "p-4 rounded-2xl border-2 text-left transition-all relative group",
                                                                isVarSelected 
                                                                    ? "border-indigo-500 bg-white shadow-xl shadow-indigo-100 -translate-y-1"
                                                                    : outOfStock 
                                                                        ? "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"
                                                                        : "border-transparent bg-white hover:border-indigo-100 hover:shadow-lg"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    {v.color_hex || v.codigo_hex ? (
                                                                        <div className="h-3 w-3 rounded-full border border-slate-100" style={{ backgroundColor: v.color_hex || v.codigo_hex }} />
                                                                    ) : null}
                                                                    <span className="text-[10px] font-black uppercase text-[#16315f] tracking-tighter">
                                                                        {v.nombre_color || v.color || 'Único'}
                                                                    </span>
                                                                </div>
                                                                <span className={cn("text-[10px] font-bold", isVarSelected ? "text-indigo-500" : "text-slate-300")}>
                                                                    {v.nombre_talla || v.talla || 'Única'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-bold text-slate-400">Stock</span>
                                                                <span className={cn("text-xs font-black", (v.stock || 0) > 0 ? "text-[#16315f]" : "text-rose-500")}>
                                                                    {v.stock || 0}
                                                                </span>
                                                            </div>
                                                            {isVarSelected && <div className="absolute top-2 right-2 h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle size={10} className="text-white" /></div>}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 p-8 rounded-[2.5rem] bg-indigo-50/30 border border-indigo-100/50">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color de Variante</label>
                                                <select 
                                                    value={manualConfig.id_color}
                                                    onChange={(e) => setManualConfig({...manualConfig, id_color: e.target.value})}
                                                    className="w-full h-12 px-4 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-[#16315f] outline-none"
                                                >
                                                    <option value="">Seleccionar Color...</option>
                                                    {availableColors.map(c => (
                                                        <option key={c.id_color} value={c.id_color}>{c.nombre_color}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Talla / Tamaño</label>
                                                <select 
                                                    value={manualConfig.id_talla}
                                                    onChange={(e) => setManualConfig({...manualConfig, id_talla: e.target.value})}
                                                    className="w-full h-12 px-4 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-[#16315f] outline-none"
                                                >
                                                    <option value="">Seleccionar Talla...</option>
                                                    {availableSizes.map(t => (
                                                        <option key={t.id_talla} value={t.id_talla}>{t.nombre_talla}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className="col-span-full text-[10px] text-indigo-400 font-bold italic mt-2 text-center">Nota: Si la combinación ya existe, el sistema la detectará automáticamente al procesar la compra.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Form Panel (Amount & Price) */}
                                <AnimatePresence>
                                    {(selectedVariant || manualMode) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="overflow-hidden rounded-[2.5rem] bg-[#16315f] text-white shadow-2xl shadow-[#16315f]/20 relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                            
                                            <div className="p-8 flex flex-col gap-6 relative z-10 text-left">
                                                <div className="grid grid-cols-2 gap-10">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center px-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Cantidad</label>
                                                            <span className="text-[10px] font-bold opacity-40 italic">{manualMode ? 0 : (selectedVariant?.stock || 0)} Actual</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-2 border border-white/10 h-16">
                                                            <button 
                                                                onClick={() => setQty(Math.max(1, qty - 1))}
                                                                className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                                                            >
                                                                <Minus size={18} />
                                                            </button>
                                                            <input 
                                                                type="number" 
                                                                value={qty} 
                                                                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="flex-1 bg-transparent text-center font-black text-2xl border-none focus:ring-0 p-0 text-white outline-none"
                                                            />
                                                            <button 
                                                                onClick={() => setQty(qty + 1)}
                                                                className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 px-1">Valor Unitario</label>
                                                        <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-6 border border-white/10 h-16 group focus-within:bg-white/15 transition-all">
                                                            <span className="text-xl font-bold opacity-30">$</span>
                                                            <input 
                                                                type="number" 
                                                                value={priceField} 
                                                                onChange={(e) => setPriceField(e.target.value)}
                                                                className="w-full bg-transparent font-black text-2xl border-none focus:ring-0 p-0 text-white outline-none tabular-nums"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-2">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Impacto Total</p>
                                                        <p className="text-3xl font-black tabular-nums leading-none">
                                                            ${(qty * (parseFloat(priceField) || 0)).toLocaleString('es-CO')}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        {error && (
                                                            <div className="flex items-center gap-2 text-rose-300 text-[11px] font-bold animate-pulse">
                                                                <AlertCircle size={14} />
                                                                {error}
                                                            </div>
                                                        )}
                                                        <button 
                                                            onClick={handleAddItem}
                                                            className="h-14 px-8 rounded-2xl bg-white text-[#16315f] font-black tracking-widest uppercase text-[11px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl group"
                                                        >
                                                            <ShoppingCart size={18} className="transition-transform group-hover:-translate-y-1" />
                                                            Incluir en Lista
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                <div className="h-40 w-40 rounded-[3rem] bg-indigo-50/50 flex items-center justify-center text-indigo-200 mb-8 border border-white shadow-inner relative group">
                                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <ShoppingCart size={80} strokeWidth={1} className="relative z-10 text-indigo-100" />
                                </div>
                                <h3 className="text-3xl font-light text-[#16315f] tracking-tighter uppercase">Panel de Selección</h3>
                                <p className="text-slate-400 text-sm font-medium max-w-xs mt-4 leading-relaxed">Navegue por el catálogo de la izquierda y seleccione un producto para comenzar la configuración de unidades.</p>
                                
                                <div className="mt-12 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-indigo-50 shadow-sm text-left">
                                        <div className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                                        <span className="text-[10px] font-black uppercase text-indigo-900/40">1. Buscar producto</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-5 py-3 bg-indigo-100/30 rounded-2xl border border-indigo-100/50 text-left">
                                        <div className="h-2 w-2 rounded-full bg-indigo-200 shrink-0" />
                                        <span className="text-[10px] font-black uppercase text-indigo-900/20">2. Definir variante</span>
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

export default ProductSelectorView;
