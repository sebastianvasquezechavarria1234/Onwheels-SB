import React, { useState } from "react";
import { X, Search, Package, Plus, Image as ImageIcon, ExternalLink, ArrowLeft, CheckCircle, ShoppingCart, XCircle, DollarSign, ChevronRight, ChevronLeft, Info, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn, configUi } from "../../configuracion/configUi";

export const ProductSelectorView = ({ onClose, onAdd, allProducts }) => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const productPath = basePath === '/custom' ? 'productos' : 'products';
    
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [newItemData, setNewItemData] = useState({ cantidad: 1, precio_unitario: "" });

    const [localError, setLocalError] = useState(null);

    const filteredProducts = allProducts.filter(p =>
        p.nombre_producto?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) {
            setLocalError("Seleccione una variante activa");
            return;
        }
        if (!newItemData.cantidad || parseInt(newItemData.cantidad) <= 0) {
            setLocalError("Cantidad inválida");
            return;
        }
        if (!newItemData.precio_unitario || parseFloat(newItemData.precio_unitario) < 0) {
            setLocalError("Costo inválido");
            return;
        }

        onAdd({
            product: selectedProduct,
            variant: selectedVariant,
            cantidad: parseInt(newItemData.cantidad),
            precio_unitario: parseFloat(newItemData.precio_unitario)
        });

        // Reset local state after adding
        setSelectedProduct(null);
        setSelectedVariant(null);
        setNewItemData({ cantidad: 1, precio_unitario: "" });
        setLocalError(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(configUi.modalPanel, "flex flex-col h-full min-h-0 border-[#bfd1f4] shadow-[0_20px_60px_-15px_rgba(34,58,99,0.3)]")}
        >
            {/* Modal Header Style */}
            <div className={configUi.modalHeader}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className={configUi.actionButton}
                        title="Volver"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className={configUi.modalTitle}>Catálogo de Activos</h2>
                        <p className={configUi.modalSubtitle}>Sincronización de Stock Entrante</p>
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

            {/* Content Split Style like configUi.modalSplit */}
            <div className="flex-1 flex overflow-hidden min-h-0 bg-[#fbfdff]">
                {/* Left: Product Selection List */}
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
                            filteredProducts.map(p => (
                                <button
                                    key={p.id_producto}
                                    onClick={() => {
                                        setSelectedProduct(p);
                                        setSelectedVariant(null);
                                        setLocalError(null);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group",
                                        selectedProduct?.id_producto === p.id_producto
                                            ? "bg-[#edf5ff] border-[#bfd1f4] shadow-sm"
                                            : "bg-white border-transparent hover:bg-slate-50"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {(p.imagen || p.url_imagen || (p.imagenes && p.imagenes[0]?.url_imagen)) ? (
                                            <img 
                                                src={p.imagen || p.url_imagen || p.imagenes[0]?.url_imagen} 
                                                alt="" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <Package size={16} className="text-slate-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#16315f] truncate uppercase leading-tight">{p.nombre_producto}</p>
                                        <p className="text-[10px] font-bold text-[#6a85ad] mt-0.5">REF: {p.codigo_referencia || "N/A"}</p>
                                    </div>
                                    <ChevronRight 
                                        size={18} 
                                        className={cn(
                                            "shrink-0 transition-all",
                                            selectedProduct?.id_producto === p.id_producto ? "text-[#1d4f91] translate-x-1" : "text-slate-200 opacity-0 group-hover:opacity-100"
                                        )} 
                                    />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Variant Config & Items Form */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className={configUi.modalContent + " space-y-8"}>
                        {!selectedProduct ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-30">
                                <ShoppingCart size={64} />
                                <div className="mt-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#16315f]">Seleccione un Producto</h3>
                                    <p className="text-xs font-bold text-[#6a85ad] mt-1">Configure las variantes para añadir a la orden</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <h4 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                                        <Info size={14} className="text-indigo-400" /> Variantes Disponibles
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {selectedProduct.variantes?.map(v => (
                                            <button
                                                key={v.id_variante || v.id_producto_variante}
                                                onClick={() => {
                                                    setSelectedVariant(v);
                                                    setNewItemData(prev => ({ ...prev, precio_unitario: v.precio_compra || "" }));
                                                    setLocalError(null);
                                                }}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between group",
                                                    selectedVariant?.id_variante === (v.id_variante || v.id_producto_variante)
                                                        ? "bg-[#16315f] border-[#16315f] text-white shadow-md shadow-[#16315f]/20"
                                                        : "bg-white border-slate-100 hover:border-[#bfd1f4] hover:bg-[#f8fbff]"
                                                )}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-black uppercase leading-none">{v.nombre_color || v.color || "ESTADO"}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase",
                                                        selectedVariant?.id_variante === (v.id_variante || v.id_producto_variante) ? "text-indigo-200" : "text-[#6a85ad]"
                                                    )}>{v.nombre_talla || v.talla || "UNICA"}</span>
                                                </div>
                                                <div className="mt-3 flex justify-between items-end">
                                                   <span className={cn(
                                                       "text-[9px] font-black uppercase tracking-tight",
                                                       selectedVariant?.id_variante === (v.id_variante || v.id_producto_variante) ? "text-emerald-300" : "text-slate-300"
                                                   )}>Stk: {v.stock_actual || 0}</span>
                                                   {selectedVariant?.id_variante === (v.id_variante || v.id_producto_variante) && <Check size={14} className="text-white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={configUi.formSection + " grid grid-cols-1 md:grid-cols-2 gap-6 relative"}>
                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Cantidad a Ingresar</label>
                                        <input
                                            type="number"
                                            value={newItemData.cantidad}
                                            onChange={(e) => {
                                                setNewItemData({ ...newItemData, cantidad: e.target.value });
                                                setLocalError(null);
                                            }}
                                            className={configUi.fieldInput}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Costo Unitario</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                                            <input
                                                type="number"
                                                value={newItemData.precio_unitario}
                                                onChange={(e) => {
                                                    setNewItemData({ ...newItemData, precio_unitario: e.target.value });
                                                    setLocalError(null);
                                                }}
                                                className={configUi.fieldInput + " pl-8"}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {localError && (
                                    <div className={configUi.dangerPill + " w-full justify-center py-2"}>
                                        <XCircle size={14} />
                                        <span>ERROR: {localError}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className={configUi.modalFooter}>
                        <div className="flex items-center gap-3">
                           {selectedVariant && (
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">SUBTOTAL ITEM</p>
                                    <p className="text-sm font-black text-[#16315f] underline decoration-[#bfd1f4] decoration-2">
                                       ${(Number(newItemData.cantidad || 0) * Number(newItemData.precio_unitario || 0)).toLocaleString('es-CO')}
                                    </p>
                                </div>
                           )}
                        </div>
                        <button
                            onClick={handleAddItem}
                            disabled={!selectedVariant}
                            className={cn(configUi.primaryButton, "min-w-[200px] h-11")}
                        >
                            <ShoppingCart size={18} />
                            Añadir a la Orden
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
