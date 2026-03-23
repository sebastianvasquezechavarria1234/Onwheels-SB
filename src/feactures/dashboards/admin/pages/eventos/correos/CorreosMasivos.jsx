import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, X, Eye, Mail, Trash2, Calendar, Users, Send, Search, Hash,
  ChevronLeft, ChevronRight, ArrowUpDown, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
  obtenerRolesDisponibles,
  obtenerVistaPreviaDestinatarios,
  enviarCorreosMasivos,
  obtenerHistorialEnvios,
  eliminarEnvio
} from "../../services/emailMasivoServices";
import { configUi, cn } from "../../configuracion/configUi";

export default function EnviarCorreosMasivos() {
  const [roles, setRoles] = useState([]);
  const [historial, setHistorial] = useState([]);

  // UI State for History Table
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [sortField, setSortField] = useState("fecha_envio");
  const [sortDirection, setSortDirection] = useState("desc");

  // Modal states
  const [modal, setModal] = useState(false); // New Email Modal (split view)
  const [modalPreview, setModalPreview] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);

  // Selection states
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [detalleEnvio, setDetalleEnvio] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Form
  const [form, setForm] = useState({ asunto: "", mensaje: "" });
  const [errores, setErrores] = useState({});

  // Notification
  const [notification, setNotification] = useState({ show: false, type: "success", message: "" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const respRoles = await obtenerRolesDisponibles();
      if (respRoles.success) setRoles(respRoles.data);

      setLoadingHistorial(true);
      const respHistorial = await obtenerHistorialEnvios();
      if (respHistorial.success) setHistorial(respHistorial.data);
    } catch (err) {
      showNotification("Error de conexión", "error");
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: "" }));
  };

  const handleRoleToggle = (idRol, nombreRol) => {
    setRolesSeleccionados(prev => {
      const existe = prev.some(r => r.idRol === idRol);
      if (existe) return prev.filter(r => r.idRol !== idRol);
      return [...prev, { idRol, nombreRol }];
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.asunto.trim() || form.asunto.length < 3) newErrors.asunto = "Asunto muy corto";
    if (!form.mensaje.trim() || form.mensaje.length < 10) newErrors.mensaje = "Mensaje demasiado breve";
    if (rolesSeleccionados.length === 0) newErrors.roles = "Selecciona destinatarios";
    setErrores(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actions
  const handleVistaPrevia = async () => {
    if (rolesSeleccionados.length === 0) return showNotification("Selecciona al menos un rol", "error");
    setLoadingPreview(true);
    try {
      const idsRoles = rolesSeleccionados.map(r => r.idRol);
      const resp = await obtenerVistaPreviaDestinatarios(idsRoles);
      if (resp.success) {
        setPreviewData(resp);
        setModalPreview(true);
      }
    } catch (err) {
      showNotification("Error en vista previa", "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleEnviar = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const idsRoles = rolesSeleccionados.map(r => r.idRol);
      const rolesNombres = rolesSeleccionados.map(r => r.nombreRol);
      const resp = await enviarCorreosMasivos(form.asunto, form.mensaje, idsRoles, rolesNombres);
      if (resp.success) {
        showNotification("Emails enviados exitosamente");
        setForm({ asunto: "", mensaje: "" });
        setRolesSeleccionados([]);
        setModal(false);
        setHistorial(prev => [resp.data.envio, ...prev]);
      }
    } catch (err) {
      showNotification("Error al realizar el envío", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await eliminarEnvio(selected.id_envio);
      setHistorial(prev => prev.filter(h => h.id_envio !== selected.id_envio));
      showNotification("Registro eliminado");
      setModalDelete(false);
    } catch (error) {
      showNotification("No se pudo eliminar", "error");
    }
  };

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let result = [...historial];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(h => h.asunto.toLowerCase().includes(q) || h.roles_destinatarios?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const vA = a[sortField];
      const vB = b[sortField];
      return sortDirection === "asc" ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
    });
    return result;
  }, [historial, search, sortField, sortDirection]);

  const currentItems = filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const toggleSort = (f) => {
    if (sortField === f) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDirection("asc"); }
  };

  return (
    <div className={configUi.pageShell}>
      {/* HEADER */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Emails Masivos</h2>
          <span className={configUi.countBadge}>
            <Mail className="mr-1 h-3 w-3" /> {historial.length} envíos históricos
          </span>
        </div>

        <div className={configUi.toolbar}>
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86a0c6]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar comunicados..." className={configUi.inputWithIcon} />
          </div>
          <button onClick={() => setModal(true)} className={configUi.primaryButton}>
            <Send size={18} /> <span>Redactar</span>
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
            <thead className={configUi.thead}>
              <tr>
                <th className={cn(configUi.th, "pl-5 w-[20%]")}>
                  <button onClick={() => toggleSort("fecha_envio")} className="flex items-center gap-2">Fecha {sortField === "fecha_envio" && <ArrowUpDown className="h-3 w-3" />}</button>
                </th>
                <th className={cn(configUi.th, "w-[30%]")}>Asunto de correo</th>
                <th className={cn(configUi.th, "w-[30%]")}>Destinatarios</th>
                <th className={cn(configUi.th, "w-[10%] text-center")}>Total</th>
                <th className={cn(configUi.th, "w-[10%] pr-5 text-right")}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingHistorial ? (
                <tr><td colSpan="5" className={configUi.emptyState}>Cargando historial...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className={configUi.emptyState}>No se registran envíos previos.</td></tr>
              ) : (
                currentItems.map(h => (
                  <tr key={h.id_envio} className={configUi.row}>
                    <td className={cn(configUi.td, "pl-5 text-[#5b7398] font-medium")}>{new Date(h.fecha_envio).toLocaleDateString()}</td>
                    <td className={cn(configUi.td, "font-bold text-[#16315f]")}>{h.asunto}</td>
                    <td className={cn(configUi.td)}>
                      <div className="flex flex-wrap gap-1">
                        {h.roles_destinatarios?.split(',').map((r, idx) => (
                          <span key={idx} className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                            {r.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={cn(configUi.td, "text-center font-bold text-[#16315f]")}>{h.total_destinatarios}</td>
                    <td className={cn(configUi.td, "pr-5 text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setDetalleEnvio(h); setModalDetalle(true); }} className={configUi.actionButton}><Eye size={14} /></button>
                        <button onClick={() => { setSelected(h); setModalDelete(true); }} className={configUi.actionDangerButton}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className={configUi.paginationBar}>
            <p className="text-sm font-bold text-slate-500">Página {currentPage} de {totalPages}</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={configUi.paginationButton}><ChevronLeft size={18} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={configUi.paginationButton}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MESSAGE MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div className={cn(configUi.modalPanel, "max-w-4xl")} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="flex flex-col lg:flex-row h-full overflow-hidden min-h-[500px]">

                {/* Left (Visual Info) */}
                <div className="hidden lg:flex w-1/3 bg-[#16315f] flex-col justify-between p-8 text-white relative">
                  <div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><Send size={24} /></div>
                    <h3 className="text-xl font-black mb-2 leading-tight">Comunicación Institucional</h3>
                    <p className="text-xs text-blue-500 leading-relaxed font-medium">Redacte comunicados importantes para los diferentes roles de la comunidad sobre ruedas.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-3"><Info size={14} /> Recomendaciones</div>
                      <ul className="text-[11px] text-blue-100 space-y-2 font-medium opacity-80">
                        <li>• El asunto debe ser claro y directo.</li>
                        <li>• Verifique los roles antes de enviar.</li>
                        <li>• Use el botón de "Vista Previa".</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right (Form) */}
                <div className="flex-1 flex flex-col bg-white">
                  <div className={configUi.modalHeader}>
                    <h3 className={configUi.modalTitle}>Redactar Nuevo Correo</h3>
                    <button onClick={() => setModal(false)} className={configUi.modalClose}><X size={20} /></button>
                  </div>

                  <div className={cn(configUi.modalContent, "space-y-4")}>
                    <div className={configUi.fieldGroup}>
                      <label className={configUi.fieldLabel}>Asunto del comunicado *</label>
                      <input name="asunto" value={form.asunto} onChange={handleChange} className={cn(configUi.fieldInput, errores.asunto && "border-red-500")} placeholder="Ej: Invitación a evento oficial" />
                      {errores.asunto && <p className="text-[10px] text-red-500 font-bold mt-1">{errores.asunto}</p>}
                    </div>

                    <div className={configUi.fieldGroup}>
                      <label className={configUi.fieldLabel}>Mensaje / Cuerpo del correo *</label>
                      <textarea name="mensaje" value={form.mensaje} onChange={handleChange} rows={6} className={cn(configUi.fieldTextarea, errores.mensaje && "border-red-500")} placeholder="Escriba el contenido aquí..." />
                      {errores.mensaje && <p className="text-[10px] text-red-500 font-bold mt-1">{errores.mensaje}</p>}
                    </div>

                    <div className={configUi.fieldGroup}>
                      <label className={configUi.fieldLabel}>Seleccionar Destinatarios *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {roles.map(r => (
                          <button key={r.id_rol} onClick={() => handleRoleToggle(r.id_rol, r.nombre_rol)} className={cn("flex items-center justify-between p-3 rounded-xl border text-left transition shadow-sm", rolesSeleccionados.some(s => s.idRol === r.id_rol) ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" : "bg-white border-slate-100 opacity-70 hover:opacity-100")}>
                            <div>
                              <span className="text-xs font-black text-[#16315f] uppercase tracking-wide">{r.nombre_rol}</span>
                              <p className="text-[10px] text-[#5b7398] font-bold">{r.cantidad_usuarios} usuarios</p>
                            </div>
                            {rolesSeleccionados.some(s => s.idRol === r.id_rol) && <CheckCircle2 size={16} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                      {errores.roles && <p className="text-[10px] text-red-500 font-bold mt-2">{errores.roles}</p>}
                    </div>
                  </div>

                  <div className={configUi.modalFooter}>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Total: {rolesSeleccionados.reduce((acc, r) => acc + (roles.find(x => x.id_rol === r.idRol)?.cantidad_usuarios || 0), 0)} destinatarios</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleVistaPrevia} disabled={loadingPreview} className={configUi.secondaryButton}>{loadingPreview ? "..." : "Vista Previa"}</button>
                      <button onClick={handleEnviar} disabled={loading} className={configUi.primarySoftButton}>{loading ? "Enviando..." : "Enviar Correo"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTHER MODALS (Preview, Detail, Delete) */}
      {/* (Simplified for brevity but following the same unified patterns) */}
      <AnimatePresence>
        {modalPreview && (
          <motion.div className={configUi.modalBackdrop} onClick={() => setModalPreview(false)}>
            <motion.div className={cn(configUi.modalPanel, "max-w-2xl")} onClick={e => e.stopPropagation()}>
              <div className={configUi.modalHeader}>
                <h3 className={configUi.modalTitle}>Vista Previa de Destinatarios</h3>
                <button onClick={() => setModalPreview(false)} className={configUi.modalClose}><X size={20} /></button>
              </div>
              <div className={cn(configUi.modalContent, "max-h-96 overflow-y-auto")}>
                {previewData && Object.entries(previewData.porRol).map(([rol, users]) => (
                  <div key={rol} className="mb-6">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-3 flex items-center gap-2"><Hash size={12} />{rol} ({users.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {users.map(u => (
                        <div key={u.id_usuario} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-0.5 shadow-sm">
                          <span className="text-[11px] font-black text-[#16315f] line-clamp-1">{u.nombre_completo}</span>
                          <span className="text-[10px] font-bold text-[#5b7398] line-clamp-1">{u.correo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className={configUi.modalFooter}>
                <button onClick={() => setModalPreview(false)} className={cn(configUi.secondaryButton, "w-full")}>Cerrar Vista Previa</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {modalDelete && (
          <motion.div className={configUi.modalBackdrop} onClick={() => setModalDelete(false)}>
            <motion.div className={cn(configUi.modalPanel, "max-w-md")} onClick={e => e.stopPropagation()}>
              <div className="p-8 text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4"><Trash2 size={30} /></div>
                <h3 className="text-xl font-bold text-[#16315f]">¿Eliminar Registro?</h3>
                <p className="text-sm text-[#6b84aa] mt-2 font-medium">Esta acción borrará este envío del historial de forma permanente.</p>
                <div className="mt-8 flex gap-3 w-full">
                  <button onClick={() => setModalDelete(false)} className={cn(configUi.secondaryButton, "flex-1")}>No, cancelar</button>
                  <button onClick={handleDelete} className={cn(configUi.dangerButton, "flex-1")}>Sí, eliminar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {modalDetalle && detalleEnvio && (
          <motion.div className={configUi.modalBackdrop} onClick={() => setModalDetalle(false)}>
            <motion.div className={cn(configUi.modalPanel, "max-w-2xl")} onClick={e => e.stopPropagation()}>
              <div className={configUi.modalHeader}>
                <h3 className={configUi.modalTitle}>Detalle del Comunicado</h3>
                <button onClick={() => setModalDetalle(false)} className={configUi.modalClose}><X size={20} /></button>
              </div>
              <div className={configUi.modalContent}>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Asunto</span>
                  <h4 className="text-lg font-black text-[#16315f] mt-1">{detalleEnvio.asunto}</h4>
                  <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(detalleEnvio.fecha_envio).toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-slate-200">|</span>
                    <span className="flex items-center gap-1 font-black text-[#5b7398]"><Users size={12} /> {detalleEnvio.total_destinatarios} Destinatarios</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={configUi.fieldGroup}>
                    <label className={configUi.fieldLabel}>Mensaje Enviado</label>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 text-xs text-[#5b7398] font-bold leading-relaxed whitespace-pre-wrap shadow-inner h-48 overflow-y-auto">
                      {detalleEnvio.mensaje}
                    </div>
                  </div>
                </div>
              </div>
              <div className={configUi.modalFooter}>
                <button onClick={() => setModalDetalle(false)} className={cn(configUi.primarySoftButton, "w-full")}>Entendido</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className={cn("fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-white font-black text-xs tracking-wide", notification.type === "success" ? "bg-[#16315f]" : "bg-red-500")}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
