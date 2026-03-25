import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package, ChevronDown, Hash, ChevronLeft, ChevronRight,
  Search, Plus, Pencil, Trash2, Eye, Download,
  ShoppingBag, Calendar, CreditCard, Info, Clock, AlertCircle, X
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
import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function Pedidos() {
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
  const [modal, setModal] = useState(null); // 'eliminar', 'status'
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [statusFormEstado, setStatusFormEstado] = useState("");
  const [cancelJustificacion, setCancelJustificacion] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        getPedidos(),
        getClientes()
      ]);
      setVentas(ventasData || []);
      setClientes(clientesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al sincronizar datos de pedidos", "error");
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
      setCancelJustificacion("");
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedVenta(null);
    setCancelJustificacion("");
  };

  const handleDelete = async () => {
    try {
      await deletePedido(selectedVenta.id_venta);
      fetchData();
      showNotification("Pedido eliminado exitosamente");
      closeModal();
    } catch (err) {
      showNotification(err?.response?.data?.mensaje || "Error al eliminar el pedido", "error");
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      if (statusFormEstado === "Cancelada") {
        if (!cancelJustificacion.trim()) {
          showNotification("Justificación obligatoria para cancelación", "error");
          return;
        }
        await cancelPedido(selectedVenta.id_venta, { motivo_cancelacion: cancelJustificacion });
      } else {
        await updatePedidoStatus(selectedVenta.id_venta, { estado: statusFormEstado });
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
    return cliente ? cliente.nombre_completo : "Cliente no identificado";
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
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Pedidos
            </h2>
            <div className="flex items-center gap-2">
              <span className={configUi.countBadge}>{filtered.length} órdenes</span>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                <ShoppingBag size={12} />
                TOTAL: ${filtered.reduce((acc, v) => acc + (Number(v.total) || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por ID, cliente o fecha..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            <div className="relative group hidden lg:block">
              <select
                value={clienteFiltro}
                onChange={(e) => { setClienteFiltro(e.target.value); setCurrentPage(1); }}
                className={cn(configUi.fieldSelect, "py-2 pr-10 text-xs font-bold text-[#16315f] bg-slate-50 border-none shadow-sm min-w-[180px]")}
              >
                <option value="todos">Filtrar por Cliente</option>
                {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button onClick={() => navigate(`${basePath}/pedidos/crear`)} className={configUi.primaryButton}>
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[8%]`}>ID</th>
                  <th className={`${configUi.th} w-[20%]`}>Fecha y Hora</th>
                  <th className={`${configUi.th} w-[22%]`}>Cliente Solicitante</th>
                  <th className={`${configUi.th} text-center w-[12%]`}>Items</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Monto Total</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Estado</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[12%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className={configUi.emptyState}>Sincronizando órdenes de venta...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="7" className={configUi.emptyState}>No se han encontrado pedidos registrados.</td></tr>
                ) : (
                  currentItems.map((v) => (
                    <tr key={v.id_venta} className={configUi.row}>
                      <td className={configUi.td}>
                        <span className="text-xs font-extrabold text-slate-400 font-mono">#{v.id_venta}</span>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
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
                          <span className="text-[10px] text-slate-400 font-medium">Doc. Registrado</span>
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
                          <button onClick={() => navigate(`${basePath}/pedidos/detalle/${v.id_venta}`)} className={configUi.actionButton} title="Detalle">
                            <Eye size={14} />
                          </button>
                          {v.estado === "Pendiente" && (
                            <button onClick={() => navigate(`${basePath}/pedidos/editar/${v.id_venta}`)} className={configUi.actionButton} title="Editar">
                              <Pencil size={14} />
                            </button>
                          )}
                          {v.estado !== "Cancelada" && (
                            <button onClick={() => openModal("status", v)} className={cn(configUi.actionButton, "hover:bg-indigo-50 hover:text-indigo-600")} title="Estado">
                              <Package size={14} />
                            </button>
                          )}
                          <button onClick={() => openModal("eliminar", v)} className={cn(configUi.actionButton, "hover:bg-rose-50 hover:text-rose-600")} title="Eliminar">
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

          {/* Paginación */}
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

      {/* Alerta de Notificación */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-[#16315f]" : "bg-rose-600"}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

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
              className={`${configUi.modalPanel} ${modal === 'eliminar' ? "max-w-sm" : "max-w-lg"}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === 'eliminar' ? 'Eliminar Registro' : 'Actualizar Estado Logístico'}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      Orden de Pedido #{selectedVenta?.id_venta}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                  {modal === 'eliminar' ? (
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <Trash2 size={30} />
                      </div>
                      <p className="text-sm text-slate-500 italic leading-relaxed">¿Seguro que deseas eliminar permanentemente el pedido <span className="font-bold text-rose-600">#{selectedVenta?.id_venta}</span>?<br />Esta acción revertirá el stock de los productos.</p>
                    </div>
                  ) : (
                    <form id="status-form" onSubmit={handleStatusUpdate} className="space-y-6">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Nuevo Estado del Pedido</label>
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <select
                            value={statusFormEstado}
                            onChange={(e) => setStatusFormEstado(e.target.value)}
                            className={cn(configUi.fieldSelect, "pl-10")}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Entregada">Entregada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </div>
                      </div>

                      {statusFormEstado === 'Cancelada' && (
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Justificación de Cancelación *</label>
                          <textarea
                            value={cancelJustificacion}
                            onChange={(e) => setCancelJustificacion(e.target.value)}
                            placeholder="Ingrese la razón por la cual se cancela este pedido..."
                            className={cn(configUi.fieldInput, "min-h-[100px] pt-3")}
                          />
                          <p className="text-[10px] text-rose-500 font-bold mt-1.5 ml-1 select-none flex items-center gap-1">
                            <AlertCircle size={10} /> Campo obligatorio para el reporte de bajas.
                          </p>
                        </div>
                      )}
                    </form>
                  )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-xs text-slate-400 font-medium italic">
                    {modal === 'eliminar' ? "Esta operación es destructiva." : "Los cambios de estado se notifican al cliente."}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} className={configUi.secondaryButton}>
                      Cancelar
                    </button>
                    {modal === 'eliminar' ? (
                      <button onClick={handleDelete} className={configUi.dangerButton}>Eliminar Ahora</button>
                    ) : (
                      <button type="submit" form="status-form" className={cn(configUi.primaryButton, statusFormEstado === 'Cancelada' && "bg-rose-600 hover:bg-rose-700")}>
                        {statusFormEstado === 'Cancelada' ? 'Confirmar Cancelación' : 'Actualizar Estado'}
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
}

export default Pedidos;
