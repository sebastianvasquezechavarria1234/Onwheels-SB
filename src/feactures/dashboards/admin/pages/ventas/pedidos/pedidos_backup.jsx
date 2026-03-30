import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package, ChevronDown, Hash, ChevronLeft, ChevronRight,
  Search, Plus, Pencil, Trash2, Eye, Download,
  ShoppingBag, Calendar, CreditCard, Info, Clock, AlertCircle, X, CheckCircle, AlertTriangle, Ban
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

  // Paginaci├│n
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
      setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
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
          showNotification("Justificaci├│n obligatoria", "error");
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

  // --- FILTRADO Y PAGINACI├ôN ---
  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find((c) => c.id_cliente === id_cliente);
    return cliente ? cliente.nombre_completo : "Consumidor Externo";
  };

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const nombreCli = getClienteNombre(p.id_cliente).toLowerCase();
      const matchesSearch =
        String(p.id_venta).includes(searchTerm) ||
        nombreCli.includes(searchTerm.toLowerCase());

      const matchesCliente = clienteFiltro === "todos" || p.id_cliente === Number(clienteFiltro);
      return matchesSearch && matchesCliente;
    });
  }, [pedidos, searchTerm, clienteFiltro, clientes]);

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
          <h2 className={configUi.title}>Gesti├│n de Pedidos</h2>
          <span className={configUi.countBadge}>
            {filtered.length} ├ôRDENES
          </span>
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase tracking-wider">
            <ShoppingBag size={12} />
            CONSOLIDADO: ${filtered.reduce((acc, v) => acc + (Number(v.total) || 0), 0).toLocaleString()}
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
              className={cn(configUi.select, "w-full min-w-[200px] h-12")}
            >
              <option value="todos">Todos los Clientes</option>
              {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
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
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Sincronizando ├ôrdenes...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="7" className={configUi.emptyState}>No se han encontrado pedidos registrados.</td></tr>
              ) : (
                currentItems.map((v) => (
                  <tr key={v.id_venta} className={configUi.row}>
                    <td className={configUi.td}>
                      <span className="text-xs font-extrabold text-[#16315f] font-mono">#{v.id_venta}</span>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#16315f]">{v.fecha_venta ? new Date(v.fecha_venta).toLocaleDateString() : 'ÔÇö'}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            <Clock size={10} /> {v.fecha_venta ? new Date(v.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ÔÇö'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#16315f] truncate max-w-[200px]">{getClienteNombre(v.id_cliente)}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Registrado</span>
                      </div>
                    </td>
                    <td className={`${configUi.td} text-center`}>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <Package size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-[#16315f]">{v.items?.length || 0}</span>
                      </div>
                    </td>
                    <td className={`${configUi.td} text-right font-extrabold text-[#16315f] text-sm tabular-nums`}>
                      ${(Number(v.total) || 0).toLocaleString()}
                    </td>
                    <td className={`${configUi.td} text-center`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border", getStatusStyle(v.estado))}>
                          {v.estado}
                        </span>
                        {v.estado === "Cancelada" && v.motivo_cancelacion && (
                          <span className="text-[9px] text-rose-500 font-medium italic max-w-[120px] truncate" title={v.motivo_cancelacion}>
                             {v.motivo_cancelacion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`${configUi.td} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`${basePath}/pedidos/detalle/${v.id_venta}`)} className={configUi.actionButton} title="Detalle">
                          <Eye size={14} />
                        </button>
                        {v.estado === "Pendiente" && (
                          <button onClick={() => navigate(`${basePath}/pedidos/editar/${v.id_venta}`)} className={configUi.actionButton} title="Editar">
                            <Pencil size={14} />
                          </button>
                        )}
                        {v.estado !== "Cancelada" && (
                          <button onClick={() => openModal("status", v)} className={configUi.actionButton} title="Estado">
                            <Package size={14} />
                          </button>
                        )}
                        <button onClick={() => openModal("eliminar", v)} className={configUi.actionDangerButton} title="Eliminar">
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
              P├ígina <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
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
                  <div className="space-y-6 text-center py-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 border border-rose-100 shadow-inner">
                      <Trash2 size={32} />
                    </div>
                    <div className="space-y-2 px-4">
                      <p className="text-sm font-black text-[#16315f] uppercase tracking-tight">┬┐Confirmar Eliminaci├│n?</p>
                      <p className="text-[11px] text-[#6b84aa] font-medium leading-relaxed">Esta acci├│n es irreversible y remover├í el registro permanentemente del historial de pedidos.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 py-2">
                    <div className={configUi.fieldGroup}>
                      <label className={configUi.fieldLabel}>Nuevo Estado del Pedido</label>
                      <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          value={statusFormEstado}
                          onChange={(e) => setStatusFormEstado(e.target.value)}
                          className={cn(configUi.fieldSelect, "pl-12 h-14 font-bold")}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Entregada">Entregada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium ml-1 mt-3">Los pedidos en estado Entregada impactan el stock final.</p>
                    </div>

<<<<<<< HEAD
                    <AnimatePresence>
                      {statusFormEstado === 'Cancelada' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className={configUi.fieldGroup}
                        >
                          <label className={configUi.fieldLabel}>Justificaci├│n Reglamentaria</label>
                          <textarea
                            value={cancelJustificacion}
                            onChange={(e) => setCancelJustificacion(e.target.value)}
                            placeholder="Describa el motivo de cancelaci├│n..."
                            className={cn(configUi.fieldTextarea, "h-28 pt-4")}
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
=======
                    {statusFormEstado === 'Cancelada' && (
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Justificaci├│n Reglamentaria</label>
                        <textarea
                          value={cancelJustificacion}
                          onChange={(e) => setCancelJustificacion(e.target.value)}
                          placeholder="Describa el motivo de cancelaci├│n..."
                          className={cn(configUi.fieldTextarea, "h-24 pt-4")}
                        />
                      </div>
                    )}
                  </form>
>>>>>>> 9c6bd4a6080a40daef3990d855cfce188d7a1d80
                )}
              </div>

              <div className={configUi.modalFooter}>
                <button onClick={closeModal} className={configUi.secondaryButton}>Regresar</button>
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
