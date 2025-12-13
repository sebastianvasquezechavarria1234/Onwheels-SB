// src/features/dashboards/admin/pages/clases/matriculas/MatriculasAdmin.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Edit, Trash2, Search, Plus, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMatriculas,
  deleteMatricula,
  updateMatricula,
  createMatricula
} from "../../services/matriculaService";
import axios from "axios";

const MatriculasAdmin = () => {
  const [matriculas, setMatriculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [modal, setModal] = useState(null); // "details" | "delete" | "editar" | "nuevaClase"
  
  // Para el modal de nueva matrícula
  const [modoMatricula, setModoMatricula] = useState('existente');
  const [estudiantes, setEstudiantes] = useState([]);
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [claseSeleccionada, setClaseSeleccionada] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  
  // Para nuevo estudiante
  const [usuariosElegibles, setUsuariosElegibles] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [fechaNacimiento, setFechaNacimiento] = useState("2000-01-01");
  const [edad, setEdad] = useState("");
  const [nivelExperiencia, setNivelExperiencia] = useState("");
  const [enfermedad, setEnfermedad] = useState("");
  const [acudienteNombre, setAcudienteNombre] = useState("");
  const [acudienteTelefono, setAcudienteTelefono] = useState("");
  const [acudienteEmail, setAcudienteEmail] = useState("");
  
  // Para editar
  const [claseEditada, setClaseEditada] = useState("");
  const [planEditado, setPlanEditado] = useState("");
  const [estadoEditado, setEstadoEditado] = useState("");
  
  // Para maestro-detalle
  const [expandedEstudiante, setExpandedEstudiante] = useState(null);
  
  // Confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [matriculaToDelete, setMatriculaToDelete] = useState(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchMatriculas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMatriculas();
      const estudiantesMap = new Map();
      data.forEach(m => {
        if (!estudiantesMap.has(m.id_estudiante)) {
          estudiantesMap.set(m.id_estudiante, {
            id_estudiante: m.id_estudiante,
            nombre_completo: m.nombre_completo,
            documento: m.documento,
            email: m.email,
            telefono: m.telefono,
            matriculas: []
          });
        }
        estudiantesMap.get(m.id_estudiante).matriculas.push(m);
      });
      const estudiantesConMatriculas = Array.from(estudiantesMap.values())
        .map(est => {
          est.matriculas.sort((a, b) => new Date(b.fecha_matricula) - new Date(a.fecha_matricula));
          return {
            ...est,
            matriculaPrincipal: est.matriculas[0]
          };
        })
        .sort((a, b) => new Date(b.matriculaPrincipal.fecha_matricula) - new Date(a.matriculaPrincipal.fecha_matricula));
      setMatriculas(estudiantesConMatriculas);
      setError(null);
    } catch (err) {
      console.error("Error al cargar matrículas:", err);
      setError("Error al cargar las matrículas.");
      showNotification("Error al cargar matrículas", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDatosParaClase = useCallback(async () => {
    try {
      const [clasesData, planesData, estudiantesData, usuariosElegiblesData] = await Promise.all([
        axios.get("http://localhost:3000/api/clases").then(r => r.data),
        axios.get("http://localhost:3000/api/planes").then(r => r.data),
        axios.get("http://localhost:3000/api/estudiantes").then(r => r.data),
        axios.get("http://localhost:3000/api/usuarios/elegibles-para-estudiante").then(r => r.data)
      ]);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setUsuariosElegibles(Array.isArray(usuariosElegiblesData) ? usuariosElegiblesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al cargar datos", "error");
    }
  }, []);

  const toggleExpand = (id_estudiante) => {
    setExpandedEstudiante(expandedEstudiante === id_estudiante ? null : id_estudiante);
  };

  useEffect(() => {
    fetchMatriculas();
    fetchDatosParaClase();
  }, [fetchMatriculas]);

  const closeModal = () => {
    setModal(null);
    setModoMatricula('existente');
    setEstudianteSeleccionado("");
    setUsuarioSeleccionado("");
    setNombreCompleto("");
    setEmail("");
    setTelefono("");
    setDocumento("");
    setTipoDocumento("CC");
    setFechaNacimiento("2000-01-01");
    setEdad("");
    setNivelExperiencia("");
    setEnfermedad("");
    setAcudienteNombre("");
    setAcudienteTelefono("");
    setAcudienteEmail("");
    setClaseSeleccionada("");
    setPlanSeleccionado("");
    setSelectedMatricula(null);
    setClaseEditada("");
    setPlanEditado("");
    setEstadoEditado("");
    setConfirmDelete(false);
    setMatriculaToDelete(null);
  };

  const handleDelete = async (matriculaId) => {
    try {
      await deleteMatricula(matriculaId);
      await fetchMatriculas();
      showNotification("Matrícula eliminada correctamente");
      closeModal();
    } catch (err) {
      console.error("Error al eliminar matrícula:", err);
      showNotification("Error al eliminar matrícula", "error");
    }
  };

  const confirmDeleteMatricula = (matricula) => {
    setMatriculaToDelete(matricula);
    setConfirmDelete(true);
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setMatriculaToDelete(null);
  };

  const handleUpdate = async () => {
    if (selectedMatricula?.estado !== 'Activa') {
      showNotification("Solo se pueden editar matrículas activas", "error");
      return;
    }
    try {
      await updateMatricula(selectedMatricula.id_matricula, {
        id_clase: claseEditada || selectedMatricula.id_clase,
        id_plan: planEditado || selectedMatricula.id_plan,
        estado: estadoEditado || selectedMatricula.estado
      });
      await fetchMatriculas();
      showNotification("Matrícula actualizada correctamente");
      closeModal();
    } catch (err) {
      console.error("Error al actualizar matrícula:", err);
      showNotification("Error al actualizar matrícula", "error");
    }
  };

  const handleAsignarNuevaClase = async () => {
    try {
      if (!estudianteSeleccionado || !claseSeleccionada || !planSeleccionado) {
        showNotification("Selecciona estudiante, clase y plan", "error");
        return;
      }
      const matriculaActiva = estudiantes
        .filter(e => e.id_estudiante === parseInt(estudianteSeleccionado))
        .some(e => e.tiene_matricula_activa);
      if (matriculaActiva) {
        showNotification("El estudiante ya tiene una matrícula activa.", "error");
        return;
      }
      await createMatricula({
        id_estudiante: parseInt(estudianteSeleccionado),
        id_clase: parseInt(claseSeleccionada),
        id_plan: parseInt(planSeleccionado)
      });
      showNotification("Nueva clase asignada correctamente");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      console.error("Error asignando nueva clase:", err);
      const mensaje = err.response?.data?.mensaje || "Error al asignar nueva clase";
      showNotification(mensaje, "error");
    }
  };

  const handleCrearParaUsuarioExistente = async () => {
    try {
      if (!usuarioSeleccionado || !claseSeleccionada || !planSeleccionado) {
        showNotification("Selecciona usuario, clase y plan", "error");
        return;
      }

      await axios.post("http://localhost:3000/api/matriculas/manual", {
        id_usuario: parseInt(usuarioSeleccionado),
        enfermedad: enfermedad || null,
        nivel_experiencia: nivelExperiencia || null,
        edad: edad ? parseInt(edad) : null,
        id_clase: parseInt(claseSeleccionada),
        id_plan: parseInt(planSeleccionado)
      });

      showNotification("Matrícula creada correctamente");
      fetchMatriculas();
      closeModal();
    } catch (err) {
      console.error("Error creando matrícula manual:", err);
      let mensaje = "Error al crear matrícula";
      if (err.response?.status === 409) {
        mensaje = "El usuario ya está registrado como estudiante.";
      } else if (err.response?.data?.mensaje) {
        mensaje = err.response.data.mensaje;
      }
      showNotification(mensaje, "error");
    }
  };

  const matriculasFiltradas = matriculas.filter(est =>
    (est.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (est.documento || "").includes(search) ||
    (est.matriculaPrincipal?.nombre_plan || "").toLowerCase().includes(search.toLowerCase()) ||
    (est.matriculaPrincipal?.nombre_nivel || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(matriculasFiltradas.length / itemsPerPage));
  const currentItems = matriculasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleEdadChange = (e) => {
    const value = e.target.value;
    setEdad(value);
    if (value && parseInt(value) >= 18) {
      setAcudienteNombre("");
      setAcudienteTelefono("");
      setAcudienteEmail("");
    }
  };

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Matrículas</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar matrículas (Estudiante, Documento, Plan, Nivel)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => setModal("nuevaClase")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Nueva Matrícula
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Estudiante</th>
                    <th className="px-6 py-3">Documento</th>
                    <th className="px-6 py-3">Clase</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
                  ) : error ? (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-red-600">{error}</td></tr>
                  ) : currentItems.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No hay matrículas.</td></tr>
                  ) : (
                    currentItems.map(est => {
                      const matriculaPrincipal = est.matriculaPrincipal;
                      return (
                        <React.Fragment key={est.id_estudiante}>
                          <tr className="border-b hover:bg-gray-50 transition bg-blue-50">
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleExpand(est.id_estudiante)}
                                  className="text-gray-600 hover:text-gray-900 w-6 h-6 flex items-center justify-center"
                                  title="Ver historial"
                                >
                                  {expandedEstudiante === est.id_estudiante ? '▲' : '▼'}
                                </button>
                                {est.nombre_completo}
                              </div>
                            </td>
                            <td className="px-6 py-4">{est.documento}</td>
                            <td className="px-6 py-4">{matriculaPrincipal.nombre_nivel} - {matriculaPrincipal.dia_semana} {matriculaPrincipal.hora_inicio}</td>
                            <td className="px-6 py-4">{matriculaPrincipal.nombre_plan}</td>
                            <td className="px-6 py-4">
                              {new Date(matriculaPrincipal.fecha_matricula).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                matriculaPrincipal.estado === 'Activa' 
                                  ? 'bg-green-100 text-green-800' 
                                  : matriculaPrincipal.estado === 'Vencida'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {matriculaPrincipal.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {/* ✅ Ver detalles: siempre */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedMatricula(matriculaPrincipal);
                                    setModal("details");
                                  }}
                                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                                  title="Ver detalles"
                                >
                                  <Eye size={16} />
                                </motion.button>

                                {/* ✅ Editar: solo si activa */}
                                {matriculaPrincipal.estado === 'Activa' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setSelectedMatricula(matriculaPrincipal);
                                      setModal("editar");
                                    }}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                                    title="Editar matrícula"
                                  >
                                    <Edit size={16} />
                                  </motion.button>
                                )}

                                {/* ✅ Eliminar: siempre */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedMatricula(matriculaPrincipal);
                                    setModal("delete");
                                  }}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                  title="Eliminar matrícula"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </tr>
                          {expandedEstudiante === est.id_estudiante && est.matriculas.length > 1 && (
                            <tr className="bg-gray-50">
                              <td colSpan="7" className="px-6 py-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-gray-700 text-sm mb-2">Historial de matrículas:</h4>
                                  {est.matriculas.slice(1).map(m => (
                                    <div key={m.id_matricula} className="flex items-center justify-between text-sm text-gray-600 p-2 bg-white rounded border">
                                      <div className="flex-1">
                                        <div className="font-medium">{m.nombre_nivel} - {m.nombre_plan}</div>
                                        <div className="text-xs text-gray-500">{new Date(m.fecha_matricula).toLocaleDateString('es-ES')}</div>
                                      </div>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        m.estado === 'Activa' 
                                          ? 'bg-green-100 text-green-800' 
                                          : m.estado === 'Vencida'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {m.estado}
                                      </span>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => confirmDeleteMatricula(m)}
                                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                                        title="Eliminar esta matrícula"
                                      >
                                        <Trash2 size={14} />
                                      </motion.button>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {matriculasFiltradas.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        {/* Notificación */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${
                notification.type === "success" ? "bg-blue-600" : "bg-red-600"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Modales */}
        <AnimatePresence>
          {modal === "details" && selectedMatricula && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Eye size={20} />
                  Detalles de la Matrícula
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Estudiante</label>
                      <p className="mt-1 font-medium">{selectedMatricula.nombre_completo}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Documento</label>
                      <p className="mt-1 font-medium">{selectedMatricula.documento}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Clase</label>
                      <p className="mt-1 font-medium">{selectedMatricula.nombre_nivel} ({selectedMatricula.dia_semana} {selectedMatricula.hora_inicio})</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Plan</label>
                      <p className="mt-1 font-medium">{selectedMatricula.nombre_plan}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Fecha de matrícula</label>
                      <p className="mt-1 font-medium">{new Date(selectedMatricula.fecha_matricula).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Estado</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        selectedMatricula.estado === 'Activa' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedMatricula.estado === 'Vencida'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedMatricula.estado}
                      </span>
                    </div>
                  </div>
                  {selectedMatricula.clases_restantes !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Clases restantes</label>
                      <p className="mt-1 font-medium">{selectedMatricula.clases_restantes ?? 'N/A'}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-3 pt-4">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">Cerrar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {modal === "editar" && selectedMatricula && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Edit size={20} />
                  Editar Matrícula
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clase</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={claseEditada || selectedMatricula.id_clase}
                      onChange={(e) => setClaseEditada(e.target.value)}
                    >
                      {clases.map(clase => (
                        <option key={clase.id_clase} value={clase.id_clase}>
                          {clase.nombre_nivel} - {clase.dia_semana} {clase.hora_inicio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={planEditado || selectedMatricula.id_plan}
                      onChange={(e) => setPlanEditado(e.target.value)}
                    >
                      {planes.map(plan => (
                        <option key={plan.id_plan} value={plan.id_plan}>
                          {plan.nombre_plan} - ${plan.precio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={estadoEditado || selectedMatricula.estado}
                      onChange={(e) => setEstadoEditado(e.target.value)}
                    >
                      <option value="Activa">Activa</option>
                      <option value="Vencida">Vencida</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-center gap-3 pt-4">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                  <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar cambios</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {modal === "delete" && selectedMatricula && !confirmDelete && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar matrícula?</h3>
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de eliminar la matrícula de <strong>{selectedMatricula.nombre_completo}</strong>?
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                  <button onClick={() => confirmDeleteMatricula(selectedMatricula)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {confirmDelete && matriculaToDelete && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmar eliminación</h3>
                <p className="text-gray-600 mb-4">
                  Esta acción eliminará la matrícula permanentemente. ¿Confirmas?
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 rounded-lg">Volver</button>
                  <button onClick={() => handleDelete(matriculaToDelete.id_matricula)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Sí, eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {modal === "nuevaClase" && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <Eye size={20} />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Nueva Matrícula</h3>
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      modoMatricula === 'existente' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setModoMatricula('existente')}
                  >
                    Estudiante existente
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      modoMatricula === 'nuevo' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setModoMatricula('nuevo')}
                  >
                    Nuevo estudiante
                  </button>
                </div>
                {modoMatricula === 'existente' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={estudianteSeleccionado}
                        onChange={(e) => setEstudianteSeleccionado(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar estudiante</option>
                        {estudiantes.filter(est => !est.tiene_matricula_activa).map(est => (
                          <option key={est.id_estudiante} value={est.id_estudiante}>
                            {est.nombre_completo} - {est.documento}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clase</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={claseSeleccionada}
                        onChange={(e) => setClaseSeleccionada(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar clase</option>
                        {clases.map(clase => (
                          <option key={clase.id_clase} value={clase.id_clase}>
                            {clase.nombre_nivel} - {clase.dia_semana} {clase.hora_inicio} ({clase.nombre_sede})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={planSeleccionado}
                        onChange={(e) => setPlanSeleccionado(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar plan</option>
                        {planes.map(plan => (
                          <option key={plan.id_plan} value={plan.id_plan}>
                            {plan.nombre_plan} - ${plan.precio}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Usuario *</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={usuarioSeleccionado}
                        onChange={(e) => {
                          setUsuarioSeleccionado(e.target.value);
                          const usuario = usuariosElegibles.find(u => u.id_usuario === parseInt(e.target.value));
                          if (usuario) {
                            setNombreCompleto(usuario.nombre_completo);
                            setEmail(usuario.email);
                            setTelefono(usuario.telefono);
                            setDocumento(usuario.documento);
                            setTipoDocumento(usuario.tipo_documento);
                            setFechaNacimiento(usuario.fecha_nacimiento || "2000-01-01");
                          }
                        }}
                        required
                      >
                        <option value="">Seleccionar usuario</option>
                        {usuariosElegibles.map(u => (
                          <option key={u.id_usuario} value={u.id_usuario}>
                            {u.nombre_completo} - {u.documento}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={nivelExperiencia}
                        onChange={(e) => setNivelExperiencia(e.target.value)}
                      >
                        <option value="">Nivel de experiencia</option>
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Enfermedad (opcional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={enfermedad}
                        onChange={(e) => setEnfermedad(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Edad"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={edad}
                        onChange={handleEdadChange}
                      />
                    </div>
                    {edad && parseInt(edad) < 18 && (
                      <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 text-sm">Información del Acudiente (Menor de edad)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Nombre del acudiente *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={acudienteNombre}
                            onChange={(e) => setAcudienteNombre(e.target.value)}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Teléfono del acudiente *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={acudienteTelefono}
                            onChange={(e) => setAcudienteTelefono(e.target.value)}
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email del acudiente"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={acudienteEmail}
                            onChange={(e) => setAcudienteEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clase</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={claseSeleccionada}
                        onChange={(e) => setClaseSeleccionada(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar clase</option>
                        {clases.map(clase => (
                          <option key={clase.id_clase} value={clase.id_clase}>
                            {clase.nombre_nivel} - {clase.dia_semana} {clase.hora_inicio} ({clase.nombre_sede})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={planSeleccionado}
                        onChange={(e) => setPlanSeleccionado(e.target.value)}
                        required
                      >
                        <option value="">Seleccionar plan</option>
                        {planes.map(plan => (
                          <option key={plan.id_plan} value={plan.id_plan}>
                            {plan.nombre_plan} - ${plan.precio}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <div className="flex justify-center gap-3 pt-4">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                  <button 
                    onClick={modoMatricula === 'existente' ? handleAsignarNuevaClase : handleCrearParaUsuarioExistente}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear Matrícula
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default MatriculasAdmin;