// src/feactures/dashboards/admin/pages/eventos/patrocinadores/Patrocinadores.jsx
import React, { useEffect, useState } from "react";

import { Search, Plus, Pen, Trash2, Eye, X, Image as ImageIcon, Mail, Phone, User } from "lucide-react";
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
  const itemsPerPage = 7;

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
      if (!value || !value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 2) error = "El nombre debe tener al menos 2 caracteres";
      else if (value.trim().length > 100) error = "El nombre no debe exceder 100 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s.,&-]+$/.test(value.trim())) error = "Nombre inválido (caracteres no permitidos)";
    }

    if (name === "email") {
      if (!value.trim()) error = "El email es obligatorio";
      else {
        // Regex estándar para email
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value.trim())) error = "Formato de correo inválido";
      }
    }

    if (name === "telefono") {
      if (!value.trim()) error = "El teléfono es obligatorio";
      else {
          // Permite números, espacios, guiones, parentesis y signo más. Longitud entre 7 y 20
          const re = /^[0-9+\s()-]{7,20}$/;
          if (!re.test(value.trim())) error = "Número inválido (7-20 dígitos)";
      }
    }

    if (name === "logo" && value.trim() !== "") {
      try {
        new URL(value.trim());
      } catch {
        error = "URL del logo inválida (debe comenzar con http/https)";
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
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

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
                    <th className="px-6 py-3">Logo</th>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Teléfono</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 italic">
                        Cargando...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 italic">
                        No hay patrocinadores registrados
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((p) => (
                      <tr key={p.id_patrocinador} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          {p.logo ? (
                            <img src={p.logo} className="w-10 h-10 object-cover rounded-md border" alt="logo" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 border rounded-md flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">{p.nombre_patrocinador}</td>
                        <td className="px-6 py-4 text-gray-600">{p.email}</td>
                        <td className="px-6 py-4 text-gray-600">{p.telefono}</td>

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

                <form className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <div className="relative">
                        <input
                        name="nombre_patrocinador"
                        value={form.nombre_patrocinador}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2.5 border rounded-lg ${formErrors.nombre_patrocinador ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-100 outline-none`}
                        placeholder="Ej: Nike"
                        />
                         <User size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.nombre_patrocinador && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre_patrocinador}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                        <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2.5 border rounded-lg ${formErrors.email ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-100 outline-none`}
                        placeholder="Ej: contacto@nike.com"
                        />
                        <Mail size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <div className="relative">
                        <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2.5 border rounded-lg ${formErrors.telefono ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-100 outline-none`}
                        placeholder="Ej: +57 300 123 4567"
                        />
                        <Phone size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.telefono && <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>}
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
                    <div className="relative">
                        <input
                        name="logo"
                        value={form.logo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full p-2.5 border rounded-lg ${formErrors.logo ? "border-red-500" : "border-gray-300"
                            } focus:ring-2 focus:ring-blue-100 outline-none`}
                        placeholder="https://cdn.com/logo.png"
                        />
                        <ImageIcon size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    {formErrors.logo && <p className="text-red-500 text-xs mt-1">{formErrors.logo}</p>}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                      Cancelar
                    </button>

                    <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md transition">
                      Guardar
                    </button>
                  </div>
                </form>
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
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Detalles del Patrocinador</h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex justify-center">
                    {selected.logo ? (
                      <img
                        src={selected.logo}
                        className="w-32 h-32 object-contain border rounded-full bg-gray-50 p-2"
                        alt="logo"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 border rounded-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="text-blue-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Nombre</p>
                        <p className="font-medium text-gray-900">{selected.nombre_patrocinador}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="text-purple-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                        <p className="font-medium text-gray-900">{selected.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="text-green-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Teléfono</p>
                        <p className="font-medium text-gray-900">{selected.telefono}</p>
                      </div>
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
                className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative text-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Eliminar Patrocinador
                </h3>

                <p className="text-gray-500 text-sm mb-6">
                  ¿Está seguro de eliminar a <span className="font-bold text-gray-800">{selected.nombre_patrocinador}</span>?
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
