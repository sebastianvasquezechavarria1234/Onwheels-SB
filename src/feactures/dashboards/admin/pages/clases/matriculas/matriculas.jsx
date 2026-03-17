import React, { useEffect, useState, useCallback } from "react";
import { Eye, Edit, Trash2, Search, Plus, X, ChevronLeft, ChevronRight, Hash, User, Calendar, BookOpen, AlertTriangle, DollarSign, CheckCircle, RefreshCw, ClipboardList, Pause, Play, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMatriculas,
  deleteMatricula,
  updateMatricula,
  createMatricula,
} from "../../services/matriculaService";
import api from "../../../../../../services/api";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MatriculasAdmin = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "details" | "delete" | "editar" | "nueva" | "pagos" | "registrar_pago" | "finalizar"
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  
  const [pagos, setPagos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [isSubmittingPago, setIsSubmittingPago] = useState(false);
  const [formPago, setFormPago] = useState({ monto: "", nota: "", fecha: new Date().toISOString().split("T")[0] });
  
  const [historialEstudiante, setHistorialEstudiante] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [motivoPausa, setMotivoPausa] = useState("");

  // Datos para formularios
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [usuariosElegibles, setUsuariosElegibles] = useState([]);

  // Estado de formulario "Nueva Matrícula"
  const [modoMatricula, setModoMatricula] = useState('existente'); // "existente" | "nuevo"
  const [formNueva, setFormNueva] = useState({
    id_estudiante: "",
    id_usuario: "",
    id_clase: "",
    id_plan: "",
    nivel_experiencia: "",
    enfermedad: "",
    edad: "",
    acudienteNombre: "",
    acudienteTelefono: "",
    acudienteEmail: ""
  });

  // Estado de edición
  const [formEdit, setFormEdit] = useState({ id_clase: "", id_plan: "", estado: "" });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  const fetchMatriculas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMatriculas();
      // Agrupar por estudiante si se desea maestro-detalle, pero para el CRUD plano lo mostraremos por fila
      // El código original agrupaba pero la tabla mostraba matriculaPrincipal. 
      // Para este refactor mantendremos el listado de matrículas individuales para mayor claridad CRUD.
      setMatriculas(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar matrículas:", err);
      setError("Error al cargar las matrículas.");
      showNotification("Error al cargar matrículas", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchCatalogos = useCallback(async () => {
    try {
      const [clasesData, planesData, estudiantesData, usuariosElegiblesData] = await Promise.all([
        api.get("/clases").then(r => r.data),
        api.get("/planes").then(r => r.data),
        api.get("/estudiantes").then(r => r.data),
        api.get("/usuarios/elegibles-para-estudiante").then(r => r.data)
      ]);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setUsuariosElegibles(Array.isArray(usuariosElegiblesData) ? usuariosElegiblesData : []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  }, []);

  useEffect(() => {
    fetchMatriculas();
    fetchCatalogos();
  }, [fetchMatriculas, fetchCatalogos]);

  const openModal = (type, item = null) => {
    setModal(type);
    setSelectedMatricula(item);
    if (type === 'editar' && item) {
      setFormEdit({
        id_clase: item.id_clase,
        id_plan: item.id_plan,
        estado: item.estado
      });
    } else {
      setFormNueva({
        id_estudiante: "", id_usuario: "", id_clase: "", id_plan: "",
        nivel_experiencia: "", enfermedad: "", edad: "",
        acudienteNombre: "", acudienteTelefono: "", acudienteEmail: ""
      });
      setModoMatricula('existente');
    }
  };

  // ─── Reset del modal ─────────────────────────────────────────────────────────
  const closeModal = () => {
    setModal(null);
    setSelectedMatricula(null);
  };

  const handleCreate = async () => {
    try {
      if (modoMatricula === 'existente') {
        if (!formNueva.id_estudiante || !formNueva.id_clase || !formNueva.id_plan) {
          showNotification("Completa todos los campos obligatorios", "error");
          return;
        }
        await createMatricula({
          id_estudiante: parseInt(formNueva.id_estudiante),
          id_clase: parseInt(formNueva.id_clase),
          id_plan: parseInt(formNueva.id_plan)
        });
      } else {
        if (!formNueva.id_usuario || !formNueva.id_clase || !formNueva.id_plan) {
          showNotification("Completa todos los campos obligatorios", "error");
          return;
        }
        await api.post("/matriculas/manual", {
          id_usuario: parseInt(formNueva.id_usuario),
          enfermedad: formNueva.enfermedad || "No aplica",
          nivel_experiencia: formNueva.nivel_experiencia || "Principiante",
          edad: formNueva.edad ? parseInt(formNueva.edad) : null,
          id_clase: parseInt(formNueva.id_clase),
          id_plan: parseInt(formNueva.id_plan)
        });
      }
      showNotification("Matrícula creada con éxito");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al crear matrícula";
      showNotification(msg, "error");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMatricula(selectedMatricula.id_matricula, formEdit);
      showNotification("Matrícula actualizada");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      showNotification("Error al actualizar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMatricula(selectedMatricula.id_matricula);
      showNotification("Matrícula eliminada");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      showNotification("Error al eliminar", "error");
    }
  };

  const fetchPagos = async (id_matricula) => {
    try {
      setLoadingPagos(true);
      const res = await api.get(`/matriculas/${id_matricula}/pagos`);
      setPagos(res.data);
    } catch (error) {
      showNotification("Error al cargar pagos", "error");
    } finally {
      setLoadingPagos(false);
    }
  };

  const handleRegistrarPago = async () => {
    try {
      setIsSubmittingPago(true);
      const saldoPendiente = selectedMatricula ? Number(selectedMatricula.precio_plan) - Number(selectedMatricula.total_pagado) : 0;
      
      if (!formPago.monto || formPago.monto <= 0) {
        showNotification("Monto inválido", "error");
        return;
      }
      
      if (Number(formPago.monto) > saldoPendiente) {
        showNotification(`El pago excede el saldo de $${saldoPendiente}`, "error");
        return;
      }

      await api.post(`/matriculas/${selectedMatricula.id_matricula}/pagos`, formPago);
      showNotification("Pago registrado exitosamente");
      fetchMatriculas();
      closeModal();
    } catch (error) {
      showNotification("Error al registrar pago", "error");
    } finally {
      setIsSubmittingPago(false);
    }
  };

  const handleFinalizarMatricula = async () => {
    try {
      await updateMatricula(selectedMatricula.id_matricula, { estado: "Finalizada" });
      showNotification("Matrícula finalizada");
      fetchMatriculas();
      closeModal();
    } catch (error) {
      showNotification("Error al finalizar", "error");
    }
  };

  const fetchHistorialEstudiante = useCallback(async (id_estudiante) => {
    try {
      setLoadingHistorial(true);
      const res = await api.get(`/matriculas/estudiante/${id_estudiante}`);
      setHistorialEstudiante(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar historial del estudiante:", err);
      showNotification("Error al cargar el expediente", "error");
    } finally {
      setLoadingHistorial(false);
    }
  }, [showNotification]);

  const handlePausar = async () => {
    try {
      if (!motivoPausa.trim()) {
        showNotification("Debes ingresar un motivo para pausar", "error");
        return;
      }
      await api.post(`/matriculas/${selectedMatricula.id_matricula}/pausar`, { motivo: motivoPausa });
      showNotification("Matrícula pausada correctamente");
      setMotivoPausa("");
      closeModal();
      fetchMatriculas();
    } catch (error) {
      showNotification(error.response?.data?.mensaje || "Error al pausar", "error");
    }
  };

  const handleReanudar = async (id) => {
    try {
      await api.post(`/matriculas/${id}/reanudar`);
      showNotification("Matrícula reanudada correctamente (vigencia extendida)");
      fetchMatriculas();
    } catch (error) {
      showNotification(error.response?.data?.mensaje || "Error al reanudar", "error");
    }
  };

  const filtered = matriculas.filter(m =>
    (m.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.documento || "").includes(search) ||
    (m.nombre_plan || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Search Area */}
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Clases / Matrículas
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                <span className="text-xs font-bold">{filtered.length} inscripciones</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por estudiante, documento o plan..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => openModal("nueva")}
            className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />
            Nueva Matrícula
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left relative">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Estudiante</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Clase / Nivel</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Fechas</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Pagos / Saldo</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm italic">Cargando matrículas...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">No se encontraron matrículas</td></tr>
                ) : (
                  currentItems.map((m) => (
                    <tr key={m.id_matricula} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                            {(m.nombre_completo || "ST").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#040529] text-sm leading-tight">{m.nombre_completo}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{m.documento}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#040529]">{m.nombre_nivel}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.dia_semana} {m.hora_inicio}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          {m.nombre_plan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            "text-[10px] font-medium whitespace-nowrap",
                            m.fecha_fin && new Date(m.fecha_fin) < new Date(Date.now() + 7*24*60*60*1000)
                              ? "text-amber-500 font-bold" : "text-slate-500"
                          )}>Inicio: {m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString() : '-'}</span>
                          <span className={cn(
                            "text-[10px] font-medium whitespace-nowrap",
                            m.fecha_fin && new Date(m.fecha_fin) < new Date()
                              ? "text-red-500 font-bold" 
                              : m.fecha_fin && new Date(m.fecha_fin) < new Date(Date.now() + 7*24*60*60*1000)
                              ? "text-amber-500 font-bold" : "text-slate-500"
                          )}>Fin: {m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString() : '-'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-bold text-green-600">Total: ${Number(m.total_pagado || 0).toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-red-500">Saldo: ${(Number(m.precio_plan) || Number(m.precio) || 0) - Number(m.total_pagado || 0)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span 
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold border transition-colors capitalize",
                            m.estado === 'Activa' ? 'bg-green-50 text-green-600 border-green-200' :
                              m.estado === 'Vencida' ? 'bg-red-50 text-red-600 border-red-200' :
                                m.estado === 'Pausada' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                  'bg-slate-50 text-slate-500 border-slate-200'
                          )}
                          title={m.estado === 'Pausada' ? `Motivo: ${m.motivo_pausa || 'No especificado'}` : ''}
                        >
                          {m.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 4 ACCIONES PRINCIPALES */}
                          <button
                            onClick={() => openModal("details", m)}
                            className="p-1.5 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-slate-100"
                            title="Ver Detalle"
                          >
                            <Eye size={14} />
                          </button>
                          
                          <button
                            onClick={() => openModal("editar", m)}
                            className="p-1.5 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-slate-100"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>

                          {m.estado !== 'Finalizada' && m.estado !== 'Cancelada' && m.estado !== 'Pausada' && (
                            <button
                              onClick={() => {
                                setSelectedMatricula(m);
                                setModal("finalizar");
                              }}
                              className="p-1.5 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition shadow-sm border border-purple-100"
                              title="Finalizar Matrícula"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => openModal("delete", m)}
                            className="p-1.5 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>

                          {/* MENÚ DESPLEGABLE PARA ADICIONALES */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === m.id_matricula ? null : m.id_matricula);
                              }}
                              className={cn(
                                "p-1.5 flex items-center justify-center rounded-lg transition shadow-sm border",
                                openMenuId === m.id_matricula 
                                  ? "bg-[#040529] text-white border-[#040529]" 
                                  : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                              )}
                            >
                              <MoreVertical size={14} />
                            </button>

                            <AnimatePresence>
                              {openMenuId === m.id_matricula && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedMatricula(m);
                                      fetchPagos(m.id_matricula);
                                      setModal("pagos");
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <DollarSign size={14} className="text-emerald-500" />
                                    Ver Pagos
                                  </button>

                                  <button
                                    onClick={() => {
                                      setFormPago({ monto: "", nota: "", fecha: new Date().toISOString().split("T")[0] });
                                      setSelectedMatricula(m);
                                      setModal("registrar_pago");
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Plus size={14} className="text-blue-500" />
                                    Registrar Pago
                                  </button>

                                  {m.estado === 'Activa' && (
                                    <button
                                      onClick={() => {
                                        setSelectedMatricula(m);
                                        setMotivoPausa("");
                                        setModal("pausar");
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                      <Pause size={14} className="text-orange-500" />
                                      Pausar Matrícula
                                    </button>
                                  )}

                                  {m.estado === 'Pausada' && (
                                    <button
                                      onClick={() => {
                                        handleReanudar(m.id_matricula);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                      <Play size={14} className="text-blue-500" />
                                      Reanudar Matrícula
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setSelectedMatricula(m);
                                      setModal("expediente");
                                      fetchHistorialEstudiante(m.id_estudiante);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <ClipboardList size={14} className="text-indigo-500" />
                                    Expediente Estudiante
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Página <span className="font-bold text-[#040529]">{currentPage}</span> de <span className="font-bold text-[#040529]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg text-white text-sm font-bold ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === 'delete' ? 'max-w-sm w-full' : 'max-w-2xl w-full'}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#040529]">
                    {modal === 'nueva' ? 'Nueva Matrícula' :
                      modal === 'editar' ? 'Editar Matrícula' :
                        modal === 'delete' ? 'Eliminar Matrícula' : 
                          modal === 'details' ? 'Detalles de Inscripción' :
                            modal === 'pagos' ? 'Historial de Pagos' :
                              modal === 'registrar_pago' ? 'Registrar Pago' :
                                modal === 'finalizar' ? 'Finalizar Matrícula' :
                                    modal === 'pausar' ? 'Pausar Matrícula' :
                                      modal === 'expediente' ? 'Expediente del Estudiante' : ''}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]">
                    <X size={20} />
                  </button>
                </div>

                {modal === 'delete' ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-6 italic">¿Estás seguro de eliminar la matrícula de <span className="font-bold text-red-600">{selectedMatricula?.nombre_completo}</span>?</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
                      <button onClick={handleDelete} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-md hover:shadow-lg">Eliminar</button>
                    </div>
                  </div>
                ) : modal === 'details' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pasajero / Estudiante</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_completo}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Documento</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.documento}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clase Asignada</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_nivel}</p>
                        <p className="text-xs text-slate-500">{selectedMatricula?.dia_semana} {selectedMatricula?.hora_inicio}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Plan Contratado</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_plan}</p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button onClick={closeModal} className="px-6 py-2 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-md transition hover:bg-[#040529]/90">Cerrar</button>
                    </div>
                  </div>
                ) : modal === 'editar' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clase</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                        value={formEdit.id_clase}
                        onChange={(e) => setFormEdit({ ...formEdit, id_clase: e.target.value })}
                      >
                        {clases.map(c => <option key={c.id_clase} value={c.id_clase}>{c.nombre_nivel} - {c.dia_semana} {c.hora_inicio}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Plan</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                        value={formEdit.id_plan}
                        onChange={(e) => setFormEdit({ ...formEdit, id_plan: e.target.value })}
                      >
                        {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estado</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                        value={formEdit.estado}
                        onChange={(e) => setFormEdit({ ...formEdit, estado: e.target.value })}
                      >
                        <option value="Activa">Activa</option>
                        <option value="Vencida">Vencida</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                    <button onClick={handleUpdate} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition mt-4">
                      Actualizar Matrícula
                    </button>
                  </div>
                ) : modal === 'pagos' ? (
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-center">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Precio Plan</p>
                        <p className="font-bold text-[#040529]">${Number(selectedMatricula?.precio_plan || selectedMatricula?.precio || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Pagado</p>
                        <p className="font-bold text-green-600">${Number(selectedMatricula?.total_pagado || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Saldo</p>
                        <p className="font-bold text-red-500">${(Number(selectedMatricula?.precio_plan || selectedMatricula?.precio || 0) - Number(selectedMatricula?.total_pagado || 0)).toLocaleString()}</p>
                      </div>
                    </div>
                    {/* Pagos table */}
                    <div className="max-h-[50vh] overflow-y-auto">
                      {loadingPagos ? (
                        <p className="text-center text-sm text-gray-500 p-4">Cargando pagos...</p>
                      ) : pagos.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 p-4 italic">No hay pagos registrados</p>
                      ) : (
                        <table className="w-full text-left bg-white border border-slate-100 rounded-xl overflow-hidden">
                          <thead className="bg-[#F0E6E6] text-[#040529]">
                            <tr>
                              <th className="px-4 py-3 font-bold text-xs uppercase">Fecha</th>
                              <th className="px-4 py-3 font-bold text-xs uppercase">Monto</th>
                              <th className="px-4 py-3 font-bold text-xs uppercase">Nota</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {pagos.map(p => (
                              <tr key={p.id}>
                                <td className="px-4 py-3 text-sm">{new Date(p.fecha).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm font-bold text-green-600">${Number(p.monto).toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{p.nota || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    <div className="flex justify-end pt-2">
                       <button onClick={closeModal} className="px-6 py-2 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-md transition">Cerrar</button>
                    </div>
                  </div>
                ) : modal === 'registrar_pago' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-2">Registrando pago para <strong>{selectedMatricula?.nombre_completo}</strong></p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Monto ($) *</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                          value={formPago.monto}
                          onChange={(e) => setFormPago({...formPago, monto: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha *</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                          value={formPago.fecha}
                          onChange={(e) => setFormPago({...formPago, fecha: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nota / Observación</label>
                      <textarea
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                        rows="2"
                        value={formPago.nota}
                        onChange={(e) => setFormPago({...formPago, nota: e.target.value})}
                        placeholder="Ej: Pago en efectivo, Transferencia Bancolombia..."
                      ></textarea>
                    </div>
                    <button 
                      onClick={handleRegistrarPago} 
                      disabled={isSubmittingPago}
                      className="w-full py-3 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold shadow-lg transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSubmittingPago ? 'Guardando Pago...' : 'Guardar Pago'}
                    </button>
                  </div>
                ) : modal === 'expediente' ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {selectedMatricula?.nombre_completo?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_completo}</h4>
                        <p className="text-[10px] text-slate-500">{selectedMatricula?.documento} • {selectedMatricula?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Historial de Matrículas</h5>
                      {loadingHistorial ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : historialEstudiante.length === 0 ? (
                        <p className="text-center py-8 text-sm text-slate-400 italic">No hay historial previo registrado.</p>
                      ) : (
                        historialEstudiante.map((hist, idx) => (
                          <div key={hist.id_matricula} className={cn(
                            "p-4 rounded-xl border transition-all",
                            hist.estado === 'Activa' ? "bg-white border-green-200 shadow-sm" : "bg-slate-50 border-slate-200 opacity-80"
                          )}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                                  hist.estado === 'Activa' ? "bg-green-100 text-green-700" :
                                    hist.estado === 'Vencida' ? "bg-red-100 text-red-700" :
                                      "bg-slate-200 text-slate-600"
                                )}>
                                  {hist.estado}
                                </span>
                                <h6 className="text-sm font-bold text-[#040529] mt-1">{hist.nombre_plan}</h6>
                              </div>
                              <p className="text-[10px] font-bold text-slate-700">${Number(hist.precio_plan).toLocaleString('es-CO')}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={10} />
                                <span>{new Date(hist.fecha_inicio).toLocaleDateString()} - {new Date(hist.fecha_fin).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center justify-end gap-1">
                                <CheckCircle size={10} className={Number(hist.total_pagado) >= Number(hist.precio_plan) ? "text-green-500" : "text-amber-500"} />
                                <span className="font-medium text-slate-700">Pagado: ${Number(hist.total_pagado).toLocaleString('es-CO')}</span>
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2 border-t pt-1 border-slate-100 italic">Clase: {hist.nombre_nivel} — {hist.nombre_sede}</p>
                            {hist.estado === 'Pausada' && hist.motivo_pausa && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-xl">
                                <p className="text-[9px] text-amber-700 font-bold uppercase">Motivo de Pausa:</p>
                                <p className="text-[10px] text-amber-800">{hist.motivo_pausa}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : modal === 'pausar' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 mb-2">
                      <p className="text-sm text-orange-700 font-medium text-center">
                        <AlertTriangle className="inline-block mr-2 mb-1" size={16} />
                        Estás a punto de pausar la matrícula de <strong>{selectedMatricula?.nombre_completo}</strong>.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Motivo de la pausa</label>
                      <textarea
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none bg-white focus:border-orange-500 transition-colors"
                        placeholder="Ej: Accidente, viaje familiar, dificultad económica..."
                        rows="3"
                        value={motivoPausa}
                        onChange={(e) => setMotivoPausa(e.target.value)}
                      ></textarea>
                      <p className="text-[10px] text-slate-400 mt-1 italic">Este motivo será visible en el historial del estudiante.</p>
                    </div>
                    <button 
                      onClick={handlePausar} 
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-lg transition mt-2 flex items-center justify-center gap-2"
                    >
                      <Pause size={16} />
                      Confirmar Pausa
                    </button>
                  </div>
                ) : modal === 'finalizar' ? (
                  <div className="text-center">
                    <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
                    <p className="text-sm text-gray-600 mb-6">¿Deseas dar por terminada (finalizada) la matrícula de <span className="font-bold text-[#040529]">{selectedMatricula?.nombre_completo}</span>?</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
                      <button onClick={handleFinalizarMatricula} className="px-5 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md hover:shadow-lg">Finalizar Matrícula</button>
                    </div>
                  </div>
                ) : (
                  // Modal Nueva Matrícula
                  <div className="space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                      <button
                        onClick={() => setModoMatricula('existente')}
                        className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition", modoMatricula === 'existente' ? "bg-white text-[#040529] shadow-sm" : "text-slate-500")}
                      >
                        Estudiante Existente
                      </button>
                      <button
                        onClick={() => setModoMatricula('nuevo')}
                        className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition", modoMatricula === 'nuevo' ? "bg-white text-[#040529] shadow-sm" : "text-slate-500")}
                      >
                        Vincular Nuevo Usuario
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                      {modoMatricula === 'existente' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Seleccionar Estudiante *</label>
                          <select
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white font-bold text-[#040529]"
                            value={formNueva.id_estudiante}
                            onChange={(e) => setFormNueva({ ...formNueva, id_estudiante: e.target.value })}
                          >
                            <option value="">Selecciona...</option>
                            {estudiantes.map(e => <option key={e.id_estudiante} value={e.id_estudiante}>{e.nombre_completo} ({e.documento})</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vincular Usuario *</label>
                            <select
                              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white font-bold text-[#040529]"
                              value={formNueva.id_usuario}
                              onChange={(e) => setFormNueva({ ...formNueva, id_usuario: e.target.value })}
                            >
                              <option value="">Usuario sin perfil estudiante...</option>
                              {usuariosElegibles.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.documento})</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Experiencia</label>
                              <select
                                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                                value={formNueva.nivel_experiencia}
                                onChange={(e) => setFormNueva({ ...formNueva, nivel_experiencia: e.target.value })}
                              >
                                <option value="Principiante">Principiante</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Edad</label>
                              <input
                                type="number"
                                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                                value={formNueva.edad}
                                onChange={(e) => setFormNueva({ ...formNueva, edad: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clase / Jornada *</label>
                          <select
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
                            value={formNueva.id_clase}
                            onChange={(e) => setFormNueva({ ...formNueva, id_clase: e.target.value })}
                          >
                            <option value="">Selecciona clase...</option>
                            {clases.map(c => <option key={c.id_clase} value={c.id_clase}>{c.nombre_nivel} - {c.dia_semana} {c.hora_inicio}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Plan *</label>
                          <select
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
                            value={formNueva.id_plan}
                            onChange={(e) => setFormNueva({ ...formNueva, id_plan: e.target.value })}
                          >
                            <option value="">Selecciona plan...</option>
                            {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button onClick={handleCreate} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition mt-4">
                      {modoMatricula === 'existente' ? 'Generar Matrícula' : 'Crear Perfil y Matrícula'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatriculasAdmin;
