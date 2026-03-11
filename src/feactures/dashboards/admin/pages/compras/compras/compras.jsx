import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye, Plus, Search, ChevronLeft, ChevronRight,
  ShoppingCart, Filter, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comprasService from "../../services/comprasService";

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState("");
  const [proveedorFilter, setProveedorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const coreData = await comprasService.getAllCompras();
      const dataProv = await comprasService.getProveedores();
      setCompras(coreData || []);
      setProveedores(Array.isArray(dataProv) ? dataProv : []);
    } catch (err) {
      showNotification("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = compras.filter(c => {
    const matchesSearch = c.id_compra.toString().includes(search) ||
      c.nombre_empresa?.toLowerCase().includes(search.toLowerCase());
    const matchesProv = proveedorFilter === "" || c.id_proveedor?.toString() === proveedorFilter || c.nit_proveedor?.toString() === proveedorFilter;
    return matchesSearch && matchesProv;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header & Stats */}
      <div className="shrink-0 flex flex-col gap-4 p-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Inventario / Compras
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r pr-4 border-slate-100 italic text-slate-400 text-xs">
              Resumen de adquisiciones
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F0E6E6] text-[#040529] border border-[#040529]/10 shadow-sm">
              <span className="text-xs font-bold">{filtered.length} órdenes</span>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por ID o Proveedor..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={proveedorFilter}
              onChange={(e) => { setProveedorFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 outline-none transition bg-white appearance-none"
            >
              <option value="">Todos los Proveedores</option>
              {proveedores.map((p, idx) => <option key={p.id_proveedor || p.nit || `prov-${idx}`} value={p.id_proveedor || p.nit}>{p.nombre_empresa || p.nombre_proveedor}</option>)}
            </select>
          </div>
          <Link
            to="/admin/compras/crear"
            className="flex items-center justify-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />
            Nueva Orden
          </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left relative">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">ID Compra</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Proveedor</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider">Total</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-center">Productos</th>
                  <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400 text-sm italic">Cargando órdenes de compra...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-400 italic">No se registraron compras</td></tr>
                ) : (
                  currentItems.map((c, idx) => (
                    <tr key={c.id_compra || `comp-${idx}`} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#040529] text-sm">
                        <div className="flex items-center gap-2 text-slate-400 font-bold italic">
                          <ShoppingCart size={14} /> #{c.id_compra}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#040529] text-sm">{c.nombre_empresa || c.nombre_proveedor || "—"}</div>
                        <div className="text-[10px] text-slate-400">{c.nombre_contacto || ""}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(c.fecha_compra).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-[#040529] text-sm tabular-nums">
                        ${Number(c.total_compra).toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-500">
                          {c.items?.length || 0} ítems
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/compras/detalle/${c.id_compra}`}
                          className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100 inline-flex"
                          title="Ver Detalle"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Página <span className="font-bold text-[#040529]">{currentPage}</span> de <span className="font-bold text-[#040529]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-bold ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Compras;
