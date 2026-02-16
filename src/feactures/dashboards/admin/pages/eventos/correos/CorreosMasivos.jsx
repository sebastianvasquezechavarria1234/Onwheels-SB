// src/feactures/dashboards/admin/pages/eventos/correos/CorreosMasivos.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, Eye, Mail, AlertCircle, Trash2, Calendar, Users, FileText, Send, Search, Hash, CheckCircle, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
  obtenerRolesDisponibles,
  obtenerVistaPreviaDestinatarios,
  enviarCorreosMasivos,
  obtenerHistorialEnvios,
  eliminarEnvio
} from "../../services/emailMasivoServices";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
  const [modal, setModal] = useState(false); // New Email Modal
  const [modalPreview, setModalPreview] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  
  // Selection states
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [detalleEnvio, setDetalleEnvio] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Form
  const [form, setForm] = useState({
    asunto: "",
    mensaje: "",
  });
  const [errores, setErrores] = useState({});

  // Notification
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Load initial data
  useEffect(() => {
    cargarRoles();
    cargarHistorial();
  }, []);

  const cargarRoles = async () => {
    try {
      const respuesta = await obtenerRolesDisponibles();
      if (respuesta.success) {
        setRoles(respuesta.data);
      }
    } catch (err) {
      mostrarNotificacion("Error cargando roles", "error");
    }
  };

  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const respuesta = await obtenerHistorialEnvios();
      if (respuesta.success) {
        setHistorial(respuesta.data);
      }
    } catch (err) {
      console.error(err);
      mostrarNotificacion("Error cargando historial", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const mostrarNotificacion = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleToggle = (idRol, nombreRol) => {
    setRolesSeleccionados((prev) => {
      const existe = prev.some((r) => r.idRol === idRol);
      if (existe) {
        return prev.filter((r) => r.idRol !== idRol);
      } else {
        return [...prev, { idRol, nombreRol }];
      }
    });
    if (errores.roles) {
      setErrores((prev) => ({ ...prev, roles: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.asunto.trim() || form.asunto.trim().length < 3) {
      nuevosErrores.asunto = "Asunto debe tener al menos 3 caracteres";
    } else if (form.asunto.trim().length > 255) {
      nuevosErrores.asunto = "Asunto no puede exceder 255 caracteres";
    }

    if (!form.mensaje.trim() || form.mensaje.trim().length < 10) {
      nuevosErrores.mensaje = "Mensaje debe tener al menos 10 caracteres";
    } else if (form.mensaje.trim().length > 10000) {
      nuevosErrores.mensaje = "Mensaje no puede exceder 10000 caracteres";
    }

    if (rolesSeleccionados.length === 0) {
      nuevosErrores.roles = "Debes seleccionar al menos un rol";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Actions
  const handleVistaPrevia = async () => {
    if (rolesSeleccionados.length === 0) {
      mostrarNotificacion("Selecciona al menos un rol", "error");
      return;
    }

    setLoadingPreview(true);
    try {
      const idsRoles = rolesSeleccionados.map((r) => r.idRol);
      const respuesta = await obtenerVistaPreviaDestinatarios(idsRoles);

      if (respuesta.success) {
        setPreviewData(respuesta);
        setModalPreview(true);
      }
    } catch (err) {
      const mensaje = err.response?.data?.msg || "Error obteniendo vista previa";
      mostrarNotificacion(mensaje, "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleEnviarCorreos = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const idsRoles = rolesSeleccionados.map((r) => r.idRol);
      const rolesNombres = rolesSeleccionados.map((r) => r.nombreRol);

      const respuesta = await enviarCorreosMasivos(
        form.asunto,
        form.mensaje,
        idsRoles,
        rolesNombres
      );

      if (respuesta.success) {
        mostrarNotificacion(`✓ ${respuesta.data.mensaje}`, "success");
        setForm({ asunto: "", mensaje: "" });
        setRolesSeleccionados([]);
        setModal(false);
        setErrores({});
        cargarHistorial();
      }
    } catch (err) {
      const erroresBackend = err.response?.data?.errores;
      if (erroresBackend && Array.isArray(erroresBackend)) {
        setErrores({ backend: erroresBackend.join(", ") });
        mostrarNotificacion(erroresBackend[0], "error");
      } else {
        const mensaje = err.response?.data?.msg || "Error enviando correos";
        mostrarNotificacion(mensaje, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (idEnvio) => {
    // Replace confirm with modal later if needed, for now keep simple confirm or use custom modal
    // Keeping simple confirm for speed unless requested, but unified design usually implies custom modals.
    // Let's use the custom delete modal pattern.
    if (!window.confirm("¿Seguro que deseas eliminar este registro del historial?")) return;

    try {
      await eliminarEnvio(idEnvio);
      mostrarNotificacion("Registro eliminado", "success");
      cargarHistorial();
    } catch (error) {
      mostrarNotificacion("Error al eliminar", "error");
    }
  };

  const verDetalle = (envio) => {
    setDetalleEnvio(envio);
    setModalDetalle(true);
  };

  // --- FILTER & SORT LOGIC ---
  const filteredAndSorted = useMemo(() => {
    let result = [...historial];

    // Filter
    if (search) {
        const q = search.toLowerCase().trim();
        result = result.filter((h) =>
            h.asunto.toLowerCase().includes(q) ||
            h.roles_destinatarios?.toLowerCase().includes(q)
        );
    }

    // Sort
    result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (typeof aVal === "string" && typeof bVal === "string") {
             // For dates (which are strings from API usually)
            return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
             return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    return result;
  }, [historial, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const currentItems = filteredAndSorted.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };


  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">
        
        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">
             {/* Row 1: Minimal Header */}
             <div className="flex items-center justify-between ">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold! whitespace-nowrap uppercase tracking-wider">
                        Envío Masivo de Correos
                    </h2>

                    {/* Compact Stats */}
                    <div className="flex items-center gap-2 border-l pl-4">
                        <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md ">
                            <Mail className="h-3 w-3 " />
                            <span className="text-xs font-bold!">{historial.length} Envíos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Active Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">
                {/* Search & Create Group */}
                 <div className="flex flex-1 w-full sm:w-auto gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Buscar en historial..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
                        />
                         {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                     <button 
                        onClick={() => setModal(true)} 
                        className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Envío
                    </button>
                 </div>
                 
                 {/* Sort (Simple) */}
                 <div className="flex items-center gap-2">
                    <button
                            onClick={() => toggleSort("fecha_envio")}
                            className={cn(
                                "px-4 py-2 text-xs uppercase font-bold tracking-wide rounded-lg border transition flex items-center gap-1.5 shrink-0 select-none",
                                sortField === "fecha_envio"
                                    ? "bg-[#040529] text-white border-[#040529] shadow-sm transform scale-105" 
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            )}
                        >
                            Fecha
                            {sortField === "fecha_envio" && <ArrowUpDown className="h-3 w-3" />}
                        </button>
                 </div>
            </div>
        </div>

        {/* --- SECTION 2: HISTORY TABLE --- */}
        <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
             <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <table className="w-full text-left relative">
                        <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[20%]">Fecha</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[30%]">Asunto</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[25%]">Destinatarios</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Total</th>
                                <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right w-[15%]">Acciones</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-gray-100">
                             {loadingHistorial ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">Cargando historial...</td></tr>
                             ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Mail className="h-8 w-8" />
                                            <p className="text-sm">No hay envíos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                             ) : (
                                currentItems.map((envio) => (
                                    <tr key={envio.id_envio} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                 <span className="font-bold text-[#040529]">
                                                    {new Date(envio.fecha_envio).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                  {new Date(envio.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-medium text-gray-800">{envio.asunto}</td>
                                        <td className="px-5 py-4">
                                             <div className="flex flex-wrap gap-1">
                                                {envio.roles_destinatarios?.split(',').map((rol, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                        {rol.trim()}
                                                    </span>
                                                )) || "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                                <Users size={12} className="mr-1"/> {envio.total_destinatarios}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => verDetalle(envio)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver detalle"><Eye className="h-4 w-4" /></button>
                                                <button onClick={() => handleEliminar(envio.id_envio)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar registro"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                             )}
                         </tbody>
                    </table>
                </div>

                 {/* Footer Pagination */}
                 {totalPages > 1 && (
                    <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">
                            Mostrando <span className="font-bold text-[#040529]">{Math.min(currentItems.length, itemsPerPage)}</span> de <span className="font-bold text-[#040529]">{filteredAndSorted.length}</span> resultados
                        </p>
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
                            <span className="text-sm font-bold text-[#040529] px-2">{currentPage}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
                        </div>
                    </div>
                )}
             </div>
        </div>

        {/* --- TOAST --- */}
        <AnimatePresence>
            {notification.show && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}>
                    {notification.message}
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODAL CREAR ENVIO (Split View) --- */}
        <AnimatePresence>
            {modal && (
              <motion.div
                className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setModal(false)}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl relative overflow-hidden max-w-4xl w-full"
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                   <div className="flex flex-col lg:flex-row h-[600px] lg:h-[650px]">
                        {/* Left Side (Visual / Tips) */}
                        <div className="hidden lg:flex w-1/3 bg-[#040529] flex-col items-center justify-center p-8 relative overflow-hidden text-white">
                             <div className="absolute inset-0 opacity-10 pattern-grid-lg bg-white/5" />
                             
                             <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                                <Send size={32} />
                             </div>
                             
                             <h4 className="font-bold text-xl text-center mb-2">Nuevo Comunicado</h4>
                             <p className="text-white/60 text-center text-sm mb-8">Envía notificaciones importantes a todos tus usuarios registrados.</p>

                             <div className="w-full space-y-4">
                                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                    <h5 className="font-bold text-xs uppercase text-white/80 mb-2 flex items-center gap-2"><CheckCircle size={12}/> Tips</h5>
                                    <ul className="text-xs text-white/60 space-y-2 list-disc pl-4">
                                        <li>Se claro y conciso con el asunto.</li>
                                        <li>Revisa la ortografía antes de enviar.</li>
                                        <li>Usa la vista previa para verificar.</li>
                                    </ul>
                                </div>
                             </div>
                        </div>

                        {/* Right Side (Form) */}
                         <div className="flex-1 flex flex-col h-full overflow-hidden">
                             <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-bold text-[#040529] flex items-center gap-2">
                                     Redactar Mensaje
                                </h3>
                                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-5">
                                    {/* Asunto */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Asunto *</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            name="asunto"
                                            placeholder="Ej: Mantenimiento programado"
                                            value={form.asunto}
                                            onChange={handleChange}
                                            maxLength={255}
                                            className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${errores.asunto ? "border-red-500" : "border-gray-200"}`}
                                        />
                                        <div className="flex justify-between mt-1">
                                             {errores.asunto ? <p className="text-red-500 text-xs font-medium">{errores.asunto}</p> : <span></span>}
                                             <span className="text-xs text-gray-400">{form.asunto.length}/255</span>
                                        </div>
                                    </div>

                                    {/* Mensaje */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mensaje *</label>
                                        <textarea
                                            name="mensaje"
                                            placeholder="Escribe tu mensaje aquí..."
                                            rows="8"
                                            value={form.mensaje}
                                            onChange={handleChange}
                                            maxLength={10000}
                                            className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] resize-none ${errores.mensaje ? "border-red-500" : "border-gray-200"}`}
                                        />
                                        <div className="flex justify-between mt-1">
                                             {errores.mensaje ? <p className="text-red-500 text-xs font-medium">{errores.mensaje}</p> : <span></span>}
                                             <span className="text-xs text-gray-400">{form.mensaje.length}/10000</span>
                                        </div>
                                    </div>

                                    {/* Roles */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-2">Destinatarios por Rol *</label>
                                        {errores.roles && <p className="text-red-500 text-xs font-medium mb-2">{errores.roles}</p>}
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {roles.map((rol) => (
                                                <label
                                                    key={rol.id_rol}
                                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition relative overflow-hidden ${rolesSeleccionados.some((r) => r.idRol === rol.id_rol)
                                                        ? "border-[#040529] bg-[#040529]/5"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={rolesSeleccionados.some((r) => r.idRol === rol.id_rol)}
                                                        onChange={() => handleRoleToggle(rol.id_rol, rol.nombre_rol)}
                                                        className="w-4 h-4 text-[#040529] rounded focus:ring-[#040529]"
                                                    />
                                                    <div className="ml-3 flex-1 flex justify-between items-center">
                                                        <span className="text-sm font-bold text-gray-800 capitalize">{rol.nombre_rol}</span>
                                                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{rol.cantidad_usuarios}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Footer Actions */}
                             <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={handleVistaPrevia}
                                    disabled={rolesSeleccionados.length === 0 || loadingPreview}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                                >
                                    <Eye size={16} />
                                    {loadingPreview ? "Cargando..." : "Vista Previa"}
                                </button>
                                
                                <button
                                    onClick={handleEnviarCorreos}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-900/10"
                                >
                                    {loading ? "Enviando..." : (
                                        <>
                                            <Send size={16} /> Enviar Correos
                                        </>
                                    )}
                                </button>
                             </div>
                         </div>
                   </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODAL PREVIEW (Centered, Standard) --- */}
        <AnimatePresence>
            {modalPreview && previewData && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setModalPreview(false)}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-bold text-[#040529]">Vista Previa</h3>
                        <button onClick={() => setModalPreview(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 text-blue-800 mb-6">
                            <Users size={20} />
                            <span className="font-bold">Total: {previewData.total} destinatarios</span>
                        </div>

                         <div className="space-y-6">
                            {Object.entries(previewData.porRol).map(([rol, usuarios]) => (
                            <div key={rol}>
                                <h4 className="font-bold text-gray-700 mb-3 capitalize flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-[#040529]"></span>
                                    {rol} <span className="text-gray-400 font-normal">({usuarios.length})</span>
                                </h4>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                {usuarios.map((usuario) => (
                                    <div key={usuario.id_usuario} className="p-3 flex items-center justify-between hover:bg-white transition">
                                        <div>
                                            <p className="font-bold text-[#040529] text-xs max-w-[200px] truncate">{usuario.nombre_completo}</p>
                                            <p className="text-xs text-gray-500">{usuario.correo}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
                        <button onClick={() => setModalPreview(false)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition">Cerrar</button>
                    </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* --- MODAL DETALLE (Centered, Standard) --- */}
        <AnimatePresence>
            {modalDetalle && detalleEnvio && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setModalDetalle(false)}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-bold text-[#040529]">Detalle del Envío</h3>
                        <button onClick={() => setModalDetalle(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <div>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Asunto</p>
                                <p className="text-lg font-bold text-[#040529]">{detalleEnvio.asunto}</p>
                             </div>
                             <div className="text-left sm:text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Fecha de Envío</p>
                                <p className="text-sm font-bold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm inline-block">
                                    {new Date(detalleEnvio.fecha_envio).toLocaleString()}
                                </p>
                             </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-2">Destinatarios</p>
                            <div className="flex flex-wrap gap-2">
                                {detalleEnvio.roles_destinatarios?.split(',').map((rol, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-blue-100">
                                        {rol.trim()}
                                    </span>
                                ))}
                                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-gray-200 flex items-center gap-1">
                                    <Users size={12} /> Total: {detalleEnvio.total_destinatarios}
                                </span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-2">Mensaje</p>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                                {detalleEnvio.mensaje}
                            </div>
                        </div>
                   </div>

                   <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-center shrink-0">
                        <button onClick={() => setModalDetalle(false)} className="px-8 py-2.5 bg-[#040529] text-white rounded-lg font-bold hover:bg-[#040529]/90 transition shadow-lg">
                            Cerrar
                        </button>
                    </div>
                </motion.div>
              </motion.div>
            )}
        </AnimatePresence>

      </div>
    </>
  );
}
