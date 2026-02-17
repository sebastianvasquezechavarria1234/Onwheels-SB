// src/features/dashboards/admin/pages/clases/preinscripciones/PreinscripcionesAdmin.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Eye, Check, X, Search, Hash, User, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getPreinscripcionesPendientes,
  rechazarPreinscripcion,
  aceptarPreinscripcionYCrearMatricula
} from "../../services/preinscripcionesService";
import axios from "axios";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PreinscripcionesAdmin = () => {
  // --- ESTADOS ---
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(false);
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Sorting state
  const [sortField, setSortField] = useState("nombre_completo");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [modal, setModal] = useState(null); // "details" | "matricula" | "rechazar"
  const [selectedPreinscripcion, setSelectedPreinscripcion] = useState(null);
  
  // Datos para el modal de matrícula
  const [claseSeleccionada, setClaseSeleccionada] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [fechaMatricula, setFechaMatricula] = useState(new Date().toISOString().split('T')[0]);

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- CARGAR DATOS ---
  const fetchPreinscripciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendError(false);

      const [preinscripcionesData, clasesData, planesData] = await Promise.all([
        getPreinscripcionesPendientes(),
        axios.get("http://localhost:3000/api/clases").then(r => r.data),
        axios.get("http://localhost:3000/api/planes").then(r => r.data)
      ]);

      setPreinscripciones(Array.isArray(preinscripcionesData) ? preinscripcionesData : []);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos.");
      if (err.message && (err.message.includes("Network Error") || err.code === "ERR_CONNECTION_REFUSED")) {
        setBackendError(true);
        setError("No se pudo conectar con el servidor. Verifica que el Backend esté encendido.");
      }
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreinscripciones();
  }, [fetchPreinscripciones]);

  // --- FILTRADO Y PAGINACIÓN ---
  const preinscripcionesFiltradas = useMemo(() => {
    let result = [...preinscripciones];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.nombre_completo || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.documento || "").includes(q) ||
        (p.nivel_experiencia || "").toLowerCase().includes(q) ||
        (p.enfermedad || "").toLowerCase().includes(q) ||
        (p.nombre_acudiente || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [preinscripciones, search]);

  const totalPages = Math.max(1, Math.ceil(preinscripcionesFiltradas.length / itemsPerPage));
  const currentItems = preinscripcionesFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // --- MODAL HANDLERS ---
  const openModal = (type, preinscripcion = null) => {
    setModal(type);
    setSelectedPreinscripcion(preinscripcion);
    setFormErrors({});
    
    if (type === "matricula") {
      setClaseSeleccionada("");
      setPlanSeleccionado("");
      setFechaMatricula(new Date().toISOString().split('T')[0]);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedPreinscripcion(null);
    setFormErrors({});
  };

  // Validar formulario de matrícula
  const validateMatriculaForm = () => {
    const errors = {};
    if (!claseSeleccionada) errors.claseSeleccionada = "La clase es requerida";
    if (!planSeleccionado) errors.planSeleccionado = "El plan es requerido";
    if (!fechaMatricula) errors.fechaMatricula = "La fecha es requerida";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- CRUD OPERATIONS ---
  const handleRechazar = async () => {
    try {
      await rechazarPreinscripcion(selectedPreinscripcion.id_estudiante);
      await fetchPreinscripciones();
      showNotification("Preinscripción rechazada correctamente");
      closeModal();
    } catch (err) {
      console.error("Error rechazando preinscripción:", err);
      const errorMessage = err.response?.data?.mensaje || "Error rechazando preinscripción";
      showNotification(errorMessage, "error");
    }
  };

  const handleAceptarYMatricular = async () => {
    if (!validateMatriculaForm()) {
      showNotification("Por favor completa todos los campos obligatorios", "error");
      return;
    }
    
    try {
      const matriculaData = {
        id_clase: parseInt(claseSeleccionada),
        id_plan: parseInt(planSeleccionado),
        fecha_matricula: fechaMatricula,
      };

      await aceptarPreinscripcionYCrearMatricula(selectedPreinscripcion.id_estudiante, matriculaData);
      await fetchPreinscripciones();
      showNotification("Preinscripción aceptada y matrícula creada correctamente");
      closeModal();
    } catch (err) {
      console.error("Error aceptando preinscripción:", err);
      const errorMessage = err.response?.data?.mensaje || "Error al aceptar preinscripción";
      showNotification(errorMessage, "error");
    }
  };

  return (
    <>
      <div className="flex flex-col h-dvh bg-gray-50 overflow-hidden">

        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">

          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between  rounded-xl px-4 py-2 ">
            <div className="flex items-center gap-4">
              <h1 className="text-sm whitespace-nowrap uppercase tracking-wider">
                Gestión de Preinscripciones
              </h1>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md">
                  <Hash className="h-3 w-3 " />
                  <span className="text-xs font-bold ">{preinscripcionesFiltradas.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Active Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar preinscripción..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">

            {/* Table Content */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <table className="w-full text-left relative">
                <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Estudiante</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Email</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Edad</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Nivel</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Enfermedad</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Acudiente</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td></tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                          <AlertCircle className="h-8 w-8 opacity-80" />
                          <p className="font-medium">{error}</p>
                          {backendError && (
                            <p className="text-xs text-red-400 bg-red-50 px-3 py-1 rounded-full">
                              Intenta iniciar el backend en el puerto 3000
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Hash className="h-8 w-8" />
                          <p className="text-sm">No se encontraron preinscripciones pendientes</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p) => (
                      <tr key={p.id_estudiante} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                              {p.nombre_completo?.substring(0, 2).toUpperCase() || "PR"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#040529] text-sm leading-tight mb-0.5">{p.nombre_completo}</p>
                              <p className="text-xs text-gray-500 font-medium">{p.documento || "Sin documento"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{p.email}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">
                            {p.edad || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{p.nivel_experiencia || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{p.enfermedad || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {p.nombre_acudiente ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{p.nombre_acudiente}</span>
                              <span className="text-xs text-gray-400">{p.telefono_acudiente || "—"}</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal("details", p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => openModal("matricula", p)} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition shadow-sm border border-green-100" title="Aceptar"><Check className="h-4 w-4" /></button>
                            <button onClick={() => openModal("rechazar", p)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Rechazar"><X className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            {totalPages > 1 && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  Mostrando <span className="font-bold text-[#040529]">{Math.min(currentItems.length, itemsPerPage)}</span> de <span className="font-bold text-[#040529]">{preinscripcionesFiltradas.length}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
                  <span className="text-sm font-bold text-[#040529] px-2">{currentPage}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- NOTIFICATIONS & MODALS --- */}
        <AnimatePresence>
          {notification.show && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}>
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === "rechazar" ? "max-w-sm w-full" : "max-w-4xl w-full"}`}
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* --- MODAL RECHAZAR --- */}
                {modal === "rechazar" && selectedPreinscripcion && (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><X size={24} /></div>
                    <h3 className="text-lg font-bold text-[#040529] mb-2">Rechazar Preinscripción</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      ¿Estás seguro de rechazar la preinscripción de <span className="font-bold text-red-600">{selectedPreinscripcion.nombre_completo}</span>?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                      <button onClick={handleRechazar} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Rechazar</button>
                    </div>
                  </div>
                )}

                {/* --- MODAL DETAILS --- */}
                {modal === "details" && selectedPreinscripcion && (
                  <div className="flex flex-col lg:flex-row h-[500px] lg:h-[600px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <User size={48} strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalles de Preinscripción</p>
                    </div>

                    {/* Right Side (Content) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">Información del Estudiante</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.nombre_completo}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Documento</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.documento || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.telefono || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Edad</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.edad || "—"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nivel Experiencia</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.nivel_experiencia || "—"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Enfermedad</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.enfermedad || "—"}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha Preinscripción</label>
                          <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">
                            {selectedPreinscripcion.fecha_preinscripcion ? new Date(selectedPreinscripcion.fecha_preinscripcion).toLocaleDateString('es-ES') : "—"}
                          </p>
                        </div>

                        {selectedPreinscripcion.nombre_acudiente && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Información del Acudiente</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre</label>
                                <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.nombre_acudiente}</p>
                              </div>
                              {selectedPreinscripcion.telefono_acudiente && (
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                                  <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.telefono_acudiente}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                          <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50">Cerrar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- MODAL MATRICULA --- */}
                {modal === "matricula" && selectedPreinscripcion && (
                  <div className="flex flex-col lg:flex-row h-[500px] lg:h-[600px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <Check size={48} strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Crear Matrícula</p>
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">Aceptar y Matricular</h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                        <p className="text-sm text-blue-800"><strong>Estudiante:</strong> {selectedPreinscripcion.nombre_completo}</p>
                        <p className="text-sm text-blue-800"><strong>Email:</strong> {selectedPreinscripcion.email}</p>
                      </div>

                      <form className="space-y-5">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Clase</label>
                          <select
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#040529]/20"
                            value={claseSeleccionada}
                            onChange={(e) => setClaseSeleccionada(e.target.value)}
                            required
                          >
                            <option value="">Seleccionar clase</option>
                            {clases.map(clase => (
                              <option key={clase.id_clase} value={clase.id_clase}>
                                {clase.nombre_nivel} - {clase.dia_semana} {clase.hora_inicio} ({clase.nombre_sede})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Plan</label>
                          <select
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#040529]/20"
                            value={planSeleccionado}
                            onChange={(e) => setPlanSeleccionado(e.target.value)}
                            required
                          >
                            <option value="">Seleccionar plan</option>
                            {planes.map(plan => (
                              <option key={plan.id_plan} value={plan.id_plan}>
                                {plan.nombre_plan} - ${plan.precio}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha de matrícula</label>
                          <input
                            type="date"
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#040529]/20"
                            value={fechaMatricula}
                            onChange={(e) => setFechaMatricula(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                          <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50">Cancelar</button>
                          <button type="button" onClick={handleAceptarYMatricular} className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10">Aceptar y Matricular</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PreinscripcionesAdmin;
