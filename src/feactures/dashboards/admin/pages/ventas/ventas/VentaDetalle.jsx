import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, User, Calendar, DollarSign, Package, 
  Clock, Hash, MapPin, Phone, Mail, AlertTriangle,
  ChevronRight, Info, CheckCircle, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

import { getVentaById } from "../../services/ventasService";
import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
               <div className="w-10 h-10 border-4 border-[#16315f]/10 border-t-[#16315f] rounded-full animate-spin"></div>
               <p className="text-[10px] font-black tracking-widest text-[#16315f]">Sincronizando Factura...</p>
            </div>
        );
    }

    if (error || !venta) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 text-center px-4">
                <div className="h-24 w-24 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
                   <AlertTriangle size={48} strokeWidth={1} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-[#16315f] mb-2">Error de Localización</h2>
                   <p className="text-slate-400 font-medium max-w-md">{error || "La transacción solicitada no existe en nuestros registros actuales."}</p>
                </div>
                <button
                    onClick={() => navigate(`${basePath}/ventas`)}
                    className={cn(configUi.primaryButton, "h-12")}
                >
                    <ArrowLeft size={20} />
                    Regresar al Historial
                </button>
            </div>
        );
    }

    const getStatusStyle = (estado) => {
        switch (estado) {
          case "Entregada": return "bg-emerald-50 text-emerald-700 border-emerald-100";
          case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-100";
          case "Procesada": return "bg-indigo-50 text-indigo-700 border-indigo-100";
          case "Cancelada": return "bg-rose-50 text-rose-700 border-rose-100";
          default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className={cn(configUi.pageShell, "pb-24")}>
            {/* 1. STICKY HEADER ACTIONS */}
            <div className={cn(configUi.headerRow, "sticky top-4 z-[30] !bg-white/80 backdrop-blur-xl border border-slate-100 p-4 rounded-3xl shadow-xl shadow-slate-200/50 mb-10")}>
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate(`${basePath}/ventas`)} className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-[#16315f] hover:border-[#16315f]/20 hover:shadow-lg transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                           <h1 className="text-xl font-black text-[#16315f] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                              Comprobante de Venta Digital
                           </h1>
                           <span className={cn(configUi.pill, getStatusStyle(venta.status || venta.estado), "text-[10px] shadow-sm")}>
                              {venta.status || venta.estado}
                           </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           REF: <span className="text-indigo-400">#VS-{venta.id_venta}</span> &bull; 
                           <Calendar size={12} className="ml-1" /> {new Date(venta.fecha_venta).toLocaleDateString()} &bull; 
                           <Clock size={12} /> {new Date(venta.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                   <button onClick={() => window.print()} className={cn(configUi.secondaryButton, "h-12 border-slate-200 bg-white shadow-sm")}>
                      Descargar PDF / Imprimir
                   </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* 2. MAIN ITEMS TABLE */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 ring-1 ring-slate-100/50">
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                           <div>
                              <h3 className="text-xl font-extrabold text-[#16315f] flex items-center gap-3">
                                 <Package className="text-indigo-500" size={24} />
                                 Artículos Facturados
                              </h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-9">Detalle de existencias movilizadas</p>
                           </div>
                           <div className="h-10 px-4 rounded-xl bg-white border border-slate-100 flex items-center gap-2 shadow-sm">
                              <span className="text-[10px] font-black text-slate-300 uppercase italic">Registro:</span>
                              <span className="text-xs font-black text-indigo-600">{venta.items?.length || 0} ITEMS</span>
                           </div>
                        </div>

                        <div className="overflow-x-auto px-6 py-6 font-medium">
                            <table className="w-full text-left">
                                <thead className="bg-[#16315f]/5 text-slate-400 font-extrabold uppercase text-[10px] tracking-widest rounded-2xl">
                                    <tr>
                                        <th className="px-6 py-5 rounded-l-2xl">Producto</th>
                                        <th className="px-6 py-5">Especificación</th>
                                        <th className="px-6 py-5 text-center">Cant.</th>
                                        <th className="px-6 py-5 text-right">Unitario</th>
                                        <th className="px-6 py-5 text-right rounded-r-2xl">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {venta.items?.map((it, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-all duration-300">
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col">
                                                   <span className="text-sm font-black text-[#16315f] tracking-tight">{it.nombre_producto}</span>
                                                   <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">ID SKU: {it.id_producto}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex items-center gap-3">
                                                   <div className="flex flex-col gap-1">
                                                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                         <div className="w-3 h-3 rounded-full border border-slate-100 shadow-inner" style={{ backgroundColor: it.codigo_hex || '#e2e8f0' }}></div>
                                                         {it.nombre_color || "Predeterminado"}
                                                      </span>
                                                      <span className="text-[10px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg w-fit">
                                                         Talla {it.nombre_talla || "U"}
                                                      </span>
                                                   </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center font-black text-slate-700 text-sm font-mono">{it.cantidad}</td>
                                            <td className="px-6 py-8 text-right font-bold text-slate-400 text-sm">${(parseFloat(it.precio_unitario) || 0).toLocaleString()}</td>
                                            <td className="px-6 py-8 text-right font-black text-[#16315f] text-base tracking-tighter shadow-indigo-50/50">
                                                ${((it.cantidad || 0) * (it.precio_unitario || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center group relative overflow-hidden">
                           <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 skew-x-12 translate-x-1/2"></div>
                           <div className="flex flex-col gap-1 relative z-10">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Fiscalización de Ingreso</span>
                              <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
                           </div>
                           <div className="text-right relative z-10">
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Impacto Total en Caja</span>
                              <span className="text-4xl font-black text-[#16315f] tracking-tighter">${(parseFloat(venta.total) || 0).toLocaleString()}</span>
                           </div>
                        </div>
                    </div>
                </div>

                {/* 3. INFO SIDEBAR */}
                <div className="space-y-10">
                    {/* CLIENT CARD */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden ring-1 ring-slate-100/50">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <User size={80} strokeWidth={1} />
                        </div>
                        
                        <h3 className="text-lg font-extrabold text-[#16315f] mb-8 flex items-center gap-3">
                           <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100">
                              <User size={20} />
                           </div>
                           Datos del Pagador
                        </h3>

                        <div className="space-y-8 relative z-10">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identidad Legal</label>
                              <p className="text-sm font-black text-[#16315f] leading-tight">{venta.nombre_cliente || "IDENTIDAD NO REGISTRADA"}</p>
                              <div className="flex items-center gap-3 mt-2">
                                 <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">ID: {venta.id_cliente}</span>
                                 <span className="text-[11px] font-bold text-slate-400">CC: {venta.documento || "—"}</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-50">
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                    <Phone size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Contacto</span>
                                    <span className="text-xs font-bold text-[#16315f]">{venta.telefono || "Sin teléfono"}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                    <Mail size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Correo-E</span>
                                    <span className="text-xs font-bold text-[#16315f] lowercase truncate max-w-[180px]">{venta.email || "Sin email"}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                    <MapPin size={14} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Logística de Entrega</span>
                                    <span className="text-xs font-bold text-[#16315f] leading-tight">{venta.direccion_envio || "Entrega en punto físico"}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                    </div>

                    {/* PAYMENT INFO */}
                    <div className="bg-[#16315f] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 text-white/5 opacity-40 group-hover:scale-110 transition-transform duration-1000">
                           <CreditCard size={180} strokeWidth={0.5} />
                        </div>

                        <h3 className="text-lg font-extrabold mb-8 flex items-center gap-3">
                           <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 backdrop-blur-md border border-white/10">
                              <DollarSign size={20} />
                           </div>
                           Certificado de Pago
                        </h3>

                        <div className="space-y-6 relative z-10">
                           <div className="flex justify-between items-center py-4 border-b border-white/5">
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Metodología</span>
                              <span className="text-sm font-black bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">{venta.metodo_pago || "Efectivo"}</span>
                           </div>
                           
                           <div className="pt-2">
                              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-4 text-center">
                                 <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Total Recaudado</span>
                                 <span className="text-4xl font-black tracking-tighter">${(parseFloat(venta.total) || 0).toLocaleString()}</span>
                                 <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/40">
                                    <CheckCircle size={12} className="text-emerald-400" /> Transacción Conciliada
                                 </div>
                              </div>
                           </div>
                        </div>
                    </div>

                    {/* ANULACIÓN INFO (SOLO SI CANCELADA) */}
                    {(venta.status === "Cancelada" || venta.estado === "Cancelada") && (
                        <div className="bg-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <h3 className="text-lg font-extrabold mb-6 flex items-center gap-3">
                               <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                                  <AlertTriangle size={20} />
                               </div>
                               Registro de Anulación
                            </h3>
                            <div className="space-y-4">
                               <label className="text-[9px] font-black text-white/50 uppercase tracking-widest block">Dictamen de Cancelación:</label>
                               <div className="p-6 bg-black/10 rounded-3xl border border-white/5 italic text-sm font-medium leading-relaxed">
                                  "{venta.motivo_cancelacion || "Se procedió con la anulación por solicitud administrativa."}"
                               </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
