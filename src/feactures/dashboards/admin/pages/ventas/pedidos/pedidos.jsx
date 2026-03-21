import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package, ChevronDown, Hash, ChevronLeft, ChevronRight,
  Search, Plus, Pencil, Trash2, Eye, Download,
  ShoppingBag, Calendar, CreditCard, Info, Clock, AlertCircle,
  TrendingUp, SlidersHorizontal, Ban, CheckCircle, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getPedidos,
  getPedidoById,
  deletePedido,
  updatePedidoStatus,
  cancelPedido,
} from "../../services/pedidosService";
import { getClientes } from "../../services/clientesServices";
import { cn, configUi } from "../../configuracion/configUi";

function Pedidos() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';

  // --- ESTADOS ---
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteFiltro, setClienteFiltro] = useState("todos");

  // Modales
  const [modal, setModal] = useState(null); // 'eliminar', 'status'
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [statusFormEstado, setStatusFormEstado] = useState("");
  const [cancelJustificacion, setCancelJustificacion] = useState("");

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
      const [pedidosData, clientesData] = await Promise.all([
        getPedidos(),
        getClientes()
      ]);
      setPedidos(pedidosData || []);
      setClientes(clientesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al sincronizar historial de pedidos", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const openModal = (type, pedido) => {
    setSelectedPedido(pedido);
    setModal(type);
    if (type === "status") {
      setStatusFormEstado(pedido.estado);
      setCancelJustificacion("");
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedPedido(null);
    setCancelJustificacion("");
  };

  const handleDelete = async () => {
    try {
      await deletePedido(selectedPedido.id_venta);
      fetchData();
      showNotification("Pedido eliminado exitosamente");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al eliminar el pedido", "error");
    }
  };

  const handleStatusUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      if (statusFormEstado === "Cancelada") {
        if (!cancelJustificacion.trim()) {
          showNotification("Justificación obligatoria", "error");
          return;
        }
        await cancelPedido(selectedPedido.id_venta, { motivo_cancelacion: cancelJustificacion });
      } else {
        await updatePedidoStatus(selectedPedido.id_venta, { estado: statusFormEstado });
      }
      fetchData();
      showNotification("Estado de pedido actualizado");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al actualizar estado", "error");
    }
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find((c) => c.id_cliente === id_cliente);
    return cliente ? cliente.nombre_completo : "Consumidor Externo";
  };

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const nombreCli = getClienteNombre(p.id_cliente).toLowerCase();
      const matchesSearch =
        String(p.id_venta).includes(searchTerm) ||
        nombreCli.includes(searchTerm.toLowerCase()) ||
        new Date(p.fecha_venta).toLocaleDateString().includes(searchTerm);

      const matchesCliente = clienteFiltro === "todos" || p.id_cliente === Number(clienteFiltro);
      return matchesSearch && matchesCliente;
    });
  }, [pedidos, searchTerm, clienteFiltro, clientes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusStyle = (estado) => {
    switch (estado) {
      case "Entregada": return configUi.successPill;
      case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-100 rounded-full px-3 py-1 text-xs font-bold border";
      case "Procesada": return configUi.subtlePill;
      case "Cancelada": return configUi.dangerPill;
      default: return configUi.pill;
    }
  };

  return (
    <div className={configUi.pageShell}>
      {/* Header & Toolbar */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Gestión de Pedidos</h2>
          <span className={configUi.countBadge}>
            {filtered.length} ÓRDENES
          </span>
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
             <ShoppingBag size={12} />
             CARTERA: ${filtered.reduce((acc, v) => acc + (Number(v.total) || 0), 0).toLocaleString()}
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

          <button onClick={() => navigate(`${basePath}/pedidos/crear`)} className={configUi.primaryButton}>
            <Plus size={18} />
            Nuevo Pedido
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
                <th className={configUi.th}>Pedido / Fecha</th>
                <th className={configUi.th}>Cliente / Identidad</th>
                <th className={configUi.th + " text-center"}>Items</th>
                <th className={configUi.th + " text-right"}>Monto Total</th>
                <th className={configUi.th + " text-center"}>Estado</th>
                <th className={configUi.th + " text-right"}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e5f8]">
              {loading ? (
                <tr>
                   <td colSpan="7" className="p-20 text-center">
                     <div className="flex flex-col items-center gap-4">
                       <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Órdenes...</p>
                     </div>
                   </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                   <td colSpan="7" className={configUi.emptyState}>
                     <div className="flex flex-col items-center gap-3 opacity-20">
                        <Package size={48} />
                        <p className="text-xs font-black uppercase tracking-widest">Sin pedidos encontrados</p>
                     </div>
                   </td>
                </tr>
              ) : (
                currentItems.map((p, idx) => (
                  <tr key={p.id_venta} className={configUi.row}>
                    <td className={configUi.td + " text-center"}>
                      <span className="text-[10px] font-black text-slate-300">{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col">
                         <span className="font-extrabold text-[#16315f] font-mono leading-none">#{String(p.id_venta).padStart(6, '0')}</span>
                         <span className="text-[10px] text-[#6b84aa] flex items-center gap-1 mt-1 font-bold">
                            <Calendar size={10} className="opacity-40" /> {new Date(p.fecha_venta).toLocaleDateString()}
                         </span>
                      </div>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col">
                         <span className="font-bold text-[#16315f] truncate max-w-[200px] leading-none uppercase">{getClienteNombre(p.id_cliente)}</span>
                         <span className="text-[10px] text-[#6b84aa] font-bold uppercase mt-1 tracking-tighter italic">Documento Registrado</span>
                      </div>
                    </td>
                    <td className={configUi.td + " text-center"}>
                      <span className={configUi.subtlePill}>
                         {p.items?.length || 0} UNI
                      </span>
                    </td>
                    <td className={configUi.td + " text-right font-black text-[#16315f] tabular-nums"}>
                      ${(Number(p.total) || 0).toLocaleString('es-CO')}
                    </td>
                    <td className={configUi.td + " text-center"}>
                      <span className={cn(getStatusStyle(p.estado), "text-[9px] min-w-[80px] justify-center")}>
                        {p.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className={configUi.td + " text-right"}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => navigate(`${basePath}/pedidos/detalle/${p.id_venta}`)} 
                          className={configUi.actionButton} 
                          title="Ver Detalle"
                        >
                          <Eye size={14} />
                        </button>
                        {p.estado === "Pendiente" && (
                          <button 
                            onClick={() => navigate(`${basePath}/pedidos/editar/${p.id_venta}`)} 
                            className={configUi.actionButton} 
                            title="Editar Orden"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => openModal("status", p)} 
                          className={configUi.actionButton} 
                          title="Cambiar Estado"
                        >
                          <Package size={14} />
                        </button>
                        <button 
                          onClick={() => openModal("eliminar", p)} 
                          className={configUi.actionDangerButton} 
                          title="Eliminar Registro"
                        >
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className={configUi.paginationBar}>
            <p className="text-sm font-bold text-[#6b84aa]">
              Lote <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
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
              className={cn(configUi.modalPanel, "max-w-md")}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={configUi.modalHeader}>
                <div>
                  <h3 className={configUi.modalTitle}>
                    {modal === 'eliminar' ? 'Eliminar Pedido' : 'Actualizar Estado'}
                  </h3>
                  <p className={configUi.modalSubtitle}>Orden ID: #{selectedPedido?.id_venta}</p>
                </div>
                <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
              </div>

              <div className={configUi.modalContent}>
                  {modal === 'eliminar' ? (
                     <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 border border-rose-100">
                           <Trash2 size={32} />
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-black text-[#16315f] uppercase tracking-tight">¿Confirmar Eliminación?</p>
                           <p className="text-[11px] text-[#6b84aa] italic">Esta acción es irreversible y removerá el registro permanentemente.</p>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        <div className={configUi.fieldGroup}>
                           <label className={configUi.fieldLabel}>Estado Logístico Actual</label>
                           <div className="relative">
                             <select
                               value={statusFormEstado}
                               onChange={(e) => setStatusFormEstado(e.target.value)}
                               className={configUi.fieldSelect}
                             >
                               <option value="Pendiente">Pendiente</option>
                               <option value="Procesada">Procesada</option>
                               <option value="Entregada">Entregada</option>
                               <option value="Cancelada">Cancelada</option>
                             </select>
                             <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown size={18} />
                             </div>
                           </div>
                        </div>

                        {statusFormEstado === 'Cancelada' && (
                          <div className={configUi.fieldGroup}>
                             <label className={configUi.fieldLabel}>Justificación Reglamentaria</label>
                             <textarea
                               value={cancelJustificacion}
                               onChange={(e) => setCancelJustificacion(e.target.value)}
                               placeholder="Describa el motivo de cancelación..."
                               className={cn(configUi.fieldTextarea, "h-24 pt-4")}
                             />
                          </div>
                        )}
                     </div>
                  )}
              </div>

              <div className={configUi.modalFooter}>
                <button onClick={closeModal} className={configUi.secondaryButton}>Cerrar</button>
                {modal === 'eliminar' ? (
                  <button onClick={handleDelete} className={configUi.dangerButton}>Eliminar Ahora</button>
                ) : (
                  <button onClick={handleStatusUpdate} className={configUi.primaryButton}>Guardar Cambios</button>
                )}
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

export default Pedidos;
