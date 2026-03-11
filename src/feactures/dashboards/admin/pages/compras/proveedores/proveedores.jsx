import React, { useEffect, useState, useCallback } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Hash, User, Briefcase, Info } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    nombre_contacto: "",
    nombre_empresa: "",
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
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const res = await api.get("/proveedores");
      setProveedores(Array.isArray(res.data) ? res.data : []);
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
        nombre_contacto: item.nombre_contacto || "",
        nombre_empresa: item.nombre_empresa || "",
        email: item.email || "",
        telefono: item.telefono || "",
        direccion: item.direccion || "",
        nit: item.nit || ""
      });
    } else {
      setFormData({ nombre_contacto: "", nombre_empresa: "", email: "", telefono: "", direccion: "", nit: "" });
    }
    setFormErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!formData.nombre_empresa || !formData.nombre_contacto || !formData.email) {
      showNotification("Completa los campos obligatorios", "error");
      return;
    }

    try {
      if (modalType === "add") {
        await api.post("/proveedores", formData);
        showNotification("Proveedor creado");
      } else {
        await api.put(`/proveedores/${selected.id_proveedor}`, formData);
        showNotification("Proveedor actualizado");
      }
      fetchProveedores();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/proveedores/${selected.id_proveedor}`);
      showNotification("Proveedor eliminado");
      fetchProveedores();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    }
  };

  const filtered = proveedores.filter(p =>
    p.nombre_empresa?.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre_contacto?.toLowerCase().includes(search.toLowerCase()) ||
    p.nit?.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Compras / Proveedores
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
              <span className="text-xs font-bold">{filtered.length} aliados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por empresa, contacto o NIT..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md whitespace-nowrap"
          >
            <Plus size={18} />
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left relative">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Empresa / NIT</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Contacto</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-400 text-sm italic">Cargando proveedores...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="3" className="p-12 text-center text-gray-400 italic">No se encontraron proveedores</td></tr>
                ) : (
                  currentItems.map((p) => (
                    <tr key={p.id_proveedor} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#040529] text-sm">
                        <div>{p.nombre_empresa}</div>
                        <div className="text-[10px] text-slate-400 font-normal">NIT: {p.nit || "N/A"}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-medium">{p.nombre_contacto}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("details", p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"><Eye size={16} /></button>
                          <button onClick={() => openModal("edit", p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100"><Pencil size={16} /></button>
                          <button onClick={() => openModal("delete", p)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">Página <span className="font-bold text-[#040529]">{currentPage}</span> de <span className="font-bold text-[#040529]">{totalPages}</span></p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 rounded-lg border border-gray-200 bg-white shadow-sm transition"><ChevronLeft className="h-4 w-4" /></button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 rounded-lg border border-gray-200 bg-white shadow-sm transition"><ChevronRight className="h-4 w-4" /></button>
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
            <motion.div className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden ${modalType === "delete" ? "max-w-sm w-full" : "max-w-2xl w-full"}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#040529]">{modalType === "add" ? "Nuevo Proveedor" : modalType === "edit" ? "Editar Proveedor" : modalType === "details" ? "Ficha de Proveedor" : "Eliminar"}</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                </div>

                {modalType === "delete" ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-6 underline decoration-red-200">¿Estás seguro de eliminar a <span className="font-bold text-red-600">{selected?.nombre_empresa}</span>?</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">Cancelar</button>
                      <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg">Eliminar</button>
                    </div>
                  </div>
                ) : modalType === "details" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={12} /> Empresa</h4>
                      <div><label className="text-[9px] font-bold text-slate-400 block pb-1">NOMBRE</label><p className="text-sm font-bold text-[#040529]">{formData.nombre_empresa}</p></div>
                      <div><label className="text-[9px] font-bold text-slate-400 block pb-1">NIT</label><p className="text-sm font-bold text-[#040529]">{formData.nit || "N/A"}</p></div>
                    </div>
                    <div className="p-4 bg-[#040529] text-white rounded-2xl space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Contacto</h4>
                      <div><label className="text-[9px] font-bold text-white/40 block pb-1">NOMBRE</label><p className="text-sm font-bold">{formData.nombre_contacto}</p></div>
                      <div><label className="text-[9px] font-bold text-white/40 block pb-1">EMAIL</label><p className="text-sm font-bold">{formData.email}</p></div>
                    </div>
                    <div className="md:col-span-2 flex justify-end"><button onClick={closeModal} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold">Cerrar</button></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Empresa *</label><input type="text" value={formData.nombre_empresa} onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" placeholder="Ej: Suministros S.A." /></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">NIT</label><input type="text" value={formData.nit} onChange={(e) => setFormData({ ...formData, nit: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" placeholder="900..." /></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contacto *</label><input type="text" value={formData.nombre_contacto} onChange={(e) => setFormData({ ...formData, nombre_contacto: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl border outline-none" /></div>
                    </div>
                    <button onClick={handleSave} className="w-full py-3 bg-[#040529] text-white rounded-xl text-sm font-bold transition mt-4">{modalType === "add" ? "Registrar" : "Guardar"}</button>
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