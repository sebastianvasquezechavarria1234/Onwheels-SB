import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  User, Phone, Mail, Calendar, Hash, Shield, Info, CheckCircle2, AlertCircle,
  Briefcase, TrendingUp, Download, IdCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getEstudiantes,
  crearEstudiante,
  actualizarEstadoEstudiante,
  eliminarEstudiante,
  getDetalleEstudiante
} from "../../services/estudiantesServices";
import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Students = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modales
  const [modal, setModal] = useState(null); // "add" | "edit" | "details" | "delete"
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [details, setDetails] = useState(null);

  // Formulario Multistep
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_completo: "", email: "", telefono: "", password: "",
    documento: "", tipo_documento: "CC", genero: "Masculino",
    enfermedad: "Ninguna", nivel_experiencia: "Principiante", edad: "",
    acudiente_nombre: "", acudiente_telefono: "", acudiente_parentesco: "Padre/Madre"
  });
  const [formErrors, setFormErrors] = useState({});

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchEstudiantes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEstudiantes();
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar estudiantes");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  const openModal = async (type, student = null) => {
    setModal(type);
    setSelectedStudent(student);
    if (type === 'details' && student) {
      try {
        const data = await getDetalleEstudiante(student.id_estudiante);
        setDetails(data);
      } catch (err) {
        showNotification("Error al cargar detalles", "error");
      }
    } else if (type === 'add') {
      setCurrentStep(1);
      setFormData({
        nombre_completo: "", email: "", telefono: "", password: "",
        documento: "", tipo_documento: "CC", genero: "Masculino",
        enfermedad: "Ninguna", nivel_experiencia: "Principiante", edad: "",
        acudiente_nombre: "", acudiente_telefono: "", acudiente_parentesco: "Padre/Madre"
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedStudent(null);
    setDetails(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    try {
      if (modal === 'add') {
        await crearEstudiante(formData);
        showNotification("Estudiante registrado con éxito");
      }
      fetchEstudiantes();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await eliminarEstudiante(selectedStudent.id_estudiante);
      showNotification("Estudiante eliminado");
      fetchEstudiantes();
      closeModal();
    } catch (err) {
      showNotification("No se puede eliminar: el estudiante tiene datos asociados", "error");
    }
  };

  const handleStatusToggle = async (student) => {
    try {
      const nuevoEstado = student.estado === 'Activo' ? 'Inactivo' : 'Activo';
      await actualizarEstadoEstudiante(student.id_estudiante, nuevoEstado);
      showNotification(`Estudiante ${nuevoEstado.toLowerCase()}`);
      fetchEstudiantes();
    } catch (err) {
      showNotification("Error al cambiar estado", "error");
    }
  };

  const filtered = estudiantes.filter(s =>
    (s.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.documento || "").includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ["Nombre", "Documento", "Email", "Teléfono", "Nivel", "Estado"];
    const rows = filtered.map(s => [
      s.nombre_completo, s.documento, s.email, s.telefono, s.nivel_experiencia, s.estado
    ].join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estudiantes.csv`;
    a.click();
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- HEADER --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Comunidad Estudiantil
            </h2>
            <span className={configUi.countBadge}>{filtered.length} registrados</span>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            <button onClick={exportCSV} className={configUi.iconButton} title="Exportar CSV">
              <Download size={20} />
            </button>

            <button onClick={() => openModal("add")} className={configUi.primaryButton}>
              <Plus size={18} />
              Registrar Estudiante
            </button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[30%]`}>Estudiante</th>
                  <th className={`${configUi.th} w-[20%]`}>Identificación</th>
                  <th className={`${configUi.th} w-[20%]`}>Contacto</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Estado</th>
                   <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[15%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className={configUi.emptyState}>Cargando comunidad...</td></tr>
                ) : error ? (
                  <tr><td colSpan="5" className={configUi.emptyState}><div className="text-red-500">{error}</div></td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="5" className={configUi.emptyState}>No se han encontrado registros.</td></tr>
                ) : (
                  currentItems.map((s) => (
                    <tr key={s.id_estudiante} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-[#16315f] font-bold text-sm shadow-sm border border-slate-100 overflow-hidden">
                             {s.foto_url ? (
                                <img src={s.foto_url} alt={s.nombre_completo} className="h-full w-full object-cover" />
                             ) : (
                                <User size={20} />
                             )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#16315f] text-sm leading-tight mb-0.5 truncate">{s.nombre_completo}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{s.nivel_experiencia}</p>
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-600">{s.documento}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{s.tipo_documento || "CC"}</span>
                         </div>
                      </td>
                      <td className={configUi.td}>
                         <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {s.telefono}</span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {s.email}</span>
                         </div>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <button
                          onClick={() => handleStatusToggle(s)}
                          className={cn(
                            configUi.pill,
                            s.estado === 'Activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          )}
                        >
                          {s.estado}
                        </button>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("details", s)} className={configUi.actionButton} title="Ver Perfil"><Eye size={14} /></button>
                          <button onClick={() => openModal("edit", s)} className={configUi.actionButton} title="Editar"><Pencil size={14} /></button>
                          <button onClick={() => openModal("delete", s)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={configUi.paginationButton}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                className={`${configUi.modalPanel} ${modal === 'delete' ? 'max-w-sm' : 'max-w-4xl'}`}
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
                            {modal === 'delete' ? <Trash2 size={24} className="text-red-500" /> : <User size={24} />}
                        </div>
                        <div>
                            <h3 className={configUi.modalTitle}>
                                {modal === 'add' ? "Registrar Estudiante" :
                                 modal === 'edit' ? "Editar Perfil" :
                                 modal === 'delete' ? "Confirmar acción" : "Ficha del Estudiante"}
                            </h3>
                            <p className={configUi.modalSubtitle}>
                                {modal === 'delete' ? "Esta acción es irreversible." : "Gestión integral del perfil y datos académicos."}
                            </p>
                        </div>
                    </div>
                    <button onClick={closeModal} className={configUi.modalClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={configUi.modalContent}>
                    {modal === 'delete' ? (
                        <div className="py-4 text-center">
                            <p className="text-sm leading-6 text-[#6b84aa]">
                                ¿Estás seguro de eliminar a <span className="font-bold text-[#d44966]">{selectedStudent?.nombre_completo}</span>?
                            </p>
                        </div>
                    ) : modal === 'details' ? (
                        <div className="flex flex-col lg:flex-row gap-8">
                             {/* Sidebar Perfil */}
                             <div className="w-full lg:w-1/3 space-y-4">
                                <div className="w-full aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center overflow-hidden shadow-inner p-6 text-center">
                                    <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center text-[#16315f] border-4 border-slate-100 mb-4 overflow-hidden">
                                        {details?.foto_url ? (
                                            <img src={details.foto_url} className="h-full w-full object-cover" alt="Profile" />
                                        ) : (
                                            <User size={48} strokeWidth={1} />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#16315f] text-lg leading-tight truncate w-full">{details?.nombre_completo}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{details?.email}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30">
                                    <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest mb-3 italic flex items-center gap-2">
                                        <Hash size={12} /> Contacto
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400 font-medium tracking-tight">Teléfono</span>
                                            <span className="text-[#16315f] font-bold">{details?.telefono || "—"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400 font-medium tracking-tight">ID ({details?.tipo_documento})</span>
                                            <span className="text-[#16315f] font-bold">{details?.documento || "—"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400 font-medium tracking-tight">Estado</span>
                                            <span className={cn("px-2 py-0.5 rounded-md font-bold", details?.estado === 'Activo' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                                {details?.estado || "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             {/* Info Principal */}
                             <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 relative overflow-hidden group">
                                        <div className="absolute top-4 right-4 text-blue-100 transition-transform group-hover:scale-125 duration-500">
                                            <TrendingUp size={40} strokeWidth={3} />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none italic mb-2">Nivel Experiencia</p>
                                        <p className="text-2xl font-black text-[#16315f]">{details?.nivel_experiencia || "—"}</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 relative overflow-hidden group">
                                        <div className="absolute top-4 right-4 text-slate-100 transition-transform group-hover:scale-125 duration-500">
                                            <Calendar size={40} strokeWidth={3} />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none italic mb-2">Edad Reportada</p>
                                        <p className="text-2xl font-black text-[#16315f]">{details?.edad || "—"} <span className="text-xs font-bold text-slate-300">Años</span></p>
                                    </div>
                                </div>

                                <div className={configUi.fieldGroup}>
                                    <label className={configUi.fieldLabel}>Condiciones Médicas</label>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-200 text-sm text-slate-600 font-medium italic min-h-[60px]">
                                        {details?.enfermedad || "Ninguna condición registrada."}
                                    </div>
                                </div>

                                <div className="p-6 bg-[#16315f] rounded-[2rem] text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
                                     <div className="absolute -right-4 -bottom-4 opacity-10">
                                        <Shield size={120} />
                                     </div>
                                     <h4 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Shield size={14} /> Acudiente de Emergencia
                                     </h4>
                                     {details?.acudiente_nombre ? (
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                            <div className="space-y-0.5"><label className="text-[9px] font-bold text-blue-300 uppercase block">Nombre Completo</label><p className="font-bold text-lg leading-tight">{details.acudiente_nombre}</p></div>
                                            <div className="space-y-0.5"><label className="text-[9px] font-bold text-blue-300 uppercase block">Parentesco</label><p className="font-bold text-lg text-emerald-400">{details.acudiente_parentesco}</p></div>
                                            <div className="col-span-2 space-y-0.5"><label className="text-[9px] font-bold text-blue-300 uppercase block">Canal de Contacto</label><p className="font-bold text-lg flex items-center gap-2"><Phone size={16} className="text-emerald-400" /> {details.acudiente_telefono}</p></div>
                                        </div>
                                     ) : (
                                         <p className="text-sm italic text-blue-300 font-medium">No se ha asignado un acudiente para este registro.</p>
                                     )}
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Progresión de pasos */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                {[
                                    { step: 1, label: "Contacto" },
                                    { step: 2, label: "Identidad" },
                                    { step: 3, label: "Médico" }
                                ].map((s) => (
                                    <div key={s.step} className="flex-1 flex items-center gap-2">
                                        <div className={cn(
                                            "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition duration-500",
                                            currentStep >= s.step ? "bg-[#16315f] text-white shadow-md shadow-blue-500/20" : "bg-slate-200 text-slate-400"
                                        )}>
                                            {s.step}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider hidden sm:block transition-colors duration-500",
                                            currentStep >= s.step ? "text-[#16315f]" : "text-slate-300"
                                        )}>{s.label}</span>
                                        {s.step < 3 && <div className="flex-1 h-px bg-slate-200" />}
                                    </div>
                                ))}
                            </div>

                            <div className="min-h-[340px] px-2 overflow-y-auto custom-scrollbar">
                                {currentStep === 1 && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <p className="text-[10px] font-bold text-[#16315f] uppercase tracking-widest italic border-l-2 border-[#16315f] pl-2 leading-none">Información Básica del Estudiante</p>
                                        <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Nombre Completo *</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    className={`${configUi.fieldInput} !pl-10`}
                                                    value={formData.nombre_completo}
                                                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                                                    placeholder="Ej: Juan Sebastián Pérez"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Email *</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="email"
                                                        className={`${configUi.fieldInput} !pl-10`}
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="juan@ejemplo.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Teléfono *</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="text"
                                                        className={`${configUi.fieldInput} !pl-10`}
                                                        value={formData.telefono}
                                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                        placeholder="300 000 0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {modal === 'add' && (
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Nueva Contraseña *</label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="password"
                                                        className={`${configUi.fieldInput} !pl-10`}
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder="Mínimo 8 caracteres"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium mt-1 ml-1 italic">Este será el acceso del estudiante a la plataforma.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <p className="text-[10px] font-bold text-[#16315f] uppercase tracking-widest italic border-l-2 border-[#16315f] pl-2 leading-none">Perfil de Alumno</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Tipo de Documento</label>
                                                <select
                                                    className={configUi.fieldSelect}
                                                    value={formData.tipo_documento}
                                                    onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                                                >
                                                    <option value="CC">Cédula de Cdad.</option>
                                                    <option value="TI">Tarj. Identidad</option>
                                                    <option value="CE">Cédula Extranjería</option>
                                                </select>
                                            </div>
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Documento *</label>
                                                <div className="relative">
                                                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="text"
                                                        className={`${configUi.fieldInput} !pl-10`}
                                                        value={formData.documento}
                                                        onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Género</label>
                                                <select
                                                    className={configUi.fieldSelect}
                                                    value={formData.genero}
                                                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                                                >
                                                    <option value="Masculino">Masculino</option>
                                                    <option value="Femenino">Femenino</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Años / Edad</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="number"
                                                        className={`${configUi.fieldInput} !pl-10`}
                                                        value={formData.edad}
                                                        onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Experiencia</label>
                                                <select
                                                    className={configUi.fieldSelect}
                                                    value={formData.nivel_experiencia}
                                                    onChange={(e) => setFormData({ ...formData, nivel_experiencia: e.target.value })}
                                                >
                                                    <option value="Principiante">Principiante</option>
                                                    <option value="Intermedio">Intermedio</option>
                                                    <option value="Avanzado">Avanzado</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                         <p className="text-[10px] font-bold text-[#16315f] uppercase tracking-widest italic border-l-2 border-[#16315f] pl-2 leading-none">Seguridad y Salud</p>
                                         <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Acudiente de Emergencia</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    className={`${configUi.fieldInput} !pl-10`}
                                                    value={formData.acudiente_nombre}
                                                    onChange={(e) => setFormData({ ...formData, acudiente_nombre: e.target.value })}
                                                    placeholder="Nombre del contacto..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Parentesco</label>
                                                <select
                                                    className={configUi.fieldSelect}
                                                    value={formData.acudiente_parentesco}
                                                    onChange={(e) => setFormData({ ...formData, acudiente_parentesco: e.target.value })}
                                                >
                                                    <option value="Padre/Madre">Padre/Madre</option>
                                                    <option value="Herman@">Herman@</option>
                                                    <option value="Tí@">Tí@</option>
                                                    <option value="Amig@">Amig@</option>
                                                </select>
                                            </div>
                                            <div className={configUi.fieldGroup}>
                                                <label className={configUi.fieldLabel}>Teléfono Acudiente</label>
                                                <div className="relative">
                                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                     <input
                                                        type="text"
                                                        className={`${configUi.fieldInput} !pl-10`}
                                                        value={formData.acudiente_telefono}
                                                        onChange={(e) => setFormData({ ...formData, acudiente_telefono: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={configUi.fieldGroup}>
                                            <label className={configUi.fieldLabel}>Historial / Condiciones Médicas</label>
                                            <textarea
                                                className={`${configUi.fieldInput} !h-24 resize-none`}
                                                value={formData.enfermedad}
                                                onChange={(e) => setFormData({ ...formData, enfermedad: e.target.value })}
                                                placeholder="Ej: Asma, Alergias, Problemas de rodilla..."
                                            />
                                            <p className="text-[9px] text-slate-400 font-bold mt-1 ml-1 flex items-center gap-1.5 uppercase italic tracking-tighter"><Info size={10} /> Esta información es vital para los entrenadores durante las clases.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={configUi.modalFooter}>
                    <span className="text-[10px] text-slate-400 italic font-medium">
                        {modal === 'details' ? "Ficha de lectura del expediente." : "Verifica que todos los campos asteriscados (*) estén correctos."}
                    </span>
                    <div className="flex items-center gap-3">
                        <button onClick={closeModal} className={configUi.secondaryButton}>
                             {modal === 'details' ? "Entendido" : "Cancelar"}
                        </button>

                        {(modal === 'add' || modal === 'edit') && (
                            <div className="flex gap-2">
                                {currentStep > 1 && (
                                    <button onClick={() => setCurrentStep(p => p - 1)} className={configUi.secondaryButton}>Atrás</button>
                                )}
                                {currentStep < 3 ? (
                                    <button onClick={() => setCurrentStep(p => p + 1)} className={configUi.primarySoftButton}>Siguiente</button>
                                ) : (
                                    <button onClick={handleSave} className={configUi.primarySoftButton}>
                                        {modal === 'add' ? 'Registrar Miembro' : 'Actualizar Perfil'}
                                    </button>
                                )}
                            </div>
                        )}

                        {modal === 'delete' && (
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

export default Students;
