import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Search, Plus, Trash2, ArrowLeft, X, Save,
    CheckCircle, Package, User, DollarSign, AlertCircle,
    Calendar, MapPin, Phone, ShoppingCart, Info, ChevronRight,
    UserPlus, CreditCard, Clock, AlertTriangle, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
    getVentaById,
    createVenta,
    updateVenta,
} from "../../services/ventasService";
import {
    getProductos,
    getColores,
    getTallas,
    getVariantes,
} from "../../services/productosServices";
import { getUsuarios } from "../../services/usuariosServices";
import { getClientes } from "../../services/clientesServices";
import { configUi, cn } from "../../configuracion/configUi";
import { ProductSelectorView } from "../../compras/compras/ProductSelectorView";
import { useToast } from "../../../../../../context/ToastContext";


export default function VentaEditar() {
    const toast = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const isEditing = Boolean(id);

    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);

    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    const [form, setForm] = useState({
        id_cliente: "",
        id_usuario: "",
        direccion: "",
        telefono: "",
        fecha_venta: new Date().toISOString().split("T")[0],
        metodo_pago: "transferencia",
        estado: "Entregada",
        items: [],
    });

    const [showProductSelector, setShowProductSelector] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // --- NOTIFICACIONES ---
    const showNotification = useCallback((message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }, []);

    // --- CARGA DE DATOS ---
    const combinarProductosConVariantes = (productosList = [], variantesList = []) => {
        const productoMap = new Map();
        productosList.forEach((p) => {
            const pid = Number(p.id_producto);
            productoMap.set(pid, { ...p, variantes: p.variantes || [] });
        });

        if (variantesList && variantesList.length > 0) {
            variantesList.forEach((v) => {
                const pid = Number(v.id_producto);
                const producto = productoMap.get(pid);
                if (producto) {
                    const exists = producto.variantes.some(ev => (ev.id_variante || ev.id_producto_variante) === (v.id_variante || v.id_producto_variante));
                    if (!exists) {
                        producto.variantes.push({
                            id_variante: v.id_variante || v.id_producto_variante,
                            id_color: v.id_color,
                            id_talla: v.id_talla,
                            stock: v.stock || v.stock_actual || 0,
                            nombre_color: v.nombre_color || v.color,
                            nombre_talla: v.nombre_talla || v.talla,
                            codigo_hex: v.codigo_hex,
                        });
                    }
                }
            });
        }
        return Array.from(productoMap.values());
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usrs, clis, prodRes, vars, cols, tls] = await Promise.all([
                    getUsuarios(),
                    getClientes(),
                    getProductos({ limit: 1000 }),
                    getVariantes(),
                    getColores(),
                    getTallas(),
                ]);

                setUsuarios(usrs || []);
                setClientes(clis || []);
                setColores(cols || []);
                setTallas(tls || []);

                const prods = Array.isArray(prodRes?.productos) ? prodRes.productos : Array.isArray(prodRes) ? prodRes : [];
                setProductos(combinarProductosConVariantes(prods, vars || []));

                if (isEditing) {
                    const venta = await getVentaById(id);
                    const foundClient = (clis || []).find(c => c.id_cliente === venta.id_cliente);

                    setForm({
                        id_cliente: venta.id_cliente || "",
                        id_usuario: venta.id_usuario || foundClient?.id_usuario || "",
                        direccion: venta.direccion_envio || foundClient?.direccion_envio || "",
                        telefono: venta.telefono || foundClient?.telefono_contacto || "",
                        fecha_venta: venta.fecha_venta?.split("T")[0],
                        metodo_pago: venta.metodo_pago || "transferencia",
                        estado: venta.estado || "Entregada",
                        items: venta.items ? venta.items.map(it => ({
                            ...it,
                            qty: it.cantidad,
                            price: it.precio_unitario,
                            nombre_producto: it.nombre_producto,
                            nombre_color: it.nombre_color || "—",
                            nombre_talla: it.nombre_talla || "—",
                            id_variante: it.id_variante
                        })) : [],
                    });
                }
            } catch (err) {
                console.error("Error cargando datos:", err);
                showNotification("Error de sincronización", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isEditing, id, showNotification]);

    const handleUserChange = (userId) => {
        const selectedId = Number(userId);
        const existingClient = clientes.find(c => c.id_usuario === selectedId);

        if (existingClient) {
            setForm(prev => ({
                ...prev,
                id_cliente: existingClient.id_cliente,
                id_usuario: selectedId,
                direccion: existingClient.direccion_envio || "",
                telefono: existingClient.telefono_contacto || ""
            }));
            showNotification("Perfil de cliente cargado");
        } else {
            setForm(prev => ({
                ...prev,
                id_cliente: "",
                id_usuario: selectedId,
                direccion: "",
                telefono: ""
            }));
            if (userId) showNotification("Usuario nuevo. Por favor complete el envío.");
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.id_usuario) errors.id_usuario = "Seleccione un cliente";
        if (!form.direccion || !form.direccion.trim()) errors.direccion = "Ingrese la dirección";

        if (!form.telefono || !form.telefono.trim()) {
            errors.telefono = "Ingrese el teléfono";
        } else if (form.telefono.replace(/\D/g, '').length !== 10) {
            errors.telefono = "El teléfono debe tener exactamente 10 dígitos";
        }

        if (form.items.length === 0) errors.items = "Agregue al menos un producto";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || !validateForm()) {
            if (!validateForm()) toast.error("Por favor completa los campos obligatorios.");
            return;
        }

        // Validar fecha de venta (no futura)
        if (form.fecha_venta) {
            const saleDate = new Date(form.fecha_venta);
            const today = new Date();
            if (saleDate > today) {
                toast.error("La fecha de venta no puede ser futura.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                id_cliente: isEditing ? form.id_cliente : undefined,
                id_usuario: !isEditing ? form.id_usuario : undefined,
                fecha_venta: form.fecha_venta,
                metodo_pago: form.metodo_pago,
                estado: form.estado,
                direccion: form.direccion,
                telefono: form.telefono,
                items: form.items.map(it => ({
                    id_variante: it.id_variante,
                    cantidad: it.qty
                }))
            };

            if (isEditing) {
                await updateVenta(id, payload);
                toast.success("Venta actualizada");
                showNotification("Venta actualizada");
            } else {
                await createVenta(payload);
                toast.success("Venta registrada exitosamente");
                showNotification("Venta registrada exitosamente");
            }
            setTimeout(() => navigate(`${basePath}/ventas`), 1000);
        } catch (err) {
            const msg = err?.response?.data?.mensaje || "Error al procesar la venta";
            toast.error(msg);
            showNotification(msg, "error");
            setIsSubmitting(false);
        }
    };

    const totalEstimated = useMemo(() =>
        form.items.reduce((acc, it) => acc + (it.qty * it.price), 0),
        [form.items]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black tracking-widest text-[#16315f] uppercase">Sincronizando Sistema de Ventas...</p>
            </div>
        );
    }

    return (
        <div className={cn(configUi.pageShell, "!overflow-y-auto pb-24")}>
            <AnimatePresence mode="wait">
                {showProductSelector ? (
                    <ProductSelectorView
                        key="product-selector"
                        allProducts={productos}
                        checkStock={true}
                        currentItems={form.items}
                        onAdd={(data) => {
                            const { product, variant, cantidad, precio_unitario } = data;
                            const variantData = product.variantes?.find(v => v.id_variante === variant.id_variante) || variant;

                            const existingItemIdx = form.items.findIndex(it => it.id_variante === variantData.id_variante);

                            if (existingItemIdx !== -1) {
                                // Merge duplicate
                                const newItems = [...form.items];
                                newItems[existingItemIdx] = {
                                    ...newItems[existingItemIdx],
                                    qty: newItems[existingItemIdx].qty + cantidad
                                };
                                setForm(prev => ({ ...prev, items: newItems }));
                                showNotification("Cantidad actualizada", "success");
                            } else {
                                // Add new
                                const newItem = {
                                    id_producto: product.id_producto,
                                    nombre_producto: product.nombre_producto,
                                    id_variante: variantData.id_variante,
                                    id_color: variantData.id_color,
                                    nombre_color: variantData.nombre_color,
                                    id_talla: variantData.id_talla,
                                    nombre_talla: variantData.nombre_talla,
                                    qty: cantidad,
                                    price: precio_unitario,
                                    stockMax: variantData.stock
                                };
                                setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                                showNotification("Producto añadido", "success");
                            }
                            setShowProductSelector(false);
                        }}
                        onClose={() => setShowProductSelector(false)}
                    />
                ) : (
                    <motion.div key="venta-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        {/* Header Row */}
                        <div className={cn(configUi.headerRow, "sticky top-4 z-[30] !bg-white/80 backdrop-blur-xl border border-slate-100 p-4 rounded-3xl shadow-xl shadow-slate-200/50 mb-10")}>
                            <div className="flex items-center gap-5">
                                <button onClick={() => navigate(`${basePath}/ventas`)} className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-[#16315f] hover:border-[#16315f]/20 hover:shadow-lg transition-all">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-lg font-bold text-[#16315f] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                                        {isEditing ? `Editar Venta #${id}` : "Nueva Venta"}
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        ESTADO: {form.estado.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="px-6 border-r border-[#d7e5f8] flex flex-col items-end">
                                    <p className="text-[9px] font-black text-[#6b84aa] uppercase tracking-widest leading-none mb-1">TOTAL VENTA</p>
                                    <span className="text-xl font-black text-[#16315f] tabular-nums">
                                        ${Number(totalEstimated).toLocaleString('es-CO')}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || form.items.length === 0}
                                    className={configUi.primaryButton}
                                >
                                    {isSubmitting ? <div className="w-5 h-5 rounded-full border-4 border-white/40 border-t-white animate-spin" /> : <Save size={18} />}
                                    {isEditing ? "Actualizar Venta" : "Confirmar Venta"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* TOP ROW: CLIENT + SUMMARY */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 ring-1 ring-slate-100/50 h-full">
                                        <h3 className="text-xl font-extrabold text-[#16315f] mb-8 flex items-center gap-3">
                                            <User className="text-indigo-500" size={24} />
                                            Datos del Cliente
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Búsqueda de Usuario *</label>
                                                <div className="relative">
                                                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <select
                                                        value={form.id_usuario}
                                                        onChange={e => handleUserChange(e.target.value)}
                                                        className={cn(configUi.fieldSelect, "pl-12 h-14", formErrors.id_usuario && "border-rose-300 bg-rose-50/50")}
                                                    >
                                                        <option value="">Buscar perfil de usuario...</option>
                                                        {usuarios.map(u => (
                                                            <option key={u.id_usuario} value={u.id_usuario}>
                                                                {u.nombre_completo} ({u.documento || "Doc —"})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {formErrors.id_usuario && <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {formErrors.id_usuario}</p>}
                                                <p className="text-[10px] text-slate-400 font-medium ml-1 mt-3">Información del cliente para el registro de la venta.</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={configUi.fieldGroup}>
                                                    <label className={configUi.fieldLabel}>Fecha</label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                        <input
                                                            type="date"
                                                            value={form.fecha_venta}
                                                            onChange={e => setForm({ ...form, fecha_venta: e.target.value })}
                                                            className={cn(configUi.fieldInput, "pl-12 h-14", formErrors.fecha_venta && "border-rose-300")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className={configUi.fieldGroup}>
                                                    <label className={configUi.fieldLabel}>Método de pago</label>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                                                        <select
                                                            value={form.metodo_pago}
                                                            onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                                                            className={cn(configUi.fieldSelect, "pl-12 h-14 font-bold text-indigo-800")}
                                                        >
                                                            <option value="transferencia">Transferencia</option>
                                                            <option value="efectivo">Efectivo</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Dirección de Entrega *</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                                                    <textarea
                                                        value={form.direccion}
                                                        rows="1"
                                                        onChange={e => setForm({ ...form, direccion: e.target.value })}
                                                        placeholder="Ingrese la dirección..."
                                                        className={cn(configUi.fieldInput, "pl-12 pt-4 h-14 min-h-[56px] resize-none overflow-hidden leading-relaxed", formErrors.direccion && "border-rose-300")}
                                                    />
                                                </div>
                                            </div>

                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Teléfono de Contacto *</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={form.telefono}
                                                        onChange={e => setForm({ ...form, telefono: e.target.value.replace(/[^0-9+]/g, '') })}
                                                        placeholder="+57 3..."
                                                        className={cn(configUi.fieldInput, "pl-12 h-14", formErrors.telefono && "border-rose-300")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
                                        <h3 className="text-xl font-extrabold text-[#16315f] mb-10 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                                                <DollarSign size={20} />
                                            </div>
                                            Resumen
                                        </h3>

                                        <div className="space-y-4 relative z-10 font-bold">
                                            <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                                <span>Subtotal</span>
                                                <span className="text-slate-600 text-sm font-black">${totalEstimated.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">

                                            </div>
                                            <div className="flex justify-between items-center py-4 border-y border-slate-50 mt-4">
                                                <span className="text-sm font-black uppercase tracking-tighter text-slate-400">Total</span>
                                                <span className="text-2xl font-black tracking-tighter text-[#16315f]">${totalEstimated.toLocaleString()}</span>
                                            </div>

                                            <div className="pt-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-500">
                                                        <Clock size={16} />
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 leading-tight">Estado: <span className="text-emerald-500 italic">Entregada</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM ROW: PRODUCTS (Full Width) */}
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 ring-1 ring-slate-100/50 w-full font-bold">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-[#16315f] flex items-center gap-3">
                                            <Package className="text-indigo-500" size={24} />
                                            Productos
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-9">Artículos agregados a la venta</p>
                                    </div>
                                    <button onClick={() => setShowProductSelector(true)} type="button" className={cn(configUi.primaryButton, "h-12 bg-[#16315f] hover:bg-[#16315f]/90 shadow-lg shadow-blue-100")}>
                                        <Plus size={18} />
                                        <span>Agregar Artículos</span>
                                    </button>
                                </div>

                                <div className="overflow-hidden border border-slate-50 rounded-3xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px] tracking-widest">
                                            <tr>
                                                <th className="px-8 py-5">Item</th>
                                                <th className="px-6 py-5">Especificación</th>
                                                <th className="px-6 py-5 text-center">Cant.</th>
                                                <th className="px-6 py-5 text-right">Unitario</th>
                                                <th className="px-6 py-5 text-right">Subtotal</th>
                                                <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-slate-300">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {form.items.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3 opacity-30 grayscale saturate-0 mb-4">
                                                            <ShoppingCart size={40} strokeWidth={1} />
                                                            <p className="text-xs font-black uppercase tracking-[0.2em] italic">Sin artículos vinculados</p>
                                                        </div>
                                                        {formErrors.items && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest leading-none flex items-center justify-center gap-1.5"><AlertCircle size={12} /> {formErrors.items}</p>}
                                                    </td>
                                                </tr>
                                            ) : (
                                                form.items.map((item, idx) => (
                                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors duration-300">
                                                        <td className="px-8 py-6 font-extrabold text-[#16315f] tracking-tight">{item.nombre_producto}</td>
                                                        <td className="px-6 py-6 font-bold text-slate-500 text-xs">
                                                            {item.nombre_color} / {item.nombre_talla}
                                                        </td>
                                                        <td className="px-6 py-6 text-center font-black text-slate-700 font-mono">{item.qty}</td>
                                                        <td className="px-6 py-6 text-right font-bold text-slate-400 text-sm">${item.price.toLocaleString()}</td>
                                                        <td className="px-6 py-6 text-right font-black text-[#16315f] text-base tracking-tighter shadow-indigo-50/50">
                                                            ${(item.qty * item.price).toLocaleString()}
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    const newItems = [...form.items];
                                                                    newItems.splice(idx, 1);
                                                                    setForm({ ...form, items: newItems });
                                                                }}
                                                                className="h-10 w-10 flex items-center justify-center rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm border border-rose-100/50 opacity-100"
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

            {/* --- NOTIFICATIONS --- */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className={cn("fixed top-4 right-4 z-[1000] px-6 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-3",
                            notification.type === "success" ? "bg-[#16315f]" : "bg-rose-500")}>
                        {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
