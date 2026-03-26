import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Save, Plus, Trash2, Package, ChevronLeft, Calendar, User, Search, Info, Archive, ShoppingBag, ChevronRight, ArrowLeft,
    PlusCircle, AlertTriangle, ChevronDown, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";
import { getVariantes } from "../../services/productosServices";
import { ProductSelectorView } from "./ProductSelectorView";
import { cn, configUi } from "../../configuracion/configUi";
import { useToast } from "../../../../../../context/ToastContext";

const CompraEditar = () => {
    const toast = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const isEditing = !!id;

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
    
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    const showNotification = useCallback((message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }, []);

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
                            stock_actual: v.stock || v.stock_actual || 0,
                            nombre_color: v.nombre_color || v.color || "Unico",
                            nombre_talla: v.nombre_talla || v.talla || "Unica",
                            codigo_hex: v.codigo_hex,
                        });
                    }
                }
            });
        }
        return Array.from(productoMap.values());
    };

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [provRes, prodRes, varRes] = await Promise.all([
                comprasService.getProveedores(),
                comprasService.getProductos({ limit: 1000 }),
                getVariantes()
            ]);
            
            setProveedores(Array.isArray(provRes) ? provRes : []);
            
            const rawProducts = Array.isArray(prodRes?.productos) ? prodRes.productos : Array.isArray(prodRes) ? prodRes : [];
            setAllProducts(combinarProductosConVariantes(rawProducts, varRes || []));

            if (isEditing) {
                const data = await comprasService.getCompraById(id);
                setPurchase({
                    nit_proveedor: data.nit_proveedor || "",
                    fecha_compra: data.fecha_compra?.split('T')[0] || new Date().toISOString().split('T')[0],
                    total_compra: data.total_compra || 0
                });
                setItems(data.items?.map(it => ({
                    ...it,
                    nombre_variante: `${it.nombre_color || ''} ${it.nombre_talla || ''}`.trim() || 'Referencia Única',
                    subtotal: Number(it.cantidad) * Number(it.precio_unitario)
                })) || []);
            }
        } catch (err) {
            console.error("Error loading data:", err);
            showNotification("Fallo al cargar catálogos del sistema", "error");
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
        if (!purchase.nit_proveedor) newErrors.nit_proveedor = "Seleccione un proveedor";
        if (!purchase.fecha_compra) newErrors.fecha_compra = "Requerido";
        if (items.length === 0) newErrors.items = "Debe añadir al menos un producto";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!purchase.nit_proveedor) {
            showNotification("Selecciona un proveedor", "error");
            return;
        }
        if (items.length === 0) {
            toast.error("Añade al menos un producto");
            showNotification("Añade al menos un producto", "error");
            return;
        }

        // Validar fecha de compra (no futura)
        if (purchase.fecha_compra) {
          const buyDate = new Date(purchase.fecha_compra);
          const today = new Date();
          if (buyDate > today) {
            toast.error("La fecha de compra no puede ser futura.");
            return;
          }
        }

        setSaving(true);
        try {
            const payload = { 
                nit_proveedor: purchase.nit_proveedor,
                fecha_compra: purchase.fecha_compra,
                total_compra: purchase.total_compra,
                items: items.map(item => ({
                    id_producto: item.id_producto,
                    id_variante: item.id_variante,
                    id_color: item.id_color,
                    id_talla: item.id_talla,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    subtotal: item.subtotal
                }))
            };
            
            if (isEditing) {
                await comprasService.updateCompra(id, payload);
                showNotification("Registro actualizado correctamente");
            } else {
                await comprasService.createCompra(payload);
                showNotification("Compra registrada con éxito");
            }
            setTimeout(() => navigate(`${basePath}/compras`), 1000);
        } catch (err) {
            const msg = err?.response?.data?.mensaje || "Error al completar el registro";
            toast.error(msg);
            showNotification(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col h-full bg-white items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
            <p className="text-[10px] font-black text-[#16315f] uppercase tracking-widest">Sincronizando Sistema...</p>
        </div>
    );

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
                                nombre_variante: `${variant.nombre_color || variant.color || ''} ${variant.nombre_talla || variant.talla || ''}`.trim() || 'Referencia Única',
                                cantidad: cantidad,
                                precio_unitario: precio_unitario,
                                subtotal: cantidad * precio_unitario,
                                imagen: product.imagen || product.url_imagen || (product.imagenes && product.imagenes[0]?.url_imagen) || null
                            };
                            const newItems = [...items, newItem];
                            setItems(newItems);
                            setPurchase(prev => ({ ...prev, total_compra: calculateTotal(newItems) }));
                            showNotification("Item vinculado a la orden");
                            setShowProductSelector(false);
                        }}
                    />
                ) : (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex flex-col h-full min-h-0"
                    >
                        {/* Header Row */}
                        <div className={configUi.headerRow + " mb-6"}>
                            <div className={configUi.titleWrap}>
                                <button
                                    onClick={() => navigate(`${basePath}/compras`)}
                                    className={configUi.iconButton + " w-10 h-10 rounded-xl"}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className={configUi.title}>{isEditing ? `Modificar Compra #${id}` : "Nueva Compra"}</h1>
                                <span className={configUi.countBadge}>ESTADO: {isEditing ? "AJUSTE" : "EN CURSO"}</span>
                            </div>

                            <div className={configUi.toolbar}>
                                <div className="px-6 border-r border-[#d7e5f8] flex flex-col items-end">
                                    <p className="text-[9px] font-black text-[#6b84aa] uppercase tracking-widest leading-none mb-1">TOTAL LIQUIDADO</p>
                                    <span className="text-xl font-black text-[#16315f] tabular-nums">
                                        ${Number(purchase.total_compra).toLocaleString('es-CO')}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || items.length === 0}
                                    className={configUi.primaryButton}
                                >
                                    {saving ? <div className="w-5 h-5 rounded-full border-4 border-white/40 border-t-white animate-spin" /> : <Save size={18} />}
                                    {isEditing ? "Confirmar Cambios" : "Finalizar Registro"}
                                </button>
                            </div>
                        </div>

                        {/* Main Grid Content */}
                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-hidden min-h-0">
                            
                            {/* Left: General Info */}
                            <div className="xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                                <div className={configUi.formSection + " space-y-6"}>
                                    <h3 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                                       <Info size={14} className="text-indigo-500" /> Datos de la Transacción
                                    </h3>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Proveedor Autorizado *</label>
                                        <div className="relative">
                                            <Archive className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <select
                                                value={purchase.nit_proveedor}
                                                onChange={(e) => setPurchase(prev => ({ ...prev, nit_proveedor: e.target.value }))}
                                                className={cn(configUi.fieldSelect, "pl-11 pr-10", errors.nit_proveedor && "border-rose-400 bg-rose-50/30")}
                                            >
                                                <option value="">Seleccionar Proveedor...</option>
                                                {proveedores.map(p => (
                                                    <option key={p.nit || p.id_proveedor} value={p.nit || p.id_proveedor}>
                                                        {p.nombre_empresa || p.nombre_proveedor}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                              <ChevronDown size={18} />
                                            </div>
                                        </div>
                                        {errors.nit_proveedor && <p className="text-[10px] text-rose-500 mt-1 font-bold italic">{errors.nit_proveedor}</p>}
                                    </div>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Fecha Contable</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="date"
                                                value={purchase.fecha_compra}
                                                onChange={(e) => setPurchase(prev => ({ ...prev, fecha_compra: e.target.value }))}
                                                className={cn(configUi.fieldInput, "pl-11")}
                                            />
                                        </div>
                                        {errors.fecha_compra && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.fecha_compra}</p>}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowProductSelector(true)}
                                    className="w-full flex flex-col items-center justify-center gap-4 py-8 rounded-[1.6rem] border-2 border-dashed border-[#bfd1f4] bg-white group hover:bg-[#f0f6ff] hover:border-[#7da7e8] transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#edf5ff] flex items-center justify-center text-[#1d4f91] group-hover:scale-110 transition-transform shadow-sm">
                                      <PlusCircle size={22} />
                                    </div>
                                    <div className="text-center">
                                       <p className="text-sm font-black text-[#16315f] uppercase tracking-tight">Agregar Producto</p>
                                       <p className="text-[10px] text-[#6b84aa] mt-1 font-bold">Seleccionar del catálogo</p>
                                    </div>
                                </button>
                                {errors.items && <p className="text-center text-xs font-bold text-rose-500 mt-2">{errors.items}</p>}
                            </div>

                            {/* Right: Items List Table */}
                            <div className="xl:col-span-8 flex flex-col overflow-hidden min-h-0">
                                <div className={configUi.tableCard}>
                                    <div className="px-6 py-4 border-b border-[#d7e5f8] flex justify-between items-center bg-[#fbfdff]/50">
                                        <span className={configUi.modalEyebrow}>Sincronización de Stock</span>
                                        <span className={configUi.subtlePill}>{items.length} Referencias</span>
                                    </div>
                                    
                                    <div className={configUi.tableScroll}>
                                        <table className={configUi.table}>
                                            <thead className={configUi.thead}>
                                                <tr>
                                                    <th className={configUi.th}>Producto / Variante</th>
                                                    <th className={configUi.th + " text-center"}>Cant.</th>
                                                    <th className={configUi.th + " text-right"}>Costo Un.</th>
                                                    <th className={configUi.th + " text-right"}>Subtotal</th>
                                                    <th className={configUi.th + " w-16"}></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#d7e5f8]">
                                                {items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className={configUi.emptyState + " py-20"}>
                                                            <div className="space-y-3 opacity-30 flex flex-col items-center">
                                                                <ShoppingBag size={48} />
                                                                <p className="text-xs font-black uppercase tracking-widest leading-none">Canasta Vacía</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    items.map((item, idx) => (
                                                        <tr key={idx} className={configUi.row}>
                                                            <td className={configUi.td}>
                                                                <div className="flex flex-col">
                                                                   <span className="font-bold uppercase leading-tight truncate max-w-[200px] text-[#16315f]">{item.nombre_producto}</span>
                                                                   <span className="text-[10px] text-indigo-400 font-black tracking-tighter uppercase">{item.nombre_variante}</span>
                                                                </div>
                                                            </td>
                                                            <td className={configUi.td + " text-center"}>
                                                                <span className={configUi.subtlePill}>x{item.cantidad}</span>
                                                            </td>
                                                            <td className={configUi.td + " text-right font-bold text-slate-400 tabular-nums"}>
                                                                ${Number(item.precio_unitario).toLocaleString('es-CO')}
                                                            </td>
                                                            <td className={configUi.td + " text-right font-black text-[#16315f] tabular-nums"}>
                                                                ${Number(item.subtotal).toLocaleString('es-CO')}
                                                            </td>
                                                            <td className={configUi.td + " text-right"}>
                                                                <button
                                                                    onClick={() => removeItem(idx)}
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
                                    
                                    <div className="mt-auto px-6 py-6 border-t border-[#d7e5f8] bg-[#fbfdff] flex justify-between items-center">
                                       <div className="flex items-center gap-2 text-emerald-600">
                                          <CheckCircle size={18} />
                                          <span className="text-[10px] font-black uppercase tracking-widest">Liquidación Verificada</span>
                                       </div>
                                       <div className="flex flex-col items-end">
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto de Operación</p>
                                          <p className="text-2xl font-black text-[#16315f] tabular-nums">${Number(purchase.total_compra).toLocaleString('es-CO')}</p>
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
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0 }} 
                  className={cn(
                    "fixed top-4 right-4 z-[1000] px-6 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-3",
                    notification.type === "success" ? "bg-[#16315f]" : "bg-rose-500"
                  )}
                >
                  {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  <span className="tracking-tight">{notification.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
    );
};

export default CompraEditar;
