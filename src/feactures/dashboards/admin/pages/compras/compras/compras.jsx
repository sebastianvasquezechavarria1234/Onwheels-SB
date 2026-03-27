import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Eye, Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2,
  ShoppingCart, Filter, Calendar, X, Mail, MapPin, Briefcase, Info, Package, DollarSign, ChevronDown,
  CheckCircle, AlertTriangle, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";
import { cn, configUi } from "../../configuracion/configUi";
import FilterDropdown from "../../configuracion/FilterDropdown";

const Compras = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState("");
  const [proveedorFilter, setProveedorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  // Frontend Filtration & Pagination
  const [paginaActual, setPaginaActual] = useState(1);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const coreData = await comprasService.getAllCompras(); // Fetch all
      const dataProv = await comprasService.getProveedores();

      const comprasArray = coreData?.data || coreData?.compras || (Array.isArray(coreData) ? coreData : []);
      const provArray = dataProv?.data || dataProv?.proveedores || (Array.isArray(dataProv) ? dataProv : []);

      setCompras(comprasArray);
      setProveedores(provArray);
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

  const handleDelete = async (compraId) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la orden #${compraId}? Esta acción no se puede revertir.`)) return;
    
    setLoading(true);
    try {
      await comprasService.deleteCompra(compraId);
      showNotification("Transacción de compra eliminada correctamente");
      fetchData(); // Recargar datos
    } catch (err) {
      showNotification("Error al eliminar la compra", "error");
    } finally {
      setLoading(false);
    }
  };

  const closeDetails = () => {
    setModalOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  const getProveedorNombre = (id_proveedor) => {
    const p = proveedores.find(item => item.id_proveedor === id_proveedor);
    return p ? (p.nombre_empresa || p.nombre_proveedor) : "N/A";
  };

  const filtered = React.useMemo(() => {
    return compras.filter((c) => {
      const matchesSearch = String(c.id_compra).includes(search) ||
        getProveedorNombre(c.id_proveedor).toLowerCase().includes(search.toLowerCase());
      const matchesProv = !proveedorFilter || String(c.id_proveedor) === String(proveedorFilter);
      const matchesStatus = statusFilter === "Todos" || c.estado === statusFilter;
      return matchesSearch && matchesProv && matchesStatus;
    });
  }, [compras, search, proveedorFilter, statusFilter, proveedores]);

  const totalFiltered = filtered.length;
  const totalPaginasLocal = Math.max(1, Math.ceil(totalFiltered / itemsPorPagina));
  const currentItems = filtered.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);



  return (
    <div className={configUi.pageShell}>
      {/* Header Section */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Compras</h2>
          <span className={configUi.countBadge}>
            {totalFiltered} REGISTROS
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

          <div className="flex items-center gap-2">
            <FilterDropdown
              value={proveedorFilter || ""}
              onChange={(val) => { setProveedorFilter(val); setPaginaActual(1); }}
              options={[
                { label: "Todos los Proveedores", value: "" },
                ...proveedores.map(p => ({ 
                  label: p.nombre_empresa || p.nombre_proveedor, 
                  value: String(p.id_proveedor || p.nit),
                  icon: Briefcase
                }))
              ]}
              placeholder="Proveedor"
            />

            <FilterDropdown
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPaginaActual(1); }}
              options={[
                { label: "Todos los Estados", value: "Todos" },
                { label: "Pendiente", value: "Pendiente", color: "#f59e0b" },
                { label: "Recibida", value: "Recibida", color: "#10b981" },
                { label: "Cancelada", value: "Cancelada", color: "#ef4444" }
              ]}
              placeholder="Estado"
              icon={ShoppingCart}
            />
          </div>



          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/compras/crear`}
              className={configUi.primaryButton}
            >
              <Plus size={18} />
              <span>Nueva Compra</span>
            </Link>
          </div>
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
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Actualizando Facturación...</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="6" className={configUi.emptyState}>Sin registros de compras que coincidan.</td></tr>
              ) : (
                currentItems.map((c) => (
                  <tr key={c.id_compra} className={configUi.row}>
                    <td className={configUi.td}>
                      <span className="text-xs font-extrabold text-[#16315f] font-mono">#{c.id_compra}</span>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-50">
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#16315f]">{new Date(c.fecha_compra).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col text-sm text-[#16315f]">
                        <span className="font-bold">{getProveedorNombre(c.id_proveedor)}</span>
                        <span className="text-[10px] text-[#6b84aa]">ID: {c.id_proveedor}</span>
                      </div>
                    </td>
                    <td className={`${configUi.td} text-center`}>
                      {c.items && c.items.length > 0 ? (
                        <div className="flex flex-col gap-1 items-center text-center">
                          <span className="text-xs font-bold text-[#16315f] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                            {c.items.length} {c.items.length === 1 ? 'producto' : 'productos'}
                          </span>
                          <span className="text-[9px] text-slate-400 max-w-[150px] truncate" title={c.items.map(i => i.nombre_producto).join(', ')}>
                            {c.items.map(i => i.nombre_producto).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className={`${configUi.td} text-right font-black text-emerald-600`}>
                      ${(Number(c.total_compra) || 0).toLocaleString('es-CO')}
                    </td>
                    <td className={`${configUi.td} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetails(c)} className={configUi.actionButton} title="Detalle"><Eye size={14} /></button>
                        <Link to={`${basePath}/compras/editar/${c.id_compra}`} className={configUi.actionButton} title="Modificar">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(c.id_compra)} className={configUi.actionDangerButton} title="Eliminar">
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

        {/* --- Pagination Footer --- */}
        {totalPaginasLocal > 1 && (
          <div className={configUi.paginationBar}>
            <p className="text-sm font-bold text-[#6b84aa]">
              Página <span className="text-[#16315f]">{paginaActual}</span> de <span className="text-[#16315f]">{totalPaginasLocal}</span>
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
                disabled={paginaActual === totalPaginasLocal}
                onClick={() => setPaginaActual(p => Math.min(totalPaginasLocal, p + 1))}
                className={configUi.paginationButton}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
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
