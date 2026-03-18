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
