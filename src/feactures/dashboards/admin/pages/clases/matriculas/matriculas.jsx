import React, { useEffect, useState, useCallback } from "react";
import { Eye, Edit, Trash2, Search, Plus, X, ChevronLeft, ChevronRight, Hash, User, Calendar, BookOpen, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMatriculas,
  deleteMatricula,
  updateMatricula,
  createMatricula
} from "../../services/matriculaService";
import api from "../../../../../../services/api";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MatriculasAdmin = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "details" | "delete" | "editar" | "nueva"
  const [selectedMatricula, setSelectedMatricula] = useState(null);

  // Datos para formularios
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [usuariosElegibles, setUsuariosElegibles] = useState([]);

  // Estado de formulario "Nueva Matrícula"
  const [modoMatricula, setModoMatricula] = useState('existente'); // "existente" | "nuevo"
  const [formNueva, setFormNueva] = useState({
    id_estudiante: "",
    id_usuario: "",
    id_clase: "",
    id_plan: "",
    nivel_experiencia: "",
    enfermedad: "",
    edad: "",
    acudienteNombre: "",
    acudienteTelefono: "",
    acudienteEmail: ""
  });

  // Estado de edición
  const [formEdit, setFormEdit] = useState({ id_clase: "", id_plan: "", estado: "" });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  const fetchMatriculas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMatriculas();
      // Agrupar por estudiante si se desea maestro-detalle, pero para el CRUD plano lo mostraremos por fila
      // El código original agrupaba pero la tabla mostraba matriculaPrincipal. 
      // Para este refactor mantendremos el listado de matrículas individuales para mayor claridad CRUD.
      setMatriculas(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar matrículas:", err);
      setError("Error al cargar las matrículas.");
      showNotification("Error al cargar matrículas", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchCatalogos = useCallback(async () => {
    try {
      const [clasesData, planesData, estudiantesData, usuariosElegiblesData] = await Promise.all([
        api.get("/clases").then(r => r.data),
        api.get("/planes").then(r => r.data),
        api.get("/estudiantes").then(r => r.data),
        api.get("/usuarios/elegibles-para-estudiante").then(r => r.data)
      ]);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setUsuariosElegibles(Array.isArray(usuariosElegiblesData) ? usuariosElegiblesData : []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  }, []);

  useEffect(() => {
    fetchMatriculas();
    fetchCatalogos();
  }, [fetchMatriculas, fetchCatalogos]);

  const openModal = (type, item = null) => {
    setModal(type);
    setSelectedMatricula(item);
    if (type === 'editar' && item) {
      setFormEdit({
        id_clase: item.id_clase,
        id_plan: item.id_plan,
        estado: item.estado
      });
    } else {
      setFormNueva({
        id_estudiante: "", id_usuario: "", id_clase: "", id_plan: "",
        nivel_experiencia: "", enfermedad: "", edad: "",
        acudienteNombre: "", acudienteTelefono: "", acudienteEmail: ""
      });
      setModoMatricula('existente');
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedMatricula(null);
  };

  const handleCreate = async () => {
    try {
      if (modoMatricula === 'existente') {
        if (!formNueva.id_estudiante || !formNueva.id_clase || !formNueva.id_plan) {
          showNotification("Completa todos los campos obligatorios", "error");
          return;
        }
        await createMatricula({
          id_estudiante: parseInt(formNueva.id_estudiante),
          id_clase: parseInt(formNueva.id_clase),
          id_plan: parseInt(formNueva.id_plan)
        });
      } else {
        if (!formNueva.id_usuario || !formNueva.id_clase || !formNueva.id_plan) {
          showNotification("Completa todos los campos obligatorios", "error");
          return;
        }
        await api.post("/matriculas/manual", {
          id_usuario: parseInt(formNueva.id_usuario),
          enfermedad: formNueva.enfermedad || "No aplica",
          nivel_experiencia: formNueva.nivel_experiencia || "Principiante",
          edad: formNueva.edad ? parseInt(formNueva.edad) : null,
          id_clase: parseInt(formNueva.id_clase),
          id_plan: parseInt(formNueva.id_plan)
        });
      }
      showNotification("Matrícula creada con éxito");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al crear matrícula";
      showNotification(msg, "error");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMatricula(selectedMatricula.id_matricula, formEdit);
      showNotification("Matrícula actualizada");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      showNotification("Error al actualizar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMatricula(selectedMatricula.id_matricula);
      showNotification("Matrícula eliminada");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      showNotification("Error al eliminar", "error");
    }
  };

  const filtered = matriculas.filter(m =>
    (m.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.documento || "").includes(search) ||
    (m.nombre_plan || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Search Area */}
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Clases / Matrículas
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                <span className="text-xs font-bold">{filtered.length} inscripciones</span>
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
              placeholder="Buscar por estudiante, documento o plan..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => openModal("nueva")}
            className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />
            Nueva Matrícula
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
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Clase / Nivel</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm italic">Cargando matrículas...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">No se encontraron matrículas</td></tr>
                ) : (
                  currentItems.map((m) => (
                    <tr key={m.id_matricula} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] font-bold text-xs shadow-sm">
                            {(m.nombre_completo || "ST").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#040529] text-sm leading-tight">{m.nombre_completo}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{m.documento}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#040529]">{m.nombre_nivel}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.dia_semana} {m.hora_inicio}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          {m.nombre_plan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold border transition-colors capitalize",
                          m.estado === 'Activa' ? 'bg-green-50 text-green-600 border-green-200' :
                            m.estado === 'Vencida' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-red-50 text-red-600 border-red-200'
                        )}>
                          {m.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal("details", m)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                            title="Ver Detalle"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal("editar", m)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openModal("delete", m)}
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

      {/* Notification Toast */}
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
              className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modal === 'delete' ? 'max-w-sm w-full' : 'max-w-2xl w-full'}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#040529]">
                    {modal === 'nueva' ? 'Nueva Matrícula' :
                      modal === 'editar' ? 'Editar Matrícula' :
                        modal === 'delete' ? 'Eliminar Matrícula' : 'Detalles de Inscripción'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]">
                    <X size={20} />
                  </button>
                </div>

                {modal === 'delete' ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-6 italic">¿Estás seguro de eliminar la matrícula de <span className="font-bold text-red-600">{selectedMatricula?.nombre_completo}</span>?</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Eliminar</button>
                    </div>
                  </div>
                ) : modal === 'details' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pasajero / Estudiante</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_completo}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Documento</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.documento}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clase Asignada</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_nivel}</p>
                        <p className="text-xs text-slate-500">{selectedMatricula?.dia_semana} {selectedMatricula?.hora_inicio}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Plan Contratado</label>
                        <p className="text-sm font-bold text-[#040529]">{selectedMatricula?.nombre_plan}</p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button onClick={closeModal} className="px-6 py-2 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-md transition hover:bg-[#040529]/90">Cerrar</button>
                    </div>
                  </div>
                ) : modal === 'editar' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clase</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                        value={formEdit.id_clase}
                        onChange={(e) => setFormEdit({ ...formEdit, id_clase: e.target.value })}
                      >
                        {clases.map(c => <option key={c.id_clase} value={c.id_clase}>{c.nombre_nivel} - {c.dia_semana} {c.hora_inicio}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Plan</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                        value={formEdit.id_plan}
                        onChange={(e) => setFormEdit({ ...formEdit, id_plan: e.target.value })}
                      >
                        {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estado</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white"
                        value={formEdit.estado}
                        onChange={(e) => setFormEdit({ ...formEdit, estado: e.target.value })}
                      >
                        <option value="Activa">Activa</option>
                        <option value="Vencida">Vencida</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                    <button onClick={handleUpdate} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition mt-4">
                      Actualizar Matrícula
                    </button>
                  </div>
                ) : (
                  // Modal Nueva Matrícula
                  <div className="space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                      <button
                        onClick={() => setModoMatricula('existente')}
                        className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition", modoMatricula === 'existente' ? "bg-white text-[#040529] shadow-sm" : "text-slate-500")}
                      >
                        Estudiante Existente
                      </button>
                      <button
                        onClick={() => setModoMatricula('nuevo')}
                        className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition", modoMatricula === 'nuevo' ? "bg-white text-[#040529] shadow-sm" : "text-slate-500")}
                      >
                        Vincular Nuevo Usuario
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                      {modoMatricula === 'existente' ? (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Seleccionar Estudiante *</label>
                          <select
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white font-bold text-[#040529]"
                            value={formNueva.id_estudiante}
                            onChange={(e) => setFormNueva({ ...formNueva, id_estudiante: e.target.value })}
                          >
                            <option value="">Selecciona...</option>
                            {estudiantes.map(e => <option key={e.id_estudiante} value={e.id_estudiante}>{e.nombre_completo} ({e.documento})</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vincular Usuario *</label>
                            <select
                              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none bg-white font-bold text-[#040529]"
                              value={formNueva.id_usuario}
                              onChange={(e) => setFormNueva({ ...formNueva, id_usuario: e.target.value })}
                            >
                              <option value="">Usuario sin perfil estudiante...</option>
                              {usuariosElegibles.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.documento})</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Experiencia</label>
                              <select
                                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                                value={formNueva.nivel_experiencia}
                                onChange={(e) => setFormNueva({ ...formNueva, nivel_experiencia: e.target.value })}
                              >
                                <option value="Principiante">Principiante</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Edad</label>
                              <input
                                type="number"
                                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none"
                                value={formNueva.edad}
                                onChange={(e) => setFormNueva({ ...formNueva, edad: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clase / Jornada *</label>
                          <select
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
                            value={formNueva.id_clase}
                            onChange={(e) => setFormNueva({ ...formNueva, id_clase: e.target.value })}
                          >
                            <option value="">Selecciona clase...</option>
                            {clases.map(c => <option key={c.id_clase} value={c.id_clase}>{c.nombre_nivel} - {c.dia_semana} {c.hora_inicio}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Plan *</label>
                          <select
                            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
                            value={formNueva.id_plan}
                            onChange={(e) => setFormNueva({ ...formNueva, id_plan: e.target.value })}
                          >
                            <option value="">Selecciona plan...</option>
                            {planes.map(p => <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button onClick={handleCreate} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition mt-4">
                      {modoMatricula === 'existente' ? 'Generar Matrícula' : 'Crear Perfil y Matrícula'}
                    </button>
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

export default MatriculasAdmin;