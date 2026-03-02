// src/features/dashboards/admin/pages/eventos/Eventos.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
    Search, Plus, Pen, Trash2, Eye, X, Image as ImageIcon,
    Calendar, Clock, MapPin, Tag, User, Hash, ChevronLeft, ChevronRight,
    ArrowUpDown, CheckCircle, AlertCircle, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getEventos,
    getCategorias,
    getPatrocinadores,
    getSedes,
    createEvento,
    updateEvento,
    deleteEvento,
} from "../../services/Event.js";

// Helper para clases condicionales
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [patrocinadores, setPatrocinadores] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Sorting
    const [sortField, setSortField] = useState("nombre_evento");
    const [sortDirection, setSortDirection] = useState("asc");

    const [selected, setSelected] = useState(null);
    const [modal, setModal] = useState(null);

    const [form, setForm] = useState({
        id_categoria_evento: "",
        id_patrocinador: "",
        id_sede: "",
        nombre_evento: "",
        fecha_evento: "",
        hora_inicio: "",
        hora_aproximada_fin: "",
        descripcion: "",
        imagen: "",
        imagenArchivo: null,
        imageMode: "file", // "file" | "url"
        estado: "activo",
    });

    const [formErrors, setFormErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
    };

    // ===================== VALIDACIONES =====================
    const validateField = (name, value, currentForm) => {
        const formData = currentForm || form;
        let error = "";

        if (name === "nombre_evento") {
            if (!value || !value.trim()) error = "El nombre es obligatorio";
            else if (value.trim().length < 5) error = "Mínimo 5 caracteres";
            else if (value.trim().length > 150) error = "Máximo 150 caracteres";
            else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s.,&:-]+$/.test(value.trim())) {
                error = "Caracteres no permitidos";
            }
        }

        if (name === "id_categoria_evento") {
            if (!value) error = "Seleccione una categoría";
        }

        if (name === "id_sede") {
            if (!value) error = "Seleccione una sede";
        }

        if (name === "fecha_evento") {
            if (!value) error = "La fecha es obligatoria";
            else {
                const date = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dateTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
                const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

                if (dateTimestamp < todayTimestamp) {
                    error = "La fecha no puede ser anterior a hoy";
                }
            }
        }

        if (name === "hora_inicio") {
            if (!value) error = "La hora de inicio es obligatoria";
        }

        if (name === "hora_aproximada_fin") {
            if (!value) error = "La hora de fin es obligatoria";
            else if (formData.hora_inicio && value <= formData.hora_inicio) {
                error = "La hora de fin debe ser posterior a la de inicio";
            }
        }

        if (name === "descripcion") {
            if (!value || value.trim().length < 10) error = "Mínimo 10 caracteres";
            if (value && value.length > 500) error = "Máximo 500 caracteres";
        }

        if (name === "imagen") {
            if (value && value.trim() !== "") {
                try {
                    new URL(value.trim());
                } catch {
                    error = "URL inválida";
                }
            }
        }

        setFormErrors((prev) => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateAll = () => {
        const fields = ["nombre_evento", "id_categoria_evento", "id_sede", "fecha_evento", "hora_inicio", "hora_aproximada_fin", "descripcion", "imagen"];
        let isValid = true;

        fields.forEach(field => {
            const isFieldValid = validateField(field, form[field]);
            if (!isFieldValid) isValid = false;
        });

        return isValid;
    };

    // ===================== FETCH DATA =====================
    const fetchData = async () => {
        try {
            setLoading(true);
            const [ev, cat, pat, sed] = await Promise.all([
                getEventos(),
                getCategorias(),
                getPatrocinadores(),
                getSedes(),
            ]);
            setEventos(ev || []);
            setCategorias(cat || []);
            setPatrocinadores(pat || []);
            setSedes(sed || []);
        } catch (err) {
            console.error("Error cargando datos:", err);
            showNotification("Error cargando datos", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ===================== MODALES =====================
    const openModal = (type, evento = null) => {
        setModal(type);
        setSelected(evento);
        setForm(
            evento
                ? { ...evento, imagenArchivo: null }
                : {
                    id_categoria_evento: "",
                    id_patrocinador: "",
                    id_sede: "",
                    nombre_evento: "",
                    fecha_evento: "",
                    hora_inicio: "",
                    hora_aproximada_fin: "",
                    descripcion: "",
                    imagen: "",
                    imagenArchivo: null,
                    imageMode: "file",
                    estado: "activo",
                }
        );
        setFormErrors({});
    };

    const closeModal = () => {
        setModal(null);
        setSelected(null);
        setForm({
            id_categoria_evento: "",
            id_patrocinador: "",
            id_sede: "",
            nombre_evento: "",
            fecha_evento: "",
            hora_inicio: "",
            hora_aproximada_fin: "",
            descripcion: "",
            imagen: "",
            imagenArchivo: null,
            imageMode: "file",
            estado: "activo",
        });
        setFormErrors({});
    };

    // ===================== FORM HANDLERS =====================
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({
                ...prev,
                imagen: URL.createObjectURL(file),
                imagenArchivo: file
            }));
            // Limpiar error si existe
            if (formErrors.imagen) {
                setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.imagen;
                    return newErrors;
                });
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "id_categoria_evento" || name === "id_patrocinador" || name === "id_sede") {
            const numericValue = value === "" ? "" : Number(value);
            const nextForm = { ...form, [name]: numericValue };
            setForm(nextForm);
            setTimeout(() => validateField(name, numericValue, nextForm), 0);
        } else {
            const nextForm = { ...form, [name]: value };
            setForm(nextForm);
            //   validateField(name, value, nextForm); // Validación en tiempo real puede ser molesta si es muy estricta, pero aqui esta bien
        }
    };

    const handleBlur = (e) => {
        validateField(e.target.name, e.target.value);
    };

    const handleSubmit = async (e) => {
        // e.preventDefault(); // No usamos submit nativo, sino onClick en el boton

        if (!validateAll()) {
            showNotification("Corrige los errores del formulario", "error");
            return;
        }

        try {
            if (modal === "crear") {
                await createEvento(form);
                showNotification("Evento creado con éxito", "success");
            } else if (modal === "editar") {
                await updateEvento(selected.id_evento, form);
                showNotification("Evento actualizado con éxito", "success");
            }
            fetchData();
            closeModal();
        } catch (err) {
            console.error("Error al guardar evento:", err);
            showNotification("Error al guardar evento", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteEvento(selected.id_evento);
            showNotification("Evento eliminado con éxito", "success");
            fetchData();
            closeModal();
        } catch (err) {
            console.error("Error al eliminar:", err);
            showNotification("Error al eliminar evento", "error");
        }
    };

    // ===================== GETTERS =====================
    const getNombreCategoria = (id) => {
        if (!id) return "—";
        const cat = categorias.find((c) => c.id_categoria_evento === id);
        return cat ? cat.nombre_categoria : "—";
    };

    const getNombrePatrocinador = (id) => {
        if (!id) return "—";
        const pat = patrocinadores.find((p) => p.id_patrocinador === id);
        return pat ? pat.nombre_patrocinador : "—";
    };

    const getNombreSede = (id) => {
        if (!id) return "—";
        const sed = sedes.find((s) => s.id_sede === id);
        return sed ? sed.nombre_sede : "—";
    };

    // ===================== FILTROS + SORT + PAGINACIÓN =====================
    const filteredAndSorted = useMemo(() => {
        let result = [...eventos];

        // Filter
        if (search) {
            const q = search.toLowerCase().trim();
            result = result.filter((e) =>
                e.nombre_evento.toLowerCase().includes(q) ||
                getNombreCategoria(e.id_categoria_evento)?.toLowerCase().includes(q) ||
                getNombrePatrocinador(e.id_patrocinador)?.toLowerCase().includes(q) ||
                getNombreSede(e.id_sede)?.toLowerCase().includes(q) ||
                e.fecha_evento.toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            // Handle calculated fields if needed, or just sort by raw data
            if (sortField === "categoria") {
                aVal = getNombreCategoria(a.id_categoria_evento);
                bVal = getNombreCategoria(b.id_categoria_evento);
            } else if (sortField === "sede") {
                aVal = getNombreSede(a.id_sede);
                bVal = getNombreSede(b.id_sede);
            }

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
    }, [eventos, search, sortField, sortDirection, categorias, sedes, patrocinadores]);

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
            <div className="flex flex-col h-full bg-white overflow-hidden">

                {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
                <div className="shrink-0 flex flex-col gap-4 p-2 pb-4">

                    {/* Row 1: Minimal Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                                Gestión de Eventos
                            </h2>

                            {/* Compact Stats */}
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-slate-400 bg-slate-50">
                                    <Hash className="h-3 w-3" />
                                    <span className="text-xs font-bold">{filteredAndSorted.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Active Toolbar (Big Buttons) */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
                        {/* Search & Create Group */}
                        <div className="flex flex-1 w-full sm:w-auto gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                    placeholder="Buscar eventos..."
                                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
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
                                Nuevo Evento
                            </button>
                        </div>

                        {/* Filters (Sort) */}
                        <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { id: "nombre_evento", label: "Nombre" },
                                { id: "categoria", label: "Categoría" },
                                { id: "fecha_evento", label: "Fecha" },
                                { id: "sede", label: "Sede" }
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
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Imagen</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[20%]">Nombre</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Categoría</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Sede</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Fecha</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Estado</th>
                                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right w-[15%]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="7" className="p-8 text-center text-gray-400 text-sm">Cargando eventos...</td></tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center gap-2 opacity-50">
                                                    <Calendar className="h-8 w-8" />
                                                    <p className="text-sm">No se encontraron eventos</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((e) => (
                                            <tr key={e.id_evento} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="h-12 w-16 shrink-0 bg-white border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                                                        {e.imagen ? (
                                                            <img src={e.imagen} alt="Event" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-[#040529] text-sm">{e.nombre_evento}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {getNombreCategoria(e.id_categoria_evento)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600 flex items-center gap-1">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {getNombreSede(e.id_sede)}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{e.fecha_evento}</span>
                                                        <span className="text-xs text-gray-400">{e.hora_inicio} - {e.hora_aproximada_fin}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${e.estado === 'activo' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${e.estado === 'activo' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {e.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openModal("ver", e)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                                                        <button onClick={() => openModal("editar", e)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pen className="h-4 w-4" /></button>
                                                        <button onClick={() => openModal("eliminar", e)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
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

                {/* --- NOTIFICATIONS --- */}
                <AnimatePresence>
                    {notification.show && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}>
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- MODALS --- */}
                <AnimatePresence>
                    {(modal === "crear" || modal === "editar" || modal === "ver") && (
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
                                <div className="flex flex-col lg:flex-row h-[500px] lg:h-[600px]">

                                    {/* Left Side (Image Preview & Summary) */}
                                    <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col border-r border-gray-100 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-5 pattern-grid-lg" />

                                        {/* Image Area */}
                                        <div className="h-1/2 w-full p-6 flex flex-col items-center justify-center relative z-10 border-b border-gray-200/50">
                                            {form.imagen ? (
                                                <div className="w-full h-full rounded-xl overflow-hidden shadow-sm bg-white p-2 border border-gray-100">
                                                    <img src={form.imagen} alt="Preview" className="w-full h-full object-contain rounded-lg" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 hidden text-xs text-gray-400">Error al cargar imagen</div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white/50 text-gray-400 gap-2">
                                                    <ImageIcon size={32} />
                                                    <span className="text-xs font-medium">Sin imagen</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Summary Info */}
                                        <div className="flex-1 p-6 z-10 overflow-y-auto">
                                            <h4 className="text-[#040529] font-bold text-lg leading-tight mb-4">{form.nombre_evento || "Nuevo Evento"}</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                    <Tag size={16} className="mt-0.5 text-blue-500 shrink-0" />
                                                    <span>{getNombreCategoria(form.id_categoria_evento) || "Categoría sin definir"}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                    <MapPin size={16} className="mt-0.5 text-red-500 shrink-0" />
                                                    <span>{getNombreSede(form.id_sede) || "Sede sin definir"}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                    <User size={16} className="mt-0.5 text-purple-500 shrink-0" />
                                                    <span>{getNombrePatrocinador(form.id_patrocinador) || "Patrocinador sin definir"}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                                    <Calendar size={16} className="mt-0.5 text-green-500 shrink-0" />
                                                    <span>{form.fecha_evento || "Fecha sin definir"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side (Form) */}
                                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                                            <h3 className="text-xl font-bold text-[#040529]">
                                                {modal === "crear" ? "Registrar Evento" : modal === "editar" ? "Editar Evento" : "Detalles del Evento"}
                                            </h3>
                                            <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                                            <form className="space-y-6">

                                                {/* Group 1: Basics */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="md:col-span-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Evento *</label>
                                                        <input
                                                            autoFocus
                                                            name="nombre_evento"
                                                            value={form.nombre_evento}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            readOnly={modal === "ver"} disabled={modal === "ver"}
                                                            placeholder="Ej: Torneo de Verano 2024"
                                                            className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.nombre_evento ? "border-red-500" : "border-gray-200"}`}
                                                        />
                                                        {formErrors.nombre_evento && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.nombre_evento}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Categoría *</label>
                                                        <div className="relative mt-1">
                                                            <select
                                                                name="id_categoria_evento"
                                                                value={form.id_categoria_evento}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                disabled={modal === "ver"}
                                                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] appearance-none ${formErrors.id_categoria_evento ? "border-red-500" : "border-gray-200"}`}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                {categorias.map(c => <option key={c.id_categoria_evento} value={c.id_categoria_evento}>{c.nombre_categoria}</option>)}
                                                            </select>
                                                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                        </div>
                                                        {formErrors.id_categoria_evento && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.id_categoria_evento}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Sede *</label>
                                                        <div className="relative mt-1">
                                                            <select
                                                                name="id_sede"
                                                                value={form.id_sede}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                disabled={modal === "ver"}
                                                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] appearance-none ${formErrors.id_sede ? "border-red-500" : "border-gray-200"}`}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</option>)}
                                                            </select>
                                                            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                        </div>
                                                        {formErrors.id_sede && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.id_sede}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Patrocinador</label>
                                                        <div className="relative mt-1">
                                                            <select
                                                                name="id_patrocinador"
                                                                value={form.id_patrocinador}
                                                                onChange={handleChange}
                                                                disabled={modal === "ver"}
                                                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] appearance-none border-gray-200`}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                {patrocinadores.map(p => <option key={p.id_patrocinador} value={p.id_patrocinador}>{p.nombre_patrocinador}</option>)}
                                                            </select>
                                                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estado</label>
                                                        <div className="relative mt-1">
                                                            <select
                                                                name="estado"
                                                                value={form.estado}
                                                                onChange={handleChange}
                                                                disabled={modal === "ver"}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] appearance-none"
                                                            >
                                                                <option value="activo">Activo</option>
                                                                <option value="inactivo">Inactivo</option>
                                                            </select>
                                                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Group 2: Date & Time */}
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Clock size={14} /> Fecha y Hora</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fecha *</label>
                                                            <input
                                                                name="fecha_evento"
                                                                type="date"
                                                                value={form.fecha_evento}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                readOnly={modal === "ver"} disabled={modal === "ver"}
                                                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.fecha_evento ? "border-red-500" : "border-gray-200"}`}
                                                            />
                                                            {formErrors.fecha_evento && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.fecha_evento}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Hora Inicio *</label>
                                                            <input
                                                                name="hora_inicio"
                                                                type="time"
                                                                value={form.hora_inicio}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                readOnly={modal === "ver"} disabled={modal === "ver"}
                                                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.hora_inicio ? "border-red-500" : "border-gray-200"}`}
                                                            />
                                                            {formErrors.hora_inicio && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.hora_inicio}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Hora Fin *</label>
                                                            <input
                                                                name="hora_aproximada_fin"
                                                                type="time"
                                                                value={form.hora_aproximada_fin}
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                readOnly={modal === "ver"} disabled={modal === "ver"}
                                                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.hora_aproximada_fin ? "border-red-500" : "border-gray-200"}`}
                                                            />
                                                            {formErrors.hora_aproximada_fin && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.hora_aproximada_fin}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Group 3: Description & Image */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción</label>
                                                        <textarea
                                                            name="descripcion"
                                                            value={form.descripcion}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            readOnly={modal === "ver"} disabled={modal === "ver"}
                                                            placeholder="Detalles del evento..."
                                                            rows={3}
                                                            className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.descripcion ? "border-red-500" : "border-gray-200"}`}
                                                        />
                                                        {formErrors.descripcion && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.descripcion}</p>}
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Imagen del Evento</label>
                                                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setForm(prev => ({ ...prev, imageMode: "file" }))}
                                                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${form.imageMode === "file" ? "bg-white text-[#040529] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                                >
                                                                    Subir Archivo
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setForm(prev => ({ ...prev, imageMode: "url" }))}
                                                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${form.imageMode === "url" ? "bg-white text-[#040529] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                                                >
                                                                    URL Imagen
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="relative mt-1">
                                                            {form.imageMode === "file" ? (
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                    disabled={modal === "ver"}
                                                                    className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#040529] file:text-white hover:file:bg-[#040529]/90 bg-gray-50 border rounded-lg ${formErrors.imagen ? "border-red-500" : "border-gray-200"}`}
                                                                />
                                                            ) : (
                                                                <div className="relative">
                                                                    <input
                                                                        name="imagen"
                                                                        value={typeof form.imagen === 'string' ? form.imagen : ''}
                                                                        onChange={(e) => {
                                                                            // Cuando es modo URL, actualizamos imagen directamente y limpiamos el archivo
                                                                            setForm(prev => ({ ...prev, imagen: e.target.value, imagenArchivo: null }));
                                                                            if (formErrors.imagen) setFormErrors(prev => ({ ...prev, imagen: undefined }));
                                                                        }}
                                                                        onBlur={handleBlur}
                                                                        readOnly={modal === "ver"} disabled={modal === "ver"}
                                                                        placeholder="https://ejemplo.com/imagen.jpg"
                                                                        className={`w-full pl-3 pr-10 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.imagen ? "border-red-500" : "border-gray-200"}`}
                                                                    />
                                                                    <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {formErrors.imagen && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.imagen}</p>}
                                                    </div>
                                                </div>

                                            </form>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                                            <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm">{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                                            {modal !== "ver" && (
                                                <button type="button" onClick={handleSubmit} className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10 transition">
                                                    {modal === "crear" ? "Guardar Evento" : "Actualizar Evento"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- MODAL ELIMINAR --- */}
                <AnimatePresence>
                    {modal === "eliminar" && selected && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                        >
                            <motion.div
                                className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative text-center"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                                <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Evento</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    ¿Confirma que desea eliminar el evento <span className="font-bold text-[#040529]">{selected.nombre_evento}</span>? <br />
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