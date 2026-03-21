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
import { configUi } from "../../configuracion/configUi";
import ProductSelectorView from "../../compras/compras/ProductSelectorView";
import { useToast } from "../../../../../../context/ToastContext";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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
        <div className={configUi.pageShell}>
            <AnimatePresence mode="wait">
                {showProductSelector ? (
                    <ProductSelectorView
                        key="product-selector"
                        allProducts={productos}
                        onAdd={(data) => {
                            const { product, variant, cantidad, precio_unitario } = data;
                            const newItem = {
                                id_producto: product.id_producto,
                                nombre_producto: product.nombre_producto,
                                id_variante: variant.id_variante || variant.id_producto_variante,
                                id_color: variant.id_color,
                                nombre_color: variant.nombre_color || variant.color || 'Unico',
                                id_talla: variant.id_talla,
                                nombre_talla: variant.nombre_talla || variant.talla || 'Unica',
                                qty: cantidad,
                                price: precio_unitario,
                                stockMax: variant.stock || variant.stock_actual || 0
                            };
                            setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                            showNotification("Producto añadido con éxito", "success");
                            setShowProductSelector(false);
                        }}
                        onClose={() => setShowProductSelector(false)}
                    />
                ) : (
                    <motion.div key="venta-form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col h-full min-h-0">
                        {/* Header Row */}
                        <div className={configUi.headerRow + " mb-6"}>
                            <div className={configUi.titleWrap}>
                                <button
                                    onClick={() => navigate(`${basePath}/ventas`)}
                                    className={configUi.iconButton + " w-10 h-10 rounded-xl"}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className={configUi.title}>{isEditing ? `Editar Venta #${id}` : "Nueva Venta Directa"}</h1>
                                <span className={configUi.countBadge}>ESTADO: {form.estado.toUpperCase()}</span>
                            </div>

                            <div className={configUi.toolbar}>
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

                        {/* Main Content Grid */}
                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden min-h-0">
                            
                            {/* Left: Client Data */}
                            <div className="xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                                <div className={configUi.formSection + " space-y-6"}>
                                    <h3 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                                       <User className="text-indigo-500" size={14} /> Datos del Cliente
                                    </h3>
                                    
                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Búsqueda de Usuario *</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <select
                                                value={form.id_usuario}
                                                onChange={e => handleUserChange(e.target.value)}
                                                className={cn(configUi.fieldSelect, "pl-11", formErrors.id_usuario && "border-rose-400")}
                                            >
                                                <option value="">Buscar perfil de usuario...</option>
                                                {usuarios.map(u => (
                                                    <option key={u.id_usuario} value={u.id_usuario}>
                                                        {u.nombre_completo} ({u.documento || "Doc —"})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                              <ChevronDown size={18} />
                                            </div>
                                        </div>
                                        {formErrors.id_usuario && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{formErrors.id_usuario}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Teléfono de Contacto *</label>
                                            <div className="relative">
                                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                               <input
                                                   type="text"
                                                   value={form.telefono}
                                                   onChange={e => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                   placeholder="+57 3..."
                                                   className={cn(configUi.fieldInput, "pl-12 h-14", formErrors.telefono && "border-rose-300")}
                                               />
                                            </div>
                                        </div>
                                        <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Método</label>
                                            <select
                                                value={form.metodo_pago}
                                                onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                                                className={configUi.fieldSelect}
                                            >
                                                <option value="transferencia">Transferencia</option>
                                                <option value="efectivo">Efectivo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Dirección de Entrega *</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 text-slate-400" size={16} />
                                            <textarea
                                                value={form.direccion}
                                                onChange={e => setForm({ ...form, direccion: e.target.value })}
                                                placeholder="Dirección completa..."
                                                className={cn(configUi.fieldTextarea, "pl-11 h-20 pt-4", formErrors.direccion && "border-rose-400")}
                                            />
                                        </div>
                                        {formErrors.direccion && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{formErrors.direccion}</p>}
                                    </div>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Teléfono *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={form.telefono}
                                                onChange={e => setForm({ ...form, telefono: e.target.value })}
                                                placeholder="Número de contacto..."
                                                className={cn(configUi.fieldInput, "pl-11", formErrors.telefono && "border-rose-400")}
                                            />
                                        </div>
                                        {formErrors.telefono && <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{formErrors.telefono}</p>}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowProductSelector(true)}
                                    className="w-full flex flex-col items-center justify-center gap-4 py-8 rounded-[1.6rem] border-2 border-dashed border-[#bfd1f4] bg-white group hover:bg-[#f0f6ff] transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#edf5ff] flex items-center justify-center text-[#1d4f91] group-hover:scale-110 transition-transform">
                                      <Plus size={20} />
                                    </div>
                                    <div className="text-center">
                                       <p className="text-sm font-black text-[#16315f] uppercase tracking-tight">Agregar Productos</p>
                                       <p className="text-[9px] font-bold text-[#6b84aa] mt-1">Abrir Catálogo de Artículos</p>
                                    </div>
                                </button>
                                {formErrors.items && <p className="text-center text-xs font-bold text-rose-500">{formErrors.items}</p>}
                            </div>

                            {/* Right: Items List Table */}
                            <div className="xl:col-span-8 flex flex-col overflow-hidden min-h-0">
                                <div className={configUi.tableCard}>
                                    <div className="px-6 py-4 border-b border-[#d7e5f8] flex justify-between items-center bg-[#fbfdff]/50">
                                        <span className={configUi.modalEyebrow}>Carrito de Venta</span>
                                        <span className={configUi.subtlePill}>{form.items.length} Artículos</span>
                                    </div>
                                    
                                    <div className={configUi.tableScroll}>
                                        <table className={configUi.table}>
                                            <thead className={configUi.thead}>
                                                <tr>
                                                    <th className={configUi.th}>Producto / Especificación</th>
                                                    <th className={configUi.th + " text-center"}>Cant.</th>
                                                    <th className={configUi.th + " text-right"}>Precio Unit.</th>
                                                    <th className={configUi.th + " text-right"}>Subtotal</th>
                                                    <th className={configUi.th + " w-16"}></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#d7e5f8]">
                                                {form.items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className={configUi.emptyState + " py-24"}>
                                                            <div className="space-y-3 opacity-30 flex flex-col items-center">
                                                                <ShoppingCart size={48} />
                                                                <p className="text-xs font-black uppercase tracking-widest">Sin artículos vinculados</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    form.items.map((item, idx) => (
                                                        <tr key={idx} className={configUi.row}>
                                                            <td className={configUi.td}>
                                                                <div className="flex flex-col">
                                                                   <span className="font-bold uppercase tracking-tight truncate max-w-[200px]">{item.nombre_producto}</span>
                                                                   <span className="text-[10px] text-indigo-400 font-black uppercase">{item.nombre_color} / {item.nombre_talla}</span>
                                                                </div>
                                                            </td>
                                                            <td className={configUi.td + " text-center"}>
                                                                <span className={configUi.subtlePill}>x{item.qty}</span>
                                                            </td>
                                                            <td className={configUi.td + " text-right font-bold text-slate-400 tabular-nums"}>
                                                                ${Number(item.price).toLocaleString('es-CO')}
                                                            </td>
                                                            <td className={configUi.td + " text-right font-black text-[#16315f] tabular-nums"}>
                                                                ${(item.qty * item.price).toLocaleString('es-CO')}
                                                            </td>
                                                            <td className={configUi.td + " text-right"}>
                                                                <button
                                                                    onClick={() => {
                                                                        const newItems = [...form.items];
                                                                        newItems.splice(idx, 1);
                                                                        setForm({ ...form, items: newItems });
                                                                    }}
                                                                    className={configUi.actionDangerButton}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="mt-auto px-6 py-5 border-t border-[#d7e5f8] bg-[#fbfdff] flex justify-end gap-10">
                                       <div className="flex flex-col items-end">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MONTO TOTAL A RECAUDAR</p>
                                          <p className="text-2xl font-black text-[#16315f] tabular-nums">${Number(totalEstimated).toLocaleString('es-CO')}</p>
                                       </div>
                                    </div>
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
