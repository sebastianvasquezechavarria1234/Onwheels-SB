
// src/feactures/dashboards/admin/pages/clases/clases/Clases.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Eye, Plus, Search, Pencil, Trash2, X, User,
  ChevronLeft, ChevronRight, Hash, TrendingUp,
  SlidersHorizontal, ArrowUpDown, Download, AlertCircle,
  Image as ImageIcon, Link as LinkIcon, Upload, LayoutGrid, List
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getClases,
  createClase,
  updateClase,
  deleteClase,
  getNiveles,
  getSedes,
  getInstructores,
  uploadClaseImage
} from "../../services/clasesService";

import { configUi, cn } from "../../configuracion/configUi";

export const Clases = () => {
  // --- ESTADOS ---
  const [clases, setClases] = useState([]);
  const [uploading, setUploading] = useState(false);
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
    hora_fin: "",
    url_imagen: ""
  });

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("descripcion");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Requested: 10 items per page

  const [formErrors, setFormErrors] = useState({});
  const [formStep, setFormStep] = useState(1);

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [viewMode, setViewMode] = useState("table"); // "table" | "pipeline"

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
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
    if (!filteredAndSorted || filteredAndSorted.length === 0) return;
    const headers = ["ID", "Descripcion", "Nivel", "Sede", "Dia", "Inicio", "Fin", "Cupo", "Estado"];
    const rows = filteredAndSorted.map(c =>
      [
        c.id_clase, 
        `"${c.descripcion}"`, 
        `"${c.nombre_nivel}"`, 
        `"${c.nombre_sede}"`, 
        `"${c.dia_semana}"`, 
        c.hora_inicio, 
        c.hora_fin, 
        c.cupo_maximo, 
        c.estado
      ].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_clases_onwheels.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.descripcion?.trim()) errors.descripcion = "La descripción es obligatoria";
    if (!formData.id_nivel) errors.id_nivel = "Seleccione un nivel";
    if (!formData.id_sede) errors.id_sede = "Seleccione una sede";
    if (!formData.dia_semana) errors.dia_semana = "Seleccione el día";
    if (!formData.hora_inicio) errors.hora_inicio = "Hora inicio requerida";
    if (!formData.hora_fin) errors.hora_fin = "Hora fin requerida";
    
    if (formData.hora_inicio && formData.hora_fin) {
      if (formData.hora_inicio >= formData.hora_fin) {
        errors.hora_fin = "Debe ser posterior al inicio";
      }
    }

    const cupo = parseInt(formData.cupo_maximo);
    if (!formData.cupo_maximo || isNaN(cupo) || cupo <= 0) {
      errors.cupo_maximo = "Debe ser un número positivo";
    }

    if (formData.instructores.length === 0) {
      errors.instructores = "Asigne al menos un instructor";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.descripcion?.trim()) errors.descripcion = "La descripción es obligatoria";
      if (!formData.id_nivel) errors.id_nivel = "Seleccione un nivel";
      if (!formData.id_sede) errors.id_sede = "Seleccione una sede";
    } else if (step === 2) {
      if (!formData.dia_semana) errors.dia_semana = "Seleccione el día";
      if (!formData.hora_inicio) errors.hora_inicio = "Hora inicio requerida";
      if (!formData.hora_fin) errors.hora_fin = "Hora fin requerida";
      if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
        errors.hora_fin = "Debe ser posterior al inicio";
      }
      const cupo = parseInt(formData.cupo_maximo);
      if (!formData.cupo_maximo || isNaN(cupo) || cupo <= 0) {
        errors.cupo_maximo = "Debe ser un número positivo";
      }
      if (formData.instructores.length === 0) {
        errors.instructores = "Asigne al menos un instructor";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- CRUD OPERATIONS ---
  const handleCreate = async () => {
    try {
      if (!validateForm()) {
        showNotification("Por favor corrija los errores en el formulario", "error");
        return;
      }
      const id_nivel = parseInt(formData.id_nivel);
      const id_sede = parseInt(formData.id_sede);
      const formatTime = (time) => { if (!time) return null; return time.length === 5 ? `${time}:00` : time; };

      const payload = {
        id_nivel, id_sede,
        instructores: formData.instructores.map(i => ({ ...i, id_instructor: parseInt(i.id_instructor) })),
        cupo_maximo: formData.cupo_maximo ? parseInt(formData.cupo_maximo) : null,
        dia_semana: formData.dia_semana,
        descripcion: formData.descripcion,
        estado: formData.estado,
        hora_inicio: formatTime(formData.hora_inicio),
        hora_fin: formatTime(formData.hora_fin),
        url_imagen: formData.url_imagen
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
      if (!validateForm()) {
        showNotification("Por favor corrija los errores en el formulario", "error");
        return;
      }
      const id_nivel = parseInt(formData.id_nivel);
      const id_sede = parseInt(formData.id_sede);
      const formatTime = (time) => { if (!time) return null; return time.length === 5 ? `${time}:00` : time; };

      const payload = {
        id_nivel, id_sede,
        instructores: formData.instructores.map(i => ({ ...i, id_instructor: parseInt(i.id_instructor) })),
        cupo_maximo: formData.cupo_maximo ? parseInt(formData.cupo_maximo) : null,
        dia_semana: formData.dia_semana,
        descripcion: formData.descripcion,
        estado: formData.estado,
        hora_inicio: formatTime(formData.hora_inicio),
        hora_fin: formatTime(formData.hora_fin),
        url_imagen: formData.url_imagen
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
        hora_fin: clase.hora_fin || "",
        url_imagen: clase.url_imagen || ""
      });
    } else {
      setFormData(defaultData);
    }
    setFormErrors({});
    setFormStep(1);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedClase(null);
    setFormData({
      id_nivel: "", id_sede: "", instructores: [], instructorTemporal: "",
      cupo_maximo: "", dia_semana: "", descripcion: "", estado: "Disponible",
      hora_inicio: "", hora_fin: "", url_imagen: ""
    });
    setFormErrors({});
    setFormStep(1);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadClaseImage(file);
      setFormData(prev => ({ ...prev, url_imagen: res.url_imagen }));
      showNotification("Imagen subida con éxito");
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      showNotification("Error al subir imagen", "error");
    } finally {
      setUploading(false);
    }
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
    if (formErrors.instructores) {
      setFormErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.instructores;
        return newErrs;
      });
    }
  };

  const handleEliminarInstructor = (index) => {
    setFormData(prev => ({ ...prev, instructores: prev.instructores.filter((_, i) => i !== index) }));
  };

  const toggleDia = (dia) => {
    setFormData(prev => {
      const currentDays = prev.dia_semana ? prev.dia_semana.split(", ").filter(Boolean) : [];
      let newDays;
      if (currentDays.includes(dia)) {
        newDays = currentDays.filter(d => d !== dia);
      } else {
        const order = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        newDays = [...currentDays, dia].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
      return { ...prev, dia_semana: newDays.join(", ") };
    });
    if (formErrors.dia_semana) {
      setFormErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.dia_semana;
        return newErrs;
      });
    }
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Clases
            </h2>
            <span className={configUi.countBadge}>{filteredAndSorted.length} registros</span>
          </div>

          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar clases..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            {/* Filter Dropdown (Sorted by fields as placeholders for now, matching Admin style) */}
            <div className="relative hidden md:block">
              <select
                value={sortField}
                onChange={(e) => { setSortField(e.target.value); setCurrentPage(1); }}
                className={configUi.select}
              >
                <option value="descripcion">Nombre</option>
                <option value="nombre_nivel">Nivel</option>
                <option value="nombre_sede">Sede</option>
                <option value="cupo_maximo">Cupo</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={exportCSV}
              className={configUi.iconButton} title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  viewMode === "table" ? "bg-white text-[#16315f] shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                title="Vista de Tabla"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                  viewMode === "pipeline" ? "bg-white text-[#16315f] shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                title="Vista de Pipeline"
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => openModal("crear")}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Crear Clase
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        {viewMode === "table" ? (
          <div className={configUi.tableCard}>
            <div className={configUi.tableScroll}>
              <table className={configUi.table}>
                <thead className={configUi.thead}>
                  <tr>
                    <th className={`${configUi.th} rounded-tl-[1.4rem] w-[20%]`}>Clase</th>
                    <th className={`${configUi.th} text-center w-[15%]`}>Nivel/Sede</th>
                    <th className={`${configUi.th} w-[15%]`}>Instructores</th>
                    <th className={`${configUi.th} text-center w-[10%]`}>Cupo</th>
                    <th className={`${configUi.th} w-[15%]`}>Horario</th>
                    <th className={`${configUi.th} text-center w-[10%]`}>Estado</th>
                    <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[15%]`}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className={configUi.emptyState}>Cargando registros...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className={configUi.emptyState}>
                        <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                          <AlertCircle className="h-8 w-8 opacity-80" />
                          <p className="font-medium">{error}</p>
                          {backendError && (
                            <p className="text-xs text-red-400 bg-red-50 px-3 py-1 rounded-full italic">
                              Intenta iniciar el backend en el puerto 3000
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className={configUi.emptyState}>No se encontraron clases registradas.</td>
                    </tr>
                  ) : (
                    currentItems.map((c) => (
                      <tr key={c.id_clase} className={configUi.row}>
                        <td className={configUi.td}>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center text-[#16315f] font-bold text-xs uppercase">
                              {c.url_imagen ? (
                                <img src={c.url_imagen} alt={c.descripcion} className="h-full w-full object-cover" />
                              ) : (
                                c.descripcion?.substring(0, 2) || "CL"
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#16315f] text-sm leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{c.descripcion}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{c.dia_semana}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`${configUi.td} text-center`}>
                          <div className="flex flex-col items-center gap-0">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                              {c.nombre_nivel || c.nombre_level || "Sin Nivel"}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 font-bold">{c.nombre_sede}</span>
                          </div>
                        </td>
                        <td className={configUi.td}>
                          <div className="flex -space-x-2 overflow-hidden py-1">
                            {c.instructores?.slice(0, 3).map((inst, i) => (
                              <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[9px] text-[#16315f] font-bold shadow-sm" title={inst.nombre_instructor}>
                                {inst.nombre_instructor.charAt(0)}
                              </div>
                            ))}
                            {(c.instructores?.length || 0) > 3 && (
                              <div className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 font-bold shadow-sm">
                                +{(c.instructores?.length || 0) - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`${configUi.td} text-center`}>
                          <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100 italic">
                            {c.cupo_maximo}
                          </span>
                        </td>
                        <td className={`${configUi.td} text-xs text-slate-500 font-medium`}>
                          {c.hora_inicio && c.hora_fin ? `${c.hora_inicio.substring(0, 5)} - ${c.hora_fin.substring(0, 5)}` : "—"}
                        </td>
                        <td className={`${configUi.td} text-center`}>
                          <span className={cn(
                            configUi.pill,
                            (c.estado === "Disponible" || c.estado === "activo" || c.estado === "Activo" || c.estado === true) ? configUi.successPill :
                            c.estado === "Ocupado" ? "border-amber-200 bg-amber-50 text-amber-600" :
                            configUi.dangerPill
                          )}>
                            {typeof c.estado === "boolean" ? (c.estado ? "Activo" : "Inactivo") : c.estado}
                          </span>
                        </td>
                        <td className={`${configUi.td} text-right`}>
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal("ver", c)} className={configUi.actionButton} title="Ver"><Eye size={14} /></button>
                            <button onClick={() => openModal("editar", c)} className={configUi.actionButton} title="Editar"><Pencil size={14} /></button>
                            <button onClick={() => openModal("eliminar", c)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 0 && (
              <div className={configUi.paginationBar}>
                <p className="text-sm font-bold text-slate-500">
                  Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={configUi.paginationButton}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={configUi.paginationButton}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* --- PIPELINE VIEW (KANBAN) --- */
          <div className="flex-1 min-h-0 overflow-x-auto pb-4">
            <div className="flex h-full gap-6 min-w-max px-1">
              {["Disponible", "Ocupado", "Cancelado"].map((status) => {
                const statusItems = filteredAndSorted.filter(c => 
                  String(c.estado).toLowerCase() === status.toLowerCase() || 
                  (status === "Disponible" && c.estado === true)
                );
                
                return (
                  <div key={status} className="flex flex-col w-[350px] bg-slate-50/50 rounded-[2rem] border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          status === "Disponible" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                          status === "Ocupado" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                          "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                        )} />
                        <h3 className="text-xs font-black text-[#16315f] uppercase tracking-widest">{status}</h3>
                      </div>
                      <span className="bg-white border border-slate-200 text-[10px] font-bold text-slate-400 px-2.5 py-0.5 rounded-full shadow-sm">
                        {statusItems.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                      {statusItems.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl opacity-40">
                             <LayoutGrid size={24} className="text-slate-300 mb-2" />
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sin Clases</p>
                        </div>
                      ) : (
                        statusItems.map((c) => (
                          <motion.div
                            layoutId={c.id_clase}
                            key={c.id_clase}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[1.8rem] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group relative overflow-hidden"
                          >
                            {/* Card Background Decoration */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#16315f]/[0.02] rounded-full blur-2xl group-hover:bg-indigo-500/[0.05] transition-colors" />

                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                                  {c.nombre_nivel || "General"}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openModal("ver", c)} className="p-1.5 text-slate-400 hover:text-[#16315f] transition-colors"><Eye size={14} /></button>
                                  <button onClick={() => openModal("editar", c)} className="p-1.5 text-slate-400 hover:text-[#16315f] transition-colors"><Pencil size={14} /></button>
                                </div>
                              </div>

                              <h4 className="text-sm font-black text-[#16315f] mb-1 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.descripcion}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <LayoutGrid size={10} /> {c.nombre_sede}
                              </p>

                              <div className="h-px bg-slate-50 mb-4" />

                              <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                  {c.instructores?.slice(0, 3).map((inst, i) => (
                                    <div key={i} className="h-7 w-7 rounded-lg ring-2 ring-white bg-[#16315f] flex items-center justify-center text-[9px] text-white font-black shadow-sm" title={inst.nombre_instructor}>
                                      {inst.nombre_instructor.charAt(0)}
                                    </div>
                                  ))}
                                  {(c.instructores?.length || 0) > 3 && (
                                    <div className="h-7 w-7 rounded-lg ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 font-black">
                                      +{c.instructores.length - 3}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-[10px] font-black text-[#16315f] flex items-center justify-end gap-1.5">
                                     <List size={10} className="text-indigo-400" /> {c.cupo_maximo} <span className="text-[8px] text-slate-400 opacity-60">CUPOS</span>
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {c.hora_inicio?.substring(0, 5)} - {c.hora_fin?.substring(0, 5)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notificación Mejorada */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
               "fixed bottom-8 right-8 z-[1000] px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border text-white font-black text-xs uppercase tracking-widest",
               notification.type === "success" ? "bg-[#16315f] border-indigo-400 shadow-indigo-200" : "bg-rose-500 border-rose-400 shadow-rose-200"
            )}
          >
            {notification.type === "success" ? <TrendingUp size={22} className="animate-pulse" /> : <AlertCircle size={22} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`${configUi.modalPanel} ${modal === "eliminar" ? "max-w-sm" : "max-w-4xl"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === "crear" ? "Nueva Clase" : modal === "editar" ? "Editar Clase" : modal === "ver" ? "Detalles de la Clase" : "Eliminar Clase"}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {modal === "crear" || modal === "editar" ? "Gestiona los detalles, horarios e instructores de la clase." : modal === "ver" ? "Información detallada de la clase seleccionada." : "Esta acción no se puede deshacer."}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                  {modal === "eliminar" ? (
                    <div className="py-8 text-center px-6">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-500 shadow-inner border border-rose-100">
                        <Trash2 size={32} strokeWidth={1.5} />
                      </div>
                      <h4 className="text-lg font-black text-[#16315f] uppercase tracking-tight mb-2">Confirmar Eliminación</h4>
                      <p className="text-xs leading-relaxed text-slate-400 font-bold uppercase tracking-widest opacity-80">
                        ¿Estás seguro de eliminar <span className="text-rose-600 underline decoration-rose-200 decoration-2 underline-offset-4">{selectedClase?.descripcion}</span>? Esta acción es irreversible.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-8">
                        {/* --- PIPELINE STEPPER --- */}
                        <div className="flex items-center justify-between px-10 py-6 mb-4 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
                          <div className="flex items-center gap-4 relative">
                             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500", formStep >= 1 ? "bg-[#16315f] text-white shadow-lg shadow-[#16315f]/20" : "bg-slate-100 text-slate-400")}>
                               <Hash size={18} />
                             </div>
                             <div className="flex flex-col">
                               <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none", formStep >= 1 ? "text-[#16315f]" : "text-slate-400")}>Fase 01</span>
                               <span className={cn("text-xs font-black uppercase tracking-tight", formStep >= 1 ? "text-[#16315f]" : "text-slate-400 opacity-60")}>Identidad & Sede</span>
                             </div>
                             {/* Connector */}
                             <div className="hidden md:block absolute left-full ml-4 w-12 h-px bg-slate-200"></div>
                          </div>

                          <div className="flex items-center gap-4 relative">
                             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500", formStep >= 2 ? "bg-[#16315f] text-white shadow-lg shadow-[#16315f]/20" : "bg-slate-100 text-slate-400")}>
                               <TrendingUp size={18} />
                             </div>
                             <div className="flex flex-col">
                               <span className={cn("text-[9px] font-black uppercase tracking-widest leading-none", formStep >= 2 ? "text-[#16315f]" : "text-slate-400")}>Fase 02</span>
                               <span className={cn("text-xs font-black uppercase tracking-tight", formStep >= 2 ? "text-[#16315f]" : "text-slate-400 opacity-60")}>Horario & Staff</span>
                             </div>
                          </div>

                          <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Validación de Pipeline Activa</span>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-10 min-h-[400px]">
                        {formStep === 1 ? (
                          <>
                            {/* Step 1 Left: Image Preview */}
                            <div className="w-full lg:w-1/3 space-y-6">
                              <div className="w-full aspect-square bg-[#fbfdff] rounded-[3rem] border-4 border-dashed border-[#d7e5f8] flex items-center justify-center overflow-hidden shadow-inner group relative">
                                {formData.url_imagen ? (
                                  <img src={formData.url_imagen} alt="Preview" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                                ) : (
                                  <div className="flex flex-col items-center gap-4 text-[#bfd1f4]">
                                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                       <ImageIcon size={40} strokeWidth={1} />
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] font-black">Identidad Ausente</span>
                                  </div>
                                )}
                                {uploading && (
                                  <div className="absolute inset-0 bg-[#16315f]/80 backdrop-blur-md flex flex-col items-center justify-center text-white gap-3 transition-opacity">
                                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</span>
                                  </div>
                                )}
                              </div>

                              {modal !== "ver" && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between mb-2">
                                     <label className={configUi.fieldLabel}>Branding de la Clase</label>
                                     <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Opcional</span>
                                  </div>
                                  <div className="flex flex-col gap-3">
                                    <div className="relative group">
                                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                      <input
                                        type="text"
                                        name="url_imagen"
                                        value={formData.url_imagen}
                                        onChange={handleChange}
                                        className={cn(configUi.fieldInput, "pl-12 !h-12 !rounded-2xl")}
                                        placeholder="URL de imagen externa..."
                                      />
                                    </div>
                                    <label className="cursor-pointer group flex items-center justify-center gap-3 bg-white hover:bg-[#16315f] hover:text-white text-[#16315f] py-4 rounded-[1.6rem] transition-all duration-300 shadow-sm border border-[#d7e5f8] hover:border-[#16315f] active:scale-95">
                                      <Upload size={18} className="group-hover:rotate-12 transition-transform" />
                                      <span className="font-black text-[10px] uppercase tracking-widest">Cargar desde mi Equipo</span>
                                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Step 1 Right: Basic Info */}
                            <div className="flex-1 flex flex-col gap-8">
                               <div className="grid grid-cols-1 gap-8">
                                  <div className={configUi.fieldGroup}>
                                    <label className={configUi.fieldLabel}>Definición de Clase *</label>
                                    {modal === "ver" ? (
                                      <div className={cn(configUi.readOnlyField, "text-lg font-black text-[#16315f] !bg-transparent !p-0 uppercase tracking-tight")}>{formData.descripcion}</div>
                                    ) : (
                                      <div className="relative">
                                         <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                         <input
                                            type="text"
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleChange}
                                            className={cn(configUi.fieldInput, "pl-12 !h-14 font-bold text-[#16315f] placeholder:text-slate-300", formErrors.descripcion && "border-rose-300 bg-rose-50/20 shadow-sm shadow-rose-100")}
                                            placeholder="Ej: Entrenamiento de Alto Rendimiento..."
                                          />
                                      </div>
                                    )}
                                    {formErrors.descripcion && (
                                      <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1.5 animate-in slide-in-from-left-2">
                                        <AlertCircle size={12} strokeWidth={3} /> {formErrors.descripcion}
                                      </p>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className={configUi.fieldGroup}>
                                      <label className={configUi.fieldLabel}>Nivel de Competencia</label>
                                      {modal === "ver" ? (
                                        <div className="mt-2">
                                           <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                              {niveles.find(n => n.id_nivel == formData.id_nivel)?.nombre_nivel || "Nivel no asignado"}
                                           </span>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                          <select name="id_nivel" value={formData.id_nivel} onChange={handleChange} className={cn(configUi.fieldSelect, "pl-12 !h-14 !rounded-2xl appearance-none", formErrors.id_nivel && "border-rose-300 bg-rose-50/20")}>
                                            <option value="">Seleccionar Nivel</option>
                                            {niveles.map(n => <option key={n.id_nivel} value={n.id_nivel}>{n.nombre_nivel}</option>)}
                                          </select>
                                          <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
                                        </div>
                                      )}
                                      {formErrors.id_nivel && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1.5 animate-in slide-in-from-left-2">
                                          <AlertCircle size={12} strokeWidth={3} /> {formErrors.id_nivel}
                                        </p>
                                      )}
                                    </div>
                                    <div className={configUi.fieldGroup}>
                                      <label className={configUi.fieldLabel}>Sede Logística</label>
                                      {modal === "ver" ? (
                                        <div className="mt-2">
                                           <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                              {sedes.find(s => s.id_sede == formData.id_sede)?.nombre_sede || "—"}
                                           </span>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                          <select name="id_sede" value={formData.id_sede} onChange={handleChange} className={cn(configUi.fieldSelect, "pl-12 !h-14 !rounded-2xl appearance-none", formErrors.id_sede && "border-rose-300 bg-rose-50/20")}>
                                            <option value="">Seleccionar Sede</option>
                                            {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</option>)}
                                          </select>
                                          <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
                                        </div>
                                      )}
                                      {formErrors.id_sede && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1.5 animate-in slide-in-from-left-2">
                                          <AlertCircle size={12} strokeWidth={3} /> {formErrors.id_sede}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                               </div>
                              
                              <div className="mt-auto p-8 bg-[#16315f] rounded-[2.5rem] text-white shadow-xl shadow-[#16315f]/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                                   <ImageIcon size={120} />
                                </div>
                                <div className="relative z-10">
                                  <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <div className="h-1 w-8 bg-indigo-400 rounded-full"></div> Auditoría de Datos
                                  </p>
                                  <p className="text-sm text-indigo-100/80 leading-relaxed font-bold italic tracking-tight">
                                    "Asegúrate de que la identidad visual refleje el nivel y profesionalismo de la clase antes de proceder a la planificación de horarios."
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Step 2 Left: Staff Pool */}
                            <div className="w-full lg:w-1/3 space-y-6">
                              <div className="p-10 bg-[#fbfdff] rounded-[3rem] border border-[#d7e5f8] shadow-inner relative overflow-hidden group">
                                <p className="text-[10px] text-[#6b84aa] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                  <User size={16} className="text-indigo-400" /> Especialistas Asignados
                                </p>
                                
                                <div className="space-y-4">
                                  {formData.instructores.length === 0 ? (
                                    <div className="py-12 text-center border-4 border-dashed border-[#d7e5f8] rounded-[2rem] bg-white group-hover:bg-slate-50 transition-colors">
                                      <div className="w-12 h-12 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-slate-200 mb-4">
                                         <Plus size={24} />
                                      </div>
                                      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest px-4">Vacante de Instrucción</p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3">
                                      {formData.instructores.map((inst, idx) => {
                                        const fullInstructor = instructores.find(i => i.id_instructor == inst.id_instructor);
                                        return (
                                          <div key={idx} className="group/item flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-indigo-50 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 animate-in fade-in slide-in-from-right-4">
                                            <div className="flex items-center gap-4">
                                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-[#16315f] flex items-center justify-center text-xs font-black text-white shadow-inner">
                                                {fullInstructor?.nombre_completo?.charAt(0) || "I"}
                                              </div>
                                              <div className="flex flex-col">
                                                 <span className="text-xs font-black text-[#16315f] uppercase tracking-tight leading-none mb-1">
                                                   {fullInstructor?.nombre_completo || "Instructor"}
                                                 </span>
                                                 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{inst.rol_instructor || "Principal"}</span>
                                              </div>
                                            </div>
                                            {modal !== "ver" && (
                                              <button type="button" onClick={() => handleEliminarInstructor(idx)} className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover/item:opacity-100 scale-90 group-hover/item:scale-100">
                                                <X size={16} strokeWidth={3} />
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {formErrors.instructores && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-2 ml-1 flex items-center gap-1.5 animate-pulse">
                                      <AlertCircle size={10} strokeWidth={3} /> {formErrors.instructores}
                                    </p>
                                  )}

                                  {modal !== "ver" && (
                                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                                      <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                        <select
                                          name="instructorTemporal"
                                          value={formData.instructorTemporal}
                                          onChange={handleChange}
                                          className={cn(configUi.fieldSelect, "!h-12 !pl-11 !pr-10 !bg-white border-[#d7e5f8] shadow-sm font-bold text-[#16315f] text-xs uppercase appearance-none")}
                                        >
                                          <option value="">Añadir Especialista...</option>
                                          {instructores.filter(i => !formData.instructores.find(fi => fi.id_instructor == i.id_instructor)).map(i => (
                                            <option key={i.id_instructor} value={i.id_instructor}>{i.nombre_completo}</option>
                                          ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={handleAgregarInstructor}
                                        disabled={!formData.instructorTemporal}
                                        className="w-full h-12 bg-[#16315f] text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#16315f]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all duration-300"
                                      >
                                        <PlusCircle size={18} /> Vincular Staff
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Step 2 Right: Schedule & More */}
                            <div className="flex-1 space-y-8">
                               <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Planificación Semanal de Entrenamiento</label>
                                  {modal === "ver" ? (
                                    <div className="flex flex-wrap gap-3 mt-2">
                                      {formData.dia_semana ? (
                                        formData.dia_semana.split(", ").map(day => (
                                          <span key={day} className="px-5 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] border border-indigo-100 shadow-sm">
                                            {day}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-slate-400 italic text-xs font-bold uppercase tracking-widest opacity-40">Horario No Definido</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 py-2">
                                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => {
                                        const isSelected = formData.dia_semana?.split(", ").includes(d);
                                        return (
                                          <button
                                            type="button"
                                            key={d}
                                            onClick={() => toggleDia(d)}
                                            className={cn(
                                              "h-14 px-1 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border relative flex flex-col items-center justify-center gap-1",
                                              isSelected
                                                ? "bg-[#16315f] text-white border-[#16315f] shadow-lg shadow-[#16315f]/20 scale-105 z-10"
                                                : "bg-white text-slate-400 border-[#d7e5f8] hover:border-indigo-300 hover:text-[#16315f] hover:bg-indigo-50/10"
                                            )}
                                          >
                                            <span className="leading-none">{d.substring(0, 3)}</span>
                                            {isSelected && <div className="w-1 h-1 rounded-full bg-indigo-300 animate-pulse mt-1" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {formErrors.dia_semana && <p className="text-[10px] text-rose-500 font-black mt-3 ml-1 flex items-center gap-2 animate-bounce"><AlertCircle size={12} strokeWidth={3} /> {formErrors.dia_semana}</p>}
                               </div>

                               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
                                  <div className={configUi.fieldGroup}>
                                    <label className={configUi.fieldLabel}>Bloque Inicio</label>
                                    {modal === "ver" ? (
                                      <div className={cn(configUi.readOnlyField, "font-black text-[#16315f] !bg-slate-50")}>{formData.hora_inicio || "—"}</div>
                                    ) : (
                                      <div className="relative">
                                         <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                         <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} className={cn(configUi.fieldInput, "pl-12 !h-14 !rounded-2xl", formErrors.hora_inicio && "border-rose-300 bg-rose-50/20")} />
                                      </div>
                                    )}
                                  </div>
                                  <div className={configUi.fieldGroup}>
                                    <label className={configUi.fieldLabel}>Bloque Cierre</label>
                                    {modal === "ver" ? (
                                      <div className={cn(configUi.readOnlyField, "font-black text-[#16315f] !bg-slate-50")}>{formData.hora_fin || "—"}</div>
                                    ) : (
                                      <div className="relative">
                                         <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                         <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} className={cn(configUi.fieldInput, "pl-12 !h-14 !rounded-2xl", formErrors.hora_fin && "border-rose-300 bg-rose-50/20")} />
                                      </div>
                                    )}
                                  </div>
                                  <div className={configUi.fieldGroup}>
                                    <label className={configUi.fieldLabel}>Cupos Reales</label>
                                    {modal === "ver" ? (
                                      <div className={cn(configUi.readOnlyField, "font-black text-[#16315f] !bg-slate-50")}>{formData.cupo_maximo} Alumnos</div>
                                    ) : (
                                      <div className="relative">
                                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                         <input
                                            type="number"
                                            name="cupo_maximo"
                                            value={formData.cupo_maximo}
                                            onChange={handleChange}
                                            className={cn(configUi.fieldInput, "pl-12 !h-14 !rounded-2xl", formErrors.cupo_maximo && "border-rose-300 bg-rose-50/20")}
                                            placeholder="Max..."
                                          />
                                      </div>
                                    )}
                                  </div>
                               </div>

                               <div className={configUi.fieldGroup + " pt-4"}>
                                 <label className={configUi.fieldLabel}>Disponibilidad de Operación</label>
                                 {modal === "ver" ? (
                                   <div className="mt-2">
                                     <span className={cn(
                                        "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                        formData.estado === "Disponible" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                     )}>
                                       {formData.estado}
                                     </span>
                                   </div>
                                 ) : (
                                   <div className="flex bg-[#fbfdff] p-2 rounded-[1.8rem] w-full sm:w-max gap-2 border border-[#d7e5f8] shadow-inner">
                                     {["Disponible", "Ocupado", "Cancelado"].map(st => (
                                       <button
                                         type="button"
                                         key={st}
                                         onClick={() => setFormData(p => ({ ...p, estado: st }))}
                                         className={cn(
                                           "px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.2rem] transition duration-500",
                                           formData.estado === st 
                                             ? "bg-[#16315f] text-white shadow-lg shadow-[#16315f]/20 scale-[1.05]" 
                                             : "text-slate-400 hover:bg-slate-100"
                                         )}
                                       >
                                         {st}
                                       </button>
                                     ))}
                                   </div>
                                 )}
                               </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                  <div className={configUi.modalFooter}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className={cn("h-1.5 w-6 rounded-full transition-all duration-300", formStep === 1 ? "bg-[#16315f]" : "bg-slate-200")} />
                        <div className={cn("h-1.5 w-6 rounded-full transition-all duration-300", formStep === 2 ? "bg-[#16315f]" : "bg-slate-200")} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-4">
                        Paso {formStep} de 2
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {formStep === 2 && modal !== "eliminar" && (
                        <button
                          onClick={() => setFormStep(1)}
                          className={cn(configUi.secondaryButton, "px-6 h-12")}
                        >
                          Atrás
                        </button>
                      )}
                      
                      <button onClick={closeModal} className={configUi.secondaryButton}>
                        {modal === "ver" ? "Cerrar" : "Cancelar"}
                      </button>

                      {modal !== "ver" && modal !== "eliminar" && (
                        formStep === 1 ? (
                          <button
                            onClick={() => {
                              if (validateStep(1)) setFormStep(2);
                              else showNotification("Completa los campos obligatorios", "error");
                            }}
                            className={cn(configUi.primaryButton, "px-8 h-12")}
                          >
                            Siguiente
                          </button>
                        ) : (
                          <>
                            {modal === "crear" && (
                              <button onClick={handleCreate} className={cn(configUi.primaryButton, "px-8 h-12")}>Finalizar Registro</button>
                            )}
                            {modal === "editar" && (
                              <button onClick={handleEdit} className={cn(configUi.primaryButton, "px-8 h-12")}>Actualizar Clase</button>
                            )}
                          </>
                        )
                      )}

                      {modal === "eliminar" && (
                        <button onClick={handleDelete} className={configUi.dangerButton}>Confirmar Eliminación</button>
                      )}
                    </div>
                  </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Clases;
