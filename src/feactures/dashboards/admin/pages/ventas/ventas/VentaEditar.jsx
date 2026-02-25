
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Search, Plus, Trash2, ArrowLeft, X, Save, CheckCircle, Package, User, DollarSign, AlertTriangle } from "lucide-react";
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

export default function VentaEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    // Estados Globales
    const [loading, setLoading] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]); // con variantes nested
    const [colores, setColores] = useState([]);
    const [tallas, setTallas] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    // Formulario Venta
    const [form, setForm] = useState({
        id_cliente: "",
        id_usuario: "",
        direccion: "",
        telefono: "",
        fecha_venta: new Date().toISOString().split("T")[0],
        metodo_pago: "Efectivo",
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
                const [usrs, clis, prods, vars, cols, tls] = await Promise.all([
                    getUsuarios(),
                    getClientes(),
                    getProductos(),
                    getVariantes(),
                    getColores(),
                    getTallas(),
                ]);

                setUsuarios(usrs || []);
                setClientes(clis || []);
                setColores(cols || []);
                setTallas(tls || []);
                setProductos(combinarProductosConVariantes(prods || [], vars || []));

                // Si es edición, cargar la venta
                if (isEditing) {
                    const venta = await getVentaById(id);
                    // Buscar datos extra del cliente si falta
                    const foundClient = (clis || []).find(c => c.id_cliente === venta.id_cliente);

                    setForm({
                        id_cliente: venta.id_cliente || "",
                        id_usuario: venta.id_usuario || foundClient?.id_usuario || "",
                        direccion: venta.direccion_envio || foundClient?.direccion_envio || "",
                        telefono: venta.telefono || foundClient?.telefono_contacto || "",
                        fecha_venta: venta.fecha_venta?.split("T")[0],
                        metodo_pago: venta.metodo_pago || "Efectivo",
                        estado: venta.estado || "Pendiente",
                        items: venta.items ? venta.items.map(it => ({
                            ...it,
                            qty: it.cantidad,
                            price: it.precio_unitario, // Precio histórico
                            nombre_producto: it.nombre_producto,
                            nombre_color: it.nombre_color || "—",
                            nombre_talla: it.nombre_talla || "—",
                            id_variante: it.id_variante
                        })) : [],
                    });
                }
            } catch (err) {
                console.error("Error cargando datos:", err);
                showNotification("Error al cargar datos", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isEditing, id, showNotification]);

    // Handle User Selection Change
    const handleUserChange = (userId) => {
        const selectedId = Number(userId);
        // Buscar si existe cliente asociado
        const existingClient = clientes.find(c => c.id_usuario === selectedId);

        if (existingClient) {
            setForm(prev => ({
                ...prev,
                id_cliente: existingClient.id_cliente,
                id_usuario: selectedId,
                direccion: existingClient.direccion_envio || "",
                telefono: existingClient.telefono_contacto || ""
            }));
            showNotification("Datos de cliente cargados", "success");
        } else {
            // Usuario sin cliente, resetear campos para llenar
            setForm(prev => ({
                ...prev,
                id_cliente: "",
                id_usuario: selectedId,
                direccion: "",
                telefono: ""
            }));
            if (userId) showNotification("Usuario nuevo. Complete los datos.", "success");
        }
    };

    // ==== Lógica del Modal de Selección de Productos ====

    const openProductModal = () => {
        // Inicializar selectedProducts con items actuales
        const initial = {};
        form.items.forEach(it => {
            if (!initial[it.id_producto]) initial[it.id_producto] = { variantes: [] };
            initial[it.id_producto].variantes.push({
                id_variante: it.id_variante,
                qty: it.qty,
                price: it.price // Visual only
            });
        });
        setSelectedProducts(initial);
        setModal("selectProducto");
    };

    const handleProductSelect = (productId, checked) => {
        if (checked) {
            // Al marcar, agregar una variante vacía (o la primera disponible)
            const prod = productos.find(p => p.id_producto === productId);
            if (!prod || !prod.variantes.length) return; // No se puede seleccionar si no tiene variantes

            setSelectedProducts(prev => ({
                ...prev,
                [productId]: {
                    variantes: [{
                        id_variante: null, // Select variante logic
                        qty: 1,
                        price: prod.precio_venta || 0
                    }]
                }
            }));
        } else {
            setSelectedProducts(prev => {
                const { [productId]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const addVariantRow = (productId) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: {
                variantes: [...(prev[productId]?.variantes || []), { id_variante: null, qty: 1, price: 0 }]
            }
        }));
    };

    const removeVariantRow = (productId, idx) => {
        setSelectedProducts(prev => {
            const prod = { ...prev[productId] };
            const newVars = [...prod.variantes];
            newVars.splice(idx, 1);
            if (newVars.length === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: { ...prod, variantes: newVars } };
        });
    };

    const updateVariantRow = (productId, idx, field, value) => {
        setSelectedProducts(prev => {
            const prod = { ...prev[productId] };
            const newVars = [...prod.variantes];
            newVars[idx] = { ...newVars[idx], [field]: value };

            // Si elige variante, actualizar precio automáticamente desde el producto (visual)
            if (field === "id_variante") {
                const p = productos.find(x => x.id_producto === productId);
                if (p) newVars[idx].price = p.precio_venta;
            }

            return { ...prev, [productId]: { ...prod, variantes: newVars } };
        });
    };

    const saveSelectedProducts = () => {
        const newItems = [];
        for (const [prodId, data] of Object.entries(selectedProducts)) {
            const product = productos.find(p => p.id_producto === Number(prodId));
            if (!product) continue;

            for (const v of data.variantes) {
                if (!v.id_variante) continue; // Skip incomplete
                const realVariant = product.variantes.find(rv => rv.id_variante === Number(v.id_variante));
                if (!realVariant) continue;

                newItems.push({
                    id_producto: product.id_producto,
                    nombre_producto: product.nombre_producto,
                    id_variante: realVariant.id_variante,
                    id_color: realVariant.id_color,
                    nombre_color: realVariant.nombre_color,
                    id_talla: realVariant.id_talla,
                    nombre_talla: realVariant.nombre_talla,
                    qty: Number(v.qty),
                    price: Number(product.precio_venta), // Visual mainly
                    stockMax: realVariant.stock
                });
            }
        }
        setForm(prev => ({ ...prev, items: newItems }));
        setModal(null);
    };

    // ==== Submit ====
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validaciones Finales Frontend
        if (!form.id_usuario) return showNotification("Seleccione un Usuario / Cliente", "error");
        if (form.items.length === 0) return showNotification("Agregue al menos un producto", "error");
        if (!form.direccion || !form.telefono) return showNotification("Complete dirección y teléfono", "error");

        setIsSubmitting(true);
        try {
            const payload = isEditing ? {
                // Para edición, enviar id_cliente directamente
                id_cliente: form.id_cliente,
                fecha_venta: form.fecha_venta,
                metodo_pago: form.metodo_pago,
                direccion: form.direccion,
                telefono: form.telefono,
                items: form.items.map(it => ({
                    id_variante: it.id_variante,
                    cantidad: it.qty
                }))
            } : {
                // Para creación, enviar id_usuario
                id_usuario: form.id_usuario,
                fecha_venta: form.fecha_venta,
                metodo_pago: form.metodo_pago,
                direccion: form.direccion,
                telefono: form.telefono,
                items: form.items.map(it => ({
                    id_variante: it.id_variante,
                    cantidad: it.qty
                }))
            };

            if (isEditing) {
                await updateVenta(id, payload);
                showNotification("Venta actualizada correctamente", "success");
            } else {
                await createVenta(payload);
                showNotification("Venta creada exitosamente", "success");
            }
            // Navegar atrás tras éxito
            setTimeout(() => navigate("/admin/ventas"), 1000);
        } catch (err) {
            console.error(err);
            showNotification(err?.response?.data?.mensaje || "Error al guardar venta", "error");
            setIsSubmitting(false);
        }
    };

    // Filtros de Modal
    const filteredProducts = productos.filter(p =>
        p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header Page */}
                <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/admin/ventas")} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{isEditing ? `Editar Venta #${id}` : "Nueva Venta"}</h1>
                            <p className="text-sm text-gray-500">
                                {isEditing ? "Modifique los items o datos de la venta." : "Registre una venta, el usuario será promovido a cliente automáticamente."}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/ventas")}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <Save size={18} />
                            {isSubmitting ? "Guardando..." : "Guardar Venta"}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto w-full p-6 space-y-6">

                    {/* Sección Cliente */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="text-blue-500" size={20} />
                            Datos del Cliente
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario / Cliente *</label>
                                <select
                                    value={form.id_usuario}
                                    onChange={e => handleUserChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Seleccione un usuario...</option>
                                    {usuarios.map(u => (
                                        <option key={u.id_usuario} value={u.id_usuario}>
                                            {u.nombre_completo} ({u.documento || "Sin Doc"}) - {u.email}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Si el usuario no es cliente, se le asignará el rol automáticamente.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={form.fecha_venta}
                                        onChange={e => setForm({ ...form, fecha_venta: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Método Pago</label>
                                    <select
                                        value={form.metodo_pago}
                                        onChange={e => setForm({ ...form, metodo_pago: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                                    >
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="Transferencia">Transferencia</option>
                                    </select>
                                </div>
                            </div>
                            {/* N U E V O S   C A M P O S */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Envío *</label>
                                    <input
                                        type="text"
                                        value={form.direccion}
                                        onChange={e => setForm({ ...form, direccion: e.target.value })}
                                        placeholder="Dirección completa"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Contacto *</label>
                                    <input
                                        type="text"
                                        value={form.telefono}
                                        onChange={e => setForm({ ...form, telefono: e.target.value })}
                                        placeholder="Ej: +57 300..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección Productos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Package className="text-blue-500" size={20} />
                                Productos
                            </h2>
                            <button
                                onClick={openProductModal}
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-sm"
                            >
                                <Plus size={16} />
                                Agregar Productos
                            </button>
                        </div>

                        {/* Listado Items */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Variante</th>
                                        <th className="px-4 py-3 text-right">Cant.</th>
                                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {form.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-400 italic">
                                                No hay productos seleccionados.
                                            </td>
                                        </tr>
                                    ) : (
                                        form.items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{item.nombre_producto}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {item.nombre_color} / {item.nombre_talla}
                                                </td>
                                                <td className="px-4 py-3 text-right">{item.qty}</td>
                                                <td className="px-4 py-3 text-right">${item.price.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-800">
                                                    ${(item.qty * item.price).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...form.items];
                                                            newItems.splice(idx, 1);
                                                            setForm({ ...form, items: newItems });
                                                        }}
                                                        className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-right text-gray-600">TOTAL ESTIMADO:</td>
                                        <td className="px-4 py-3 text-right text-lg text-blue-700">
                                            ${form.items.reduce((acc, it) => acc + (it.qty * it.price), 0).toLocaleString()}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Notificación Flotante */}
                <AnimatePresence>
                    {notification.show && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium z-50 flex items-center gap-3 ${notification.type === "error" ? "bg-red-600" : "bg-green-600"}`}
                        >
                            {notification.type === "error" ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODAL SELECCION PRODUCTOS */}
                <AnimatePresence>
                    {modal === "selectProducto" && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModal(null)}
                        >
                            <motion.div
                                className="bg-white rounded-2xl shadow-2xl relative overflow-hidden w-[95%] max-w-6xl h-[90vh] flex flex-col"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                    <h3 className="font-bold text-lg text-gray-800">Seleccionar Productos</h3>
                                    <div className="flex items-center gap-4 w-1/2">
                                        <div className="relative w-full">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-y-auto p-6 bg-gray-50/50 pb-20">
                                    {filteredProducts.map(product => {
                                        // Solo mostrar productos con variantes
                                        if (!product.variantes || !product.variantes.length) return null;

                                        const isSelected = !!selectedProducts[product.id_producto];

                                        return (
                                            <div key={product.id_producto} className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${isSelected ? 'border-[#040529] shadow-md ring-1 ring-[#040529]/20 bg-white' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>

                                                {/* Header Card (Horizontal) */}
                                                <div className="flex flex-row items-center p-3 cursor-pointer group" onClick={() => handleProductSelect(product.id_producto, !isSelected)}>

                                                    {/* Imagen cuadrada pequeña */}
                                                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                        {product.imagen_producto ? (
                                                            <img
                                                                src={product.imagen_producto}
                                                                alt={product.nombre_producto}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                                <Package className="h-8 w-8 mb-1 opacity-50" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 ml-4 flex flex-col justify-center min-w-0">
                                                        <h4 className="font-bold text-[#040529] text-sm sm:text-base leading-tight mb-1 truncate pr-2">{product.nombre_producto}</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                                                            {product.descripcion || "Sin descripción disponible."}
                                                        </p>
                                                        <div className="font-bold text-green-600 text-sm sm:text-base">
                                                            ${Number(product.precio_venta).toLocaleString()}
                                                        </div>
                                                    </div>

                                                    {/* Checkbox */}
                                                    <div className="ml-3 mr-1 flex-shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => { e.stopPropagation(); handleProductSelect(product.id_producto, e.target.checked); }}
                                                            className="w-5 h-5 text-[#040529] rounded border-gray-300 focus:ring-[#040529] cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Variantes */}
                                                {isSelected && (
                                                    <div className="space-y-3 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-gray-500 uppercase">Variantes ({selectedProducts[product.id_producto].variantes.length})</span>
                                                        </div>
                                                        {selectedProducts[product.id_producto].variantes.map((v, idx) => (
                                                            <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative group">

                                                                <div className="flex flex-col gap-1.5 w-full pr-4">
                                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 mb-0.5">Variante (Stock)</label>
                                                                    <select
                                                                        value={v.id_variante || ""}
                                                                        onChange={(e) => updateVariantRow(product.id_producto, idx, "id_variante", e.target.value)}
                                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#040529]/20 outline-none bg-gray-50 min-h-[32px] text-gray-700 font-medium"
                                                                    >
                                                                        <option value="">Seleccione Variante</option>
                                                                        {product.variantes.map(pv => (
                                                                            <option key={pv.id_variante} value={pv.id_variante}>
                                                                                {pv.nombre_color} / {pv.nombre_talla} ({pv.stock})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div className="flex flex-col mt-1">
                                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 mb-0.5">Cant</label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={v.qty}
                                                                        onChange={(e) => updateVariantRow(product.id_producto, idx, "qty", Number(e.target.value))}
                                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#040529]/20 outline-none bg-gray-50 h-8 font-medium"
                                                                    />
                                                                </div>

                                                                {/* Botón Eliminar Variante Absoluto */}
                                                                {selectedProducts[product.id_producto].variantes.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); removeVariantRow(product.id_producto, idx); }}
                                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                                                        title="Eliminar variante"
                                                                    >
                                                                        <X size={12} strokeWidth={3} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}

                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); addVariantToProduct(product.id_producto); }}
                                                            className="w-full py-2 bg-white border border-dashed border-gray-300 text-gray-500 hover:text-[#040529] hover:border-[#040529] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm mt-1"
                                                        >
                                                            <Plus size={14} /> Nueva variante
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="p-4 border-t bg-white flex justify-end gap-3">
                                    <button onClick={() => setModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                        Cancelar
                                    </button>
                                    <button onClick={saveSelectedProducts} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
                                        Confirmar Selección
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </>
    );

    function addVariantToProduct(productId) {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: {
                variantes: [...(prev[productId]?.variantes || []), { id_variante: null, qty: 1, price: 0 }]
            }
        }));
    }
}
