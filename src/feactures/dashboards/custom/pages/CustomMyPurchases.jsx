"use client"

import React, { useEffect, useState, useCallback } from "react";
import { 
  Eye, 
  Shirt, 
  ShoppingBag, 
  Calendar, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../../../services/api";
import { configUi, cn } from "../../admin/pages/configuracion/configUi";
// import { CustomDashboardLayout } from "../layout/CustomDashboardLayout"; // Removed

export const CustomMyPurchases = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/ventas/mis-compras");
      setCompras(data || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      showNotification("No se pudo cargar el historial de compras", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const openView = (c) => {
    setSelected({ ...c });
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelected(null);
    setModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  };

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
            <h2 className={configUi.title}>Mis Adquisiciones</h2>
            <span className={configUi.countBadge}>
              {compras.length} ÓRDENES
            </span>
          </div>

          <div className={configUi.toolbar}>
            <Link to="/custom/store" className={configUi.primaryButton}>
              <ShoppingBag size={18} />
              Explorar Tienda
            </Link>
          </div>
        </div>

        {/* Content Table */}
        <div className={cn(configUi.tableCard, "mt-4")}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={configUi.th + " w-12 text-center"}>#</th>
                  <th className={configUi.th}>Referencia / Fecha</th>
                  <th className={configUi.th}>Monto Total</th>
                  <th className={configUi.th + " text-center"}>Estado</th>
                  <th className={configUi.th + " text-right"}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7e5f8]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Historial...</p>
                      </div>
                    </td>
                  </tr>
                ) : compras.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>
                      <div className="flex flex-col items-center py-10">
                        <Package size={48} className="text-slate-200 mb-4" />
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No hay registros de compras aún</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  compras.map((c) => (
                    <tr key={c.id_venta} className={cn(configUi.row, "cursor-pointer")} onClick={() => openView(c)}>
                      <td className={configUi.td}>
                        <span className="text-xs font-extrabold text-[#16315f] font-mono">#{c.id_venta}</span>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-50">
                            <Calendar size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#16315f]">{formatDate(c.fecha_venta)}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                              <Clock size={10} /> {new Date(c.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={cn(configUi.td, "font-extrabold text-[#16315f] text-sm")}>
                        ${(Number(c.total) || 0).toLocaleString()}
                      </td>
                      <td className={cn(configUi.td, "text-center")}>
                        <span className={cn(configUi.pill, getStatusStyle(c.estado), "border shadow-sm")}>
                          {c.estado}
                        </span>
                      </td>
                      <td className={cn(configUi.td, "text-right")}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openView(c); }} className={configUi.actionButton} title="Detalle">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalles */}
        <AnimatePresence>
          {modalOpen && selected && (
            <motion.div
              className={configUi.modalBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className={cn(configUi.modalPanel, "max-w-2xl")}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>Detalle de Adquisición</h3>
                    <p className={configUi.modalSubtitle}>Orden de Compra #{selected.id_venta}</p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
                </div>

                <div className={configUi.modalContent}>
                  <div className="space-y-6">
                    {/* Items Section */}
                    <div>
                      <h4 className={configUi.fieldLabel}>Artículos Adquiridos</h4>
                      <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {selected.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center">
                              {item.imagen ? (
                                <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                              ) : (
                                <Shirt size={24} className="text-slate-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-[#16315f] truncate uppercase">{item.nombre_producto}</h5>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                {item.nombre_color} • {item.nombre_talla}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-black text-[#16315f]">${Number(item.precio_unitario).toLocaleString()}</p>
                              <p className="text-[10px] text-slate-400 font-bold tracking-widest">CANT: {item.cantidad}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className={configUi.formSection}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className={configUi.fieldLabel}>Método de Pago</p>
                          <p className="text-xs font-bold text-[#16315f] uppercase">{selected.metodo_pago}</p>
                        </div>
                        <div className="space-y-1">
                          <p className={configUi.fieldLabel}>Estado Logístico</p>
                          <span className={cn(configUi.pill, getStatusStyle(selected.estado), "text-[10px] scale-90 -translate-x-2")}>
                            {selected.estado}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-end">
                         <div>
                            <p className={configUi.fieldLabel}>Total Documento</p>
                            <p className="text-2xl font-black text-[#16315f] tracking-tighter line-height-none">
                               ${(Number(selected.total) || 0).toLocaleString()}
                            </p>
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                            <CheckCircle size={12} />
                            IVA INCLUIDO
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={configUi.modalFooter}>
                  <button onClick={closeModal} className={configUi.secondaryButton}>Regresar</button>
                  <button onClick={() => window.print()} className={configUi.primaryButton}>
                    Imprimir Comprobante
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications */}
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
};
