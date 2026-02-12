import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
  updateEstadoEstudiante,
  getUsuariosActivos,
  getAcudientes,
  createAcudiente
} from "../../services/estudiantesServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [acudientes, setAcudientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: "",
    enfermedad: "",
    nivel_experiencia: "",
    edad: "",
    id_acudiente: "",
  });
  const [tieneEnfermedad, setTieneEnfermedad] = useState(false);
  const [crearAcudiente, setCrearAcudiente] = useState(false);
  const [nuevoAcudiente, setNuevoAcudiente] = useState({
    nombre_acudiente: "",
    telefono: "",
    email: "",
    relacion: ""
  });
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Sorting state
  const [sortField, setSortField] = useState("nombre_completo");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Cargar estudiantes y datos relacionados
  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const [estudiantesData, usuariosData, acudientesData] = await Promise.all([
        getEstudiantes(),
        getUsuariosActivos(),
        getAcudientes()
      ]);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setAcudientes(Array.isArray(acudientesData) ? acudientesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sorted and filtered data
  const filteredAndSorted = useMemo(() => {
    let result = [...estudiantes];
    
    // Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        (e.nombre_completo || "").toLowerCase().includes(q) ||
        (e.email || "").toLowerCase().includes(q) ||
        (e.documento || "").includes(q) ||
        (e.estado || "").toLowerCase().includes(q)
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
  }, [estudiantes, search, sortField, sortDirection]);

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
      const headers = ["ID", "Nombre", "Email", "Documento", "Edad", "Nivel Experiencia", "Estado"];
      const rows = filteredAndSorted.map(e => 
        [e.id_estudiante, e.nombre_completo, e.email, e.documento, e.edad, e.nivel_experiencia, e.estado].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Exportación exitosa");
    } catch (err) {
      console.error("Error exportando CSV:", err);
      showNotification("Error al exportar datos", "error");
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (modal === "crear" && !formData.id_usuario) {
      errors.id_usuario = "El usuario es obligatorio";
    }
    
    if (!formData.edad.trim()) {
      errors.edad = "La edad es obligatoria";
    } else {
      const edadNum = parseInt(formData.edad);
      if (isNaN(edadNum) || edadNum < 1 || edadNum > 100) {
        errors.edad = "La edad debe estar entre 1 y 100";
      }
    }
    
    if (!formData.nivel_experiencia) {
      errors.nivel_experiencia = "El nivel de experiencia es obligatorio";
    }
    
    if (tieneEnfermedad && !formData.enfermedad.trim()) {
      errors.enfermedad = "La enfermedad es obligatoria";
    }
    
    if (formData.edad && parseInt(formData.edad) < 18) {
      if (crearAcudiente) {
        if (!nuevoAcudiente.nombre_acudiente.trim()) {
          errors.nombre_acudiente = "El nombre del acudiente es obligatorio";
        }
        if (nuevoAcudiente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoAcudiente.email)) {
          errors.email = "Email inválido";
        }
      } else if (!formData.id_acudiente) {
        errors.id_acudiente = "Selecciona un acudiente o crea uno nuevo";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al cambiar
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en nuevo acudiente
  const handleNuevoAcudienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoAcudiente((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al cambiar
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Crear estudiante
  const handleCreate = async () => {
    if (!validateForm()) {
      showNotification("Por favor corrige los errores del formulario", "error");
      return;
    }
    
    try {
      const edad = parseInt(formData.edad);
      let id_acudiente_final = null;
      
      if (edad < 18) {
        if (crearAcudiente) {
          const nuevoAcudienteCreado = await createAcudiente(nuevoAcudiente);
          id_acudiente_final = nuevoAcudienteCreado.id_acudiente;
        } else if (formData.id_acudiente) {
          id_acudiente_final = parseInt(formData.id_acudiente);
        }
      }
      
      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        enfermedad: tieneEnfermedad ? formData.enfermedad : "No aplica",
        nivel_experiencia: formData.nivel_experiencia,
        edad: edad,
        id_acudiente: id_acudiente_final
      };
      
      await createEstudiante(payload);
      await fetchEstudiantes();
      closeModal();
      showNotification("Estudiante creado con éxito");
    } catch (err) {
      console.error("Error creando estudiante:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando estudiante";
      showNotification(errorMessage, "error");
    }
  };

  // Editar estudiante
  const handleEdit = async () => {
    if (!validateForm()) {
      showNotification("Por favor corrige los errores del formulario", "error");
      return;
    }
    
    try {
      if (!selectedEstudiante) return;
      
      const edad = parseInt(formData.edad);
      let id_acudiente_final = null;
      
      if (edad < 18) {
        if (crearAcudiente) {
          const nuevoAcudienteCreado = await createAcudiente(nuevoAcudiente);
          id_acudiente_final = nuevoAcudienteCreado.id_acudiente;
        } else if (formData.id_acudiente) {
          id_acudiente_final = parseInt(formData.id_acudiente);
        }
      } else if (edad >= 18) {
        id_acudiente_final = null;
      } else {
        id_acudiente_final = formData.id_acudiente ? parseInt(formData.id_acudiente) : selectedEstudiante.id_acudiente;
      }
      
      const payload = {
        enfermedad: tieneEnfermedad ? formData.enfermedad : "No aplica",
        nivel_experiencia: formData.nivel_experiencia,
        edad: edad,
        id_acudiente: id_acudiente_final
      };
      
      await updateEstudiante(selectedEstudiante.id_estudiante, payload);
      await fetchEstudiantes();
      closeModal();
      showNotification("Estudiante actualizado con éxito");
    } catch (err) {
      console.error("Error editando estudiante:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando estudiante";
      showNotification(errorMessage, "error");
    }
  };

  // Eliminar estudiante
  const handleDelete = async () => {
    try {
      if (!selectedEstudiante) return;
      await deleteEstudiante(selectedEstudiante.id_estudiante);
      await fetchEstudiantes();
      closeModal();
      showNotification("Estudiante eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando estudiante:", err);
      const errorMessage = err.response?.data?.mensaje || "Error eliminando estudiante";
      showNotification(errorMessage, "error");
    }
  };

  // Actualizar estado del estudiante
  const handleActualizarEstado = async (estudiante, nuevoEstado) => {
    try {
      await updateEstadoEstudiante(estudiante.id_estudiante, nuevoEstado);
      await fetchEstudiantes();
      showNotification(`Estado actualizado a ${nuevoEstado}`);
    } catch (err) {
      console.error("Error actualizando estado:", err);
      const errorMessage = err.response?.data?.mensaje || "Error actualizando estado";
      showNotification(errorMessage, "error");
    }
  };

  // Abrir modal
  const openModal = (type, estudiante = null) => {
    setModal(type);
    setSelectedEstudiante(estudiante);
    setTieneEnfermedad(false);
    setCrearAcudiente(false);
    setFormErrors({});
    setNuevoAcudiente({
      nombre_acudiente: "",
      telefono: "",
      email: "",
      relacion: ""
    });
    
    if (estudiante && type === "editar") {
      setFormData({
        id_usuario: estudiante.id_usuario.toString(),
        enfermedad: estudiante.enfermedad && estudiante.enfermedad !== "No aplica" ? estudiante.enfermedad : "",
        nivel_experiencia: estudiante.nivel_experiencia || "",
        edad: estudiante.edad ? estudiante.edad.toString() : "",
        id_acudiente: estudiante.id_acudiente ? estudiante.id_acudiente.toString() : "",
      });
      
      if (estudiante.enfermedad && estudiante.enfermedad !== "No aplica") {
        setTieneEnfermedad(true);
      } else {
        setTieneEnfermedad(false);
      }
      
      if (estudiante.id_acudiente) {
        setCrearAcudiente(false);
      }
    } else if (!estudiante) {
      setFormData({
        id_usuario: "",
        enfermedad: "",
        nivel_experiencia: "",
        edad: "",
        id_acudiente: "",
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedEstudiante(null);
    setFormData({
      id_usuario: "",
      enfermedad: "",
      nivel_experiencia: "",
      edad: "",
      id_acudiente: "",
    });
    setTieneEnfermedad(false);
    setCrearAcudiente(false);
    setFormErrors({});
    setNuevoAcudiente({
      nombre_acudiente: "",
      telefono: "",
      email: "",
      relacion: ""
    });
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
                Gestión de Estudiantes
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
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
                  placeholder="Buscar estudiante..."
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
              <button
                onClick={() => openModal("crear")}
                className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Registrar Estudiante
              </button>

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
                { id: "edad", label: "Edad" },
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
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Acudiente</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
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
                      <td colSpan="7" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          <p className="text-sm">No se encontraron estudiantes registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((e) => (
                      <tr key={e.id_estudiante} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                              {e.nombre_completo?.substring(0, 2).toUpperCase() || "ES"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#040529] text-sm leading-tight">{e.nombre_completo}</p>
                              <p className="text-xs text-gray-500 font-medium">{e.documento}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-600">{e.email}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-gray-600">{e.edad || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{e.nivel_experiencia || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          {e.nombre_acudiente ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">{e.nombre_acudiente}</div>
                              <div className="text-gray-500 text-xs">
                                {e.relacion || "No especificada"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-sm">
                              {e.edad && e.edad < 18 ? "Sin acudiente" : "No aplica"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <select
                            value={e.estado}
                            onChange={(event) => handleActualizarEstado(e, event.target.value)}
                            className={cn(
                              "text-xs font-bold rounded-full px-3 py-1 border flex justify-center",
                              e.estado === 'Activo'
                                ? 'bg-green-100 text-green-600 border-green-600'
                                : e.estado === 'Pendiente'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-red-50 text-red-600 border-red-100'
                            )}
                          >
                            <option value="Activo">Activo</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Inactivo">Inactivo</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openModal("ver", e)} 
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" 
                              title="Ver"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openModal("editar", e)} 
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" 
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <line x1="18" y1="2" x2="22" y2="6"></line>
                                <path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openModal("eliminar", e)} 
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" 
                              title="Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
                className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === "eliminar" ? "max-w-sm w-full" : "max-w-5xl w-full"}`}
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* --- MODAL CONTENT --- */}
                {modal === "eliminar" ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Estudiante</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      ¿Estás seguro de eliminar a{" "}
                      <span className="font-bold text-red-600">{selectedEstudiante?.nombre_completo}</span>?
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
                        onClick={handleDelete} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row h-[650px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {modal === "crear" ? "Registro de Estudiante" : modal === "editar" ? "Edición de Estudiante" : "Detalles del Estudiante"}
                      </p>
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">
                          {modal === "crear" 
                            ? "Registrar Nuevo Estudiante" 
                            : modal === "editar" 
                              ? "Editar Estudiante" 
                              : "Detalles del Estudiante"}
                        </h3>
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

                      {modal === "ver" && selectedEstudiante && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.nombre_completo}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.email}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Documento</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.documento || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.telefono || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Edad</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.edad || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nivel Experiencia</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.nivel_experiencia || "—"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Enfermedad</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedEstudiante.enfermedad || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha Preinscripción</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{formatDate(selectedEstudiante.fecha_preinscripcion)}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estado</label>
                              <p className={cn(
                                "mt-1 px-3 py-2 rounded-lg text-sm font-bold border",
                                selectedEstudiante.estado === 'Activo'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : selectedEstudiante.estado === 'Pendiente'
                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                    : 'bg-red-50 text-red-600 border-red-100'
                              )}>
                                {selectedEstudiante.estado}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-[#040529] mb-3">Información del Acudiente</h4>
                            {selectedEstudiante.nombre_acudiente ? (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs font-bold text-gray-500">Nombre:</span>
                                  <span className="text-sm text-[#040529] font-medium">{selectedEstudiante.nombre_acudiente}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs font-bold text-gray-500">Relación:</span>
                                  <span className="text-sm text-[#040529]">{selectedEstudiante.relacion || "No especificada"}</span>
                                </div>
                                {selectedEstudiante.telefono_acudiente && (
                                  <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-500">Teléfono:</span>
                                    <span className="text-sm text-[#040529]">{selectedEstudiante.telefono_acudiente}</span>
                                  </div>
                                )}
                                {selectedEstudiante.email_acudiente && (
                                  <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-500">Email:</span>
                                    <span className="text-sm text-[#040529]">{selectedEstudiante.email_acudiente}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                {selectedEstudiante.edad && selectedEstudiante.edad < 18
                                  ? "Sin acudiente asignado"
                                  : "No aplica (mayor de edad)"}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end pt-6">
                            <button 
                              onClick={closeModal} 
                              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>
                      )}

                      {(modal === "crear" || modal === "editar") && (
                        <form className="space-y-5">
                          {modal === "crear" && (
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Usuario *</label>
                              <div className="relative mt-1">
                                <select
                                  name="id_usuario"
                                  value={formData.id_usuario}
                                  onChange={handleChange}
                                  className={cn(
                                    "w-full px-3 py-2 bg-gray-50 border-1! border-gray-200! rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                    formErrors.id_usuario && "border-red-500 bg-red-50"
                                  )}
                                >
                                  <option value="">Seleccionar usuario</option>
                                  {usuarios.map(usuario => (
                                    <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                      {usuario.nombre_completo} ({usuario.email})
                                    </option>
                                  ))}
                                </select>
                                {formErrors.id_usuario && (
                                  <p className="mt-1 text-xs text-red-500">{formErrors.id_usuario}</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {modal === "editar" && selectedEstudiante && (
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Usuario</label>
                              <div className="w-full mt-1 px-3 py-2 bg-gray-100 border-1! border-gray-200!  rounded-lg text-sm text-gray-600">
                                {selectedEstudiante.nombre_completo} ({selectedEstudiante.email})
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Edad *</label>
                              <div className="relative mt-1">
                                <input
                                  type="number"
                                  name="edad"
                                  value={formData.edad}
                                  onChange={handleChange}
                                  className={cn(
                                    "w-full px-3 py-2 bg-gray-50 border-1! border-gray-200! rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                    formErrors.edad && "border-red-500 bg-red-50"
                                  )}
                                  placeholder="Ej: 16"
                                  min="1"
                                  max="100"
                                />
                                {formErrors.edad && (
                                  <p className="mt-1 text-xs text-red-500">{formErrors.edad}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nivel Experiencia *</label>
                              <div className="relative mt-1">
                                <select
                                  name="nivel_experiencia"
                                  value={formData.nivel_experiencia}
                                  onChange={handleChange}
                                  className={cn(
                                    "w-full px-3 py-2 bg-gray-50 border-1! border-gray-200! rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                    formErrors.nivel_experiencia && "border-red-500 bg-red-50"
                                  )}
                                >
                                  <option value="">Seleccionar nivel</option>
                                  <option value="Principiante">Principiante</option>
                                  <option value="Intermedio">Intermedio</option>
                                  <option value="Avanzado">Avanzado</option>
                                </select>
                                {formErrors.nivel_experiencia && (
                                  <p className="mt-1 text-xs text-red-500">{formErrors.nivel_experiencia}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">¿Tiene enfermedad o condición médica?</label>
                            <select
                              value={tieneEnfermedad ? "si" : "no"}
                              onChange={(e) => setTieneEnfermedad(e.target.value === "si")}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border-1! border-gray-200! rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]"
                            >
                              <option value="no">No</option>
                              <option value="si">Sí</option>
                            </select>
                          </div>
                          
                          {tieneEnfermedad && (
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Enfermedad o Condición Médica *</label>
                              <div className="relative mt-1">
                                <textarea
                                  name="enfermedad"
                                  value={formData.enfermedad}
                                  onChange={handleChange}
                                  rows="2"
                                  className={cn(
                                    "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] resize-none",
                                    formErrors.enfermedad && "border-red-500 bg-red-50"
                                  )}
                                  placeholder="Ej: Alergia a frutos secos, asma, etc."
                                />
                                {formErrors.enfermedad && (
                                  <p className="mt-1 text-xs text-red-500">{formErrors.enfermedad}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {formData.edad && parseInt(formData.edad) < 18 && (
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-3 block">Acudiente</label>
                              <div className="border-b border-gray-200 mb-4">
                                <nav className="-mb-px flex space-x-8">
                                  <button
                                    type="button"
                                    onClick={() => setCrearAcudiente(false)}
                                    className={cn(
                                      "py-2 px-1 text-sm font-medium",
                                      !crearAcudiente
                                        ? 'border-b-2 border-[#040529] text-[#040529]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    )}
                                  >
                                    Acudiente existente
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCrearAcudiente(true)}
                                    className={cn(
                                      "py-2 px-1 text-sm font-medium",
                                      crearAcudiente
                                        ? 'border-b-2 border-[#040529] text-[#040529]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    )}
                                  >
                                    Nuevo acudiente
                                  </button>
                                </nav>
                              </div>
                              
                              {!crearAcudiente ? (
                                <div>
                                  <div className="relative mt-1">
                                    <select
                                      name="id_acudiente"
                                      value={formData.id_acudiente}
                                      onChange={handleChange}
                                      className={cn(
                                        "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                        formErrors.id_acudiente && "border-red-500 bg-red-50"
                                      )}
                                    >
                                      <option value="">Seleccionar acudiente existente</option>
                                      {acudientes.length > 0 ? (
                                        acudientes.map(acudiente => (
                                          <option key={acudiente.id_acudiente} value={acudiente.id_acudiente}>
                                            {acudiente.nombre_acudiente} - {acudiente.relacion} {acudiente.telefono && `(${acudiente.telefono})`}
                                          </option>
                                        ))
                                      ) : (
                                        <option value="" disabled>No hay acudientes registrados</option>
                                      )}
                                    </select>
                                    {formErrors.id_acudiente && (
                                      <p className="mt-1 text-xs text-red-500">{formErrors.id_acudiente}</p>
                                    )}
                                  </div>
                                  <p className="mt-2 text-xs text-gray-500">
                                    Selecciona un acudiente de la lista existente
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del acudiente *</label>
                                    <div className="relative mt-1">
                                      <input
                                        type="text"
                                        name="nombre_acudiente"
                                        value={nuevoAcudiente.nombre_acudiente}
                                        onChange={handleNuevoAcudienteChange}
                                        className={cn(
                                          "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                          formErrors.nombre_acudiente && "border-red-500 bg-red-50"
                                        )}
                                        placeholder="Nombre completo del acudiente"
                                      />
                                      {formErrors.nombre_acudiente && (
                                        <p className="mt-1 text-xs text-red-500">{formErrors.nombre_acudiente}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Relación con el estudiante</label>
                                    <select
                                      name="relacion"
                                      value={nuevoAcudiente.relacion}
                                      onChange={handleNuevoAcudienteChange}
                                      className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]"
                                    >
                                      <option value="">Seleccionar relación</option>
                                      <option value="Padre">Padre</option>
                                      <option value="Madre">Madre</option>
                                      <option value="Tutor">Tutor</option>
                                      <option value="Otro">Otro</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono (opcional)</label>
                                    <input
                                      type="text"
                                      name="telefono"
                                      value={nuevoAcudiente.telefono}
                                      onChange={handleNuevoAcudienteChange}
                                      className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]"
                                      placeholder="Número de teléfono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email (opcional)</label>
                                    <div className="relative mt-1">
                                      <input
                                        type="email"
                                        name="email"
                                        value={nuevoAcudiente.email}
                                        onChange={handleNuevoAcudienteChange}
                                        className={cn(
                                          "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                          formErrors.email && "border-red-500 bg-red-50"
                                        )}
                                        placeholder="correo@ejemplo.com"
                                      />
                                      {formErrors.email && (
                                        <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Completa los datos para registrar un nuevo acudiente
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {modal === "editar" && formData.edad && parseInt(formData.edad) >= 18 && selectedEstudiante.id_acudiente && (
                            <div className="bg-yellow-50 p-3 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Atención:</strong> El estudiante ahora es mayor de edad.
                                ¿Desea eliminar el acudiente asociado?
                              </p>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, id_acudiente: "" })}
                                className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300"
                              >
                                Eliminar acudiente
                              </button>
                            </div>
                          )}

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
                              onClick={modal === "crear" ? handleCreate : handleEdit} 
                              className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10"
                            >
                              {modal === "crear" ? "Registrar Estudiante" : "Guardar Cambios"}
                            </button>
                          </div>
                        </form>
                      )}
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

export default Estudiantes;
