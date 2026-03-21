import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Save, Plus, Trash2, Package, CheckCircle2, ChevronLeft, Calendar, User, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";
import ProductSelectorView from "./ProductSelectorView";
import { cn, configUi } from "../../configUi";

const CompraEditar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            navigate(`${basePath}/compras`, { replace: true });
        }
    }, [isEditing, navigate]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [purchase, setPurchase] = useState({
        nit_proveedor: "",
        fecha_compra: new Date().toISOString().split('T')[0],
        total_compra: 0
    });

    const [items, setItems] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [showProductSelector, setShowProductSelector] = useState(false);
<<<<<<< HEAD
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [newItemData, setNewItemData] = useState({ cantidad: 1, precio_unitario: "" });

    const [errors, setErrors] = useState({});
=======
>>>>>>> 4fb69d6c78f842029ef4c562d05b6567c5c0d64c
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
                comprasService.getProductos({ limit: 1000 })
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
            showNotification("Compra registrada correctamente");
            setTimeout(() => navigate(`${basePath}/compras`), 1000);
        } catch (err) {
            showNotification(err?.response?.data?.mensaje || "Error al registrar la compra", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className={`${configUi.pageShell} items-center justify-center`}>
            <div className="w-8 h-8 border-4 border-[#bfd1f4] border-t-[#16315f] rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-[#6b84aa]">Cargando formulario...</p>
        </div>
    );
    
    if (isEditing) return null;

    return (
        <div className={configUi.pageShell}>
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
                            showNotification("Producto agregado");
                            setShowProductSelector(false); // volver automaticamente
                        }}
                    />
                ) : (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col h-full min-h-0"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(`${basePath}/compras`)}
                                    className={configUi.iconButton}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h2 className={configUi.title}>Nueva Compra</h2>
                                    <p className="text-sm text-[#6b84aa] mt-0.5">Ingresa los productos adquiridos para actualizar el stock.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-[#16315f]">
                                    ${Number(purchase.total_compra).toLocaleString('es-CO')}
                                </span>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || items.length === 0}
                                    className={`${configUi.primarySoftButton} ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <Save size={18} />}
                                    Registrar Compra
                                </button>
                            </div>
                        </div>

<<<<<<< HEAD
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
=======
                        {/* Content Area */}
                        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-6 pr-2">
                            {/* Left: General Info */}
                            <div className="xl:w-[350px] shrink-0 space-y-4 flex flex-col">
                                <div className="rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] p-5 shadow-sm space-y-5">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#16315f]">Información General</h3>
                                    
                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Proveedor</label>
                                        <div className="relative">
                                            <select
                                                value={purchase.nit_proveedor}
                                                onChange={(e) => setPurchase(prev => ({ ...prev, nit_proveedor: e.target.value }))}
                                                className={configUi.fieldSelect}
                                            >
                                                <option value="">Seleccione un proveedor</option>
                                                {proveedores.map(p => (
                                                    <option key={p.nit || p.id_proveedor} value={p.nit || p.id_proveedor}>
                                                        {p.nombre_empresa || p.nombre_proveedor}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b84aa]">
                                                <ChevronLeft className="rotate-[-90deg]" size={16} />
>>>>>>> 4fb69d6c78f842029ef4c562d05b6567c5c0d64c
                                            </div>
                                        </div>
                                    </div>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Fecha de Compra</label>
                                        <input
                                            type="date"
                                            value={purchase.fecha_compra}
                                            onChange={(e) => setPurchase(prev => ({ ...prev, fecha_compra: e.target.value }))}
                                            className={configUi.fieldInput}
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowProductSelector(true)}
                                    className="w-full h-16 flex items-center justify-center gap-3 border-2 border-dashed border-[#9fbce7] rounded-2xl bg-[#f8fbff] text-[#1d4f91] hover:bg-[#edf5ff] hover:border-[#7da7e8] transition-all group shrink-0 mt-4"
                                >
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Plus size={16} className="text-[#16315f]" />
                                    </div>
                                    <span className="font-bold text-sm">Agregar Producto</span>
                                </button>
                            </div>

                            {/* Right: Products List */}
                            <div className="flex-1 rounded-[1.5rem] border border-[#d7e5f8] bg-white shadow-sm flex flex-col overflow-hidden min-h-[400px]">
                                <div className="p-5 border-b border-[#d7e5f8] bg-[#fbfdff] flex justify-between items-center shrink-0">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#16315f]">Productos en la Compra</h3>
                                    <span className={configUi.subtlePill}>{items.length} ítems agregados</span>
                                </div>

                                <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                                    <table className={`${configUi.table} border-0`}>
                                        <thead className="sticky top-0 bg-[#f8fbff] z-10 shadow-sm">
                                            <tr>
                                                <th className={`${configUi.th} border-[#d7e5f8] border-t-0`}>Producto</th>
                                                <th className={`${configUi.th} border-[#d7e5f8] border-t-0 text-center`}>Cantidad</th>
                                                <th className={`${configUi.th} border-[#d7e5f8] border-t-0 text-right`}>P. Unitario</th>
                                                <th className={`${configUi.th} border-[#d7e5f8] border-t-0 text-right`}>Subtotal</th>
                                                <th className={`${configUi.th} border-[#d7e5f8] border-t-0 w-16`}></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#d7e5f8]">
                                            {items.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="p-16 text-center">
                                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f8fbff] text-[#9fbce7] mb-4 border border-[#d7e5f8]">
                                                            <Package size={32} />
                                                        </div>
                                                        <p className="text-[#6b84aa] font-bold text-sm">Aún no hay productos en la lista.</p>
                                                        <p className="text-[#6b84aa] text-xs mt-1">Utiliza el botón "Agregar Producto" para comenzar.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-[#f8fbff] transition-colors">
                                                        <td className="px-5 py-4 align-middle">
                                                            <div className="font-bold text-[#16315f] text-sm">{item.nombre_producto}</div>
                                                            <div className="text-xs text-[#6b84aa] mt-1">{item.nombre_variante}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center align-middle">
                                                            <span className="bg-[#fcfdff] border border-[#d7e5f8] px-3 py-1 rounded-lg text-sm font-bold text-[#16315f]">
                                                                {item.cantidad}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right align-middle">
                                                            <div className="text-sm font-bold text-[#6b84aa]">
                                                                ${Number(item.precio_unitario).toLocaleString('es-CO')}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-right align-middle">
                                                            <div className="font-bold text-[#16315f] text-[15px]">
                                                                ${Number(item.subtotal).toLocaleString('es-CO')}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center align-middle">
                                                            <button
                                                                onClick={() => removeItem(idx)}
                                                                className={configUi.actionDangerButton}
                                                                title="Quitar"
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
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {notification.show && (
                    <motion.div 
                        initial={{ opacity: 0, x: 300 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 300 }} 
                        className={`fixed top-4 right-4 z-[300] px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
                            notification.type === "success" 
                                ? "bg-blue-600" 
                                : "bg-red-600"
                        }`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompraEditar;
