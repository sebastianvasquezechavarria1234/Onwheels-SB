import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, Calendar, MapPin, Hash, ArrowUpDown, 
  ChevronLeft, ChevronRight, Clock, Award, Tag, Image as ImageIcon, Globe, 
  ChevronDown, AlertCircle, CheckCircle, Layout, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../../services/Event";
import { getCategoriasEventos } from "../../services/EventCategory";
import { getPatrocinadores as getProductosSponsors } from "../../services/patrocinadoresServices";
import { getSedes } from "../../services/sedesServices";
import { configUi, cn } from "../../configuracion/configUi";
import ModalErrorAlert from "../../configuracion/ModalErrorAlert";
import { useToast } from "../../../../../../context/ToastContext";

export default function Eventos() {
  const toast = useToast();
  // Data
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Sorting
  const [sortField, setSortField] = useState("fecha_evento");
  const [sortDirection, setSortDirection] = useState("desc");

  // Modal & Selection
  const [modal, setModal] = useState(null); // crear | editar | ver | eliminar
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Multi-step modal state
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    id_categoria_evento: "",
    id_sede: "",
    id_patrocinador: "",
    nombre_evento: "",
    fecha_evento: "",
    hora_inicio: "",
    hora_aproximada_fin: "",
    descripcion: "",
    imagen_evento: "",
    estado: "activo",
    google_forms: "",
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

    if (name === "nombre_evento" && (!value || value.trim().length < 3)) error = "Nombre muy corto";
    if (name === "id_categoria_evento" && !value) error = "Seleccione categoría";
    if (name === "id_sede" && !value) error = "Seleccione sede";
    if (name === "fecha_evento" && !value) error = "Fecha requerida";
    if (name === "hora_inicio" && !value) error = "Hora inicio requerida";
    if (name === "hora_aproximada_fin" && !value) error = "Hora fin requerida";

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateStep1 = () => {
    const ok1 = validateField("nombre_evento", form.nombre_evento);
    const ok2 = validateField("id_categoria_evento", form.id_categoria_evento);
    const ok3 = validateField("id_sede", form.id_sede);
    const ok4 = validateField("fecha_evento", form.fecha_evento);
    const ok5 = validateField("hora_inicio", form.hora_inicio);
    const ok6 = validateField("hora_aproximada_fin", form.hora_aproximada_fin);
    return ok1 && ok2 && ok3 && ok4 && ok5 && ok6;
  };

  // Data Fetching
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [evs, cats, pats, seds] = await Promise.all([
        getEventos({ todos: true }),
        getCategoriasEventos(),
        getProductosSponsors(),
        getSedes()
      ]);
      setEventos(evs || []);
      setCategorias(cats || []);
      setPatrocinadores(pats || []);
      setSedes(seds || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const [modalError, setModalError] = useState(null);

  // Modal Handlers
  const openModal = (type, evento = null) => {
    setModal(type);
    setSelected(evento);
    setStep(1);
    setSubmitting(false);
    setModalError(null);

    if (evento) {
      setForm({
        id_categoria_evento: evento.id_categoria_evento || "",
        id_sede: evento.id_sede || "",
        id_patrocinador: evento.id_patrocinador || "",
        nombre_evento: evento.nombre_evento || "",
        fecha_evento: evento.fecha_evento ? evento.fecha_evento.split("T")[0] : "",
        hora_inicio: evento.hora_inicio ? evento.hora_inicio.slice(0, 5) : "",
        hora_aproximada_fin: evento.hora_aproximada_fin ? evento.hora_aproximada_fin.slice(0, 5) : "",
        descripcion: evento.descripcion || "",
        imagen_evento: evento.imagen_evento || "",
        estado: evento.estado || "activo",
        google_forms: (Array.isArray(evento.google_forms) ? evento.google_forms[0] : (evento.google_forms || "")),
      });
    } else {
      setForm({
        id_categoria_evento: "",
        id_sede: "",
        id_patrocinador: "",
        nombre_evento: "",
        fecha_evento: "",
        hora_inicio: "",
        hora_aproximada_fin: "",
        descripcion: "",
        imagen_evento: "",
        estado: "activo",
        google_forms: "",
      });
    }
    setFormErrors({});
  };

  const closeModal = () => {
    if (submitting) return;
    setModal(null);
    setSelected(null);
    setModalError(null);
  };

  // Form Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) validateField(name, value);
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
    else showNotification("Complete los campos obligatorios", "error");
  };

  // Save Event
  const handleSave = async () => {
    // Validar fecha de evento (no pasada)
    if (form.fecha_evento) {
        const eventDate = new Date(form.fecha_evento + "T00:00:00");
        const today = new Date();
        today.setHours(0,0,0,0);
        if (eventDate < today) {
            toast.error("La fecha del evento no puede ser en el pasado.");
            return;
        }
    }

    const payload = {
      ...form,
      id_categoria_evento: form.id_categoria_evento ? Number(form.id_categoria_evento) : null,
      id_sede: form.id_sede ? Number(form.id_sede) : null,
      id_patrocinador: form.id_patrocinador ? Number(form.id_patrocinador) : null,
      google_forms: form.google_forms ? [form.google_forms] : [],
      imagen_evento: form.imagen_evento || null,
      descripcion: form.descripcion || null
    };

    setSubmitting(true);
    try {
      if (modal === "crear") {
        await createEvento(payload);
        toast.success("Evento publicado con éxito");
        showNotification("Evento publicado con éxito");
      } else if (modal === "editar" && selected) {
        await updateEvento(selected.id_evento, payload);
        toast.success("Evento actualizado");
        showNotification("Evento actualizado");
      }
      await loadInitialData();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
      const msg = err?.response?.data?.mensaje || "No se pudo guardar el evento";
      toast.error(msg);
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    setModalError(null);
    try {
      await deleteEvento(selected.id_evento);
      showNotification("Evento eliminado");
      toast.success("Evento eliminado");
      await loadInitialData();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
      const errorMessage = err.response?.data?.mensaje || "Error al eliminar. Revisa si hay registros asociados.";
      setModalError(errorMessage);
      toast.error(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Table Logic
  const filteredAndSorted = useMemo(() => {
    let result = [...eventos];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        (e.nombre_evento.toLowerCase().includes(q) || 
        (e.nombre_sede || "").toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "Todos") {
      result = result.filter(e => e.estado === statusFilter);
    }
    result.sort((a,b) => {
      const vA = a[sortField];
      const vB = b[sortField];
      if (typeof vA === "string") return sortDirection === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
      return sortDirection === "asc" ? vA - vB : vB - vA;
    });
    return result;
  }, [eventos, search, statusFilter, sortField, sortDirection]);

  const currentItems = filteredAndSorted.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const toggleSort = (f) => {
    if (sortField === f) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDirection("asc"); }
  };

  return (
    <div className={configUi.pageShell}>
      {/* HEADER */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}> Eventos</h2>
          <span className={configUi.countBadge}>
            <Calendar className="mr-1 h-3 w-3" />
            {filteredAndSorted.length} eventos registrados
          </span>
        </div>

        <div className={configUi.toolbar}>
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86a0c6]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar por nombre o sede..." className={configUi.inputWithIcon} />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className={cn(configUi.fieldSelect, "w-full sm:w-auto min-w-[150px]")}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <button onClick={() => openModal("crear")} className={configUi.primaryButton}>
            <Plus size={18} /> <span>Crear Evento</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
            <thead className={configUi.thead}>
              <tr>
                <th className={cn(configUi.th, "pl-5 w-[25%]")}>
                   <button onClick={() => toggleSort("nombre_evento")} className="flex items-center gap-2">Evento {sortField==="nombre_evento" && <ArrowUpDown className="h-3 w-3"/>}</button>
                </th>
                <th className={cn(configUi.th, "w-[20%]")}>Categoría</th>
                <th className={cn(configUi.th, "w-[20%]")}>Sede / Lugar</th>
                <th className={cn(configUi.th, "w-[15%]")}>
                   <button onClick={() => toggleSort("fecha_evento")} className="flex items-center gap-2">Fecha {sortField==="fecha_evento" && <ArrowUpDown className="h-3 w-3"/>}</button>
                </th>
                <th className={cn(configUi.th, "w-[10%] text-center")}>Estado</th>
                <th className={cn(configUi.th, "w-[10%] pr-5 text-right")}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className={configUi.emptyState}>Sincronizando eventos...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="6" className={configUi.emptyState}>No hay eventos que coincidan.</td></tr>
              ) : (
                currentItems.map(e => (
                  <tr key={e.id_evento} className={configUi.row}>
                    <td className={cn(configUi.td, "pl-5 font-bold text-[#16315f]")}>{e.nombre_evento}</td>
                    <td className={cn(configUi.td, "text-[#5b7398]")}>{e.nombre_categoria || "Sin categoría"}</td>
                    <td className={cn(configUi.td, "text-[#16315f] font-medium")}>
                       <div className="flex items-center gap-1.5"><MapPin size={12} /> {e.nombre_sede || "No asignada"}</div>
                    </td>
                    <td className={cn(configUi.td, "text-[#5b7398]")}>
                       <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(e.fecha_evento).toLocaleDateString()}</div>
                    </td>
                    <td className={cn(configUi.td, "text-center")}>
                       <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", e.estado === "activo" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100")}>
                          {e.estado}
                       </span>
                    </td>
                    <td className={cn(configUi.td, "pr-5 text-right")}>
                       <div className="flex items-center justify-end gap-2 text-right">
                          <button onClick={() => openModal("ver", e)} className={configUi.actionButton}><Eye size={14}/></button>
                          <button onClick={() => openModal("editar", e)} className={configUi.actionButton}><Pen size={14}/></button>
                          <button onClick={() => openModal("eliminar", e)} className={configUi.actionDangerButton}><Trash2 size={14}/></button>
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
            <p className="text-sm font-bold text-slate-500">Página <span className="text-[#16315f]">{currentPage}</span> de {totalPages}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={configUi.paginationButton}><ChevronLeft size={18}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={configUi.paginationButton}><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      {/* MODALES */}
      <AnimatePresence>
        {modal && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className={cn(configUi.modalPanel, modal === "eliminar" ? "max-w-md" : "max-w-4xl")} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="flex flex-col h-full overflow-hidden">
                
                {modal === "eliminar" ? (
                   <div className="p-8 text-center flex flex-col items-center">
                      <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><Trash2 size={30}/></div>
                      <h3 className="text-xl font-bold text-[#16315f]">¿Eliminar Evento?</h3>
                      <p className="text-sm text-[#6b84aa] mt-2 mb-6">Esta acción removerá permanentemente el evento <span className="font-bold">"{selected?.nombre_evento}"</span> y todos sus datos asociados.</p>
                      
                      <ModalErrorAlert error={modalError} />

                      <div className="mx-auto flex gap-3 w-full max-w-sm">
                         <button onClick={closeModal} className={cn(configUi.secondaryButton, "flex-1")}>Cancelar</button>
                         {!modalError && (
                           <button onClick={handleDelete} disabled={submitting} className={cn(configUi.dangerButton, "flex-1")}>
                             {submitting ? "Eliminando..." : "Confirmar"}
                           </button>
                         )}
                      </div>
                   </div>
                ) : (
                  <>
                    <div className={configUi.modalHeader}>
                       <div>
                          <h3 className={configUi.modalTitle}>{modal === "crear" ? "Nuevo Evento" : modal === "editar" ? "Editar Evento" : "Vista de Evento"}</h3>
                          <p className={configUi.modalSubtitle}>{modal !== "ver" && `Paso ${step} de 2 — ${step === 1 ? "Configuración básica" : "Detalles y Multimedia"}`}</p>
                       </div>
                       <button onClick={closeModal} className={configUi.modalClose}><X size={20}/></button>
                    </div>

                    <div className={cn(configUi.modalContent, "flex flex-col lg:flex-row gap-6")}>
                       {/* LEFT: FORM AREA */}
                       <div className="flex-1 space-y-4">
                          {modal !== "ver" && (
                            <div className="flex items-center gap-2 mb-6">
                               <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition", step === 1 ? "bg-[#16315f] text-white shadow-md shadow-blue-100" : "bg-green-100 text-green-600")}><CheckCircle size={step === 2 ? 16 : 0}/> {step === 1 && "1"}</div>
                               <div className="h-0.5 w-12 bg-slate-100 rounded" />
                               <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition", step === 2 ? "bg-[#16315f] text-white shadow-md shadow-blue-100" : "bg-slate-100 text-slate-400")}>2</div>
                            </div>
                          )}

                          {step === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className={cn(configUi.fieldGroup, "md:col-span-2")}>
                                  <label className={configUi.fieldLabel}>Nombre del Evento *</label>
                                  <input name="nombre_evento" value={form.nombre_evento} onChange={handleChange} readOnly={modal === "ver"} className={cn(configUi.fieldInput, formErrors.nombre_evento && "border-red-500")} placeholder="Ej: Maratón de Programación" />
                                  {formErrors.nombre_evento && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.nombre_evento}</p>}
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Categoría *</label>
                                  <select name="id_categoria_evento" value={form.id_categoria_evento} onChange={handleChange} disabled={modal === "ver"} className={cn(configUi.fieldSelect, "cursor-pointer")}>
                                     <option value="">Seleccionar...</option>
                                     {categorias.map(c => <option key={c.id_categoria_evento} value={c.id_categoria_evento}>{c.nombre_categoria}</option>)}
                                  </select>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Sede / Recinto *</label>
                                  <select name="id_sede" value={form.id_sede} onChange={handleChange} disabled={modal === "ver"} className={cn(configUi.fieldSelect, "cursor-pointer")}>
                                     <option value="">Seleccionar...</option>
                                     {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</option>)}
                                  </select>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Fecha *</label>
                                  <div className="relative">
                                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <input type="date" name="fecha_evento" value={form.fecha_evento} onChange={handleChange} readOnly={modal === "ver"} className={cn(configUi.fieldInput, "pl-10")} />
                                  </div>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Hora de Inicio *</label>
                                  <div className="relative">
                                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} readOnly={modal === "ver"} className={cn(configUi.fieldInput, "pl-10", formErrors.hora_inicio && "border-red-500")} />
                                  </div>
                                  {formErrors.hora_inicio && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.hora_inicio}</p>}
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Hora de Fin *</label>
                                  <div className="relative">
                                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <input type="time" name="hora_aproximada_fin" value={form.hora_aproximada_fin} onChange={handleChange} readOnly={modal === "ver"} className={cn(configUi.fieldInput, "pl-10", formErrors.hora_aproximada_fin && "border-red-500")} />
                                  </div>
                                  {formErrors.hora_aproximada_fin && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.hora_aproximada_fin}</p>}
                               </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Imagen del Evento (URL) </label>
                                  <div className="relative">
                                     <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <input name="imagen_evento" value={form.imagen_evento} onChange={handleChange} readOnly={modal === "ver"} className={cn(configUi.fieldInput, "pl-10")} placeholder="https://..." />
                                  </div>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Patrocinador Oficial</label>
                                  <select name="id_patrocinador" value={form.id_patrocinador} onChange={handleChange} disabled={modal === "ver"} className={configUi.fieldSelect}>
                                     <option value="">Sin patrocinio</option>
                                     {patrocinadores.map(p => <option key={p.id_patrocinador} value={p.id_patrocinador}>{p.nombre_patrocinador}</option>)}
                                  </select>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Link Inscripciones (Google Forms)</label>
                                  <div className="relative">
                                     <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <input name="google_forms" value={form.google_forms} onChange={handleChange} readOnly={modal === "ver"} className={cn(configUi.fieldInput, "pl-10")} placeholder="https://forms.gle/..." />
                                  </div>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Estado de Visibilidad</label>
                                  <select name="estado" value={form.estado} onChange={handleChange} disabled={modal === "ver"} className={configUi.fieldSelect}>
                                     <option value="activo">Activo (Visible en Landing)</option>
                                     <option value="inactivo">Inactivo (Oculto de Landing)</option>
                                  </select>
                               </div>

                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Descripción del Evento</label>
                                  <textarea name="descripcion" value={form.descripcion} onChange={handleChange} readOnly={modal === "ver"} rows={3} className={configUi.fieldTextarea} placeholder="Describa los objetivos del evento..." />
                               </div>
                            </div>
                          )}
                       </div>

                       {/* RIGHT: PREVIEW CARD (Visible if image exists or in step 2) */}
                       <div className="hidden lg:flex w-72 flex-col gap-4 border-l border-slate-100 pl-6">
                           <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm group">
                              <div className="h-40 bg-slate-50 flex items-center justify-center overflow-hidden">
                                 {form.imagen_evento ? <img src={form.imagen_evento} alt="Preview" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <ImageIcon size={40} className="text-slate-200" />}
                              </div>
                              <div className="p-4">
                                 <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Vista Previa</span>
                                 <h4 className="font-bold text-[#16315f] mt-1 line-clamp-1">{form.nombre_evento || "Nombre del Evento"}</h4>
                                 <div className="mt-3 flex items-center gap-2 text-[11px] text-[#5b7398]">
                                    <Clock size={12} /> {form.hora_inicio || "00:00"} {form.hora_aproximada_fin && `- ${form.hora_aproximada_fin}`}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                               <div className="flex items-center gap-2 text-[#16315f] font-bold text-xs mb-2"><Info size={14}/> Nota</div>
                               <p className="text-[10px] leading-relaxed text-[#5b7398]">Los eventos publicados serán visibles para todos los usuarios en la aplicación móvil y portal web.</p>
                           </div>
                       </div>
                    </div>

                    <div className={configUi.modalFooter}>
                       <div className="flex items-center gap-2">
                          {modal === "ver" ? (
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Histórico de Eventos</span>
                          ) : (
                             <div className="flex items-center gap-1.5 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-300 bg-[#3b82f6]", step === 1 ? "w-1/2" : "w-full")} />
                             </div>
                          )}
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => { if(step === 2) setStep(1); else closeModal(); }} className={configUi.secondaryButton}>{step === 2 ? "Atrás" : "Cancelar"}</button>
                           {modal !== "ver" && (
                              step === 1 ? (
                                <button onClick={handleNext} className={configUi.primarySoftButton}>Siguiente Paso</button>
                              ) : (
                                <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Publicando..." : modal === "crear" ? "Crear Evento" : "Guardar Cambios"}</button>
                              )
                           )}
                       </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className={cn("fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-white font-black text-xs tracking-wide", notification.type === "success" ? "bg-[#16315f]" : "bg-red-500")}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
