// src/features/dashboards/admin/pages/eventos/Eventos.jsx
import React, { useEffect, useState } from "react";

import { Search, Plus, Pen, Trash2, Eye, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getEventos,
  getCategorias,
  getPatrocinadores,
  getSedes,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../../services/Event.js";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({
    id_categoria_evento: "",
    id_patrocinador: "",
    id_sede: "",
    nombre_evento: "",
    fecha_evento: "",
    hora_inicio: "",
    hora_aproximada_fin: "", // ✅ CORREGIDO
    descripcion: "",
    imagen: "",
    estado: "activo",
  });

  const [formErrors, setFormErrors] = useState({});

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // ===================== VALIDACIONES =====================
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_evento") {
      if (!value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 2) error = "Debe tener mínimo 2 caracteres";
      else if (value.trim().length > 200) error = "Máximo 200 caracteres";
      else if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s0-9&.,\-]+$/.test(value.trim())) error = "Nombre inválido";
    }

    if (name === "id_categoria_evento") {
      if (!value) error = "Seleccione una categoría";
    }

    if (name === "id_patrocinador" && value) {
      const idNum = Number(value);
      if (isNaN(idNum) || !patrocinadores.some(p => p.id_patrocinador === idNum)) {
        error = "Patrocinador no válido";
      }
    }

    if (name === "id_sede") {
      if (!value) error = "Seleccione una sede";
    }

    if (name === "fecha_evento") {
      if (!value) error = "La fecha es obligatoria";
      else {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) error = "La fecha no puede ser anterior a hoy";
      }
    }

    if (name === "hora_inicio" && value) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) error = "Formato de hora inválido (HH:MM)";
    }

    if (name === "hora_aproximada_fin" && value) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) error = "Formato de hora inválido (HH:MM)";
    }

    if (name === "descripcion" && value && value.length > 500) {
      error = "Máximo 500 caracteres";
    }

    if (name === "imagen" && value.trim() !== "") {
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
    const ok_nombre = validateField("nombre_evento", form.nombre_evento);
    const ok_categoria = validateField("id_categoria_evento", form.id_categoria_evento);
    const ok_sede = validateField("id_sede", form.id_sede);
    const ok_fecha = validateField("fecha_evento", form.fecha_evento);
    return ok_nombre && ok_categoria && ok_sede && ok_fecha;
  };

  // ===================== FETCH DATA =====================
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ev, cat, pat, sed] = await Promise.all([
        getEventos(),
        getCategorias(),
        getPatrocinadores(),
        getSedes(),
      ]);
      setEventos(ev || []);
      setCategorias(cat || []);
      setPatrocinadores(pat || []);
      setSedes(sed || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error cargando datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===================== MODALES =====================
  const openModal = (type, evento = null) => {
    setModal(type);
    setSelected(evento);
    setForm(
      evento || {
        id_categoria_evento: "",
        id_patrocinador: "",
        id_sede: "",
        nombre_evento: "",
        fecha_evento: "",
        hora_inicio: "",
        hora_aproximada_fin: "", // ✅ CORREGIDO
        descripcion: "",
        imagen: "",
        estado: "activo",
      }
    );
    setFormErrors({});
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({
      id_categoria_evento: "",
      id_patrocinador: "",
      id_sede: "",
      nombre_evento: "",
      fecha_evento: "",
      hora_inicio: "",
      hora_aproximada_fin: "", // ✅ CORREGIDO
      descripcion: "",
      imagen: "",
      estado: "activo",
    });
    setFormErrors({});
  };

  // ===================== FORM HANDLERS =====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "id_categoria_evento" || name === "id_patrocinador" || name === "id_sede") {
      const numericValue = value === "" ? "" : Number(value);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
      setTimeout(() => validateField(name, numericValue), 0);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
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
        await createEvento(form);
        showNotification("Evento creado con éxito", "success");
      } else if (modal === "editar") {
        await updateEvento(selected.id_evento, form);
        showNotification("Evento actualizado con éxito", "success");
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error("Error al guardar evento:", err);
      showNotification("Error al guardar evento", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvento(selected.id_evento);
      showNotification("Evento eliminado con éxito", "success");
      fetchData();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showNotification("Error al eliminar evento", "error");
    }
  };

  // ===================== GETTERS =====================
  const getNombreCategoria = (id) => {
    if (!id) return "—";
    const cat = categorias.find((c) => c.id_categoria_evento === id);
    return cat ? cat.nombre_categoria : "—";
  };

  const getNombrePatrocinador = (id) => {
    if (!id) return "—";
    const pat = patrocinadores.find((p) => p.id_patrocinador === id);
    return pat ? pat.nombre_patrocinador : "—";
  };

  const getNombreSede = (id) => {
    if (!id) return "—";
    const sed = sedes.find((s) => s.id_sede === id);
    return sed ? sed.nombre_sede : "—";
  };

  // ===================== BUSQUEDA Y PAGINACIÓN =====================
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = eventos.filter((e) => {
    const q = search.toLowerCase().trim();
    return (
      e.nombre_evento.toLowerCase().includes(q) ||
      getNombreCategoria(e.id_categoria_evento)?.toLowerCase().includes(q) ||
      getNombrePatrocinador(e.id_patrocinador)?.toLowerCase().includes(q) ||
      getNombreSede(e.id_sede)?.toLowerCase().includes(q) ||
      e.fecha_evento.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  // ===================== RENDER =====================
  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Eventos / Gestión de Eventos</h2>

          {/* ===================== BUSCADOR Y BOTON ===================== */}
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
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} /> Registrar nuevo evento
            </button>
          </div>

          {/* ===================== TABLA ===================== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[5%]">ID</th>
                    <th className="px-6 py-3 w-[8%]">Imagen</th>
                    <th className="px-6 py-3 w-[15%]">Nombre</th>
                    <th className="px-6 py-3 w-[12%]">Categoría</th>
                    <th className="px-6 py-3 w-[12%]">Patrocinador</th>
                    <th className="px-6 py-3 w-[12%]">Sede</th>
                    <th className="px-6 py-3 w-[8%]">Fecha</th>
                    <th className="px-6 py-3 w-[7%]">Estado</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-10 text-gray-500 italic">
                        Cargando...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-10 text-gray-500 italic">
                        No hay eventos registrados
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((e) => (
                      <tr key={e.id_evento} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">{e.id_evento}</td>
                        <td className="px-6 py-4">
                          {e.imagen ? (
                            <img src={e.imagen} className="w-10 h-10 object-cover rounded border" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 border rounded flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{e.nombre_evento}</td>
                        <td className="px-6 py-4">{getNombreCategoria(e.id_categoria_evento)}</td>
                        <td className="px-6 py-4">{getNombrePatrocinador(e.id_patrocinador)}</td>
                        <td className="px-6 py-4">{getNombreSede(e.id_sede)}</td>
                        <td className="px-6 py-4">{e.fecha_evento}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${e.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                          >
                            {e.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
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
                              <Pen size={16} />
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

          {/* ===================== PAGINACIÓN ===================== */}
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

        {/* ===================== NOTIFICACIONES ===================== */}
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

        {/* ===================== MODAL CREAR / EDITAR ===================== */}
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
                  {modal === "crear" ? "Registrar Evento" : "Editar Evento"}
                </h3>

                <form id="form-evento" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      name="nombre_evento"
                      value={form.nombre_evento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.nombre_evento ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Nombre del evento"
                    />
                    {formErrors.nombre_evento && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.nombre_evento}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <select
                      name="id_categoria_evento"
                      value={form.id_categoria_evento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.id_categoria_evento ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria_evento} value={c.id_categoria_evento}>
                          {c.nombre_categoria}
                        </option>
                      ))}
                    </select>
                    {formErrors.id_categoria_evento && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.id_categoria_evento}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patrocinador</label>
                    <select
                      name="id_patrocinador"
                      value={form.id_patrocinador}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${formErrors.id_patrocinador ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Seleccionar...</option>
                      {patrocinadores.map((p) => (
                        <option key={p.id_patrocinador} value={p.id_patrocinador}>
                          {p.nombre_patrocinador}
                        </option>
                      ))}
                    </select>
                    {formErrors.id_patrocinador && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.id_patrocinador}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
                    <select
                      name="id_sede"
                      value={form.id_sede}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.id_sede ? "border-red-500" : "border-gray-300"
                        }`}
                    >
                      <option value="">Seleccionar...</option>
                      {sedes.map((s) => (
                        <option key={s.id_sede} value={s.id_sede}>
                          {s.nombre_sede}
                        </option>
                      ))}
                    </select>
                    {formErrors.id_sede && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.id_sede}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input
                      name="fecha_evento"
                      type="date"
                      value={form.fecha_evento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.fecha_evento ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {formErrors.fecha_evento && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.fecha_evento}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                    <input
                      name="hora_inicio"
                      type="time"
                      value={form.hora_inicio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.hora_inicio ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {formErrors.hora_inicio && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hora_inicio}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin estimada</label>
                    <input
                      name="hora_aproximada_fin" // ✅ CORREGIDO
                      type="time"
                      value={form.hora_aproximada_fin} // ✅ CORREGIDO
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.hora_aproximada_fin ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {formErrors.hora_aproximada_fin && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hora_aproximada_fin}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.descripcion ? "border-red-500" : "border-gray-300"
                        }`}
                      rows={2}
                      placeholder="Descripción del evento"
                    />
                    {formErrors.descripcion && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (URL)</label>
                    <input
                      name="imagen"
                      value={form.imagen}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${formErrors.imagen ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    {formErrors.imagen && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.imagen}</p>
                    )}
                  </div>
                </form>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="form-evento"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {modal === "crear" ? "Registrar" : "Actualizar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== MODAL VER ===================== */}
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
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Detalles del Evento</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    {selected.imagen ? (
                      <img
                        src={selected.imagen}
                        alt="Evento"
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
                      <div>{selected.id_evento}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Nombre</div>
                      <div>{selected.nombre_evento}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Categoría</div>
                      <div>{getNombreCategoria(selected.id_categoria_evento)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Patrocinador</div>
                      <div>{getNombrePatrocinador(selected.id_patrocinador)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Sede</div>
                      <div>{getNombreSede(selected.id_sede)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Fecha</div>
                      <div>{selected.fecha_evento}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Hora inicio</div>
                      <div>{selected.hora_inicio || "—"}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Hora fin estimada</div>
                      <div>{selected.hora_aproximada_fin || "—"}</div> {/* ✅ CORREGIDO */}
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Estado</div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${selected.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {selected.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-600 mb-1">Descripción</div>
                  <div>{selected.descripcion || "—"}</div>
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

        {/* ===================== MODAL ELIMINAR ===================== */}
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
                  Eliminar Evento
                </h3>

                <p className="text-gray-700 text-center">
                  ¿Está seguro de eliminar el evento{" "}
                  <span className="font-bold">{selected.nombre_evento}</span>?
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