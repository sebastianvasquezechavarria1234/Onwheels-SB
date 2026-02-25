// src/feactures/dashboards/admin/pages/eventos/patrocinadores/Patrocinadores.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, Image as ImageIcon, Mail, Phone, User,
  ChevronLeft, ChevronRight, Hash, ArrowUpDown, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPatrocinadores,
  createPatrocinador,
  updatePatrocinador,
  deletePatrocinador,
} from "../../services/patrocinadoresServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Patrocinadores() {
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Sorting
  const [sortField, setSortField] = useState("nombre_patrocinador");
  const [sortDirection, setSortDirection] = useState("asc");

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    nombre_patrocinador: "",
    email: "",
    telefono: "",
    logo: "",
    logoArchivo: null,
    imageMode: "file", // "file" | "url"
  });

  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // VALIDACIONES
  const validateField = (name, value, currentForm = form, options = {}) => {
    // options.suppressRequired: when true, do not show "campo obligatorio" errors (used on blur)
    const { suppressRequired = false } = options;
    let error = "";
    const v = (value || "").toString();

    if (name === "nombre_patrocinador") {
      const trimmed = v.trim();
      if (!trimmed) {
        if (!suppressRequired) error = "No puede estar vacío";
      } else if (trimmed.length < 3 || trimmed.length > 20) {
        error = "Debe tener entre 3 y 20 caracteres";
      } else {
        // Duplicado (case-insensitive). Excluir seleccionado cuando se edita.
        const currentId = selected?.id_patrocinador || null;
        const exists = patrocinadores.find(p => {
          if (!p.nombre_patrocinador) return false;
          if (currentId && p.id_patrocinador === currentId) return false;
          return p.nombre_patrocinador.trim().toLowerCase() === trimmed.toLowerCase();
        });
        if (exists) error = "No puede estar repetido";
      }
    }

    if (name === "email") {
      const trimmed = v.trim();
      if (!trimmed) {
        if (!suppressRequired) error = "No puede estar vacío";
      } else if (trimmed.length < 3 || trimmed.length > 35) {
        error = "Debe tener entre 3 y 35 caracteres";
      } else {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(trimmed)) error = "Debe cumplir formato válido de email";
      }
    }

    if (name === "telefono") {
      const trimmed = v.trim();
      if (trimmed.length < 1 || trimmed.length > 15) {
        error = "Longitud entre 1 y 15";
      } else {
        const re = /^\d+$/;
        if (!re.test(trimmed)) error = "Solo números"; // No permitir caracteres especiales según requerimiento
      }
    }

    if (name === "logo" && currentForm.imageMode === "url" && (v || "").trim() !== "") {
      try {
        new URL((v || "").trim());
      } catch {
        error = "Debe ser un link válido de imagen";
      }
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    // validateField default will show "required" errors (suppressRequired = false)
    const okName = validateField("nombre_patrocinador", form.nombre_patrocinador, form, { suppressRequired: false });
    const okEmail = validateField("email", form.email, form, { suppressRequired: false });
    const okPhone = validateField("telefono", form.telefono, form, { suppressRequired: false });
    const okLogo = form.imageMode === "url" ? validateField("logo", form.logo, form, { suppressRequired: false }) : true;
    return okName && okEmail && okPhone && okLogo;
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getPatrocinadores();
      setPatrocinadores(data || []);
    } catch (err) {
      console.error("Error cargando patrocinadores:", err);
      showNotification("Error cargando patrocinadores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // HANDLERS
  const openModal = (type, patrocinador = null) => {
    setModal(type);
    setSelected(patrocinador);

    const initial = patrocinador
      ? {
        nombre_patrocinador: patrocinador.nombre_patrocinador,
        email: patrocinador.email,
        telefono: patrocinador.telefono,
        logo: patrocinador.logo || "",
        logoArchivo: null,
        imageMode: "file",
      }
      : {
        nombre_patrocinador: "",
        email: "",
        telefono: "",
        logo: "",
        logoArchivo: null,
        imageMode: "file"
      };

    setForm(initial);
    setFormErrors({});
    // no forzar "required" al abrir; validación inicial no mostrará errores de requerido
    // pero sí es útil limpiar comprobaciones de formato/duplicado si hay valor: validar con suppressRequired=true
    if (initial.nombre_patrocinador) validateField("nombre_patrocinador", initial.nombre_patrocinador, initial, { suppressRequired: true });
    if (initial.email) validateField("email", initial.email, initial, { suppressRequired: true });
    if (initial.telefono) validateField("telefono", initial.telefono, initial, { suppressRequired: true });
    if (initial.imageMode === "url" && initial.logo) validateField("logo", initial.logo, initial, { suppressRequired: true });
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({
      nombre_patrocinador: "",
      email: "",
      telefono: "",
      logo: "",
      logoArchivo: null,
      imageMode: "file"
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar el error al escribir para no mostrarlo mientras el usuario tipea
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        logo: URL.createObjectURL(file), // Preview
        logoArchivo: file
      }));
      if (formErrors.logo) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.logo;
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (e) => {
    // Validar todo al perder el foco (incluyendo vacío si lo dejaron así)
    validateField(e.target.name, e.target.value, form, { suppressRequired: false });
  };

  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    const payload = {
      ...form,
      nombre_patrocinador: form.nombre_patrocinador.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
    };
    // remove preview url if file is selected (logic handled in service or backend? Service handles FormData building)

    try {
      if (modal === "crear") {
        await createPatrocinador(payload);
        showNotification("Patrocinador creado con éxito", "success");
      } else {
        await updatePatrocinador(selected.id_patrocinador, payload);
        showNotification("Patrocinador actualizado con éxito", "success");
      }

      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando patrocinador:", err);
      showNotification("No se pudo guardar el patrocinador", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePatrocinador(selected.id_patrocinador);
      showNotification("Patrocinador eliminado con éxito", "success");
      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando patrocinador:", err);
      showNotification("No se pudo eliminar", "error");
    }
  };

  // FILTROS + SORT + PAGINACIÓN
  const filteredAndSorted = useMemo(() => {
    let result = [...patrocinadores];

    // Filter
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) =>
        p.nombre_patrocinador.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.telefono.toLowerCase().includes(q)
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
  }, [patrocinadores, search, sortField, sortDirection]);

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
                Gestión de Patrocinadores
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
                  placeholder="Buscar patrocinador..."
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
                Nuevo Patrocinador
              </button>
            </div>

            {/* Filters (Larger) */}
            <div className="flex flex-1 w-full justify-start sm:justify-end items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "nombre_patrocinador", label: "Nombre" },
                { id: "email", label: "Email" }
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
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Logo</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[25%]">Nombre</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[30%]">Email</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[20%]">Teléfono</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right w-[15%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">Cargando registros...</td></tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <User className="h-8 w-8" />
                          <p className="text-sm">No se encontraron patrocinadores</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p) => (
                      <tr key={p.id_patrocinador} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="h-10 w-10 shrink-0 bg-white border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-sm">
                            {p.logo ? (
                              <img src={p.logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-[#040529] text-sm">{p.nombre_patrocinador}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{p.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{p.telefono}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal("ver", p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => openModal("editar", p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pen className="h-4 w-4" /></button>
                            <button onClick={() => openModal("eliminar", p)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
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
                className="bg-white rounded-2xl shadow-2xl relative overflow-hidden max-w-2xl w-full"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-[500px] lg:h-[550px]">

                  {/* Header Modal */}
                  <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-[#040529]">
                        {modal === "crear" ? "Registrar Patrocinador" : modal === "editar" ? "Editar Patrocinador" : "Detalles"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Complete la información del aliado</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-[#040529] transition"><X size={20} /></button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    <form className="space-y-5">
                      <div className="grid grid-cols-1 gap-5">

                        {/* Logo Preview (Centered) */}
                        <div className="flex flex-col items-center justify-center mb-2">
                          <div className="w-24 h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden mb-2 shadow-sm">
                            {form.logo ? (
                              <img src={form.logo} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                            ) : null}
                            <ImageIcon size={32} className={`text-gray-300 ${form.logo ? 'hidden' : ''}`} />
                          </div>
                          <p className="text-xs text-gray-400">Previsualización</p>
                        </div>

                        {/* Nombre */}
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Patrocinador</label>
                          <div className="relative">
                            <input
                              name="nombre_patrocinador"
                              autoFocus={modal !== "ver"}
                              value={form.nombre_patrocinador}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              readOnly={modal === "ver"} disabled={modal === "ver"}
                              placeholder="Ej: Nike"
                              className={`w-full mt-1 pl-3 pr-10 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.nombre_patrocinador ? "border-red-500" : "border-gray-200"}`}
                            />
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          </div>
                          {formErrors.nombre_patrocinador && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.nombre_patrocinador}</p>}
                        </div>

                        {/* Email & Telefono Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                            <div className="relative">
                              <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                readOnly={modal === "ver"} disabled={modal === "ver"}
                                placeholder="contacto@..."
                                className={`w-full mt-1 pl-3 pr-10 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.email ? "border-red-500" : "border-gray-200"}`}
                              />
                              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                            {formErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.email}</p>}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                            <div className="relative">
                              <input
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                readOnly={modal === "ver"} disabled={modal === "ver"}
                                placeholder="+57 300..."
                                className={`w-full mt-1 pl-3 pr-10 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.telefono ? "border-red-500" : "border-gray-200"}`}
                              />
                              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>
                            {formErrors.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.telefono}</p>}
                          </div>
                        </div>

                        {/* Logo Input (Dual Mode) */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Logo del Patrocinador</label>
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
                                URL Logo
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
                                className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#040529] file:text-white hover:file:bg-[#040529]/90 bg-gray-50 border rounded-lg ${formErrors.logo ? "border-red-500" : "border-gray-200"}`}
                              />
                            ) : (
                              <div className="relative">
                                <input
                                  name="logo"
                                  value={typeof form.logo === 'string' ? form.logo : ''}
                                  onChange={(e) => {
                                    setForm(prev => ({ ...prev, logo: e.target.value, logoArchivo: null }));
                                    if (formErrors.logo) setFormErrors(prev => ({ ...prev, logo: undefined }));
                                  }}
                                  onBlur={handleBlur}
                                  readOnly={modal === "ver"} disabled={modal === "ver"}
                                  placeholder="https://ejemplo.com/logo.png"
                                  className={`w-full pl-3 pr-10 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.logo ? "border-red-500" : "border-gray-200"}`}
                                />
                                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              </div>
                            )}
                          </div>
                          {formErrors.logo && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.logo}</p>}
                        </div>

                      </div>
                    </form>
                  </div>

                  {/* Footer Modal */}
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm">{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                    {modal !== "ver" && (
                      <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 shadow-lg shadow-blue-900/10 transition">
                        {modal === "crear" ? "Guardar" : "Actualizar"}
                      </button>
                    )}
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
                <h3 className="text-lg font-bold text-[#040529] mb-2">Eliminar Patrocinador</h3>
                <p className="text-gray-500 text-sm mb-6">
                  ¿Confirma que desea eliminar a <span className="font-bold text-[#040529]">{selected.nombre_patrocinador}</span>? <br />
                  Esta acción es irreversible.
                </p>

                <div className="flex justify-center gap-3">
                  <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
                  <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md transition">Sí, Eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
