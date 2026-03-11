import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  Camera, User, Phone, Mail, Calendar, Hash, Shield, Info, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getEstudiantes,
  crearEstudiante,
  actualizarEstadoEstudiante,
  eliminarEstudiante,
  getDetalleEstudiante,
  getSugerenciasEstudiantes
} from "../../services/estudiantesServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
      const data = await getEstudiantes();
      setEstudiantes(data);
    } catch (err) {
      showNotification("Error al cargar estudiantes", "error");
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
      showNotification("No se puede eliminar: el estudiante tiene matrículas activas", "error");
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
    s.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    s.documento.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Search Area */}
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Clases / Estudiantes
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                <span className="text-xs font-bold">{filtered.length} registrados</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por nombre o documento..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />
            Registrar Estudiante
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left relative">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Estudiante</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Documento</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Contacto</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm italic">Cargando comunidad...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">No se encontraron estudiantes</td></tr>
                ) : (
                  currentItems.map((s) => (
                    <tr key={s.id_estudiante} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.foto_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + s.id_usuario}
                            alt={s.nombre_completo}
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-white transition"
                          />
                          <div>
                            <p className="font-bold text-[#040529] text-sm leading-tight">{s.nombre_completo}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{s.nivel_experiencia}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-slate-500">{s.documento}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Phone size={10} /> {s.telefono}</span>
                          <span className="flex items-center gap-1 truncate max-w-[140px]"><Mail size={10} /> {s.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleStatusToggle(s)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold border transition-colors shadow-sm",
                            s.estado === 'Activo' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          )}
                        >
                          {s.estado}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal("details", s)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                            title="Ver Perfil"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal("edit", s)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openModal("delete", s)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Página <span className="font-bold text-[#040529]">{currentPage}</span> de <span className="font-bold text-[#040529]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-bold ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
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
              className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === 'delete' ? 'max-w-sm w-full' :
                  modal === 'details' ? 'max-w-4xl w-full' : 'max-w-2xl w-full'
                }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#040529] flex items-center gap-2">
                    {modal === 'add' ? <><Plus size={20} /> Nuevo Estudiante</> :
                      modal === 'edit' ? <><Pencil size={20} /> Editar Perfil</> :
                        modal === 'delete' ? <><AlertCircle size={20} /> Confirmar</> :
                          <><User size={20} /> Perfil de Estudiante</>}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529] p-1 rounded-full hover:bg-gray-100 transition">
                    <X size={20} />
                  </button>
                </div>

                {modal === 'delete' ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-6 italic underline decoration-red-100">¿Estás seguro de eliminar a <span className="font-bold text-red-600">{selectedStudent?.nombre_completo}</span>? Esta acción es irreversible.</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Eliminar</button>
                    </div>
                  </div>
                ) : modal === 'details' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="md:col-span-1 flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <img
                        src={details?.foto_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + details?.id_usuario}
                        className="h-28 w-28 rounded-2xl object-cover mb-4 ring-4 ring-white shadow-md"
                        alt="Profile"
                      />
                      <h4 className="font-bold text-[#040529]">{details?.nombre_completo}</h4>
                      <p className="text-xs text-slate-400">{details?.email}</p>
                      <div className="mt-4 pt-4 border-t border-slate-200 w-full text-left space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Contacto</p>
                        <p className="text-sm text-slate-600 flex items-center gap-2"><Phone size={12} /> {details?.telefono}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-2 font-bold"><Hash size={12} /> {details?.documento} ({details?.tipo_documento})</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2"><Info size={14} className="text-slate-200" /></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-blue-500" /> Información Deportiva
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-[9px] font-bold text-slate-300 block">NIVEL</label><p className="text-sm font-bold text-blue-600">{details?.nivel_experiencia}</p></div>
                          <div><label className="text-[9px] font-bold text-slate-300 block">EDAD</label><p className="text-sm font-bold text-[#040529]">{details?.edad} años</p></div>
                          <div className="col-span-2"><label className="text-[9px] font-bold text-slate-300 block">CONDICIONES MÉDICAS</label><p className="text-sm text-slate-600">{details?.enfermedad || "Ninguna registrada"}</p></div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><Shield size={40} /></div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Acudiente de Emergencia</h4>
                        {details?.acudiente_nombre ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-bold text-slate-500 block">NOMBRE</label><p className="text-sm font-bold">{details.acudiente_nombre}</p></div>
                            <div><label className="text-[9px] font-bold text-slate-500 block">PARENTESCO</label><p className="text-sm font-bold text-blue-400">{details.acudiente_parentesco}</p></div>
                            <div className="col-span-2"><label className="text-[9px] font-bold text-slate-500 block">TELÉFONO</label><p className="text-sm font-bold flex items-center gap-2"><Phone size={12} /> {details.acudiente_telefono}</p></div>
                          </div>
                        ) : <p className="text-sm italic text-slate-500">No se registró información de acudiente</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Formulario de Registro / Edición
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: currentStep >= s ? "100%" : "0%" }}
                            className="h-full bg-[#040529]"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                      {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h4 className="text-sm font-bold text-[#040529] border-b pb-2">1. Datos de Contacto</h4>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre Completo *</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm focus:ring-4 focus:ring-blue-50"
                              value={formData.nombre_completo}
                              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                              placeholder="Ej: Juan Pérez"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Correo Electrónico *</label>
                              <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm focus:ring-4 focus:ring-blue-50"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="juan@email.com"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teléfono *</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm focus:ring-4 focus:ring-blue-50"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                placeholder="300 123 4567"
                              />
                            </div>
                          </div>
                          {modal === 'add' && (
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contraseña *</label>
                              <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm focus:ring-4 focus:ring-blue-50"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Min. 8 caracteres"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h4 className="text-sm font-bold text-[#040529] border-b pb-2">2. Identificación y Perfil</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo</label>
                              <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                                value={formData.tipo_documento}
                                onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                              >
                                <option value="CC">Cédula de Cdad.</option>
                                <option value="TI">Tarj. Identidad</option>
                                <option value="CE">Cédula Extranjería</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Documento *</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
                                value={formData.documento}
                                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Género</label>
                              <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                                value={formData.genero}
                                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                              >
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Edad</label>
                              <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
                                value={formData.edad}
                                onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Experiencia</label>
                            <select
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                              value={formData.nivel_experiencia}
                              onChange={(e) => setFormData({ ...formData, nivel_experiencia: e.target.value })}
                            >
                              <option value="Principiante">Principiante</option>
                              <option value="Intermedio">Intermedio</option>
                              <option value="Avanzado">Avanzado</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          <h4 className="text-sm font-bold text-[#040529] border-b pb-2">3. Acudiente e Información Médica</h4>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre Acudiente</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
                              value={formData.acudiente_nombre}
                              onChange={(e) => setFormData({ ...formData, acudiente_nombre: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teléfono Acudiente</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
                                value={formData.acudiente_telefono}
                                onChange={(e) => setFormData({ ...formData, acudiente_telefono: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Parentesco</label>
                              <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm bg-white"
                                value={formData.acudiente_parentesco}
                                onChange={(e) => setFormData({ ...formData, acudiente_parentesco: e.target.value })}
                              >
                                <option value="Padre/Madre">Padre/Madre</option>
                                <option value="Herman@">Herman@</option>
                                <option value="Tí@">Tí@</option>
                                <option value="Amig@">Amig@</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Condiciones Médicas</label>
                            <textarea
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm min-h-[80px] resize-none"
                              value={formData.enfermedad}
                              onChange={(e) => setFormData({ ...formData, enfermedad: e.target.value })}
                              placeholder="Ej: Alergia al polen, Asma..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      {currentStep > 1 && (
                        <button
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition hover:bg-slate-200"
                        >
                          Anterior
                        </button>
                      )}
                      {currentStep < 3 ? (
                        <button
                          onClick={() => setCurrentStep(prev => prev + 1)}
                          className="flex-[2] py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#040529]/90 transition"
                        >
                          Siguiente
                        </button>
                      ) : (
                        <button
                          onClick={handleSave}
                          className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition"
                        >
                          {modal === 'add' ? 'Finalizar Registro' : 'Guardar Cambios'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
