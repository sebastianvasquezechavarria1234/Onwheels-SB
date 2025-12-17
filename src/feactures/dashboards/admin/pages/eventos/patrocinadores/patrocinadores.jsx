// src/feactures/dashboards/admin/pages/eventos/patrocinadores/Patrocinadores.jsx
import React, { useEffect, useState } from "react";

import { Search, Plus, Pen, Trash2, Eye, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPatrocinadores,
  createPatrocinador,
  updatePatrocinador,
  deletePatrocinador,
} from "../../services/patrocinadoresServices";

export default function Patrocinadores() {
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    nombre_patrocinador: "",
    email: "",
    telefono: "",
    logo: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // VALIDACIONES
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_patrocinador") {
      if (!value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 2) error = "Debe tener mínimo 2 caracteres";
      else if (value.trim().length > 100) error = "Máximo 100 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s0-9&.,\-]+$/.test(value.trim())) error = "Nombre inválido";
    }

    if (name === "email") {
      if (!value.trim()) error = "El email es obligatorio";
      else {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value.trim())) error = "Email inválido";
      }
    }

    if (name === "telefono") {
      const re = /^[0-9+\s()-]{6,20}$/;
      if (!value.trim()) error = "El teléfono es obligatorio";
      else if (!re.test(value.trim())) error = "Teléfono inválido";
    }

    if (name === "logo" && value.trim() !== "") {
      try {
        new URL(value.trim());
      } catch {
        error = "URL inválida";
      }
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    return (
      validateField("nombre_patrocinador", form.nombre_patrocinador) &&
      validateField("email", form.email) &&
      validateField("telefono", form.telefono)
    );
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getPatrocinadores();
      setPatrocinadores(data || []);
    } catch (err) {
      console.error("Error cargando patrocinadores:", err);
      showNotification("Error cargando patrocinadores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // HANDLERS
  const openModal = (type, patrocinador = null) => {
    setModal(type);
    setSelected(patrocinador);

    setForm(
      patrocinador
        ? {
          nombre_patrocinador: patrocinador.nombre_patrocinador,
          email: patrocinador.email,
          telefono: patrocinador.telefono,
          logo: patrocinador.logo || "",
        }
        : { nombre_patrocinador: "", email: "", telefono: "", logo: "" }
    );

    setFormErrors({});
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_patrocinador: "", email: "", telefono: "", logo: "" });
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

  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    const payload = {
      nombre_patrocinador: form.nombre_patrocinador.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      logo: form.logo.trim() || null,
    };

    try {
      if (modal === "crear") {
        await createPatrocinador(payload);
        showNotification("Patrocinador creado con éxito", "success");
      } else {
        await updatePatrocinador(selected.id_patrocinador, payload);
        showNotification("Patrocinador actualizado con éxito", "success");
      }

      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando patrocinador:", err);
      showNotification("No se pudo guardar el patrocinador", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePatrocinador(selected.id_patrocinador);
      showNotification("Patrocinador eliminado con éxito", "success");
      fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando patrocinador:", err);
      showNotification("No se pudo eliminar", "error");
    }
  };

  // FILTROS + PAGINACIÓN
  const filtered = patrocinadores.filter((p) => {
    const q = search.toLowerCase().trim();
    return (
      p.nombre_patrocinador.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.telefono.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Patrocinadores / Gestión</h2>

          {/* BUSCADOR + BOTÓN */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar patrocinador..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} /> Registrar nuevo
            </button>
          </div>

          {/* TABLA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[5%]">ID</th>
                    <th className="px-6 py-3 w-[8%]">Logo</th>
                    <th className="px-6 py-3 w-[20%]">Nombre</th>
                    <th className="px-6 py-3 w-[25%]">Email</th>
                    <th className="px-6 py-3 w-[20%]">Teléfono</th>
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
                        No hay patrocinadores registrados
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p) => (
                      <tr key={p.id_patrocinador} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">{p.id_patrocinador}</td>

                        <td className="px-6 py-4">
                          {p.logo ? (
                            <img src={p.logo} className="w-10 h-10 object-cover rounded border" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 border rounded flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium">{p.nombre_patrocinador}</td>
                        <td className="px-6 py-4">{p.email}</td>
                        <td className="px-6 py-4">{p.telefono}</td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", p)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("editar", p)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pen size={16} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("eliminar", p)}
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

          {/* PAGINACIÓN */}
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

        {/* TOAST */}
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

        {/* MODALS */}
        {/** CREAR / EDITAR */}
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
                  {modal === "crear" ? "Registrar Patrocinador" : "Editar Patrocinador"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      name="nombre_patrocinador"
                      value={form.nombre_patrocinador}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.nombre_patrocinador ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Ej: Nike"
                    />
                    {formErrors.nombre_patrocinador && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre_patrocinador}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Ej: contacto@nike.com"
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.telefono ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Ej: +57 300 123 4567"
                    />
                    {formErrors.telefono && <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
                    <input
                      name="logo"
                      value={form.logo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.logo ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="https://cdn.com/logo.png"
                    />
                    {formErrors.logo && <p className="text-red-500 text-xs mt-1">{formErrors.logo}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                    Cancelar
                  </button>

                  <button onClick={handleSave} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
                    Guardar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/** VER */}
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
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Detalles del Patrocinador</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    {selected.logo ? (
                      <img
                        src={selected.logo}
                        className="w-full h-48 object-contain border rounded-md"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 border rounded-md flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <div className="font-medium text-gray-600">ID</div>
                      <div>{selected.id_patrocinador}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Nombre</div>
                      <div>{selected.nombre_patrocinador}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Email</div>
                      <div>{selected.email}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Teléfono</div>
                      <div>{selected.telefono}</div>
                    </div>
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

        {/** ELIMINAR */}
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
                  Eliminar Patrocinador
                </h3>

                <p className="text-gray-700 text-center">
                  ¿Está seguro de eliminar a {" "}
                  <span className="font-bold">{selected.nombre_patrocinador}</span> ?
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
    </>
  );
}
