// src/feactures/dashboards/admin/pages/eventos/sedes/Sedes.jsx
import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pen, Trash2, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSedes,
  createSede,
  updateSede,
  deleteSede,
} from "../../services/sedesServices";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    nombre_sede: "",
    direccion: "",
    ciudad: "",
    telefono: "", // Correctamente nombrado como en la base de datos
  });

  // Validaciones
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // Validaciones mejoradas
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_sede") {
      if (!value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 2) error = "Mínimo 2 caracteres";
      else if (value.trim().length > 200) error = "Máximo 200 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s0-9&.,\-]+$/.test(value.trim())) error = "Nombre inválido";
    }

    if (name === "direccion") {
      if (!value.trim()) error = "La dirección es obligatoria";
      else if (value.trim().length < 5) error = "Dirección demasiado corta";
      else if (value.trim().length > 255) error = "Máximo 255 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s0-9&.,\-#\/\s]+$/.test(value.trim())) error = "Dirección inválida";
    }

    if (name === "ciudad") {
      if (!value.trim()) error = "La ciudad es obligatoria";
      else if (value.trim().length < 2) error = "Mínimo 2 caracteres";
      else if (value.trim().length > 100) error = "Máximo 100 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value.trim())) error = "Solo letras";
    }

    if (name === "telefono") { // Correctamente nombrado como en la base de datos
      if (!value.trim()) error = "El teléfono es obligatorio";
      else {
        const re = /^[0-9+\s()-]{6,20}$/;
        if (!re.test(value.trim())) error = "Teléfono inválido";
      }
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    return (
      validateField("nombre_sede", form.nombre_sede) &&
      validateField("direccion", form.direccion) &&
      validateField("ciudad", form.ciudad) &&
      validateField("telefono", form.telefono) // Correctamente nombrado como en la base de datos
    );
  };

  // Paginación
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSedes = async () => {
    try {
      setLoading(true);
      const data = await getSedes();
      setSedes(data);
    } catch (err) {
      console.error("Error al cargar sedes:", err);
      showNotification("Error al cargar sedes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const openModal = (type, sede = null) => {
    setModal(type);
    setSelected(sede);
    setForm(
      sede || {
        nombre_sede: "",
        direccion: "",
        ciudad: "",
        telefono: "", // Correctamente nombrado como en la base de datos
      }
    );
    setFormErrors({});
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_sede: "", direccion: "", ciudad: "", telefono: "" }); // Correctamente nombrado como en la base de datos
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value); // Validar en tiempo real al escribir
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    try {
      if (modal === "crear") {
        await createSede(form);
        showNotification("Sede creada con éxito", "success");
      } else if (modal === "editar") {
        await updateSede(selected.id_sede, form);
        showNotification("Sede actualizada con éxito", "success");
      }
      fetchSedes();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
      showNotification("Error al guardar sede", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSede(selected.id_sede);
      showNotification("Sede eliminada con éxito", "success");
      fetchSedes();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showNotification("Error al eliminar sede", "error");
    }
  };

  // Filtrar y paginar
  const filtered = sedes.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      s.nombre_sede.toLowerCase().includes(q) ||
      s.direccion.toLowerCase().includes(q) ||
      s.ciudad.toLowerCase().includes(q) ||
      s.telefono.toLowerCase().includes(q) // Correctamente nombrado como en la base de datos
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sedes / Gestión de Sedes</h2>

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
                placeholder="Buscar sedes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} /> Registrar nueva sede
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[10%]">ID</th>
                    <th className="px-6 py-3 w-[25%]">Nombre</th>
                    <th className="px-6 py-3 w-[30%]">Dirección</th>
                    <th className="px-6 py-3 w-[15%]">Ciudad</th>
                    <th className="px-6 py-3 w-[10%]">Teléfono</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-500 italic">
                        Cargando...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-gray-500 italic">
                        No hay sedes registradas
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((s) => (
                      <tr key={s.id_sede} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">{s.id_sede}</td>
                        <td className="px-6 py-4 font-medium">{s.nombre_sede}</td>
                        <td className="px-6 py-4">{s.direccion}</td>
                        <td className="px-6 py-4">{s.ciudad}</td>
                        <td className="px-6 py-4">{s.telefono}</td> {/* Correctamente nombrado como en la base de datos */}

                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", s)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("editar", s)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pen size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("eliminar", s)}
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

          {filtered.length > 0 && (
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

        {/* Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${
                notification.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Crear/Editar */}
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
                  {modal === "crear" ? "Registrar Sede" : "Editar Sede"}
                </h3>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      name="nombre_sede"
                      value={form.nombre_sede}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        formErrors.nombre_sede ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ej: Skatepark La 70"
                    />
                    {formErrors.nombre_sede && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre_sede}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                    <input
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        formErrors.ciudad ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ej: Medellín"
                    />
                    {formErrors.ciudad && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.ciudad}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        formErrors.direccion ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ej: Calle 10 #45-20 (parque central)"
                    />
                    {formErrors.direccion && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.direccion}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      name="telefono" // Correctamente nombrado como en la base de datos
                      value={form.telefono} // Correctamente nombrado como en la base de datos
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        formErrors.telefono ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ej: +57 300 123 4567"
                    />
                    {formErrors.telefono && ( // Correctamente nombrado como en la base de datos
                      <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p> // Correctamente nombrado como en la base de datos
                    )}
                  </div>
                </form>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
                    Guardar
                  </button>
                </div>
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
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Detalles de la Sede</h3>

                <div className="space-y-4 text-gray-700">
                  <div>
                    <div className="font-medium text-gray-600">ID</div>
                    <div>{selected.id_sede}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Nombre</div>
                    <div>{selected.nombre_sede}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Dirección</div>
                    <div>{selected.direccion}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Ciudad</div>
                    <div>{selected.ciudad}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Teléfono</div>
                    <div>{selected.telefono}</div> {/* Correctamente nombrado como en la base de datos */}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
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
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-red-600 mb-4 text-center">
                  Eliminar Sede
                </h3>

                <p className="text-gray-700 text-center">
                  ¿Está seguro de eliminar la sede { " " }
                  <span className="font-bold">{selected.nombre_sede}</span> ?
                  <br />
                  <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </p>

                <div className="flex justify-center gap-3 pt-6">
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
