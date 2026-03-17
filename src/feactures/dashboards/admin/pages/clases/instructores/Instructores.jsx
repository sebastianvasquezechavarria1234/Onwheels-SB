import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye, Plus, Search, Pencil, Trash2, X, User,
  ChevronLeft, ChevronRight, Hash, TrendingUp,
  SlidersHorizontal, ArrowUpDown, Download, AlertCircle,
  Briefcase,
  IdCard
} from "lucide-react";
import {
  getInstructores,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getUsuariosNoInstructores
} from "../../services/instructoresServices";
import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const Instructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // Ver, crear, editar, eliminar
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
      setError("Error al cargar los datos de instructores.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructores();
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
        (i.especialidad || "").toLowerCase().includes(q)
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

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.id_usuario) {
      errors.id_usuario = "El usuario es obligatorio";
    }

    if (formData.anios_experiencia === "" || isNaN(parseInt(formData.anios_experiencia))) {
      errors.anios_experiencia = "Años de experiencia requeridos (min 0)";
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
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // CRUD Actions
  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        anios_experiencia: parseInt(formData.anios_experiencia),
        especialidad: formData.especialidad.trim()
      };
      await createInstructor(payload);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor registrado con éxito");
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al crear", "error");
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        anios_experiencia: parseInt(formData.anios_experiencia),
        especialidad: formData.especialidad.trim()
      };
      await updateInstructor(selectedInstructor.id_instructor, payload);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor actualizado con éxito");
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al actualizar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstructor(selectedInstructor.id_instructor);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor desactivado con éxito");
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al desactivar", "error");
    }
  };

  const openModal = (type, instructor = null) => {
    setModal(type);
    setSelectedInstructor(instructor);
    if (type === "crear") {
      setFormData({ id_usuario: "", anios_experiencia: "", especialidad: "" });
    } else if (instructor) {
      setFormData({
        id_usuario: instructor.id_usuario.toString(),
        anios_experiencia: instructor.anios_experiencia?.toString() || "0",
        especialidad: instructor.especialidad || ""
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedInstructor(null);
    setFormErrors({});
  };

  const exportCSV = () => {
    const headers = ["Nombre", "Email", "Documento", "Especialidad", "Experiencia", "Estado"];
    const rows = filteredAndSorted.map(i => [
      i.nombre_completo, i.email, i.documento || "N/A", i.especialidad, i.anios_experiencia, i.estado ? "Activo" : "Inactivo"
    ].join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `instructores_onwheels.csv`;
    a.click();
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Instructores
            </h2>
            <span className={configUi.countBadge}>{filteredAndSorted.length} miembros</span>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, email o especialidad..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            <button
              onClick={exportCSV}
              className={configUi.iconButton}
              title="Exportar CSV"
            >
              <Download size={20} />
            </button>

            <button
              onClick={() => openModal("crear")}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Registrar Instructor
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[30%]`}>Instructor</th>
                  <th className={`${configUi.th} w-[25%]`}>Contacto</th>
                  <th className={`${configUi.th} w-[20%]`}>Especialidad</th>
                  <th className={`${configUi.th} text-center w-[10%]`}>Exp.</th>
                  <th className={`${configUi.th} text-center w-[10%]`}>Estado</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[5%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className={configUi.emptyState}>Cargando instructores...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className={configUi.emptyState}>
                      <div className="text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={40} className="opacity-50" />
                        <p className="font-bold">{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={configUi.emptyState}>No se han encontrado instructores.</td>
                  </tr>
                ) : (
                  currentItems.map((inst) => (
                    <tr key={inst.id_instructor} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-[#16315f] font-bold text-sm shadow-sm border border-slate-100">
                            {inst.nombre_completo?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#16315f] text-sm leading-tight mb-0.5 truncate">{inst.nombre_completo}</p>
                            <p className="text-[10px] text-slate-400 font-medium">ID: {inst.id_instructor}</p>
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-600">{inst.email}</span>
                          <span className="text-[10px] text-slate-400 font-bold tracking-wider">{inst.documento || "Sin Documento"}</span>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <span className="text-sm text-slate-600 font-medium">{inst.especialidad || "General"}</span>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-slate-100 italic">
                          {inst.anios_experiencia}a
                        </span>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <span className={cn(
                          configUi.pill,
                          inst.estado ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {inst.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("ver", inst)} className={configUi.actionButton} title="Ver"><Eye size={14} /></button>
                          <button onClick={() => openModal("editar", inst)} className={configUi.actionButton} title="Editar"><Pencil size={14} /></button>
                          <button onClick={() => openModal("eliminar", inst)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
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

      {/* --- NOTIFICATIONS --- */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-2xl text-white font-bold flex items-center gap-3 border border-white/20 backdrop-blur-md ${notification.type === "success" ? "bg-[#16315f]" : "bg-red-600"}`}
          >
            {notification.type === "success" ? <TrendingUp size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALES --- */}
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
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#16315f] border border-slate-100 shadow-inner">
                      {modal === "eliminar" ? <Trash2 size={24} className="text-red-500" /> : <Briefcase size={24} />}
                    </div>
                    <div>
                      <h3 className={configUi.modalTitle}>
                        {modal === "crear" ? "Registrar Instructor" : modal === "editar" ? "Editar Perfil" : modal === "ver" ? "Ficha Técnica" : "Confirmar acción"}
                      </h3>
                      <p className={configUi.modalSubtitle}>
                        {modal === "eliminar" ? "Esta acción desactivará al instructor del sistema." : "Gestiona las capacidades y especialidad del miembro."}
                      </p>
                    </div>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                  {modal === "eliminar" ? (
                    <div className="py-4 text-center">
                      <p className="text-sm leading-6 text-[#6b84aa]">
                        ¿Estás seguro de desactivar al instructor <span className="font-bold text-[#d44966]">{selectedInstructor?.nombre_completo}</span>?
                        No podrá ser asignado a nuevas clases.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left Sidebar (Profile Info) */}
                      <div className="w-full lg:w-1/3 space-y-4">
                        <div className="w-full aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center overflow-hidden shadow-inner p-6 text-center">
                          <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center text-[#16315f] border-4 border-slate-100 mb-4 transition duration-500 hover:rotate-6">
                            <User size={48} strokeWidth={1} />
                          </div>
                          {modal === "crear" ? (
                            <div className="space-y-1">
                              <p className="font-bold text-[#16315f] text-lg leading-tight italic">Nuevo</p>
                              <p className="text-xs text-slate-400 font-medium">Asignación de usuario</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-bold text-[#16315f] text-lg leading-tight truncate w-full">{selectedInstructor?.nombre_completo}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedInstructor?.email}</p>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30">
                          <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest mb-3 italic flex items-center gap-2">
                            <Hash size={12} /> Datos de Sistema
                          </p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-medium">Documento</span>
                              <span className="text-[#16315f] font-bold">{selectedInstructor?.documento || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-medium">Teléfono</span>
                              <span className="text-[#16315f] font-bold">{selectedInstructor?.telefono || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400 font-medium">Estado</span>
                              <span className={cn("px-2 py-0.5 rounded-md font-bold", selectedInstructor?.estado ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                {selectedInstructor?.estado ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side (Form Fields) */}
                      <div className="flex-1 space-y-6">
                        {modal !== "ver" && (
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Vincular Usuario a Perfil de Instructor</label>
                            {modal === "editar" ? (
                                <div className={configUi.readOnlyField}>
                                    {selectedInstructor?.nombre_completo} ({selectedInstructor?.email})
                                </div>
                            ) : (
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                  <select
                                    name="id_usuario"
                                    value={formData.id_usuario}
                                    onChange={handleChange}
                                    className={`${configUi.fieldSelect} !pl-10`}
                                  >
                                    <option value="">Seleccione un usuario disponible...</option>
                                    {usuariosDisponibles.map(u => (
                                      <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} - {u.email}</option>
                                    ))}
                                  </select>
                                </div>
                            )}
                            {formErrors.id_usuario && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.id_usuario}</p>}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Especialidad Principal</label>
                            {modal === "ver" ? (
                              <div className={configUi.readOnlyField}>{formData.especialidad || "—"}</div>
                            ) : (
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  type="text"
                                  name="especialidad"
                                  value={formData.especialidad}
                                  onChange={handleChange}
                                  className={`${configUi.fieldInput} !pl-10`}
                                  placeholder="Ej: Freestyle Slide, Bowl..."
                                />
                              </div>
                            )}
                            {formErrors.especialidad && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.especialidad}</p>}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Años de Experiencia</label>
                            {modal === "ver" ? (
                              <div className={configUi.readOnlyField}>{formData.anios_experiencia} años</div>
                            ) : (
                              <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  type="number"
                                  name="anios_experiencia"
                                  value={formData.anios_experiencia}
                                  onChange={handleChange}
                                  className={`${configUi.fieldInput} !pl-10`}
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                            )}
                            {formErrors.anios_experiencia && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{formErrors.anios_experiencia}</p>}
                          </div>
                        </div>

                        {modal === "ver" && (
                             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-2 opacity-60">
                                 <TrendingUp size={32} className="text-[#16315f]" />
                                 <p className="text-xs font-bold text-[#16315f] uppercase tracking-tighter">Historial y Desempeño</p>
                                 <p className="text-[10px] text-slate-400 italic">Módulo de estadísticas proximamente disponible para el perfil del instructor.</p>
                             </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-[10px] text-slate-400 italic font-medium">
                    {modal === "ver" ? "Ficha de lectura del personal." : "Esta información define el perfil profesional del instructor."}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} className={configUi.secondaryButton}>
                      {modal === "ver" ? "Entendido" : "Cancelar"}
                    </button>
                    {modal === "crear" && (
                      <button onClick={handleCreate} className={configUi.primarySoftButton}>Dar de Alta</button>
                    )}
                    {modal === "editar" && (
                      <button onClick={handleEdit} className={configUi.primarySoftButton}>Guardar Perfil</button>
                    )}
                    {modal === "eliminar" && (
                      <button onClick={handleDelete} className={configUi.dangerButton}>Confirmar Baja</button>
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

export default Instructores;
