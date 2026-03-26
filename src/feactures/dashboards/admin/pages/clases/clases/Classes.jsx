
// src/feactures/dashboards/admin/pages/clases/clases/Clases.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Eye, Plus, Search, Pencil, Trash2, X, User,
  ChevronLeft, ChevronRight, Hash, TrendingUp,
  SlidersHorizontal, ArrowUpDown, Download, AlertCircle,
  Image as ImageIcon, Link as LinkIcon, Upload
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

import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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
                          <span className="text-sm font-semibold text-[#16315f]">{c.nombre_level}</span>
                          <span className="text-[10px] text-slate-400">{c.nombre_sede}</span>
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
                          c.estado === "Disponible" ? "bg-emerald-50 text-emerald-600" :
                            c.estado === "Ocupado" ? "bg-amber-50 text-amber-600" :
                              "bg-red-50 text-red-600"
                        )}>
                          {c.estado}
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
      </div>

      {/* Notificación */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-[#16315f]" : "bg-red-600"}`}
          >
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
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                        <Trash2 size={30} />
                      </div>
                      <p className="text-sm leading-6 text-[#6b84aa]">
                        ¿Estás seguro de eliminar la clase <span className="font-bold text-[#d44966]">{selectedClase?.descripcion}</span>?
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {formStep === 1 ? (
                          <>
                            {/* Step 1 Left: Image Preview */}
                            <div className="w-full lg:w-1/3 space-y-4">
                              <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group relative">
                                {formData.url_imagen ? (
                                  <img src={formData.url_imagen} alt="Preview" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-slate-300">
                                    <ImageIcon size={64} strokeWidth={1} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Sin Arte Visual</span>
                                  </div>
                                )}
                                {uploading && (
                                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <TrendingUp className="animate-spin text-[#16315f]" size={32} />
                                  </div>
                                )}
                              </div>

                              {modal !== "ver" && (
                                <div className="space-y-4">
                                  <label className={configUi.fieldLabel}>Identidad Visual de la Clase</label>
                                  <div className="flex flex-col gap-3">
                                    <div className="relative">
                                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                      <input
                                        type="text"
                                        name="url_imagen"
                                        value={formData.url_imagen}
                                        onChange={handleChange}
                                        className={cn(configUi.fieldInput, "pl-12")}
                                        placeholder="URL de imagen externa..."
                                      />
                                    </div>
                                    <label className="cursor-pointer flex items-center justify-center gap-3 bg-[#16315f]/5 hover:bg-[#16315f]/10 text-[#16315f] py-3 rounded-2xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest border border-[#16315f]/10">
                                      <Upload size={18} />
                                      {uploading ? "Sincronizando..." : "Cargar Archivo Local"}
                                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Step 1 Right: Basic Info */}
                            <div className="flex-1 space-y-6">
                              <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Nombre de la Clase / Descripción Breve</label>
                                {modal === "ver" ? (
                                  <div className={configUi.readOnlyField}>{formData.descripcion}</div>
                                ) : (
                                  <input
                                    type="text"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className={cn(configUi.fieldInput, formErrors.descripcion && "border-red-300 bg-red-50/20")}
                                    placeholder="Ej: Yoga Hatha Dinámico"
                                  />
                                )}
                                {formErrors.descripcion && (
                                  <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1 animate-in slide-in-from-left-2">
                                    <AlertCircle size={12} /> {formErrors.descripcion}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Nivel Académico</label>
                                  {modal === "ver" ? (
                                    <div className={configUi.readOnlyField}>{niveles.find(n => n.id_nivel == formData.id_nivel)?.nombre_nivel || "—"}</div>
                                  ) : (
                                    <select name="id_nivel" value={formData.id_nivel} onChange={handleChange} className={cn(configUi.fieldSelect, formErrors.id_nivel && "border-red-300 bg-red-50/20")}>
                                      <option value="">Seleccionar Nivel</option>
                                      {niveles.map(n => <option key={n.id_nivel} value={n.id_nivel}>{n.nombre_nivel}</option>)}
                                    </select>
                                  )}
                                  {formErrors.id_nivel && (
                                    <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1 animate-in slide-in-from-left-2">
                                      <AlertCircle size={12} /> {formErrors.id_nivel}
                                    </p>
                                  )}
                                </div>
                                <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Sede de Entrenamiento</label>
                                  {modal === "ver" ? (
                                    <div className={configUi.readOnlyField}>{sedes.find(s => s.id_sede == formData.id_sede)?.nombre_sede || "—"}</div>
                                  ) : (
                                    <select name="id_sede" value={formData.id_sede} onChange={handleChange} className={cn(configUi.fieldSelect, formErrors.id_sede && "border-red-300 bg-red-50/20")}>
                                      <option value="">Seleccionar Sede</option>
                                      {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</option>)}
                                    </select>
                                  )}
                                  {formErrors.id_sede && (
                                    <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1 animate-in slide-in-from-left-2">
                                      <AlertCircle size={12} /> {formErrors.id_sede}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-auto">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 italic">Resumen de registro</p>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  Inicia el proceso configurando la identidad y ubicación de la clase. En el siguiente paso definiremos horarios e instructores.
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Step 2 Left: Instructors */}
                            <div className="w-full lg:w-1/3 space-y-6">
                              <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100/50 shadow-inner">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                  <User size={14} /> Cuerpo Técnico / Instructores
                                </p>
                                <div className="space-y-3">
                                  {formData.instructores.length === 0 ? (
                                    <div className="py-8 text-center border-2 border-dashed border-indigo-100 rounded-3xl">
                                      <p className="text-xs text-indigo-300 italic font-bold">Sin asignaciones</p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-2">
                                      {formData.instructores.map((inst, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-indigo-50 shadow-sm transition hover:shadow-md animate-in slide-in-from-bottom-2">
                                          <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-200">
                                              {instructores.find(i => i.id_instructor == inst.id_instructor)?.nombre_completo.charAt(0)}
                                            </div>
                                            <span className="text-xs font-black text-[#16315f]">
                                              {instructores.find(i => i.id_instructor == inst.id_instructor)?.nombre_completo}
                                            </span>
                                          </div>
                                          {modal !== "ver" && (
                                            <button type="button" onClick={() => handleEliminarInstructor(idx)} className="h-7 w-7 flex items-center justify-center rounded-lg text-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                              <X size={14} />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {formErrors.instructores && (
                                    <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1 animate-pulse">
                                      <AlertCircle size={10} /> {formErrors.instructores}
                                    </p>
                                  )}

                                  {modal !== "ver" && (
                                    <div className="mt-6 space-y-3">
                                      <select
                                        name="instructorTemporal"
                                        value={formData.instructorTemporal}
                                        onChange={handleChange}
                                        className={cn(configUi.fieldSelect, "!h-12 !bg-white/80 backdrop-blur-sm border-none shadow-sm")}
                                      >
                                        <option value="">Buscar Instructor...</option>
                                        {instructores.filter(i => !formData.instructores.find(fi => fi.id_instructor == i.id_instructor)).map(i => (
                                          <option key={i.id_instructor} value={i.id_instructor}>{i.nombre_completo}</option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={handleAgregarInstructor}
                                        className="w-full h-12 bg-white text-[#16315f] border-2 border-indigo-100 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                      >
                                        <Plus size={16} /> Vincular Staff
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Step 2 Right: Schedule & More */}
                            <div className="flex-1 space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className={cn(configUi.fieldGroup, "col-span-full")}>
                                  <label className={configUi.fieldLabel}>Planificación Semanal (Días de Clase)</label>
                                  {modal === "ver" ? (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {formData.dia_semana ? (
                                        formData.dia_semana.split(", ").map(day => (
                                          <span key={day} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100">
                                            {day}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-slate-400 italic text-xs">Sin días definidos</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => {
                                        const isSelected = formData.dia_semana?.split(", ").includes(d);
                                        return (
                                          <button
                                            type="button"
                                            key={d}
                                            onClick={() => toggleDia(d)}
                                            className={cn(
                                              "h-10 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                                              isSelected
                                                ? "bg-[#16315f] text-white border-[#16315f] shadow-sm shadow-[#16315f]/20"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                                            )}
                                          >
                                            {d.substring(0, 3)}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {formErrors.dia_semana && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1"><AlertCircle size={10} className="inline mr-1" /> {formErrors.dia_semana}</p>}
                                </div>
                                <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Capacidad (Cupos)</label>
                                  {modal === "ver" ? (
                                    <div className={configUi.readOnlyField}>{formData.cupo_maximo}</div>
                                  ) : (
                                    <input
                                      type="number"
                                      name="cupo_maximo"
                                      value={formData.cupo_maximo}
                                      onChange={handleChange}
                                      className={cn(configUi.fieldInput, formErrors.cupo_maximo && "border-red-300 bg-red-50/20")}
                                      placeholder="Cantidad de alumnos..."
                                    />
                                  )}
                                  {formErrors.cupo_maximo && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1"><AlertCircle size={10} className="inline mr-1" /> {formErrors.cupo_maximo}</p>}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Bloque Horario (Inicio)</label>
                                  {modal === "ver" ? (
                                    <div className={configUi.readOnlyField}>{formData.hora_inicio || "—"}</div>
                                  ) : (
                                    <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} className={cn(configUi.fieldInput, formErrors.hora_inicio && "border-red-300 bg-red-50/20")} />
                                  )}
                                  {formErrors.hora_inicio && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1"><AlertCircle size={10} className="inline mr-1" /> {formErrors.hora_inicio}</p>}
                                </div>
                                <div className={configUi.fieldGroup}>
                                  <label className={configUi.fieldLabel}>Bloque Horario (Fin)</label>
                                  {modal === "ver" ? (
                                    <div className={configUi.readOnlyField}>{formData.hora_fin || "—"}</div>
                                  ) : (
                                    <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} className={cn(configUi.fieldInput, formErrors.hora_fin && "border-red-300 bg-red-50/20")} />
                                  )}
                                  {formErrors.hora_fin && <p className="text-[10px] text-red-500 font-bold mt-2 ml-1"><AlertCircle size={10} className="inline mr-1" /> {formErrors.hora_fin}</p>}
                                </div>
                              </div>

                              <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Disponibilidad Operativa</label>
                                {modal === "ver" ? (
                                  <div className="mt-2">
                                    <span className={cn(configUi.pill, formData.estado === "Disponible" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600", "px-4")}>
                                      {formData.estado}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex bg-slate-100 p-1.5 rounded-2xl w-max gap-1">
                                    {["Disponible", "Ocupado", "Cancelado"].map(st => (
                                      <button
                                        type="button"
                                        key={st}
                                        onClick={() => setFormData(p => ({ ...p, estado: st }))}
                                        className={cn(
                                          "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition duration-300",
                                          formData.estado === st ? "bg-white text-[#16315f] shadow-md scale-[1.02]" : "text-slate-500 hover:bg-white/50"
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
                      {formStep === 2 && (
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

                      {modal !== "ver" && modal !== "eliminar" && formStep === 1 && (
                        <button
                          onClick={() => {
                            if (validateStep(1)) setFormStep(2);
                            else showNotification("Completa los campos obligatorios", "error");
                          }}
                          className={cn(configUi.primaryButton, "px-8 h-12")}
                        >
                          Siguiente
                        </button>
                      ) || (
                        <>
                          {modal === "crear" && formStep === 2 && (
                            <button onClick={handleCreate} className={cn(configUi.primaryButton, "px-8 h-12")}>Finalizar Registro</button>
                          )}
                          {modal === "editar" && formStep === 2 && (
                            <button onClick={handleEdit} className={cn(configUi.primaryButton, "px-8 h-12")}>Actualizar Clase</button>
                          )}
                        </>
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
