// src/feactures/dashboards/admin/pages/eventos/categorias/CategoriaEventos.jsx

import React, { useEffect, useState } from "react";

import { Search, Plus, Pen, Trash2, Eye, X, Tag, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCategoriasEventos as getCategorias,
  createCategoriaEvento as createCategoria,
  updateCategoriaEvento as updateCategoria,
  deleteCategoriaEvento as deleteCategoria,
} from "../../services/EventCategory";

export default function CategoriaEventos() {
  // Data
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal & selection
  const [modal, setModal] = useState(null); // crear | editar | ver | eliminar
  const [selected, setSelected] = useState(null);

  // Form
  const [form, setForm] = useState({ nombre_categoria: "", descripcion: "" });

  // Validation
  const [formErrors, setFormErrors] = useState({});

  // Notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Field validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_categoria") {
      if (!value || !value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 3) error = "Mínimo 3 caracteres";
      else if (value.trim().length > 50) error = "Máximo 50 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s.,&-]+$/.test(value.trim()))
        error = "Nombre inválido (caracteres no permitidos)";
    }

    if (name === "descripcion" && value) {
        if (value.length > 200) error = "Máximo 200 caracteres";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    const ok1 = validateField("nombre_categoria", form.nombre_categoria);
    const ok2 = validateField("descripcion", form.descripcion);
    return ok1 && ok2;
  };

  // Fetch categories
  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      showNotification("Error cargando categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Modal handlers
  const openModal = (type, categoria = null) => {
    setModal(type);
    setSelected(categoria);

    setForm(
      categoria
        ? {
          nombre_categoria: categoria.nombre_categoria || "",
          descripcion: categoria.descripcion || "",
        }
        : { nombre_categoria: "", descripcion: "" }
    );

    setFormErrors({});
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_categoria: "", descripcion: "" });
    setFormErrors({});
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // Save data
  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    const payload = {
      nombre_categoria: form.nombre_categoria.trim(),
      descripcion: form.descripcion.trim() || null,
    };

    try {
      if (modal === "crear") {
        await createCategoria(payload);
        showNotification("Categoría creada con éxito");
      } else if (modal === "editar" && selected) {
        await updateCategoria(selected.id_categoria_evento, payload);
        showNotification("Categoría actualizada");
      }

      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando:", err);
      showNotification("Error guardando la categoría", "error");
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await deleteCategoria(selected.id_categoria_evento);
      showNotification("Categoría eliminada", "success");
      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando:", err);
      showNotification("No se pudo eliminar", "error");
    }
  };

  // Filter + pagination
  const filtered = categorias.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      String(c.id_categoria_evento).includes(q) ||
      c.nombre_categoria.toLowerCase().includes(q) ||
      (c.descripcion || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  return (
    <>
      {/* -------------- UI CONTENT ---------------- */}
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Categorías de Eventos / Gestión
          </h2>

          {/* Search & New Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar categoría..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar nueva categoría
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Descripción</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-10 text-gray-500 italic">
                        Cargando...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-10 text-gray-500 italic">
                        No hay categorías registradas
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((c) => (
                      <tr
                        key={c.id_categoria_evento}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">{c.nombre_categoria}</td>
                        <td className="px-6 py-4 text-gray-600">{c.descripcion || "—"}</td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
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
                              <Pen size={16} />
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

          {/* Pagination */}
          {filtered.length > 0 && (
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

        {/* Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Crear / Editar */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
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
                  {modal === "crear" ? "Registrar Categoría" : "Editar Categoría"}
                </h3>

                <form className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <div className="relative">
                        <input
                        name="nombre_categoria"
                        value={form.nombre_categoria}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Ej: Conferencias"
                        className={`w-full p-2.5 border rounded-lg ${formErrors.nombre_categoria ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-100 outline-none`}
                        />
                         <Tag size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.nombre_categoria && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.nombre_categoria}
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <div className="relative">
                        <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Descripción de la categoría"
                        rows={3}
                        className={`w-full p-2.5 border rounded-lg ${formErrors.descripcion ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-100 outline-none`}
                        />
                        <FileText size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.descripcion && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                      onClick={closeModal}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      Cancelar
                    </button>

                    <button
                        type="button"
                      onClick={handleSave}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition"
                    >
                      {modal === "crear" ? "Guardar" : "Actualizar"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Ver */}
        <AnimatePresence>
          {modal === "ver" && selected && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
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
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  Detalles de Categoría
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Tag size={20} /></div>
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Nombre</p>
                        <p className="text-gray-800 font-medium">{selected.nombre_categoria}</p>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><FileText size={20} /></div>
                     <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Descripción</p>
                        <p className="text-gray-600">{selected.descripcion || "Sin descripción"}</p>
                     </div>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Eliminar */}
        <AnimatePresence>
          {modal === "eliminar" && selected && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative text-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Eliminar Categoría
                </h3>

                <p className="text-gray-500 text-sm mb-6">
                  ¿Está seguro de eliminar la categoría <span className="font-bold text-gray-800">{selected.nombre_categoria}</span>?
                  Esta acción no se puede deshacer.
                </p>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md"
                  >
                    Sí, Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
