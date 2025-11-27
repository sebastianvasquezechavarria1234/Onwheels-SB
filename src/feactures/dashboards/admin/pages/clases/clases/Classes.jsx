// src/feactures/dashboards/admin/pages/clases/clases/Clases.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [clases, setClases] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    hora_fin: ""
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

  // Cargar datos
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
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // CRUD
  const handleCreate = async () => {
    try {
      if (!formData.id_nivel || !formData.id_sede || formData.instructores.length === 0) {
        showNotification("Nivel, sede e instructores son obligatorios", "error");
        return;
      }

      const id_nivel = parseInt(formData.id_nivel);
      const id_sede = parseInt(formData.id_sede);

      if (isNaN(id_nivel) || isNaN(id_sede)) {
        showNotification("Nivel y sede deben ser números válidos", "error");
        return;
      }

      const payload = {
        id_nivel,
        id_sede,
        instructores: formData.instructores.map(i => ({
          ...i,
          id_instructor: parseInt(i.id_instructor)
        })),
        cupo_maximo: formData.cupo_maximo ? parseInt(formData.cupo_maximo) : null,
        dia_semana: formData.dia_semana,
        descripcion: formData.descripcion,
        estado: formData.estado,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin
      };

      await createClase(payload);
      await fetchData();
      closeModal();
      showNotification("Clase creada con éxito");
    } catch (err) {
      console.error("Error creando clase:", err);
      const msg = err.response?.data?.mensaje || "Error creando clase";
      showNotification(msg, "error");
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedClase) return;

      const id_nivel = parseInt(formData.id_nivel);
      const id_sede = parseInt(formData.id_sede);

      if (isNaN(id_nivel) || isNaN(id_sede)) {
        showNotification("Nivel y sede deben ser números válidos", "error");
        return;
      }

      const payload = {
        id_nivel,
        id_sede,
        instructores: formData.instructores.map(i => ({
          ...i,
          id_instructor: parseInt(i.id_instructor)
        })),
        cupo_maximo: formData.cupo_maximo ? parseInt(formData.cupo_maximo) : null,
        dia_semana: formData.dia_semana,
        descripcion: formData.descripcion,
        estado: formData.estado,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin
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

  // Modal
  const openModal = (type, clase = null) => {
    setModal(type);
    setSelectedClase(clase);
    if (clase && type === "editar") {
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
        hora_fin: clase.hora_fin || ""
      });
    } else {
      setFormData({
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
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedClase(null);
    setFormData({
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
  };

  // Agregar instructor desde select
  const handleAgregarInstructor = () => {
    const idInstructor = formData.instructorTemporal;
    if (!idInstructor) return;

    const instructorExistente = formData.instructores.find(i => i.id_instructor == idInstructor);
    if (instructorExistente) return;

    const instructor = instructores.find(i => i.id_instructor == idInstructor);
    if (!instructor) return;

    setFormData(prev => ({
      ...prev,
      instructores: [...prev.instructores, { id_instructor: parseInt(idInstructor), rol_instructor: "Principal" }],
      instructorTemporal: ""
    }));
  };

  // Eliminar instructor
  const handleEliminarInstructor = (index) => {
    setFormData(prev => ({
      ...prev,
      instructores: prev.instructores.filter((_, i) => i !== index)
    }));
  };

  // Filtrado y paginación
  const clasesFiltradas = clases.filter(c =>
    (c.descripcion || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.nombre_nivel || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.nombre_sede || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.instructores || []).some(i => i.nombre_instructor?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(clasesFiltradas.length / itemsPerPage));
  const currentItems = clasesFiltradas.slice(
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Clases / Gestión de Clases</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar clases (Descripción, Nivel, Sede, Instructor)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Crear Clase
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[5%]">ID</th>
                    <th className="px-6 py-3 w-[10%]">Nivel</th>
                    <th className="px-6 py-3 w-[10%]">Sede</th>
                    <th className="px-6 py-3 w-[30%]">Instructores</th>
                    <th className="px-6 py-3 w-[8%]">Cupo</th>
                    <th className="px-6 py-3 w-[10%]">Día</th>
                    <th className="px-6 py-3 w-[12%]">Horario</th>
                    <th className="px-6 py-3 w-[10%]">Estado</th>
                    <th className="px-6 py-3 w-[5%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        Cargando clases...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500 italic">
                        No hay clases registradas.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((c) => (
                      <tr key={c.id_clase} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">{c.id_clase}</td>
                        <td className="px-6 py-4">{c.nombre_nivel || "—"}</td>
                        <td className="px-6 py-4">{c.nombre_sede || "—"}</td>
                        <td className="px-6 py-4">
                          {c.instructores && c.instructores.length > 0 ? (
                            <div className="space-y-1">
                              {c.instructores.map((inst, idx) => (
                                <div key={idx} className="text-sm">
                                  {inst.nombre_instructor}
                                  {inst.rol_instructor && inst.rol_instructor !== 'Principal' && ` (${inst.rol_instructor})`}
                                </div>
                              ))}
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4">{c.cupo_maximo || "—"}</td>
                        <td className="px-6 py-4">{c.dia_semana || "—"}</td>
                        <td className="px-6 py-4">
                          {c.hora_inicio && c.hora_fin ? `${c.hora_inicio} - ${c.hora_fin}` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${c.estado === "Disponible"
                              ? "bg-green-100 text-green-800"
                              : c.estado === "Ocupado"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", c)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("editar", c)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("eliminar", c)}
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

          {clasesFiltradas.length > 0 && (
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

        {/* Notificación */}
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
                    ? "Crear Clase"
                    : modal === "editar"
                      ? "Editar Clase"
                      : modal === "ver"
                        ? "Detalles de la Clase"
                        : "Eliminar Clase"}
                </h3>

                {modal === "crear" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Clase de skate para principiantes"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                        <select
                          name="id_nivel"
                          value={formData.id_nivel}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        >
                          <option value="">Seleccionar nivel</option>
                          {niveles.map(n => (
                            <option key={n.id_nivel} value={n.id_nivel}>
                              {n.nombre_nivel}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
                        <select
                          name="id_sede"
                          value={formData.id_sede}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        >
                          <option value="">Seleccionar sede</option>
                          {sedes.map(s => (
                            <option key={s.id_sede} value={s.id_sede}>
                              {s.nombre_sede}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructores *</label>
                      <div className="space-y-2">
                        {formData.instructores.length === 0 ? (
                          <div className="text-gray-500 text-sm italic">No hay instructores asignados</div>
                        ) : (
                          formData.instructores.map((inst, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span>
                                {instructores.find(i => i.id_instructor == inst.id_instructor)?.nombre_completo || 'Instructor desconocido'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleEliminarInstructor(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        )}
                        <div className="flex gap-2">
                          <select
                            value={formData.instructorTemporal || ""}
                            onChange={handleChange}
                            name="instructorTemporal"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar instructor</option>
                            {instructores
                              .filter(inst => !formData.instructores.some(i => i.id_instructor == inst.id_instructor))
                              .map(inst => (
                                <option key={inst.id_instructor} value={inst.id_instructor}>
                                  {inst.nombre_completo}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAgregarInstructor}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label>
                        <input
                          type="number"
                          name="cupo_maximo"
                          value={formData.cupo_maximo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: 15"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Semana</label>
                        <select
                          name="dia_semana"
                          value={formData.dia_semana}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Seleccionar día</option>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          name="hora_inicio"
                          value={formData.hora_inicio}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                        <input
                          type="time"
                          name="hora_fin"
                          value={formData.hora_fin}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Ocupado">Ocupado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
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
                        Crear
                      </button>
                    </div>
                  </form>
                )}

                {modal === "editar" && selectedClase && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Clase de skate para principiantes"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                        <select
                          name="id_nivel"
                          value={formData.id_nivel}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        >
                          <option value="">Seleccionar nivel</option>
                          {niveles.map(n => (
                            <option key={n.id_nivel} value={n.id_nivel}>
                              {n.nombre_nivel}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
                        <select
                          name="id_sede"
                          value={formData.id_sede}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        >
                          <option value="">Seleccionar sede</option>
                          {sedes.map(s => (
                            <option key={s.id_sede} value={s.id_sede}>
                              {s.nombre_sede}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructores *</label>
                      <div className="space-y-2">
                        {formData.instructores.length === 0 ? (
                          <div className="text-gray-500 text-sm italic">No hay instructores asignados</div>
                        ) : (
                          formData.instructores.map((inst, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span>
                                {instructores.find(i => i.id_instructor == inst.id_instructor)?.nombre_completo || 'Instructor desconocido'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleEliminarInstructor(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))
                        )}
                        <div className="flex gap-2">
                          <select
                            value={formData.instructorTemporal || ""}
                            onChange={handleChange}
                            name="instructorTemporal"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar instructor</option>
                            {instructores
                              .filter(inst => !formData.instructores.some(i => i.id_instructor == inst.id_instructor))
                              .map(inst => (
                                <option key={inst.id_instructor} value={inst.id_instructor}>
                                  {inst.nombre_completo}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAgregarInstructor}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label>
                        <input
                          type="number"
                          name="cupo_maximo"
                          value={formData.cupo_maximo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: 15"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Semana</label>
                        <select
                          name="dia_semana"
                          value={formData.dia_semana}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Seleccionar día</option>
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          name="hora_inicio"
                          value={formData.hora_inicio}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                        <input
                          type="time"
                          name="hora_fin"
                          value={formData.hora_fin}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Ocupado">Ocupado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
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

                {modal === "ver" && selectedClase && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">ID:</span>
                      <span>{selectedClase.id_clase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Nivel:</span>
                      <span>{selectedClase.nombre_nivel || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sede:</span>
                      <span>{selectedClase.nombre_sede || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Instructores:</span>
                      <div className="text-right">
                        {selectedClase.instructores && selectedClase.instructores.length > 0 ? (
                          <div className="space-y-1">
                            {selectedClase.instructores.map((inst, idx) => (
                              <div key={idx}>
                                {inst.nombre_instructor}
                                {inst.rol_instructor && inst.rol_instructor !== 'Principal' && ` (${inst.rol_instructor})`}
                              </div>
                            ))}
                          </div>
                        ) : "—"}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Cupo Máximo:</span>
                      <span>{selectedClase.cupo_maximo || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Día:</span>
                      <span>{selectedClase.dia_semana || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Horario:</span>
                      <span>{selectedClase.hora_inicio && selectedClase.hora_fin ? `${selectedClase.hora_inicio} - ${selectedClase.hora_fin}` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descripción:</span>
                      <span>{selectedClase.descripcion || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className={`font-medium ${selectedClase.estado === "Disponible" ? "text-green-600" :
                          selectedClase.estado === "Ocupado" ? "text-yellow-600" : "text-red-600"
                        }`}>
                        {selectedClase.estado}
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

                {modal === "eliminar" && selectedClase && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar la clase{" "}
                      <span className="font-bold text-red-600">{selectedClase.descripcion}</span>?
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
    </Layout>
  );
};

export default Clases;