import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../../../services/api";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ClassLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modales
  const [modalType, setModalType] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [formData, setFormData] = useState({ nombre_nivel: "", descripcion: "", estado: "Activo" });
  const [formErrors, setFormErrors] = useState({});

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await api.get("/niveles");
      setLevels(res.data);
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar niveles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const openModal = (type, level = null) => {
    setModalType(type);
    setSelectedLevel(level);
    if (type === "editar" && level) {
      setFormData({
        nombre_nivel: level.nombre_nivel,
        descripcion: level.descripcion || "",
        estado: level.estado
      });
    } else {
      setFormData({ nombre_nivel: "", descripcion: "", estado: "Activo" });
    }
    setFormErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedLevel(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!formData.nombre_nivel.trim()) {
      setFormErrors({ nombre_nivel: "El nombre es obligatorio" });
      return;
    }

    try {
      if (modalType === "crear") {
        await api.post("/niveles", formData);
        showNotification("Nivel creado");
      } else {
        await api.put(`/niveles/${selectedLevel.id_nivel_clase}`, formData);
        showNotification("Nivel actualizado");
      }
      fetchLevels();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/niveles/${selectedLevel.id_nivel_clase}`);
      showNotification("Nivel eliminado");
      fetchLevels();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    }
  };

  const filteredLevels = Array.isArray(levels) ? levels.filter(lvl =>
    lvl.nombre_nivel.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const totalPages = Math.max(1, Math.ceil(filteredLevels.length / itemsPerPage));
  const currentItems = filteredLevels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Search Area */}
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Clases / Niveles
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-100">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                <span className="text-xs font-bold">{filteredLevels.length} niveles</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar nivel por nombre..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => openModal("crear")}
            className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />
            Nuevo Nivel
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left relative">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Nivel</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Descripción</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400 text-sm italic">Cargando niveles...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">No se encontraron niveles</td></tr>
                ) : (
                  currentItems.map((lvl) => (
                    <tr key={lvl.id_nivel_clase} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#040529] text-sm">{lvl.nombre_nivel}</td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">{lvl.descripcion || "—"}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold border transition-colors capitalize",
                          lvl.estado === 'Activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                        )}>
                          {lvl.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal("ver", lvl)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                            title="Ver"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal("editar", lvl)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => openModal("eliminar", lvl)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLevels.length > 0 && (
            <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Página <span className="font-bold text-[#040529]">{currentPage}</span> de <span className="font-bold text-[#040529]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-bold ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modalType === "eliminar" ? "max-w-sm w-full" : "max-w-md w-full"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#040529]">
                    {modalType === "crear" ? "Nuevo Nivel" :
                      modalType === "editar" ? "Editar Nivel" :
                        modalType === "ver" ? "Detalles" : "Eliminar"}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]">
                    <X size={20} />
                  </button>
                </div>

                {modalType === "eliminar" ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-6">¿Estás seguro de eliminar el nivel <span className="font-bold text-red-600">{selectedLevel?.nombre_nivel}</span>?</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Eliminar</button>
                    </div>
                  </div>
                ) : modalType === "ver" ? (
                  <div className="space-y-4">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nombre del Nivel</label><p className="text-sm font-bold text-[#040529]">{selectedLevel?.nombre_nivel}</p></div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Descripción</label><p className="text-sm text-slate-600 leading-relaxed">{selectedLevel?.descripcion || "Sin descripción disponible"}</p></div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estado</label><p className="text-sm font-bold text-[#040529]">{selectedLevel?.estado}</p></div>
                    <button onClick={closeModal} className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition">Cerrar</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nombre del Nivel *</label>
                      <input
                        type="text"
                        value={formData.nombre_nivel}
                        onChange={(e) => setFormData({ ...formData, nombre_nivel: e.target.value })}
                        className={cn(
                          "w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition",
                          formErrors.nombre_nivel && "border-red-400 bg-red-50"
                        )}
                        placeholder="Ej: Básico"
                      />
                      {formErrors.nombre_nivel && <p className="text-[10px] text-red-500 mt-1">{formErrors.nombre_nivel}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Descripción</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition min-h-[100px] resize-none"
                        placeholder="Descripción opcional..."
                      />
                    </div>
                    {modalType === "editar" && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estado</label>
                        <select
                          value={formData.estado}
                          onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>
                    )}
                    <button onClick={handleSave} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition">
                      {modalType === "crear" ? "Crear Nivel" : "Guardar Cambios"}
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

export default ClassLevels;
