import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, Award, Hash, ArrowUpDown, ChevronLeft, ChevronRight, Mail, Phone, Globe, Upload, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPatrocinadores,
  createPatrocinador,
  updatePatrocinador,
  deletePatrocinador,
} from "../../services/patrocinadoresServices";
import { configUi, cn } from "../../configuracion/configUi";
import ModalErrorAlert from "../../configuracion/ModalErrorAlert";

export default function Patrocinadores() {
  // Data
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Ajustado para densidad y logos
  
  // Sorting
  const [sortField, setSortField] = useState("nombre_patrocinador");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal & selection
  const [modal, setModal] = useState(null); // crear | editar | ver | eliminar
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form
  const [form, setForm] = useState({
    nombre_patrocinador: "",
    email: "",
    telefono: "",
    logo_patrocinador: "", // String (file path/URL or base64)
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoType, setLogoType] = useState("url"); // url | file

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

    if (name === "nombre_patrocinador") {
      if (!value || !value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 2) error = "Mínimo 2 caracteres";
    }

    if (name === "email") {
      if (!value || !value.trim()) error = "El email es obligatorio";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Email inválido";
    }

    if (name === "telefono") {
      if (!value || !value.trim()) error = "El teléfono es obligatorio";
      else if (!/^\d{7,15}$/.test(value)) error = "Número inválido (7-15 dígitos)";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    const ok1 = validateField("nombre_patrocinador", form.nombre_patrocinador);
    const ok2 = validateField("email", form.email);
    const ok3 = validateField("telefono", form.telefono);
    return ok1 && ok2 && ok3;
  };

  // Fetch data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatrocinadores();
      setPatrocinadores(data || []);
    } catch (err) {
      console.error("Error cargando patrocinadores:", err);
      showNotification("Error cargando patrocinadores", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Modal handlers
  const openModal = (type, patro = null) => {
    setModal(type);
    setSelected(patro);
    setSubmitting(false);
    setModalError(null);

    if (patro) {
      setForm({
        nombre_patrocinador: patro.nombre_patrocinador || "",
        email: patro.email || "",
        telefono: patro.telefono || "",
        logo_patrocinador: patro.logo_patrocinador || "",
      });
      setLogoPreview(patro.logo_patrocinador || null);
      setLogoType("url");
    } else {
      setForm({ nombre_patrocinador: "", email: "", telefono: "", logo_patrocinador: "" });
      setLogoPreview(null);
      setLogoType("url");
    }

    setFormErrors({});
  };

  const closeModal = () => {
    if (submitting) return;
    setModal(null);
    setSelected(null);
    setModalError(null);
    setLogoPreview(null);
    setForm({ nombre_patrocinador: "", email: "", telefono: "", logo_patrocinador: "" });
    setFormErrors({});
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) validateField(name, value);
    if (name === "logo_patrocinador" && logoType === "url") {
        setLogoPreview(value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setForm(prev => ({ ...prev, logo_patrocinador: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save data
  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      nombre_patrocinador: form.nombre_patrocinador.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      logo_patrocinador: form.logo_patrocinador,
    };

    try {
      if (modal === "crear") {
        await createPatrocinador(payload);
        showNotification("Patrocinador registrado");
      } else if (modal === "editar" && selected) {
        await updatePatrocinador(selected.id_patrocinador, payload);
        showNotification("Patrocinador actualizado");
      }

      await fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando:", err);
      showNotification("Error al procesar la solicitud", "error");
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
      await deletePatrocinador(selected.id_patrocinador);
      showNotification("Patrocinador eliminado con éxito", "success");
      await fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando patrocinador:", err);
      // Intentar obtener el mensaje de la respuesta del servidor en diferentes rutas comunes
      const errorMessage =
        err.response?.data?.mensaje ||
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Se produjo un error al intentar eliminar el patrocinador.";

      setModalError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter + Sort + Pagination
  const filteredAndSorted = useMemo(() => {
    let result = [...patrocinadores];
    
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        p.nombre_patrocinador.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
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
  }, [patrocinadores, search, sortField, sortDirection]);

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
    <div className={configUi.pageShell}>
      {/* 1. HEADER */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Patrocinadores</h2>
          <span className={configUi.countBadge}>
            <Hash className="mr-1 h-3 w-3" />
            {filteredAndSorted.length} patrocinadores
          </span>
        </div>

        <div className={configUi.toolbar}>
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86a0c6]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre o email..."
              className={configUi.inputWithIcon}
            />
          </div>
          <button onClick={() => openModal("crear")} className={configUi.primaryButton}>
            <Plus size={18} />
            <span>Nuevo Patrocinador</span>
          </button>
        </div>
      </div>

      {/* 2. TABLE AREA */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
            <thead className={configUi.thead}>
              <tr>
                <th className={cn(configUi.th, "w-[15%] pl-5")}>Logo</th>
                <th className={cn(configUi.th, "w-[25%]")}>
                   <button onClick={() => toggleSort("nombre_patrocinador")} className="flex items-center gap-2">
                    Patrocinador
                    {sortField === "nombre_patrocinador" && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </th>
                <th className={cn(configUi.th, "w-[25%]")}>Email</th>
                <th className={cn(configUi.th, "w-[20%]")}>Teléfono</th>
                <th className={cn(configUi.th, "w-[15%] pr-5 text-right")}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className={configUi.emptyState}>Cargando patrocinadores...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className={configUi.emptyState}>No se encontraron resultados.</td>
                </tr>
              ) : (
                currentItems.map((p) => (
                  <tr key={p.id_patrocinador} className={configUi.row}>
                    <td className={cn(configUi.td, "pl-5")}>
                       <div className="h-10 w-20 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shadow-sm p-1">
                          {p.logo_patrocinador ? (
                            <img src={p.logo_patrocinador} alt="Logo" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <ImageIcon size={16} className="text-slate-300" />
                          )}
                       </div>
                    </td>
                    <td className={cn(configUi.td, "font-bold text-[#16315f]")}>
                      {p.nombre_patrocinador}
                    </td>
                    <td className={cn(configUi.td, "text-[#5b7398]")}>
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-[#3b82f6]" />
                         {p.email}
                      </div>
                    </td>
                    <td className={cn(configUi.td, "text-[#5b7398]")}>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-[#3b82f6]" />
                         {p.telefono}
                      </div>
                    </td>
                    <td className={cn(configUi.td, "pr-5 text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal("ver", p)} className={configUi.actionButton}><Eye size={14} /></button>
                        <button onClick={() => openModal("editar", p)} className={configUi.actionButton}><Pen size={14} /></button>
                        <button onClick={() => openModal("eliminar", p)} className={configUi.actionDangerButton}><Trash2 size={14} /></button>
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
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p-1))} className={configUi.paginationButton}><ChevronLeft size={18} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className={configUi.paginationButton}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className={cn("fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-white font-medium", notification.type === "success" ? "bg-blue-600" : "bg-red-600")}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className={cn(configUi.modalPanel, modal === "eliminar" ? "max-w-md" : "max-w-2xl")} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                   <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === "crear" ? "Nuevo Patrocinador" : modal === "editar" ? "Editar Patrocinador" : modal === "ver" ? "Detalles del Patrocinador" : "Eliminar Patrocinador"}
                    </h3>
                    <p className={configUi.modalSubtitle}>Administración de patrocinadores del evento.</p>
                   </div>
                   <button onClick={closeModal} className={configUi.modalClose} disabled={submitting}><X size={20} /></button>
                </div>

                <div className={configUi.modalContent}>
                   {modal === "eliminar" ? (
                     <div className="py-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                          <Trash2 size={30} />
                        </div>
                        <h3 className="mb-2 text-xl font-black text-[#16315f]">Confirmar Eliminación</h3>
                        <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#6b84aa]">
                          ¿Estás seguro de que deseas eliminar al patrocinador <span className="font-bold text-[#d44966]">{selected?.nombre_patrocinador}</span>?
                          <br />Esta acción no se puede deshacer y puede estar restringida si el activo tiene eventos vinculados.
                        </p>

                        <ModalErrorAlert error={modalError} />
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: Logo Upload */}
                        <div className="flex flex-col items-center">
                           <label className={cn(configUi.fieldLabel, "w-full text-center")}>Logo de la Marca</label>
                           <div className="mt-4 h-32 w-full max-w-[200px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden transition hover:border-[#3b82f6]">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Preview" className="h-full w-full object-contain p-2" />
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                   <ImageIcon size={32} />
                                   <span className="text-[10px] uppercase font-bold tracking-widest">Sin imagen</span>
                                </div>
                              )}
                           </div>
                           {modal !== "ver" && (
                             <div className="mt-4 w-full space-y-3">
                                <div className="flex items-center gap-2 justify-center">
                                   <button onClick={() => setLogoType("url")} className={cn("text-[10px] font-bold px-3 py-1 rounded-full border transition", logoType === "url" ? "bg-[#16315f] text-white border-[#16315f]" : "bg-white text-slate-500 border-slate-200")}>Usar URL</button>
                                   <button onClick={() => setLogoType("file")} className={cn("text-[10px] font-bold px-3 py-1 rounded-full border transition", logoType === "file" ? "bg-[#16315f] text-white border-[#16315f]" : "bg-white text-slate-500 border-slate-200")}>Subir Archivo</button>
                                </div>
                                {logoType === "url" ? (
                                   <input name="logo_patrocinador" value={form.logo_patrocinador} onChange={handleChange} placeholder="https://ejemplo.com/logo.png" className={cn(configUi.fieldInput, "text-[11px]")} />
                                ) : (
                                   <div className="relative">
                                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="logo-file" />
                                      <label htmlFor="logo-file" className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 shadow-sm"><Upload size={14} /> Seleccionar Imagen</label>
                                   </div>
                                )}
                             </div>
                           )}
                        </div>

                        {/* RIGHT: Fields */}
                        <div className="space-y-4">
                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Nombre del Patrocinador *</label>
                              <div className="relative">
                                 <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                 <input name="nombre_patrocinador" value={form.nombre_patrocinador} onChange={handleChange} onBlur={(e) => validateField("nombre_patrocinador", e.target.value)} readOnly={modal === "ver"} disabled={submitting} placeholder="Ej: Red Bull" className={cn(configUi.fieldInput, "pl-10", formErrors.nombre_patrocinador && "border-red-500")} />
                              </div>
                              {formErrors.nombre_patrocinador && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.nombre_patrocinador}</p>}
                           </div>

                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Correo Electrónico *</label>
                              <div className="relative">
                                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                 <input name="email" value={form.email} onChange={handleChange} onBlur={(e) => validateField("email", e.target.value)} readOnly={modal === "ver"} disabled={submitting} placeholder="patrocinador@empresa.com" className={cn(configUi.fieldInput, "pl-10", formErrors.email && "border-red-500")} />
                              </div>
                              {formErrors.email && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.email}</p>}
                           </div>

                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Número de Teléfono *</label>
                              <div className="relative">
                                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                 <input name="telefono" value={form.telefono} onChange={handleChange} onBlur={(e) => validateField("telefono", e.target.value)} readOnly={modal === "ver"} disabled={submitting} placeholder="Ej: 3001234567" className={cn(configUi.fieldInput, "pl-10", formErrors.telefono && "border-red-500")} />
                              </div>
                              {formErrors.telefono && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.telefono}</p>}
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                <div className={configUi.modalFooter}>
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-wider text-[#6b84aa]">Gestión de Patrocinadores</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} className={configUi.secondaryButton}>{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                    {modal === "crear" && <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Procesando..." : "Registrar Patrocinador"}</button>}
                    {modal === "editar" && <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Guardando..." : "Actualizar Datos"}</button>}
                    {modal === "eliminar" && !modalError && <button onClick={handleDelete} disabled={submitting} className={configUi.dangerButton}>{submitting ? "Eliminando..." : "Eliminar Permanentemente"}</button>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
