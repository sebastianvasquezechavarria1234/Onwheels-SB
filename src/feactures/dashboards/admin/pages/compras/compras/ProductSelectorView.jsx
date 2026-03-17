import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { X, Search, Package, Plus, Image as ImageIcon, ExternalLink, Hash, XCircle, DollarSign, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for conditional classes
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export const ProductSelectorView = ({ onClose, onAdd, allProducts }) => {
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const productPath = basePath === '/custom' ? 'productos' : 'products';
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
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex-1 flex flex-col p-10 overflow-hidden bg-white/40 backdrop-blur-xl relative z-20 font-['Outfit']"
        >
            <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] w-full h-full flex flex-col overflow-hidden border border-white mx-auto max-w-7xl relative">
                
                {/* Header Section */}
                <div className="flex items-center justify-between px-12 py-10 border-b border-slate-50 shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                    
                    <div className="flex items-center gap-8">
                        <button
                            onClick={onClose}
                            className="w-14 h-14 rounded-[1.25rem] bg-slate-50 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-400 transition-all border border-slate-100 shadow-sm active:scale-90"
                            title="Volver al formulario"
                        >
                            <ArrowLeft size={22} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50">
                                   <Package className="text-indigo-600" size={24} strokeWidth={2.5} />
                                </div>
                                Selección de Inventario
                            </h2>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-2 italic">
                                Catálogo de productos disponibles para abastecimiento
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <a
                            href={`${basePath}/${productPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group border border-slate-800"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Ingresar Nuevo Producto
                            <ExternalLink size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-1" />
                        </a>
                    </div>
                </div>

                {/* View Body */}
                <div className="flex flex-col lg:row-span-1 lg:flex-row flex-1 overflow-hidden min-h-0">

                    {/* Left: Product Feed */}
                    <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-100 bg-slate-50/30">
                        {/* Search Bar Container */}
                        <div className="px-12 py-8 bg-white border-b border-slate-50 shrink-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)]">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
                                <input
                                    placeholder="FILTRAR POR NOMBRE O SKU..."
                                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] text-[11px] font-black tracking-widest outline-none focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-100 transition-all text-slate-900 placeholder:text-slate-300 uppercase"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Product List Feed */}
                        <div className="flex-1 overflow-y-auto px-12 py-8 space-y-4 custom-scrollbar">
                            {filteredProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-8 opacity-20">
                                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-dashed border-slate-200">
                                       <Search size={48} className="text-slate-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">No se encontraron coincidencias</p>
                                </div>
                            ) : (
                                filteredProducts.map(p => {
                                    const isSelected = selectedProduct?.id_producto === p.id_producto;
                                    const hasStock = p.variantes?.some(v => v.stock > 0);
                                    
                                    return (
                                        <button
                                            key={p.id_producto}
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setSelectedVariant(null);
                                                setNewItemData({ cantidad: 1, precio_unitario: p.precio_compra || "" });
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-6 p-6 rounded-[2rem] text-left border-2 transition-all group relative overflow-hidden",
                                                isSelected
                                                    ? "bg-slate-900 border-slate-900 shadow-2xl shadow-slate-300 -translate-y-1"
                                                    : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
                                            )}
                                        >
                                            {/* Thumbnail Section */}
                                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                                                {p.imagen || p.url_imagen || (p.imagenes && p.imagenes[0]?.url_imagen) ? (
                                                    <img
                                                        src={p.imagen || p.url_imagen || p.imagenes[0]?.url_imagen}
                                                        alt={p.nombre_producto}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon size={32} className={isSelected ? "text-white/20" : "text-slate-200"} />
                                                )}
                                            </div>

                                            {/* Info Content */}
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center justify-between gap-4 mb-1.5">
                                                   <h4 className={cn(
                                                       "text-[13px] font-black uppercase tracking-tight truncate",
                                                       isSelected ? "text-white" : "text-slate-800"
                                                   )}>
                                                       {p.nombre_producto}
                                                   </h4>
                                                   {!hasStock && (
                                                       <span className="shrink-0 text-[8px] font-black px-2 py-0.5 bg-rose-500 text-white rounded-full uppercase tracking-tighter">SIN STOCK</span>
                                                   )}
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                        isSelected ? "bg-white/10 border-white/20 text-indigo-300" : "bg-slate-50 border-slate-100 text-slate-400"
                                                    )}>
                                                        <Hash size={10} strokeWidth={3} /> {p.variantes?.length || 0} Configs
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        isSelected ? "text-emerald-400" : "text-emerald-600"
                                                    )}>
                                                        $ {Number(p.precio_compra || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Active Marker */}
                                            {isSelected && (
                                                <div className="absolute right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                   <ChevronRight size={18} className="text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Configuration Panel */}
                    <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center relative shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.02)]">
                        <AnimatePresence mode="wait">
                            {selectedProduct ? (
                                <motion.div 
                                    key={`config-${selectedProduct.id_producto}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="w-full h-full flex flex-col p-12 overflow-y-auto custom-scrollbar"
                                >
                                    <div className="space-y-12">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic mb-2">Paso 01 / Configuración</p>
                                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{selectedProduct.nombre_producto}</h3>
                                            <p className="text-[11px] font-medium text-slate-300 leading-relaxed uppercase tracking-widest italic">{selectedProduct.descripcion?.slice(0, 150)}{selectedProduct.descripcion?.length > 150 ? '...' : ''}</p>
                                        </div>

                                        {/* Variants Selector Grid */}
                                        <div className="space-y-6">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1 leading-none italic">
                                                Seleccionar Variante Específica
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
                                                                onClick={() => setSelectedVariant(v)}
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
                                                                className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 text-lg font-black text-white outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 transition-all font-mono"
                                                                value={newItemData.cantidad}
                                                                onChange={(e) => setNewItemData({ ...newItemData, cantidad: e.target.value })}
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
                                                                    className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl pl-16 pr-6 py-4 text-lg font-black text-white outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 transition-all font-mono"
                                                                    placeholder="0,00"
                                                                    value={newItemData.precio_unitario}
                                                                    onChange={(e) => setNewItemData({ ...newItemData, precio_unitario: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

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
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="w-40 h-40 rounded-[3rem] bg-slate-50 border-4 border-dashed border-slate-100 flex items-center justify-center mb-10 group hover:rotate-6 transition-transform">
                                       <Package size={80} className="text-slate-100 group-hover:text-slate-200 transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Esperando Selección</h3>
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] max-w-[300px] leading-relaxed italic">Explora el registro maestro a la izquierda para iniciar la configuración de abastecimiento</p>
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
