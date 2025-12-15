// src/features/dashboards/admin/pages/clases/planes/PlanClasses.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion"; 
import {
  getPlanes,
  createPlan,
  updatePlan,
  deletePlan
} from "../../services/planclassServices";

export const PlanClasses = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    nombre_plan: "",
    descripcion: "",
    precio: "",
    descuento_porcentaje: "",
    numero_clases: "4"
  });
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchPlanes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlanes();
      setPlanes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando planes:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (type, plan = null) => {
    setModalType(type);
    setSelectedPlan(plan);
    if (type === "add") {
      setFormData({
        nombre_plan: "",
        descripcion: "",
        precio: "",
        descuento_porcentaje: "",
        numero_clases: "4"
      });
    } else if (type === "edit" && plan) {
      setFormData({
        nombre_plan: plan.nombre_plan || "",
        descripcion: plan.descripcion || "",
        precio: plan.precio != null ? String(plan.precio) : "",
        descuento_porcentaje: plan.descuento_porcentaje != null ? String(plan.descuento_porcentaje) : "",
        numero_clases: plan.numero_clases != null ? String(plan.numero_clases) : "4"
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPlan(null);
    setFormData({
      nombre_plan: "",
      descripcion: "",
      precio: "",
      descuento_porcentaje: "",
      numero_clases: "4"
    });
  };

  const handleCreate = async () => {
    try {
      if (!formData.nombre_plan || formData.precio === "") {
        showNotification("Nombre y precio son obligatorios", "error");
        return;
      }

      await createPlan({
        nombre_plan: formData.nombre_plan,
        descripcion: formData.descripcion,
        precio: formData.precio,
        descuento_porcentaje: formData.descuento_porcentaje || "0",
        numero_clases: formData.numero_clases || "4"
      });

      await fetchPlanes();
      closeModal();
      showNotification("Plan creado con éxito");
    } catch (err) {
      console.error("Error creando plan:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando plan";
      showNotification(errorMessage, "error");
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedPlan) return;
      if (!formData.nombre_plan || formData.precio === "") {
        showNotification("Nombre y precio son obligatorios", "error");
        return;
      }

      await updatePlan(selectedPlan.id_plan, {
        nombre_plan: formData.nombre_plan,
        descripcion: formData.descripcion,
        precio: formData.precio,
        descuento_porcentaje: formData.descuento_porcentaje || "0",
        numero_clases: formData.numero_clases || "4"
      });

      await fetchPlanes();
      closeModal();
      showNotification("Plan actualizado con éxito");
    } catch (err) {
      console.error("Error editando plan:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando plan";
      showNotification(errorMessage, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedPlan) return;
      await deletePlan(selectedPlan.id_plan);
      await fetchPlanes();
      closeModal();
      showNotification("Plan eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando plan:", err);
      const errorMessage = err.response?.data?.mensaje || "Error eliminando plan";
      showNotification(errorMessage, "error");
    }
  };

  const planesFiltrados = planes.filter((p) =>
    p.nombre_plan?.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.precio).includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(planesFiltrados.length / itemsPerPage));
  const currentItems = planesFiltrados.slice(
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Clases / Planes de Clases</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar plan (Nombre, Descripción, Precio)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Añadir Plan
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[20%]">Nombre</th>
                    <th className="px-6 py-3 w-[25%]">Descripción</th>
                    <th className="px-6 py-3 w-[10%]">Precio</th>
                    <th className="px-6 py-3 w-[10%]">Descuento</th>
                    <th className="px-6 py-3 w-[15%]">Clases</th>
                    <th className="px-6 py-3 w-[20%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Cargando planes...
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
                        No hay planes registrados.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((plan) => (
                      <tr key={plan.id_plan} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{plan.nombre_plan}</td>
                        <td className="px-6 py-4 text-gray-600">{plan.descripcion}</td>
                        <td className="px-6 py-4 text-gray-600">${plan.precio}</td>
                        <td className="px-6 py-4 text-gray-600">{plan.descuento_porcentaje}%</td>
                        <td className="px-6 py-4 text-gray-600">{plan.numero_clases} clases</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("details", plan)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("edit", plan)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("delete", plan)}
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

          {planesFiltrados.length > 0 && (
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
                    ? "Agregar Plan"
                    : modalType === "edit"
                    ? "Editar Plan"
                    : modalType === "details"
                    ? "Detalles del Plan"
                    : "Eliminar Plan"}
                </h3>

                {modalType === "add" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Plan *
                      </label>
                      <input
                        type="text"
                        name="nombre_plan"
                        value={formData.nombre_plan}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Mensual"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio *
                      </label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 45000"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        name="descuento_porcentaje"
                        value={formData.descuento_porcentaje}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 10"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de clases *
                      </label>
                      <input
                        type="number"
                        name="numero_clases"
                        value={formData.numero_clases}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 4"
                        min="1"
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
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Acceso ilimitado a clases mensuales"
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
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "edit" && selectedPlan && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Plan *
                      </label>
                      <input
                        type="text"
                        name="nombre_plan"
                        value={formData.nombre_plan}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Mensual"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio *
                      </label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 45000"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        name="descuento_porcentaje"
                        value={formData.descuento_porcentaje}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 10"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de clases *
                      </label>
                      <input
                        type="number"
                        name="numero_clases"
                        value={formData.numero_clases}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 4"
                        min="1"
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
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Acceso ilimitado a clases mensuales"
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

                {modalType === "details" && selectedPlan && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span className="text-right">{selectedPlan.nombre_plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descripción:</span>
                      <span className="text-right">{selectedPlan.descripcion || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Precio:</span>
                      <span className="text-right">${selectedPlan.precio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descuento:</span>
                      <span className="text-right">{selectedPlan.descuento_porcentaje}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Clases:</span>
                      <span className="text-right">{selectedPlan.numero_clases} clases</span>
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

                {modalType === "delete" && selectedPlan && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Estás seguro de eliminar el plan{" "}
                      <span className="font-bold text-red-600">{selectedPlan.nombre_plan}</span>?
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

export default PlanClasses;