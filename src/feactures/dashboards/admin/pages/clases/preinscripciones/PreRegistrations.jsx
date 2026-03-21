// src/features/dashboards/admin/pages/clases/preinscripciones/PreRegistrations.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Eye, Check, X, Search, Hash, User, 
  ChevronLeft, ChevronRight, AlertCircle, 
  UserPlus, Calendar, BookOpen, Info
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getPreinscripcionesPendientes,
  rechazarPreinscripcion,
  aceptarPreinscripcionYCrearMatricula
} from "../../services/preinscripcionesService";
import api from "../../../../../../services/api";
import { configUi } from "../../configuracion/configUi";
import { useToast } from "../../../../../../context/ToastContext";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const PreinscripcionesAdmin = () => {
  const toast = useToast();
  // --- ESTADOS ---
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal state
  const [modal, setModal] = useState(null); // "details" | "matricula" | "rechazar"
  const [selectedPreinscripcion, setSelectedPreinscripcion] = useState(null);
  
  // Datos para el modal de matrícula
  const [claseSeleccionada, setClaseSeleccionada] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [fechaMatricula, setFechaMatricula] = useState(new Date().toISOString().split('T')[0]);

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  // --- CARGAR DATOS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [preinscripcionesData, clasesData, planesData] = await Promise.all([
        getPreinscripcionesPendientes(),
        api.get("/clases").then(r => r.data),
        api.get("/planes").then(r => r.data)
      ]);

      setPreinscripciones(Array.isArray(preinscripcionesData) ? preinscripcionesData : []);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("No se pudo conectar con el servidor.");
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return preinscripciones.filter(p =>
      (p.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.documento || "").includes(search)
    );
  }, [preinscripciones, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- MODAL HANDLERS ---
  const openModal = (type, pre = null) => {
    setModal(type);
    setSelectedPreinscripcion(pre);
    if (type === "matricula") {
      setClaseSeleccionada("");
      setPlanSeleccionado("");
      setFechaMatricula(new Date().toISOString().split('T')[0]);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedPreinscripcion(null);
  };

  // --- CRUD OPERATIONS ---
  const handleRechazar = async () => {
    try {
      await rechazarPreinscripcion(selectedPreinscripcion.id_estudiante);
      fetchData();
      showNotification("Preinscripción rechazada");
      closeModal();
    } catch (err) {
      showNotification("Error al rechazar", "error");
    }
  };

  const handleAceptarYMatricular = async () => {
    if (!claseSeleccionada || !planSeleccionado) {
      toast.error("Campos obligatorios faltantes");
      showNotification("Campos obligatorios faltantes", "error");
      return;
    }

    // Validar fecha de matrícula (no pasada)
    if (fechaMatricula) {
      const matDate = new Date(fechaMatricula + "T00:00:00");
      const today = new Date();
      today.setHours(0,0,0,0);
      if (matDate < today) {
        toast.error("La fecha de matrícula no puede ser en el pasado.");
        return;
      }
    }
    
    try {
      const matriculaData = {
        id_clase: parseInt(claseSeleccionada),
        id_plan: parseInt(planSeleccionado),
        fecha_matricula: fechaMatricula,
      };

      await aceptarPreinscripcionYCrearMatricula(selectedPreinscripcion.id_estudiante, matriculaData);
      fetchData();
      toast.success("Matrícula creada con éxito");
      showNotification("Matrícula creada con éxito");
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al procesar";
      toast.error(msg);
      showNotification(msg, "error");
    }
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Preinscripciones
            </h2>
            <span className={configUi.countBadge}>{filtered.length} pendientes</span>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar preinscripción..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[25%]`}>Estudiante</th>
                  <th className={`${configUi.th} w-[20%]`}>Contacto</th>
                  <th className={`${configUi.th} w-[15%]`}>Nivel / Experiencia</th>
                  <th className={`${configUi.th} w-[15%]`}>Fecha Registro</th>
                  <th className={`${configUi.th} w-[15%]`}>Acudiente</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[10%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className={configUi.emptyState}>Cargando preinscripciones...</td></tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className={configUi.emptyState}>
                      <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                        <AlertCircle className="h-8 w-8 opacity-80" />
                        <p className="font-medium">{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="6" className={configUi.emptyState}>No hay preinscripciones pendientes.</td></tr>
                ) : (
                  currentItems.map((p) => (
                    <tr key={p.id_estudiante} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#16315f] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {(p.nombre_completo || "PR").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#16315f] text-sm leading-tight truncate">{p.nombre_completo}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{p.documento || "Sin ID"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#16315f] truncate">{p.email}</span>
                          <span className="text-[10px] text-slate-400">{p.telefono || p.edad + " años"}</span>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <span className={cn(configUi.pill, "bg-blue-50 text-[#16315f] scale-90 origin-left border border-blue-100")}>
                          {p.nivel_experiencia || "Principiante"}
                        </span>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar size={12} className="text-slate-300" />
                          {new Date(p.fecha_preinscripcion).toLocaleDateString()}
                        </div>
                      </td>
                      <td className={configUi.td}>
                        {p.nombre_acudiente ? (
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#16315f]">{p.nombre_acudiente}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{p.telefono_acudiente || "—"}</span>
                           </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">—</span>
                        )}
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal("details", p)} className={configUi.actionButton} title="Detalles">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openModal("matricula", p)} className={cn(configUi.actionButton, "hover:bg-emerald-50 hover:text-emerald-600")} title="Aceptar">
                            <Check size={14} />
                          </button>
                          <button onClick={() => openModal("rechazar", p)} className={cn(configUi.actionButton, "hover:bg-red-50 hover:text-red-600")} title="Rechazar">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={configUi.paginationButton}>
                  <ChevronLeft size={18} />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={configUi.paginationButton}>
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
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-[#16315f]" : "bg-red-600"}`}
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
              className={`${configUi.modalPanel} ${modal === 'rechazar' ? "max-w-sm" : "max-w-4xl"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === 'details' ? 'Información Solicitante' :
                       modal === 'matricula' ? 'Aprobar Preinscripción' :
                       modal === 'rechazar' ? 'Declinar Solicitud' : ''}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {selectedPreinscripcion?.nombre_completo || "Gestión de preinscripción"}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                    {modal === 'rechazar' ? (
                       <div className="py-4 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                             <X size={30} />
                          </div>
                          <p className="text-sm text-slate-500 italic">¿Seguro que deseas rechazar la solicitud de {selectedPreinscripcion?.nombre_completo}?</p>
                       </div>
                    ) : modal === 'details' ? (
                       <div className="flex flex-col lg:flex-row gap-8">
                          <div className="w-full lg:w-1/3 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                             <div className="h-24 w-24 rounded-2xl bg-[#16315f] flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                                {selectedPreinscripcion?.nombre_completo?.charAt(0)}
                             </div>
                             <h4 className="text-lg font-extrabold text-[#16315f] text-center mb-1">{selectedPreinscripcion?.nombre_completo}</h4>
                             <p className="text-xs text-slate-400 font-bold mb-6">{selectedPreinscripcion?.email}</p>
                             
                             <div className="w-full space-y-4">
                                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Documento</label>
                                   <p className="text-sm font-bold text-[#16315f] flex items-center gap-2"><Hash size={12}/> {selectedPreinscripcion?.documento || "No suministrado"}</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Edad Declarada</label>
                                   <p className="text-sm font-bold text-[#16315f] flex items-center gap-2"><User size={12}/> {selectedPreinscripcion?.edad} años</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex-1 space-y-6">
                             <div className="grid grid-cols-2 gap-4">
                                <div className={configUi.fieldGroup}>
                                   <label className={configUi.fieldLabel}>Nivel de Experiencia</label>
                                   <div className={configUi.readOnlyField}>{selectedPreinscripcion?.nivel_experiencia || "Principiante"}</div>
                                </div>
                                <div className={configUi.fieldGroup}>
                                   <label className={configUi.fieldLabel}>Fecha de Solicitud</label>
                                   <div className={configUi.readOnlyField}>{new Date(selectedPreinscripcion?.fecha_preinscripcion).toLocaleDateString()}</div>
                                </div>
                             </div>
                             
                             <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Condiciones Médicas / Observaciones</label>
                                <div className={cn(configUi.readOnlyField, "min-h-[80px] leading-relaxed italic")}>
                                   {selectedPreinscripcion?.enfermedad || "Sin observaciones médicas registradas."}
                                </div>
                             </div>

                             {selectedPreinscripcion?.nombre_acudiente && (
                                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                   <h5 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Info size={12}/> Datos del Acudiente
                                   </h5>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase">Nombre</p>
                                         <p className="text-sm font-bold text-[#16315f]">{selectedPreinscripcion?.nombre_acudiente}</p>
                                      </div>
                                      <div>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase">Teléfono</p>
                                         <p className="text-sm font-bold text-[#16315f]">{selectedPreinscripcion?.telefono_acudiente}</p>
                                      </div>
                                   </div>
                                </div>
                             )}
                          </div>
                       </div>
                    ) : (
                       // MODAL MATRICULA (APROBAR)
                       <div className="flex flex-col lg:flex-row gap-8">
                          <div className="hidden lg:flex w-1/3 bg-emerald-50 rounded-2xl p-8 flex-col items-center justify-center border border-emerald-100 italic text-center">
                             <div className="h-20 w-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100">
                                <UserPlus size={40} />
                             </div>
                             <h4 className="text-lg font-bold text-[#16315f] mb-2">Formalizar Matrícula</h4>
                             <p className="text-xs text-emerald-800 leading-relaxed font-medium">Asigna una clase y un plan de pagos para convertir esta preinscripción en una matrícula activa.</p>
                          </div>

                          <div className="flex-1 space-y-6">
                             <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                                <div className="h-10 w-10 bg-[#16315f] rounded-xl flex items-center justify-center text-white text-xs font-bold">{selectedPreinscripcion?.nombre_completo?.charAt(0)}</div>
                                <div>
                                   <p className="text-sm font-bold text-[#16315f]">{selectedPreinscripcion?.nombre_completo}</p>
                                   <p className="text-[10px] text-slate-400 font-bold">Documento: {selectedPreinscripcion?.documento}</p>
                                </div>
                             </div>

                             <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Seleccionar Clase / Horario</label>
                                <select 
                                  className={configUi.fieldSelect}
                                  value={claseSeleccionada}
                                  onChange={(e) => setClaseSeleccionada(e.target.value)}
                                >
                                  <option value="">Elegir horario...</option>
                                  {clases.map(c => (
                                    <option key={c.id_clase} value={c.id_clase}>
                                      {c.nombre_nivel} - {c.dia_semana} {c.hora_inicio?.substring(0,5)} ({c.nombre_sede})
                                    </option>
                                  ))}
                                </select>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className={configUi.fieldGroup}>
                                   <label className={configUi.fieldLabel}>Plan de Pago</label>
                                   <select 
                                     className={configUi.fieldSelect}
                                     value={planSeleccionado}
                                     onChange={(e) => setPlanSeleccionado(e.target.value)}
                                   >
                                      <option value="">Elegir plan...</option>
                                      {planes.map(p => (
                                        <option key={p.id_plan} value={p.id_plan}>
                                          {p.nombre_plan} (${Number(p.precio).toLocaleString()})
                                        </option>
                                      ))}
                                   </select>
                                </div>
                                <div className={configUi.fieldGroup}>
                                   <label className={configUi.fieldLabel}>Fecha de Inicio</label>
                                   <input 
                                     type="date" 
                                     className={configUi.fieldInput} 
                                     value={fechaMatricula}
                                     onChange={(e) => setFechaMatricula(e.target.value)}
                                   />
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-xs text-slate-400 font-medium italic">
                    {modal === 'details' ? "Visualización de datos de pre-registro." : "Confirma la información antes de procesar."}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} className={configUi.secondaryButton}>
                      Cancelar
                    </button>
                    {modal === 'rechazar' ? (
                      <button onClick={handleRechazar} className={configUi.dangerButton}>Rechazar Ahora</button>
                    ) : modal === 'matricula' ? (
                      <button onClick={handleAceptarYMatricular} className={configUi.primaryButton}>
                         Aprobar y Matricular
                      </button>
                    ) : (
                      <button onClick={closeModal} className={configUi.primaryButton}>Cerrar</button>
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

export default PreinscripcionesAdmin;
