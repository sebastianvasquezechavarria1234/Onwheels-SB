import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Save, Plus, Trash2, Search, ShoppingBag,
    Package, Calendar, Info, CheckCircle2, XCircle,
    ChevronRight, Archive, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";

// Helper para clases condicionales
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

const CompraEditar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    // Si se intenta editar, redirigir al listado
    useEffect(() => {
        if (isEditing) {
            navigate("/admin/compras", { replace: true });
        }
    }, [isEditing, navigate]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Estado principal de la compra (sin estado)
    const [purchase, setPurchase] = useState({
        nit_proveedor: "",
        fecha_compra: new Date().toISOString().split('T')[0],
        total_compra: 0
    });

    const [items, setItems] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    // Vista de selección de productos
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [newItemData, setNewItemData] = useState({ cantidad: 1, precio_unitario: "" });

    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [provRes, prodRes] = await Promise.all([
                comprasService.getProveedores(),
                comprasService.getProductos()
            ]);
            setProveedores(Array.isArray(provRes) ? provRes : []);
            setAllProducts(Array.isArray(prodRes) ? prodRes : []);
        } catch (err) {
            showNotification("Error al cargar datos", "error");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (currentItems) => {
        return currentItems.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);
    };

    const handleAddItem = () => {
        if (!selectedProduct || !selectedVariant) {
            showNotification("Selecciona un producto y variante", "error");
            return;
        }
        const precio = parseFloat(newItemData.precio_unitario) || 0;
        const cant = parseInt(newItemData.cantidad) || 1;

        if (precio <= 0) {
            showNotification("El precio unitario debe ser mayor a 0", "error");
            return;
        }

        const newItem = {
            id_producto: selectedProduct.id_producto,
            id_variante: selectedVariant.id_variante || selectedVariant.id_producto_variante,
            id_color: selectedVariant.id_color,
            id_talla: selectedVariant.id_talla,
            nombre_producto: selectedProduct.nombre_producto,
            nombre_variante: `${selectedVariant.nombre_color || selectedVariant.color || ''} ${selectedVariant.nombre_talla || selectedVariant.talla || ''}`.trim(),
            cantidad: cant,
            precio_unitario: precio,
            subtotal: cant * precio,
            imagen: selectedProduct.imagen || selectedProduct.url_imagen || null
        };

        const newItems = [...items, newItem];
        setItems(newItems);
        setPurchase(prev => ({ ...prev, total_compra: calculateTotal(newItems) }));

        // Reset selection
        setSelectedProduct(null);
        setSelectedVariant(null);
        setNewItemData({ cantidad: 1, precio_unitario: "" });
        showNotification("Producto añadido a la lista");
    };

    const removeItem = (idx) => {
        const newItems = items.filter((_, i) => i !== idx);
        setItems(newItems);
        setPurchase(prev => ({ ...prev, total_compra: calculateTotal(newItems) }));
    };

    const handleSave = async () => {
        if (!purchase.nit_proveedor) {
            showNotification("Selecciona un proveedor", "error");
            return;
        }
        if (items.length === 0) {
            showNotification("Añade al menos un producto", "error");
            return;
        }

        setSaving(true);
        try {
            const payload = { ...purchase, items };
            await comprasService.createCompra(payload);
            showNotification("Compra registrada con éxito — Stock actualizado");
            setTimeout(() => navigate("/admin/compras"), 1500);
        } catch (err) {
            showNotification(err?.response?.data?.mensaje || "Error al guardar la orden", "error");
        } finally {
            setSaving(false);
        }
    };

    // Filtrado de productos para la vista de selección
    const filteredProducts = allProducts.filter(p =>
        p.nombre_producto?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo_referencia?.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center italic text-slate-400">Cargando gestión de compra...</div>;
    if (isEditing) return null; // Redirecting...

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-primary animate-in fade-in duration-500">
            {/* Header Sticky */}
            <header className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/compras")}
                        className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-extrabold text-[#040529] tracking-tight leading-none" style={{ fontFamily: '"Outfit", sans-serif' }}>
                            Nueva Orden de Compra
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inventario / Abastecimiento</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 size={12} />
                        Stock se actualizará automáticamente
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? "Guardando..." : "Registrar Compra"}
                    </button>
                </div>
            </header>

            {/* Main Content Scrollable */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Purchase Info & Product Selector Trigger */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Info Section */}
                        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                <Info size={14} className="text-blue-500" /> Información General
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proveedor *</label>
                                    <select
                                        value={purchase.nit_proveedor}
                                        onChange={(e) => setPurchase(prev => ({ ...prev, nit_proveedor: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none text-sm font-bold text-[#040529] focus:ring-4 focus:ring-blue-50"
                                    >
                                        <option value="">Seleccionar proveedor...</option>
                                        {proveedores.map(p => <option key={p.nit || p.id_proveedor} value={p.nit || p.id_proveedor}>{p.nombre_empresa || p.nombre_proveedor}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha de Compra</label>
                                    <input
                                        type="date"
                                        value={purchase.fecha_compra}
                                        onChange={(e) => setPurchase(prev => ({ ...prev, fecha_compra: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Product Selector Section */}
                        <section className="bg-[#040529] rounded-3xl p-6 shadow-xl text-white space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={80} /></div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 relative z-10">
                                <Package size={14} className="text-blue-400" /> Seleccionar Producto
                            </h3>

                            <div className="relative z-10 space-y-4">
                                {/* Search input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        placeholder="Buscar producto por nombre..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm outline-none focus:bg-white/20 transition"
                                        value={productSearch}
                                        onChange={(e) => { setProductSearch(e.target.value); setSelectedProduct(null); setSelectedVariant(null); }}
                                    />
                                </div>

                                {/* Search Results */}
                                <AnimatePresence>
                                    {productSearch && !selectedProduct && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-xl shadow-2xl max-h-[300px] overflow-y-auto"
                                        >
                                            {filteredProducts.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 text-center py-4">No hay coincidencias</p>
                                            ) : (
                                                filteredProducts.map(p => (
                                                    <button
                                                        key={p.id_producto}
                                                        onClick={() => { setSelectedProduct(p); setProductSearch(""); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-[#040529] text-xs font-medium flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                            {p.imagen || p.url_imagen ? (
                                                                <img src={p.imagen || p.url_imagen} alt={p.nombre_producto} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon size={16} className="text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate">{p.nombre_producto}</p>
                                                            <p className="text-[10px] text-slate-400">{p.variantes?.length || 0} variantes disponibles</p>
                                                        </div>
                                                        <ChevronRight size={14} className="text-slate-300" />
                                                    </button>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Selected Product & Variants */}
                                {selectedProduct && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-white/5 border border-white/10 rounded-2xl relative"
                                    >
                                        <button
                                            onClick={() => { setSelectedProduct(null); setSelectedVariant(null); }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                        >
                                            <XCircle size={14} />
                                        </button>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                                {selectedProduct.imagen || selectedProduct.url_imagen ? (
                                                    <img src={selectedProduct.imagen || selectedProduct.url_imagen} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={20} className="text-blue-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{selectedProduct.nombre_producto}</p>
                                                <p className="text-[10px] text-slate-400">Precio venta: ${Number(selectedProduct.precio_venta || 0).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <label className="text-[9px] text-slate-400 block mb-2 font-bold uppercase">Variante / Stock Actual</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProduct.variantes?.map(v => (
                                                    <button
                                                        key={v.id_variante || v.id_producto_variante}
                                                        onClick={() => setSelectedVariant(v)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-bold border transition",
                                                            (selectedVariant?.id_variante || selectedVariant?.id_producto_variante) === (v.id_variante || v.id_producto_variante)
                                                                ? "bg-white text-[#040529] border-white"
                                                                : "bg-transparent border-white/20 hover:border-white/50 text-white"
                                                        )}
                                                    >
                                                        {v.nombre_color || v.color || '—'} {v.nombre_talla || v.talla || ''} ({v.stock})
                                                    </button>
                                                ))}
                                                {(!selectedProduct.variantes || selectedProduct.variantes.length === 0) && (
                                                    <p className="text-[10px] text-slate-400">Sin variantes definidas</p>
                                                )}
                                            </div>
                                        </div>

                                        {selectedVariant && (
                                            <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                                                <div>
                                                    <label className="text-[9px] text-slate-400 block mb-1">CANTIDAD</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs outline-none"
                                                        value={newItemData.cantidad}
                                                        onChange={(e) => setNewItemData({ ...newItemData, cantidad: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-slate-400 block mb-1">PRECIO COSTO *</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs outline-none"
                                                        placeholder="$"
                                                        value={newItemData.precio_unitario}
                                                        onChange={(e) => setNewItemData({ ...newItemData, precio_unitario: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleAddItem}
                                                    className="col-span-2 mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                                                >
                                                    <Plus size={14} /> Añadir a la Lista
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Items List Table */}
                    <div className="lg:col-span-2 flex flex-col min-h-0">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#040529] flex items-center gap-2">
                                    <Archive size={16} className="text-slate-400" /> Lista de Productos Solicitados
                                </h3>
                                <div className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">
                                    {items.length} ítems
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-[#040529] sticky top-0 z-10 border-b border-slate-100">
                                        <tr>
                                            <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-wider">Producto</th>
                                            <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-wider text-center">Cant.</th>
                                            <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-wider text-right">Precio Unit.</th>
                                            <th className="px-5 py-4 font-bold text-[10px] uppercase tracking-wider text-right">Subtotal</th>
                                            <th className="px-5 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {items.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-20 text-center">
                                                    <div className="flex flex-col items-center opacity-20">
                                                        <ShoppingBag size={48} className="mb-4 text-[#040529]" />
                                                        <p className="text-sm italic font-medium">No has añadido productos todavía</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-[#040529] text-sm leading-tight">{item.nombre_producto}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium uppercase">{item.nombre_variante}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-[#040529] font-bold text-xs">{item.cantidad}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-medium text-slate-500 text-sm tabular-nums">
                                                        ${Number(item.precio_unitario).toLocaleString()}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-extrabold text-[#040529] text-sm tabular-nums">
                                                        ${Number(item.subtotal).toLocaleString()}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            onClick={() => removeItem(idx)}
                                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Totals */}
                            <div className="shrink-0 p-6 bg-[#F0E6E6]/30 border-t border-[#040529]/10">
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-10 text-slate-500 text-sm font-medium">
                                        <span>Subtotal Estimado</span>
                                        <span className="tabular-nums">${Number(purchase.total_compra).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-10 text-[#040529] text-2xl font-black">
                                        <span className="tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>TOTAL COMPRA</span>
                                        <span className="tabular-nums">${Number(purchase.total_compra).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Notifications */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-bold ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompraEditar;
