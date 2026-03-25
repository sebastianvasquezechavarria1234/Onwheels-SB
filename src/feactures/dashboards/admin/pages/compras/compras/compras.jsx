import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Eye, Plus, Search, ChevronLeft, ChevronRight,
  ShoppingCart, Filter, Calendar, Download, X, Mail, MapPin, Briefcase, Info, Package, DollarSign, ChevronDown,
  CheckCircle, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";
import { cn, configUi } from "../../configuracion/configUi";

const Compras = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState("");
  const [proveedorFilter, setProveedorFilter] = useState("");
  
  // Backend Pagination State
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPorPagina = 10;

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [paginaActual, search, proveedorFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const coreData = await comprasService.getAllCompras({
        page: paginaActual,
        limit: itemsPorPagina,
        search: search,
        id_proveedor: proveedorFilter
      });
      const dataProv = await comprasService.getProveedores();
      
      if (coreData && coreData.compras) {
        setCompras(coreData.compras);
        setTotalPaginas(coreData.totalPages || 1);
        setTotalItems(coreData.totalCompras || 0);
      } else {
        setCompras(Array.isArray(coreData) ? coreData : []);
        setTotalPaginas(1);
        setTotalItems(Array.isArray(coreData) ? coreData.length : 0);
      }
      
      setProveedores(Array.isArray(dataProv) ? dataProv : []);
    } catch (err) {
      showNotification("Error de conexión: No se pudieron sincronizar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (compra) => {
    setSelected(compra);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setModalOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  return (
    <div className={configUi.pageShell}>
      {/* Header Section */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Historial de Compras</h2>
          <span className={configUi.countBadge}>
            {totalItems} REGISTROS
          </span>
        </div>

        <div className={configUi.toolbar}>
          {/* Search Bar */}
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID de factura..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
              className={configUi.inputWithIcon}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={proveedorFilter}
              onChange={(e) => { setProveedorFilter(e.target.value); setPaginaActual(1); }}
              className={cn(configUi.select, "w-full min-w-[220px]")}
            >
              <option value="">Todos los Proveedores</option>
              {proveedores.map(p => (
                <option key={p.id_proveedor || p.nit} value={p.id_proveedor || p.nit}>
                  {p.nombre_empresa || p.nombre_proveedor}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <ChevronDown size={18} />
            </div>
          </div>

          {/* Download Button */}
          <button className={configUi.iconButton} title="Descargar Reporte">
            <Download size={20} />
          </button>

          {/* New Purchase Button */}
          <Link
            to={`${basePath}/compras/crear`}
            className={configUi.primaryButton}
          >
            <Plus size={18} />
            Nueva Adquisición
          </Link>
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
                <th className={configUi.th}>Proveedor Autorizado</th>
                <th className={configUi.th + " text-center"}>Productos</th>
                <th className={configUi.th + " text-right"}>Total Liquidación</th>
                <th className={configUi.th + " text-right"}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e5f8]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Archivos...</p>
                    </div>
                  </td>
                </tr>
              ) : compras.length === 0 ? (
                <tr>
                  <td colSpan="6" className={configUi.emptyState}>
                    <div className="flex flex-col items-center gap-3 opacity-20">
                       <Briefcase size={48} />
                       <p className="text-xs font-black uppercase tracking-widest">Sin registros encontrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                compras.map((c, idx) => (
                  <tr key={c.id_compra} className={configUi.row}>
                    <td className={configUi.td + " text-center"}>
                      <span className="text-[10px] font-black text-slate-300">{(paginaActual - 1) * itemsPorPagina + idx + 1}</span>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col">
                         <span className="font-bold text-[#16315f] uppercase tracking-tight">#ORDEN-{c.id_compra.toString().padStart(5, '0')}</span>
                         <span className="text-[10px] text-[#6b84aa] flex items-center gap-1 mt-0.5">
                           <Calendar size={12} className="opacity-40" />
                           {new Date(c.fecha_compra).toLocaleDateString('es-CO')}
                         </span>
                      </div>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col">
                         <span className="font-bold text-[#16315f]">{c.nombre_empresa || c.nombre_proveedor || "—"}</span>
                         <span className="text-[10px] text-[#6b84aa] truncate max-w-[200px]">{c.email || "Sin contacto"}</span>
                      </div>
                    </td>
                    <td className={configUi.td + " text-center"}>
                      <span className={configUi.subtlePill}>
                         {c.items?.length || 0} UNI
                      </span>
                    </td>
                    <td className={configUi.td + " text-right font-bold tabular-nums"}>
                        ${Number(c.total_compra).toLocaleString('es-CO')}
                    </td>
                    <td className={configUi.td + " text-right"}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetails(c)}
                          className={configUi.actionButton}
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        <div className={configUi.paginationBar}>
          <p className="text-sm font-bold text-[#6b84aa]">
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
            
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              className={configUi.paginationButton}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- Details Modal --- */}
      <AnimatePresence>
        {modalOpen && selected && (
          <motion.div 
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetails}
          >
            <motion.div 
              className={cn(configUi.modalPanel, "max-w-4xl")}
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={configUi.modalHeader}>
                <div>
                   <h3 className={configUi.modalTitle}>Detalle de Transacción</h3>
                   <p className={configUi.modalSubtitle}>ID Factura: #ORDEN-{selected.id_compra.toString().padStart(5, '0')}</p>
                </div>
                <button onClick={closeDetails} className={configUi.modalClose}><X size={20} /></button>
              </div>

              <div className={configUi.modalContent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className={configUi.formSection}>
                    <p className={configUi.modalEyebrow}>Proveedor</p>
                    <p className="text-lg font-black text-[#16315f] mt-1">{selected.nombre_empresa || selected.nombre_proveedor}</p>
                    <p className="text-sm text-[#6b84aa]">{selected.email || "No registrado"}</p>
                  </div>
                  <div className={configUi.formSection}>
                    <p className={configUi.modalEyebrow}>Fecha y Liquidación</p>
                    <div className="flex justify-between items-end mt-1">
                      <div>
                        <p className="text-sm font-bold text-[#16315f]">{new Date(selected.fecha_compra).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p className={configUi.successPill + " mt-2"}>Liquidación Finalizada</p>
                      </div>
                      <p className="text-2xl font-black text-[#16315f] tabular-nums">${Number(selected.total_compra).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                    <Package size={14} /> Desglose de Productos
                  </h4>
                  <div className="rounded-2xl border border-[#d7e5f8] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#f8fbff] text-[#6b84aa] text-[10px] font-black uppercase tracking-widest border-b border-[#f0f6ff]">
                        <tr>
                          <th className="px-5 py-3">Referencia</th>
                          <th className="px-5 py-3 text-center">Cant.</th>
                          <th className="px-5 py-3 text-right">Unitario</th>
                          <th className="px-5 py-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f6ff]">
                        {selected.items?.map((item, idx) => (
                          <tr key={idx} className="text-[12px] text-[#16315f]">
                            <td className="px-5 py-3">
                               <div className="flex flex-col">
                                  <span className="font-bold uppercase">{item.nombre_producto}</span>
                                  <span className="text-[10px] text-[#6b84aa]">{item.nombre_variante}</span>
                               </div>
                            </td>
                            <td className="px-5 py-3 text-center font-bold">x{item.cantidad}</td>
                            <td className="px-5 py-3 text-right tabular-nums text-[#6b84aa]">${Number(item.precio_unitario).toLocaleString('es-CO')}</td>
                            <td className="px-5 py-3 text-right tabular-nums font-bold">${Number(item.subtotal).toLocaleString('es-CO')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className={configUi.modalFooter}>
                 <button onClick={closeDetails} className={configUi.secondaryButton}>Cerrar Detalle</button>
                 <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-[#6b84aa]">TOTAL LIQUIDADO:</span>
                    <span className="text-xl font-black text-[#16315f]">${Number(selected.total_compra).toLocaleString('es-CO')}</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NOTIFICATIONS --- */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0 }} 
            className={cn(
               "fixed top-4 right-4 z-[1000] px-6 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-3",
               notification.type === "success" ? "bg-[#16315f]" : "bg-rose-500"
            )}
          >
            {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Compras;
