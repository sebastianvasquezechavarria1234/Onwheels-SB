// src/feactures/dashboards/admin/pages/clases/niveles/ClassLevels.jsx
import React, { useEffect, useState, useCallback } from "react";

import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getNiveles,
  createNivel,
  updateNivel,
  deleteNivel
} from "../../services/classLevelsServices";

export const ClassLevels = () => {
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedNivel, setSelectedNivel] = useState(null);
  const [formData, setFormData] = useState({
    nombre_nivel: "",
    descripcion: ""
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

  // Cargar niveles
  const fetchNiveles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNiveles();
      setNiveles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando niveles:", err);
      setError("Error al cargar los niveles.");
      showNotification("Error al cargar niveles", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNiveles();
  }, [fetchNiveles]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Crear nivel
  const handleCreate = async () => {
    try {
      if (!formData.nombre_nivel.trim()) {
        showNotification("El nombre del nivel es obligatorio", "error");
        return;
      }
      await createNivel(formData);
      await fetchNiveles();
      closeModal();
      showNotification("Nivel creado con éxito");
    } catch (err) {
      console.error("Error creando nivel:", err);
      const errorMessage = err.response?.data?.error || "Error creando nivel";
      showNotification(errorMessage, "error");
    }
  };

  // Editar nivel
  const handleEdit = async () => {
    try {
      if (!selectedNivel) return;
      if (!formData.nombre_nivel.trim()) {
        showNotification("El nombre del nivel es obligatorio", "error");
        return;
      }
      await updateNivel(selectedNivel.id_nivel, formData);
      await fetchNiveles();
      closeModal();
      showNotification("Nivel actualizado con éxito");
    } catch (err) {
      console.error("Error editando nivel:", err);
      const errorMessage = err.response?.data?.error || "Error editando nivel";
      showNotification(errorMessage, "error");
    }
  };

  // Eliminar nivel
  const handleDelete = async () => {
    try {
      if (!selectedNivel) return;
      await deleteNivel(selectedNivel.id_nivel);
      await fetchNiveles();
      closeModal();
      showNotification("Nivel eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando nivel:", err);
      const errorMessage = err.response?.data?.error || "Error eliminando nivel";
      showNotification(errorMessage, "error");
    }
  };

  // Abrir modal
  const openModal = (type, nivel = null) => {
    setModal(type);
    setSelectedNivel(nivel);
    if (nivel && type === "editar") {
      setFormData({
        nombre_nivel: nivel.nombre_nivel || "",
        descripcion: nivel.descripcion || ""
      });
    } else {
      setFormData({
        nombre_nivel: "",
        descripcion: ""
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedNivel(null);
    setFormData({
      nombre_nivel: "",
      descripcion: ""
    });
  };

  // Filtrado por búsqueda
  const nivelesFiltrados = niveles.filter((n) =>
    (n.nombre_nivel || "").toLowerCase().includes(search.toLowerCase()) ||
    (n.descripcion || "").toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.max(1, Math.ceil(nivelesFiltrados.length / itemsPerPage));
  const currentItems = nivelesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Clases / Niveles de Clase</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar niveles (Nombre o Descripción)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Crear Nivel
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[30%]">Nombre del Nivel</th>
                    <th className="px-6 py-3 w-[50%]">Descripción</th>
                    <th className="px-6 py-3 w-[20%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        Cargando niveles...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                        No se encontraron niveles.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((n) => (
                      <tr key={n.id_nivel} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{n.nombre_nivel}</td>
                        <td className="px-6 py-4 text-gray-600">{n.descripcion || "— Sin descripción —"}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", n)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("editar", n)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("eliminar", n)}
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

          {nivelesFiltrados.length > 0 && (
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
                    ? "Crear Nivel"
                    : modal === "editar"
                      ? "Editar Nivel"
                      : modal === "ver"
                        ? "Detalles del Nivel"
                        : "Eliminar Nivel"}
                </h3>

                {modal === "crear" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Nivel *
                      </label>
                      <input
                        type="text"
                        name="nombre_nivel"
                        value={formData.nombre_nivel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Principiante"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Para estudiantes sin experiencia previa"
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
                        Crear
                      </button>
                    </div>
                  </form>
                )}

                {modal === "editar" && selectedNivel && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Nivel *
                      </label>
                      <input
                        type="text"
                        name="nombre_nivel"
                        value={formData.nombre_nivel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Principiante"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Para estudiantes sin experiencia previa"
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

                {modal === "ver" && selectedNivel && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">ID:</span>
                      <span>{selectedNivel.id_nivel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre del Nivel:</span>
                      <span className="text-right">{selectedNivel.nombre_nivel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descripción:</span>
                      <span className="text-right">{selectedNivel.descripcion || "— Sin descripción —"}</span>
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

                {modal === "eliminar" && selectedNivel && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar el nivel{" "}
                      <span className="font-bold text-red-600">{selectedNivel.nombre_nivel}</span>?
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

export default ClassLevels;