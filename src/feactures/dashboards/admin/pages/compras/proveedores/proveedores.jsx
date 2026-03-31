import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Eye, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, 
  Phone, Mail, MapPin, Hash, User, Briefcase, Info, 
  TrendingUp, AlertCircle, ShieldCheck, Calendar, SlidersHorizontal, 
  ShoppingCart, Star 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../../../../services/api";
import { cn, configUi } from "../../configuracion/configUi";
import FilterDropdown from "../../configuracion/FilterDropdown";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("Todos");
  
  // Paginación local
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const [modal, setModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/proveedores"); // Backend now returns total_compras
      const data = res.data;
      setProveedores(Array.isArray(data) ? data : (data.proveedores || []));
    } catch (err) {
      setError(err.message);
      showNotification("Error al cargar proveedores", "error");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModal(type);
    setSelectedProveedor(item);
    if ((type === "editar" || type === "ver") && item) {
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
    setModal(null);
    setSelectedProveedor(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre_proveedor) errors.nombre_proveedor = "Nombre requerido";
    if (!formData.email) errors.email = "Email requerido";
    if (!formData.nit) errors.nit = "NIT requerido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modal === "crear") {
        await api.post("/proveedores", formData);
        showNotification("Proveedor creado con éxito");
      } else {
        await api.put(`/proveedores/${selectedProveedor.nit}`, formData);
        showNotification("Proveedor actualizado con éxito");
      }
      fetchData();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al guardar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProveedor) return;
    setSubmitting(true);
    try {
      await api.delete(`/proveedores/${selectedProveedor.nit}`);
      showNotification("Proveedor eliminado con éxito");
      fetchData();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al eliminar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return proveedores.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = (p.nombre_proveedor || "").toLowerCase().includes(q) || 
                            (p.nit || "").toLowerCase().includes(q) ||
                            (p.email || "").toLowerCase().includes(q);
      
      let matchesActivity = true;
      if (activityFilter === "con_compras") matchesActivity = p.total_compras > 0;
      if (activityFilter === "sin_compras") matchesActivity = p.total_compras === 0;
      if (activityFilter === "premium") matchesActivity = p.total_compras >= 5;

      return matchesSearch && matchesActivity;
    });
  }, [proveedores, search, activityFilter]);

  const totalFiltered = filtered.length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltered / itemsPorPagina));
  const currentItems = filtered.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Proveedores
            </h2>
            <span className={configUi.countBadge}>{totalFiltered} registros</span>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            <FilterDropdown
              value={activityFilter}
              onChange={(val) => { setActivityFilter(val); setPaginaActual(1); }}
              options={[
                { label: "Toda la actividad", value: "Todos", icon: SlidersHorizontal },
                { label: "Con Compras", value: "con_compras", icon: ShoppingCart },
                { label: "Sin Compras", value: "sin_compras", icon: AlertCircle },
                { label: "Frecuentes (5+)", value: "premium", icon: Star }
              ]}
              placeholder="Actividad"
            />

            <button
              onClick={() => openModal("crear")}
              className={configUi.primaryButton}
            >
              <Plus size={18} />
              Registrar Proveedor
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[35%]`}>Proveedor / NIT</th>
                  <th className={`${configUi.th} w-[35%]`}>Contacto y Ubicación</th>
                  <th className={`${configUi.th} w-[15%]`}>Actividad</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[15%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className={configUi.emptyState}>Cargando proveedores...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={configUi.emptyState}>No se encontraron proveedores.</td>
                  </tr>
                ) : (
                  currentItems.map((p, i) => (
                    <tr key={p.id_proveedor || p.nit || i} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                           <span className="font-bold text-[#16315f] text-sm">{p.nombre_proveedor}</span>
                           <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase leading-none mt-0.5">NIT: {p.nit || "N/A"}</span>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col gap-0.5">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                             <Mail size={12} className="text-indigo-500" />
                             {p.email}
                           </div>
                           <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                             {p.telefono && (
                               <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                 <Phone size={10} className="text-slate-300" />
                                 {p.telefono}
                               </div>
                             )}
                             {p.direccion && (
                               <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                 <MapPin size={10} className="text-slate-300" />
                                 {p.direccion}
                               </div>
                             )}
                           </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                           <div className="flex items-center gap-1.5 text-xs font-black text-[#16315f]">
                              <ShoppingCart size={14} className={p.total_compras > 0 ? "text-emerald-500" : "text-slate-300"} />
                              {p.total_compras} compras
                           </div>
                           {p.total_compras >= 5 && (
                             <span className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-1">
                                <Star size={10} fill="currentColor" /> Frecuente
                             </span>
                           )}
                        </div>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal("ver", p)} className={configUi.actionButton} title="Ver detalles"><Eye size={14} /></button>
                          <button onClick={() => openModal("editar", p)} className={configUi.actionButton} title="Editar"><Pencil size={14} /></button>
                          <button onClick={() => openModal("eliminar", p)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          {totalFiltered > 0 && (
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
                <div className="flex gap-1">
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPaginaActual(i + 1)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all",
                        paginaActual === i + 1 ? "bg-[#223a63] text-white" : "text-slate-400 hover:bg-slate-50"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  className={configUi.paginationButton}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL SYSTEM --- */}
      <AnimatePresence mode="wait">
        {modal && (
          <motion.div
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={cn(configUi.modalPanel, modal === "eliminar" ? "max-w-md" : "max-w-4xl")}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {modal === "eliminar" ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-sm">
                    <Trash2 size={28} />
                  </div>
                  <h3 className="mb-2 text-xl font-black text-[#16315f]">¿Eliminar proveedor?</h3>
                  <p className="mb-8 text-sm font-medium text-slate-500 leading-relaxed">
                    Esta acción no se puede deshacer. Se eliminará permanentemente al proveedor 
                    <span className="block font-black text-[#16315f] mt-1">"{selectedProveedor?.nombre_proveedor}"</span>
                  </p>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-400 transition hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              ) : modal === "ver" ? (
                <div className={configUi.modalSplit}>
                  <div className={configUi.modalSide}>
                    <div className="space-y-6">
                      <div className={configUi.modalSideIcon}>
                        <Briefcase size={32} />
                      </div>
                      <div className="space-y-2">
                         <p className={configUi.modalEyebrow}>Actividad Comercial</p>
                         <div className="flex flex-col gap-2">
                            <span className={cn(configUi.successPill, "justify-start gap-3")}>
                               <ShoppingCart size={14} /> {formData.total_compras || selectedProveedor?.total_compras || 0} Compras
                            </span>
                            {(selectedProveedor?.total_compras >= 5) && (
                              <span className="px-5 py-2 bg-amber-50 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-amber-100 flex items-center gap-3">
                                 <Star size={14} fill="currentColor" /> Frecuente
                              </span>
                            )}
                         </div>
                      </div>
                    </div>
                    <div className="mt-auto space-y-4 pt-8 border-t border-[#d7e5f8]/50">
                       <div className="flex items-center gap-3 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Base de Datos Activa</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className={configUi.modalHeader}>
                      <div>
                        <h3 className={configUi.modalTitle}>{formData.nombre_proveedor}</h3>
                        <p className={configUi.modalSubtitle}>NIT: {formData.nit || "N/A"}</p>
                      </div>
                      <button onClick={closeModal} className={configUi.modalClose}>
                        <X size={20} />
                      </button>
                    </div>

                    <div className={configUi.modalContent}>
                      <div className="grid grid-cols-1 gap-6">
                         <div className={configUi.formSection}>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1d4f91] mb-4">Información de Contacto</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="p-4 bg-white rounded-2xl border border-[#d7e5f8] flex items-center gap-4 shadow-sm transition hover:shadow-md">
                                  <div className="w-10 h-10 bg-[#eef5ff] rounded-xl flex items-center justify-center text-[#2b64d8]">
                                     <Mail size={18} />
                                  </div>
                                  <div className="truncate">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">E-mail</p>
                                     <p className="text-xs font-bold text-[#16315f] truncate">{formData.email}</p>
                                  </div>
                               </div>
                               <div className="p-4 bg-white rounded-2xl border border-[#d7e5f8] flex items-center gap-4 shadow-sm transition hover:shadow-md">
                                  <div className="w-10 h-10 bg-[#eef5ff] rounded-xl flex items-center justify-center text-[#2b64d8]">
                                     <Phone size={18} />
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Teléfono</p>
                                     <p className="text-xs font-bold text-[#16315f]">{formData.telefono || "N/A"}</p>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className={configUi.formSection}>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#1d4f91] mb-4">Ubicación Física</h4>
                            <div className="p-4 bg-white rounded-2xl border border-[#d7e5f8] flex items-center gap-4 shadow-sm transition hover:shadow-md">
                               <MapPin size={18} className="text-slate-300 shrink-0" />
                               <p className="text-xs font-bold text-[#16315f]">{formData.direccion || "Sin dirección registrada"}</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className={configUi.modalFooter}>
                      <button onClick={closeModal} className={configUi.secondaryButton}>Cerrar Detalle</button>
                      <button onClick={() => openModal("editar", selectedProveedor)} className={configUi.primaryButton}>
                        <Pencil size={14} /> Editar Perfil
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Reuse of existing create/edit modal part */}
                  <div className={configUi.modalHeader}>
                    <div>
                      <h3 className={configUi.modalTitle}>
                        {modal === "crear" ? "Nuevo Proveedor" : "Editar Proveedor"}
                      </h3>
                      <p className={configUi.modalSubtitle}>
                        Completa la información jurídica y comercial.
                      </p>
                    </div>
                    <button onClick={closeModal} className={configUi.modalClose}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className={cn(configUi.modalContent, "grid grid-cols-2 gap-5 py-6")}>
                    <div className={cn(configUi.fieldGroup, "col-span-2 md:col-span-1")}>
                      <label className={configUi.fieldLabel}>Razón Social / Nombre *</label>
                      <input
                        type="text"
                        className={configUi.fieldInput}
                        placeholder="Ej: Insumos Globales S.A.S"
                        value={formData.nombre_proveedor}
                        onChange={(e) => setFormData({ ...formData, nombre_proveedor: e.target.value })}
                      />
                      {formErrors.nombre_proveedor && <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.nombre_proveedor}</p>}
                    </div>

                    <div className={cn(configUi.fieldGroup, "col-span-2 md:col-span-1")}>
                      <label className={configUi.fieldLabel}>NIT / Identificación *</label>
                      <input
                        type="text"
                        className={cn(configUi.fieldInput, (modal === "editar") && "bg-slate-50 cursor-not-allowed")}
                        placeholder="Ej: 900.123.456-1"
                        value={formData.nit}
                        onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                        disabled={modal !== "crear"}
                      />
                      {formErrors.nit && <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.nit}</p>}
                    </div>

                    <div className={cn(configUi.fieldGroup, "col-span-2 md:col-span-1")}>
                      <label className={configUi.fieldLabel}>Correo Electrónico *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          className={cn(configUi.fieldInput, "pl-11")}
                          placeholder="proveedor@empresa.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      {formErrors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{formErrors.email}</p>}
                    </div>

                    <div className={cn(configUi.fieldGroup, "col-span-2 md:col-span-1")}>
                      <label className={configUi.fieldLabel}>Teléfono / Contacto</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          className={cn(configUi.fieldInput, "pl-11")}
                          placeholder="Ej: 300 123 4567"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={cn(configUi.fieldGroup, "col-span-2")}>
                      <label className={configUi.fieldLabel}>Dirección / Domicilio</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          className={cn(configUi.fieldInput, "pl-11")}
                          placeholder="Calle 123 #45-67, Ciudad"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={configUi.modalFooter}>
                    <button onClick={closeModal} className={configUi.secondaryButton}>Cancelar</button>
                    <button 
                      onClick={handleSave} 
                      className={configUi.primaryButton}
                      disabled={submitting}
                    >
                      {submitting ? "Guardando..." : modal === "crear" ? "Registrar Proveedor" : "Guardar Cambios"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur-md ${
              notification.type === "success" 
                ? "bg-slate-900/90 text-white border-slate-700" 
                : "bg-rose-500/90 text-white border-rose-400"
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${notification.type === "success" ? "bg-emerald-400" : "bg-white"}`} />
            <span className="text-[12px] font-bold tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
