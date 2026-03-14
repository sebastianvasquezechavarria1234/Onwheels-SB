import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Eye, Plus, Search, ChevronLeft, ChevronRight,
  ShoppingCart, Filter, Calendar, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";

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

  // Filter logic handled by backend, but we keep the structure for compatibility if needed
  const displayItems = compras;

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-['Outfit']">
      {/* Header & Stats */}
      <div className="shrink-0 flex flex-col gap-6 p-8 pb-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#040529] font-['Outfit'] tracking-tight">
              Historial de Compras
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span>{totalItems} órdenes totales</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Registro de adquisiciones</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => {/* Lógica de descarga si existiera */}}
              className="p-2.5 text-gray-400 hover:text-[#040529] hover:bg-gray-50 rounded-xl transition-all border border-gray-200 shadow-sm"
              title="Descargar Reporte"
            >
              <Download size={20} />
            </button>
            <Link
              to={`${basePath}/compras/crear`}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#040529] text-white rounded-xl text-sm font-bold hover:bg-[#040529]/90 transition-all shadow-lg shadow-[#040529]/10 active:scale-95"
            >
              <Plus size={18} />
              <span>Registrar Compra</span>
            </Link>
          </div>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#040529] transition-colors" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
              placeholder="Buscar por ID o proveedor..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm"
            />
          </div>
          
          <div className="relative w-full sm:w-64 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <select
              value={proveedorFilter}
              onChange={(e) => { setProveedorFilter(e.target.value); setPaginaActual(1); }}
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm appearance-none cursor-pointer font-medium text-gray-600"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((p, idx) => (
                <option key={p.id_proveedor || p.nit || `prov-${idx}`} value={p.id_proveedor || p.nit}>
                  {p.nombre_empresa || p.nombre_proveedor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-8 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/50 text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 text-slate-800">Orden / Fecha</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">Origen Comercial</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 text-center">Detalle Galería</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">Inversión Total</th>
                  <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sincronizando órdenes...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center space-y-4">
                       <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                         <ShoppingCart className="text-slate-200" size={32} />
                       </div>
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sin registros</p>
                    </td>
                  </tr>
                ) : (
                  displayItems.map((c, idx) => (
                    <tr key={c.id_compra || `comp-${idx}`} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                             <span className="p-1 bg-slate-100 rounded text-slate-400"><ShoppingCart size={12} /></span>
                             #{c.id_compra}
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1 leading-none">{new Date(c.fecha_compra).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-800 leading-tight">{c.nombre_empresa || c.nombre_proveedor || "—"}</span>
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter mt-1 leading-none">{c.nombre_contacto || "Sin contacto directo"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {c.items?.length || 0} items registrados
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-800 text-sm tabular-nums">
                        ${Number(c.total_compra).toLocaleString('es-CO')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link
                          to={`${basePath}/compras/detalle/${c.id_compra}`}
                          className="p-3 rounded-2xl bg-white text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all hover:scale-110 inline-flex group-hover:shadow-md"
                        >
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-gray-100 px-8 py-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-bold text-[#040529]">{displayItems.length}</span> de <span className="font-bold text-[#040529]">{totalItems}</span> registros
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPaginaActual(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      paginaActual === i + 1
                        ? "bg-[#040529] text-white shadow-lg shadow-[#040529]/20"
                        : "text-gray-400 hover:text-[#040529] hover:bg-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 rounded-3xl shadow-2xl text-[11px] font-black uppercase tracking-[0.2em] border backdrop-blur-md flex items-center gap-3 ${
              notification.type === "success" 
                ? "bg-slate-900/90 text-white border-slate-700" 
                : "bg-rose-500/90 text-white border-rose-400"
            }`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${notification.type === "success" ? "bg-emerald-400" : "bg-white"}`} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Compras;
