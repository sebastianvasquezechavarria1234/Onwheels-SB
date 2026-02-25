// src/features/dashboards/admin/pages/Administradores.jsx
import React, { useEffect, useState, useCallback } from "react";

import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getAdministradores,
  createAdministrador,
  updateAdministrador,
  deleteAdministrador,
  getUsuariosSoloConRolCliente // ✅ Nombre actualizado
} from "../../services/administradoresServices";

export const Administradores = () => {
  const [administradores, setAdministradores] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: "",
    tipo_admin: "",
    area: ""
  });
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchAdministradores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [adminsData, usuariosData] = await Promise.all([
        getAdministradores(),
        getUsuariosSoloConRolCliente() // ✅ Llamada actualizada
      ]);
      setAdministradores(Array.isArray(adminsData) ? adminsData : []);
      setUsuariosDisponibles(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (err) {
      console.error("Error cargando administradores:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdministradores();
  }, [fetchAdministradores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      if (!formData.id_usuario) {
        showNotification("El usuario es obligatorio", "error");
        return;
      }

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        tipo_admin: formData.tipo_admin || null,
        area: formData.area || null
      };

      await createAdministrador(payload);
      await fetchAdministradores();
      closeModal();
      showNotification("Administrador creado con éxito");
    } catch (err) {
      console.error("Error creando administrador:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando administrador";
      showNotification(errorMessage, "error");
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedAdmin) return;

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        tipo_admin: formData.tipo_admin || null,
        area: formData.area || null
      };

      await updateAdministrador(selectedAdmin.id_admin, payload);
      await fetchAdministradores();
      closeModal();
      showNotification("Administrador actualizado con éxito");
    } catch (err) {
      console.error("Error editando administrador:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando administrador";
      showNotification(errorMessage, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedAdmin) return;
      await deleteAdministrador(selectedAdmin.id_admin);
      await fetchAdministradores();
      closeModal();
      showNotification("Administrador eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando administrador:", err);
      const errorMessage = err.response?.data?.mensaje || "Error eliminando administrador";
      showNotification(errorMessage, "error");
    }
  };

  const openModal = (type, admin = null) => {
    setModal(type);
    setSelectedAdmin(admin);

    if (type === "crear") {
      setFormData({
        id_usuario: "",
        tipo_admin: "",
        area: ""
      });
    } else if (admin) {
      setFormData({
        id_usuario: admin.id_usuario.toString(),
        tipo_admin: admin.tipo_admin || "",
        area: admin.area || ""
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedAdmin(null);
    setFormData({
      id_usuario: "",
      tipo_admin: "",
      area: ""
    });
  };

  const administradoresFiltrados = administradores.filter((a) =>
    (a.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.tipo_admin || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.area || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(administradoresFiltrados.length / itemsPerPage));
  const currentItems = administradoresFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-4 p-2 pb-4">

          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
              Usuarios / Administradores
            </h2>
          </div>

          {/* Row 2: Active Toolbar (Big Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
            {/* Search & Create Group */}
            <div className="flex flex-1 w-full sm:w-auto gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar administradores..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
                />
              </div>
              <button
                onClick={() => openModal("crear")}
                className="flex items-center gap-2 px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus size={18} />
                Registrar Administrador
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 w-[20%]">Nombre</th>
                  <th className="px-6 py-3 w-[20%]">Email</th>
                  <th className="px-6 py-3 w-[15%]">Tipo</th>
                  <th className="px-6 py-3 w-[15%]">Área</th>
                  <th className="px-6 py-3 w-[20%]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Cargando administradores...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                      No se encontraron administradores.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((a) => (
                    <tr key={a.id_admin} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium">{a.nombre_completo}</td>
                      <td className="px-6 py-4 text-gray-600">{a.email}</td>
                      <td className="px-6 py-4 text-gray-600">{a.tipo_admin || "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{a.area || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal("ver", a)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal("editar", a)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal("eliminar", a)}
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

        {administradoresFiltrados.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded-lg ${currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
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
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-blue-600" : "bg-red-600"
              }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <AnimatePresence>
        {modal && (
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
                {modal === "crear"
                  ? "Registrar Administrador"
                  : modal === "editar"
                    ? "Editar Administrador"
                    : modal === "ver"
                      ? "Detalles del Administrador"
                      : "Eliminar Administrador"}
              </h3>

              {modal === "crear" && (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario *
                    </label>
                    <select
                      name="id_usuario"
                      value={formData.id_usuario}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Seleccionar usuario</option>
                      {usuariosDisponibles.map(usuario => (
                        <option key={usuario.id_usuario} value={usuario.id_usuario}>
                          {usuario.nombre_completo} ({usuario.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Administrador
                    </label>
                    <input
                      type="text"
                      name="tipo_admin"
                      value={formData.tipo_admin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ej: Superadmin, Coordinador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ej: Académica, Finanzas"
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
                      onClick={handleCreate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              )}

              {modal === "editar" && selectedAdmin && (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                      {selectedAdmin.nombre_completo} ({selectedAdmin.email})
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Administrador
                    </label>
                    <input
                      type="text"
                      name="tipo_admin"
                      value={formData.tipo_admin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ej: Superadmin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Ej: Recursos Humanos"
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
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              )}

              {modal === "ver" && selectedAdmin && (
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Nombre:</span>
                    <span className="text-right">{selectedAdmin.nombre_completo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-right">{selectedAdmin.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Teléfono:</span>
                    <span className="text-right">{selectedAdmin.telefono || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Documento:</span>
                    <span className="text-right">{selectedAdmin.documento || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tipo:</span>
                    <span className="text-right">{selectedAdmin.tipo_admin || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Área:</span>
                    <span className="text-right">{selectedAdmin.area || "—"}</span>
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

              {modal === "eliminar" && selectedAdmin && (
                <div className="text-center space-y-4">
                  <p className="text-gray-700">
                    ¿Está seguro de eliminar al administrador{" "}
                    <span className="font-bold text-red-600">{selectedAdmin.nombre_completo}</span>?
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
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
    </div >
    </>
  );
};

export default Administradores;