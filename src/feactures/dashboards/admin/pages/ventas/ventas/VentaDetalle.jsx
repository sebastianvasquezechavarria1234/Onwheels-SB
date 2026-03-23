import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, User, Calendar, DollarSign, Package, 
  Clock, Hash, MapPin, Phone, Mail, AlertTriangle,
  ChevronRight, Info, CheckCircle, CreditCard, Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getVentaById } from "../../services/ventasService";
import { cn, configUi } from "../../configuracion/configUi";

export default function VentaDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
    
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVenta = async () => {
            try {
                setLoading(true);
                const data = await getVentaById(id);
                setVenta(data);
            } catch (err) {
                console.error("Error fetching venta:", err);
                setError("No se pudo recuperar la información de esta transacción.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchVenta();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
               <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin"></div>
               <p className="text-[10px] font-black tracking-widest text-[#16315f] uppercase">Sincronizando Factura...</p>
            </div>
        );
    }

    if (error || !venta) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
                <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
                   <AlertTriangle size={40} strokeWidth={1} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-[#16315f] mb-2 uppercase tracking-tight">Error de Localización</h2>
                   <p className="text-xs text-slate-400 font-bold max-w-md uppercase tracking-widest opacity-60">{error || "La transacción solicitada no existe."}</p>
                </div>
                <button
                    onClick={() => navigate(`${basePath}/ventas`)}
                    className={cn(configUi.primaryButton, "h-11 px-8")}
                >
                    <ArrowLeft size={20} />
                    Regresar al Historial
                </button>
            </div>
        );
    }

    const getStatusStyle = (estado) => {
        switch (estado) {
          case "Entregada": return configUi.successPill;
          case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-100 rounded-full px-3 py-1 text-xs font-bold border";
          case "Procesada": return configUi.subtlePill;
          case "Cancelada": return configUi.dangerPill;
          default: return configUi.pill;
        }
    };

    return (
        <div className={configUi.pageShell}>
            {/* Header Row */}
            <div className={configUi.headerRow + " mb-8"}>
                <div className={configUi.titleWrap}>
                    <button
                        onClick={() => navigate(`${basePath}/ventas`)}
                        className={configUi.iconButton + " w-10 h-10 rounded-xl"}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={configUi.title}>Comprobante de Venta</h1>
                            <span className={cn(getStatusStyle(venta.status || venta.estado), "text-[9px] uppercase tracking-widest")}>
                                {venta.status || venta.estado}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                           REF: <span className="text-indigo-400 font-black">#VS-{String(venta.id_venta).padStart(6, '0')}</span> &bull; 
                           <Calendar size={12} className="opacity-40" /> {new Date(venta.fecha_venta).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className={configUi.toolbar}>
                   <button onClick={() => window.print()} className={configUi.secondaryButton + " gap-2"}>
                      <Printer size={18} />
                      Imprimir Comprobante
                   </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                
                {/* Left: Transaction Details & Items */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    <div className={configUi.tableCard}>
                        <div className="px-6 py-4 border-b border-[#d7e5f8] flex justify-between items-center bg-[#fbfdff]/50">
                            <h3 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                                <Package size={14} className="text-indigo-500" /> Artículos Facturados
                            </h3>
                            <span className={configUi.subtlePill}>{venta.items?.length || 0} UNI</span>
                        </div>

                        <div className={configUi.tableScroll}>
                            <table className={configUi.table}>
                                <thead className={configUi.thead}>
                                    <tr>
                                        <th className={configUi.th}>Producto / Especificación</th>
                                        <th className={configUi.th + " text-center"}>Cant.</th>
                                        <th className={configUi.th + " text-right"}>Unitario</th>
                                        <th className={configUi.th + " text-right"}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#d7e5f8]">
                                    {venta.items?.map((it, idx) => (
                                        <tr key={idx} className={configUi.row}>
                                            <td className={configUi.td}>
                                                <div className="flex flex-col">
                                                   <span className="font-bold uppercase tracking-tight text-[#16315f]">{it.nombre_producto}</span>
                                                   <span className="text-[10px] text-indigo-400 font-black uppercase mt-0.5">{it.nombre_color} / {it.nombre_talla}</span>
                                                </div>
                                            </td>
                                            <td className={configUi.td + " text-center"}>
                                                <span className={configUi.subtlePill}>x{it.cantidad}</span>
                                            </td>
                                            <td className={configUi.td + " text-right font-bold text-slate-400 tabular-nums"}>
                                                ${(parseFloat(it.precio_unitario) || 0).toLocaleString('es-CO')}
                                            </td>
                                            <td className={configUi.td + " text-right font-black text-[#16315f] tabular-nums"}>
                                                ${((it.cantidad || 0) * (it.precio_unitario || 0)).toLocaleString('es-CO')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-auto px-6 py-8 border-t border-[#d7e5f8] bg-[#fbfdff] flex justify-between items-center relative overflow-hidden">
                           <div className="flex flex-col">
                              <p className={configUi.modalEyebrow}>Impacto Contable</p>
                              <div className="h-1 w-16 bg-indigo-500 rounded-full mt-1"></div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Total Facturado</p>
                              <p className="text-4xl font-black text-[#16315f] tracking-tighter">${Number(venta.total).toLocaleString('es-CO')}</p>
                           </div>
                        </div>
                    </div>

                    {/* Justificación de cancelación si aplica */}
                    {(venta.status === "Cancelada" || venta.estado === "Cancelada") && (
                        <div className={cn(configUi.formSection, "border-rose-200 bg-rose-50/50 p-8")}>
                            <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest flex items-center gap-3 mb-4">
                               <AlertTriangle size={18} /> Justificación de Anulación
                            </h3>
                            <div className="p-6 bg-white/80 rounded-2xl border border-rose-100 text-sm font-bold text-rose-700 italic shadow-sm">
                               "{venta.justificacion_cancelacion || "Operación cancelada por solicitud administrativa."}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Personal & Payment Info */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Client Info */}
                    <div className={cn(configUi.formSection, "p-8 space-y-8")}>
                        <h3 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                           <User size={16} className="text-indigo-500" /> Resumen del Cliente
                        </h3>

                        <div className="space-y-6">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo / ID</p>
                              <p className="text-lg font-black text-[#16315f] leading-tight uppercase tracking-tight">{venta.nombre_cliente || "Consumidor Final"}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className={configUi.subtlePill}>ID: {venta.id_cliente || "—"}</span>
                                 <span className="text-[11px] font-bold text-[#6b84aa]">CC: {venta.documento || "—"}</span>
                              </div>
                           </div>

                           <div className="space-y-4 pt-4 border-t border-[#d7e5f8]">
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                    <Phone size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Contacto Directo</span>
                                    <span className="text-xs font-bold text-[#16315f]">{venta.telefono || "No disponible"}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                    <MapPin size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Dirección de Despacho</span>
                                    <span className="text-xs font-bold text-[#16315f] leading-tight">{venta.direccion_envio || "Recogida en sede local"}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                    </div>

                    {/* Payment Status Card */}
                    <div className="bg-[#16315f] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <CreditCard size={100} />
                        </div>
                        
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                           <DollarSign size={16} /> Parámetros de Recaudo
                        </h3>

                        <div className="space-y-8">
                           <div className="flex justify-between items-center py-4 border-b border-white/10">
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Metodología</span>
                              <span className="text-xs font-black uppercase bg-white/10 px-4 py-1.5 rounded-xl border border-white/5">{venta.metodo_pago || "Efectivo"}</span>
                           </div>

                           <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center space-y-2">
                               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Valor Liquidado</p>
                               <p className="text-3xl font-black tracking-tighter">${Number(venta.total).toLocaleString('es-CO')}</p>
                               <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-white/30 uppercase mt-2">
                                  <CheckCircle size={10} className="text-emerald-400" /> Operación Certificada
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
