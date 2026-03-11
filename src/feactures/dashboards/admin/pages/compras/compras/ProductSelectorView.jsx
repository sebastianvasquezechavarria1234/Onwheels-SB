import React, { useState } from "react";
import { X, Search, Package, Plus, Image as ImageIcon, ExternalLink, Hash, XCircle, DollarSign, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for conditional classes
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export const ProductSelectorView = ({ onClose, onAdd, allProducts }) => {
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [newItemData, setNewItemData] = useState({ cantidad: 1, precio_unitario: "" });

    const filteredProducts = allProducts.filter(p =>
        p.nombre_producto?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
    );

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) return;

        onAdd({
            product: selectedProduct,
            variant: selectedVariant,
            cantidad: parseInt(newItemData.cantidad) || 1,
            precio_unitario: parseFloat(newItemData.precio_unitario) || 0
        });

        // Reset local state after adding
        setSelectedProduct(null);
        setSelectedVariant(null);
        setNewItemData({ cantidad: 1, precio_unitario: "" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col p-6 overflow-hidden bg-slate-50 relative z-20"
        >
            <div className="bg-white rounded-[2rem] shadow-xl w-full h-full flex flex-col overflow-hidden border border-slate-100 mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#040529] transition-colors border border-slate-200"
                            title="Volver"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-black text-[#040529] font-primary flex items-center gap-3">
                                <Package className="text-blue-500" size={28} />
                                Seleccionar Productos
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Añade ítems a la orden de compra
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Create Product Button */}
                        <a
                            href="/admin/products"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors group border border-indigo-100"
                            title="Abre el gestor de inventario en una nueva pestaña"
                        >
                            <Plus size={16} />
                            Crear Nuevo Producto
                            <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity ml-1" />
                        </a>
                    </div>
                </div>

                {/* View Body */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0 bg-slate-50">

                    {/* Left Side: Product List */}
                    <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-200 bg-white">
                        {/* Search Sticky Area */}
                        <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    placeholder="Buscar por nombre o referencia..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529]/20 transition-all text-[#040529] placeholder:text-slate-400"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Scrollable Product List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {filteredProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <Search size={48} className="mb-4" />
                                    <p className="text-sm font-medium">No se encontraron productos</p>
                                </div>
                            ) : (
                                filteredProducts.map(p => {
                                    const isSelected = selectedProduct?.id_producto === p.id_producto;
                                    return (
                                        <button
                                            key={p.id_producto}
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setSelectedVariant(null); // reset variant on product change
                                                setNewItemData({ cantidad: 1, precio_unitario: p.precio_compra || "" });
                                            }}
                                            className={cn(
                                                "w-full flex items-start gap-4 p-4 rounded-xl text-left border transition-all duration-200",
                                                isSelected
                                                    ? "bg-[#040529] border-[#040529] shadow-lg shadow-[#040529]/10 ring-4 ring-[#040529]/10"
                                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                                            )}
                                        >
                                            {/* Image Thumbnail */}
                                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {p.imagen || p.url_imagen || (p.imagenes && p.imagenes[0]?.url_imagen) ? (
                                                    <img
                                                        src={p.imagen || p.url_imagen || p.imagenes[0]?.url_imagen}
                                                        alt={p.nombre_producto}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon size={24} className={isSelected ? "text-white/50" : "text-slate-300"} />
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    "text-sm font-black truncate mb-1",
                                                    isSelected ? "text-white" : "text-[#040529]"
                                                )}>
                                                    {p.nombre_producto}
                                                </h4>
                                                {p.descripcion && (
                                                    <p className={cn(
                                                        "text-xs line-clamp-2 mb-2 leading-relaxed opacity-80",
                                                        isSelected ? "text-white/70" : "text-slate-500"
                                                    )}>
                                                        {p.descripcion}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 overflow-hidden px-2 py-0.5 rounded text-[10px] font-bold border capitalize",
                                                        isSelected ? "bg-white/10 border-white/20 text-blue-200" : "bg-slate-50 border-slate-200 text-slate-500"
                                                    )}>
                                                        <Hash size={10} /> {p.variantes?.length || 0} Variantes
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold",
                                                        isSelected ? "text-emerald-300" : "text-emerald-600"
                                                    )}>
                                                        Costo: ${Number(p.precio_compra || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Side: Product Details & Variant Selection */}
                    <div className="w-full lg:w-1/2 bg-slate-50 flex flex-col">
                        {selectedProduct ? (
                            <div className="p-8 h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">

                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-[#040529] tracking-tight">{selectedProduct.nombre_producto}</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Configurar Ítem</p>
                                    </div>
                                </div>

                                {/* Variants Selection */}
                                <div className="mb-8">
                                    <label className="text-xs font-bold text-[#040529] uppercase tracking-wider block mb-3">1. Seleccionar Variante</label>

                                    {(!selectedProduct.variantes || selectedProduct.variantes.length === 0) ? (
                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-sm font-medium flex items-start gap-3">
                                            <XCircle size={20} className="shrink-0" />
                                            <p>Este producto no tiene variantes registradas. Debes editarlo en el inventario para poder agregarlo a una compra.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProduct.variantes.map(v => {
                                                const isVarSelected = (selectedVariant?.id_variante || selectedVariant?.id_producto_variante) === (v.id_variante || v.id_producto_variante);
                                                return (
                                                    <button
                                                        key={v.id_variante || v.id_producto_variante}
                                                        onClick={() => setSelectedVariant(v)}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 flex flex-col items-start gap-1 text-left",
                                                            isVarSelected
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                                                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:shadow-sm"
                                                        )}
                                                    >
                                                        <span className="capitalize">{v.nombre_color || v.color || 'Color único'} • {v.nombre_talla || v.talla || 'Talla única'}</span>
                                                        <span className={cn(
                                                            "text-[10px] uppercase tracking-wider",
                                                            isVarSelected ? "text-blue-100" : "text-slate-400"
                                                        )}>
                                                            Stock actual: {v.stock}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Inputs for Adding */}
                                <AnimatePresence mode="wait">
                                    {selectedVariant && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-auto"
                                        >
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">2. Cantidad</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-[#040529] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                        value={newItemData.cantidad}
                                                        onChange={(e) => setNewItemData({ ...newItemData, cantidad: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">3. Costo Unitario</label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-[#040529] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                            placeholder="0.00"
                                                            value={newItemData.precio_unitario}
                                                            onChange={(e) => setNewItemData({ ...newItemData, precio_unitario: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Calculation Preview */}
                                                <div className="col-span-2 flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Subtotal Ítem:</span>
                                                    <span className="text-lg font-black text-emerald-600">
                                                        ${((parseInt(newItemData.cantidad) || 0) * (parseFloat(newItemData.precio_unitario) || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAddItem}
                                                disabled={!newItemData.cantidad || !newItemData.precio_unitario}
                                                className="w-full py-4 bg-[#040529] hover:bg-black text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={18} />
                                                Agregar a la Orden
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-60">
                                <Package size={64} className="mb-6 opacity-20" />
                                <h3 className="text-xl font-black text-[#040529] mb-2">Ningún Producto Seleccionado</h3>
                                <p className="text-sm font-medium max-w-xs">Selecciona un producto de la lista a la izquierda para configurar su variante, cantidad y precio.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductSelectorView;
