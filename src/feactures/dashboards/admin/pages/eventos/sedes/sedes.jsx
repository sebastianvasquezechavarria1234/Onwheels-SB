import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSedes,
  createSede,
  updateSede,
  deleteSede,
} from "../../services/sedesServices";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  
  // Forms separate due to implementation structure
  const [editForm, setEditForm] = useState({
    nombre_sede: "",
    direccion: "",
    ciudad: "",
    telefono: "", 
  });
  const [addForm, setAddForm] = useState({
    nombre_sede: "",
    direccion: "",
    ciudad: "",
    telefono: "", 
  });

  // Validation State
  const [formErrors, setFormErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // ===================== VALIDACIONES =====================
  const validateField = (name, value, isAdd = true) => {
    let error = "";
    
    // Si estamos editando y el campo no pertenece al form de add, etc.
    // Simplificación: validamos el valor per se.

    if (name === "nombre_sede") {
        if (!value || !value.trim()) error = "El nombre es obligatorio";
        else if (value.trim().length < 3) error = "El nombre debe tener al menos 3 caracteres";
    }

    if (name === "direccion") {
        if (!value || !value.trim()) error = "La dirección es obligatoria";
        else if (value.trim().length < 5) error = "Dirección muy corta";
        else if (value.trim().length > 100) error = "Dirección demasiado larga";
    }

    if (name === "ciudad") {
        if (!value || !value.trim()) error = "La ciudad es obligatoria";
        else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(value.trim())) error = "Ciudad inválida (solo letras)";
    }

    if (name === "telefono") {
        if (!value || !value.trim()) error = "El teléfono es obligatorio";
        else if (!/^[0-9+\s()-]{7,20}$/.test(value.trim())) error = "Teléfono inválido";
    }

    // Actualizamos errores
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = (form) => {
      const ok1 = validateField("nombre_sede", form.nombre_sede);
      const ok2 = validateField("direccion", form.direccion);
      const ok3 = validateField("ciudad", form.ciudad);
      const ok4 = validateField("telefono", form.telefono);
      return ok1 && ok2 && ok3 && ok4;
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetchSedes();
  }, []);

  const fetchSedes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSedes();
      setSedes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando sedes:", err);
      setError("No se pudieron cargar las sedes.");
      showNotification("Error al cargar sedes", "error");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormErrors({}); // Reset errors
    if (type === "add") {
      setAddForm({
        nombre_sede: "",
        direccion: "",
        ciudad: "",
        telefono: "", 
      });
      setSelected(null);
    } else if (type === "edit" && item) {
      setSelected(item);
      setEditForm({
        nombre_sede: item.nombre_sede || "",
        direccion: item.direccion || "",
        ciudad: item.ciudad || "",
        telefono: item.telefono || "", 
      });
    } else {
      setSelected(item);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
    setFormErrors({});
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value, true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value, false);
  };

  const saveAdd = async () => {
    if (!validateAll(addForm)) {
         showNotification("Por favor corrija los errores", "error");
         return;
    }

    const payload = {
      nombre_sede: addForm.nombre_sede.trim(),
      direccion: addForm.direccion.trim(),
      ciudad: addForm.ciudad.trim(),
      telefono: addForm.telefono.trim(),
    };

    try {
      const newSede = await createSede(payload);
      setSedes((prev) => [newSede, ...prev]);
      closeModal();
      showNotification("Sede creada con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al crear la sede", "error");
    }
  };

  const saveEdit = async () => {
    if (!selected) return closeModal();
    
    if (!validateAll(editForm)) {
         showNotification("Por favor corrija los errores", "error");
         return;
    }

    const payload = {
      nombre_sede: editForm.nombre_sede.trim(),
      direccion: editForm.direccion.trim(),
      ciudad: editForm.ciudad.trim(),
      telefono: editForm.telefono.trim(), 
    };

    try {
      await updateSede(selected.id_sede, payload);
      setSedes((prev) =>
        prev.map((s) => (s.id_sede === selected.id_sede ? { ...s, ...payload } : s))
      );
      closeModal();
      showNotification("Sede actualizada con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al actualizar la sede", "error");
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteSede(selected.id_sede);
      setSedes((prev) => prev.filter((s) => s.id_sede !== selected.id_sede));
      closeModal();
      showNotification("Sede eliminada con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al eliminar la sede", "error");
    }
  };

  // Filtrado por nombre
  const sedesFiltradas = sedes.filter((s) =>
    s.nombre_sede?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(sedesFiltradas.length / itemsPerPage));
  const currentItems = sedesFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración / Sedes</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="text"
                placeholder="Buscar sede (ej: La 70)"
              />
            </div>
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar Nueva Sede
            </button>
          </div>

          <div className="p-[30px]">
            {/* Encabezados estilo Roles */}
            <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
              <p className="w-[10%] font-bold opacity-80">ID</p>
              <p className="w-[25%] font-bold opacity-80">Nombre</p>
              <p className="w-[30%] font-bold opacity-80">Dirección</p>
              <p className="w-[15%] font-bold opacity-80">Ciudad</p>
              <p className="w-[10%] font-bold opacity-80">Teléfono</p>
              <p className="w-[15%] font-bold opacity-80">Acciones</p>
            </article>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-600">
                <thead className="">
                  <tr><th className="hidden" /></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 italic text-gray-500">
                        Cargando sedes...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 italic text-red-700">
                        No hay sedes registradas
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((s) => (
                      <tr key={s.id_sede} className="py-[18px] border-b border-black/20 flex items-center">
                        <td className="px-6 py-[18px] w-[10%]">{s.id_sede}</td>
                        <td className="px-6 py-[18px] w-[25%] line-clamp-1">{s.nombre_sede}</td>
                        <td className="px-6 py-[18px] w-[30%] line-clamp-2">{s.direccion}</td>
                        <td className="px-6 py-[18px] w-[15%]">{s.ciudad}</td>
                        <td className="px-6 py-[18px] w-[10%]">{s.telefono}</td>

                        <td className="px-6 py-[18px] w-[15%] flex gap-[10px] items-center justify-center">
                          <motion.button
                            onClick={() => openModal("details", s)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>

                          <motion.button
                            onClick={() => openModal("edit", s)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                          >
                            <Pencil className="h-4 w-4" />
                          </motion.button>

                          <motion.button
                            onClick={() => openModal("delete", s)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {sedesFiltradas.length > 0 && (
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
          {modalType && (
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
                  {modalType === "add"
                    ? "Registrar Nueva Sede"
                    : modalType === "edit"
                    ? "Editar Sede"
                    : modalType === "details"
                    ? "Detalles de la Sede"
                    : "Eliminar Sede"}
                </h3>

                {modalType === "add" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        name="nombre_sede"
                        value={addForm.nombre_sede}
                        onChange={handleAddChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.nombre_sede ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Ej: Skatepark La 70"
                      />
                      {formErrors.nombre_sede && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_sede}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                      <input
                        name="direccion"
                        value={addForm.direccion}
                        onChange={handleAddChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.direccion ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Calle 10 #45-20"
                      />
                      {formErrors.direccion && <p className="text-red-500 text-xs mt-1">{formErrors.direccion}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                      <input
                        name="ciudad"
                        value={addForm.ciudad}
                        onChange={handleAddChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.ciudad ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Medellín"
                      />
                      {formErrors.ciudad && <p className="text-red-500 text-xs mt-1">{formErrors.ciudad}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                      <input
                        name="telefono" 
                        value={addForm.telefono}
                        onChange={handleAddChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.telefono ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="+57 300 123 4567"
                      />
                      {formErrors.telefono && <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>}
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
                        onClick={saveAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "edit" && selected && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        name="nombre_sede"
                        value={editForm.nombre_sede}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.nombre_sede ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Ej: Skatepark La 70"
                      />
                      {formErrors.nombre_sede && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_sede}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                      <input
                        name="direccion"
                        value={editForm.direccion}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.direccion ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Calle 10 #45-20"
                      />
                      {formErrors.direccion && <p className="text-red-500 text-xs mt-1">{formErrors.direccion}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                      <input
                        name="ciudad"
                        value={editForm.ciudad}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.ciudad ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Medellín"
                      />
                      {formErrors.ciudad && <p className="text-red-500 text-xs mt-1">{formErrors.ciudad}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                      <input
                        name="telefono" 
                        value={editForm.telefono}
                        onChange={handleEditChange}
                        className={`w-full px-3 py-2 border rounded-lg outline-none ${formErrors.telefono ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="+57 300 123 4567"
                      />
                      {formErrors.telefono && <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>}
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
                        onClick={saveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "details" && selected && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span>{selected.nombre_sede}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dirección:</span>
                      <span className="text-right">{selected.direccion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ciudad:</span>
                      <span>{selected.ciudad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span>{selected.telefono}</span> 
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

                {modalType === "delete" && selected && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar la sede{" "}
                      <span className="font-bold text-red-600">{selected.nombre_sede}</span>?
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
                        onClick={confirmDelete}
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
}