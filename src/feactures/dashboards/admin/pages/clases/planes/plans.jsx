import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../../../services/api";
import { configUi, cn } from "../../configuracion/configUi";

const PlanesAdmin = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  const [modalType, setModalType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    nombre_plan: "",
    descripcion: "",
    precio: "",
    numero_clases: 4,
    descuento_porcentaje: 0,
    duracion_meses: 1
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/planes");
      setPlanes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar planes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlanes(); }, []);

  const openModal = (type, plan = null) => {
    setModalType(type);
    setSelectedPlan(plan);
    if (type === "editar" && plan) {
      setFormData({
        nombre_plan: plan.nombre_plan,
        descripcion: plan.descripcion || "",
        precio: plan.precio,
        numero_clases: plan.numero_clases || 4,
        descuento_porcentaje: plan.descuento_porcentaje || 0,
        duracion_meses: plan.duracion_meses || 1
      });
    } else {
      setFormData({ nombre_plan: "", descripcion: "", precio: "", numero_clases: 4, descuento_porcentaje: 0, duracion_meses: 1 });
    }
    setFormErrors({});
  };

  const closeModal = () => { setModalType(null); setSelectedPlan(null); setFormErrors({}); setSubmitting(false); };

  const handleSave = async () => {
    const errors = {};
    if (!formData.nombre_plan.trim()) errors.nombre_plan = "El nombre es obligatorio";
    if (!formData.descripcion.trim() || formData.descripcion.length > 700) errors.descripcion = "La descripción es obligatoria (máx. 700 caracteres)";
    if (!formData.precio) errors.precio = "El precio es obligatorio";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    try {
      setSubmitting(true);
      if (modalType === "crear") {
        await api.post("/planes", formData);
        showNotification("Plan creado correctamente");
      } else {
        await api.put(`/planes/${selectedPlan.id_plan}`, formData);
        showNotification("Plan actualizado correctamente");
      }
      fetchPlanes();
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
      await api.delete(`/planes/${selectedPlan.id_plan}`);
      showNotification("Plan eliminado");
      fetchPlanes();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlanes = planes.filter(p => p.nombre_plan.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredPlanes.length / itemsPerPage));
  const currentItems = filteredPlanes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className={configUi.pageShell}>
        {/* Header */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>Planes de Clase</h2>
            <span className={configUi.countBadge}>{filteredPlanes.length} planes</span>
          </div>
          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar plan..." className={configUi.inputWithIcon} />
            </div>
            <button onClick={() => openModal("crear")} className={`${configUi.primaryButton} whitespace-nowrap`}>
              <Plus size={18} /> Nuevo Plan
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[28%]`}>Plan</th>
                  <th className={`${configUi.th} w-[30%]`}>Descripción</th>
                  <th className={`${configUi.th} text-right w-[12%]`}>Precio</th>
                  <th className={`${configUi.th} text-center w-[10%]`}>Clases</th>
                  <th className={`${configUi.th} text-center w-[10%]`}>Duración</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[10%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className={configUi.emptyState}>Cargando planes...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="6" className={configUi.emptyState}>No se encontraron planes.</td></tr>
                ) : currentItems.map((p) => (
                  <tr key={p.id_plan} className={configUi.row}>
                    <td className={`${configUi.td} font-bold text-[#16315f]`}>{p.nombre_plan}</td>
                    <td className={`${configUi.td} text-[#5b7398] max-w-[200px] truncate`}>{p.descripcion || "—"}</td>
                    <td className={`${configUi.td} text-right font-bold text-[#16315f]`}>${Number(p.precio).toLocaleString("es-CO")}</td>
                    <td className={`${configUi.td} text-center`}><span className={configUi.pill}>{p.numero_clases}</span></td>
                    <td className={`${configUi.td} text-center`}><span className={configUi.subtlePill}>{p.duracion_meses || 1} {p.duracion_meses === 1 ? "mes" : "meses"}</span></td>
                    <td className={`${configUi.td} text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal("ver", p)} className={configUi.actionButton} title="Ver"><Eye size={14} /></button>
                        <button onClick={() => openModal("editar", p)} className={configUi.actionButton} title="Editar"><Pencil size={14} /></button>
                        <button onClick={() => openModal("eliminar", p)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPlanes.length > 0 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span></p>
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
              className={`${configUi.modalPanel} ${modalType === "eliminar" ? "max-w-sm" : "max-w-xl"}`}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }} onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modalType === "crear" ? "Nuevo plan" : modalType === "editar" ? "Editar plan" : modalType === "ver" ? "Detalles del plan" : "Eliminar plan"}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {modalType === "eliminar" ? "Esta acción no se puede deshacer." : modalType === "ver" ? "Información de solo lectura." : "Completa todos los campos requeridos."}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
                </div>

                <div className={configUi.modalContent}>
                  {modalType === "eliminar" && (
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]"><Trash2 size={30} /></div>
                      <p className="text-sm leading-6 text-[#6b84aa]">
                        ¿Estás seguro de eliminar el plan <span className="font-bold text-[#d44966]">{selectedPlan?.nombre_plan}</span>?
                      </p>
                    </div>
                  )}

                  {modalType === "ver" && selectedPlan && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Nombre</label><div className={configUi.readOnlyField}>{selectedPlan.nombre_plan}</div></div>
                      <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Precio</label><div className={configUi.readOnlyField}>${Number(selectedPlan.precio).toLocaleString("es-CO")}</div></div>
                      <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Num. Clases</label><div className={configUi.readOnlyField}>{selectedPlan.numero_clases}</div></div>
                      <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Duración</label><div className={configUi.readOnlyField}>{selectedPlan.duracion_meses} {selectedPlan.duracion_meses === 1 ? "mes" : "meses"}</div></div>
                      <div className="md:col-span-2">
                        <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Descripción</label><div className={configUi.readOnlyField}>{selectedPlan.descripcion || "—"}</div></div>
                      </div>
                    </div>
                  )}

                  {(modalType === "crear" || modalType === "editar") && (
                    <form className="space-y-4">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Nombre del plan *</label>
                        <input type="text" value={formData.nombre_plan} onChange={(e) => setFormData({ ...formData, nombre_plan: e.target.value })}
                          className={cn(configUi.fieldInput, formErrors.nombre_plan && "border-red-400 bg-red-50")} placeholder="Ej: Plan Básico" />
                        {formErrors.nombre_plan && <p className="pl-1 text-[11px] text-red-500">{formErrors.nombre_plan}</p>}
                      </div>
                      <div className={configUi.fieldGroup}>
                        <div className="flex items-center justify-between">
                          <label className={configUi.fieldLabel}>Descripción *</label>
                          <span className={`text-[10px] font-bold ${formData.descripcion.length >= 700 ? "text-red-500" : "text-[#6b84aa]"}`}>{formData.descripcion.length}/700</span>
                        </div>
                        <textarea maxLength={700} rows={3} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                          className={cn(configUi.fieldTextarea, formErrors.descripcion && "border-red-400 bg-red-50")} placeholder="Descripción del plan..." />
                        {formErrors.descripcion && <p className="pl-1 text-[11px] text-red-500">{formErrors.descripcion}</p>}
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Precio *</label>
                          <input type="number" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            className={cn(configUi.fieldInput, formErrors.precio && "border-red-400 bg-red-50")} placeholder="0" />
                          {formErrors.precio && <p className="pl-1 text-[11px] text-red-500">{formErrors.precio}</p>}
                        </div>
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>N° Clases</label>
                          <input type="number" value={formData.numero_clases} onChange={(e) => setFormData({ ...formData, numero_clases: e.target.value })} className={configUi.fieldInput} min="1" />
                        </div>
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Duración (meses)</label>
                          <input type="number" value={formData.duracion_meses} onChange={(e) => setFormData({ ...formData, duracion_meses: e.target.value })} className={configUi.fieldInput} min="1" />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-sm text-[#6b84aa]">{modalType === "ver" ? "Solo lectura." : "Los cambios se aplican al guardar."}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>{modalType === "ver" ? "Cerrar" : "Cancelar"}</button>
                    {(modalType === "crear" || modalType === "editar") && (
                      <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>
                        {submitting ? "Guardando..." : modalType === "crear" ? "Crear plan" : "Guardar cambios"}
                      </button>
                    )}
                    {modalType === "eliminar" && <button onClick={handleDelete} disabled={submitting} className={configUi.dangerButton}>{submitting ? "Eliminando..." : "Eliminar"}</button>}
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

export default PlanesAdmin;
