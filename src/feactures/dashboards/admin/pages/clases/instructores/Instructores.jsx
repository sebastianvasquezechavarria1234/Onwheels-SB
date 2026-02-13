import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getInstructores,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getUsuariosNoInstructores
} from "../../services/instructoresServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Instructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: "",
    anios_experiencia: "",
    especialidad: ""
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

  // Cargar instructores y usuarios disponibles
  const fetchInstructores = async () => {
    try {
      setLoading(true);
      setError(null);
      const [instructoresData, usuariosData] = await Promise.all([
        getInstructores(),
        getUsuariosNoInstructores()
      ]);
      setInstructores(Array.isArray(instructoresData) ? instructoresData : []);
      setUsuariosDisponibles(Array.isArray(usuariosData) ? usuariosData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sorted and filtered data
  const filteredAndSorted = useMemo(() => {
    let result = [...instructores];
    
    // Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => 
        (i.nombre_completo || "").toLowerCase().includes(q) ||
        (i.email || "").toLowerCase().includes(q) ||
        (i.especialidad || "").toLowerCase().includes(q) ||
        (i.estado ? "activo" : "inactivo").includes(q)
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
  }, [instructores, search, sortField, sortDirection]);

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
      const headers = ["ID", "Nombre", "Email", "Especialidad", "Experiencia", "Estado"];
      const rows = filteredAndSorted.map(i => 
        [i.id_instructor, i.nombre_completo, i.email, i.especialidad || "", i.anios_experiencia || "", i.estado ? "Activo" : "Inactivo"].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `instructores_${new Date().toISOString().split('T')[0]}.csv`;
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
    
    if (!formData.id_usuario) {
      errors.id_usuario = "El usuario es obligatorio";
    }
    
    if (formData.anios_experiencia && (isNaN(parseInt(formData.anios_experiencia)) || parseInt(formData.anios_experiencia) < 0)) {
      errors.anios_experiencia = "Los años de experiencia deben ser un número positivo";
    }
    
    if (!formData.especialidad.trim()) {
      errors.especialidad = "La especialidad es obligatoria";
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

  // Crear instructor
  const handleCreate = async () => {
    if (!validateForm()) {
      showNotification("Por favor corrige los errores del formulario", "error");
      return;
    }
    
    try {
      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        anios_experiencia: formData.anios_experiencia ? parseInt(formData.anios_experiencia) : null,
        especialidad: formData.especialidad.trim()
      };

      await createInstructor(payload);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor creado con éxito");
    } catch (err) {
      console.error("Error creando instructor:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando instructor";
      showNotification(errorMessage, "error");
    }
  };

  // Editar instructor
  const handleEdit = async () => {
    if (!validateForm()) {
      showNotification("Por favor corrige los errores del formulario", "error");
      return;
    }
    
    try {
      if (!selectedInstructor) return;

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        anios_experiencia: formData.anios_experiencia ? parseInt(formData.anios_experiencia) : null,
        especialidad: formData.especialidad.trim()
      };

      await updateInstructor(selectedInstructor.id_instructor, payload);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor actualizado con éxito");
    } catch (err) {
      console.error("Error editando instructor:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando instructor";
      showNotification(errorMessage, "error");
    }
  };

  // Desactivar instructor
  const handleDelete = async () => {
    try {
      if (!selectedInstructor) return;
      await deleteInstructor(selectedInstructor.id_instructor);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor desactivado con éxito");
    } catch (err) {
      console.error("Error desactivando instructor:", err);
      const errorMessage = err.response?.data?.mensaje || "Error desactivando instructor";
      showNotification(errorMessage, "error");
    }
  };

  // Abrir modal
  const openModal = (type, instructor = null) => {
    setModal(type);
    setSelectedInstructor(instructor);
    setFormErrors({});
    
    if (type === "crear") {
      setFormData({
        id_usuario: "",
        anios_experiencia: "",
        especialidad: ""
      });
    } else if (instructor) {
      setFormData({
        id_usuario: instructor.id_usuario.toString(),
        anios_experiencia: instructor.anios_experiencia ? instructor.anios_experiencia.toString() : "",
        especialidad: instructor.especialidad || ""
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedInstructor(null);
    setFormData({
      id_usuario: "",
      anios_experiencia: "",
      especialidad: ""
    });
    setFormErrors({});
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
                Gestión de Instructores
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M18 20a6 6 0 0 0-12 0"></path>
                    <circle cx="12" cy="10" r="4"></circle>
                    <circle cx="12" cy="12" r="10"></circle>
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
                  placeholder="Buscar instructor..."
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
                Registrar Instructor
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
                { id: "especialidad", label: "Especialidad" },
                { id: "anios_experiencia", label: "Experiencia" },
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
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Instructor</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Email</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Especialidad</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Experiencia</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center">
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
                      <td colSpan="6" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                            <path d="M18 20a6 6 0 0 0-12 0"></path>
                            <circle cx="12" cy="10" r="4"></circle>
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                          <p className="text-sm">No se encontraron instructores registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((i) => (
                      <tr key={i.id_instructor} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                              {i.nombre_completo?.substring(0, 2).toUpperCase() || "IN"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#040529] text-sm leading-tight">{i.nombre_completo}</p>
                              <p className="text-xs text-gray-500 font-medium">{i.documento || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-600">{i.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">{i.especialidad || "—"}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-gray-600">
                            {i.anios_experiencia ? `${i.anios_experiencia} años` : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn(
                            "text-xs font-bold px-3 py-1 rounded-full border shadow-sm",
                            i.estado 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {i.estado ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openModal("ver", i)} 
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" 
                              title="Ver"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openModal("editar", i)} 
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" 
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <line x1="18" y1="2" x2="22" y2="6"></line>
                                <path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openModal("eliminar", i)} 
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" 
                              title="Desactivar"
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
                    <h3 className="text-lg font-bold text-[#040529] mb-2">Desactivar Instructor</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      ¿Estás seguro de desactivar a{" "}
                      <span className="font-bold text-red-600">{selectedInstructor?.nombre_completo}</span>?
                      <br />
                      <span className="text-xs">El instructor no podrá iniciar sesión.</span>
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
                        Desactivar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row h-[550px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 20a6 6 0 0 0-12 0"></path>
                          <circle cx="12" cy="10" r="4"></circle>
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {modal === "crear" ? "Registro de Instructor" : modal === "editar" ? "Edición de Instructor" : "Detalles del Instructor"}
                      </p>
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">
                          {modal === "crear" 
                            ? "Registrar Nuevo Instructor" 
                            : modal === "editar" 
                              ? "Editar Instructor" 
                              : "Detalles del Instructor"}
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

                      {modal === "ver" && selectedInstructor && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedInstructor.nombre_completo}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedInstructor.email}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Documento</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedInstructor.documento || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedInstructor.telefono || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Especialidad</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedInstructor.especialidad || "—"}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Años de Experiencia</label>
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">
                                {selectedInstructor.anios_experiencia ? `${selectedInstructor.anios_experiencia} años` : "—"}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estado</label>
                              <p className={cn(
                                "mt-1 px-3 py-2 rounded-lg text-sm font-bold border",
                                selectedInstructor.estado 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : "bg-red-50 text-red-600 border-red-100"
                              )}>
                                {selectedInstructor.estado ? "Activo" : "Inactivo"}
                              </p>
                            </div>
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
                                {usuariosDisponibles.map(usuario => (
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

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Especialidad *</label>
                            <div className="relative mt-1">
                              <input
                                type="text"
                                name="especialidad"
                                value={formData.especialidad}
                                onChange={handleChange}
                                className={cn(
                                  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                  formErrors.especialidad && "border-red-500 bg-red-50"
                                )}
                                placeholder="Ej: Skate vertical, Freestyle"
                              />
                              {formErrors.especialidad && (
                                <p className="mt-1 text-xs text-red-500">{formErrors.especialidad}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Años de Experiencia</label>
                            <div className="relative mt-1">
                              <input
                                type="number"
                                name="anios_experiencia"
                                value={formData.anios_experiencia}
                                onChange={handleChange}
                                className={cn(
                                  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]",
                                  formErrors.anios_experiencia && "border-red-500 bg-red-50"
                                )}
                                placeholder="Ej: 5"
                                min="0"
                              />
                              {formErrors.anios_experiencia && (
                                <p className="mt-1 text-xs text-red-500">{formErrors.anios_experiencia}</p>
                              )}
                            </div>
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
                              onClick={modal === "crear" ? handleCreate : handleEdit} 
                              className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10"
                            >
                              {modal === "crear" ? "Registrar Instructor" : "Guardar Cambios"}
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

export default Instructores;
