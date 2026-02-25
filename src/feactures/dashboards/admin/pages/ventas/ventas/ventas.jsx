
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  Pen,
  Trash2,
  Eye,
  Package,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Ban,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  updateVentaStatus,
  cancelVenta,
} from "../../services/ventasService";

import {
  getProductos,
  getColores,
  getTallas,
  getVariantes,
} from "../../services/productosServices";

import { getUsuarios } from "../../services/usuariosServices";
import { getClientes, createCliente } from "../../services/clientesServices";

function Ventas() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // todos los usuarios (posibles clientes)
  const [clientes, setClientes] = useState([]); // solo quienes tienen perfil cliente
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [modal, setModal] = useState(null); // 'crear','editar','ver','eliminar','status','selectProducto','reviewProducts'
  const [parentModal, setParentModal] = useState(null);
  const [modalCancel, setModalCancel] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [form, setForm] = useState({
    id_cliente: "",
    fecha_venta: "",
    estado: "Pendiente",
    items: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("todos");
  const [selectedProducts, setSelectedProducts] = useState({});
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historialCliente, setHistorialCliente] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notificaciones
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para colores/tallas
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  // ==== Notificación ====
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  // ==== Combinar productos con variantes ====
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

  // ==== Fetch inicial ====
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ventasData, usuariosData, clientesData, productosData, variantesData, cols, tls] = await Promise.all([
        getVentas(),
        getUsuarios(),
        getClientes(),
        getProductos(),
        getVariantes(),
        getColores(),
        getTallas(),
      ]);
      const productosConVariantes = combinarProductosConVariantes(productosData, variantesData);
      setVentas(ventasData || []);
      setUsuarios(usuariosData || []);
      setClientes(clientesData || []);
      setProductos(productosConVariantes);
      setColores(cols || []);
      setTallas(tls || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==== Abrir modal ====
  const openModal = async (type, venta = null) => {
    if (type === "selectProducto") {
      setParentModal(modal);
      const initial = {};
      (form.items || []).forEach((it) => {
        if (!initial[it.id_producto]) initial[it.id_producto] = { variantes: [] };
        initial[it.id_producto].variantes.push({
          id_variante: it.id_variante ?? null,
          id_color: it.id_color ?? null,
          id_talla: it.id_talla ?? null,
          qty: it.qty ?? it.cantidad ?? 0,
          price: it.price ?? it.precio_unitario ?? 0,
          nombre_color: it.nombre_color ?? "—",
          nombre_talla: it.nombre_talla ?? "—",
        });
      });
      setSelectedProducts(initial);
      setModal(type);
      return;
    } else if (type === "ver" && venta) {
      // Navegar a la vista de detalle en lugar de abrir modal
      navigate(`/admin/ventas/detalle/${venta.id_venta}`);
      return;
    }

    setModal(type);
    setSelectedVenta(venta);

    if (type === "crear") {
      setForm({
        id_cliente: "",
        fecha_venta: new Date().toISOString().split("T")[0],
        estado: "Pendiente",
        items: [],
      });
      setHistorialCliente([]);
    } else if (type === "editar" && venta) {
      try {
        const ventaCompleta = await getVentaById(venta.id_venta);
        setForm({
          id_cliente: ventaCompleta.id_cliente,
          fecha_venta: ventaCompleta.fecha_venta?.split?.("T")[0] || "",
          estado: ventaCompleta.estado || "Pendiente",
          items: ventaCompleta.items ? JSON.parse(JSON.stringify(ventaCompleta.items)) : [],
        });
        loadHistorial(ventaCompleta.id_cliente);
      } catch (err) {
        showNotification("Error al cargar venta", "error");
      }
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedVenta(null);
    setSelectedProducts({});
    setParentModal(null);
  };

  // ==== Historial cliente (ventas anteriores) ====
  const loadHistorial = async (id_cliente) => {
    if (!id_cliente) return;
    setLoadingHistorial(true);
    try {
      const historial = await getVentas().then((vs) => vs.filter(v => v.id_cliente === id_cliente));
      historial.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta));
      setHistorialCliente(historial);
    } catch (err) {
      showNotification("Error al cargar historial", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleClienteChange = (e) => {
    const id = e.target.value;
    setForm((prev) => ({ ...prev, id_cliente: id }));
    if (modal === "editar" && id) loadHistorial(id);
    else setHistorialCliente([]);
  };

  // ==== Submit venta ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!form.id_cliente) throw new Error("Cliente es obligatorio");
      if (!form.items?.length) throw new Error("Debe agregar al menos un producto");

      const total = form.items.reduce((sum, item) => sum + (Number(item.qty || item.cantidad) || 0) * (Number(item.price || item.precio_unitario) || 0), 0);

      const payload = {
        ...form,
        total,
        items: (form.items || []).map((item) => ({
          id_producto: Number(item.id_producto),
          id_variante: item.id_variante ?? null,
          id_color: item.id_color === "" ? null : item.id_color,
          id_talla: item.id_talla === "" ? null : item.id_talla,
          qty: Number(item.qty ?? item.cantidad ?? 0),
          price: Number(item.price ?? item.precio_unitario ?? 0),
        })),
      };

      if (modal === "crear") {
        await createVenta(payload);
        showNotification("Venta registrada", "success");
      } else if (modal === "editar" && selectedVenta) {
        await updateVenta(selectedVenta.id_venta, payload);
        showNotification("Venta actualizada", "success");
      }
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
      showNotification(err.message || "Error al guardar la venta", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==== Eliminar / actualizar estado ====
  const handleDelete = async () => {
    if (!selectedVenta) return;
    try {
      await deleteVenta(selectedVenta.id_venta);
      await fetchData();
      showNotification("Venta eliminada", "success");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al eliminar", "error");
    }
  };

  const handleStatusUpdate = async (estado) => {
    if (!selectedVenta) return;
    try {
      await updateVentaStatus(selectedVenta.id_venta, { estado });
      await fetchData();
      showNotification("Estado actualizado", "success");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al actualizar estado", "error");
    }
  };

  // ==== Selección de productos ====
  const addVariantToProduct = (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: {
        variantes: [...(prev[productId]?.variantes || []), { id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }],
      },
    }));
  };

  const removeVariantFromProduct = (productId, idx) => {
    setSelectedProducts((prev) => {
      const prod = { ...(prev[productId] || { variantes: [] }) };
      const newVariants = [...prod.variantes];
      newVariants.splice(idx, 1);
      if (newVariants.length === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { ...prod, variantes: newVariants } };
    });
  };

  const updateVariantField = (productId, idx, field, value) => {
    setSelectedProducts((prev) => {
      const prod = { ...(prev[productId] || { variantes: [] }) };
      const newVariants = [...(prod.variantes || [])];
      newVariants[idx] = { ...newVariants[idx], [field]: value };
      return { ...prev, [productId]: { ...prod, variantes: newVariants } };
    });
  };

  const handleProductSelect = (productId, checked) => {
    if (checked) {
      setSelectedProducts((prev) => ({
        ...prev,
        [productId]: { variantes: [{ id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }] },
      }));
    } else {
      setSelectedProducts((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const saveSelectedProducts = () => {
    const newItems = [];
    for (const [productIdKey, productData] of Object.entries(selectedProducts)) {
      const productId = Number(productIdKey);
      const product = productos.find((p) => p.id_producto === productId);
      if (!product || !productData.variantes) continue;
      for (const v of productData.variantes) {
        const qty = Number(v.qty || 0);
        if (qty <= 0) continue;
        if (!v.id_color || !v.id_talla) continue;
        const varianteExistente = product.variantes?.find(
          (vari) => Number(vari.id_color) === Number(v.id_color) && Number(vari.id_talla) === Number(v.id_talla)
        );
        const newItem = {
          id_producto: productId,
          nombre_producto: product.nombre_producto,
          id_variante: varianteExistente?.id_variante ?? null,
          id_color: Number(v.id_color),
          nombre_color: varianteExistente?.nombre_color ?? colores.find((c) => c.id_color === Number(v.id_color))?.nombre_color ?? "—",
          id_talla: Number(v.id_talla),
          nombre_talla: varianteExistente?.nombre_talla ?? tallas.find((t) => t.id_talla === Number(v.id_talla))?.nombre_talla ?? "—",
          qty,
          price: Number(v.price || product.precio || 0), // ← Usa precio de venta!
        };
        newItems.push(newItem);
      }
    }

    setForm((prev) => {
      const updated = [...(prev.items || [])];
      newItems.forEach((newItem) => {
        const idx = updated.findIndex(
          (i) => i.id_producto === newItem.id_producto && i.id_color === newItem.id_color && i.id_talla === newItem.id_talla
        );
        if (idx !== -1) {
          updated[idx].qty += newItem.qty;
          updated[idx].price = newItem.price;
        } else {
          updated.push(newItem);
        }
      });
      return { ...prev, items: updated };
    });

    setSelectedProducts({});
    if (parentModal) {
      setModal(parentModal);
      setParentModal(null);
    } else {
      setModal(null);
    }
  };

  const updateItemField = (idx, field, value) =>
    setForm((prev) => {
      const items = [...(prev.items || [])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });

  const removeItem = (idx) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  // ==== Toggle detalle expandido ====
  const toggleRowExpansion = async (idVenta) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idVenta)) newSet.delete(idVenta);
      else newSet.add(idVenta);
      return newSet;
    });

    if (!expandedRows.has(idVenta)) {
      try {
        const ventaCompleta = await getVentaById(idVenta);
        setVentas((prev) =>
          prev.map((v) => (v.id_venta === idVenta ? { ...v, items: ventaCompleta.items } : v))
        );
      } catch (err) {
        showNotification("Error al cargar detalles", "error");
      }
    }
  };

  // ==== Helpers UI ====
  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find((c) => c.id_cliente === id_cliente);
    return cliente ? `${cliente.nombre_completo} (${cliente.documento})` : "—";
  };

  const getClienteInfo = (id_cliente) => {
    const c = clientes.find((x) => x.id_cliente === id_cliente);
    if (!c) return null;
    return {
      nombre: c.nombre_completo,
      documento: c.documento,
      email: c.email,
      telefono: c.telefono_contacto || c.telefono_usuario,
      direccion: c.direccion_envio,
    };
  };

  // ==== Filtrado y paginación ====
  const filteredVentas = ventas.filter((v) => {
    const matchesSearch =
      String(v.id_venta).includes(searchTerm) ||
      getClienteNombre(v.id_cliente).toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(v.fecha_venta).toLocaleDateString().includes(searchTerm);
    const matchesCliente = clienteFiltro === "todos" || v.id_cliente === Number(clienteFiltro);
    return matchesSearch && matchesCliente;
  });

  const totalPages = Math.max(1, Math.ceil(filteredVentas.length / itemsPerPage));
  const visibleItems = filteredVentas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage > totalPages) setCurrentPage(1);
  }, [searchTerm, totalPages]);

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">

        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">

          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold! whitespace-nowrap uppercase tracking-wider">
                Gestión de Ventas
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md ">
                  <Hash className="h-3 w-3 " />
                  <span className="text-xs font-bold!">{filteredVentas.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Active Toolbar (Big Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">
            {/* Search & Create Group */}
            <div className="flex flex-1 w-full sm:w-auto gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar ventas..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => navigate("/admin/ventas/crear")}
                className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Registrar venta
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={clienteFiltro}
                onChange={(e) => {
                  setClienteFiltro(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm font-bold tracking-wide rounded-lg border transition bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 outline-none"
              >
                <option value="todos">Todos los clientes</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <table className="w-full text-left relative">
                <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">ID</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[20%]">Cliente</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Fecha</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Productos</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Total</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Estado</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right w-[15%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-400 text-sm">Cargando...</td></tr>
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Package className="h-8 w-8" />
                          <p className="text-sm">No hay ventas registradas</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((v) => (
                      <tr key={v.id_venta} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-5 py-4 font-bold text-[#040529] text-sm">{v.id_venta}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">{getClienteNombre(v.id_cliente)}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{new Date(v.fecha_venta).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{v.items?.length || 0}</td>
                        <td className="px-5 py-4 text-sm text-[#040529] font-bold">${v.total?.toLocaleString?.() ?? "0"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${v.estado === "Entregada" ? 'bg-green-50 text-green-700 border-green-100' :
                            v.estado === "Pendiente" ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              v.estado === "Procesada" ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-pink-50 text-pink-700 border-pink-100'
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${v.estado === "Entregada" ? 'bg-green-500' :
                              v.estado === "Pendiente" ? 'bg-yellow-500' :
                                v.estado === "Procesada" ? 'bg-blue-500' : 'bg-pink-500'
                              }`}></span>
                            {v.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => navigate(`/admin/ventas/detalle/${v.id_venta}`)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver detalles"><Eye className="h-4 w-4" /></button>
                            {v.estado === "Pendiente" && (
                              <button onClick={() => navigate(`/admin/ventas/editar/${v.id_venta}`)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pen className="h-4 w-4" /></button>
                            )}
                            <button onClick={() => openModal("status", v)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-green-600 hover:text-white transition shadow-sm border border-gray-100" title="Actualizar estado"><Package className="h-4 w-4" /></button>
                            <button onClick={() => openModal("eliminar", v)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            {totalPages > 1 && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  Mostrando <span className="font-bold text-[#040529]">{Math.min(visibleItems.length, itemsPerPage)}</span> de <span className="font-bold text-[#040529]">{filteredVentas.length}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
                  <span className="text-sm font-bold text-[#040529] px-2">{currentPage}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notificación */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"
                }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== MODALS ===== */}
        {/* Crear / Editar */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl relative overflow-hidden w-[90%] max-w-2xl max-h-[90vh] flex flex-col"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h3 className="text-xl font-bold text-[#040529]">
                    {modal === "crear" ? "Registrar Venta" : "Editar Venta"}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                        <select
                          value={form.id_cliente}
                          onChange={handleClienteChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Seleccionar cliente</option>
                          {clientes.map((c) => (
                            <option key={c.id_cliente} value={c.id_cliente}>
                              {c.nombre_completo} ({c.documento})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de venta</label>
                        <input
                          type="date"
                          value={form.fecha_venta}
                          onChange={(e) => setForm((prev) => ({ ...prev, fecha_venta: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <input
                          type="text"
                          value={form.estado}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>
                    </div>

                    {form.id_cliente && modal === "editar" && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                        <h4 className="font-medium text-gray-700 mb-2">Ventas anteriores:</h4>
                        {loadingHistorial ? (
                          <p className="text-sm text-gray-500">Cargando...</p>
                        ) : historialCliente.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin ventas previas.</p>
                        ) : (
                          historialCliente.map((v) => (
                            <div key={v.id_venta} className="flex justify-between items-center py-1 text-sm">
                              <span>
                                {v.id_venta} - {new Date(v.fecha_venta).toLocaleDateString()} - ${v.total?.toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-bold text-[#040529] mb-2 uppercase tracking-wide">Productos</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setParentModal(modal);
                            setModal("selectProducto");
                          }}
                          className="px-4 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white font-bold rounded-lg text-sm shadow-md transition"
                        >
                          <Plus className="h-4 w-4 inline-block mr-1" />
                          Seleccionar productos
                        </button>
                      </div>
                    </div>

                    {form.items?.length > 0 && (
                      <div className="mt-4">
                        <table className="w-full text-sm text-left text-gray-600">
                          <thead>
                            <tr className="border-b">
                              <th>Producto</th>
                              <th>Color</th>
                              <th>Talla</th>
                              <th>Cant</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                              {form.estado === "Pendiente" && <th></th>}
                            </tr>
                          </thead>
                          <tbody>
                            {form.items.map((item, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{item.nombre_producto}</td>
                                <td className="py-2">{item.nombre_color}</td>
                                <td className="py-2">{item.nombre_talla}</td>
                                <td className="py-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) => updateItemField(idx, "qty", Number(e.target.value))}
                                    className="w-16 p-2 border border-gray-300 rounded-md"
                                    disabled={form.estado !== "Pendiente"}
                                  />
                                </td>
                                <td className="py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => updateItemField(idx, "price", Number(e.target.value))}
                                    className="w-20 p-2 border border-gray-300 rounded-md"
                                    disabled={form.estado !== "Pendiente"}
                                  />
                                </td>
                                <td className="py-2">${(item.qty * item.price).toLocaleString()}</td>
                                {form.estado === "Pendiente" && (
                                  <td>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(idx)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="5" className="text-right font-bold">Total:</td>
                              <td className="font-bold">
                                ${form.items.reduce((s, i) => s + i.qty * i.price, 0).toLocaleString()}
                              </td>
                              {form.estado === "Pendiente" && <td></td>}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-gray-100 p-6 shrink-0 bg-gray-50/50">
                      <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-[#040529] hover:bg-[#040529]/90 text-white font-bold rounded-lg shadow-md transition"
                      >
                        {isSubmitting ? "Guardando..." : modal === "crear" ? "Registrar Venta" : "Guardar Cambios"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seleccionar productos */}
        <AnimatePresence>
          {modal === "selectProducto" && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                if (parentModal) setModal(parentModal);
                else closeModal();
              }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl relative overflow-hidden w-[95%] max-w-6xl max-h-[90vh] flex flex-col"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h3 className="text-xl font-bold text-[#040529]">Seleccionar Productos</h3>
                  <button
                    onClick={() => {
                      if (parentModal) setModal(parentModal);
                      else closeModal();
                    }}
                    className="text-gray-400 hover:text-[#040529]"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar producto"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                    {productos
                      .filter((p) =>
                        p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((p) => (
                        <div key={p.id_producto} className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${selectedProducts[p.id_producto] ? 'border-[#040529] shadow-md ring-1 ring-[#040529]/20 bg-white' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>

                          {/* Header Card (Horizontal) */}
                          <div className="flex flex-row items-center p-3 cursor-pointer group" onClick={() => handleProductSelect(p.id_producto, !selectedProducts[p.id_producto])}>

                            {/* Imagen cuadrada pequeña */}
                            <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              {p.imagen_producto ? (
                                <img
                                  src={p.imagen_producto}
                                  alt={p.nombre_producto}
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
                              <h4 className="font-bold text-[#040529] text-sm sm:text-base leading-tight mb-1 truncate pr-2">{p.nombre_producto}</h4>
                              <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                                {p.descripcion || "Sin descripción disponible para este producto."}
                              </p>
                              <div className="font-bold text-green-600 text-sm sm:text-base">
                                ${(p.precio || 0).toLocaleString()}
                              </div>
                            </div>

                            {/* Checkbox */}
                            <div className="ml-3 mr-1 flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={!!selectedProducts[p.id_producto]}
                                onChange={(e) => { e.stopPropagation(); handleProductSelect(p.id_producto, e.target.checked); }}
                                className="w-5 h-5 text-[#040529] rounded border-gray-300 focus:ring-[#040529] cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Variantes */}
                          {selectedProducts[p.id_producto] && (
                            <div className="space-y-3 bg-gray-50 rounded-b-2xl p-4 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Variantes ({selectedProducts[p.id_producto].variantes.length})</span>
                              </div>
                              {selectedProducts[p.id_producto].variantes.map((v, idx) => (
                                <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative group">

                                  {/* Controles Variante */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 mb-0.5">Color</label>
                                      <select
                                        value={v.id_color}
                                        onChange={(e) =>
                                          updateVariantField(p.id_producto, idx, "id_color", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#040529]/20 outline-none bg-gray-50 h-8"
                                      >
                                        <option value="">Sel...</option>
                                        {colores.map((c) => (
                                          <option key={c.id_color} value={c.id_color}>
                                            {c.nombre_color}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 mb-0.5">Talla</label>
                                      <select
                                        value={v.id_talla}
                                        onChange={(e) =>
                                          updateVariantField(p.id_producto, idx, "id_talla", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#040529]/20 outline-none bg-gray-50 h-8"
                                      >
                                        <option value="">Sel...</option>
                                        {tallas.map((t) => (
                                          <option key={t.id_talla} value={t.id_talla}>
                                            {t.nombre_talla}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 mb-0.5">Cant</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={v.qty}
                                        onChange={(e) =>
                                          updateVariantField(p.id_producto, idx, "qty", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#040529]/20 outline-none bg-gray-50 h-8 font-medium"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase ml-1 mb-0.5">Precio ($)</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={v.price || p.precio || 0}
                                        onChange={(e) =>
                                          updateVariantField(p.id_producto, idx, "price", e.target.value)
                                        }
                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#040529]/20 outline-none bg-gray-50 h-8 font-medium"
                                      />
                                    </div>
                                  </div>

                                  {/* Botón Eliminar Variante Absoluto */}
                                  {selectedProducts[p.id_producto].variantes.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); removeVariantFromProduct(p.id_producto, idx); }}
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
                                onClick={(e) => { e.stopPropagation(); addVariantToProduct(p.id_producto); }}
                                className="w-full py-2 bg-white border border-dashed border-gray-300 text-gray-500 hover:text-[#040529] hover:border-[#040529] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm mt-1"
                              >
                                <Plus size={14} /> Nueva variante
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    {productos.filter((p) => p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()))
                      .length === 0 && <p className="text-gray-500 text-center py-10 w-full col-span-full">No se encontraron productos.</p>}
                  </div>
                  <div className="flex justify-end gap-2 mt-6 border-t border-gray-100 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (parentModal) setModal(parentModal);
                        else closeModal();
                      }}
                      className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={saveSelectedProducts}
                      className="px-5 py-2.5 bg-[#040529] hover:bg-[#040529]/90 text-white font-bold rounded-lg shadow-md transition"
                    >
                      Confirmar selección
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales: eliminar, status */}
        <AnimatePresence>
          {modal === "eliminar" && selectedVenta && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-red-600 mb-4 text-center">Eliminar Venta</h3>
                <p className="text-gray-700 text-center">
                  ¿Está seguro de eliminar la venta <span className="font-bold">{selectedVenta.id_venta}</span>?<br />
                  <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </p>
                <div className="flex justify-center gap-3 pt-6">
                  <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition">
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {modal === "status" && selectedVenta && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-[#040529] mb-4 text-center">Actualizar Estado</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const estado = formData.get("estado");
                    handleStatusUpdate(estado);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Nuevo Estado</label>
                    <select name="estado" defaultValue={selectedVenta.estado} className="w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]">
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesada">Procesada</option>
                      <option value="Entregada">Entregada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div className="flex justify-center gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">
                      Cancelar
                    </button>
                    <button type="submit" className="px-5 py-2.5 bg-[#040529] hover:bg-[#040529]/90 text-white font-bold rounded-lg shadow-md transition">
                      Registrar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div >
    </>
  );
}
export default Ventas;