import React, { useEffect, useState, useCallback } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Hash, User, Briefcase, Info, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../../../services/api";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  
  // Backend Pagination State
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPorPagina = 10;

  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    nombre_proveedor: "",
    email: "",
    telefono: "",
    direccion: "",
    nit: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [paginaActual, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/proveedores", {
        params: {
          page: paginaActual,
          limit: itemsPorPagina,
          search: search
        }
      });
      
      const data = res.data;
      if (data && data.proveedores) {
        setProveedores(data.proveedores);
        setTotalPaginas(data.totalPages || 1);
        setTotalItems(data.totalProveedores || 0);
      } else {
        setProveedores(Array.isArray(data) ? data : []);
        setTotalPaginas(1);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar proveedores", "error");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if ((type === "edit" || type === "details") && item) {
      setFormData({
        nombre_proveedor: item.nombre_proveedor || "",
        email: item.email || "",
        telefono: item.telefono || "",
        direccion: item.direccion || "",
        nit: item.nit || ""
      });
    } else {
      setFormData({ nombre_proveedor: "", email: "", telefono: "", direccion: "", nit: "" });
    }
    setFormErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!formData.nombre_proveedor || !formData.email || !formData.nit) {
      showNotification("Completa los campos obligatorios (Nombre, Email, NIT)", "error");
      return;
    }

    try {
      if (modalType === "add") {
        await api.post("/proveedores", formData);
        showNotification("Proveedor creado");
      } else {
        await api.put(`/proveedores/${selected.nit}`, formData);
        showNotification("Proveedor actualizado");
      }
      fetchData();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/proveedores/${selected.nit}`);
      showNotification("Proveedor eliminado");
      fetchData();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    }
  };

  const filtered = proveedores.filter(p =>
    p.nombre_proveedor?.toLowerCase().includes(search.toLowerCase()) ||
    p.nit?.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-['Outfit']">
      {/* Header & Stats */}
      <div className="shrink-0 flex flex-col gap-6 p-8 pb-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#040529] font-['Outfit'] tracking-tight">
              Aliados Estratégicos
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span>{totalItems} proveedores totales</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Gestión de suministros</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => {/* Lógica de descarga */}}
              className="p-2.5 text-gray-400 hover:text-[#040529] hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm"
              title="Descargar Reporte"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#040529] text-white rounded-xl text-sm font-bold hover:bg-[#040529]/90 transition-all shadow-lg shadow-[#040529]/10 active:scale-95"
            >
              <Plus size={18} />
              <span>Nuevo Proveedor</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#040529] transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
              placeholder="Buscar por NIT, razón social o contacto..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#bfd1f4] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#dbeafe] focus:border-[#7da7e8] outline-none transition-all text-sm text-[#16315f]"
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-8 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-[1.6rem] border border-[#bfd1f4] shadow-[0_16px_40px_-28px_rgba(34,58,99,0.8)] flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full min-w-[860px] text-left border-separate border-spacing-0">
              <thead className="bg-[#dbeafe] text-[#16315f] sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef]">Proveedor / NIT</th>
                  <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef]">Contacto Directo</th>
                  <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sincronizando aliados...</p>
                      </div>
                    </td>
                  </tr>
                ) : proveedores.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                         <Briefcase className="text-slate-200" size={32} />
                       </div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin resultados</p>
                    </td>
                  </tr>
                ) : (
                  proveedores.map((p) => (
                    <tr key={p.nit} className="group hover:bg-[#f8fbff] transition-all">
                      <td className="px-3 py-2.5 border-b border-[#d7e5f8] font-bold text-[#16315f] text-sm">
                        <div className="flex flex-col">
                           <span>{p.nombre_proveedor}</span>
                           <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase leading-none mt-1">NIT: {p.nit || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-[#d7e5f8]">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                             <Mail size={12} className="text-indigo-500" />
                             {p.email}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 italic">
                             <MapPin size={10} className="text-slate-300" />
                             {p.direccion || "Dirección no registrada"}
                           </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-[#d7e5f8] text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("details", p)} className="p-2.5 rounded-xl bg-white text-[#6a85ad] hover:text-[#16315f] shadow-sm border border-[#bfd1f4] transition-all hover:scale-105"><Eye size={16} /></button>
                          <button onClick={() => openModal("edit", p)} className="p-2.5 rounded-xl bg-white text-[#6a85ad] hover:text-[#16315f] shadow-sm border border-[#bfd1f4] transition-all hover:scale-105"><Pencil size={16} /></button>
                          <button onClick={() => openModal("delete", p)} className="p-2.5 rounded-xl bg-[#fff1f3] text-[#d44966] hover:bg-[#ffe4e8] shadow-sm border border-[#f5c4cc] transition-all hover:scale-105"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-[#d7e5f8] px-5 py-4 bg-[#fbfdff] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#6b84aa]">
              Mostrando <span className="font-bold text-[#16315f]">{proveedores.length}</span> de <span className="font-bold text-[#16315f]">{totalItems}</span> registros
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-[#bfd1f4] bg-white hover:bg-[#f8fbff] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-[#6a85ad]"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      paginaActual === i + 1
                        ? "bg-[#223a63] text-white shadow-lg shadow-[#223a63]/20"
                        : "text-[#6b84aa] hover:text-[#16315f] hover:bg-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                className="p-2 rounded-xl border border-[#bfd1f4] bg-white hover:bg-[#f8fbff] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-[#6a85ad]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
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
            <motion.div className={`bg-white rounded-3xl shadow-2xl relative overflow-hidden border border-gray-200 ${modalType === "delete" ? "max-w-sm w-full" : "max-w-4xl w-full"}`} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                       {modalType === "add" ? "Nuevo Aliado" : modalType === "edit" ? "Editar Aliado" : modalType === "details" ? "Ficha de Proveedor" : "Eliminar Registro"}
                     </h3>
                     <p className="text-xs text-slate-400 font-medium">{modalType === "add" || modalType === "edit" ? "Complete la información comercial" : "Resumen de perfil comercial"}</p>
                  </div>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-slate-900"><X size={24} /></button>
                </div>

                {modalType === "delete" ? (
                  <div className="text-center space-y-8">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                      <Trash2 size={32} className="text-rose-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">¿Confirmas la baja permanente del aliado <span className="text-slate-900 font-bold">"{selected?.nombre_proveedor}"</span>?</p>
                    </div>
                     <div className="flex flex-col gap-3">
                       <button onClick={handleDelete} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95">Eliminar Proveedor</button>
                       <button onClick={closeModal} className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">Cancelar</button>
                     </div>
                  </div>
                ) : modalType === "details" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
                            <p className="text-lg font-black text-slate-800 ml-1 leading-none">{formData.nombre_proveedor}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIT / Documento</label>
                            <p className="text-lg font-black text-slate-800 ml-1 leading-none">{formData.nit || "N/A"}</p>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">Información de Contacto</h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                                   <Mail size={18} />
                                </div>
                                <div className="truncate">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Correo</p>
                                   <p className="text-xs font-bold text-slate-600 truncate">{formData.email}</p>
                                </div>
                             </div>
                             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                                   <Phone size={18} />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Línea</p>
                                   <p className="text-xs font-bold text-slate-600">{formData.telefono || "N/A"}</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domicilio Fiscal</label>
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                             <MapPin size={18} className="text-slate-300 shrink-0" />
                             <p className="text-xs font-bold text-slate-600">{formData.direccion || "Sin dirección registrada"}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                       <div className="space-y-6">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                             <Briefcase size={28} className="text-white" />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estado Aliado</p>
                             <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30 inline-block">Verificado</span>
                          </div>
                       </div>
                       <button onClick={closeModal} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-8">Cerrar Ficha</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social *</label>
                         <input 
                           type="text" 
                           value={formData.nombre_proveedor} 
                           onChange={(e) => setFormData({ ...formData, nombre_proveedor: e.target.value })} 
                           className="w-full px-5 py-3 text-sm font-bold text-[#040529] bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all placeholder:text-gray-300" 
                           placeholder="Nombre comercial" 
                         />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIT / ID Fiscal *</label>
                         <input 
                           type="text" 
                           value={formData.nit} 
                           onChange={(e) => setFormData({ ...formData, nit: e.target.value })} 
                           className="w-full px-5 py-3 text-sm font-bold text-[#040529] bg-gray-50 border border-gray-300 rounded-xl outline-none disabled:opacity-50" 
                           placeholder="Número de identificación" 
                           disabled={modalType === "edit"} 
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico *</label>
                       <input 
                         type="email" 
                         value={formData.email} 
                         onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                         className="w-full px-5 py-3 text-sm font-bold text-[#040529] bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all" 
                         placeholder="proveedor@ejemplo.com"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                         <input 
                           type="text" 
                           value={formData.telefono} 
                           onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} 
                           className="w-full px-5 py-3 text-sm font-bold text-[#040529] bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all" 
                         />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Física</label>
                         <input 
                           type="text" 
                           value={formData.direccion} 
                           onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} 
                           className="w-full px-5 py-3 text-sm font-bold text-[#040529] bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all" 
                         />
                      </div>
                    </div>

                     <div className="pt-4 flex gap-4">
                        <button onClick={closeModal} className="flex-1 py-3.5 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">Cancelar</button>
                        <button onClick={handleSave} className="flex-[2] py-3.5 bg-[#040529] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#040529]/10 hover:bg-[#040529]/90 transition-all active:scale-95">
                          {modalType === "add" ? "Registrar Aliado" : "Guardar Cambios"}
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