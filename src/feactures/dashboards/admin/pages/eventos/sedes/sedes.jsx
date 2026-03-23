import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, MapPin, Hash, ArrowUpDown, ChevronLeft, ChevronRight, Phone, Home, Building2, AlertCircle, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSedes,
  createSede,
  updateSede,
  deleteSede,
} from "../../services/sedesServices";
import { configUi, cn } from "../../configuracion/configUi";
import ModalErrorAlert from "../../configuracion/ModalErrorAlert";

export default function Sedes() {
  // Data
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting
  const [sortField, setSortField] = useState("nombre_sede");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal & selection
  const [modal, setModal] = useState(null); // crear | editar | ver | eliminar
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    nombre_sede: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });

  // Validation
  const [formErrors, setFormErrors] = useState({});

  // Notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Field validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_sede") {
      if (!value || !value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 3) error = "Mínimo 3 caracteres";
    }

    if (name === "direccion" && (!value || !value.trim())) {
      error = "La dirección es obligatoria";
    }

    if (name === "ciudad" && (!value || !value.trim())) {
      error = "La ciudad es obligatoria";
    }

    if (name === "telefono") {
      if (!value || !value.trim()) error = "El teléfono es obligatorio";
      else if (!/^\d{7,15}$/.test(value.trim())) error = "Número inválido (7-15 dígitos)";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    const ok1 = validateField("nombre_sede", form.nombre_sede);
    const ok2 = validateField("direccion", form.direccion);
    const ok3 = validateField("ciudad", form.ciudad);
    const ok4 = validateField("telefono", form.telefono);
    return ok1 && ok2 && ok3 && ok4;
  };

  const [modalError, setModalError] = useState(null);

  // Fetch data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSedes();
      setSedes(data || []);
    } catch (err) {
      console.error("Error cargando sedes:", err);
      showNotification("Error cargando sedes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Modal handlers
  const openModal = (type, sede = null) => {
    setModal(type);
    setSelected(sede);
    setSubmitting(false);
    setModalError(null);

    setForm(
      sede
        ? {
          nombre_sede: sede.nombre_sede || "",
          direccion: sede.direccion || "",
          ciudad: sede.ciudad || "",
          telefono: sede.telefono || "",
        }
        : { nombre_sede: "", direccion: "", ciudad: "", telefono: "" }
    );

    setFormErrors({});
  };

  const closeModal = () => {
    if (submitting) return;
    setModal(null);
    setSelected(null);
    setModalError(null);
    setForm({ nombre_sede: "", direccion: "", ciudad: "", telefono: "" });
    setFormErrors({});
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // Save data
  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      nombre_sede: form.nombre_sede.trim(),
      direccion: form.direccion.trim(),
      ciudad: form.ciudad.trim(),
      telefono: form.telefono.trim(),
    };

    try {
      if (modal === "add") {
        await createSede(payload);
        showNotification("Sede creada con éxito");
      } else if (modal === "edit" && selected) {
        await updateSede(selected.id_sede, payload);
        showNotification("Sede actualizada");
      }

      await fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando:", err);
      const errorMessage = err.response?.data?.mensaje || "Error al procesar la solicitud";
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    setModalError(null);
    try {
      await deleteSede(selected.id_sede);
      showNotification("Sede eliminada con éxito");
      await fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando:", err);
      const errorMessage = err.response?.data?.mensaje || "No se pudo eliminar la sede";
      setModalError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter + Sort + Pagination
  const filteredAndSorted = useMemo(() => {
    let result = [...sedes];

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(s =>
        s.nombre_sede.toLowerCase().includes(q) ||
        s.ciudad.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return result;
  }, [sedes, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const currentItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <div className={configUi.pageShell}>

        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
               Sedes
            </h2>
            <span className={configUi.countBadge}>{sedes.length} sedes</span>
          </div>

          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                placeholder="Buscar sedes..."
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters (Sort) */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: "nombre_sede", label: "Nombre" },
                { id: "ciudad", label: "Ciudad" },
              ].map((field) => (
                <button
                  key={field.id}
                  onClick={() => toggleSort(field.id)}
                  className={cn(
                    "px-4 py-2.5 text-[11px] uppercase font-black tracking-wider rounded-2xl border transition flex items-center gap-1.5 shrink-0 select-none",
                    sortField === field.id
                      ? "bg-[#1f2937] text-white border-[#1f2937]"
                      : "bg-white text-[#6a85ad] border-[#bfd1f4] hover:bg-[#f8fbff] hover:text-[#16315f]"
                  )}
                >
                  {field.label}
                  {sortField === field.id && <ArrowUpDown className="h-3 w-3 opacity-70" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => openModal("add")}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Registrar Sede
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col min-h-0">
          <div className={configUi.tableCard}>
            <div className={configUi.tableScroll}>
              <table className={configUi.table}>
                <thead className={configUi.thead}>
                  <tr>
                    <th className={`${configUi.th} w-[25%]`}>Nombre</th>
                    <th className={`${configUi.th} w-[30%]`}>Dirección</th>
                    <th className={`${configUi.th} w-[15%]`}>Ciudad</th>
                    <th className={`${configUi.th} w-[15%]`}>Teléfono</th>
                    <th className={`${configUi.th} text-right w-[15%]`}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">Cargando sedes...</td></tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <MapPin className="h-8 w-8" />
                          <p className="text-sm">No se encontraron sedes</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((s) => (
                      <tr key={s.id_sede} className={configUi.row}>
                        <td className={`${configUi.td} font-bold text-gray-900`}>{s.nombre_sede}</td>
                        <td className={`${configUi.td} text-gray-500 flex items-center gap-2`}>
                          <MapPin size={14} className="text-blue-400 shrink-0" />
                          <span className="truncate">{s.direccion}</span>
                        </td>
                        <td className={configUi.td}>
                          <span className={configUi.pill}>
                            {s.ciudad}
                          </span>
                        </td>
                        <td className={`${configUi.td} text-gray-600`}>{s.telefono}</td>
                        <td className={`${configUi.td} text-right`}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => openModal("details", s)} className={configUi.actionButton} title="Ver"><Eye size={14} strokeWidth={2.5} /></button>
                            <button onClick={() => openModal("edit", s)} className={configUi.actionButton} title="Editar"><Pencil size={14} strokeWidth={2.5} /></button>
                            <button onClick={() => openModal("delete", s)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} strokeWidth={2.5} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 0 && (
              <div className={configUi.paginationBar}>
                <p className="text-sm font-bold text-slate-500">
                  Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
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
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={configUi.paginationButton}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className={cn(
                  "fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-white font-medium",
                  notification.type === "success" ? "bg-blue-600" : "bg-red-600"
                )}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODALES */}
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
                  className={cn(configUi.modalPanel, modal === "eliminar" ? "max-w-md" : "max-w-2xl")}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col">
                    <div className={configUi.modalHeader}>
                      <div>
                        <h3 className={configUi.modalTitle}>
                          {modal === "crear" ? "Nueva Sede" :
                            modal === "editar" ? "Editar Sede" :
                              modal === "ver" ? "Detalles de Sede" : "Eliminar Sede"}
                        </h3>
                        <p className={configUi.modalSubtitle}>
                          {modal === "eliminar" ? "Confirme si desea remover esta ubicación." : "Información de la ubicación física."}
                        </p>
                      </div>
                      <button onClick={closeModal} className={configUi.modalClose} disabled={submitting}>
                        <X size={20} />
                      </button>
                    </div>

                    <div className={configUi.modalContent}>
                      {modal === "delete" || modal === "eliminar" ? (
                        <div className="py-4 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                            <Trash2 size={30} />
                          </div>
                          <h3 className="mb-2 text-xl font-black text-[#16315f]">Eliminar esta sede</h3>
                          <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#6b84aa]">
                            ¿Estás seguro de eliminar la sede <span className="font-bold text-[#d44966]">{selected?.nombre_sede}</span>?
                            <br />Esta acción no se puede deshacer.
                          </p>
                          
                          <ModalErrorAlert error={modalError} />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Nombre de la Sede *</label>
                            <div className="relative">
                              <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                name="nombre_sede"
                                value={form.nombre_sede}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                readOnly={modal === "ver"}
                                disabled={modal === "ver" || submitting}
                                placeholder="Ej: Auditorio Principal"
                                className={cn(configUi.fieldInput, "pl-10", formErrors.nombre_sede && "border-red-500")}
                              />
                            </div>
                            {formErrors.nombre_sede && (
                              <p className="mt-1 text-xs font-bold text-red-500">{formErrors.nombre_sede}</p>
                            )}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Ciudad *</label>
                            <input
                              name="ciudad"
                              value={form.ciudad}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              readOnly={modal === "ver"}
                              disabled={modal === "ver" || submitting}
                              placeholder="Ej: Medellín"
                              className={cn(configUi.fieldInput, formErrors.ciudad && "border-red-500")}
                            />
                            {formErrors.ciudad && (
                              <p className="mt-1 text-xs font-bold text-red-500">{formErrors.ciudad}</p>
                            )}
                          </div>

                          <div className={cn(configUi.fieldGroup, "md:col-span-2")}>
                            <label className={configUi.fieldLabel}>Dirección Completa *</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                name="direccion"
                                value={form.direccion}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                readOnly={modal === "ver"}
                                disabled={modal === "ver" || submitting}
                                placeholder="Ej: Calle 10 # 45-20"
                                className={cn(configUi.fieldInput, "pl-10", formErrors.direccion && "border-red-500")}
                              />
                            </div>
                            {formErrors.direccion && (
                              <p className="mt-1 text-xs font-bold text-red-500">{formErrors.direccion}</p>
                            )}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Teléfono de Contacto *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                readOnly={modal === "ver"}
                                disabled={modal === "ver" || submitting}
                                placeholder="Ej: 3001234567"
                                className={cn(configUi.fieldInput, "pl-10", formErrors.telefono && "border-red-500")}
                              />
                            </div>
                            {formErrors.telefono && (
                              <p className="mt-1 text-xs font-bold text-red-500">{formErrors.telefono}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={configUi.modalFooter}>
                      <span className="text-xs text-[#6b84aa]">
                        {modal === "ver" ? "Vista de información registrada." : "Complete todos los campos marcados con *."}
                      </span>
                      <div className="flex items-center gap-3">
                        <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>
                          {modal === "ver" ? "Cerrar" : "Cancelar"}
                        </button>
                        {(modal === "crear" || modal === "add") && (
                          <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>
                            {submitting ? "Creando..." : "Crear Sede"}
                          </button>
                        )}
                        {(modal === "editar" || modal === "edit") && (
                          <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>
                            {submitting ? "Actualizando..." : "Guardar Cambios"}
                          </button>
                        )}
                        {(modal === "eliminar" || modal === "delete") && !modalError && (
                          <button onClick={handleDelete} disabled={submitting} className={configUi.dangerButton}>
                            {submitting ? "Eliminando..." : "Confirmar Eliminación"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}