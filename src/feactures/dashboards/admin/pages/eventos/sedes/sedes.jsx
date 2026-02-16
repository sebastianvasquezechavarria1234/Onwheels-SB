// src/feactures/dashboards/admin/pages/eventos/sedes/sedes.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, MapPin, Phone, Building2, Map, ChevronLeft, ChevronRight, ArrowUpDown, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSedes,
  createSede,
  updateSede,
  deleteSede,
} from "../../services/sedesServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [sortField, setSortField] = useState("nombre_sede");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal & Form State
  const [modal, setModal] = useState(null); // 'add', 'edit', 'details', 'delete'
  const [selected, setSelected] = useState(null);
  
  const [form, setForm] = useState({
    nombre_sede: "",
    direccion: "",
    ciudad: "",
    telefono: "", 
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // ===================== FETCH DATA =====================
  const fetchSedes = async () => {
    setLoading(true);
    try {
      const data = await getSedes();
      setSedes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando sedes:", err);
      showNotification("Error al cargar sedes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  // ===================== VALIDACIONES =====================
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_sede") {
        if (!value || !value.trim()) error = "El nombre es obligatorio";
        else if (value.trim().length < 3) error = "El nombre debe tener al menos 3 caracteres";
    }

    if (name === "direccion") {
        if (!value || !value.trim()) error = "La dirección es obligatoria";
        else if (value.trim().length < 5) error = "Dirección muy corta";
        else if (value.trim().length > 100) error = "Dirección demasiado larga";
    }

    if (name === "ciudad") {
        if (!value || !value.trim()) error = "La ciudad es obligatoria";
        else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(value.trim())) error = "Ciudad inválida (solo letras)";
    }

    if (name === "telefono") {
        if (!value || !value.trim()) error = "El teléfono es obligatorio";
        else if (!/^[0-9+\s()-]{7,20}$/.test(value.trim())) error = "Teléfono inválido";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
      const fields = ["nombre_sede", "direccion", "ciudad", "telefono"];
      let isValid = true;
      fields.forEach(field => {
          if (!validateField(field, form[field])) isValid = false;
      });
      return isValid;
  };

  // ===================== MODALES =====================
  const openModal = (type, item = null) => {
    setModal(type);
    setSelected(item);
    setFormErrors({});
    
    if (type === "add") {
       setForm({ nombre_sede: "", direccion: "", ciudad: "", telefono: "" });
    } else if (item) {
       setForm({
          nombre_sede: item.nombre_sede || "",
          direccion: item.direccion || "",
          ciudad: item.ciudad || "",
          telefono: item.telefono || "",
       });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_sede: "", direccion: "", ciudad: "", telefono: "" });
    setFormErrors({});
  };

  // ===================== HANDLERS =====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // validateField(name, value); // Optional: real-time validation
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSave = async () => {
    if (!validateAll()) {
         showNotification("Por favor corrija los errores", "error");
         return;
    }

    try {
      const payload = {
        nombre_sede: form.nombre_sede.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        telefono: form.telefono.trim(),
      };

      if (modal === "add") {
        const newSede = await createSede(payload);
        setSedes((prev) => [newSede, ...prev]);
        showNotification("Sede creada con éxito", "success");
      } else if (modal === "edit" && selected) {
        await updateSede(selected.id_sede, payload);
        setSedes((prev) => prev.map((s) => (s.id_sede === selected.id_sede ? { ...s, ...payload } : s)));
        showNotification("Sede actualizada con éxito", "success");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      showNotification("Error al guardar la sede", "error");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteSede(selected.id_sede);
      setSedes((prev) => prev.filter((s) => s.id_sede !== selected.id_sede));
      showNotification("Sede eliminada con éxito", "success");
      closeModal();
    } catch (err) {
      console.error(err);
      showNotification("Error al eliminar la sede", "error");
    }
  };

 // ===================== FILTROS + SORT + PAGINACIÓN =====================
  const filteredAndSorted = useMemo(() => {
    let result = [...sedes];

    // Filter
    if (search) {
        const q = search.toLowerCase().trim();
        result = result.filter((s) =>
            s.nombre_sede?.toLowerCase().includes(q) ||
            s.ciudad?.toLowerCase().includes(q)
        );
    }

    // Sort
    result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === "string" && typeof bVal === "string") {
            return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
    });

    return result;
  }, [sedes, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const currentItems = filteredAndSorted.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
        
        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">
            {/* Row 1: Minimal Header */}
            <div className="flex items-center justify-between ">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold! whitespace-nowrap uppercase tracking-wider">
                        Gestión de Sedes
                    </h2>
                     <div className="flex items-center gap-2 border-l pl-4">
                        <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md ">
                            <Building2 className="h-3 w-3 " />
                            <span className="text-xs font-bold!">{sedes.length} Sedes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Active Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">
                 {/* Search & Create Group */}
                 <div className="flex flex-1 w-full sm:w-auto gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Buscar sedes..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
                        />
                         {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => openModal("add")} 
                        className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Sede
                    </button>
                 </div>

                 {/* Filters (Sort) */}
                 <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {[
                        { id: "nombre_sede", label: "Nombre" },
                        { id: "ciudad", label: "Ciudad" },
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
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <table className="w-full text-left relative">
                         <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[25%]">Nombre</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[30%]">Dirección</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Ciudad</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Teléfono</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right w-[15%]">Acciones</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-100">
                             {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">Cargando sedes...</td></tr>
                             ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <MapPin className="h-8 w-8" />
                                            <p className="text-sm">No se encontraron sedes</p>
                                        </div>
                                    </td>
                                </tr>
                             ) : (
                                currentItems.map((s) => (
                                    <tr key={s.id_sede} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                                        <td className="px-5 py-4 font-bold text-[#040529] text-sm">{s.nombre_sede}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600 flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{s.direccion}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {s.ciudad}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600 font-mono">{s.telefono}</td>
                                         <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openModal("details", s)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => openModal("edit", s)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pencil className="h-4 w-4" /></button>
                                                <button onClick={() => openModal("delete", s)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
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

        {/* --- TOAST --- */}
        <AnimatePresence>
            {notification.show && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}>
                    {notification.message}
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODAL ADD / EDIT (Split View) --- */}
        <AnimatePresence>
            {(modal === "add" || modal === "edit") && (
              <motion.div
                className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeModal}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl relative overflow-hidden max-w-4xl w-full"
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col lg:flex-row h-[500px]">
                        {/* Left Side (Visual) */}
                        <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 relative overflow-hidden">
                             <div className="absolute inset-0 opacity-5 pattern-grid-lg" />
                             <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <Map size={48} />
                             </div>
                             <h4 className="font-bold text-[#040529] text-lg text-center px-4">{modal === "add" ? "Nueva Ubicación" : "Editar Ubicación"}</h4>
                             <p className="text-gray-500 text-center text-xs px-8 mt-2">Gestiona las sedes disponibles para tus eventos.</p>
                        </div>

                         {/* Right Side (Form) */}
                         <div className="flex-1 flex flex-col h-full overflow-hidden">
                             <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-bold text-[#040529]">
                                    {modal === "add" ? "Registrar Sede" : "Editar Sede"}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                                <form className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Sede *</label>
                                        <input
                                            autoFocus
                                            name="nombre_sede"
                                            value={form.nombre_sede}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Ej: Skatepark La 70"
                                            className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.nombre_sede ? "border-red-500" : "border-gray-200"}`}
                                        />
                                        {formErrors.nombre_sede && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.nombre_sede}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Dirección *</label>
                                        <div className="relative mt-1">
                                            <input
                                                name="direccion"
                                                value={form.direccion}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Calle 10 #45-20"
                                                className={`w-full px-3 py-2 pl-9 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.direccion ? "border-red-500" : "border-gray-200"}`}
                                            />
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                        {formErrors.direccion && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.direccion}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ciudad *</label>
                                            <input
                                                name="ciudad"
                                                value={form.ciudad}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Medellín"
                                                className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.ciudad ? "border-red-500" : "border-gray-200"}`}
                                            />
                                            {formErrors.ciudad && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.ciudad}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono *</label>
                                            <div className="relative mt-1">
                                                <input
                                                    name="telefono"
                                                    value={form.telefono}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Ej: 3001234567"
                                                    className={`w-full px-3 py-2 pl-9 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.telefono ? "border-red-500" : "border-gray-200"}`}
                                                />
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                            {formErrors.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.telefono}</p>}
                                        </div>
                                    </div>
                                </form>
                            </div>

                             {/* Footer Actions */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm">Cancelar</button>
                                <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10 transition">
                                    {modal === "add" ? "Guardar Sede" : "Actualizar Sede"}
                                </button>
                            </div>
                         </div>
                    </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODAL DETAILS (Centered) --- */}
        <AnimatePresence>
            {modal === "details" && selected && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeModal}
              >
                 <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative text-center"
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                    
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Building2 size={32} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#040529] mb-1">{selected.nombre_sede}</h3>
                    <p className="text-sm text-gray-500 mb-6">{selected.ciudad}</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left border border-gray-100 mb-6">
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase">Dirección</span>
                                <span className="text-sm text-gray-700">{selected.direccion}</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone size={18} className="text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="block text-xs font-bold text-gray-400 uppercase">Teléfono</span>
                                <span className="text-sm text-gray-700">{selected.telefono}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={closeModal} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
                        Cerrar Detalles
                    </button>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODAL DELETE (Centered) --- */}
        <AnimatePresence>
            {modal === "delete" && selected && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeModal}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative text-center"
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                    <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Sede</h3>
                    <p className="text-gray-500 text-sm mb-6">
                      ¿Confirma que desea eliminar la sede <span className="font-bold text-[#040529]">{selected.nombre_sede}</span>? <br/>
                      Esta acción es irreversible.
                    </p>

                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md">Sí, Eliminar</button>
                    </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </>
  );
}