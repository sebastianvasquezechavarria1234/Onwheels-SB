// src/feactures/dashboards/admin/pages/clases/clases/Clases.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, User, Hash, Clock, MapPin, Users, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getClases,
  createClase,
  updateClase,
  deleteClase,
  getNiveles,
  getSedes,
  getInstructores
} from "../../services/clasesService";

export const Clases = () => {
  // --- ESTADOS ---
  const [clases, setClases] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [instructores, setInstructores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null);
  const [selectedClase, setSelectedClase] = useState(null);

  const [form, setForm] = useState({
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

  const [formErrors, setFormErrors] = useState({});

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // ===================== VALIDACIONES =====================
  const validateField = (name, value, currentForm) => {
    const formData = currentForm || form;
    let error = "";

    if (name === "descripcion") {
      if (!value || !value.trim()) error = "La descripción es obligatoria";
      else if (value.trim().length < 3) error = "Mínimo 3 caracteres";
      else if (value.trim().length > 100) error = "Máximo 100 caracteres";
    }

    if (name === "id_nivel") {
      if (!value) error = "Seleccione un nivel";
    }

    if (name === "id_sede") {
      if (!value) error = "Seleccione una sede";
    }

    if (name === "dia_semana") {
      if (!value) error = "Seleccione un día";
    }

    if (name === "cupo_maximo") {
      if (!value) error = "El cupo es obligatorio";
      else if (parseInt(value) <= 0) error = "El cupo debe ser mayor a 0";
    }

    if (name === "hora_inicio") {
      if (!value) error = "La hora de inicio es obligatoria";
    }

    if (name === "hora_fin") {
      if (!value) error = "La hora de fin es obligatoria";
      else if (formData.hora_inicio && value <= formData.hora_inicio) {
        error = "La hora de fin debe ser posterior a la de inicio";
      }
    }

    if (name === "instructores") {
      if (!value || value.length === 0) error = "Debe asignar al menos un instructor";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    const fields = ["descripcion", "id_nivel", "id_sede", "dia_semana", "cupo_maximo", "hora_inicio", "hora_fin", "instructores"];
    let isValid = true;
    
    fields.forEach(field => {
      const isFieldValid = validateField(field, form[field]);
      if (!isFieldValid) isValid = false;
    });

    return isValid;
  };

  // --- CARGAR DATOS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
      setError("Error al cargar los datos. Verifica la conexión.");
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
    
    if (name === "instructorTemporal") {
      // Logic for selecting a temporary instructor to add
      setForm((prev) => ({ ...prev, [name]: value }));
      return;
    }

    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    validateField(name, value, nextForm);
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // --- INSTRUCTORES LOGIC ---
  const handleAgregarInstructor = () => {
    const idInstructor = form.instructorTemporal;
    if (!idInstructor) return;
    if (form.instructores.find(i => i.id_instructor == idInstructor)) return;
    
    const instructor = instructores.find(i => i.id_instructor == idInstructor);
    if (!instructor) return;

    const newInstructores = [...form.instructores, { id_instructor: parseInt(idInstructor), rol_instructor: "Principal" }];
    
    setForm(prev => ({
      ...prev,
      instructores: newInstructores,
      instructorTemporal: ""
    }));
    
    // Validate functionality
    validateField("instructores", newInstructores);
  };

  const handleEliminarInstructor = (index) => {
    const newInstructores = form.instructores.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, instructores: newInstructores }));
    validateField("instructores", newInstructores);
  };

  // --- CRUD OPERATIONS ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    try {
      const id_nivel = parseInt(form.id_nivel);
      const id_sede = parseInt(form.id_sede);
      
      const formatTime = (time) => { if (!time) return null; return time.length === 5 ? `${time}:00` : time; };

      const payload = {
        id_nivel, 
        id_sede,
        instructores: form.instructores.map(i => ({ ...i, id_instructor: parseInt(i.id_instructor) })),
        cupo_maximo: form.cupo_maximo ? parseInt(form.cupo_maximo) : null,
        dia_semana: form.dia_semana,
        descripcion: form.descripcion,
        estado: form.estado,
        hora_inicio: formatTime(form.hora_inicio),
        hora_fin: formatTime(form.hora_fin)
      };

      if (modal === "crear") {
        await createClase(payload);
        showNotification("Clase creada con éxito", "success");
      } else if (modal === "editar") {
        await updateClase(selectedClase.id_clase, payload);
        showNotification("Clase actualizada con éxito", "success");
      }
      
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Error guardando clase:", err);
      const msg = err.response?.data?.mensaje || "Error al guardar (Verifica Backend)";
      showNotification(msg, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedClase) return;
      await deleteClase(selectedClase.id_clase);
      await fetchData();
      closeModal();
      showNotification("Clase eliminada con éxito", "success");
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
    setFormErrors({});

    const defaultData = {
      id_nivel: "", id_sede: "", instructores: [], instructorTemporal: "",
      cupo_maximo: "", dia_semana: "", descripcion: "", estado: "Disponible",
      hora_inicio: "", hora_fin: ""
    };

    if (clase && (type === "editar" || type === "ver")) {
      setForm({
        id_nivel: clase.id_nivel?.toString() || "",
        id_sede: clase.id_sede?.toString() || "",
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
      setForm(defaultData);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedClase(null);
    setFormErrors({});
    setForm({
      id_nivel: "", id_sede: "", instructores: [], instructorTemporal: "",
      cupo_maximo: "", dia_semana: "", descripcion: "", estado: "Disponible",
      hora_inicio: "", hora_fin: ""
    });
  };

  // --- PAGINATION & SEARCH ---
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filtered = useMemo(() => {
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
    return result;
  }, [clases, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const getNombreInstructor = (id) => {
    const inst = instructores.find(i => i.id_instructor === id);
    return inst ? inst.nombre_completo : "Desconocido";
  };

  // --- RENDER ---
  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Clases / Gestión de Clases</h2>

          {/* ===================== BUSCADOR Y BOTON ===================== */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar clases..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} color="white" /> Registrar nueva clase
            </button>
          </div>

          {/* ===================== TABLA ===================== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Clase</th>
                    <th className="px-6 py-3">Nivel</th>
                    <th className="px-6 py-3">Sede</th>
                    <th className="px-6 py-3">Día/Hora</th>
                    <th className="px-6 py-3">Cupo</th>
                    <th className="px-6 py-3">Instructores</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-10 text-gray-500 italic">Cargando clases...</td></tr>
                  ) : currentItems.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-10 text-gray-500 italic">No hay clases registradas</td></tr>
                  ) : (
                    currentItems.map((c) => (
                      <tr key={c.id_clase} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">{c.descripcion}</td>
                        <td className="px-6 py-4">{c.nombre_nivel}</td>
                        <td className="px-6 py-4">{c.nombre_sede}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold">{c.dia_semana}</span>
                            <span className="text-gray-500">
                              {c.hora_inicio && c.hora_fin ? `${c.hora_inicio.substring(0, 5)} - ${c.hora_fin.substring(0, 5)}` : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{c.cupo_maximo}</td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                             {c.instructores?.slice(0, 2).map((inst, i) => (
                               <div key={i} className="h-6 w-6 rounded-full bg-blue-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-blue-800" title={inst.nombre_instructor}>
                                 {inst.nombre_instructor.charAt(0)}
                               </div>
                             ))}
                             {(c.instructores?.length || 0) > 2 && (
                               <div className="h-6 w-6 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                 +{(c.instructores?.length || 0) - 2}
                               </div>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            c.estado === "Disponible" ? "bg-green-100 text-green-800" :
                            c.estado === "Ocupado" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal("ver", c)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition" title="Ver"><Eye size={16} /></motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal("editar", c)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition" title="Editar"><Pen size={16} /></motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal("eliminar", c)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition" title="Eliminar"><Trash2 size={16} /></motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===================== PAGINACIÓN ===================== */}
          {filtered.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>Anterior</button>
              <span className="text-sm text-gray-600">Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}>Siguiente</button>
            </div>
          )}

        </div>

        {/* ===================== NOTIFICACIONES ===================== */}
        <AnimatePresence>
          {notification.show && (
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ duration: 0.3 }} className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== MODAL CREAR / EDITAR ===================== */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 20 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">{modal === "crear" ? "Registrar Clase" : "Editar Clase"}</h3>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre / Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Clase *</label>
                    <div className="relative">
                       <input name="descripcion" value={form.descripcion} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.descripcion ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`} placeholder="Ej: Yoga Avanzado" />
                       <User size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.descripcion && <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>}
                  </div>

                  {/* Nivel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                    <select name="id_nivel" value={form.id_nivel} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.id_nivel ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`}>
                      <option value="">Seleccionar...</option>
                      {niveles.map(n => <option key={n.id_nivel} value={n.id_nivel}>{n.nombre_nivel}</option>)}
                    </select>
                    {formErrors.id_nivel && <p className="text-red-500 text-xs mt-1">{formErrors.id_nivel}</p>}
                  </div>

                  {/* Sede */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
                    <select name="id_sede" value={form.id_sede} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.id_sede ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`}>
                      <option value="">Seleccionar...</option>
                      {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre_sede}</option>)}
                    </select>
                    {formErrors.id_sede && <p className="text-red-500 text-xs mt-1">{formErrors.id_sede}</p>}
                  </div>

                  {/* Día y Cupo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Semana *</label>
                    <select name="dia_semana" value={form.dia_semana} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.dia_semana ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`}>
                      <option value="">Seleccionar...</option>
                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {formErrors.dia_semana && <p className="text-red-500 text-xs mt-1">{formErrors.dia_semana}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo *</label>
                     <div className="relative">
                        <input type="number" name="cupo_maximo" value={form.cupo_maximo} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.cupo_maximo ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`} placeholder="0" min="1" />
                        <Users size={16} className="absolute right-3 top-3 text-gray-400" />
                     </div>
                     {formErrors.cupo_maximo && <p className="text-red-500 text-xs mt-1">{formErrors.cupo_maximo}</p>}
                  </div>

                  {/* Horarios */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio *</label>
                    <input type="time" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.hora_inicio ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`} />
                    {formErrors.hora_inicio && <p className="text-red-500 text-xs mt-1">{formErrors.hora_inicio}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin *</label>
                    <input type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2.5 border rounded-lg ${formErrors.hora_fin ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-100 outline-none`} />
                    {formErrors.hora_fin && <p className="text-red-500 text-xs mt-1">{formErrors.hora_fin}</p>}
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none">
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Instructores */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructores *</label>
                    <div className={`p-3 bg-gray-50 border rounded-lg ${formErrors.instructores ? "border-red-500" : "border-gray-200"}`}>
                       <div className="flex gap-2 mb-3">
                          <select name="instructorTemporal" value={form.instructorTemporal} onChange={handleChange} className="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-2 py-2 outline-none">
                            <option value="">Seleccionar instructor...</option>
                            {instructores.filter(i => !form.instructores.find(fi => fi.id_instructor == i.id_instructor)).map(i => <option key={i.id_instructor} value={i.id_instructor}>{i.nombre_completo}</option>)}
                          </select>
                          <button type="button" onClick={handleAgregarInstructor} className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Agregar</button>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                         {form.instructores.length === 0 && <span className="text-xs text-gray-400 italic">Sin instructores asignados</span>}
                         {form.instructores.map((inst, idx) => (
                           <div key={idx} className="bg-white border border-gray-200 text-xs font-medium px-2 py-1.5 rounded-md flex items-center gap-2 shadow-sm">
                             <User size={12} className="text-blue-500" />
                             {getNombreInstructor(inst.id_instructor)}
                             <button type="button" onClick={() => handleEliminarInstructor(idx)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                           </div>
                         ))}
                       </div>
                    </div>
                    {formErrors.instructores && <p className="text-red-500 text-xs mt-1">{formErrors.instructores}</p>}
                  </div>

                  {/* Buttons */}
                  <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">Cancelar</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition">{modal === "crear" ? "Guardar Clase" : "Actualizar Clase"}</button>
                  </div>

                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== MODAL ELIMINAR ===================== */}
        <AnimatePresence>
          {modal === "eliminar" && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
               <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar Clase</h3>
                  <p className="text-sm text-gray-500 mb-6">¿Estás seguro de que deseas eliminar esta clase? Esta acción no se puede deshacer.</p>
                  <div className="flex justify-center gap-3">
                    <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md">Sí, Eliminar</button>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== MODAL VER DETALLES ===================== */}
        <AnimatePresence>
          {modal === "ver" && selectedClase && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                 <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                 <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Detalles de la Clase</h3>
                 
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
                       <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Clase</p>
                          <p className="text-gray-800 font-medium">{selectedClase.descripcion}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Hash size={20} /></div>
                          <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Nivel</p>
                             <p className="text-gray-800">{selectedClase.nombre_nivel}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><MapPin size={20} /></div>
                          <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Sede</p>
                             <p className="text-gray-800">{selectedClase.nombre_sede}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Calendar size={20} /></div>
                          <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Horario</p>
                             <p className="text-gray-800 text-sm">{selectedClase.dia_semana}</p>
                             <p className="text-gray-600 text-xs">{selectedClase.hora_inicio?.substring(0,5)} - {selectedClase.hora_fin?.substring(0,5)}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg"><Users size={20} /></div>
                          <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Cupo</p>
                             <p className="text-gray-800">{selectedClase.cupo_maximo} personas</p>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-start gap-3">
                       <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><User size={20} /></div>
                       <div className="w-full">
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Instructores</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedClase.instructores?.map((inst, i) => (
                                <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                                   {inst.nombre_instructor}
                                </span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 flex justify-center">
                    <button onClick={closeModal} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">Cerrar</button>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </>
  );
};

export default Clases;