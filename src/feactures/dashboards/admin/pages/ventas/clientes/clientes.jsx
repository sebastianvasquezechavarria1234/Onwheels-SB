import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Eye, Plus, Search, Pencil, Trash2, X, 
  ChevronLeft, ChevronRight, User, Mail, 
  MapPin, Phone, CreditCard, UserPlus, Info, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getUsuariosSinCliente
} from "../../services/clientesServices";
import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const Clientes = () => {
  // --- ESTADOS ---
  const [clientes, setClientes] = useState([]);
  const [usuariosSinCliente, setUsuariosSinCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modalType, setModalType] = useState(null); // "add", "edit", "details", "delete"
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: "",
    direccion_envio: "",
    telefono_contacto: "",
    metodo_pago: ""
  });

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  // --- CARGAR DATOS ---
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification("Error al cargar clientes", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchUsuariosSinCliente = useCallback(async () => {
    setLoadingUsuarios(true);
    try {
      const data = await getUsuariosSinCliente();
      setUsuariosSinCliente(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotification("Error al cargar usuarios", "error");
    } finally {
      setLoadingUsuarios(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // --- HANDLERS ---
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if (type === "add") {
      setFormData({ id_usuario: "", direccion_envio: "", telefono_contacto: "", metodo_pago: "" });
      fetchUsuariosSinCliente();
    } else if (type === "edit" && item) {
      setFormData({
        id_usuario: item.id_usuario,
        direccion_envio: item.direccion_envio || "",
        telefono_contacto: item.telefono_contacto || "",
        metodo_pago: item.metodo_pago || ""
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  const handleSave = async () => {
    try {
      if (modalType === "add") {
        if (!formData.id_usuario) return showNotification("Selecciona un usuario", "error");
        await createCliente(formData);
        showNotification("Cliente registrado con éxito");
      } else {
        await updateCliente(selected.id_cliente, formData);
        showNotification("Perfil de cliente actualizado");
      }
      fetchClientes();
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.mensaje || "Error al procesar la solicitud", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCliente(selected.id_cliente);
      showNotification("Cliente eliminado del sistema");
      fetchClientes();
      closeModal();
    } catch (err) {
      showNotification("Error al intentar eliminar el cliente", "error");
    }
  };

  const handleDownload = () => {
    if (!filtered || filtered.length === 0) return;
    const header = ["ID Cliente", "Nombre Completo", "Documento", "Email", "Telefono", "Direccion", "Metodo Pago"];
    const csvData = filtered.map(c => [
      c.id_cliente,
      `"${c.nombre_completo}"`,
      `"${c.documento || ""}"`,
      `"${c.email}"`,
      `"${c.telefono_contacto || ""}"`,
      `"${(c.direccion_envio || "").replace(/"/g, '""')}"`,
      `"${c.metodo_pago || ""}"`
    ].join(","));

    const csvLines = [header.join(","), ...csvData];
    const csvContent = "\uFEFF" + csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_clientes_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const filtered = useMemo(() => {
    return clientes.filter(c =>
      (c.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.documento || "").includes(search)
    );
  }, [clientes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatMetodoPago = (metodo) => {
    const map = { tarjeta: "Tarjeta", efectivo: "Efectivo", transferencia: "Transferencia", nequi: "Nequi", daviplata: "Daviplata" };
    return map[metodo] || metodo || "No definido";
  };

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Base de Clientes
            </h2>
            <span className={configUi.countBadge}>{filtered.length} registrados</span>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, ID o email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>
            <button onClick={handleDownload} className={configUi.iconButton} title="Descargar Reporte">
              <Download size={20} />
            </button>
            <button onClick={() => openModal("add")} className={configUi.primaryButton}>
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[30%]`}>Cliente / Documento</th>
                  <th className={`${configUi.th} w-[25%]`}>Información de Contacto</th>
                  <th className={`${configUi.th} w-[25%]`}>Dirección de Envío</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[20%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className={configUi.emptyState}>Cargando repositorio de clientes...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="4" className={configUi.emptyState}>No se han encontrado registros de clientes.</td></tr>
                ) : (
                  currentItems.map((c) => (
                    <tr key={c.id_cliente} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#16315f] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {(c.nombre_completo || "CL").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#16315f] text-sm leading-tight truncate">{c.nombre_completo}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{c.documento || "Sin Documento"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16315f]">
                            <Mail size={12} className="text-slate-300" />
                            {c.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Phone size={12} className="text-slate-300" />
                            {c.telefono_contacto || "Sin teléfono"}
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                         <div className="flex items-start gap-1.5">
                            <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
                            <span className="text-xs text-slate-500 font-medium leading-tight">
                               {c.direccion_envio || "Dirección no registrada"}
                            </span>
                         </div>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openModal("details", c)} className={configUi.actionButton} title="Expediente">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openModal("edit", c)} className={configUi.actionButton} title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => openModal("delete", c)} className={cn(configUi.actionButton, "hover:bg-red-50 hover:text-red-600")} title="Eliminar">
                            <Trash2 size={14} />
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
          {totalPages > 1 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={configUi.paginationButton}>
                  <ChevronLeft size={18} />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={configUi.paginationButton}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificación */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-[#16315f]" : "bg-red-600"}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`${configUi.modalPanel} ${modalType === 'delete' ? "max-w-sm" : modalType === 'details' ? "max-w-2xl" : "max-w-xl"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modalType === 'add' ? 'Registrar Nuevo Cliente' :
                       modalType === 'edit' ? 'Modificar Perfil' :
                       modalType === 'details' ? 'Expediente del Cliente' : 'Eliminar Registro'}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {selected?.nombre_completo || "Gestión de base de datos de ventas"}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                    {modalType === 'delete' ? (
                       <div className="py-4 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                             <Trash2 size={30} />
                          </div>
                          <p className="text-sm text-slate-500 italic">¿Seguro que deseas eliminar el registro de <span className="font-bold text-red-600">{selected?.nombre_completo}</span>? Esta acción no se puede deshacer.</p>
                       </div>
                    ) : modalType === 'details' ? (
                       <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-1/3 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                             <div className="h-24 w-24 rounded-2xl bg-[#16315f] flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                                {selected?.nombre_completo?.charAt(0)}
                             </div>
                             <h4 className="text-lg font-extrabold text-[#16315f] text-center mb-1">{selected?.nombre_completo}</h4>
                             <p className="text-xs text-slate-400 font-bold mb-4 italic">{selected?.documento}</p>
                             
                             <div className="w-full space-y-3">
                                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                   <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Metodo de Pago Pref.</label>
                                   <p className="text-xs font-bold text-[#16315f] flex items-center gap-2"><CreditCard size={12}/> {formatMetodoPago(selected?.metodo_pago)}</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex-1 space-y-5">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={configUi.fieldGroup}>
                                   <label className={configUi.fieldLabel}>Correo Electrónico</label>
                                   <div className={configUi.readOnlyField}>{selected?.email}</div>
                                </div>
                                <div className={configUi.fieldGroup}>
                                   <label className={configUi.fieldLabel}>Teléfono de Contacto</label>
                                   <div className={configUi.readOnlyField}>{selected?.telefono_contacto || "—"}</div>
                                </div>
                             </div>
                             
                             <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Dirección de Envío Principal</label>
                                <div className={cn(configUi.readOnlyField, "min-h-[60px] leading-relaxed")}>
                                   <MapPin size={12} className="inline mr-2 text-slate-300" />
                                   {selected?.direccion_envio || "No especificada"}
                                </div>
                             </div>

                             <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                <h5 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                   <Info size={12}/> Historial Rápido
                                </h5>
                                <p className="text-xs text-slate-500 font-medium italic leading-relaxed">Este cliente está vinculado a la cuenta de usuario con ID #{selected?.id_usuario}. Las compras realizadas aparecerán en el módulo de Ventas.</p>
                             </div>
                          </div>
                       </div>
                    ) : (
                       // FORMULARIO (ADD / EDIT)
                       <div className="space-y-6">
                          {modalType === "add" && (
                            <div className={configUi.fieldGroup}>
                               <label className={configUi.fieldLabel}>Vincular con Usuario del Sistema *</label>
                               <div className="relative">
                                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                  <select
                                    className={cn(configUi.fieldSelect, "pl-10")}
                                    value={formData.id_usuario}
                                    onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
                                  >
                                    <option value="">{loadingUsuarios ? "Cargando usuarios..." : "Selecciona un usuario..."}</option>
                                    {usuariosSinCliente.map(u => (
                                      <option key={u.id_usuario} value={u.id_usuario}>
                                        {u.nombre_completo} ({u.documento})
                                      </option>
                                    ))}
                                  </select>
                               </div>
                               <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-medium italic">Solo se muestran usuarios que no tienen un perfil de cliente creado.</p>
                            </div>
                          )}

                          <div className={configUi.fieldGroup}>
                             <label className={configUi.fieldLabel}>Dirección de Envío Principal *</label>
                             <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                <textarea
                                  value={formData.direccion_envio}
                                  onChange={(e) => setFormData({ ...formData, direccion_envio: e.target.value })}
                                  className={cn(configUi.fieldInput, "pl-10 min-h-[80px] pt-3")}
                                  placeholder="Ej: Calle 123 #45-67, Edificio Los Alpes, Apto 402"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Teléfono de Contacto</label>
                                <div className="relative">
                                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                   <input
                                      type="text"
                                      value={formData.telefono_contacto}
                                      onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                                      className={cn(configUi.fieldInput, "pl-10")}
                                      placeholder="Ej: 300 123 4567"
                                   />
                                </div>
                             </div>
                             <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Método de Pago Preferido</label>
                                <div className="relative">
                                   <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                   <select
                                      className={cn(configUi.fieldSelect, "pl-10")}
                                      value={formData.metodo_pago}
                                      onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                                   >
                                      <option value="">No especificado</option>
                                      <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                                      <option value="efectivo">Efectivo</option>
                                      <option value="transferencia">Transferencia Bancaria</option>
                                      <option value="nequi">Nequi</option>
                                      <option value="daviplata">Daviplata</option>
                                   </select>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-xs text-slate-400 font-medium italic">
                    {modalType === 'details' ? "Información extraída del perfil de usuario y ventas." : "Asegúrate de que la dirección sea correcta para envíos."}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} className={configUi.secondaryButton}>
                      Cancelar
                    </button>
                    {modalType === 'delete' ? (
                      <button onClick={handleDelete} className={configUi.dangerButton}>Eliminar Definitivamente</button>
                    ) : (
                      <button onClick={handleSave} className={configUi.primaryButton}>
                        {modalType === 'add' ? 'Registrar Cliente' : 'Guardar Cambios'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Clientes;
