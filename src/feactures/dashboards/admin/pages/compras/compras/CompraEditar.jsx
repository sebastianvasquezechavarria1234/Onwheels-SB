import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Search, Plus, Trash2, ArrowLeft, X, Save, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getCompraById,
    createCompra,
    updateCompra,
    getProveedores,
} from "../../services/comprasService";
import {
    getProductos,
    getColores,
    getTallas,
    getVariantes,
} from "../../services/productosServices";
import { getCategorias } from "../../services/categoriasService";

export default function CompraEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Estados Globales
    const [loading, setLoading] = useState(true);
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]); // con variantes nested
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    // Formulario Compra
    const [form, setForm] = useState({
        nit: "", // nit_proveedor
        fecha_compra: new Date().toISOString().split("T")[0],
        fecha_aproximada_entrega: "",
        estado: "Pendiente",
        items: [],
    });

    // Estados de Modales Internos
    const [modal, setModal] = useState(null); // 'selectProducto'
    const [selectedProducts, setSelectedProducts] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helpers Notificación
    const showNotification = useCallback((message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }, []);

    // Combinar productos para selección
    const combinarProductosConVariantes = (productosList = [], variantesList = []) => {
        const productoMap = new Map();
        productosList.forEach((p) => productoMap.set(p.id_producto, { ...p, variantes: [] }));
        variantesList.forEach((v) => {
            const producto = productoMap.get(v.id_producto);
            if (producto) {
                producto.variantes.push({
                    id_variante: v.id_variante,
                    id_color: v.id_color,
                    id_talla: v.id_talla,
                    stock: v.stock,
                    nombre_color: v.nombre_color,
                    nombre_talla: v.nombre_talla,
                    codigo_hex: v.codigo_hex,
                });
            }
        });
        return Array.from(productoMap.values());
    };

    // Carga Inicial
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [provs, prods, vars, cats, cols, tls] = await Promise.all([
                    getProveedores(),
                    getProductos(),
                    getVariantes(),
                    getCategorias(),
                    getColores(),
                    getTallas(),
                ]);

                setProveedores(provs || []);
                // setCategorias(cats || []); // Not needed now clearly unless creating new prod inside modal (which is implicit)
                setColores(cols || []);
                setTallas(tls || []);
                setProductos(combinarProductosConVariantes(prods || [], vars || []));

                // Si es edición, cargar la compra
                if (isEditing) {
                    const compra = await getCompraById(id);
                    setForm({
                        nit: compra.nit_proveedor || compra.nit, // handle inconsistent response safely
                        fecha_compra: compra.fecha_compra?.split("T")[0],
                        fecha_aproximada_entrega: compra.fecha_aproximada_entrega?.split("T")[0] || "",
                        estado: compra.estado,
                        items: compra.items?.map(it => ({
                            ...it,
                            qty: it.cantidad,
                            price: it.precio_unitario,
                            nombre_producto: it.nombre_producto,
                            nombre_color: it.nombre_color,
                            nombre_talla: it.nombre_talla
                        })) || [],
                    });
                }
            } catch (err) {
                console.error("Error data:", err);
                showNotification("Error cargando datos: " + (err.message || ""), "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditing, showNotification, navigate]);

    // Manejadores Formulario Principal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const updateItemField = (idx, field, value) => {
        const updated = [...form.items];
        updated[idx][field] = value;

        // REGLA: Si cambia el precio, actualizar TODOS los variantes del mismo producto
        if (field === 'price') {
            const currentItem = updated[idx];
            const targetId = currentItem.id_producto;
            const targetName = currentItem.nombre_producto; // Fallback para nuevos productos sin ID aún

            updated.forEach((item, i) => {
                if (i !== idx) {
                    // Coincidir por ID (si existe) o Nombre (si es nuevo)
                    const sameProduct = (targetId && item.id_producto === targetId) ||
                        (!targetId && item.nombre_producto === targetName);

                    if (sameProduct) {
                        item.price = value;
                    }
                }
            });
        }

        setForm(prev => ({ ...prev, items: updated }));
    };

    const removeItem = (idx) => {
        const updated = form.items.filter((_, i) => i !== idx);
        setForm(prev => ({ ...prev, items: updated }));
    };

    // ==========================================
    // Lógica Modal Selección / Creación Producto
    // ==========================================

    const openSelectModal = () => {
        setModal('selectProducto');
    };

    const closeModals = () => {
        setModal(null);
        setSelectedProducts({});
        setSearchTerm("");
    };

    // 1. Manejo Nuevo Variant Manual
    const handleProductSelectManual = (productId, checked) => {
        if (checked) {
            setSelectedProducts((prev) => ({
                ...prev,
                [productId]: { ...prev[productId], manualVariantes: [{ id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }] },
            }));
        } else {
            // Remove only manual variants? Or uncheck product entirely?
            // Simplest: Uncheck product clears manual entry intention.
            setSelectedProducts(prev => {
                const copy = { ...prev };
                delete copy[productId];
                return copy;
            });
        }
    };

    const addManualVariantLine = (productId) => {
        setSelectedProducts(prev => {
            const prod = prev[productId] || { manualVariantes: [] };
            return {
                ...prev,
                [productId]: {
                    ...prod,
                    manualVariantes: [...(prod.manualVariantes || []), { id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }]
                }
            };
        });
    };

    const updateManualVariant = (productId, idx, field, value) => {
        setSelectedProducts(prev => {
            const prod = prev[productId];
            const vars = [...prod.manualVariantes];
            vars[idx] = { ...vars[idx], [field]: value };
            return { ...prev, [productId]: { ...prod, manualVariantes: vars } };
        });
    };


    // 2. Manejo Variante Existente (Quick Add)
    const toggleExistingVariant = (product, variant) => {
        // Check if already selected
        const isSelected = selectedProducts[product.id_producto]?.existingVariantes?.some(v => v.id_variante === variant.id_variante);

        setSelectedProducts(prev => {
            const prodData = prev[product.id_producto] || { manualVariantes: [], existingVariantes: [] };
            let newExisting = prodData.existingVariantes || [];

            if (isSelected) {
                newExisting = newExisting.filter(v => v.id_variante !== variant.id_variante);
            } else {
                newExisting.push({
                    ...variant,
                    qty: 1,
                    price: product.precio_compra || 0
                });
            }

            if (newExisting.length === 0 && prodData.manualVariantes.length === 0) {
                const { [product.id_producto]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [product.id_producto]: { ...prodData, existingVariantes: newExisting }
            };
        });
    };

    const updateExistingVariantQty = (productId, variantId, field, value) => {
        setSelectedProducts(prev => {
            const prodData = prev[productId];
            const newExisting = prodData.existingVariantes.map(v =>
                v.id_variante === variantId ? { ...v, [field]: value } : v
            );
            return {
                ...prev,
                [productId]: { ...prodData, existingVariantes: newExisting }
            };
        });
    };

    const confirmSelection = () => {
        const newItems = [];
        Object.entries(selectedProducts).forEach(([pId, data]) => {
            const product = productos.find(p => p.id_producto === Number(pId));
            if (!product) return;

            // A. Existentes
            if (data.existingVariantes) {
                data.existingVariantes.forEach(v => {
                    newItems.push({
                        id_producto: product.id_producto,
                        nombre_producto: product.nombre_producto,
                        id_color: Number(v.id_color),
                        nombre_color: v.nombre_color,
                        id_talla: Number(v.id_talla),
                        nombre_talla: v.nombre_talla,
                        qty: Number(v.qty),
                        price: Number(v.price),
                        id_variante: v.id_variante, // Explicit ID
                    });
                });
            }

            // B. Manuales (Nuevos o no encontrados visualmente)
            if (data.manualVariantes) {
                data.manualVariantes.forEach(v => {
                    if (!v.id_color || !v.id_talla) return;

                    const colorObj = colores.find(c => Number(c.id_color) === Number(v.id_color));
                    const tallaObj = tallas.find(t => Number(t.id_talla) === Number(v.id_talla));

                    newItems.push({
                        id_producto: product.id_producto,
                        nombre_producto: product.nombre_producto,
                        id_color: Number(v.id_color),
                        nombre_color: colorObj?.nombre_color || "—",
                        id_talla: Number(v.id_talla),
                        nombre_talla: tallaObj?.nombre_talla || "—",
                        qty: Number(v.qty),
                        price: Number(v.price),
                        id_variante: null // Backend will find or create
                    });
                });
            }
        });

        // Merge
        setForm(prev => {
            const merged = [...prev.items];
            newItems.forEach(newItem => {
                // Check duplicate exact items to merge quantities?
                // Simplified logic: Just push all. User can edit details. 
                // Or better: merge if same Product/Color/Size
                const exists = merged.findIndex(i =>
                    i.id_producto === newItem.id_producto &&
                    i.id_color === newItem.id_color &&
                    i.id_talla === newItem.id_talla
                );
                if (exists >= 0) {
                    // Update only if price matches? Or just qty.
                    merged[exists].qty += newItem.qty;
                } else {
                    merged.push(newItem);
                }
            });
            return { ...prev, items: merged };
        });
        closeModals();
    };

    // ==========================================
    // Guardar Compra Principal
    // ==========================================
    const handleSaveCompra = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!form.nit) throw new Error("Seleccione un proveedor");
            if (form.items.length === 0) throw new Error("Agregue al menos un producto");

            const total = form.items.reduce((sum, i) => sum + (Number(i.qty) * Number(i.price)), 0);

            const payload = {
                nit_proveedor: form.nit,
                fecha_compra: form.fecha_compra,
                fecha_aproximada_entrega: form.fecha_aproximada_entrega || null,
                estado: form.estado,
                total_compra: total,
                items: form.items.map(i => ({
                    id_producto: i.id_producto,
                    nombre_producto: i.nombre_producto,
                    id_color: i.id_color,
                    id_talla: i.id_talla,
                    cantidad: Number(i.qty),
                    precio_unitario: Number(i.price),
                    descripcion: ""
                }))
            };

            if (isEditing) {
                await updateCompra(id, payload);
                showNotification("Compra actualizada correctamente", "success");
            } else {
                await createCompra(payload);
                showNotification("Compra creada correctamente", "success");
            }
            navigate("/admin/compras");
        } catch (err) {
            console.error("Error save compra:", err);
            showNotification(err.message || "Error al guardar compra", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLocked = form.estado === 'Recibida';
    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <>
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Header (Igual que antes...) */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/admin/compras")} className="p-2 bg-white rounded-full border hover:bg-gray-100">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEditing ? `Editar Compra #${id}` : "Nueva Compra"}
                        </h1>
                    </div>
                    {isLocked && (
                        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold">
                            <AlertTriangle size={18} />
                            Compra Recibida - Edición Bloqueada
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {notification.show && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`fixed top-4 center z-50 px-6 py-3 rounded-lg text-white shadow-lg ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                                }`}
                        >
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario (Igual...) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">Información General</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                <select
                                    name="nit"
                                    value={form.nit}
                                    onChange={handleInputChange}
                                    disabled={isLocked}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccione Proveedor</option>
                                    {proveedores.map(p => (
                                        <option key={p.nit || p.NIT_proveedor} value={p.nit || p.NIT_proveedor}>
                                            {p.nombre_proveedor}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Compra</label>
                                    <input
                                        type="date"
                                        name="fecha_compra"
                                        value={form.fecha_compra}
                                        onChange={handleInputChange}
                                        disabled={isLocked}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega</label>
                                    <input
                                        type="date"
                                        name="fecha_aproximada_entrega"
                                        value={form.fecha_aproximada_entrega}
                                        onChange={handleInputChange}
                                        disabled={isLocked}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                {isEditing && isLocked ? (
                                    <input type="text" value="Recibida" disabled className="w-full p-2 bg-gray-100 border rounded-lg" />
                                ) : (
                                    <select
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En tránsito">En tránsito</option>
                                        <option value="Recibida">Recibida (Finalizar)</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                )}
                                {form.estado === 'Recibida' && !isLocked && (
                                    <p className="text-xs text-orange-600 mt-1 font-medium">
                                        ⚠️ AL FINALIZAR, se sumará el stock.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate("/admin/compras")}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            {!isLocked && (
                                <button
                                    onClick={handleSaveCompra}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {isSubmitting ? "Guardando..." : "Guardar Compra"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla Items */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">Productos ({form.items.length})</h3>
                            {!isLocked && (
                                <button
                                    onClick={openSelectModal}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Agregar Producto
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-3 rounded-l-lg">Producto</th>
                                        <th className="p-3">Info</th>
                                        <th className="p-3 text-center">Cant</th>
                                        <th className="p-3 text-center">Costo Unit.</th>
                                        <th className="p-3 text-right">Subtotal</th>
                                        <th className="p-3 rounded-r-lg"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {form.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium">{item.nombre_producto}</td>
                                            <td className="p-3 text-gray-500 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.codigo_hex || 'transparent' }}></span>
                                                    {item.nombre_color} / {item.nombre_talla}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={(e) => updateItemField(idx, 'qty', e.target.value)}
                                                    disabled={isLocked}
                                                    className="w-16 p-1 border rounded text-center"
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => updateItemField(idx, 'price', e.target.value)}
                                                    disabled={isLocked}
                                                    className="w-20 p-1 border rounded text-center"
                                                />
                                            </td>
                                            <td className="p-3 text-right font-bold">
                                                ${(item.qty * item.price).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right">
                                                {!isLocked && (
                                                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {form.items.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-400 italic">
                                                No hay productos agregados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className="font-medium text-gray-600">Total Compra Estimado</span>
                            <span className="text-2xl font-bold text-gray-800">
                                ${form.items.reduce((s, i) => s + (i.qty * i.price), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Mejorado */}
            <AnimatePresence>
                {modal === 'selectProducto' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden"
                        >
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Seleccionar Productos</h2>
                                    <p className="text-xs text-gray-500">Seleccione variantes existentes o cree nuevas combinaciones.</p>
                                </div>
                                <button onClick={closeModals}><X size={20} className="text-gray-500" /></button>
                            </div>

                            <div className="p-4 border-b bg-white">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre de producto..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                                {productos
                                    .filter(p => p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .slice(0, 50)
                                    .map(p => {
                                        const isProdSelected = !!selectedProducts[p.id_producto];
                                        return (
                                            <div key={p.id_producto} className={`bg-white border rounded-xl shadow-sm transition-all overflow-hidden ${isProdSelected ? 'ring-1 ring-blue-500' : ''}`}>
                                                <div className="p-4 flex items-start gap-4">
                                                    <div className={`p-3 rounded-lg ${isProdSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        <Package size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-800 text-lg">{p.nombre_producto}</h4>
                                                        <p className="text-sm text-gray-500 mb-3">{p.descripcion || "Sin descripción"}</p>

                                                        {/* Sección Variantes Existentes */}
                                                        {p.variantes.length > 0 && (
                                                            <div className="mb-4">
                                                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Variantes Existentes (Click para agregar)</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {p.variantes.map(v => {
                                                                        const isSelected = selectedProducts[p.id_producto]?.existingVariantes?.some(ev => ev.id_variante === v.id_variante);
                                                                        return (
                                                                            <button
                                                                                key={v.id_variante}
                                                                                onClick={() => toggleExistingVariant(p, v)}
                                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${isSelected
                                                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                                                                                    }`}
                                                                            >
                                                                                <span className="w-2 h-2 rounded-full bg-white border" style={{ backgroundColor: isSelected ? 'white' : v.codigo_hex }}></span>
                                                                                <span>{v.nombre_color} / {v.nombre_talla}</span>
                                                                                {isSelected && <CheckCircle size={14} />}
                                                                            </button>
                                                                        )
                                                                    })}
                                                                </div>
                                                                {/* Campos Cantidad para seleccionados */}
                                                                {selectedProducts[p.id_producto]?.existingVariantes?.length > 0 && (
                                                                    <div className="mt-3 bg-blue-50 p-3 rounded-lg space-y-2">
                                                                        {selectedProducts[p.id_producto].existingVariantes.map(ev => (
                                                                            <div key={ev.id_variante} className="flex justify-between items-center text-sm">
                                                                                <span className="font-medium text-blue-900">{ev.nombre_color} - {ev.nombre_talla}</span>
                                                                                <div className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="number"
                                                                                        className="w-16 p-1 rounded border text-center text-xs"
                                                                                        placeholder="Cant"
                                                                                        value={ev.qty}
                                                                                        onChange={(e) => updateExistingVariantQty(p.id_producto, ev.id_variante, 'qty', e.target.value)}
                                                                                    />
                                                                                    <input
                                                                                        type="number"
                                                                                        className="w-20 p-1 rounded border text-center text-xs"
                                                                                        placeholder="Precio"
                                                                                        value={ev.price}
                                                                                        onChange={(e) => updateExistingVariantQty(p.id_producto, ev.id_variante, 'price', e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Sección Nueva Variante Manual */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`manual-${p.id_producto}`}
                                                                    checked={!!(selectedProducts[p.id_producto]?.manualVariantes?.length > 0)}
                                                                    onChange={(e) => e.target.checked ? addManualVariantLine(p.id_producto) : handleProductSelectManual(p.id_producto, false)}
                                                                    className="w-4 h-4 text-blue-600 rounded"
                                                                />
                                                                <label htmlFor={`manual-${p.id_producto}`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                                    Crear nueva variante (Color/Talla personalizada)
                                                                </label>
                                                            </div>

                                                            {selectedProducts[p.id_producto]?.manualVariantes?.length > 0 && (
                                                                <div className="pl-6 space-y-2">
                                                                    {selectedProducts[p.id_producto].manualVariantes.map((mv, idx) => (
                                                                        <div key={idx} className="flex gap-2 items-center flex-wrap">
                                                                            <select
                                                                                value={mv.id_color}
                                                                                onChange={e => updateManualVariant(p.id_producto, idx, 'id_color', e.target.value)}
                                                                                className="p-1.5 border rounded text-sm w-32"
                                                                            >
                                                                                <option value="">Color...</option>
                                                                                {colores.map(c => <option key={c.id_color} value={c.id_color}>{c.nombre_color}</option>)}
                                                                            </select>
                                                                            <select
                                                                                value={mv.id_talla}
                                                                                onChange={e => updateManualVariant(p.id_producto, idx, 'id_talla', e.target.value)}
                                                                                className="p-1.5 border rounded text-sm w-24"
                                                                            >
                                                                                <option value="">Talla...</option>
                                                                                {tallas.map(t => <option key={t.id_talla} value={t.id_talla}>{t.nombre_talla}</option>)}
                                                                            </select>
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Cant"
                                                                                value={mv.qty}
                                                                                onChange={e => updateManualVariant(p.id_producto, idx, 'qty', e.target.value)}
                                                                                className="w-16 p-1.5 border rounded text-sm"
                                                                            />
                                                                            <input
                                                                                type="number"
                                                                                placeholder="Precio"
                                                                                value={mv.price}
                                                                                onChange={e => updateManualVariant(p.id_producto, idx, 'price', e.target.value)}
                                                                                className="w-20 p-1.5 border rounded text-sm"
                                                                            />
                                                                            {idx === (selectedProducts[p.id_producto].manualVariantes.length - 1) && (
                                                                                <button onClick={() => addManualVariantLine(p.id_producto)} className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 rounded hover:bg-blue-100">+ Otro</button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                {productos.length === 0 && <div className="text-center py-10 text-gray-400">No hay productos disponibles.</div>}
                            </div>

                            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                                <button onClick={closeModals} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancelar</button>
                                <button
                                    onClick={confirmSelection}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm"
                                >
                                    Confirmar Selección
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
