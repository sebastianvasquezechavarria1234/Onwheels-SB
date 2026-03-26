import React, { useState } from "react";
import { X, Search, Package, Plus, Image as ImageIcon, ExternalLink, ArrowLeft, CheckCircle, ShoppingCart, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn, configUi } from "../../configuracion/configUi";

export const ProductSelectorView = ({ onClose, onAdd, allProducts, checkStock = false, currentItems = [] }) => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';

    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [newItemData, setNewItemData] = useState({ cantidad: 1, precio_unitario: "" });
    const [error, setError] = useState("");

    const filteredProducts = allProducts.filter(p =>
        p.nombre_producto?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) return;

        const cantidad = parseInt(newItemData.cantidad) || 0;
        if (cantidad <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }

        if (checkStock) {
            const existingItem = currentItems.find(it => it.id_variante === selectedVariant.id_variante);
            const existingQty = existingItem ? existingItem.qty : 0;
            const totalQty = existingQty + cantidad;

            if (totalQty > selectedVariant.stock) {
                setError(`Stock insuficiente. Ya tienes ${existingQty} en la lista. Máximo disponible: ${selectedVariant.stock}`);
                return;
            }
        }

        onAdd({
            product: selectedProduct,
            variant: selectedVariant,
            cantidad: cantidad,
            precio_unitario: parseFloat(newItemData.precio_unitario) || 0
        });
        setError("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(configUi.modalPanel, "flex flex-col h-full min-h-0 border-[#bfd1f4] shadow-[0_20px_60px_-15px_rgba(34,58,99,0.3)]")}
        >
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
                </div>
            </div>
        </motion.div>
    );
};

export default ProductSelectorView;
