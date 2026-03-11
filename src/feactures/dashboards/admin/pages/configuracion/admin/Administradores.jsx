// src/features/dashboards/admin/pages/Administradores.jsx
import React, { useEffect, useState, useCallback } from "react";

import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Download, SlidersHorizontal } from "lucide-react";
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [filterType, setFilterType] = useState("Todos los admins");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchAdministradores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [adminsRes, usuariosData] = await Promise.all([
        getAdministradores({ page: currentPage, limit: itemsPerPage, search }),
        getUsuariosSoloConRolCliente()
      ]);
      if (adminsRes && adminsRes.data) {
        setAdministradores(adminsRes.data);
        setTotalPages(adminsRes.totalPages || 1);
        setTotalItems(adminsRes.total || 0);
      } else {
        setAdministradores(Array.isArray(adminsRes) ? adminsRes : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(adminsRes) ? adminsRes.length : 0);
      }
      setUsuariosDisponibles(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (err) {
      console.error("Error cargando administradores:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdministradores();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
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

  const handleDownload = () => {
    if (!administradores || administradores.length === 0) return;
    const header = ["Nombre Completo", "Email", "Tipo Admin", "Area"];
    const csvData = currentItems.map(a => [
      `"${a.nombre_completo}"`,
      a.email,
      a.tipo_admin || "General",
      a.area || ""
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "administradores_report_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentItems = administradores.filter(a => {
    if (filterType === "Superadmin") return a.tipo_admin?.toLowerCase() === "superadmin";
    if (filterType === "Soporte") return a.tipo_admin?.toLowerCase() === "soporte";
    return true; // Todos los admins
  });

  return (
    <>
      <div className="flex flex-col h-full bg-white overflow-hidden p-2 md:p-4">
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-[28px] font-black text-[#040529] tracking-tight whitespace-nowrap" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Admin y Personal
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar administradores..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#040529]/10 transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white border border-slate-200 text-slate-500 py-2.5 pl-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#040529]/10 cursor-pointer"
              >
                <option value="Todos los admins">Todos los admins</option>
                <option value="Superadmin">Superadmin</option>
                <option value="Soporte">Soporte</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {/* Create Button */}
            <button
              onClick={() => openModal("crear")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#040529] hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Plus size={18} />
              Registrar Admin
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide rounded-tl-xl w-[20%]">Nombre</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[25%]">Email</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[20%]">Tipo</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[20%]">Área</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide text-right rounded-tr-xl w-[15%]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">Cargando administradores...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No se encontraron administradores.</td>
                  </tr>
                ) : (
                  currentItems.map((a, i) => (
                    <tr key={a.id_admin} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-[#040529] text-base">{a.nombre_completo}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{a.email}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200 whitespace-nowrap">
                          {a.tipo_admin || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">{a.area || "—"}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal("ver", a)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm"
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openModal("editar", a)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openModal("eliminar", a)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition shadow-sm"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <div className="border-t border-slate-100 px-6 py-4 bg-white flex items-center justify-between mt-auto">
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#040529]">{currentPage}</span> de <span className="text-[#040529]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#040529] disabled:opacity-50 transition shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#040529] disabled:opacity-50 transition shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
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
    </>
  );
};

export default Administradores;