import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Save, Plus, Trash2, Search, ShoppingBag,
    Package, Calendar, Info, CheckCircle2, XCircle,
    ChevronRight, Archive, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";
import ProductSelectorView from "./ProductSelectorView";

// Helper para clases condicionales
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

const CompraEditar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const isEditing = !!id;

    // Si se intenta editar, redirigir al listado
    useEffect(() => {
        if (isEditing) {
            navigate(`${basePath}/compras`, { replace: true });
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

    const [errors, setErrors] = useState({});
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
                comprasService.getProductos({ limit: 1000 }) // Load all for selector
            ]);
            setProveedores(Array.isArray(provRes) ? provRes : []);
            setAllProducts(Array.isArray(prodRes?.productos) ? prodRes.productos : Array.isArray(prodRes) ? prodRes : []);
        } catch (err) {
            showNotification("Error al cargar datos", "error");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (currentItems) => {
        return currentItems.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);
    };

    const removeItem = (idx) => {
        const newItems = items.filter((_, i) => i !== idx);
        setItems(newItems);
        setPurchase(prev => ({ ...prev, total_compra: calculateTotal(newItems) }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!purchase.nit_proveedor) newErrors.nit_proveedor = "REQUERIDO";
        if (!purchase.fecha_compra) newErrors.fecha_compra = "REQUERIDO";
        if (items.length === 0) newErrors.items = "DEBES AÑADIR AL MENOS UN PRODUCTO";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showNotification("Por favor revisa las validaciones en rojo", "error");
            return;
        }

        setSaving(true);
        try {
            const payload = { ...purchase, items };
            await comprasService.createCompra(payload);
            showNotification("Compra registrada con éxito — Stock actualizado");
            setTimeout(() => navigate(`${basePath}/compras`), 1500);
        } catch (err) {
            showNotification(err?.response?.data?.mensaje || "Error al guardar la orden", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Iniciando gestor...</p>
        </div>
    );
    
    if (isEditing) return null;

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-['Outfit']">
            <AnimatePresence mode="wait">
                {showProductSelector ? (
                    <ProductSelectorView
                        key="selector"
                        onClose={() => setShowProductSelector(false)}
                        allProducts={allProducts}
                        onAdd={(data) => {
                            const { product, variant, cantidad, precio_unitario } = data;
                            const newItem = {
                                id_producto: product.id_producto,
                                id_variante: variant.id_variante || variant.id_producto_variante,
                                id_color: variant.id_color,
                                id_talla: variant.id_talla,
                                nombre_producto: product.nombre_producto,
                                nombre_variante: `${variant.nombre_color || variant.color || ''} ${variant.nombre_talla || variant.talla || ''}`.trim(),
                                cantidad: cantidad,
                                precio_unitario: precio_unitario,
                                subtotal: cantidad * precio_unitario,
                                imagen: product.imagen || product.url_imagen || (product.imagenes && product.imagenes[0]?.url_imagen) || null
                            };
                            const newItems = [...items, newItem];
                            setItems(newItems);
                            setPurchase(prev => ({ ...prev, total_compra: calculateTotal(newItems) }));
                            showNotification("Producto añadido a la lista");
                        }}
                    />
                ) : (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col h-full overflow-hidden"
                    >
                        {/* Header Sticky */}
                        <header className="shrink-0 bg-white border-b border-slate-100 px-10 py-6 flex items-center justify-between z-20">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => navigate(`${basePath}/compras`)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 border border-slate-100"
                                >
                                    <ArrowLeft size={20} strokeWidth={2.5} />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">
                                        Crear Abastecimiento
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1.5 leading-none italic">Formulario de Orden de Compra</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronización de Stock Activa</span>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || items.length === 0}
                                    className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                                >
                                    <Save size={16} strokeWidth={3} />
                                    <span>{saving ? "Procesando..." : "Registrar Entrada"}</span>
                                </button>
                            </div>
                        </header>

                        {/* Main Content Scrollable */}
                        <main className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                {/* Left: Info Sidebar */}
                                <div className="lg:col-span-4 space-y-8">
                                    {/* Info Section */}
                                    <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-12 -translate-y-12" />
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3 relative z-10">
                                            <Info size={16} className="text-indigo-500" /> Cabecera de Orden
                                        </h3>

                                        <div className="space-y-6 relative z-10">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>Proveedor Autorizado *</span>
                                                    {errors.nit_proveedor && <span className="text-rose-500 animate-pulse italic">{errors.nit_proveedor}</span>}
                                                </label>
                                                <select
                                                    value={purchase.nit_proveedor}
                                                    onChange={(e) => {
                                                        setPurchase(prev => ({ ...prev, nit_proveedor: e.target.value }));
                                                        if (errors.nit_proveedor) setErrors(prev => ({ ...prev, nit_proveedor: null }));
                                                    }}
                                                    className={cn(
                                                        "w-full px-6 py-4 rounded-2xl border-2 bg-slate-50 text-sm font-bold text-slate-700 outline-none transition-all appearance-none cursor-pointer uppercase tracking-tight",
                                                        errors.nit_proveedor ? "border-rose-200 bg-rose-50 focus:border-rose-500 focus:ring-rose-100" : "border-slate-100 focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-100"
                                                    )}
                                                >
                                                    <option value="">Seleccionar del Registro...</option>
                                                    {proveedores.map(p => (
                                                        <option key={p.nit || p.id_proveedor} value={p.nit || p.id_proveedor}>
                                                            {p.nombre_empresa || p.nombre_proveedor}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>Fecha de Transacción</span>
                                                    {errors.fecha_compra && <span className="text-rose-500 italic">{errors.fecha_compra}</span>}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={purchase.fecha_compra}
                                                    onChange={(e) => {
                                                        setPurchase(prev => ({ ...prev, fecha_compra: e.target.value }));
                                                        if (errors.fecha_compra) setErrors(prev => ({ ...prev, fecha_compra: null }));
                                                    }}
                                                    className={cn(
                                                        "w-full px-6 py-4 rounded-2xl border-2 bg-slate-50 text-sm font-bold text-slate-700 outline-none transition-all",
                                                        errors.fecha_compra ? "border-rose-200 bg-rose-50 focus:border-rose-500" : "border-slate-100 focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-100"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Product Selector Trigger */}
                                    <div className="space-y-4">
                                        <button 
                                            onClick={() => setShowProductSelector(true)}
                                            className={cn(
                                                "w-full group rounded-[2.5rem] p-10 shadow-2xl space-y-6 relative overflow-hidden text-left hover:scale-[1.02] transition-all active:scale-95",
                                                errors.items ? "bg-rose-500 shadow-rose-200 text-white" : "bg-slate-900 shadow-slate-300 text-white"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform"><ShoppingBag size={120} /></div>
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center border",
                                                errors.items ? "bg-white/10 border-white/20" : "bg-white/10 border-white/20"
                                            )}>
                                               <Package size={28} className={errors.items ? "text-white" : "text-indigo-400"} />
                                            </div>
                                            <div className="space-y-2 relative z-10">
                                                <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">
                                                    Añadir Productos
                                                </h3>
                                                <p className={cn(
                                                    "text-[10px] font-medium leading-relaxed uppercase tracking-widest",
                                                    errors.items ? "text-rose-100" : "text-slate-400"
                                                )}>
                                                    Explorar el catálogo para definir variantes, cantidades y costos
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] pt-4",
                                                errors.items ? "text-white" : "text-indigo-400"
                                            )}>
                                               Abrir Catálogo <ChevronRight size={14} />
                                            </div>
                                        </button>
                                        {errors.items && (
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-bounce">
                                                ⚠️ {errors.items}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Items List Table */}
                                <div className="lg:col-span-8 flex flex-col min-h-[500px]">
                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col h-full overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                                            <div className="space-y-1">
                                               <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                                                   <Archive size={16} className="text-indigo-500" /> Detalle de Adquisición
                                               </h3>
                                               <p className="text-[10px] text-slate-400 font-medium">Items listos para ingresar al inventario</p>
                                            </div>
                                            <span className="px-5 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                                {items.length} productos
                                            </span>
                                        </div>

                                        <div className="flex-1 overflow-auto custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-slate-50/50 text-slate-400 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">Item / Variante</th>
                                                        <th className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 text-center">Cant.</th>
                                                        <th className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 text-right">Inversión Un.</th>
                                                        <th className="px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 text-right">Neto</th>
                                                        <th className="px-10 py-5 border-b border-slate-100"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {items.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="p-32 text-center">
                                                                <div className="flex flex-col items-center gap-6 opacity-30">
                                                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-4 border-dashed border-slate-200">
                                                                       <ShoppingBag size={32} className="text-slate-300" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                       <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Canasta Vacía</p>
                                                                       <p className="text-[10px] italic font-medium max-w-[180px] mx-auto leading-relaxed">Añade productos desde el panel izquierdo para comenzar la orden</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        items.map((item, idx) => (
                                                            <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                                                <td className="px-10 py-6">
                                                                    <div className="flex flex-col gap-0.5">
                                                                       <span className="font-bold text-slate-800 text-sm leading-tight">{item.nombre_producto}</span>
                                                                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.nombre_variante}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-10 py-6 text-center">
                                                                    <span className="bg-slate-100 text-slate-800 px-4 py-1.5 rounded-xl font-black text-xs tabular-nums border border-slate-200/50 italic">{item.cantidad}</span>
                                                                </td>
                                                                <td className="px-10 py-6 text-right font-bold text-slate-400 text-sm tabular-nums">
                                                                    ${Number(item.precio_unitario).toLocaleString('es-CO')}
                                                                </td>
                                                                <td className="px-10 py-6 text-right font-black text-slate-800 text-sm tabular-nums">
                                                                    ${Number(item.subtotal).toLocaleString('es-CO')}
                                                                </td>
                                                                <td className="px-10 py-6 text-right">
                                                                    <button
                                                                        onClick={() => removeItem(idx)}
                                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
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
                                        <div className="shrink-0 p-10 bg-slate-900 text-white relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -translate-x-12 -translate-y-12" />
                                            <div className="flex flex-col items-end gap-2 relative z-10">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-80 mb-2">Resumen de Liquidación</p>
                                                <div className="flex items-center gap-10 opacity-40 text-[11px] font-black uppercase tracking-widest">
                                                    <span>Base de Items</span>
                                                    <span className="tabular-nums">${Number(purchase.total_compra).toLocaleString('es-CO')}</span>
                                                </div>
                                                <div className="flex items-center gap-10 mt-2">
                                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Gran Total</span>
                                                    <span className="text-4xl font-black tracking-tighter tabular-nums">${Number(purchase.total_compra).toLocaleString('es-CO')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notifications */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 rounded-3xl shadow-2xl text-[11px] font-black uppercase tracking-[0.2em] border backdrop-blur-md flex items-center gap-3 ${
                        notification.type === "success" 
                            ? "bg-slate-900/90 text-white border-slate-700" 
                            : "bg-rose-500/90 text-white border-rose-400"
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full animate-pulse ${notification.type === "success" ? "bg-emerald-400" : "bg-white"}`} />
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompraEditar;
