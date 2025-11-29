import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence,motion } from "framer-motion"; 
import {
  getInstructores,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getUsuariosNoInstructores
} from "../../services/instructoresServices";

export const Instructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: "",
    anios_experiencia: "",
    especialidad: ""
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

  // Cargar instructores y usuarios disponibles
  const fetchInstructores = useCallback(async () => {
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
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructores();
  }, [fetchInstructores]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Crear instructor
  const handleCreate = async () => {
    try {
      if (!formData.id_usuario) {
        showNotification("El usuario es obligatorio", "error");
        return;
      }

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        anios_experiencia: formData.anios_experiencia ? parseInt(formData.anios_experiencia) : null,
        especialidad: formData.especialidad || null
      };

      await createInstructor(payload);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor creado con éxito");
    } catch (err) {
      console.error("Error creando instructor:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando instructor";
      showNotification(errorMessage, "error");
    }
  };

  // Editar instructor
  const handleEdit = async () => {
    try {
      if (!selectedInstructor) return;

      const payload = {
        id_usuario: parseInt(formData.id_usuario),
        anios_experiencia: formData.anios_experiencia ? parseInt(formData.anios_experiencia) : null,
        especialidad: formData.especialidad || null
      };

      await updateInstructor(selectedInstructor.id_instructor, payload);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor actualizado con éxito");
    } catch (err) {
      console.error("Error editando instructor:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando instructor";
      showNotification(errorMessage, "error");
    }
  };

  // Desactivar instructor
  const handleDelete = async () => {
    try {
      if (!selectedInstructor) return;
      await deleteInstructor(selectedInstructor.id_instructor);
      await fetchInstructores();
      closeModal();
      showNotification("Instructor desactivado con éxito");
    } catch (err) {
      console.error("Error desactivando instructor:", err);
      const errorMessage = err.response?.data?.mensaje || "Error desactivando instructor";
      showNotification(errorMessage, "error");
    }
  };

  // Abrir modal
  const openModal = (type, instructor = null) => {
    setModal(type);
    setSelectedInstructor(instructor);

    if (type === "crear") {
      setFormData({
        id_usuario: "",
        anios_experiencia: "",
        especialidad: ""
      });
    } else if (instructor) {
      setFormData({
        id_usuario: instructor.id_usuario.toString(),
        anios_experiencia: instructor.anios_experiencia ? instructor.anios_experiencia.toString() : "",
        especialidad: instructor.especialidad || ""
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedInstructor(null);
    setFormData({
      id_usuario: "",
      anios_experiencia: "",
      especialidad: ""
    });
  };

  // Filtrado por búsqueda
  const instructoresFiltrados = instructores.filter((i) =>
    (i.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.especialidad || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.estado ? "activo" : "inactivo").includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(instructoresFiltrados.length / itemsPerPage));
  const currentItems = instructoresFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuarios / Instructores</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar instructores (Nombre, Email, Especialidad)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar Instructor
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[20%]">Nombre</th>
                    <th className="px-6 py-3 w-[20%]">Email</th>
                    <th className="px-6 py-3 w-[15%]">Especialidad</th>
                    <th className="px-6 py-3 w-[15%]">Experiencia</th>
                    <th className="px-6 py-3 w-[10%]">Estado</th>
                    <th className="px-6 py-3 w-[20%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Cargando instructores...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                        No se encontraron instructores.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((i) => (
                      <tr key={i.id_instructor} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{i.nombre_completo}</td>
                        <td className="px-6 py-4 text-gray-600">{i.email}</td>
                        <td className="px-6 py-4 text-gray-600">{i.especialidad || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {i.anios_experiencia ? `${i.anios_experiencia} años` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            i.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {i.estado ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", i)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("editar", i)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("eliminar", i)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Desactivar"
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

          {instructoresFiltrados.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
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
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
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
                    ? "Registrar Instructor"
                    : modal === "editar"
                    ? "Editar Instructor"
                    : modal === "ver"
                    ? "Detalles del Instructor"
                    : "Desactivar Instructor"}
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
                        {usuariosDisponibles.map(usuario => (
                          <option key={usuario.id_usuario} value={usuario.id_usuario}>
                            {usuario.nombre_completo} ({usuario.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Años de Experiencia
                      </label>
                      <input
                        type="number"
                        name="anios_experiencia"
                        value={formData.anios_experiencia}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 5"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Skate vertical, Freestyle"
                      />
                    </div>
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

                {modal === "editar" && selectedInstructor && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuario
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                        {selectedInstructor.nombre_completo} ({selectedInstructor.email})
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Años de Experiencia
                      </label>
                      <input
                        type="number"
                        name="anios_experiencia"
                        value={formData.anios_experiencia}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 5"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        name="especialidad"
                        value={formData.especialidad}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Skate vertical, Freestyle"
                      />
                    </div>
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

                {modal === "ver" && selectedInstructor && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span className="text-right">{selectedInstructor.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-right">{selectedInstructor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span className="text-right">{selectedInstructor.telefono || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Documento:</span>
                      <span className="text-right">{selectedInstructor.documento || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Especialidad:</span>
                      <span className="text-right">{selectedInstructor.especialidad || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Años de experiencia:</span>
                      <span className="text-right">
                        {selectedInstructor.anios_experiencia ? `${selectedInstructor.anios_experiencia} años` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className={`font-medium ${
                        selectedInstructor.estado ? "text-green-600" : "text-red-600"
                      }`}>
                        {selectedInstructor.estado ? "Activo" : "Inactivo"}
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

                {modal === "eliminar" && selectedInstructor && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de desactivar al instructor{" "}
                      <span className="font-bold text-red-600">{selectedInstructor.nombre_completo}</span>?
                      <br />
                      <span className="text-sm text-gray-500">El instructor no podrá iniciar sesión.</span>
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
                        Desactivar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default Instructores;