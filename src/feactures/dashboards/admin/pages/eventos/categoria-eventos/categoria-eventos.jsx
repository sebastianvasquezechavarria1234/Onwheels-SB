// src/feactures/dashboards/admin/pages/eventos/categorias/CategoriaEventos.jsx

import React, { useEffect, useState, useMemo } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, Tag, FileText,
  ChevronLeft, ChevronRight, Hash, ArrowUpDown, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCategoriasEventos as getCategorias,
  createCategoriaEvento as createCategoria,
  updateCategoriaEvento as updateCategoria,
  deleteCategoriaEvento as deleteCategoria,
} from "../../services/EventCategory";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CategoriaEventos() {
  // Data
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Sorting
  const [sortField, setSortField] = useState("nombre_categoria");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal & selection
  const [modal, setModal] = useState(null); // crear | editar | ver | eliminar
  const [selected, setSelected] = useState(null);

  // Form
  const [form, setForm] = useState({ nombre_categoria: "", descripcion: "" });

  // Validation
  const [formErrors, setFormErrors] = useState({});

  // Notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Field validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_categoria") {
      if (!value || !value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 3) error = "Mínimo 3 caracteres";
      else if (value.trim().length > 50) error = "Máximo 50 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s.,&-]+$/.test(value.trim()))
        error = "Nombre inválido (caracteres no permitidos)";
    }

    if (name === "descripcion" && value) {
        if (value.length > 200) error = "Máximo 200 caracteres";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    const ok1 = validateField("nombre_categoria", form.nombre_categoria);
    const ok2 = validateField("descripcion", form.descripcion);
    return ok1 && ok2;
  };

  // Fetch categories
  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      showNotification("Error cargando categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Modal handlers
  const openModal = (type, categoria = null) => {
    setModal(type);
    setSelected(categoria);

    setForm(
      categoria
        ? {
          nombre_categoria: categoria.nombre_categoria || "",
          descripcion: categoria.descripcion || "",
        }
        : { nombre_categoria: "", descripcion: "" }
    );

    setFormErrors({});
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_categoria: "", descripcion: "" });
    setFormErrors({});
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // Save data
  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    const payload = {
      nombre_categoria: form.nombre_categoria.trim(),
      descripcion: form.descripcion.trim() || null,
    };

    try {
      if (modal === "crear") {
        await createCategoria(payload);
        showNotification("Categoría creada con éxito");
      } else if (modal === "editar" && selected) {
        await updateCategoria(selected.id_categoria_evento, payload);
        showNotification("Categoría actualizada");
      }

      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando:", err);
      showNotification("Error guardando la categoría", "error");
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await deleteCategoria(selected.id_categoria_evento);
      showNotification("Categoría eliminada", "success");
      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando:", err);
      showNotification("No se pudo eliminar", "error");
    }
  };

  // Filter + Sort + Pagination
  const filteredAndSorted = useMemo(() => {
    let result = [...categorias];
    
    // Filter
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(c =>
        c.nombre_categoria.toLowerCase().includes(q) ||
        (c.descripcion || "").toLowerCase().includes(q)
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
  }, [categorias, search, sortField, sortDirection]);

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
                        Gestión de Categorías
                    </h2>

                    {/* Compact Stats */}
                    <div className="flex items-center gap-2 border-l pl-4">
                        <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md ">
                            <Hash className="h-3 w-3 " />
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
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Buscar categoría..."
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
                        Crear Categoría
                    </button>
                 </div>

                 {/* Filters (Larger) */}
                 <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2">
                    {[
                        { id: "nombre_categoria", label: "Nombre" },
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
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Nombre</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Descripción</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="3" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Tag className="h-8 w-8" />
                                            <p className="text-sm">No se encontraron categorías</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((c) => (
                                    <tr key={c.id_categoria_evento} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                                                    {c.nombre_categoria?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <p className="font-bold text-[#040529] text-sm leading-tight">{c.nombre_categoria}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600 font-medium max-w-[300px] truncate" title={c.descripcion}>
                                            {c.descripcion || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openModal("ver", c)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => openModal("editar", c)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pen className="h-4 w-4" /></button>
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
                        className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === "eliminar" ? "max-w-sm w-full" : "max-w-2xl w-full"}`}
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                         {/* --- MODAL CONTENT --- */}
                         {modal === "eliminar" ? (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                                <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Categoría</h3>
                                <p className="text-sm text-gray-500 mb-6">¿Estás seguro? No podrás deshacer esta acción.</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                                    <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
                                </div>
                            </div>
                         ) : (
                            <div className="flex flex-col lg:flex-row h-[400px] lg:h-[450px]">
                                {/* Left Side (Visual) */}
                                <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                                    <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                                        <Tag size={48} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuración</p>
                                </div>

                                {/* Right Side (Form) */}
                                <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-[#040529]">
                                            {modal === "crear" ? "Nueva Categoría" : modal === "editar" ? "Editar Categoría" : "Detalles"}
                                        </h3>
                                        <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                                    </div>

                                    <form className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre</label>
                                            <div className="relative">
                                                <input 
                                                    autoFocus
                                                    name="nombre_categoria"
                                                    value={form.nombre_categoria}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    readOnly={modal === "ver"} 
                                                    disabled={modal === "ver"}
                                                    placeholder="Ej: Conferencias"
                                                    className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.nombre_categoria ? "border-red-500" : "border-gray-200"}`}
                                                />
                                            </div>
                                            {formErrors.nombre_categoria && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.nombre_categoria}</p>}
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción</label>
                                            <textarea 
                                                name="descripcion"
                                                value={form.descripcion}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                readOnly={modal === "ver"} 
                                                disabled={modal === "ver"}
                                                placeholder="Descripción de la categoría"
                                                rows={4}
                                                className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] resize-none ${formErrors.descripcion ? "border-red-500" : "border-gray-200"}`}
                                            />
                                            {formErrors.descripcion && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.descripcion}</p>}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                            <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50">{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                                            {modal !== "ver" && (
                                                <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10">
                                                    {modal === "crear" ? "Guardar" : "Actualizar"}
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
}
