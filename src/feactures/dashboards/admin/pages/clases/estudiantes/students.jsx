import React, { useEffect, useState } from "react";


import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
  updateEstadoEstudiante,
  getUsuariosActivos,
  getAcudientes,
  createAcudiente
} from "../../services/estudiantesServices";

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [acudientes, setAcudientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  const [formData, setFormData] = useState({
    id_usuario: "",
    enfermedad: "",
    nivel_experiencia: "",
    edad: "",
    id_acudiente: "",
  });

  const [tieneEnfermedad, setTieneEnfermedad] = useState(false);
  const [crearAcudiente, setCrearAcudiente] = useState(false);
  const [nuevoAcudiente, setNuevoAcudiente] = useState({
    nombre_acudiente: "",
    telefono: "",
    email: "",
    relacion: ""
  });

  const [search, setSearch] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Cargar estudiantes y datos relacionados
  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);

      const [estudiantesData, usuariosData, acudientesData] = await Promise.all([
        getEstudiantes(),
        getUsuariosActivos(),
        getAcudientes()
      ]);

      setEstudiantes(Array.isArray(estudiantesData) ? estudiantesData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setAcudientes(Array.isArray(acudientesData) ? acudientesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en nuevo acudiente
  const handleNuevoAcudienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoAcudiente((prev) => ({ ...prev, [name]: value }));
  };

  // Crear estudiante
  const handleCreate = async () => {
    try {
      // Validaciones básicas
      if (!formData.id_usuario) {
        showNotification("El usuario es obligatorio", "error");
        return;
      }

      // Validar edad
      const edad = formData.edad ? parseInt(formData.edad) : null;
      if (edad && edad < 1) {
        showNotification("La edad debe ser mayor a 0", "error");
        return;
      }

      let id_acudiente_final = null;

      // Si es menor de edad, manejar acudiente
      if (edad && edad < 18) {
        if (crearAcudiente) {
          // Validar datos del nuevo acudiente
          if (!nuevoAcudiente.nombre_acudiente) {
            showNotification("El nombre del acudiente es obligatorio", "error");
            return;
          }
          // Crear nuevo acudiente
          const nuevoAcudienteCreado = await createAcudiente(nuevoAcudiente);
          id_acudiente_final = nuevoAcudienteCreado.id_acudiente;
        } else if (formData.id_acudiente) {
          // Usar acudiente existente
          id_acudiente_final = parseInt(formData.id_acudiente);
        }
        // Si es menor de edad pero no se especifica acudiente, mostrar error
        else if (!crearAcudiente && !formData.id_acudiente) {
          showNotification("Para estudiantes menores de edad se requiere un acudiente", "error");
          return;
        }
      }

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        enfermedad: tieneEnfermedad ? formData.enfermedad : "No aplica",
        nivel_experiencia: formData.nivel_experiencia || null,
        edad: edad,
        id_acudiente: id_acudiente_final
      };

      await createEstudiante(payload);
      await fetchEstudiantes();
      closeModal();
      showNotification("Estudiante creado con éxito");
    } catch (err) {
      console.error("Error creando estudiante:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando estudiante";
      showNotification(errorMessage, "error");
    }
  };

  // Editar estudiante - CORREGIDO PARA EDITAR TODOS LOS CAMPOS
  const handleEdit = async () => {
    try {
      if (!selectedEstudiante) return;

      // Validar edad
      const edad = formData.edad ? parseInt(formData.edad) : null;
      if (edad && edad < 1) {
        showNotification("La edad debe ser mayor a 0", "error");
        return;
      }

      let id_acudiente_final = null;

      // Si es menor de edad, manejar acudiente
      if (edad && edad < 18) {
        if (crearAcudiente) {
          // Validar datos del nuevo acudiente
          if (!nuevoAcudiente.nombre_acudiente) {
            showNotification("El nombre del acudiente es obligatorio", "error");
            return;
          }
          // Crear nuevo acudiente
          const nuevoAcudienteCreado = await createAcudiente(nuevoAcudiente);
          id_acudiente_final = nuevoAcudienteCreado.id_acudiente;
        } else if (formData.id_acudiente) {
          // Usar acudiente existente
          id_acudiente_final = parseInt(formData.id_acudiente);
        }
        // Si es menor de edad pero no se especifica acudiente, mostrar error
        else if (!crearAcudiente && !formData.id_acudiente) {
          showNotification("Para estudiantes menores de edad se requiere un acudiente", "error");
          return;
        }
      } else if (edad && edad >= 18) {
        // Si es mayor de edad, no debe tener acudiente
        id_acudiente_final = null;
      } else {
        // Si no se especifica edad, mantener el acudiente actual
        id_acudiente_final = formData.id_acudiente ? parseInt(formData.id_acudiente) : selectedEstudiante.id_acudiente;
      }

      const payload = {
        enfermedad: tieneEnfermedad ? formData.enfermedad : "No aplica",
        nivel_experiencia: formData.nivel_experiencia || null,
        edad: edad,
        id_acudiente: id_acudiente_final
      };

      await updateEstudiante(selectedEstudiante.id_estudiante, payload);
      await fetchEstudiantes();
      closeModal();
      showNotification("Estudiante actualizado con éxito");
    } catch (err) {
      console.error("Error editando estudiante:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando estudiante";
      showNotification(errorMessage, "error");
    }
  };

  // Eliminar estudiante
  const handleDelete = async () => {
    try {
      if (!selectedEstudiante) return;
      await deleteEstudiante(selectedEstudiante.id_estudiante);
      await fetchEstudiantes();
      closeModal();
      showNotification("Estudiante eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando estudiante:", err);
      const errorMessage = err.response?.data?.mensaje || "Error eliminando estudiante";
      showNotification(errorMessage, "error");
    }
  };

  // Actualizar estado del estudiante
  const handleActualizarEstado = async (estudiante, nuevoEstado) => {
    try {
      await updateEstadoEstudiante(estudiante.id_estudiante, nuevoEstado);
      await fetchEstudiantes();
      showNotification(`Estado actualizado a ${nuevoEstado}`);
    } catch (err) {
      console.error("Error actualizando estado:", err);
      const errorMessage = err.response?.data?.mensaje || "Error actualizando estado";
      showNotification(errorMessage, "error");
    }
  };

  // Abrir modal
  const openModal = (type, estudiante = null) => {
    setModal(type);
    setSelectedEstudiante(estudiante);
    setTieneEnfermedad(false);
    setCrearAcudiente(false);
    setNuevoAcudiente({
      nombre_acudiente: "",
      telefono: "",
      email: "",
      relacion: ""
    });

    if (estudiante && type === "editar") {
      // Establecer todos los campos para edición
      setFormData({
        id_usuario: estudiante.id_usuario.toString(), // Solo para referencia visual
        enfermedad: estudiante.enfermedad && estudiante.enfermedad !== "No aplica" ? estudiante.enfermedad : "",
        nivel_experiencia: estudiante.nivel_experiencia || "",
        edad: estudiante.edad ? estudiante.edad.toString() : "",
        id_acudiente: estudiante.id_acudiente ? estudiante.id_acudiente.toString() : "",
      });

      // Establecer estado de enfermedad
      if (estudiante.enfermedad && estudiante.enfermedad !== "No aplica") {
        setTieneEnfermedad(true);
      } else {
        setTieneEnfermedad(false);
      }

      // Establecer si se debe crear acudiente nuevo o usar existente
      if (estudiante.id_acudiente) {
        setCrearAcudiente(false);
      }
    } else if (!estudiante) {
      setFormData({
        id_usuario: "",
        enfermedad: "",
        nivel_experiencia: "",
        edad: "",
        id_acudiente: "",
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedEstudiante(null);
    setFormData({
      id_usuario: "",
      enfermedad: "",
      nivel_experiencia: "",
      edad: "",
      id_acudiente: "",
    });
    setTieneEnfermedad(false);
    setCrearAcudiente(false);
    setNuevoAcudiente({
      nombre_acudiente: "",
      telefono: "",
      email: "",
      relacion: ""
    });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Filtrado por búsqueda
  const estudiantesFiltrados = estudiantes.filter((e) =>
    (e.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.documento || "").includes(search) ||
    (e.estado || "").toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(estudiantesFiltrados.length / itemsPerPage));
  const currentItems = estudiantesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Estudiantes Gestión de Estudiantes</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar estudiantes (Nombre, Email, Documento, Estado)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar Nuevo Estudiante
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[15%]">Estudiante</th>
                    <th className="px-6 py-3 w-[15%]">Email</th>
                    <th className="px-6 py-3 w-[10%]">Edad</th>
                    <th className="px-6 py-3 w-[15%]">Nivel Experiencia</th>
                    <th className="px-6 py-3 w-[15%]">Acudiente</th>
                    <th className="px-6 py-3 w-[10%]">Estado</th>
                    <th className="px-6 py-3 w-[20%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Cargando estudiantes...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                        No se encontraron estudiantes.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((e) => (
                      <tr key={e.id_estudiante} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">
                          <div className="text-sm font-medium">{e.nombre_completo}</div>
                          <div className="text-xs text-gray-500">{e.documento}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{e.email}</td>
                        <td className="px-6 py-4 text-gray-600">{e.edad || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{e.nivel_experiencia || "—"}</td>
                        <td className="px-6 py-4">
                          {e.nombre_acudiente ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-800">{e.nombre_acudiente}</div>
                              <div className="text-gray-500 text-xs space-y-1">
                                <div>Relación: {e.relacion || "No especificada"}</div>
                                {e.telefono_acudiente && <div>Tel: {e.telefono_acudiente}</div>}
                                {e.email_acudiente && <div>Email: {e.email_acudiente}</div>}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic text-sm">
                              {e.edad && e.edad < 18 ? "Sin acudiente" : "No aplica"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={e.estado}
                            onChange={(event) => handleActualizarEstado(e, event.target.value)}
                            className={`text-xs font-medium rounded-full px-2 py-1 ${e.estado === 'Activo'
                                ? 'bg-green-100 text-green-800'
                                : e.estado === 'Pendiente'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            <option value="Activo">Activo</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Inactivo">Inactivo</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", e)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("editar", e)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("eliminar", e)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {estudiantesFiltrados.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Notificación Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-blue-600" : "bg-red-600"
                }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {modal && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">
                  {modal === "crear"
                    ? "Registrar Estudiante"
                    : modal === "editar"
                      ? "Editar Estudiante"
                      : modal === "ver"
                        ? "Detalles del Estudiante"
                        : "Eliminar Estudiante"}
                </h3>

                {modal === "crear" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuario *
                      </label>
                      <select
                        name="id_usuario"
                        value={formData.id_usuario}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Seleccionar usuario</option>
                        {usuarios.map(usuario => (
                          <option key={usuario.id_usuario} value={usuario.id_usuario}>
                            {usuario.nombre_completo} ({usuario.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input
                          type="number"
                          name="edad"
                          value={formData.edad}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: 16"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Experiencia</label>
                        <select
                          name="nivel_experiencia"
                          value={formData.nivel_experiencia}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Seleccionar nivel</option>
                          <option value="Principiante">Principiante</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Tiene enfermedad o condición médica?
                      </label>
                      <select
                        value={tieneEnfermedad ? "si" : "no"}
                        onChange={(e) => setTieneEnfermedad(e.target.value === "si")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                    </div>
                    {tieneEnfermedad && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enfermedad o Condición Médica
                        </label>
                        <textarea
                          name="enfermedad"
                          value={formData.enfermedad}
                          onChange={handleChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: Alergia a frutos secos, asma, etc."
                        />
                      </div>
                    )}
                    {formData.edad && parseInt(formData.edad) < 18 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Acudiente
                        </label>
                        <div className="border-b border-gray-200 mb-4">
                          <nav className="-mb-px flex space-x-8">
                            <button
                              type="button"
                              onClick={() => setCrearAcudiente(false)}
                              className={`py-2 px-1 text-sm font-medium ${!crearAcudiente
                                  ? 'border-b-2 border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              Acudiente existente
                            </button>
                            <button
                              type="button"
                              onClick={() => setCrearAcudiente(true)}
                              className={`py-2 px-1 text-sm font-medium ${crearAcudiente
                                  ? 'border-b-2 border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              Nuevo acudiente
                            </button>
                          </nav>
                        </div>

                        {!crearAcudiente ? (
                          <div>
                            <select
                              name="id_acudiente"
                              value={formData.id_acudiente}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                              <option value="">Seleccionar acudiente existente</option>
                              {acudientes.length > 0 ? (
                                acudientes.map(acudiente => (
                                  <option key={acudiente.id_acudiente} value={acudiente.id_acudiente}>
                                    {acudiente.nombre_acudiente} - {acudiente.relacion} {acudiente.telefono && `(${acudiente.telefono})`}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>No hay acudientes registrados</option>
                              )}
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                              Selecciona un acudiente de la lista existente
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre del acudiente *
                              </label>
                              <input
                                type="text"
                                name="nombre_acudiente"
                                value={nuevoAcudiente.nombre_acudiente}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Nombre completo del acudiente"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Relación con el estudiante
                              </label>
                              <select
                                name="relacion"
                                value={nuevoAcudiente.relacion}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              >
                                <option value="">Seleccionar relación</option>
                                <option value="Padre">Padre</option>
                                <option value="Madre">Madre</option>
                                <option value="Tutor">Tutor</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Teléfono (opcional)
                              </label>
                              <input
                                type="text"
                                name="telefono"
                                value={nuevoAcudiente.telefono}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Número de teléfono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email (opcional)
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={nuevoAcudiente.email}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="correo@ejemplo.com"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Completa los datos para registrar un nuevo acudiente
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Registrar
                      </button>
                    </div>
                  </form>
                )}

                {modal === "editar" && selectedEstudiante && (
                  <form className="space-y-4">
                    {/* Usuario (solo para visualización, no editable) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuario
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                        {selectedEstudiante.nombre_completo} ({selectedEstudiante.email})
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input
                          type="number"
                          name="edad"
                          value={formData.edad}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: 16"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Experiencia</label>
                        <select
                          name="nivel_experiencia"
                          value={formData.nivel_experiencia}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Seleccionar nivel</option>
                          <option value="Principiante">Principiante</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Tiene enfermedad o condición médica?
                      </label>
                      <select
                        value={tieneEnfermedad ? "si" : "no"}
                        onChange={(e) => setTieneEnfermedad(e.target.value === "si")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                    </div>
                    {tieneEnfermedad && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enfermedad o Condición Médica
                        </label>
                        <textarea
                          name="enfermedad"
                          value={formData.enfermedad}
                          onChange={handleChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: Alergia a frutos secos, asma, etc."
                        />
                      </div>
                    )}
                    {formData.edad && parseInt(formData.edad) < 18 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Acudiente
                        </label>
                        <div className="border-b border-gray-200 mb-4">
                          <nav className="-mb-px flex space-x-8">
                            <button
                              type="button"
                              onClick={() => setCrearAcudiente(false)}
                              className={`py-2 px-1 text-sm font-medium ${!crearAcudiente
                                  ? 'border-b-2 border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              Acudiente existente
                            </button>
                            <button
                              type="button"
                              onClick={() => setCrearAcudiente(true)}
                              className={`py-2 px-1 text-sm font-medium ${crearAcudiente
                                  ? 'border-b-2 border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              Nuevo acudiente
                            </button>
                          </nav>
                        </div>

                        {!crearAcudiente ? (
                          <div>
                            <select
                              name="id_acudiente"
                              value={formData.id_acudiente}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                              <option value="">Seleccionar acudiente existente</option>
                              {acudientes.length > 0 ? (
                                acudientes.map(acudiente => (
                                  <option key={acudiente.id_acudiente} value={acudiente.id_acudiente}>
                                    {acudiente.nombre_acudiente} - {acudiente.relacion} {acudiente.telefono && `(${acudiente.telefono})`}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>No hay acudientes registrados</option>
                              )}
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                              Selecciona un acudiente de la lista existente
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre del acudiente *
                              </label>
                              <input
                                type="text"
                                name="nombre_acudiente"
                                value={nuevoAcudiente.nombre_acudiente}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Nombre completo del acudiente"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Relación con el estudiante
                              </label>
                              <select
                                name="relacion"
                                value={nuevoAcudiente.relacion}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              >
                                <option value="">Seleccionar relación</option>
                                <option value="Padre">Padre</option>
                                <option value="Madre">Madre</option>
                                <option value="Tutor">Tutor</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Teléfono (opcional)
                              </label>
                              <input
                                type="text"
                                name="telefono"
                                value={nuevoAcudiente.telefono}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Número de teléfono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email (opcional)
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={nuevoAcudiente.email}
                                onChange={handleNuevoAcudienteChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="correo@ejemplo.com"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Completa los datos para registrar un nuevo acudiente
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Para estudiantes mayores de edad, opción de eliminar acudiente */}
                    {formData.edad && parseInt(formData.edad) >= 18 && selectedEstudiante.id_acudiente && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Atención:</strong> El estudiante ahora es mayor de edad.
                          ¿Desea eliminar el acudiente asociado?
                        </p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, id_acudiente: "" })}
                          className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300"
                        >
                          Eliminar acudiente
                        </button>
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                )}

                {modal === "ver" && selectedEstudiante && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre Completo:</span>
                      <span className="text-right">{selectedEstudiante.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-right">{selectedEstudiante.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Documento:</span>
                      <span className="text-right">{selectedEstudiante.documento || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span className="text-right">{selectedEstudiante.telefono || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Edad:</span>
                      <span className="text-right">{selectedEstudiante.edad || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Nivel Experiencia:</span>
                      <span className="text-right">{selectedEstudiante.nivel_experiencia || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Enfermedad:</span>
                      <span className="text-right">{selectedEstudiante.enfermedad || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha Preinscripción:</span>
                      <span className="text-right">{formatDate(selectedEstudiante.fecha_preinscripcion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Acudiente:</span>
                      <div className="text-right">
                        {selectedEstudiante.nombre_acudiente ? (
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-gray-800">{selectedEstudiante.nombre_acudiente}</div>
                            <div className="text-gray-600">
                              Relación: {selectedEstudiante.relacion || "No especificada"}
                            </div>
                            {selectedEstudiante.telefono_acudiente && (
                              <div>Teléfono: {selectedEstudiante.telefono_acudiente}</div>
                            )}
                            {selectedEstudiante.email_acudiente && (
                              <div>Email: {selectedEstudiante.email_acudiente}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">
                            {selectedEstudiante.edad && selectedEstudiante.edad < 18
                              ? "Sin acudiente asignado"
                              : "No aplica (mayor de edad)"
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className={`font-medium ${selectedEstudiante.estado === 'Activo'
                          ? 'text-green-600'
                          : selectedEstudiante.estado === 'Pendiente'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                        {selectedEstudiante.estado}
                      </span>
                    </div>
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}

                {modal === "eliminar" && selectedEstudiante && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar al estudiante{" "}
                      <span className="font-bold text-red-600">{selectedEstudiante.nombre_completo}</span>?
                      <br />
                      <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Estudiantes;