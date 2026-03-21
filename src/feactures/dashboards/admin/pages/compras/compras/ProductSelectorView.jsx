import React, { useState } from "react";
import { X, Search, Package, Plus, Image as ImageIcon, ExternalLink, ArrowLeft, CheckCircle, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn, configUi } from "../../configUi";

export const ProductSelectorView = ({ onClose, onAdd, allProducts }) => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const productPath = basePath === '/custom' ? 'productos' : 'products';
    
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    // BUG FIX: default to sale price (precio) not cost (precio_compra)
    const [newItemData, setNewItemData] = useState({ cantidad: 1, precio_unitario: "" });

    const [localError, setLocalError] = useState(null);

    const filteredProducts = allProducts.filter(p =>
        p.nombre_producto?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) {
            setLocalError("Selecciona una variante");
            return;
        }
        if (!newItemData.cantidad || parseInt(newItemData.cantidad) <= 0) {
            setLocalError("La cantidad debe ser mayor a 0");
            return;
        }
        if (!newItemData.precio_unitario || parseFloat(newItemData.precio_unitario) < 0) {
            setLocalError("El precio debe ser válido");
            return;
        }

        onAdd({
            product: selectedProduct,
            variant: selectedVariant,
            cantidad: parseInt(newItemData.cantidad),
            precio_unitario: parseFloat(newItemData.precio_unitario)
        });
<<<<<<< HEAD

        // Reset local state after adding
        setSelectedProduct(null);
        setSelectedVariant(null);
        setNewItemData({ cantidad: 1, precio_unitario: "" });
        setLocalError(null);
=======
>>>>>>> 4fb69d6c78f842029ef4c562d05b6567c5c0d64c
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="flex-1 flex flex-col min-h-0 bg-white border border-[#d7e5f8] rounded-[2rem] shadow-[0_16px_40px_-28px_rgba(34,58,99,0.5)] overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d7e5f8] bg-[#f8fbff] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#16315f] hover:border-[#16315f]/30 transition-all shadow-sm"
                        title="Volver"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-base font-black text-[#16315f]">Seleccionar Producto</h2>
                        <p className="text-xs text-[#6b84aa]">Elige el producto y la variante que deseas agregar</p>
                    </div>
                </div>
                <a
                    href={`${basePath}/${productPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#16315f] bg-white border border-[#bfd1f4] rounded-xl hover:bg-[#f0f5ff] transition-all"
                >
                    <Plus size={12} />
                    Nuevo Producto
                    <ExternalLink size={11} />
                </a>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
                {/* Left: Product List */}
                <div className="w-full lg:w-[45%] flex flex-col border-r border-[#e8f0fa] bg-[#fbfdff]">
                    <div className="p-4 border-b border-[#e8f0fa] shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                placeholder="Buscar producto..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d7e5f8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#dbeafe] focus:border-[#7da7e8] transition-all text-[#16315f] placeholder:text-[#86a0c6]"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="py-12 text-center">
                                <Search size={28} className="mx-auto text-[#bfd1f4] mb-3" />
                                <p className="text-sm font-bold text-[#6b84aa]">Sin resultados</p>
                                <p className="text-xs text-slate-300 mt-1">Intenta con otro nombre</p>
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
                                            // BUG FIX: use sale price (precio), not cost (precio_compra)
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

                {/* Right: Config Panel */}
                <div className="w-full lg:flex-1 bg-white flex flex-col overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key={`conf-${selectedProduct.id_producto}`}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                className="p-6 space-y-5"
                            >
                                {/* Product header */}
                                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                                        {(selectedProduct.imagenes && selectedProduct.imagenes[0]?.url_imagen) ? (
                                            <img src={selectedProduct.imagenes[0].url_imagen} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={20} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-[#16315f]">{selectedProduct.nombre_producto}</h3>
                                        <p className="text-xs text-[#6b84aa] mt-0.5 line-clamp-2">{selectedProduct.descripcion}</p>
                                        <div className="mt-1.5">
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                Precio de venta: ${Number(selectedProduct.precio || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Variant picker */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Selecciona variante (Color / Talla)</label>
                                    {(!selectedProduct.variantes || selectedProduct.variantes.length === 0) ? (
                                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
                                            Este producto no tiene variantes configuradas.
                                        </div>
<<<<<<< HEAD

                                        {/* Variants Selector Grid */}
                                        <div className="space-y-6">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1 leading-none italic flex justify-between">
                                                <span>Seleccionar Variante Específica</span>
                                                {localError && !selectedVariant && <span className="text-rose-500 animate-pulse">{localError}</span>}
                                            </label>

                                            {(!selectedProduct.variantes || selectedProduct.variantes.length === 0) ? (
                                                <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-[2rem] text-rose-600 text-[11px] font-black uppercase tracking-widest leading-relaxed flex flex-col items-center text-center gap-4">
                                                    <div className="w-14 h-14 bg-rose-500 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-rose-200">
                                                       <XCircle size={28} />
                                                    </div>
                                                    Este producto requiere configuración de variantes en el banco de inventario antes de ser abastecido.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {selectedProduct.variantes.map(v => {
                                                        const isVarSelected = (selectedVariant?.id_variante || selectedVariant?.id_producto_variante) === (v.id_variante || v.id_producto_variante);
                                                        return (
                                                            <button
                                                                key={v.id_variante || v.id_producto_variante}
                                                                onClick={() => {
                                                                    setSelectedVariant(v);
                                                                    setLocalError(null);
                                                                }}
                                                                className={cn(
                                                                    "p-6 rounded-[1.75rem] text-left border-2 transition-all flex flex-col gap-3 relative overflow-hidden group",
                                                                    isVarSelected
                                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-1 scale-[1.03]"
                                                                        : "bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-800"
                                                                )}
                                                            >
                                                                <span className="text-[12px] font-black uppercase tracking-tight">{v.nombre_color || v.color || 'Unico'} • {v.nombre_talla || v.talla || 'Unica'}</span>
                                                                <div className="flex items-center justify-between">
                                                                   <span className={cn(
                                                                       "text-[9px] font-black uppercase tracking-widest italic opacity-70",
                                                                       isVarSelected ? "text-indigo-100" : "text-slate-300"
                                                                   )}>
                                                                       Almacén: {v.stock} pcs
                                                                   </span>
                                                                   {isVarSelected && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Input Form for Quantity and Price */}
                                        <AnimatePresence>
                                            {selectedVariant && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 50 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-indigo-200 space-y-10 relative overflow-hidden border border-slate-800 mt-auto"
                                                >
                                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
                                                    
                                                    <div className="grid grid-cols-2 gap-10">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-1">Cantidad Ingreso</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                className={cn(
                                                                    "w-full bg-slate-800/50 border-2 rounded-2xl px-6 py-4 text-lg font-black text-white outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all font-mono",
                                                                    localError && (!newItemData.cantidad || newItemData.cantidad <= 0) ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-indigo-500"
                                                                )}
                                                                value={newItemData.cantidad}
                                                                onChange={(e) => {
                                                                    setNewItemData({ ...newItemData, cantidad: e.target.value });
                                                                    setLocalError(null);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-1">Costo Unitario</label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    className={cn(
                                                                        "w-full bg-slate-800/50 border-2 rounded-2xl pl-16 pr-6 py-4 text-lg font-black text-white outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all font-mono",
                                                                        localError && (!newItemData.precio_unitario || newItemData.precio_unitario < 0) ? "border-rose-500 focus:border-rose-500" : "border-slate-700 focus:border-indigo-500"
                                                                    )}
                                                                    placeholder="0,00"
                                                                    value={newItemData.precio_unitario}
                                                                    onChange={(e) => {
                                                                        setNewItemData({ ...newItemData, precio_unitario: e.target.value });
                                                                        setLocalError(null);
                                                                    }}
=======
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedProduct.variantes.map(v => {
                                                const isVarSelected = (selectedVariant?.id_variante || selectedVariant?.id_producto_variante) === (v.id_variante || v.id_producto_variante);
                                                const outOfStock = v.stock <= 0;
                                                return (
                                                    <button
                                                        key={v.id_variante || v.id_producto_variante}
                                                        onClick={() => { if (!outOfStock) setSelectedVariant(v); }}
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
>>>>>>> 4fb69d6c78f842029ef4c562d05b6567c5c0d64c
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

<<<<<<< HEAD
                                                    {localError && (
                                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">
                                                            ⚠️ {localError}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                                                        <div className="space-y-1">
                                                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Neto Inversión</p>
                                                           <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                                               $ {((parseInt(newItemData.cantidad) || 0) * (parseFloat(newItemData.precio_unitario) || 0)).toLocaleString('es-CO')}
                                                           </p>
                                                        </div>
                                                        <button
                                                            onClick={handleAddItem}
                                                            disabled={!newItemData.cantidad || !newItemData.precio_unitario}
                                                            className="h-16 px-10 bg-indigo-500 hover:bg-white hover:text-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-20 disabled:pointer-events-none group italic"
                                                        >
                                                            Confirmar Item <ChevronRight size={14} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                                        </button>
=======
                                <AnimatePresence>
                                    {selectedVariant && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className={configUi.fieldGroup}>
                                                    <label className={configUi.fieldLabel}>Cantidad</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={selectedVariant.stock}
                                                        className={configUi.fieldInput}
                                                        value={newItemData.cantidad}
                                                        onChange={(e) => setNewItemData({ ...newItemData, cantidad: e.target.value })}
                                                    />
                                                    <p className="text-[10px] text-slate-300 mt-1">Máx: {selectedVariant.stock}</p>
                                                </div>
                                                <div className={configUi.fieldGroup}>
                                                    <label className={configUi.fieldLabel}>Precio unitario *</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className={cn(configUi.fieldInput, "pl-7")}
                                                            value={newItemData.precio_unitario}
                                                            onChange={(e) => setNewItemData({ ...newItemData, precio_unitario: e.target.value })}
                                                        />
>>>>>>> 4fb69d6c78f842029ef4c562d05b6567c5c0d64c
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-[#f0f6ff] border border-[#d7e5f8] rounded-2xl flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] font-black text-[#6b84aa] uppercase tracking-widest">Subtotal estimado</div>
                                                    <div className="text-xl font-black text-[#16315f] mt-0.5">
                                                        ${((parseInt(newItemData.cantidad) || 0) * (parseFloat(newItemData.precio_unitario) || 0)).toLocaleString('es-CO')}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleAddItem}
                                                    disabled={!newItemData.cantidad || !newItemData.precio_unitario}
                                                    className="flex items-center gap-2 px-5 py-3 bg-[#16315f] text-white text-xs font-black rounded-xl hover:bg-[#0d2248] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-95"
                                                >
                                                    <ShoppingCart size={14} />
                                                    Agregar
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                    <Package size={28} className="text-slate-300" />
                                </div>
                                <h3 className="text-sm font-bold text-[#16315f]">Ningún producto seleccionado</h3>
                                <p className="text-xs text-[#6b84aa] mt-2 max-w-[220px] leading-relaxed">Busca y selecciona un producto de la lista para elegir variante y cantidad.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductSelectorView;
