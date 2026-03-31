// src/feactures/dashboards/admin/pages/clases/matriculas/matriculas.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Eye, Edit, Trash2, Search, Plus, X, 
  ChevronLeft, ChevronRight, Hash, User, 
  Calendar, BookOpen, AlertTriangle, DollarSign, 
  CheckCircle, RefreshCw, ClipboardList, Pause, 
  Play, MoreVertical, Download, CreditCard, Clock, Activity, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMatriculas,
  deleteMatricula,
  updateMatricula,
  createMatricula,
} from "../../services/matriculaService";
import { configUi, cn } from "../../configuracion/configUi";
import ModalErrorAlert from "../../configuracion/ModalErrorAlert";
import FilterDropdown from "../../configuracion/FilterDropdown";
import { useToast } from "../../../../../../context/ToastContext";
import api from "../../../../../../services/api";

const MatriculasAdmin = () => {
  const toast = useToast();
  // --- ESTADOS ---
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "details" | "delete" | "editar" | "nueva" | "pagos" | "registrar_pago" | "finalizar" | "pausar" | "expediente"
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  
  const [pagos, setPagos] = useState([]);
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
    id_estudiante: "", id_usuario: "", id_clase: "", id_plan: "",
    nivel_experiencia: "Principiante", enfermedad: "", edad: ""
  });

  // Estado de edición
  const [formEdit, setFormEdit] = useState({ id_clase: "", id_plan: "", estado: "" });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Todos");

  // --- HANDLERS ---
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [matriculasData, clasesData, planesData, estudiantesData, usuariosElegiblesData] = await Promise.all([
        getMatriculas(),
        api.get("/clases").then(r => r.data),
        api.get("/planes").then(r => r.data),
        api.get("/estudiantes").then(r => r.data),
        api.get("/usuarios/elegibles-para-estudiante").then(r => r.data)
      ]);

      setMatriculas(Array.isArray(matriculasData) ? matriculasData : []);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setUsuariosElegibles(Array.isArray(usuariosElegiblesData) ? usuariosElegiblesData : []);

    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar las matrículas.");
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Click outside to close action menu
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    return matriculas.filter(m => {
      const q = search.toLowerCase();
      const matchesSearch = (m.nombre_completo || "").toLowerCase().includes(q) ||
                           (m.documento || "").includes(search) ||
                           (m.nombre_plan || "").toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === "Todos" || m.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [matriculas, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [modalError, setModalError] = useState(null);

  const openModal = (type, item = null) => {
    setModalError(null);
    setModal(type);
    setSelectedMatricula(item);
    setOpenMenuId(null);
    if (type === 'editar' && item) {
      setFormEdit({
        id_clase: item.id_clase,
        id_plan: item.id_plan,
        estado: item.estado
      });
    } else if (type === 'nueva') {
      setFormNueva({
        id_estudiante: "", id_usuario: "", id_clase: "", id_plan: "",
        nivel_experiencia: "Principiante", enfermedad: "", edad: ""
      });
      setModoMatricula('existente');
    }
  };


  const closeModal = () => {
    setModal(null);
    setSelectedMatricula(null);
    setOpenMenuId(null);
    setMotivoPausa("");
    setModalError(null);
  };

  // --- OPERACIONES ---
  const handleCreate = async () => {
    setModalError(null);
    try {
      if (modoMatricula === 'existente') {
        if (!formNueva.id_estudiante || !formNueva.id_clase || !formNueva.id_plan) {
          throw new Error("Completa los campos obligatorios");
        }
        await createMatricula({
          id_estudiante: parseInt(formNueva.id_estudiante),
          id_clase: parseInt(formNueva.id_clase),
          id_plan: parseInt(formNueva.id_plan)
        });
      } else {
        if (!formNueva.id_usuario || !formNueva.id_clase || !formNueva.id_plan) {
          throw new Error("Completa los campos obligatorios");
        }
        await api.post("/matriculas/manual", {
          id_usuario: parseInt(formNueva.id_usuario),
          enfermedad: formNueva.enfermedad || "No aplica",
          nivel_experiencia: formNueva.nivel_experiencia,
          edad: formNueva.edad ? parseInt(formNueva.edad) : null,
          id_clase: parseInt(formNueva.id_clase),
          id_plan: parseInt(formNueva.id_plan)
        });
      }
      showNotification("Matrícula creada con éxito");
      fetchData();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.message || "Error al crear matrícula";
      setModalError(msg);
      showNotification(msg, "error");
    }
  };

  const handleUpdate = async () => {
    setModalError(null);
    try {
      await updateMatricula(selectedMatricula.id_matricula, formEdit);
      showNotification("Matrícula actualizada");
      fetchData();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al actualizar";
      setModalError(msg);
      showNotification(msg, "error");
    }
  };

  const handleDelete = async () => {
    setModalError(null);
    try {
      await deleteMatricula(selectedMatricula.id_matricula);
      showNotification("Matrícula eliminada");
      fetchData();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al eliminar la matrícula";
      setModalError(msg);
      showNotification(msg, "error");
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
      const saldo = Number(selectedMatricula.precio_plan) - Number(selectedMatricula.total_pagado);
      if (!formPago.monto || formPago.monto <= 0) {
        toast.error("Monto inválido");
        return showNotification("Monto inválido", "error");
      }
      if (Number(formPago.monto) > saldo) {
        toast.error(`Excede el saldo de $${saldo}`);
        return showNotification(`Excede el saldo de $${saldo}`, "error");
      }

      // Validar fecha de pago (no futura)
      if (formPago.fecha) {
        const payDate = new Date(formPago.fecha);
        const today = new Date();
        if (payDate > today) {
          toast.error("La fecha de pago no puede ser futura.");
          return;
        }
      }

      await api.post(`/matriculas/${selectedMatricula.id_matricula}/pagos`, formPago);
      toast.success("Pago registrado con éxito");
      showNotification("Pago registrado con éxito");
      fetchData();
      closeModal();
    } catch (error) {
      const msg = error.response?.data?.mensaje || "Error al registrar pago";
      toast.error(msg);
      showNotification(msg, "error");
    } finally {
      setIsSubmittingPago(false);
    }
  };

  const handleFinalizarMatricula = async () => {
    try {
      await updateMatricula(selectedMatricula.id_matricula, { estado: "Finalizada" });
      showNotification("Matrícula finalizada");
      fetchData();
      closeModal();
    } catch (error) {
      showNotification("Error al finalizar", "error");
    }
  };

  const fetchHistorialEstudiante = async (id_estudiante) => {
    try {
      setLoadingHistorial(true);
      const res = await api.get(`/matriculas/estudiante/${id_estudiante}`);
      setHistorialEstudiante(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showNotification("Error al cargar el expediente", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handlePausar = async () => {
    try {
      if (!motivoPausa.trim()) return showNotification("Debes ingresar un motivo", "error");
      await api.post(`/matriculas/${selectedMatricula.id_matricula}/pausar`, { motivo: motivoPausa });
      showNotification("Matrícula pausada");
      fetchData();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.mensaje || "Error al pausar", "error");
    }
  };

  const handleReanudar = async (id) => {
    try {
      await api.post(`/matriculas/${id}/reanudar`);
      showNotification("Matrícula reanudada");
      fetchData();
    } catch (error) {
      showNotification("Error al reanudar", "error");
    }
  };

  const handleDownload = () => {
    if (!filtered || filtered.length === 0) return;
    const header = ["ID", "Estudiante", "Documento", "Clase", "Nivel", "Plan", "Precio", "Pagado", "Vence", "Estado"];
    const csvData = filtered.map(m => [
      m.id_matricula,
      `"${m.nombre_completo}"`,
      `"${m.documento}"`,
      `"${m.nombre_clase}"`,
      `"${m.nombre_nivel}"`,
      `"${m.nombre_plan}"`,
      m.precio_plan,
      m.total_pagado || 0,
      m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString() : "—",
      m.estado
    ].join(","));

    const csvContent = "\uFEFF" + [header.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_matriculas_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Matrículas & Inscripciones
            </h2>
            <span className={configUi.countBadge}>{filtered.length} registros</span>
          </div>

          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por estudiante, documento o plan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            {/* Filter Dropdown */}
            <FilterDropdown
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              options={[
                { label: "Todos los Estados", value: "Todos" },
                { label: "Activa", value: "Activa", icon: CheckCircle, color: "#10b981" },
                { label: "Pausada", value: "Pausada", icon: Pause, color: "#f59e0b" },
                { label: "Vencida", value: "Vencida", icon: Clock, color: "#64748b" },
                { label: "Finalizada", value: "Finalizada", icon: CheckCircle, color: "#0ea5e9" },
                { label: "Cancelada", value: "Cancelada", icon: X, color: "#ef4444" }
              ]}
              placeholder="Estado"
            />

            {/* Actions */}
            <button 
              onClick={handleDownload}
              className={configUi.iconButton} 
              title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            <button
              onClick={() => openModal("nueva")}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Nueva Matrícula
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[22%]`}>Estudiante</th>
                  <th className={`${configUi.th} w-[18%]`}>Clase / Jornada</th>
                  <th className={`${configUi.th} w-[12%]`}>Plan</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Vigencia</th>
                  <th className={`${configUi.th} text-right w-[15%]`}>Pagos / Saldo</th>
                  <th className={`${configUi.th} text-center w-[10%]`}>Estado</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[8%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className={configUi.emptyState}>Cargando registros...</td></tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className={configUi.emptyState}>
                       <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                          <AlertCircle className="h-8 w-8 opacity-80" />
                          <p className="font-medium">{error}</p>
                       </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="7" className={configUi.emptyState}>No se encontraron matrículas registradas.</td></tr>
                ) : (
                  currentItems.map((m) => (
                    <tr key={m.id_matricula} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#16315f] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {(m.nombre_completo || "ST").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#16315f] text-sm leading-tight truncate">{m.nombre_completo}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.documento}</p>
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#16315f] truncate">{m.nombre_nivel}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.dia_semana} {m.hora_inicio?.substring(0, 5)}</span>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <span className="px-2 py-1 rounded-lg bg-blue-50 text-[#16315f] text-[10px] font-bold border border-blue-100 italic">
                          {m.nombre_plan}
                        </span>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                            {m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString() : '—'}
                          </span>
                          <span className={cn(
                             "text-[10px] font-bold whitespace-nowrap",
                             m.fecha_fin && new Date(m.fecha_fin) < new Date() ? "text-red-500" : 
                             m.fecha_fin && new Date(m.fecha_fin) < new Date(Date.now() + 7*24*60*60*1000) ? "text-amber-500" : "text-slate-400"
                          )}>
                             vence: {m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] font-bold text-emerald-600">${Number(m.total_pagado || 0).toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-red-500">Saldo: ${(Number(m.precio_plan) - Number(m.total_pagado || 0)).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <span className={cn(
                          configUi.pill,
                          (m.estado === 'Activa' || m.estado === 'activo' || m.estado === true) ? configUi.successPill :
                          (m.estado === 'Vencida' || m.estado === 'vencida') ? configUi.dangerPill :
                          m.estado === 'Pausada' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                          configUi.subtlePill
                        )}>
                          {m.estado}
                        </span>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-1 relative">
                          <button onClick={() => openModal("details", m)} className={configUi.actionButton} title="Ver"><Eye size={14} /></button>
                          
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === m.id_matricula ? null : m.id_matricula); }}
                              className={cn(configUi.actionButton, openMenuId === m.id_matricula && "bg-[#16315f] text-white")}
                            >
                              <MoreVertical size={14} />
                            </button>
                            <AnimatePresence>
                              {openMenuId === m.id_matricula && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 py-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button onClick={() => { openModal("pagos", m); fetchPagos(m.id_matricula); }} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                    <DollarSign size={14} className="text-emerald-500" /> Historial de Pagos
                                  </button>
                                  <button onClick={() => { setFormPago({ monto: "", nota: "", fecha: new Date().toISOString().split("T")[0] }); openModal("registrar_pago", m); }} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                    <CreditCard size={14} className="text-blue-500" /> Registrar Pago
                                  </button>
                                  {m.estado === 'Activa' && (
                                    <button onClick={() => openModal("pausar", m)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                      <Pause size={14} className="text-amber-500" /> Pausar Matrícula
                                    </button>
                                  )}
                                  {m.estado === 'Pausada' && (
                                    <button onClick={() => handleReanudar(m.id_matricula)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                      <Play size={14} className="text-emerald-500" /> Reanudar
                                    </button>
                                  )}
                                  <button onClick={() => { openModal("expediente", m); fetchHistorialEstudiante(m.id_estudiante); }} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                    <ClipboardList size={14} className="text-indigo-500" /> Expediente
                                  </button>
                                  {m.estado !== 'Finalizada' && m.estado !== 'Cancelada' && (
                                    <button onClick={() => openModal("finalizar", m)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                      <CheckCircle size={14} className="text-emerald-500" /> Finalizar Matrícula
                                    </button>
                                  )}
                                  <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                  <button onClick={() => openModal("editar", m)} className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                    <Edit size={14} className="text-slate-400" /> Editar Plan/Clase
                                  </button>
                                  <button onClick={() => openModal("delete", m)} className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3">
                                    <Trash2 size={14} /> Eliminar Registro
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
            transition={{ duration: 0.3 }}
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
              className={`${configUi.modalPanel} ${['delete', 'pausar', 'finalizar'].includes(modal) ? "max-w-sm" : "max-w-4xl"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === 'nueva' ? 'Nueva Matrícula' :
                       modal === 'editar' ? 'Actualizar Inscripción' :
                       modal === 'delete' ? 'Eliminar Matrícula' : 
                       modal === 'details' ? 'Detalles de Matrícula' :
                       modal === 'pagos' ? 'Historial Financiero' :
                       modal === 'registrar_pago' ? 'Registrar Abono/Pago' :
                       modal === 'pausar' ? 'Pausar Servicio' :
                       modal === 'expediente' ? 'Expediente del Estudiante' : ''}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {selectedMatricula?.nombre_completo || "Gestión de inscripción."}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
                </div>

                <div className={configUi.modalContent}>
                    <ModalErrorAlert error={modalError} />
                    {modal === 'delete' ? (
                      <div className="py-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                          <Trash2 size={30} />
                        </div>
                        <p className="text-sm text-slate-500 italic">¿Confirmas la eliminación de esta matrícula? Esta acción no se puede revertir.</p>
                      </div>
                    ) : modal === 'details' ? (
                      <div className="flex flex-col lg:flex-row gap-8">
                         <div className="w-full lg:w-1/3 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                            <div className="h-24 w-24 rounded-2xl bg-[#16315f] flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                                {selectedMatricula?.nombre_completo?.charAt(0)}
                            </div>
                            <h4 className="text-lg font-bold text-[#16315f] text-center mb-1">{selectedMatricula?.nombre_completo}</h4>
                            <p className="text-xs text-slate-400 font-bold mb-4">{selectedMatricula?.documento}</p>
                            <div className="w-full h-px bg-slate-200 mb-4"></div>
                            <div className="w-full space-y-3">
                               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  <span>Estado</span>
                                  <span className={cn(configUi.pill, "scale-90", selectedMatricula?.estado === 'Activa' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>{selectedMatricula?.estado}</span>
                               </div>
                               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  <span>Sede</span>
                                  <span className="text-[#16315f]">{selectedMatricula?.nombre_sede}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex-1 grid grid-cols-2 gap-6">
                            <div className={configUi.fieldGroup}>
                               <label className={configUi.fieldLabel}>Clase / Nivel</label>
                               <div className={configUi.readOnlyField}>{selectedMatricula?.nombre_nivel}</div>
                            </div>
                            <div className={configUi.fieldGroup}>
                               <label className={configUi.fieldLabel}>Plan</label>
                               <div className={configUi.readOnlyField}>{selectedMatricula?.nombre_plan}</div>
                            </div>
                            <div className={configUi.fieldGroup}>
                               <label className={configUi.fieldLabel}>Fecha Inicio</label>
                               <div className={configUi.readOnlyField}>{new Date(selectedMatricula?.fecha_inicio).toLocaleDateString()}</div>
                            </div>
                            <div className={configUi.fieldGroup}>
                               <label className={configUi.fieldLabel}>Fecha Fin (Vencimiento)</label>
                               <div className={configUi.readOnlyField}>{new Date(selectedMatricula?.fecha_fin).toLocaleDateString()}</div>
                            </div>
                            <div className="col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-around">
                               <div className="text-center">
                                  <p className="text-[10px] font-bold text-emerald-800 uppercase mb-1">Total Plan</p>
                                  <p className="text-xl font-extrabold text-[#16315f]">${Number(selectedMatricula?.precio_plan).toLocaleString()}</p>
                               </div>
                               <div className="w-px bg-emerald-100"></div>
                               <div className="text-center">
                                  <p className="text-[10px] font-bold text-emerald-800 uppercase mb-1">Saldo Pendiente</p>
                                  <p className="text-xl font-extrabold text-red-600">${(Number(selectedMatricula?.precio_plan) - Number(selectedMatricula?.total_pagado)).toLocaleString()}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                    ) : modal === 'pagos' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                           <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><CreditCard size={24}/></div>
                           <div>
                              <p className="text-xs text-slate-500 font-bold uppercase">Resumen Financiero</p>
                              <p className="text-lg font-bold text-[#16315f]">Pagado: <span className="text-emerald-600">${Number(selectedMatricula?.total_pagado).toLocaleString()}</span> / <span className="text-slate-400 text-sm italic">${Number(selectedMatricula?.precio_plan).toLocaleString()}</span></p>
                           </div>
                        </div>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
                           <table className="w-full text-left">
                              <thead className="bg-[#16315f] text-white">
                                 <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase">Fecha</th>
                                    <th className="px-4 py-3 text-[10px] font-bold uppercase">Referencia / Nota</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase">Monto</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600">
                                {loadingPagos ? (
                                  <tr><td colSpan="3" className="p-8 text-center text-xs italic">Cargando pagos...</td></tr>
                                ) : pagos.length === 0 ? (
                                  <tr><td colSpan="3" className="p-8 text-center text-xs italic">No hay historial de abonos.</td></tr>
                                ) : (
                                  pagos.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 text-xs font-bold">{new Date(p.fecha).toLocaleDateString()}</td>
                                      <td className="px-4 py-3 text-xs italic">{p.nota || "Abono a matrícula"}</td>
                                      <td className="px-4 py-3 text-right text-xs font-extrabold text-emerald-600">${Number(p.monto).toLocaleString()}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                           </table>
                        </div>
                      </div>
                    ) : modal === 'registrar_pago' ? (
                      <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4">
                            <Clock size={20} className="text-[#16315f]" />
                            <div>
                               <p className="text-[10px] font-bold uppercase text-blue-800 tracking-tighter">Saldo Actual</p>
                               <p className="text-xl font-extrabold text-[#16315f]">${(Number(selectedMatricula?.precio_plan) - Number(selectedMatricula?.total_pagado)).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Monto a Abonar ($)</label>
                            <input type="number" className={configUi.fieldInput} value={formPago.monto} onChange={(e)=>setFormPago({...formPago, monto: e.target.value})} placeholder="0.00" />
                         </div>
                         <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Fecha de Pago</label>
                            <input type="date" className={configUi.fieldInput} value={formPago.fecha} onChange={(e)=>setFormPago({...formPago, fecha: e.target.value})} />
                         </div>
                         <div className="col-span-2">
                            <label className={configUi.fieldLabel}>Observaciones / Notas</label>
                            <textarea className={configUi.fieldInput} rows="3" value={formPago.nota} onChange={(e)=>setFormPago({...formPago, nota: e.target.value})} placeholder="Ej: Transferencia Bancaria, Efectivo..." />
                         </div>
                      </div>
                    ) : modal === 'expediente' ? (
                      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2">
                        <div className="flex items-center gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                           <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">{selectedMatricula?.nombre_completo?.charAt(0)}</div>
                           <div>
                              <h4 className="text-sm font-extrabold text-[#16315f]">{selectedMatricula?.nombre_completo}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedMatricula?.documento} • {selectedMatricula?.email || "Sin email registrado"}</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                              <Activity size={12}/> Historial de Matrículas
                           </h5>
                           {loadingHistorial ? (
                             <div className="py-12 flex justify-center text-[#16315f]"><RefreshCw className="animate-spin" size={24}/></div>
                           ) : historialEstudiante.length === 0 ? (
                             <p className="py-10 text-center text-xs text-slate-400 italic">No hay registros previos en el expediente.</p>
                           ) : (
                             historialEstudiante.map((hist, idx) => (
                               <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-100 transition-colors">
                                  <div className="flex justify-between items-start mb-3">
                                     <div>
                                        <span className={cn(configUi.pill, "scale-75 origin-left", hist.estado === 'Activa' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500")}>{hist.estado}</span>
                                        <h6 className="text-sm font-extrabold text-[#16315f] mt-1">{hist.nombre_plan}</h6>
                                     </div>
                                     <p className="text-[11px] font-extrabold text-slate-700">${Number(hist.precio_plan).toLocaleString()}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-400">
                                     <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500"/> {new Date(hist.fecha_inicio).toLocaleDateString()} - {new Date(hist.fecha_fin).toLocaleDateString()}</div>
                                     <div className="flex justify-end items-center gap-1.5"><CheckCircle size={12} className="text-emerald-500"/> Pagado: ${Number(hist.total_pagado).toLocaleString()}</div>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    ) : modal === 'pausar' ? (
                       <div className="space-y-4">
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4 text-amber-800">
                             <AlertTriangle size={24}/>
                             <p className="text-xs font-bold italic leading-relaxed">Estás a punto de suspender temporalmente este servicio. La vigencia será extendida al reanudar.</p>
                          </div>
                          <div>
                             <label className={configUi.fieldLabel}>Motivo de la Pausa</label>
                             <textarea value={motivoPausa} onChange={(e)=>setMotivoPausa(e.target.value)} className={configUi.fieldInput} rows="3" placeholder="Ej: Viaje familiar, Motivos de salud..." />
                          </div>
                       </div>
                    ) : modal === 'editar' ? (
                       <div className="grid grid-cols-1 gap-6">
                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Clase / Jornada</label>
                              <select className={configUi.fieldSelect} value={formEdit.id_clase} onChange={(e)=>setFormEdit({...formEdit, id_clase: e.target.value})}>
                                {clases.map(c => <option key={c.id_clase} value={c.id_clase}>{c.nombre_nivel} - {c.dia_semana} {c.hora_inicio?.substring(0,5)}</option>)}
                              </select>
                           </div>
                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Plan</label>
                              <select className={configUi.fieldSelect} value={formEdit.id_plan} onChange={(e)=>setFormEdit({...formEdit, id_plan: e.target.value})}>
                                {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan} (${Number(p.precio).toLocaleString()})</option>)}
                              </select>
                           </div>
                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Estado</label>
                              <div className="flex bg-slate-100 p-1.5 rounded-2xl w-max gap-1">
                                {["Activa", "Vencida", "Cancelada"].map(st => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => setFormEdit(p => ({ ...p, estado: st }))}
                                    className={cn(
                                      "px-4 py-1.5 text-xs font-bold rounded-xl transition duration-300",
                                      formEdit.estado === st ? "bg-white text-[#16315f] shadow-sm" : "text-slate-500 hover:bg-white/50"
                                    )}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                           </div>
                       </div>
                    ) : (
                      // MODAL NUEVA MATRÍCULA
                      <div className="space-y-6">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                          <button
                            onClick={() => setModoMatricula('existente')}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition", modoMatricula === 'existente' ? "bg-white text-[#16315f] shadow-sm" : "text-slate-500")}
                          >
                            Estudiante Existente
                          </button>
                          <button
                            onClick={() => setModoMatricula('nuevo')}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition", modoMatricula === 'nuevo' ? "bg-white text-[#16315f] shadow-sm" : "text-slate-500")}
                          >
                            Nuevo Estudiante / Registro
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           {modoMatricula === 'existente' ? (
                             <div className="col-span-2">
                               <label className={configUi.fieldLabel}>Seleccionar Estudiante</label>
                               <select className={configUi.fieldSelect} value={formNueva.id_estudiante} onChange={(e)=>setFormNueva({...formNueva, id_estudiante: e.target.value})}>
                                  <option value="">Buscar estudiante...</option>
                                  {estudiantes.map(e => <option key={e.id_estudiante} value={e.id_estudiante}>{e.nombre_completo} ({e.documento})</option>)}
                               </select>
                             </div>
                           ) : (
                             <>
                               <div className="col-span-2">
                                  <label className={configUi.fieldLabel}>Usuario a Vincular</label>
                                  <select className={configUi.fieldSelect} value={formNueva.id_usuario} onChange={(e)=>setFormNueva({...formNueva, id_usuario: e.target.value})}>
                                     <option value="">Usuarios elegibles (sin perfil estudiante)...</option>
                                     {usuariosElegibles.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.documento})</option>)}
                                  </select>
                               </div>
                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Experiencia</label>
                                  <select className={configUi.fieldSelect} value={formNueva.nivel_experiencia} onChange={(e)=>setFormNueva({...formNueva, nivel_experiencia: e.target.value})}>
                                     <option value="Principiante">Principiante</option>
                                     <option value="Intermedio">Intermedio</option>
                                     <option value="Avanzado">Avanzado</option>
                                  </select>
                               </div>
                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Edad</label>
                                  <input type="number" className={configUi.fieldInput} placeholder="0" value={formNueva.edad} onChange={(e)=>setFormNueva({...formNueva, edad: e.target.value})} />
                               </div>
                             </>
                           )}
                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Clase / Jornada</label>
                              <select className={configUi.fieldSelect} value={formNueva.id_clase} onChange={(e)=>setFormNueva({...formNueva, id_clase: e.target.value})}>
                                 <option value="">Selección de clase...</option>
                                 {clases.map(c => <option key={c.id_clase} value={c.id_clase}>{c.nombre_nivel} - {c.dia_semana} {c.hora_inicio?.substring(0,5)}</option>)}
                              </select>
                           </div>
                           <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Plan de Pago</label>
                              <select className={configUi.fieldSelect} value={formNueva.id_plan} onChange={(e)=>setFormNueva({...formNueva, id_plan: e.target.value})}>
                                 <option value="">Selección de plan...</option>
                                 {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan} (${Number(p.precio).toLocaleString()})</option>)}
                              </select>
                           </div>
                        </div>
                      </div>
                    )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-xs text-slate-400 font-medium italic">
                    {['details', 'expediente', 'pagos'].includes(modal) ? "Visualización detallada." : "Recuerda confirmar los montos y fechas."}
                  </span>
                  <div className="flex items-center gap-3">
                                  <button onClick={closeModal} className={configUi.secondaryButton}>
                      Cancelar
                    </button>
                    {!modalError && modal === 'delete' ? (
                      <button onClick={handleDelete} className={configUi.dangerButton}>Eliminar Ahora</button>
                    ) : !modalError && modal === 'registrar_pago' ? (
                      <button onClick={handleRegistrarPago} disabled={isSubmittingPago} className={configUi.primaryButton}>
                        {isSubmittingPago ? "Procesando..." : "Confirmar Pago"}
                      </button>
                    ) : !modalError && modal === 'pausar' ? (
                      <button onClick={handlePausar} className={configUi.warningButton}>Confirmar Pausa</button>
                    ) : !modalError && modal === 'finalizar' ? (
                      <button onClick={handleFinalizarMatricula} className={configUi.primaryButton}>Finalizar Ahora</button>
                    ) : !modalError && modal === 'editar' ? (
                      <button onClick={handleUpdate} className={configUi.primaryButton}>Guardar Cambios</button>
                    ) : !modalError && modal === 'nueva' ? (
                      <button onClick={handleCreate} className={configUi.primaryButton}>Crear Matrícula</button>
                    ) : null}
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

export default MatriculasAdmin;
