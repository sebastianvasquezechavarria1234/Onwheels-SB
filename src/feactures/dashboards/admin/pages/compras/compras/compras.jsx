import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState("");
  const [proveedorFilter, setProveedorFilter] = useState("");

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

      setCompras(Array.isArray(coreData) ? coreData : (coreData.compras || []));

      setProveedores(Array.isArray(dataProv) ? dataProv : []);
    } catch (err) {
      showNotification("Error de conexión: No se pudieron sincronizar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (compra) => {
    navigate(`${basePath}/compras/detalle/${compra.id_compra}`);
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
      const provName = c.nombre_proveedor || "Proveedor sin nombre";
      const matchesSearch = String(c.id_compra).includes(search) ||
        provName.toLowerCase().includes(search.toLowerCase());
      const matchesProv = !proveedorFilter || String(c.nit_proveedor) === String(proveedorFilter);
      return matchesSearch && matchesProv;
    });
  }, [compras, search, proveedorFilter]);

  const totalFiltered = filtered.length;
  const totalPaginasLocal = Math.max(1, Math.ceil(totalFiltered / itemsPorPagina));
  const currentItems = filtered.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);

  const handleDownload = () => {
    if (!filtered || filtered.length === 0) return;
    const header = ["ID Compra", "Fecha", "Proveedor", "Total Compra", "Cantidad Refs"];
    const csvData = filtered.map(c => [
      c.id_compra,
      new Date(c.fecha_compra).toLocaleDateString('es-CO'),
      `"${c.nombre_proveedor || "Proveedor sin nombre"}"`,
      c.total_compra || 0,
      c.items?.length || 0
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [header.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_compras_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <button onClick={handleDownload} className={configUi.iconButton} title="Descargar Reporte">
            <Download size={20} />
          </button>

          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/compras/crear`}
              className={configUi.primaryButton}
            >
              <Plus size={18} />
              <span>Crear</span>
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
                <th className={configUi.th + " text-right"}>Total Compra</th>
                <th className={configUi.th + " text-right"}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d7e5f8]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Actualizando Compras...</p>
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
                        <div className="h-9 w-9 bg-indigo-50/50 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-50 shrink-0">
                          <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#16315f]">{new Date(c.fecha_compra).toLocaleDateString('es-CO')}</span>
                        </div>
                      </div>
                    </td>
                    <td className={configUi.td}>
                      <div className="flex flex-col text-sm text-[#16315f]">
                        <span className="font-bold truncate max-w-[200px]">{c.nombre_proveedor || "Proveedor sin nombre"}</span>
                        <span className="text-[10px] text-[#6b84aa]">NIT: {c.nit_proveedor}</span>
                      </div>
                    </td>
                    <td className={`${configUi.td} text-center`}>
                      <span className="font-bold text-xs text-[#6b84aa] px-3 py-1 bg-[#f8fbff] rounded-lg border border-[#d7e5f8]">
                        {c.items?.length || 0} Refs
                      </span>
                    </td>
                    <td className={`${configUi.td} text-right font-extrabold text-[#16315f] tabular-nums`}>
                      ${(Number(c.total_compra) || 0).toLocaleString('es-CO')}
                    </td>
                    <td className={`${configUi.td} text-right`}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetails(c)} className={configUi.actionButton} title="Detalle"><Eye size={14} /></button>
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
