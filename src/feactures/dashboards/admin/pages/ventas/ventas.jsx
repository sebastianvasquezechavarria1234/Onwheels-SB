// src/pages/ventas/Ventas.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ===== SERVICES =====
import {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  updateVentaStatus,
} from "../../services/ventasService";

import {
  getProductos,
  getColores,
  getTallas,
  getVariantes,
} from "../../services/productosServices";

import { getUsuarios } from "../../services/usuariosService"; // Para listar clientes (usuarios)
import { getClientes, createCliente } from "../../services/clientesService"; // Perfil cliente

export default function Ventas() {
  // ===== Estados principales =====
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // todos los usuarios (posibles clientes)
  const [clientes, setClientes] = useState([]); // solo quienes tienen perfil cliente
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [modal, setModal] = useState(null); // 'crear','editar','ver','eliminar','status','selectProducto','reviewProducts'
  const [parentModal, setParentModal] = useState(null);
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
      try {
        const ventaCompleta = await getVentaById(venta.id_venta);
        setSelectedVenta(ventaCompleta);
        setModal(type);
      } catch (err) {
        showNotification("Error al cargar detalles", "error");
      }
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
  }, [totalPages]);

  // ===== UI =====
  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ventas / Gestión de Ventas</h2>

          {/* Filtros y acciones */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <select
                  value={clienteFiltro}
                  onChange={(e) => {
                    setClienteFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-700"
                >
                  <option value="todos">Todos los clientes</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre_completo} ({c.documento})
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar ventas..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar nueva venta
            </button>
          </div>

          {/* Tabla ventas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[10%]">ID</th>
                    <th className="px-6 py-3 w-[25%]">Cliente</th>
                    <th className="px-6 py-3 w-[15%]">Fecha</th>
                    <th className="px-6 py-3 w-[10%]">Productos</th>
                    <th className="px-6 py-3 w-[15%]">Total</th>
                    <th className="px-6 py-3 w-[15%]">Estado</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                        Cargando...
                      </td>
                    </tr>
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                        No hay ventas registradas
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((v) => (
                      <React.Fragment key={v.id_venta}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-6 py-4">{v.id_venta}</td>
                          <td className="px-6 py-4 font-medium">{getClienteNombre(v.id_cliente)}</td>
                          <td className="px-6 py-4">{new Date(v.fecha_venta).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{v.items?.length || 0}</td>
                          <td className="px-6 py-4">${v.total?.toLocaleString?.() ?? "0"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                v.estado === "Entregada"
                                  ? "bg-green-100 text-green-800"
                                  : v.estado === "Pendiente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : v.estado === "Procesada"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {v.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleRowExpansion(v.id_venta)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                title="Ver detalles"
                              >
                                {expandedRows.has(v.id_venta) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal("ver", v)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </motion.button>
                              {v.estado === "Pendiente" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openModal("editar", v)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="Editar"
                                >
                                  <Pen size={16} />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal("eliminar", v)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal("status", v)}
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                                title="Actualizar estado"
                              >
                                <Package size={16} />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                        {/* Detalle expandido */}
                        {expandedRows.has(v.id_venta) && (
                          <tr className="bg-gray-50">
                            <td colSpan="7" className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border">
                                  <h4 className="font-semibold mb-2">Cliente</h4>
                                  {getClienteInfo(v.id_cliente) ? (
                                    <div className="text-sm space-y-1 text-gray-700">
                                      <div><strong>Nombre:</strong> {getClienteInfo(v.id_cliente).nombre}</div>
                                      <div><strong>Documento:</strong> {getClienteInfo(v.id_cliente).documento}</div>
                                      <div><strong>Email:</strong> {getClienteInfo(v.id_cliente).email}</div>
                                      <div><strong>Teléfono:</strong> {getClienteInfo(v.id_cliente).telefono}</div>
                                      <div><strong>Dirección:</strong> {getClienteInfo(v.id_cliente).direccion}</div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Cliente no encontrado.</p>
                                  )}
                                </div>
                                <div className="bg-white p-4 rounded-lg border">
                                  <h4 className="font-semibold mb-2">Productos ({v.items?.length || 0})</h4>
                                  {v.items?.length > 0 ? (
                                    <div className="text-sm">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="text-left">
                                            <th>Producto</th>
                                            <th>Color</th>
                                            <th>Talla</th>
                                            <th className="text-right">Cant</th>
                                            <th className="text-right">Subtotal</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {v.items.map((item, idx) => (
                                            <tr key={idx} className="border-t">
                                              <td className="py-2">{item.nombre_producto}</td>
                                              <td className="py-2">{item.nombre_color}</td>
                                              <td className="py-2">{item.nombre_talla}</td>
                                              <td className="py-2 text-right">{item.qty}</td>
                                              <td className="py-2 text-right">${(item.qty * item.price).toLocaleString()}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Sin productos.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {filteredVentas.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Notificación */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${
                notification.type === "success" ? "bg-green-600" : "bg-red-600"
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
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeModal}
            >
              <motion.div
                className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modal === "crear" ? "Crear nueva venta" : "Editar venta"}
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agregar Productos</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setParentModal(modal);
                          setModal("selectProducto");
                        }}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
                      >
                        Seleccionar productos +
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

                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md"
                    >
                      {isSubmitting ? "Guardando..." : modal === "crear" ? "Registrar" : "Guardar"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Seleccionar productos */}
        <AnimatePresence>
          {modal === "selectProducto" && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                if (parentModal) setModal(parentModal);
                else closeModal();
              }}
            >
              <motion.div
                className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Seleccionar productos</h2>
                  <button
                    onClick={() => {
                      if (parentModal) setModal(parentModal);
                      else closeModal();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar producto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {productos
                    .filter((p) =>
                      p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((p) => (
                      <div key={p.id_producto} className="p-4 rounded-lg border bg-gray-50">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={!!selectedProducts[p.id_producto]}
                            onChange={(e) => handleProductSelect(p.id_producto, e.target.checked)}
                            className="mt-1"
                          />
                          <div className="flex-shrink-0">
                            {p.imagen_producto ? (
                              <img
                                src={p.imagen_producto}
                                alt={p.nombre_producto}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-500">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{p.nombre_producto}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {p.descripcion || "Sin descripción"}
                            </p>
                          </div>
                        </div>
                        {selectedProducts[p.id_producto] && (
                          <div className="mt-4 space-y-3">
                            {selectedProducts[p.id_producto].variantes.map((v, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-3 bg-white rounded border">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Color</label>
                                  <select
                                    value={v.id_color}
                                    onChange={(e) =>
                                      updateVariantField(p.id_producto, idx, "id_color", e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  >
                                    <option value="">Seleccionar</option>
                                    {colores.map((c) => (
                                      <option key={c.id_color} value={c.id_color}>
                                        {c.nombre_color} {c.codigo_hex ? `(${c.codigo_hex})` : ""}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Talla</label>
                                  <select
                                    value={v.id_talla}
                                    onChange={(e) =>
                                      updateVariantField(p.id_producto, idx, "id_talla", e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  >
                                    <option value="">Seleccionar</option>
                                    {tallas.map((t) => (
                                      <option key={t.id_talla} value={t.id_talla}>
                                        {t.nombre_talla}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Cantidad</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={v.qty}
                                    onChange={(e) =>
                                      updateVariantField(p.id_producto, idx, "qty", e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">Precio</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={v.price || p.precio || 0}
                                    onChange={(e) =>
                                      updateVariantField(p.id_producto, idx, "price", e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => addVariantToProduct(p.id_producto)}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVariantFromProduct(p.id_producto, idx)}
                                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                                  >
                                    −
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  {productos.filter((p) => p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()))
                    .length === 0 && <p className="text-gray-500 text-center py-10">No se encontraron productos.</p>}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (parentModal) setModal(parentModal);
                      else closeModal();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveSelectedProducts}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md"
                  >
                    Confirmar selección
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales: ver, eliminar, status (igual que compras) */}
        <AnimatePresence>
          {modal === "ver" && selectedVenta && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm">
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Detalles de la Venta</h3>
                <div className="space-y-4 mb-6 text-gray-700">
                  <div><div className="font-medium text-gray-600">ID</div><div>{selectedVenta.id_venta}</div></div>
                  <div><div className="font-medium text-gray-600">Cliente</div><div>{getClienteNombre(selectedVenta.id_cliente)}</div></div>
                  <div><div className="font-medium text-gray-600">Fecha</div><div>{new Date(selectedVenta.fecha_venta).toLocaleDateString()}</div></div>
                  <div><div className="font-medium text-gray-600">Total</div><div>${selectedVenta.total?.toLocaleString()}</div></div>
                  <div><div className="font-medium text-gray-600">Estado</div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                      selectedVenta.estado === "Entregada" ? "bg-green-100 text-green-800" :
                      selectedVenta.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                      selectedVenta.estado === "Procesada" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                    }`}>
                      {selectedVenta.estado}
                    </span>
                  </div>
                </div>
                {selectedVenta.items?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Productos</h4>
                    <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Producto</th>
                          <th className="px-4 py-2 text-left">Color</th>
                          <th className="px-4 py-2 text-left">Talla</th>
                          <th className="px-4 py-2 text-left">Cant</th>
                          <th className="px-4 py-2 text-left">Precio</th>
                          <th className="px-4 py-2 text-left">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVenta.items.map((it, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-2">{it.nombre_producto}</td>
                            <td className="px-4 py-2">{it.nombre_color}</td>
                            <td className="px-4 py-2">{it.nombre_talla}</td>
                            <td className="px-4 py-2">{it.qty}</td>
                            <td className="px-4 py-2">${it.price?.toLocaleString()}</td>
                            <td className="px-4 py-2">${(it.qty * it.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-center pt-2">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {modal === "eliminar" && selectedVenta && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm">
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <h3 className="text-xl font-bold text-red-600 mb-4 text-center">Eliminar Venta</h3>
                <p className="text-gray-700 text-center">
                  ¿Está seguro de eliminar la venta <span className="font-bold">{selectedVenta.id_venta}</span>?<br />
                  <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </p>
                <div className="flex justify-center gap-3 pt-6">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {modal === "status" && selectedVenta && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm">
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Actualizar Estado</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
                    <select name="estado" defaultValue={selectedVenta.estado} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesada">Procesada</option>
                      <option value="Entregada">Entregada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div className="flex justify-center gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                      Registrar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}