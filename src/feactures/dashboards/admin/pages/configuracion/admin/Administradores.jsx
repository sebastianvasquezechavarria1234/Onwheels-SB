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
import { configUi } from "../configUi";

export const Administradores = () => {
  const [administradores, setAdministradores] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
        getAdministradores(), // Fetch all
        getUsuariosSoloConRolCliente()
      ]);
      setAdministradores(Array.isArray(adminsRes) ? adminsRes : (adminsRes.data || []));
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
      if (!formData.id_usuario || !formData.tipo_admin?.trim() || !formData.area?.trim()) {
        showNotification("Todos los campos son obligatorios", "error");
        return;
      }

      setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedAdmin) return;

      if (!formData.tipo_admin?.trim() || !formData.area?.trim()) {
        showNotification("Todos los campos son obligatorios", "error");
        return;
      }

      setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedAdmin) return;
      setSubmitting(true);
      await deleteAdministrador(selectedAdmin.id_admin);
      await fetchAdministradores();
      closeModal();
      showNotification("Administrador eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando administrador:", err);
      // Mostrar el error exacto del backend
      const errorMessage = err.response?.data?.mensaje || "Error eliminando administrador";
      showNotification(errorMessage, "error");
      closeModal(); // Cerrar modal después de error
    } finally {
      setSubmitting(false);
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
    setSubmitting(false);
    setFormData({
      id_usuario: "",
      tipo_admin: "",
      area: ""
    });
  };

  const filteredAdmins = React.useMemo(() => {
    return administradores.filter(a => {
      const q = search.toLowerCase();
      const matchesSearch = a.nombre_completo.toLowerCase().includes(q) || 
                           a.email.toLowerCase().includes(q) ||
                           (a.area || "").toLowerCase().includes(q);
      
      if (filterType === "Superadmin") return matchesSearch && a.tipo_admin?.toLowerCase() === "superadmin";
      if (filterType === "Soporte") return matchesSearch && a.tipo_admin?.toLowerCase() === "soporte";
      return matchesSearch;
    });
  }, [administradores, search, filterType]);

  const totalFiltered = filteredAdmins.length;
  const totalPagesLocal = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const currentItems = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownload = () => {
    if (!filteredAdmins || filteredAdmins.length === 0) return;
    const header = ["Nombre Completo", "Email", "Tipo Admin", "Area"];
    const csvData = filteredAdmins.map(a => [
      `"${a.nombre_completo}"`,
      a.email,
      a.tipo_admin || "General",
      `"${a.area || ""}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [header.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_administradores_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Admin y Personal
            </h2>
            <span className={configUi.countBadge}>{totalFiltered} registros</span>
          </div>

          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar administradores..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className={configUi.select}
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
              className={configUi.iconButton} title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {/* Create Button */}
            <button
              onClick={() => openModal("crear")}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Registrar Admin
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[20%]`}>Nombre</th>
                  <th className={`${configUi.th} w-[25%]`}>Email</th>
                  <th className={`${configUi.th} w-[20%]`}>Tipo</th>
                  <th className={`${configUi.th} w-[20%]`}>Area</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[15%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>Cargando administradores...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>No se encontraron administradores.</td>
                  </tr>
                ) : (
                  currentItems.map((a, i) => (
                    <tr key={a.id_admin} className={configUi.row}>
                      <td className={`${configUi.td} font-bold text-[#16315f]`}>{a.nombre_completo}</td>
                      <td className={`${configUi.td} text-[#5b7398]`}>{a.email}</td>
                      <td className={configUi.td}>
                        <span className={configUi.pill}>
                          {a.tipo_admin || "General"}
                        </span>
                      </td>
                      <td className={`${configUi.td} text-[#5b7398]`}>{a.area || "-"}</td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal("ver", a)}
                            className={configUi.actionButton}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openModal("editar", a)}
                            className={configUi.actionButton}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openModal("eliminar", a)}
                            className={configUi.actionDangerButton}
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
          {totalPagesLocal > 1 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPagesLocal}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={configUi.paginationButton}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={currentPage === totalPagesLocal}
                  onClick={() => setCurrentPage((p) => Math.min(totalPagesLocal, p + 1))}
                  className={configUi.paginationButton}
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
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`${configUi.modalPanel} ${modal === "ver" ? "max-w-2xl" : "max-w-xl"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === "crear"
                        ? "Registrar administrador"
                        : modal === "editar"
                          ? "Editar administrador"
                          : modal === "ver"
                            ? "Detalles del administrador"
                            : "Eliminar administrador"}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {modal === "crear" || modal === "editar"
                        ? "Completa solo los campos necesarios para este perfil administrativo."
                        : modal === "ver"
                          ? "Resumen compacto del usuario administrativo seleccionado."
                          : "Confirma la eliminacion solo si estas seguro."}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                  {modal === "crear" && (
                    <form className="space-y-4">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Usuario</label>
                        <select
                          name="id_usuario"
                          value={formData.id_usuario}
                          onChange={handleChange}
                          className={configUi.fieldSelect}
                        >
                          <option value="">Seleccionar usuario</option>
                          {usuariosDisponibles.map(usuario => (
                            <option key={usuario.id_usuario} value={usuario.id_usuario}>
                              {usuario.nombre_completo} ({usuario.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Tipo de administrador</label>
                          <input
                            type="text"
                            name="tipo_admin"
                            value={formData.tipo_admin}
                            onChange={handleChange}
                            className={configUi.fieldInput}
                            placeholder="Ej: Superadmin"
                          />
                        </div>
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Area</label>
                          <input
                            type="text"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className={configUi.fieldInput}
                            placeholder="Ej: Academica"
                          />
                        </div>
                      </div>
                    </form>
                  )}

                  {modal === "editar" && selectedAdmin && (
                    <form className="space-y-4">
                      <div className={configUi.formSection}>
                        <label className={configUi.fieldLabel}>Usuario</label>
                        <div className={`${configUi.readOnlyField} mt-1`}>
                          {selectedAdmin.nombre_completo} ({selectedAdmin.email})
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Tipo de administrador</label>
                          <input
                            type="text"
                            name="tipo_admin"
                            value={formData.tipo_admin}
                            onChange={handleChange}
                            className={configUi.fieldInput}
                            placeholder="Ej: Superadmin"
                          />
                        </div>
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Area</label>
                          <input
                            type="text"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className={configUi.fieldInput}
                            placeholder="Ej: Recursos Humanos"
                          />
                        </div>
                      </div>
                    </form>
                  )}

                  {modal === "ver" && selectedAdmin && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Nombre</label>
                        <div className={configUi.readOnlyField}>{selectedAdmin.nombre_completo}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Email</label>
                        <div className={configUi.readOnlyField}>{selectedAdmin.email}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Telefono</label>
                        <div className={configUi.readOnlyField}>{selectedAdmin.telefono || "-"}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Documento</label>
                        <div className={configUi.readOnlyField}>{selectedAdmin.documento || "-"}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Tipo</label>
                        <div className={configUi.readOnlyField}>{selectedAdmin.tipo_admin || "-"}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Area</label>
                        <div className={configUi.readOnlyField}>{selectedAdmin.area || "-"}</div>
                      </div>
                    </div>
                  )}

                  {modal === "eliminar" && selectedAdmin && (
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                        <Trash2 size={30} />
                      </div>
                      <p className="text-sm leading-6 text-[#6b84aa]">
                        ¿Estas seguro de eliminar al administrador <span className="font-bold text-[#d44966]">{selectedAdmin.nombre_completo}</span>?
                      </p>
                    </div>
                  )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-sm text-[#6b84aa]">{modal === "ver" ? "Informacion solo lectura." : "Los cambios se aplican inmediatamente al guardar."}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                    {modal === "crear" && <button type="button" onClick={handleCreate} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Registrando..." : "Registrar"}</button>}
                    {modal === "editar" && <button type="button" onClick={handleEdit} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Actualizando..." : "Actualizar"}</button>}
                    {modal === "eliminar" && <button onClick={handleDelete} disabled={submitting} className={configUi.dangerButton}>{submitting ? "Eliminando..." : "Eliminar"}</button>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Administradores;
