import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getNiveles,
  createNivel,
  updateNivel,
  deleteNivel
} from "../../services/classLevelsServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const ClassLevels = () => {
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedNivel, setSelectedNivel] = useState(null);
  const [formData, setFormData] = useState({
    nombre_nivel: "",
    descripcion: ""
  });
  const [search, setSearch] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState("nombre_nivel");
  const [sortDirection, setSortDirection] = useState("asc");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Cargar niveles
  const fetchNiveles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNiveles();
      setNiveles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando niveles:", err);
      setError("Error al cargar los niveles.");
      showNotification("Error al cargar niveles", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNiveles();
  }, [fetchNiveles]);

  // Sorted and filtered data
  const filteredAndSorted = useMemo(() => {
    let result = [...niveles];

    // Filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        (n.nombre_nivel || "").toLowerCase().includes(q) ||
        (n.descripcion || "").toLowerCase().includes(q)
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

      return 0;
    });

    return result;
  }, [niveles, search, sortField, sortDirection]);

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
      const headers = ["ID", "Nombre del Nivel", "Descripción"];
      const rows = filteredAndSorted.map(n =>
        [n.id_nivel, n.nombre_nivel, n.descripcion || ""].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `niveles_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Exportación exitosa");
    } catch (err) {
      console.error("Error exportando CSV:", err);
      showNotification("Error al exportar datos", "error");
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Crear nivel
  const handleCreate = async () => {
    try {
      if (!formData.nombre_nivel.trim()) {
        showNotification("El nombre del nivel es obligatorio", "error");
        return;
      }
      await createNivel(formData);
      await fetchNiveles();
      closeModal();
      showNotification("Nivel creado con éxito");
    } catch (err) {
      console.error("Error creando nivel:", err);
      const errorMessage = err.response?.data?.error || "Error creando nivel";
      showNotification(errorMessage, "error");
    }
  };

  // Editar nivel
  const handleEdit = async () => {
    try {
      if (!selectedNivel) return;
      if (!formData.nombre_nivel.trim()) {
        showNotification("El nombre del nivel es obligatorio", "error");
        return;
      }
      await updateNivel(selectedNivel.id_nivel, formData);
      await fetchNiveles();
      closeModal();
      showNotification("Nivel actualizado con éxito");
    } catch (err) {
      console.error("Error editando nivel:", err);
      const errorMessage = err.response?.data?.error || "Error editando nivel";
      showNotification(errorMessage, "error");
    }
  };

  // Eliminar nivel
  const handleDelete = async () => {
    try {
      if (!selectedNivel) return;
      await deleteNivel(selectedNivel.id_nivel);
      await fetchNiveles();
      closeModal();
      showNotification("Nivel eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando nivel:", err);
      const errorMessage = err.response?.data?.error || "Error eliminando nivel";
      showNotification(errorMessage, "error");
    }
  };

  // Abrir modal
  const openModal = (type, nivel = null) => {
    setModal(type);
    setSelectedNivel(nivel);
    if (nivel && type === "editar") {
      setFormData({
        nombre_nivel: nivel.nombre_nivel || "",
        descripcion: nivel.descripcion || ""
      });
    } else {
      setFormData({
        nombre_nivel: "",
        descripcion: ""
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedNivel(null);
    setFormData({
      nombre_nivel: "",
      descripcion: ""
    });
  };

  return (
    <>
      return (
      <>
        <div className="flex flex-col h-full bg-white overflow-hidden">
          {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
          <div className="shrink-0 flex flex-col gap-4 p-2 pb-4">

            {/* Row 1: Minimal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                Gestión de Niveles
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                    <Hash size={14} className="text-blue-600" />
                    <span className="text-xs font-bold">{filteredAndSorted.length}</span>
                  </div>
                </div>
                <button
                  onClick={exportCSV}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-800 hover:bg-white transition shadow-sm"
                  title="Exportar CSV"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Row 2: Active Toolbar (Big Buttons) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
              {/* Search & Create Group */}
              <div className="flex flex-1 w-full sm:w-auto gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar nivel..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
                  />
                </div>
                <button
                  onClick={() => openModal("crear")}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <Plus size={18} />
                  Crear Nivel
                </button>
              </div>

              {/* Filters (Larger) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: "nombre_nivel", label: "Nombre" },
                  { id: "descripcion", label: "Descripción" },
                ].map((field) => (
                  <button
                    key={field.id}
                    onClick={() => toggleSort(field.id)}
                    className={cn(
                      "px-4 py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl border transition flex items-center gap-1.5 shrink-0 select-none",
                      sortField === field.id
                        ? "bg-blue-800 text-white border-blue-800 shadow-md"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {field.label}
                    {sortField === field.id && <ArrowUpDown className="h-3 w-3" />}
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
                      <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Nivel</th>
                      <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Descripción</th>
                      <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="3" className="p-12 text-center">
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
                        <td colSpan="3" className="p-12 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-2 opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                              <line x1="4" y1="12" x2="20" y2="12"></line>
                              <line x1="4" y1="6" x2="20" y2="6"></line>
                              <line x1="4" y1="18" x2="20" y2="18"></line>
                            </svg>
                            <p className="text-sm">No se encontraron niveles registrados</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((n) => (
                        <tr key={n.id_nivel} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                                {n.nombre_nivel?.substring(0, 2).toUpperCase() || "NV"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[#040529] text-sm leading-tight">{n.nombre_nivel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-600">{n.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openModal("ver", n)}
                                className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                                title="Ver"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                              <button
                                onClick={() => openModal("editar", n)}
                                className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                                title="Editar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <line x1="18" y1="2" x2="22" y2="6"></line>
                                  <path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => openModal("eliminar", n)}
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
                  className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === "eliminar" ? "max-w-sm w-full" : "max-w-4xl w-full"}`}
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
                      <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Nivel</h3>
                      <p className="text-sm text-gray-500 mb-6">
                        ¿Estás seguro de eliminar el nivel{" "}
                        <span className="font-bold text-red-600">{selectedNivel?.nombre_nivel}</span>?
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
                    <div className="flex flex-col lg:flex-row h-[500px]">
                      {/* Left Side (Visual) */}
                      <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                        <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuración de Nivel</p>
                      </div>

                      {/* Right Side (Form) */}
                      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-[#040529]">
                            {modal === "crear" ? "Nuevo Nivel" : modal === "editar" ? "Editar Nivel" : "Detalles del Nivel"}
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

                        <form className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del Nivel *</label>
                            <input
                              type="text"
                              name="nombre_nivel"
                              value={formData.nombre_nivel}
                              onChange={handleChange}
                              readOnly={modal === "ver"}
                              disabled={modal === "ver"}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]"
                              placeholder="Ej: Principiante, Intermedio, Avanzado"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción</label>
                            <textarea
                              name="descripcion"
                              value={formData.descripcion}
                              onChange={handleChange}
                              rows="3"
                              readOnly={modal === "ver"}
                              disabled={modal === "ver"}
                              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] resize-none"
                              placeholder="Describe las características de este nivel educativo..."
                            />
                          </div>

                          {modal === "ver" && selectedNivel && (
                            <div className="bg-blue-50 rounded-xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-blue-800 text-xs">ID del Nivel:</span>
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{selectedNivel.id_nivel}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={closeModal}
                              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                            >
                              {modal === "ver" ? "Cerrar" : "Cancelar"}
                            </button>
                            {modal !== "ver" && (
                              <button
                                type="button"
                                onClick={modal === "crear" ? handleCreate : handleEdit}
                                className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10"
                              >
                                {modal === "crear" ? "Crear Nivel" : "Guardar Cambios"}
                              </button>
                            )}
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

      export default ClassLevels;
