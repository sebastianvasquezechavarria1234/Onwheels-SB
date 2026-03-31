import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../../../services/api";

import { configUi, cn } from "../../configuracion/configUi";
export default function CategoriaProductos() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  
  // Backend Pagination State
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPorPagina = 10;

  // Modal y formularios
  const [modalType, setModalType] = useState(null); // "add", "edit", "details", "delete"
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ nombre_categoria: "", descripcion: "" });
  const [formErrors, setFormErrors] = useState({});

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchCategorias();
  }, [paginaActual, search]);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categoria-productos", {
        params: {
          page: paginaActual,
          limit: itemsPorPagina,
          search: search
        }
      });
      
      const data = res.data;
      if (data && data.categorias) {
        setCategorias(data.categorias);
        setTotalPaginas(data.totalPages || 1);
        setTotalItems(data.totalCategorias || 0);
      } else {
        setCategorias(Array.isArray(data) ? data : []);
        setTotalPaginas(1);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar las categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if (type === "edit" && item) {
      setFormData({ nombre_categoria: item.nombre_categoria || "", descripcion: item.descripcion || "" });
    } else {
      setFormData({ nombre_categoria: "", descripcion: "" });
    }
    setFormErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!formData.nombre_categoria.trim()) {
      setFormErrors({ nombre_categoria: "El nombre es obligatorio" });
      return;
    }

    try {
      if (modalType === "add") {
        await api.post("/categoria-productos", formData);
        showNotification("Categoría creada");
      } else {
        await api.put(`/categoria-productos/${selected.id_categoria}`, formData);
        showNotification("Categoría actualizada");
      }
      fetchCategorias();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categoria-productos/${selected.id_categoria}`);
      showNotification("Categoría eliminada");
      fetchCategorias();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    }
  };

  const filteredCategorias = categorias.filter(c =>
    c.nombre_categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={configUi.pageShell}>
      {/* --- SECTION 1: HEADER & TOOLBAR --- */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
            Categorías de productos
          </h2>
          <span className={configUi.countBadge}>{totalItems} categorías</span>
        </div>

        <div className={configUi.toolbar}>
          {/* Search Bar */}
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
              className={configUi.inputWithIcon}
            />
          </div>

          <button
            onClick={() => openModal("add")}
            className={`${configUi.primaryButton} whitespace-nowrap`}
          >
            <Plus size={18} />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* --- SECTION 2: TABLE AREA --- */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
              <thead className="bg-[#dbeafe] text-[#16315f] sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-16">ID</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef]">Nombre</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef]">Descripción</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sincronizando categorías...</p>
                      </div>
                    </td>
                  </tr>
                ) : categorias.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                         <Search className="text-slate-200" size={32} />
                       </div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin resultados</p>
                    </td>
                  </tr>
                ) : (
                  categorias.map((c) => (
                    <tr key={c.id_categoria} className={configUi.row}>
                      <td className={configUi.td}>
                        <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">#{c.id_categoria}</span>
                      </td>
                      <td className={`${configUi.td} font-bold text-[#16315f] uppercase tracking-tight`}>{c.nombre_categoria}</td>
                      <td className={configUi.td}>
                        <p className="text-[11px] text-[#6b84aa] font-medium max-w-sm truncate leading-none">{c.descripcion || "—"}</p>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal("details", c)} className={configUi.actionButton}><Eye size={14} /></button>
                          <button onClick={() => openModal("edit", c)} className={configUi.actionButton}><Pencil size={14} /></button>
                          <button onClick={() => openModal("delete", c)} className={configUi.actionDangerButton}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={configUi.paginationBar}>
            <p className="text-sm font-bold text-slate-500">
              Página <span className="text-[#16315f]">{paginaActual}</span> de <span className="text-[#16315f]">{totalPaginas}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                className={configUi.paginationButton}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                className={configUi.paginationButton}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 rounded-3xl shadow-2xl text-[11px] font-black uppercase tracking-[0.2em] border backdrop-blur-md flex items-center gap-3 ${
              notification.type === "success" 
                ? "bg-slate-900/90 text-white border-slate-700" 
                : "bg-rose-500/90 text-white border-rose-400"
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${notification.type === "success" ? "bg-emerald-400" : "bg-white"}`} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalType && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#040529]/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className={`bg-white rounded-3xl shadow-2xl relative overflow-hidden border border-gray-200 ${modalType === "delete" ? "max-w-sm w-full" : "max-w-md w-full"}`} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                       {modalType === "add" ? "Nueva Categoría" : modalType === "edit" ? "Editar Categoría" : modalType === "details" ? "Detalles" : "Eliminar"}
                     </h3>
                     <p className="text-xs text-slate-400 font-medium">{modalType === "add" || modalType === "edit" ? "Complete los campos del registro" : "Revisión de información"}</p>
                  </div>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-slate-900"><X size={24} /></button>
                </div>

                {modalType === "delete" ? (
                  <div className="text-center space-y-8">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                      <Trash2 size={32} className="text-rose-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">¿Confirmas la eliminación de <span className="text-slate-900 font-bold">"{selected?.nombre_categoria}"</span>? Esta acción no podrá revertirse.</p>
                    </div>
                     <div className="flex flex-col gap-3">
                       <button onClick={handleDelete} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95">Eliminar Categoría</button>
                       <button onClick={closeModal} className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">Cancelar</button>
                     </div>
                  </div>
                ) : modalType === "details" ? (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificador</label>
                        <p className="text-sm font-black text-slate-800 ml-1">#{selected?.id_categoria}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                        <p className="text-sm font-black text-slate-800 ml-1">{selected?.nombre_categoria}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed italic">
                          "{selected?.descripcion || "Sin descripción disponible"}"
                        </div>
                      </div>
                    </div>
                    <button onClick={closeModal} className="w-full py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Entendido</button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Categoría *</label>
                         <input 
                           type="text" 
                           value={formData.nombre_categoria} 
                           onChange={(e) => setFormData({ ...formData, nombre_categoria: e.target.value })} 
                           className={cn("w-full px-5 py-3 text-sm font-bold text-[#040529] bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all placeholder:text-gray-300 shadow-sm", formErrors.nombre_categoria && "border-rose-400 bg-rose-50")} 
                           placeholder="Ej: Calzado Deportivo" 
                         />
                        {formErrors.nombre_categoria && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-1">{formErrors.nombre_categoria}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Detallada</label>
                         <textarea 
                           value={formData.descripcion} 
                           onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                           className="w-full px-5 py-3 text-sm font-bold text-[#040529] bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none min-h-[120px] resize-none transition-all placeholder:text-gray-300 shadow-sm" 
                           placeholder="Agregue contexto adicional..." 
                         />
                      </div>
                    </div>
                     <div className="pt-4 flex gap-3">
                        <button onClick={closeModal} className="flex-1 py-3.5 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">Cancelar</button>
                        <button onClick={handleSave} className="flex-[2] py-3.5 bg-[#040529] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#040529]/10 hover:bg-[#040529]/90 transition-all active:scale-95">
                          {modalType === "add" ? "Registrar Categoría" : "Guardar Cambios"}
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
