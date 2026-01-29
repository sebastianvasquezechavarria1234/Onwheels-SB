import React, { useEffect, useState, useCallback } from "react";

import { Search, Plus, Pen, Trash2, Eye, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getCompras,
  deleteCompra,
  updateCompraStatus,
  getProveedores,
} from "../../services/comprasService";

export default function Compras() {
  const navigate = useNavigate();
  // ===== Estados principales =====
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para modal Eliminar (pequeño y simple, vale la pena mantenerlo modal)
  const [modalDelete, setModalDelete] = useState(null); // id_compra o null
  const [selectedCompra, setSelectedCompra] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedorFiltro, setProveedorFiltro] = useState("todos");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Notificaciones
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  // ==== Fetch inicial ====
  const fetchData = async () => {
    try {
      setLoading(true);
      const [comprasData, proveedoresData] = await Promise.all([
        getCompras(),
        getProveedores(),
      ]);
      setCompras(comprasData || []);
      setProveedores(proveedoresData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al cargar listado de compras", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==== Eliminar compra ====
  const handleDeleteClick = (compra) => {
    setSelectedCompra(compra);
    setModalDelete(true);
  }

  const confirmDelete = async () => {
    if (!selectedCompra) return;
    try {
      await deleteCompra(selectedCompra.id_compra);
      showNotification("Compra eliminada correctamente", "success");
      await fetchData();
    } catch (err) {
      console.error("Error al eliminar:", err);
      // Extraer mensaje de error del backend si existe
      const msg = err.response?.data?.mensaje || "No se pudo eliminar la compra";
      showNotification(msg, "error");
    } finally {
      setModalDelete(false);
      setSelectedCompra(null);
    }
  };

  // ==== Navegación ====
  const goToCreate = () => navigate("/admin/compras/crear");
  const goToDetail = (id) => navigate(`/admin/compras/detalle/${id}`);
  const goToEdit = (id) => navigate(`/admin/compras/editar/${id}`);

  // ==== Filtrado / paginación ====
  const getNombreProveedor = (nit) =>
    proveedores.find((p) => p.nit === nit || p.NIT_proveedor === nit)?.nombre_proveedor || "—";

  const filteredCompras = compras.filter((c) => {
    const matchesSearch =
      String(c.id_compra).includes(searchTerm) ||
      getNombreProveedor(c.nit || c.nit_proveedor).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.fecha_compra && new Date(c.fecha_compra).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()));

    // Ajuste: Backend devuelve nit_proveedor a veces o nit. Asegurar consistencia.
    const nitC = c.nit || c.nit_proveedor;
    const matchesProveedor = proveedorFiltro === "todos" || nitC === proveedorFiltro;
    return matchesSearch && matchesProveedor;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage));
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const visibleItems = filteredCompras.slice(indexFirst, indexLast);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <children>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Compras / Gestión de Compras</h2>

          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white shadow-lg ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                  }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filtros y acciones */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <select
                  value={proveedorFiltro}
                  onChange={(e) => {
                    setProveedorFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700"
                >
                  <option value="todos">Todos los proveedores</option>
                  {proveedores.map((p) => (
                    <option key={p.nit || p.NIT_proveedor} value={p.nit || p.NIT_proveedor}>
                      {p.nombre_proveedor}
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
                  placeholder="Buscar por ID, proveedor o fecha..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
            <button
              onClick={goToCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar Compra
            </button>
          </div>

          {/* Tabla compras */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Proveedor</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3 text-center">Items</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-center">Estado</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
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
                        No hay compras registradas
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((c) => (
                      <tr key={c.id_compra} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{c.id_compra}</td>
                        <td className="px-6 py-4">{getNombreProveedor(c.nit || c.nit_proveedor)}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {c.fecha_compra ? new Date(c.fecha_compra).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                            {c.items?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                          ${(Number(c.total_compra || c.total) || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.estado === "Recibida"
                              ? "bg-green-100 text-green-700"
                              : c.estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-700"
                                : c.estado === "Cancelada"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                          >
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => goToDetail(c.id_compra)}
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition"
                              title="Ver detalles"
                            >
                              <Eye size={18} />
                            </button>
                            {c.estado !== "Recibida" && c.estado !== "Cancelada" && (
                              <button
                                onClick={() => goToEdit(c.id_compra)}
                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                                title="Editar"
                              >
                                <Pen size={18} />
                              </button>
                            )}
                            {/* Solo permitir eliminar si no está Recibida (por consistencia de stock) */}
                            {c.estado !== "Recibida" && (
                              <button
                                onClick={() => handleDeleteClick(c)}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-gray-600">Página {currentPage} de {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1 rounded border bg-white disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal Eliminar */}
      <AnimatePresence>
        {modalDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">Eliminar Compra</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de eliminar la compra #{selectedCompra?.id_compra}? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalDelete(false)}
                  className="flex-1 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </children>
  );
}
