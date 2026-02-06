// src/feactures/dashboards/admin/pages/clases/clases/Clases.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Eye, Plus, Search, Pencil, Trash2, X, User,
  ChevronLeft, ChevronRight, Hash, TrendingUp,
  SlidersHorizontal, ArrowUpDown, Download, AlertCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getClases,
  createClase,
  updateClase,
  deleteClase,
  getNiveles,
  getSedes,
  getInstructores
} from "../../services/clasesService";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Clases = () => {
  // --- ESTADOS ---
  const [clases, setClases] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [instructores, setInstructores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(false); // Nuevo estado para identificar error de conexión

  const [modal, setModal] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);

  const [formData, setFormData] = useState({
    id_nivel: "",
    id_sede: "",
    instructores: [],
    instructorTemporal: "",
    cupo_maximo: "",
    dia_semana: "",
    descripcion: "",
    estado: "Disponible",
    hora_inicio: "",
    hora_fin: ""
  });

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("descripcion");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Requested: 10 items per page

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // --- CARGAR DATOS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendError(false);

      const [clasesData, nivelesData, sedesData, instructoresData] = await Promise.all([
        getClases(),
        getNiveles(),
        getSedes(),
        getInstructores()
      ]);

      setClases(Array.isArray(clasesData) ? clasesData : []);
      setNiveles(Array.isArray(nivelesData) ? nivelesData : []);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
      setInstructores(Array.isArray(instructoresData) ? instructoresData : []);

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
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...clases];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        (c.descripcion || "").toLowerCase().includes(q) ||
        (c.nombre_nivel || "").toLowerCase().includes(q) ||
        (c.nombre_sede || "").toLowerCase().includes(q) ||
        (c.instructores || []).some(i => i.nombre_instructor?.toLowerCase().includes(q))
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
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return result;
  }, [clases, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const currentItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Descripción", "Nivel", "Sede", "Día", "Inicio", "Fin", "Cupo", "Estado"];
    const rows = filteredAndSorted.map(c =>
      [c.id_clase, c.descripcion, c.nombre_nivel, c.nombre_sede, c.dia_semana, c.hora_inicio, c.hora_fin, c.cupo_maximo, c.estado].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clases.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- CRUD OPERATIONS ---
  const handleCreate = async () => {
    try {
      if (!formData.id_nivel || !formData.id_sede || formData.instructores.length === 0) {
        showNotification("Nivel, sede e instructores son obligatorios", "error");
        return;
      }
      const id_nivel = parseInt(formData.id_nivel);
      const id_sede = parseInt(formData.id_sede);
      if (isNaN(id_nivel) || isNaN(id_sede)) {
        showNotification("Nivel y sede deben ser números válidos", "error");
        return;
      }
      const formatTime = (time) => { if (!time) return null; return time.length === 5 ? `${time}:00` : time; };

      const payload = {
        id_nivel, id_sede,
        instructores: formData.instructores.map(i => ({ ...i, id_instructor: parseInt(i.id_instructor) })),
        cupo_maximo: formData.cupo_maximo ? parseInt(formData.cupo_maximo) : null,
        dia_semana: formData.dia_semana,
        descripcion: formData.descripcion,
        estado: formData.estado,
        hora_inicio: formatTime(formData.hora_inicio),
        hora_fin: formatTime(formData.hora_fin)
      };
      await createClase(payload);
      await fetchData();
      closeModal();
      showNotification("Clase creada con éxito");
    } catch (err) {
      console.error("Error creando clase:", err);
      const msg = err.response?.data?.mensaje || "Error creando clase (Verifica Backend)";
      showNotification(msg, "error");
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedClase) return;
      const id_nivel = parseInt(formData.id_nivel);
      const id_sede = parseInt(formData.id_sede);
      if (isNaN(id_nivel) || isNaN(id_sede)) {
        showNotification("Nivel y sede deben ser números válidos", "error");
        return;
      }
      const formatTime = (time) => { if (!time) return null; return time.length === 5 ? `${time}:00` : time; };

      const payload = {
        id_nivel, id_sede,
        instructores: formData.instructores.map(i => ({ ...i, id_instructor: parseInt(i.id_instructor) })),
        cupo_maximo: formData.cupo_maximo ? parseInt(formData.cupo_maximo) : null,
        dia_semana: formData.dia_semana,
        descripcion: formData.descripcion,
        estado: formData.estado,
        hora_inicio: formatTime(formData.hora_inicio),
        hora_fin: formatTime(formData.hora_fin)
      };
      await updateClase(selectedClase.id_clase, payload);
      await fetchData();
      closeModal();
      showNotification("Clase actualizada con éxito");
    } catch (err) {
      console.error("Error editando clase:", err);
      const msg = err.response?.data?.mensaje || "Error editando clase";
      showNotification(msg, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedClase) return;
      await deleteClase(selectedClase.id_clase);
      await fetchData();
      closeModal();
      showNotification("Clase eliminada con éxito");
    } catch (err) {
      console.error("Error eliminando clase:", err);
      const msg = err.response?.data?.mensaje || "Error eliminando clase";
      showNotification(msg, "error");
    }
  };

  // --- MODAL HANDLERS ---
  const openModal = (type, clase = null) => {
    setModal(type);
    setSelectedClase(clase);
    const defaultData = {
      id_nivel: "", id_sede: "", instructores: [], instructorTemporal: "",
      cupo_maximo: "", dia_semana: "", descripcion: "", estado: "Disponible",
      hora_inicio: "", hora_fin: ""
    };
    if (clase && (type === "editar" || type === "ver")) {
      setFormData({
        id_nivel: clase.id_nivel.toString(),
        id_sede: clase.id_sede.toString(),
        instructores: clase.instructores || [],
        instructorTemporal: "",
        cupo_maximo: clase.cupo_maximo?.toString() || "",
        dia_semana: clase.dia_semana || "",
        descripcion: clase.descripcion || "",
        estado: clase.estado || "Disponible",
        hora_inicio: clase.hora_inicio || "",
        hora_fin: clase.hora_fin || ""
      });
    } else {
      setFormData(defaultData);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedClase(null);
    setFormData({
      id_nivel: "", id_sede: "", instructores: [], instructorTemporal: "",
      cupo_maximo: "", dia_semana: "", descripcion: "", estado: "Disponible",
      hora_inicio: "", hora_fin: ""
    });
  };

  const handleAgregarInstructor = () => {
    const idInstructor = formData.instructorTemporal;
    if (!idInstructor) return;
    if (formData.instructores.find(i => i.id_instructor == idInstructor)) return;
    const instructor = instructores.find(i => i.id_instructor == idInstructor);
    if (!instructor) return;
    setFormData(prev => ({
      ...prev,
      instructores: [...prev.instructores, { id_instructor: parseInt(idInstructor), rol_instructor: "Principal" }],
      instructorTemporal: ""
    }));
  };

  const handleEliminarInstructor = (index) => {
    setFormData(prev => ({ ...prev, instructores: prev.instructores.filter((_, i) => i !== index) }));
  };

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">

        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">

          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between bg-[#040529] rounded-xl px-4 py-2 shadow-md">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-bold text-[#F0E6E6] whitespace-nowrap uppercase tracking-wider">
                Gestión de Clases
              </h1>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l border-[#F0E6E6]/10 pl-4">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F0E6E6]/10">
                  <Hash className="h-3 w-3 text-[#F0E6E6]/70" />
                  <span className="text-xs font-bold text-[#F0E6E6]">{filteredAndSorted.length}</span>
                </div>
              </div>
            </div>


          </div>

          {/* Row 2: Active Toolbar (Big Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">

            {/* Search & Create Group */}
            <div className="flex flex-1 w-full sm:w-auto gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar clase..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => openModal("crear")}
                className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Crear Clase
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportCSV}
                  className="p-1.5 rounded-lg transition hover:bg-gray-100"
                  title="Exportar CSV"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filters (Larger) */}
            <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "descripcion", label: "Nombre" },
                { id: "nombre_nivel", label: "Nivel" },
                { id: "nombre_sede", label: "Sede" },
                { id: "cupo_maximo", label: "Cupo" },
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
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Clase</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Nivel/Sede</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Instructores</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Cupo</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Horario</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
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
                          <p className="text-sm">No se encontraron clases registradas</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((c) => (
                      <tr key={c.id_clase} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                              {c.descripcion?.substring(0, 2).toUpperCase() || "CL"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#040529] text-sm leading-tight mb-0.5">{c.descripcion}</p>
                              <p className="text-xs text-gray-500 font-medium">{c.dia_semana}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-semibold text-gray-700">{c.nombre_nivel}</span>
                            <span className="text-xs text-gray-500">{c.nombre_sede}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex -space-x-2 overflow-hidden py-1">
                            {c.instructores?.slice(0, 3).map((inst, i) => (
                              <div key={i} className="h-7 w-7 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[10px] text-blue-900 font-bold shadow-sm" title={inst.nombre_instructor}>
                                {inst.nombre_instructor.charAt(0)}
                              </div>
                            ))}
                            {(c.instructores?.length || 0) > 3 && (
                              <div className="h-7 w-7 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-bold shadow-sm">
                                +{(c.instructores?.length || 0) - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">
                            {c.cupo_maximo}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 font-medium">
                          {c.hora_inicio && c.hora_fin ? `${c.hora_inicio.substring(0, 5)} - ${c.hora_fin.substring(0, 5)}` : "—"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold border shadow-sm",
                            c.estado === "Disponible" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              c.estado === "Ocupado" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal("ver", c)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => openModal("editar", c)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => openModal("eliminar", c)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
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
                  Mostrando <span className="font-bold text-[#040529]">{Math.min(currentItems.length, itemsPerPage)}</span> de <span className="font-bold text-[#040529]">{filteredAndSorted.length}</span> resultados
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

        {/* --- NOTIFICATIONS & MODALS (UNCHANGED) --- */}
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
                className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === "eliminar" ? "max-w-sm w-full" : "max-w-4xl w-full"}`}
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* --- MODAL CONTENT PRESERVED --- */}
                {modal === "eliminar" ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                    <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Clase</h3>
                    <p className="text-sm text-gray-500 mb-6">¿Estás seguro? No podrás deshacer esta acción.</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row h-[500px] lg:h-[600px]">
                    {/* Left Side (Visual) */}
                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                      <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                        <User size={48} strokeWidth={1.5} />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuración de Clase</p>
                    </div>

                    {/* Right Side (Form) */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[#040529]">
                          {modal === "crear" ? "Nueva Clase" : modal === "editar" ? "Editar Clase" : "Detalles"}
                        </h3>
                        <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                      </div>

                      <form className="space-y-5">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción / Nombre</label>
                          <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} readOnly={modal === "ver"} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529]" placeholder="Ej: Yoga Matutino" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nivel</label>
                            <select name="id_nivel" value={formData.id_nivel} onChange={handleChange} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#040529]/20">
                              <option value="">Seleccionar</option>
                              {niveles.map(n => <option key={n.id_nivel} value={n.id_nivel}>{n.nombre_nivel}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sede</label>
                            <select name="id_sede" value={formData.id_sede} onChange={handleChange} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#040529]/20">
                              <option value="">Seleccionar</option>
                              {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Instructores</label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {formData.instructores.map((inst, idx) => (
                                <span key={idx} className="bg-white border border-gray-200 text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                  {instructores.find(i => i.id_instructor == inst.id_instructor)?.nombre_completo}
                                  {modal !== "ver" && <button type="button" onClick={() => handleEliminarInstructor(idx)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>}
                                </span>
                              ))}
                            </div>
                            {modal !== "ver" && (
                              <div className="flex gap-2">
                                <select name="instructorTemporal" value={formData.instructorTemporal} onChange={handleChange} className="flex-1 text-sm bg-white border border-gray-300 rounded-md px-2 py-1 outline-none">
                                  <option value="">+ Agregar Instructor</option>
                                  {instructores.filter(i => !formData.instructores.find(fi => fi.id_instructor == i.id_instructor)).map(i => <option key={i.id_instructor} value={i.id_instructor}>{i.nombre_completo}</option>)}
                                </select>
                                <button type="button" onClick={handleAgregarInstructor} className="px-3 py-1 bg-[#040529] text-white text-xs font-bold rounded-md">Add</button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Día</label>
                            <select name="dia_semana" value={formData.dia_semana} onChange={handleChange} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                              <option value="">Seleccionar</option>
                              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cupo</label>
                            <input type="number" name="cupo_maximo" value={formData.cupo_maximo} onChange={handleChange} readOnly={modal === "ver"} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" placeholder="00" min="1" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Inicio</label><input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} readOnly={modal === "ver"} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                          <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Fin</label><input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} readOnly={modal === "ver"} disabled={modal === "ver"} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" /></div>
                        </div>

                        <div className="pt-2">
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Estado</label>
                          {modal === "ver" ? (
                            <span className="px-3 py-1 rounded-md text-sm font-bold bg-gray-100 text-gray-700 border border-gray-200">{formData.estado}</span>
                          ) : (
                            <div className="flex bg-gray-100 p-1 rounded-lg w-max">
                              {["Disponible", "Ocupado", "Cancelado"].map(st => (
                                <button type="button" key={st} onClick={() => setFormData(p => ({ ...p, estado: st }))} className={`px-3 py-1 text-xs font-bold rounded-md transition ${formData.estado === st ? "bg-white text-[#040529] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{st}</button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                          <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50">{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                          {modal !== "ver" && <button type="button" onClick={modal === "crear" ? handleCreate : handleEdit} className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10">Guardar Cambios</button>}
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

export default Clases;