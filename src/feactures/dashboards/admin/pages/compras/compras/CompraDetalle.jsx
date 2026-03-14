import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { getCompraById } from "../../services/comprasService";
import { ArrowLeft, Truck, Calendar, DollarSign, Package, AlertCircle } from "lucide-react";

export default function CompraDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    const [compra, setCompra] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompra = async () => {
            try {
                setLoading(true);
                const data = await getCompraById(id);
                setCompra(data);
            } catch (err) {
                console.error("Error fetching compra:", err);
                setError("Error al cargar los detalles de la compra.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCompra();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando detalles...</p>
            </div>
        );
    }

    if (error || !compra) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-8 p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center ring-8 ring-rose-50/50">
                   <AlertCircle size={32} className="text-rose-500" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{error || "Orden no encontrada"}</h3>
                   <p className="text-slate-400 text-sm font-medium">No se ha podido recuperar la información del registro solicitado</p>
                </div>
                <button
                    onClick={() => navigate(`${basePath}/compras`)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <ArrowLeft size={16} />
                    Volver al Historial
                </button>
            </div>
        );
    }

    return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-10 bg-slate-50 min-h-screen font-['Outfit']"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">
                <button
                    onClick={() => navigate(`${basePath}/compras`)}
                    className="w-14 h-14 flex items-center justify-center bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex-1 space-y-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                       <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Orden #{compra.id_compra}</h1>
                       <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                           compra.estado === 'Recibida' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                           compra.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                           compra.estado === 'Cancelada' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                           'bg-slate-900 text-white border-slate-700'
                       }`}>
                           {compra.estado}
                       </div>
                    </div>
                    <p className="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2 italic">
                        <Calendar size={14} className="text-slate-300" />
                        Registrada el {new Date(compra.fecha_compra).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Columna Izquierda: Items */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div className="space-y-1">
                               <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-3">
                                   <Package size={20} className="text-indigo-500" />
                                   Desglose de Mercancía
                               </h2>
                               <p className="text-xs text-slate-400 font-medium tracking-tight">Detalle técnico de los productos adquiridos</p>
                            </div>
                            <span className="px-5 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                {compra.items?.length || 0} ítems
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-10 py-5 border-b border-slate-100">Producto</th>
                                        <th className="px-10 py-5 border-b border-slate-100">Especificación</th>
                                        <th className="px-10 py-5 border-b border-slate-100 text-right">Cantidad</th>
                                        <th className="px-10 py-5 border-b border-slate-100 text-right">Inversión Un.</th>
                                        <th className="px-10 py-5 border-b border-slate-100 text-right">Total Neto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {compra.items?.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                            <td className="px-10 py-6">
                                               <div className="flex flex-col gap-0.5">
                                                  <span className="font-bold text-slate-800 text-sm">{item.nombre_producto}</span>
                                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">REF: {item.sku || "N/A"}</span>
                                               </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                                                        {item.nombre_color !== "—" && (
                                                            <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm bg-slate-300"></div>
                                                        )}
                                                        {item.nombre_color}
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 leading-none border-l-2 border-indigo-400">Talla {item.nombre_talla}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                               <span className="text-sm font-black text-slate-700 bg-slate-50 px-4 py-1 rounded-lg border border-slate-100 tabular-nums">
                                                  {item.cantidad}
                                               </span>
                                            </td>
                                            <td className="px-10 py-6 text-right text-slate-500 text-sm font-bold tabular-nums">
                                               ${parseFloat(item.precio_unitario).toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                               <span className="text-sm font-black text-slate-800 tabular-nums">
                                                  ${(item.cantidad * item.precio_unitario).toLocaleString('es-CO')}
                                               </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-900 border-t-8 border-white text-white">
                                    <tr>
                                        <td colSpan="4" className="px-10 py-8 text-right font-black text-[11px] uppercase tracking-[0.3em] opacity-40">Liquidación Total</td>
                                        <td className="px-10 py-8 text-right font-black text-2xl tracking-tight">
                                            ${parseFloat(compra.total_compra).toLocaleString('es-CO')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Sidebar */}
                <div className="space-y-8">
                    {/* Proveedor Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-125" />
                        <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-3 relative z-10">
                            <Truck size={20} className="text-indigo-500" />
                            Aliado Comercial
                        </h2>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
                                  <p className="text-sm font-black text-slate-800 ml-1 leading-tight">{compra.nombre_proveedor || "—"}</p>
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificador Fiscal</label>
                                  <p className="text-xs font-bold text-slate-400 ml-1 font-mono tracking-tighter uppercase">{compra.nit_proveedor}</p>
                               </div>
                            </div>
                            
                            {compra.fecha_aproximada_entrega && (
                               <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4 ring-8 ring-amber-50/50">
                                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-50">
                                     <Calendar size={18} />
                                  </div>
                                  <div className="space-y-1">
                                     <p className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest leading-none">Entrega Estimada</p>
                                     <p className="text-xs font-black text-amber-700">{new Date(compra.fecha_aproximada_entrega).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                  </div>
                               </div>
                            )}
                        </div>
                    </div>

                    {/* Status Feedback */}
                    <AnimatePresence>
                        {compra.estado === 'Recibida' && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }} 
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-emerald-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-100 space-y-6 text-center"
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-white/10">
                                   <Package size={28} className="text-white" />
                                </div>
                                <div className="space-y-2">
                                   <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Operación Exitosa</p>
                                   <h4 className="text-xl font-black tracking-tight leading-tight">MERCANCÍA INGRESADA</h4>
                                   <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">El stock global de productos ha sido actualizado automáticamente por el sistema.</p>
                                </div>
                            </motion.div>
                        )}
                        {compra.estado === 'Cancelada' && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-rose-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-rose-100 space-y-6 text-center"
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-white/10">
                                   <AlertCircle size={28} className="text-white" />
                                </div>
                                <div className="space-y-2">
                                   <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Orden Anulada</p>
                                   <h4 className="text-xl font-black tracking-tight leading-tight">SIN MOVIMIENTO</h4>
                                   <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">Esta transacción fue revertida o cancelada y no afectó los niveles de inventario actual.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
