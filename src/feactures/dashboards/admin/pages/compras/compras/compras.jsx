// src/pages/PurchasesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye, Package, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  getCompras,
  getProveedores,
  createCompra,
  updateCompra,
  deleteCompra,
  updateCompraStatus,
  getComprasByProveedor,
  getProductos,
} from "../../services/comprasService";

import { getVariantes,
  getColores,
  getTallas} from "../../services/productosServices"

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCompra, setSelectedCompra] = useState(null);
  const [modal, setModal] = useState(null); // 'crear', 'editar', 'ver', 'eliminar', 'status', 'selectProducto'
  const [expandedRow, setExpandedRow] = useState(null); // Para maestro detalle

  // Formulario de compra
  const [form, setForm] = useState({
    NIT_proveedor: "",
    fecha_compra: "",
    fecha_aproximada_entrega: "",
    estado: "Pendiente",
    items: []
  });

  // Estado del selector de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState({}); // { id_producto: { color: "", talla: "", qty: 0 } }
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);

  // Historial del proveedor seleccionado
  const [historialProveedor, setHistorialProveedor] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = compras.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(compras.length / itemsPerPage);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [comprasData, proveedoresData, productosData] = await Promise.all([
        getCompras(),
        getProveedores(),
        getProductos()
      ]);
      setCompras(comprasData);
      setProveedores(proveedoresData);
      setProductos(productosData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-md ${
      type === "success"
        ? "bg-green-100 border-green-500 text-green-700"
        : "bg-red-100 border-red-500 text-red-700"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }, []);

  const openModal = (type, compra = null) => {
    setModal(type);
    setSelectedCompra(compra);

    if (type === "crear") {
      setForm({
        NIT_proveedor: "",
        fecha_compra: new Date().toISOString().split("T")[0],
        fecha_aproximada_entrega: "",
        estado: "Pendiente",
        items: []
      });
      setHistorialProveedor([]);
    } else if (type === "editar" && compra) {
      setForm({
        NIT_proveedor: compra.NIT_proveedor,
        fecha_compra: compra.fecha_compra.split("T")[0],
        fecha_aproximada_entrega: compra.fecha_aproximada_entrega
          ? compra.fecha_aproximada_entrega.split("T")[0]
          : "",
        estado: compra.estado,
        items: compra.items || []
      });
      loadHistorial(compra.NIT_proveedor);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedCompra(null);
    setSelectedProducts({});
    setSearchTerm("");
    setExpandedRow(null);
  };

  const loadHistorial = async (nit) => {
    if (!nit) return;
    setLoadingHistorial(true);
    try {
      const historial = await getComprasByProveedor(nit);
      setHistorialProveedor(historial);
    } catch (err) {
      console.error("Error cargando historial:", err);
      showToast("Error al cargar historial del proveedor", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleProveedorChange = (e) => {
    const nit = e.target.value;
    setForm((prev) => ({ ...prev, NIT_proveedor: nit }));
    if (nit) {
      loadHistorial(nit);
    } else {
      setHistorialProveedor([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.NIT_proveedor) throw new Error("Proveedor es obligatorio");
      if (form.items.length === 0) throw new Error("Debe agregar al menos un producto");
      if (new Date(form.fecha_aproximada_entrega) < new Date(form.fecha_compra)) {
        throw new Error("La fecha de entrega no puede ser anterior a la de compra");
      }

      const total_compra = form.items.reduce((sum, item) => sum + item.qty * item.price, 0);

      const data = {
        NIT_proveedor: form.NIT_proveedor,
        fecha_compra: form.fecha_compra,
        fecha_aproximada_entrega: form.fecha_aproximada_entrega || null,
        total_compra,
        estado: form.estado,
        items: form.items
      };

      if (modal === "crear") {
        await createCompra(data);
      } else if (modal === "editar") {
        await updateCompra(selectedCompra.id_compra, data);
      }

      await fetchData();
      showToast(modal === "crear" ? "Compra registrada" : "Compra actualizada", "success");
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
      showToast(err.message || "Error al guardar la compra", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCompra(selectedCompra.id_compra);
      await fetchData();
      showToast("Compra eliminada", "success");
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showToast(err?.response?.data?.mensaje || "No se pudo eliminar", "error");
    }
  };

  const handleStatusUpdate = async (estado, actualizarStock) => {
    try {
      await updateCompraStatus(selectedCompra.id_compra, { estado, actualizarStock });
      await fetchData();
      showToast(
        actualizarStock && estado === "Recibido"
          ? "Estado actualizado y stock incrementado"
          : "Estado actualizado",
        "success"
      );
      closeModal();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      showToast(err?.response?.data?.mensaje || "Error al actualizar estado", "error");
    }
  };

  // === LÓGICA DE SELECCIÓN DE PRODUCTOS ===
  const openProductSelector = async () => {
    setModal("selectProducto");
    // Cargar colores y tallas
    try {
      const [coloresData, tallasData] = await Promise.all([getColores(), getTallas()]);
      setColores(coloresData);
      setTallas(tallasData);
    } catch (err) {
      console.error("Error cargando colores/tallas:", err);
      showToast("Error al cargar colores y tallas", "error");
    }

    // Inicializa selectedProducts con los productos ya en el formulario (para edición)
    const initialSelection = {};
    form.items.forEach(item => {
      if (!initialSelection[item.id_producto]) {
        initialSelection[item.id_producto] = {
          color: item.id_color || "",
          talla: item.id_talla || "",
          qty: item.qty
        };
      }
    });
    setSelectedProducts(initialSelection);
  };

  const handleProductSelect = (id, isSelected) => {
    setSelectedProducts(prev => {
      const newState = { ...prev };
      if (isSelected) {
        newState[id] = { color: "", talla: "", qty: 0 };
      } else {
        delete newState[id];
      }
      return newState;
    });
  };

  const handleColorSelect = (productId, colorId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        color: colorId
      }
    }));
  };

  const handleTallaSelect = (productId, tallaId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        talla: tallaId
      }
    }));
  };

  const handleQtyChange = (productId, qty) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        qty: parseInt(qty) || 0
      }
    }));
  };

  const saveSelectedProducts = () => {
    const newItems = [];
    for (const [productId, selection] of Object.entries(selectedProducts)) {
      if (selection.qty > 0 && (selection.color || selection.talla)) {
        const product = productos.find(p => p.id_producto == productId);
        if (!product) continue;

        // Buscar variante exacta (producto + color + talla)
        const variante = product.variantes?.find(
          v => v.id_color == selection.color && v.id_talla == selection.talla
        );

        if (variante) {
          newItems.push({
            id_producto: parseInt(productId),
            nombre_producto: product.nombre_producto,
            id_color: selection.color,
            nombre_color: variante.nombre_color,
            id_talla: selection.talla,
            nombre_talla: variante.nombre_talla,
            qty: selection.qty,
            price: product.precio_compra || 0
          });
        }
      }
    }

    // Fusionar con items existentes
    setForm(prev => {
      const updated = [...prev.items];
      newItems.forEach(newItem => {
        const existingIndex = updated.findIndex(
          i =>
            i.id_producto === newItem.id_producto &&
            i.id_color === newItem.id_color &&
            i.id_talla === newItem.id_talla
        );
        if (existingIndex !== -1) {
          updated[existingIndex].qty += newItem.qty;
        } else {
          updated.push(newItem);
        }
      });
      return { ...prev, items: updated };
    });

    closeModal();
  };

  const getNombreProveedor = (nit) =>
    proveedores.find((p) => p.NIT_proveedor === nit)?.nombre_proveedor || "—";

  const getProveedorInfo = (nit) => {
    const p = proveedores.find(p => p.NIT_proveedor === nit);
    if (!p) return null;
    return {
      direccion: p.direccion || "—",
      productos: p.productos?.join(", ") || "—",
      terminos: p.terminos || "—",
      sitioWeb: p.sitioWeb || "—"
    };
  };

  // Filtrar productos por búsqueda
  const filteredProductos = productos.filter(p =>
    p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === RENDER ===
  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">>Gestión de compras</h1>
          <button
            onClick={() => openModal("crear")}
            className="px-8 py-3 rounded-2xl font-semibold shadow-md bg-[#3b10f0] text-white"
          >
            Registrar una nueva compra
          </button>
        </div>

        {/* Barra búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full md:w-1/3 p-3 rounded-lg border border-gray-300"
          />
        </div>

        {/* Tabla principal */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Proveedor</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Cantidad</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                    Cargando...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                    No hay compras registradas
                  </td>
                </tr>
              ) : (
                currentItems.map((c) => (
                  <React.Fragment key={c.id_compra}>
                    <tr
                      className={`border-b hover:bg-gray-50 cursor-pointer ${
                        expandedRow === c.id_compra ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setExpandedRow(expandedRow === c.id_compra ? null : c.id_compra)}
                    >
                      <td className="px-6 py-3">{c.id_compra}</td>
                      <td className="px-6 py-3">{getNombreProveedor(c.NIT_proveedor)}</td>
                      <td className="px-6 py-3">{new Date(c.fecha_compra).toLocaleDateString()}</td>
                      <td className="px-6 py-3">{c.items?.length || 0}</td>
                      <td className="px-6 py-3">${c.total_compra?.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.estado === "Recibido" ? "bg-green-100 text-green-800" :
                          c.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                          c.estado === "En tránsito" ? "bg-blue-100 text-blue-800" :
                          "bg-pink-100 text-pink-800"
                        }`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal("ver", c); }}
                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200"
                            title="Ver"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal("editar", c); }}
                            className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center hover:bg-yellow-200"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal("eliminar", c); }}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal("status", c); }}
                            className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200"
                            title="Recibir"
                          >
                            <Package className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Maestro detalle: Información del proveedor + Pedidos recientes */}
                    {expandedRow === c.id_compra && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Información del proveedor */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-semibold mb-3">Información del Proveedor</h4>
                              {getProveedorInfo(c.NIT_proveedor) ? (
                                <div className="space-y-2 text-sm">
                                  <div><strong>Dirección:</strong> {getProveedorInfo(c.NIT_proveedor).direccion}</div>
                                  <div><strong>Productos:</strong> {getProveedorInfo(c.NIT_proveedor).productos}</div>
                                  <div><strong>Términos:</strong> {getProveedorInfo(c.NIT_proveedor).terminos}</div>
                                  <div>
                                    <strong>Sitio Web:</strong>{" "}
                                    <a href={getProveedorInfo(c.NIT_proveedor).sitioWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {getProveedorInfo(c.NIT_proveedor).sitioWeb}
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500">Proveedor no encontrado.</p>
                              )}
                            </div>

                            {/* Pedidos recientes */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-semibold mb-3">Pedidos Recientes</h4>
                              {loadingHistorial ? (
                                <p className="text-gray-500">Cargando...</p>
                              ) : historialProveedor.length === 0 ? (
                                <p className="text-gray-500">Sin pedidos previos.</p>
                              ) : (
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="py-2">ID</th>
                                      <th className="py-2">Fecha</th>
                                      <th className="py-2">Total</th>
                                      <th className="py-2">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {historialProveedor.map((p) => (
                                      <tr key={p.id_compra} className="border-b">
                                        <td className="py-2">{p.id_compra}</td>
                                        <td className="py-2">{new Date(p.fecha_compra).toLocaleDateString()}</td>
                                        <td className="py-2">${p.total_compra?.toLocaleString()}</td>
                                        <td className="py-2">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            p.estado === "Recibido" ? "bg-green-100 text-green-800" :
                                            p.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-blue-100 text-blue-800"
                                          }`}>
                                            {p.estado}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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

        {/* Paginación */}
        <div className="flex justify-center items-center gap-2 py-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {currentPage} de {totalPages || 1}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        {/* === MODAL CREAR/EDITAR === */}
        {(modal === "crear" || modal === "editar") && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold mb-4">
                {modal === "crear" ? "Crear nueva compra" : "Editar compra"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Proveedor *</label>
                    <select
                      value={form.NIT_proveedor}
                      onChange={handleProveedorChange}
                      className="w-full p-2 border rounded-lg"
                      required
                    >
                      <option value="">selecciona proveedor</option>
                      {proveedores.map((p) => (
                        <option key={p.NIT_proveedor} value={p.NIT_proveedor}>
                          {p.nombre_proveedor}
                        </option>
                      ))}
                    </select>

                    {form.NIT_proveedor && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                        <h4 className="font-medium text-gray-700 mb-2">Pedidos anteriores:</h4>
                        {loadingHistorial ? (
                          <p className="text-sm text-gray-500">Cargando...</p>
                        ) : historialProveedor.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin pedidos previos.</p>
                        ) : (
                          historialProveedor.map((p) => (
                            <div key={p.id_compra} className="flex justify-between items-center py-1 text-sm">
                              <span>
                                {p.id_compra} - {new Date(p.fecha_compra).toLocaleDateString()} - $
                                {p.total_compra?.toLocaleString()}
                              </span>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => cargarPedidoAnterior(p, true)}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1"
                                >
                                  Cargar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cargarPedidoAnterior(p, false)}
                                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                >
                                  Ref.
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de compra</label>
                    <input
                      type="date"
                      value={form.fecha_compra}
                      onChange={(e) => setForm({ ...form, fecha_compra: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                    <input
                      type="date"
                      value={form.fecha_aproximada_entrega}
                      onChange={(e) => setForm({ ...form, fecha_aproximada_entrega: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      min={form.fecha_compra}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En tránsito">En tránsito</option>
                      <option value="Recibido">Recibido</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Añadir Productos */}
                <div>
                  <label className="block text-sm font-medium mb-2">Añadir Productos</label>
                  <button
                    type="button"
                    onClick={openProductSelector}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
                  >
                    Seleccionar productos +
                  </button>
                </div>

                {/* Lista de productos */}
                {form.items.length > 0 && (
                  <div className="mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Producto</th>
                          <th className="text-left py-2">Color</th>
                          <th className="text-left py-2">Talla</th>
                          <th className="text-left py-2">Cantidad</th>
                          <th className="text-left py-2">Precio</th>
                          <th className="text-left py-2">Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.items.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{item.nombre_producto}</td>
                            <td className="py-2">{item.nombre_color || "—"}</td>
                            <td className="py-2">{item.nombre_talla || "—"}</td>
                            <td className="py-2">
                              <input
                                type="number"
                                min="0"
                                value={item.qty}
                                onChange={(e) =>
                                  updateItemField(idx, "qty", Number(e.target.value))
                                }
                                className="w-16 p-1 border rounded"
                              />
                            </td>
                            <td className="py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) =>
                                  updateItemField(idx, "price", Number(e.target.value))
                                }
                                className="w-20 p-1 border rounded"
                              />
                            </td>
                            <td className="py-2">
                              ${(item.qty * item.price).toLocaleString()}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="5" className="text-right font-bold">
                            Total:
                          </td>
                          <td className="font-bold">
                            $
                            {form.items
                              .reduce((sum, item) => sum + item.qty * item.price, 0)
                              .toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 rounded-2xl font-semibold text-white bg-red-500"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-2xl font-semibold text-white bg-[#3b10f0]"
                  >
                    {modal === "crear" ? "Registrar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL SELECCIONAR PRODUCTOS === */}
        {modal === "selectProducto" && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold mb-4">Selecciona los productos</h3>

              {/* Buscador */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar producto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-lg"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-4">
                {filteredProductos.map((p) => (
                  <div
                    key={p.id_producto}
                    className={`p-4 rounded-lg border ${
                      selectedProducts[p.id_producto] ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
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
                        <p className="text-sm text-gray-600 line-clamp-2">{p.descripcion || "Sin descripción"}</p>
                      </div>
                    </div>

                    {selectedProducts[p.id_producto] && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Colores */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Colores</label>
                          <div className="flex flex-wrap gap-2">
                            {p.variantes?.map((v) => (
                              <button
                                key={v.id_color}
                                onClick={() => handleColorSelect(p.id_producto, v.id_color)}
                                className={`w-6 h-6 rounded-full border-2 ${
                                  selectedProducts[p.id_producto]?.color === v.id_color
                                    ? "border-black ring-2 ring-offset-2 ring-black"
                                    : "border-gray-300"
                                }`}
                                style={{ backgroundColor: v.codigo_hex }}
                                title={v.nombre_color}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Tallas */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Tallas</label>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(p.variantes?.map(v => v.nombre_talla))).map(talla => (
                              <button
                                key={talla}
                                onClick={() => handleTallaSelect(p.id_producto, p.variantes.find(v => v.nombre_talla === talla)?.id_talla)}
                                className={`px-2 py-1 text-xs rounded border ${
                                  selectedProducts[p.id_producto]?.talla === p.variantes.find(v => v.nombre_talla === talla)?.id_talla
                                    ? "bg-blue-100 border-blue-500 text-blue-700"
                                    : "bg-white border-gray-300 text-gray-700"
                                }`}
                              >
                                {talla}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Cantidad</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedProducts[p.id_producto]?.qty || 0}
                            onChange={(e) => handleQtyChange(p.id_producto, e.target.value)}
                            className="w-20 p-1 border rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredProductos.length === 0 && (
                  <p className="text-gray-500 text-center py-10">No se encontraron productos.</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-3 rounded-2xl font-semibold text-white bg-red-500"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={saveSelectedProducts}
                  className="px-8 py-3 rounded-2xl font-semibold text-white bg-[#3b10f0]"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === MODAL VER === */}
        {modal === "ver" && selectedCompra && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Detalles de la Compra</h3>
              <p><strong>ID:</strong> {selectedCompra.id_compra}</p>
              <p><strong>Proveedor:</strong> {getNombreProveedor(selectedCompra.NIT_proveedor)}</p>
              <p><strong>Fecha compra:</strong> {new Date(selectedCompra.fecha_compra).toLocaleDateString("es-CO")}</p>
              <p><strong>Entrega aprox.:</strong> {selectedCompra.fecha_aproximada_entrega 
                ? new Date(selectedCompra.fecha_aproximada_entrega).toLocaleDateString("es-CO") 
                : "—"}</p>
              <p><strong>Total:</strong> {selectedCompra.total_compra !== undefined ? `$${selectedCompra.total_compra.toLocaleString()}` : "—"}</p>
              <p><strong>Estado:</strong> {selectedCompra.estado}</p>
              <div className="flex justify-end mt-4">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === MODAL ELIMINAR === */}
        {modal === "eliminar" && selectedCompra && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
              <p>¿Seguro que deseas eliminar la compra <strong>{selectedCompra.id_compra}</strong>?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === MODAL ACTUALIZAR ESTADO === */}
        {modal === "status" && selectedCompra && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Actualizar Estado del Pedido</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const estado = formData.get("estado");
                  const actualizarStock = formData.get("actualizarStock") === "on";
                  handleStatusUpdate(estado, actualizarStock);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Nuevo Estado</label>
                  <select
                    name="estado"
                    defaultValue={selectedCompra.estado}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En tránsito">En tránsito</option>
                    <option value="Recibido">Recibido</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <span>
                    <strong>Actualización automática de stock</strong><br />
                    Al marcar como "Recibido", el stock de los productos se actualizará automáticamente.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}