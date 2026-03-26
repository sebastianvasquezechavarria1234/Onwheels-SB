import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package, ChevronDown, Hash, ChevronLeft, ChevronRight,
  Search, Plus, Pencil, Trash2, Eye, Download,
  ShoppingBag, Calendar, CreditCard, Info, Clock, AlertCircle,
  TrendingUp, SlidersHorizontal, Ban, X, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getVentas,
  getVentaById,
  deleteVenta,
  updateVentaStatus,
  cancelVenta,
} from "../../services/ventasService";
import { getClientes } from "../../services/clientesServices";
import { cn, configUi } from "../../configuracion/configUi";

function Ventas() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';

  // --- ESTADOS ---
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("todos");

  // Modales
  const [modal, setModal] = useState(null); // 'cancelar', 'status'
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [statusFormEstado, setStatusFormEstado] = useState("");
  const [justificacion, setJustificacion] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Notificaciones
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  // --- CARGA DE DATOS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ventasData, clientesData] = await Promise.all([
        getVentas(),
        getClientes()
      ]);
      setVentas(ventasData || []);
      setClientes(clientesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al sincronizar historial de ventas", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const openModal = (type, venta) => {
    setSelectedVenta(venta);
    setModal(type);
    if (type === "status") {
      setStatusFormEstado(venta.estado);
    }
    if (type === "cancelar") {
      setJustificacion("");
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedVenta(null);
    setJustificacion("");
  };

  const handleStatusUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      await updateVentaStatus(selectedVenta.id_venta, { estado: statusFormEstado });
      fetchData();
      showNotification("Estado de venta actualizado");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al actualizar estado", "error");
    }
  };

  const handleCancel = async (e) => {
    if (e) e.preventDefault();
    if (!justificacion.trim()) {
      showNotification("Justificación obligatoria", "error");
      return;
    }
    try {
      await cancelVenta(selectedVenta.id_venta, justificacion);
      fetchData();
      showNotification("Venta cancelada exitosamente");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al cancelar la venta", "error");
    }
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find((c) => c.id_cliente === id_cliente);
    return cliente ? cliente.nombre_completo : "Consumidor Final";
  };

  const filtered = useMemo(() => {
    return ventas.filter((v) => {
      const nombreCli = getClienteNombre(v.id_cliente).toLowerCase();
      const matchesSearch =
        String(v.id_venta).includes(searchTerm) ||
        nombreCli.includes(searchTerm.toLowerCase()) ||
        new Date(v.fecha_venta).toLocaleDateString().includes(searchTerm);

      const matchesCliente = clienteFiltro === "todos" || v.id_cliente === Number(clienteFiltro);
      return matchesSearch && matchesCliente;
    });
  }, [ventas, searchTerm, clienteFiltro, clientes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (estado) => {
    switch (estado) {
      case "Entregada": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Cancelada": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className={configUi.pageShell}>
      {/* Header & Toolbar */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Historial de Ventas</h2>
          <span className={configUi.countBadge}>
            {filtered.length} FACTURAS
          </span>
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
             <TrendingUp size={12} />
             CAJA: ${filtered.filter(v => v.estado !== 'Cancelada').reduce((acc, v) => acc + (Number(v.total) || 0), 0).toLocaleString()}
          </div>
        </div>

        <div className={configUi.toolbar}>
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ID, cliente o fecha..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={configUi.inputWithIcon}
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
             <select 
               value={clienteFiltro}
               onChange={(e) => { setClienteFiltro(e.target.value); setCurrentPage(1); }}
               className={cn(configUi.select, "w-full min-w-[200px]")}
             >
                <option value="todos">Todos los Clientes</option>
                {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
             </select>
             <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
               <ChevronDown size={18} />
             </div>
          </div>

          <button onClick={() => fetchData()} className={configUi.iconButton} title="Refrescar">
            <Clock size={20} />
          </button>

          <button onClick={() => navigate(`${basePath}/ventas/crear`)} className={configUi.primaryButton}>
            <Plus size={18} />
            Venta Directa
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
            <thead className={configUi.thead}>
              <tr>
                <th className={configUi.th + " w-12 text-center"}>#</th>
                <th className={configUi.th}>Factura / Fecha</th>
                <th className={configUi.th}>Cliente / Método</th>
                <th className={configUi.th + " text-center"}>Items</th>
                <th className={configUi.th + " text-right"}>Monto Total</th>
                <th className={configUi.th + " text-center"}>Estado</th>
                <th className={configUi.th + " text-right"}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e5f8]">
              {loading ? (
                <tr>
                  <td colSpan="7" className={configUi.emptyState}>
                    <div className="flex flex-col items-center gap-4 p-20">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Sincronizando base de datos...</p>
                    </div>
                  </td>
                </tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="7" className={configUi.emptyState}>Sin registros de ventas que coincidan.</td></tr>
                ) : (
                  currentItems.map((v) => (
                    <tr key={v.id_venta} className={configUi.row}>
                      <td className={configUi.td}>
                        <span className="text-xs font-extrabold text-[#16315f] font-mono">#{v.id_venta}</span>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-50">
                              <Calendar size={16} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#16315f]">{new Date(v.fecha_venta).toLocaleDateString()}</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                 <Clock size={10} /> {new Date(v.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-[#16315f] truncate max-w-[200px]">{getClienteNombre(v.id_cliente)}</span>
                           <span className="text-[10px] text-slate-400 font-medium">Método: {v.metodo_pago?.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                           <Package size={12} className="text-slate-400" />
                           <span className="text-xs font-bold text-[#16315f]">{v.items?.length || 0}</span>
                        </div>
                      </td>
                      <td className={`${configUi.td} text-center font-extrabold text-[#16315f] text-sm`}>
                        ${(Number(v.total) || 0).toLocaleString()}
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn(configUi.pill, getStatusStyle(v.estado), "border shadow-sm")}>
                            {v.estado}
                          </span>
                          {v.estado === "Cancelada" && v.motivo_cancelacion && (
                            <span className="text-[9px] text-rose-500 font-medium italic max-w-[120px] truncate" title={v.motivo_cancelacion}>
                              Motivo: {v.motivo_cancelacion}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`${basePath}/ventas/detalle/${v.id_venta}`)} className={configUi.actionButton} title="Detalle">
                            <Eye size={14} />
                          </button>
                          {v.estado !== "Cancelada" && (
                            <button onClick={() => openModal("status", v)} className={cn(configUi.actionButton, "hover:bg-indigo-50 hover:text-indigo-600")} title="Estado">
                              <Package size={14} />
                            </button>
                          )}
                          {v.estado !== "Cancelada" && (
                            <button onClick={() => openModal("cancelar", v)} className={cn(configUi.actionButton, "hover:bg-rose-50 hover:text-rose-600")} title="Anular">
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className={configUi.paginationBar}>
            <p className="text-sm font-bold text-[#6b84aa]">
              Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                className={configUi.paginationButton}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                className={configUi.paginationButton}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={cn(configUi.modalPanel, modal === 'cancelar' ? "max-w-md" : "max-w-lg")}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={configUi.modalHeader}>
                <div>
                  <h3 className={configUi.modalTitle}>
                    {modal === 'cancelar' ? 'Anulación de Factura' : 'Control Operativo'}
                  </h3>
                  <p className={configUi.modalSubtitle}>ID Transacción: #{selectedVenta?.id_venta}</p>
                </div>
                <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
              </div>

              <div className="flex flex-col">
                <div className={configUi.modalContent}>
                    {modal === 'cancelar' ? (
                       <form id="cancel-form" onSubmit={handleCancel} className="space-y-4 py-1 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
                             <Ban size={32} strokeWidth={1.5} />
                          </div>
                          <div className="text-center space-y-1">
                             <p className="text-sm font-black text-[#16315f]">¿Está seguro de anular esta factura?</p>
                             <p className="text-[10px] text-slate-400 italic leading-tight">Esta acción revertirá los movimientos contables y de stock asociados.</p>
                          </div>
                          
                          <div className={cn(configUi.fieldGroup, "text-left mt-6")}>
                             <label className={configUi.fieldLabel}>Justificación Reglamentaria *</label>
                             <textarea
                               value={justificacion}
                               onChange={(e) => setJustificacion(e.target.value)}
                               placeholder="Describa el motivo del desestimiento..."
                               className={cn(configUi.fieldInput, "min-h-[80px] pt-3 text-xs")}
                               required
                             />
                             <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                                <AlertCircle size={10} /> Documentación requerida para auditoría fiscal.
                             </p>
                          </div>
                       </form>
                    ) : (
                       <form id="status-form" onSubmit={handleStatusUpdate} className="space-y-8 py-4">
                          <div className={configUi.fieldGroup}>
                             <label className={configUi.fieldLabel}>Nuevo Estado Logístico</label>
                             <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                  value={statusFormEstado}
                                  onChange={(e) => setStatusFormEstado(e.target.value)}
                                  className={cn(configUi.fieldSelect, "pl-12 h-14")}
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="Entregada">Entregada</option>
                                  <option value="Cancelada">Cancelada</option>
                                </select>
                             </div>
                             <p className="text-[10px] text-slate-400 font-medium ml-1 mt-3">El cambio de estado se reflejará en el panel del cliente en tiempo real.</p>
                          </div>
                       </form>
                    )}
                </div>

                <div className={configUi.modalFooter}>
                  <button onClick={closeModal} className={configUi.secondaryButton}>Regresar</button>
                  {modal === 'cancelar' ? (
                    <button onClick={handleCancel} className={configUi.dangerButton}>Confirmar Anulación</button>
                  ) : (
                    <button onClick={handleStatusUpdate} className={configUi.primaryButton}>Guardar Cambios</button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className={cn("fixed top-4 right-4 z-[1000] px-6 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-3", 
            notification.type === "success" ? "bg-[#16315f]" : "bg-rose-500")}
          >
            {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Ventas;
