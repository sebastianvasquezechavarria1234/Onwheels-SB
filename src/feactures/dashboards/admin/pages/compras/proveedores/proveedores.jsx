

import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal y formularios
  const [modalType, setModalType] = useState(null); // "add", "edit", "details", "delete"
  const [selected, setSelected] = useState(null);
  const [addForm, setAddForm] = useState({
    nit: "",
    nombre_proveedor: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [editForm, setEditForm] = useState({
    nit: "",
    nombre_proveedor: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  // Notificación
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // 'success' | 'error'
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cargar proveedores
  const fetchProveedores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/api/proveedores");
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
      setError("No se pudieron cargar los proveedores.");
      showNotification("Error al cargar proveedores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  // Abrir modal
  const openModal = (type, item = null) => {
    setModalType(type);
    if (type === "add") {
      setAddForm({
        nit: "",
        nombre_proveedor: "",
        email: "",
        telefono: "",
        direccion: "",
      });
      setSelected(null);
    } else if (type === "edit" && item) {
      setSelected(item);
      setEditForm({ ...item });
    } else {
      setSelected(item);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  // Manejo de cambios en formularios
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validación
  const validateForm = (form) => {
    if (!form.nit.trim()) {
      showNotification("El NIT es obligatorio", "error");
      return false;
    }
    if (!/^\d+$/.test(form.nit)) {
      showNotification("El NIT debe contener solo números", "error");
      return false;
    }
    if (!form.nombre_proveedor.trim()) {
      showNotification("El nombre del proveedor es obligatorio", "error");
      return false;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showNotification("El correo electrónico no es válido", "error");
      return false;
    }
    return true;
  };

  // Guardar nuevo proveedor
  const saveAdd = async () => {
    if (!validateForm(addForm)) return;
    try {
      const res = await fetch("http://localhost:3000/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error("Error al crear el proveedor");
      const newProveedor = await res.json();
      setProveedores((prev) => [newProveedor, ...prev]);
      closeModal();
      showNotification("Proveedor creado con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al crear el proveedor", "error");
    }
  };

  // Actualizar proveedor
  const saveEdit = async () => {
    if (!selected || !validateForm(editForm)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/proveedores/${selected.nit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Error al actualizar el proveedor");
      setProveedores((prev) =>
        prev.map((p) => (p.nit === selected.nit ? { ...p, ...editForm } : p))
      );
      closeModal();
      showNotification("Proveedor actualizado con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al actualizar el proveedor", "error");
    }
  };

  // Eliminar proveedor
  const confirmDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`http://localhost:3000/api/proveedores/${selected.nit}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el proveedor");
      setProveedores((prev) =>
        prev.filter((p) => p.nit !== selected.nit)
      );
      closeModal();
      showNotification("Proveedor eliminado con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al eliminar el proveedor", "error");
    }
  };

  // Filtrado y paginación
  const proveedoresFiltrados = proveedores.filter(
    (p) =>
      p.nombre_proveedor?.toLowerCase().includes(search.toLowerCase()) ||
      p.nit?.toString().includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(proveedoresFiltrados.length / itemsPerPage));
  const currentItems = proveedoresFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Compras / Proveedores</h2>

          {/* Barra de búsqueda y botón */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="text"
                placeholder="Buscar proveedor (NIT o nombre)"
              />
            </div>
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Añadir Proveedor
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-1/6">NIT</th>
                    <th className="px-6 py-3 w-1/4">Nombre</th>
                    <th className="px-6 py-3 w-1/4">Email</th>
                    <th className="px-6 py-3 w-1/6">Teléfono</th>
                    <th className="px-6 py-3 w-1/6">Dirección</th>
                    <th className="px-6 py-3 w-1/6">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Cargando proveedores...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                        No se encontraron proveedores.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((prov) => (
                      <tr
                        key={prov.nit}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium">{prov.nit}</td>
                        <td className="px-6 py-4 font-medium">{prov.nombre_proveedor}</td>
                        <td className="px-6 py-4 text-gray-600 line-clamp-1">
                          {prov.email || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{prov.telefono || "—"}</td>
                        <td className="px-6 py-4 text-gray-600 line-clamp-1">
                          {prov.direccion || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("details", prov)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("edit", prov)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("delete", prov)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {proveedoresFiltrados.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-blue-700">{currentPage}</span> de{" "}
                {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Notificación Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${
                notification.type === "success" ? "bg-blue-600" : "bg-red-600"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {modalType && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">
                  {modalType === "add"
                    ? "Añadir Proveedor"
                    : modalType === "edit"
                    ? "Editar Proveedor"
                    : modalType === "details"
                    ? "Detalles del Proveedor"
                    : "Eliminar Proveedor"}
                </h3>

                {modalType === "add" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIT *
                      </label>
                      <input
                        name="nit"
                        value={addForm.nit}
                        onChange={handleAddChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 900123456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        name="nombre_proveedor"
                        value={addForm.nombre_proveedor}
                        onChange={handleAddChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Distribuidora XYZ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={addForm.email}
                        onChange={handleAddChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="contacto@proveedor.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        name="telefono"
                        value={addForm.telefono}
                        onChange={handleAddChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        name="direccion"
                        value={addForm.direccion}
                        onChange={handleAddChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Calle 123 #45-67"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "edit" && selected && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIT *
                      </label>
                      <input
                        name="nit"
                        value={editForm.nit}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 900123456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        name="nombre_proveedor"
                        value={editForm.nombre_proveedor}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Distribuidora XYZ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="contacto@proveedor.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        name="telefono"
                        value={editForm.telefono}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        name="direccion"
                        value={editForm.direccion}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Calle 123 #45-67"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "details" && selected && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">NIT:</span>
                      <span>{selected.nit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span>{selected.nombre_proveedor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selected.email || "— Sin email —"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span>{selected.telefono || "— Sin teléfono —"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dirección:</span>
                      <span className="text-right">{selected.direccion || "— Sin dirección —"}</span>
                    </div>
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}

                {modalType === "delete" && selected && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar al proveedor{" "}
                      <span className="font-bold text-red-600">{selected.nombre_proveedor}</span>?
                      <br />
                      <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}