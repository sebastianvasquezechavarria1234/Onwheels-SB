import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../../../services/api";
import { configUi, cn } from "../../configuracion/configUi";

const ClassLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  const [modalType, setModalType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [formData, setFormData] = useState({ nombre_nivel: "", descripcion: "" });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/niveles");
      setLevels(res.data);
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar niveles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLevels(); }, []);

  const openModal = (type, level = null) => {
    setModalType(type);
    setSelectedLevel(level);
    if (type === "editar" && level) {
      setFormData({ nombre_nivel: level.nombre_nivel, descripcion: level.descripcion || "" });
    } else {
      setFormData({ nombre_nivel: "", descripcion: "" });
    }
    setFormErrors({});
  };

  const closeModal = () => { setModalType(null); setSelectedLevel(null); setFormErrors({}); setSubmitting(false); };

  const handleSave = async () => {
    if (!formData.nombre_nivel.trim()) {
      setFormErrors({ nombre_nivel: "El nombre es obligatorio" });
      return;
    }
    try {
      setSubmitting(true);
      if (modalType === "crear") {
        await api.post("/niveles", formData);
        showNotification("Nivel creado correctamente");
      } else {
        await api.put(`/niveles/${selectedLevel.id_nivel}`, formData);
        showNotification("Nivel actualizado correctamente");
      }
      fetchLevels();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/niveles/${selectedLevel.id_nivel}`);
      showNotification("Nivel eliminado");
      fetchLevels();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLevels = Array.isArray(levels)
    ? levels.filter(lvl => lvl.nombre_nivel.toLowerCase().includes(search.toLowerCase()))
    : [];
  const totalPages = Math.max(1, Math.ceil(filteredLevels.length / itemsPerPage));
  const currentItems = filteredLevels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className={configUi.pageShell}>
        {/* Header */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title}>Niveles de Clase</h2>
            <span className={configUi.countBadge}>{filteredLevels.length} niveles</span>
          </div>
          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar nivel..."
                className={configUi.inputWithIcon}
              />
            </div>
            <button onClick={() => openModal("crear")} className={`${configUi.primaryButton} whitespace-nowrap`}>
              <Plus size={18} /> Nuevo Nivel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} w-[30%]`}>Nivel</th>
                  <th className={`${configUi.th} w-[45%]`}>Descripción</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Estado</th>
                  <th className={`${configUi.th} text-right w-[10%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className={configUi.emptyState}>Cargando niveles...</td></tr>
                ) : filteredLevels.length === 0 ? (
                  <tr><td colSpan="4" className={configUi.emptyState}>No se encontraron niveles registrados.</td></tr>
                ) : (
                  currentItems.map((lvl) => (
                  <tr key={lvl.id_nivel} className={configUi.row}>
                    <td className={`${configUi.td} font-bold text-[#16315f]`}>{lvl.nombre_nivel}</td>
                    <td className={`${configUi.td} text-[#5b7398]`}>{lvl.descripcion || "—"}</td>
                    <td className={`${configUi.td} text-center`}>
                      <span className={(lvl.estado || "Activo") === "Activo" ? configUi.successPill : configUi.dangerPill}>
                        {lvl.estado || "Activo"}
                      </span>
                    </td>
                    <td className={`${configUi.td} text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal("ver", lvl)} className={configUi.actionButton} title="Detalle"><Eye size={14} /></button>
                        <button onClick={() => openModal("editar", lvl)} className={configUi.actionButton} title="Modificar"><Pencil size={14} /></button>
                        <button onClick={() => openModal("eliminar", lvl)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
          {filteredLevels.length > 0 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={configUi.paginationButton}><ChevronLeft size={18} /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={configUi.paginationButton}><ChevronRight size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-blue-600" : "bg-red-600"}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div
              className={cn(configUi.modalPanel, modalType === "eliminar" ? "max-w-sm" : "max-w-lg")}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }} onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modalType === "crear" ? "Nuevo nivel" : modalType === "editar" ? "Editar nivel" : modalType === "ver" ? "Detalles del nivel" : "Eliminar nivel"}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {modalType === "eliminar" ? "Esta acción no se puede deshacer." : modalType === "ver" ? "Información de solo lectura." : "Completa los campos requeridos."}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
                </div>

                <div className={configUi.modalContent}>
                  {modalType === "eliminar" && (
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]"><Trash2 size={30} /></div>
                      <p className="text-sm leading-6 text-[#6b84aa]">
                        ¿Estás seguro de eliminar el nivel <span className="font-bold text-[#d44966]">{selectedLevel?.nombre_nivel}</span>?
                      </p>
                    </div>
                  )}

                  {modalType === "ver" && selectedLevel && (
                    <div className="space-y-4">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Nombre del nivel</label>
                        <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#16315f]">{selectedLevel.nombre_nivel}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Descripción</label>
                        <div className={configUi.readOnlyField}>{selectedLevel.descripcion || "Sin descripción"}</div>
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Estado</label>
                        <div className={configUi.readOnlyField}>{selectedLevel.estado || "Activo"}</div>
                      </div>
                    </div>
                  )}

                  {(modalType === "crear" || modalType === "editar") && (
                    <form className="space-y-4">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Nombre del nivel *</label>
                        <input
                          type="text"
                          value={formData.nombre_nivel}
                          onChange={(e) => setFormData({ ...formData, nombre_nivel: e.target.value })}
                          className={cn(configUi.fieldInput, formErrors.nombre_nivel && "border-red-400 bg-red-50")}
                          placeholder="Ej: Básico, Intermedio..."
                        />
                        {formErrors.nombre_nivel && <p className="pl-1 text-[11px] text-red-500">{formErrors.nombre_nivel}</p>}
                      </div>
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Descripción</label>
                        <textarea
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                          className={configUi.fieldTextarea}
                          placeholder="Descripción opcional..."
                        />
                      </div>
                    </form>
                  )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-sm text-[#6b84aa]">{modalType === "ver" ? "Solo lectura." : "Los cambios se aplican al guardar."}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>{modalType === "ver" ? "Cerrar" : "Cancelar"}</button>
                    {(modalType === "crear" || modalType === "editar") && (
                      <button onClick={handleSave} disabled={submitting} className={configUi.primaryButton}>
                        {submitting ? "Guardando..." : modalType === "crear" ? "Crear nivel" : "Guardar cambios"}
                      </button>
                    )}
                    {modalType === "eliminar" && (
                      <button onClick={handleDelete} disabled={submitting} className={configUi.dangerButton}>
                        {submitting ? "Eliminando..." : "Eliminar"}
                      </button>
                    )}
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

export default ClassLevels;
