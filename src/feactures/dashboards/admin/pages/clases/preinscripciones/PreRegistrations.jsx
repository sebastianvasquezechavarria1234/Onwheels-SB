import React, { useEffect, useState, useMemo } from "react";
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
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Cargar preinscripciones pendientes y datos para matrícula
  const fetchPreinscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
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
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreinscripciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sorted and filtered data
  const filteredAndSorted = useMemo(() => {
    let result = [...preinscripciones];
    
    // Filter
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
    
    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
    
    return result;
  }, [preinscripciones, search, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const currentItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export CSV
  const exportCSV = () => {
    try {
      const headers = ["ID", "Nombre", "Email", "Documento", "Edad", "Nivel Experiencia", "Enfermedad", "Acudiente", "Fecha Preinscripción"];
      const rows = filteredAndSorted.map(p => 
        [
          p.id_estudiante, 
          p.nombre_completo, 
          p.email, 
          p.documento || "", 
          p.edad || "", 
          p.nivel_experiencia || "", 
          p.enfermedad || "", 
          p.nombre_acudiente || "", 
          p.fecha_preinscripcion ? new Date(p.fecha_preinscripcion).toLocaleDateString('es-ES') : ""
        ].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `preinscripciones_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Exportación exitosa");
    } catch (err) {
      console.error("Error exportando CSV:", err);
      showNotification("Error al exportar datos", "error");
    }
  };

  // Validar formulario de matrícula
  const validateMatriculaForm = () => {
    const errors = {};
    
    if (!claseSeleccionada) {
      errors.claseSeleccionada = "La clase es obligatoria";
    }
    
    if (!planSeleccionado) {
      errors.planSeleccionado = "El plan es obligatorio";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir modal
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

  // Rechazar preinscripción
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

  // Aceptar preinscripción y crear matrícula
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

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">
          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold! whitespace-nowrap uppercase tracking-wider">
                Gestión de Preinscripciones
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="text-xs font-bold!">{filteredAndSorted.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Active Toolbar (Big Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">
            {/* Search & Create Group */}
            <div className="flex flex-1 w-full sm:w-auto gap-3">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar preinscripción..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportCSV}
                  className="p-1.5 rounded-lg transition hover:bg-gray-100"
                  title="Exportar CSV"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters (Larger) */}
            <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "nombre_completo", label: "Nombre" },
                { id: "email", label: "Email" },
                { id: "documento", label: "Documento" },
                { id: "nivel_experiencia", label: "Nivel" },
              ].map((field) => (
                <button
                  key={field.id}
                  onClick={() => toggleSort(field.id)}
                  className={cn(
                    "px-4 py-2 text-xs uppercase font-bold tracking-wide rounded-lg border transition flex items-center gap-1.5 shrink-0 select-none",
                    sortField === field.id
                      ? "bg-[#040529] text-white border-[#040529] shadow-sm transform scale-105"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  )}
                >
                  {field.label}
                  {sortField === field.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </button>
              ))}
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
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Nivel Experiencia</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Documento</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Enfermedad</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Acudiente</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 opacity-80">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <p className="font-medium">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <p className="text-sm">No hay preinscripciones pendientes</p>
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
                              <p className="font-bold text-[#040529] text-sm leading-tight">{p.nombre_completo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-600">{p.email}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-gray-600">{p.edad || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{p.nivel_experiencia || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{p.documento || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{p.enfermedad && p.enfermedad !== "No aplica" ? p.enfermedad : "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          {p.nombre_acudiente ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">{p.nombre_acudiente}</div>
                              <div className="text-gray-500 text-xs">
                                {p.telefono_acudiente || "Sin teléfono"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-sm">No aplica</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                            Pendiente
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openModal("details", p)} 
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" 
                              title="Ver detalles"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openModal("matricula", p)} 
                              className="p-2 rounded-lg bg-green-50 text-green-500 hover:bg-green-600 hover:text-white transition shadow-sm border border-green-100" 
                              title="Aceptar y crear matrícula"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openModal("rechazar", p)} 
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" 
                              title="Rechazar preinscripción"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            {filteredAndSorted.length > 0 && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  Mostrando <span className="font-bold text-[#040529]">{currentItems.length}</span> de <span className="font-bold text-[#040529]">{filteredAndSorted.length}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-600">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <span className="text-sm font-bold text-[#040529] px-2">
                    {currentPage} de {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-600">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- NOTIFICATIONS & MODALS --- */}
        <AnimatePresence>
          {notification.show && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0 }} 
              className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

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
                className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === "rechazar" ? "max-w-sm w-full" : "max-w-5xl w-full"}`}
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* --- MODAL CONTENT --- */}
                {modal === "rechazar" && selectedPreinscripcion && (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#040529] mb-2">Rechazar Preinscripción</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      ¿Estás seguro de rechazar la preinscripción de{" "}
                      <span className="font-bold text-red-600">{selectedPreinscripcion.nombre_completo}</span>?
                      <br />
                      <span className="text-xs">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={closeModal} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleRechazar} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                )}

                {modal === "details" && selectedPreinscripcion && (
                  <div className="flex flex-col lg:flex-row h-[600px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalles de Preinscripción</p>
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">Detalles de Preinscripción</h3>
                        <button 
                          onClick={closeModal} 
                          className="text-gray-400 hover:text-[#040529]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.nombre_completo}</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.email}</p>
                          </div>
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
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nivel Experiencia</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedPreinscripcion.nivel_experiencia || "—"}</p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Enfermedad</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">
                              {selectedPreinscripcion.enfermedad && selectedPreinscripcion.enfermedad !== "No aplica" 
                                ? selectedPreinscripcion.enfermedad 
                                : "No aplica"}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha Preinscripción</label>
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">
                              {formatDate(selectedPreinscripcion.fecha_preinscripcion)}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estado</label>
                            <p className="mt-1 px-3 py-2 rounded-lg text-sm font-bold border bg-amber-50 text-amber-600 border-amber-100">
                              Pendiente
                            </p>
                          </div>
                        </div>
                        
                        {selectedPreinscripcion.nombre_acudiente && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-[#040529] mb-3">Información del Acudiente</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs font-bold text-gray-500">Nombre:</span>
                                <span className="text-sm text-[#040529] font-medium">{selectedPreinscripcion.nombre_acudiente}</span>
                              </div>
                              {selectedPreinscripcion.telefono_acudiente && (
                                <div className="flex justify-between">
                                  <span className="text-xs font-bold text-gray-500">Teléfono:</span>
                                  <span className="text-sm text-[#040529]">{selectedPreinscripcion.telefono_acudiente}</span>
                                </div>
                              )}
                              {selectedPreinscripcion.email_acudiente && (
                                <div className="flex justify-between">
                                  <span className="text-xs font-bold text-gray-500">Email:</span>
                                  <span className="text-sm text-[#040529]">{selectedPreinscripcion.email_acudiente}</span>
                                </div>
                              )}
                              {selectedPreinscripcion.relacion && (
                                <div className="flex justify-between">
                                  <span className="text-xs font-bold text-gray-500">Relación:</span>
                                  <span className="text-sm text-[#040529]">{selectedPreinscripcion.relacion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-6">
                          <button 
                            onClick={closeModal} 
                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modal === "matricula" && selectedPreinscripcion && (
                  <div className="flex flex-col lg:flex-row h-[550px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Crear Matrícula</p>
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">Crear Matrícula</h3>
                        <button 
                          onClick={closeModal} 
                          className="text-gray-400 hover:text-[#040529]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg mb-5 border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium">
                          <span className="font-bold">Estudiante:</span> {selectedPreinscripcion.nombre_completo}
                        </p>
                        <p className="text-sm text-blue-800">
                          <span className="font-bold">Email:</span> {selectedPreinscripcion.email}
                        </p>
                      </div>

                      <form className="space-y-5">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Clase *</label>
                          <div className="relative mt-1">
                            <select
                              value={claseSeleccionada}
                              onChange={(e) => {
                                setClaseSeleccionada(e.target.value);
                                if (formErrors.claseSeleccionada) {
                                  setFormErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.claseSeleccionada;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={cn(
                                "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                formErrors.claseSeleccionada && "border-red-500 bg-red-50"
                              )}
                            >
                              <option value="">Seleccionar clase</option>
                              {clases.map(clase => (
                                <option key={clase.id_clase} value={clase.id_clase}>
                                  {clase.nombre_nivel} - {clase.dia_semana} {clase.hora_inicio.substring(0, 5)} ({clase.nombre_sede})
                                </option>
                              ))}
                            </select>
                            {formErrors.claseSeleccionada && (
                              <p className="mt-1 text-xs text-red-500">{formErrors.claseSeleccionada}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Plan *</label>
                          <div className="relative mt-1">
                            <select
                              value={planSeleccionado}
                              onChange={(e) => {
                                setPlanSeleccionado(e.target.value);
                                if (formErrors.planSeleccionado) {
                                  setFormErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.planSeleccionado;
                                    return newErrors;
                                  });
                                }
                              }}
                              className={cn(
                                "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                formErrors.planSeleccionado && "border-red-500 bg-red-50"
                              )}
                            >
                              <option value="">Seleccionar plan</option>
                              {planes.map(plan => (
                                <option key={plan.id_plan} value={plan.id_plan}>
                                  {plan.nombre_plan} - ${plan.precio}
                                </option>
                              ))}
                            </select>
                            {formErrors.planSeleccionado && (
                              <p className="mt-1 text-xs text-red-500">{formErrors.planSeleccionado}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha de matrícula</label>
                          <input
                            type="date"
                            value={fechaMatricula}
                            onChange={(e) => setFechaMatricula(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                          <button 
                            type="button" 
                            onClick={closeModal} 
                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="button" 
                            onClick={handleAceptarYMatricular} 
                            className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Aceptar y Matricular
                          </button>
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
