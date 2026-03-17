import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../../../services/api";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PlanesAdmin = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modales
  const [modalType, setModalType] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    nombre_plan: "",
    descripcion: "",
    precio: "",
    numero_clases: 4,
    descuento_porcentaje: 0,
    duracion_meses: 1
  });
  const [formErrors, setFormErrors] = useState({});

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/planes");
      setPlanes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar planes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const openModal = (type, plan = null) => {
    setModalType(type);
    setSelectedPlan(plan);
    if (type === "editar" && plan) {
      setFormData({
        nombre_plan: plan.nombre_plan,
        descripcion: plan.descripcion || "",
        precio: plan.precio,
        numero_clases: plan.numero_clases || 4,
        descuento_porcentaje: plan.descuento_porcentaje || 0,
        duracion_meses: plan.duracion_meses || 1
      });
    } else {
      setFormData({ nombre_plan: "", descripcion: "", precio: "", numero_clases: 4, descuento_porcentaje: 0, duracion_meses: 1 });
    }
    setFormErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPlan(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.nombre_plan.trim()) errors.nombre_plan = "El nombre es obligatorio";
    if (!formData.descripcion.trim() || formData.descripcion.length > 700) errors.descripcion = "La descripción es obligatoria y no superior a 700 col";
    if (!formData.precio) errors.precio = "El precio es obligatorio";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (modalType === "crear") {
        await api.post("/planes", formData);
        showNotification("Plan creado");
      } else {
        await api.put(`/planes/${selectedPlan.id_plan}`, formData);
        showNotification("Plan actualizado");
      }
      fetchPlanes();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/planes/${selectedPlan.id_plan}`);
      showNotification("Plan eliminado");
      fetchPlanes();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    }
  };

  const filteredPlanes = planes.filter(p =>
    p.nombre_plan.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPlanes.length / itemsPerPage));
  const currentItems = filteredPlanes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Clases / Planes
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
              <span className="text-xs font-bold">{filteredPlanes.length} planes</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar plan por nombre..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => openModal("crear")}
            className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />
            Nuevo Plan
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left relative">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Precio</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Clases</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Duración</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400 text-sm italic">Cargando planes...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">No se encontraron planes</td></tr>
                ) : (
                  currentItems.map((p) => (
                    <tr key={p.id_plan} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#040529] text-sm">{p.nombre_plan}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#040529] text-sm">${Number(p.precio).toLocaleString('es-CO')}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          {p.numero_clases} clases
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          {p.duracion_meses || 1} {p.duracion_meses === 1 ? 'mes' : 'meses'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("editar", p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => { setSelectedPlan(p); openModal("eliminar", p); }} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredPlanes.length > 0 && (
            <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">Página <span className="font-bold text-[#040529]">{currentPage}</span> de <span className="font-bold text-[#040529]">{totalPages}</span></p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 shadow-sm transition"><ChevronLeft className="h-4 w-4" /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 shadow-sm transition"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-bold ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalType && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modalType === "eliminar" ? "max-w-sm w-full" : "max-w-md w-full"}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#040529]">{modalType === "crear" ? "Nuevo Plan" : modalType === "editar" ? "Editar Plan" : "Eliminar"}</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                </div>

                {modalType === "eliminar" ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-6">¿Estás seguro de eliminar el plan <span className="font-bold text-red-600">{selectedPlan?.nombre_plan}</span>?</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg transition">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg transition">Eliminar</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre *</label>
                      <input type="text" value={formData.nombre_plan} onChange={(e) => setFormData({ ...formData, nombre_plan: e.target.value })} className={cn("w-full px-4 py-3 text-sm rounded-xl border outline-none transition", formErrors.nombre_plan && "border-red-400 bg-red-50")} placeholder="Ej: Plan Básico" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Descripción *</label>
                        <span className={`text-[10px] font-bold ${formData.descripcion.length >= 700 ? 'text-red-500' : 'text-slate-400'}`}>
                          {formData.descripcion.length}/700
                        </span>
                      </div>
                      <textarea 
                        maxLength={700}
                        rows={3}
                        value={formData.descripcion} 
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                        className={cn("w-full px-4 py-3 text-sm rounded-xl border outline-none transition resize-none", formErrors.descripcion && "border-red-400 bg-red-50")} 
                        placeholder="Ej: Formación intensiva de alto rendimiento..." 
                      />
                      {formErrors.descripcion && <span className="text-red-500 text-xs font-medium mt-1 inline-block">{formErrors.descripcion}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Precio *</label>
                        <input type="number" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clases *</label>
                        <input type="number" value={formData.numero_clases} onChange={(e) => setFormData({ ...formData, numero_clases: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duración (Meses) *</label>
                        <input type="number" value={formData.duracion_meses} onChange={(e) => setFormData({ ...formData, duracion_meses: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" min="1" />
                      </div>
                    </div>
                    <button onClick={handleSave} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg transition">
                      {modalType === "crear" ? "Crear Plan" : "Guardar Cambios"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanesAdmin;