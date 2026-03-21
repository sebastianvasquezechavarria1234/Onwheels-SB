import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Eye, Plus, Search, ChevronLeft, ChevronRight,
  ShoppingCart, Filter, Calendar, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";
import { cn, configUi } from "../../configUi";

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

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchData();
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
      showNotification("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const displayItems = compras;

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- Header & Control Bar --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
               Compras
            </h2>
            <span className={configUi.countBadge}>{totalItems} compras</span>
          </div>
          
          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
                placeholder="Buscar por ID..."
                className={configUi.inputWithIcon}
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative hidden md:block w-full sm:w-auto">
              <select
                value={proveedorFilter}
                onChange={(e) => { setProveedorFilter(e.target.value); setPaginaActual(1); }}
                className={configUi.select}
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map((p, idx) => (
                  <option key={p.id_proveedor || p.nit || `prov-${idx}`} value={p.id_proveedor || p.nit}>
                    {p.nombre_empresa || p.nombre_proveedor}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <ChevronRight className="rotate-90" size={16} />
              </div>
            </div>

            {/* Create Button */}
            <Link
              to={`${basePath}/compras/crear`}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Nueva Compra
            </Link>
          </div>
        </div>

        {/* --- Table Area --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem]`}>Factura / Fecha</th>
                  <th className={configUi.th}>Proveedor</th>
                  <th className={`${configUi.th} text-center`}>Productos</th>
                  <th className={configUi.th}>Total</th>
                  <th className={`${configUi.th} text-right rounded-tr-[1.4rem]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>
                      Cargando registros...
                    </td>
                  </tr>
                ) : displayItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>
                      No se encontraron compras.
                    </td>
                  </tr>
                ) : (
                  displayItems.map((c, idx) => (
                    <tr key={c.id_compra || `comp-${idx}`} className={configUi.row}>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                           <span className="font-bold text-[#16315f]">#{c.id_compra}</span>
                           <span className="text-[10px] text-[#6b84aa] flex items-center gap-1 mt-0.5">
                             <Calendar size={10} />
                             {new Date(c.fecha_compra).toLocaleDateString('es-CO')}
                           </span>
                        </div>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex flex-col">
                           <span className="font-bold text-[#16315f]">{c.nombre_empresa || c.nombre_proveedor || "—"}</span>
                           <span className="text-[10px] text-[#6b84aa] mt-0.5">{c.nombre_contacto || "-"}</span>
                        </div>
                      </td>
                      <td className={`${configUi.td} text-center`}>
                        <span className={configUi.subtlePill}>
                          {c.items?.length || 0} ítems
                        </span>
                      </td>
                      <td className={configUi.td}>
                         <span className="font-bold text-[#16315f]">
                           ${Number(c.total_compra).toLocaleString('es-CO')}
                         </span>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`${basePath}/compras/detalle/${c.id_compra}`}
                            className={configUi.actionButton}
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPaginas > 0 && (
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
          )}
        </div>
      </div>

      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 300 }} 
            className={`fixed top-4 right-4 z-[300] px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
              notification.type === "success" 
                ? "bg-blue-600" 
                : "bg-red-600"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Compras;
