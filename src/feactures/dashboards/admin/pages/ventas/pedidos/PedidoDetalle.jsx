import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, User, Calendar, DollarSign, Package, Printer, 
  FileText, ShoppingCart, MapPin, Phone, Mail, Clock, CheckCircle,
  Hash, CreditCard, Info, AlertCircle, Box, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getPedidoById } from "../../services/pedidosService";
import { configUi } from "../../configuracion/configUi";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
  
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVenta = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPedidoById(id);
      setVenta(data);
    } catch (err) {
      console.error("Error fetching venta:", err);
      setError("No se ha podido sincronizar la información del pedido.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchVenta();
  }, [id, fetchVenta]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#16315f]/20 border-t-[#16315f] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm tracking-widest animate-pulse">SINCRONIZANDO ORDEN...</p>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 shadow-xl border border-rose-100">
           <AlertCircle size={40} />
        </div>
        <h3 className="text-2xl font-extrabold text-[#16315f] mb-2">{error || "Pedido no localizado"}</h3>
        <p className="text-slate-500 max-w-md mb-8 italic">Es posible que la orden haya sido eliminada o el ID sea incorrecto en nuestro sistema.</p>
        <button
          onClick={() => navigate(`${basePath}/pedidos`)}
          className={configUi.primaryButton}
        >
          <ArrowLeft size={18} />
          <span>Volver al Inventario</span>
        </button>
      </div>
    );
  }

  const getStatusInfo = (estado) => {
    switch (estado) {
      case "Entregada": return { color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "ENTREGADO" };
      case "Pendiente": return { color: "bg-amber-50 text-amber-700 border-amber-100", label: "PENDIENTE" };
      case "Procesada": return { color: "bg-indigo-50 text-indigo-700 border-indigo-100", label: "PROCESADO" };
      case "Cancelada": return { color: "bg-rose-50 text-rose-700 border-rose-100", label: "CANCELADO" };
      default: return { color: "bg-slate-50 text-slate-700 border-slate-100", label: "DESCONOCIDO" };
    }
  };

  const statusInfo = getStatusInfo(venta.estado);

  return (
    <div className={cn(configUi.pageShell, "pb-20")}>
      {/* 1. HEADER - NAVIGATION & ACTIONS */}
      <div className={cn(configUi.headerRow, "mb-10")}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`${basePath}/pedidos`)}
            className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-[#16315f] hover:border-[#16315f]/20 hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <h2 className={cn(configUi.title, "text-3xl")} style={{ fontFamily: '"Outfit", sans-serif' }}>
                 Orden de Compra
               </h2>
               <span className="text-xl font-mono font-extrabold text-slate-300">#{venta.id_venta}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm text-xs text-slate-500 font-bold">
                  <Calendar size={14} className="text-indigo-400" />
                  {new Date(venta.fecha_venta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm text-xs text-slate-500 font-bold">
                  <Clock size={14} className="text-indigo-400" />
                  {new Date(venta.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => window.print()} className={cn(configUi.secondaryButton, "h-12 px-6")}>
              <Printer size={18} />
              <span className="hidden sm:inline">Imprimir Recibo</span>
           </button>
           <div className={cn(configUi.pill, statusInfo.color, "px-6 py-3 border font-extrabold tracking-[0.1em] shadow-lg")}>
              {statusInfo.label}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 2. MAIN COLUMN - ORDER ITEMS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden ring-1 ring-slate-100/50">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-extrabold text-[#16315f] flex items-center gap-3">
                <Box size={24} className="text-indigo-500" />
                Artículos Solicitados
              </h3>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Volumen</span>
                <span className="text-lg font-extrabold text-[#16315f] leading-none">
                  {venta.items?.length || 0} items
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white">
                    <th className="px-10 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50">Producto & Referencia</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50">Variante Escogida</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Cant.</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Precio Unit.</th>
                    <th className="px-10 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {venta.items?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/30 transition-colors duration-300">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                           <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                              {item.imagen_producto ? (
                                <img src={item.imagen_producto} alt={item.nombre_producto} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={24} strokeWidth={1} />
                              )}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-extrabold text-[#16315f] tracking-tight">{item.nombre_producto}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ref: {item.id_producto}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1.5">
                           <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: item.codigo_hex || '#e2e8f0' }}></span>
                              <span className="text-xs font-bold text-slate-600">{item.nombre_color || "Único"}</span>
                           </div>
                           <span className="inline-flex w-fit px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                             Talla: {item.nombre_talla || "N/A"}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center font-black text-slate-700 font-mono text-sm leading-none">
                        {item.cantidad}
                      </td>
                      <td className="px-6 py-6 text-right font-bold text-slate-500 text-sm">
                        ${parseFloat(item.precio_unitario).toLocaleString()}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-[#16315f] text-base leading-none tracking-tighter">
                        ${(item.cantidad * item.precio_unitario).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* TOTALS FOOTER */}
              <div className="px-10 py-10 bg-slate-50/30">
                <div className="max-w-[180px] ml-auto space-y-3">
                   <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                      <span className="text-sm font-extrabold">${parseFloat(venta.total).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Envío</span>
                      <span className="text-sm font-extrabold">$0.00</span>
                   </div>
                   <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-black text-[#16315f] uppercase tracking-tighter">Total Final</span>
                      <span className="text-3xl font-black text-[#16315f] tracking-tighter">
                        ${parseFloat(venta.total).toLocaleString()}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIDE COLUMN - CLIENT & PAYMENT */}
        <div className="space-y-10">
          {/* CLIENT CARD */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden ring-1 ring-slate-100/50">
            <div className="absolute top-0 right-0 p-8 text-slate-50">
               <User size={120} strokeWidth={0.5} className="opacity-[0.03] rotate-12" />
            </div>
            
            <h3 className="text-xl font-extrabold text-[#16315f] mb-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                 <User size={20} />
              </div>
              Perfil del Cliente
            </h3>

            <div className="space-y-8 relative z-10">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 pointer-events-none">Nombre de Usuario</label>
                <p className="text-base font-extrabold text-[#16315f] tracking-tight">{venta.nombre_cliente || "Ciente No Registrado"}</p>
              </div>
              
              <div className="flex items-center gap-5">
                 <div className="flex flex-col flex-1">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 pointer-events-none">Identificación</label>
                    <p className="text-sm font-bold text-slate-600 font-mono">{venta.documento || "CC —"}</p>
                 </div>
                 <div className="flex flex-col flex-1">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 pointer-events-none">Teléfono</label>
                    <p className="text-sm font-bold text-slate-600">{venta.telefono || "N/A"}</p>
                 </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 pointer-events-none">Correo Electrónico</label>
                <p className="text-sm font-bold text-slate-600">{venta.email || "Sin correo asociado"}</p>
              </div>

              <div className="flex flex-col pt-6 border-t border-slate-50">
                <label className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2 inline-flex items-center gap-1.5 focus:outline-none">
                  <MapPin size={10} strokeWidth={3} /> Punto de Entrega
                </label>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-xs font-extrabold text-slate-500 leading-relaxed italic italic">"{venta.direccion_envio || "Dirección no especificada"}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div className="bg-[#16315f] rounded-[2.5rem] p-10 text-white shadow-[#16315f]/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
               <CreditCard size={200} strokeWidth={0.5} />
            </div>
            
            <h3 className="text-xl font-extrabold mb-8 flex items-center gap-3">
               <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 backdrop-blur-md shadow-inner">
                  <DollarSign size={20} />
               </div>
               Transacción
            </h3>

            <div className="space-y-6 relative z-10">
               <div className="flex justify-between items-center text-white/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Método Usado</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">{venta.metodo_pago || "Efectivo"}</span>
               </div>
               
               <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Estado Pago</span>
                     <span className="text-sm font-black flex items-center gap-2 mt-1">
                        <CheckCircle size={14} className="text-emerald-400" />
                        PAGO REALIZADO
                     </span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Cifra Liquidada</span>
                     <span className="text-2xl font-black tracking-tighter mt-1">${parseFloat(venta.total).toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-8 text-slate-400">
             <Info size={16} />
             <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed italic italic">Esta visualización es un resumen digital. Para efectos legales use la factura impresa.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
