import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, User, Calendar, DollarSign, Package, Printer,
  FileText, ShoppingCart, MapPin, Phone, Mail, Clock, CheckCircle,
  Hash, CreditCard, Info, AlertCircle, Box, Star, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getPedidoById } from "../../services/pedidosService";
import { cn, configUi } from "../../configuracion/configUi";

export default function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPedido = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPedidoById(id);
      setPedido(data);
    } catch (err) {
      console.error("Error fetching pedido:", err);
      setError("No se ha podido sincronizar la información digital de la orden.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchPedido();
  }, [id, fetchPedido]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-vh-80 gap-6">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-[#16315f] uppercase tracking-widest animate-pulse">Sincronizando Orden...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="flex flex-col items-center justify-center min-vh-80 p-10 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-xl">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-2xl font-black text-[#16315f] mb-3 uppercase tracking-tight">{error || "Orden no localizada"}</h3>
        <p className="text-[#6b84aa] text-sm max-w-sm mb-10 italic">Verifique que el ID de la transacción sea correcto en el sistema administrativo.</p>
        <button
          onClick={() => navigate(`${basePath}/pedidos`)}
          className={configUi.primaryButton}
        >
          <ArrowLeft size={18} />
          Volver al Historial
        </button>
      </div>
    );
  }

  const getStatusConfig = (estado) => {
    switch (estado) {
      case "Entregada": return { color: configUi.successPill, label: "FINALIZADO" };
      case "Procesada": return { color: configUi.subtlePill, label: "EN PROCESO" };
      case "Cancelada": return { color: configUi.dangerPill, label: "RECHAZADA" };
      default: return { color: "bg-amber-50 text-amber-700 border-amber-100 rounded-full px-4 py-1.5 text-xs font-black tracking-widest border", label: "SOLICITUD PENDIENTE" };
    }
  };

  const status = getStatusConfig(pedido.estado);

  return (
    <div className={cn(configUi.pageShell, "pb-24 overflow-y-auto")}>
      {/* Header Row */}
      <div className={configUi.headerRow + " mb-10"}>
        <div className={configUi.titleWrap}>
          <button
            onClick={() => navigate(`${basePath}/pedidos`)}
            className={configUi.iconButton + " w-12 h-12 rounded-2xl"}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className={configUi.title}>Comprobante de Orden</h1>
              <span className="text-xl font-mono font-black text-slate-300">#ORD-{String(pedido.id_venta).padStart(4, '0')}</span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-black text-[#6b84aa] uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-400" />
                {new Date(pedido.fecha_venta).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="text-[10px] font-black text-[#6b84aa] uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-400" />
                {new Date(pedido.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <div className={configUi.toolbar}>
          <button onClick={() => window.print()} className={configUi.secondaryButton}>
            <Printer size={18} />
            Recibo PDF
          </button>
          <div className={cn(status.color, "min-w-[140px] justify-center h-12 shadow-sm border")}>
            {status.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Line Items */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-[#d7e5f8] overflow-hidden">
            <div className="px-10 py-6 border-b border-[#d7e5f8] flex justify-between items-center bg-[#fbfdff]">
              <h3 className="text-sm font-black text-[#16315f] uppercase tracking-[0.2em] flex items-center gap-3">
                <Box size={20} className="text-indigo-500" />
                Artículos Despachados
              </h3>
              <span className={configUi.countBadge}>{pedido.items?.length || 0} ITEMS</span>
            </div>

            <div className="min-w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#fbfdff]/50">
                  <tr>
                    <th className="px-10 py-5 text-[10px] font-black text-[#6b84aa] uppercase tracking-[0.2em] border-b border-[#d7e5f8]">Referencia</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#6b84aa] uppercase tracking-[0.2em] border-b border-[#d7e5f8]">Variante</th>
                    <th className="px-6 py-5 text-[10px] font-black text-[#6b84aa] uppercase tracking-[0.2em] border-b border-[#d7e5f8] text-center">Cant.</th>
                    <th className="px-10 py-5 text-[10px] font-black text-[#6b84aa] uppercase tracking-[0.2em] border-b border-[#d7e5f8] text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d7e5f8]">
                  {pedido.items?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-[#fbfdff] transition-colors duration-200">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#16315f] uppercase tracking-tight">{item.nombre_producto}</span>
                          <span className="text-[9px] text-indigo-400 font-bold">UID: {item.id_producto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#16315f]">{item.nombre_color || "Único"}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Talla {item.nombre_talla || "Unica"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center font-black text-[#16315f] tabular-nums text-sm bg-slate-50/30">
                        {item.cantidad}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-[#16315f] text-base tracking-tighter tabular-nums">
                        ${(item.cantidad * item.precio_unitario).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-10 py-12 bg-[#fbfdff] border-t border-[#d7e5f8]">
                <div className="max-w-[240px] ml-auto space-y-4">
                  <div className="flex justify-between items-center text-[#6b84aa]">
                    <span className="text-[10px] font-black uppercase tracking-widest">Base Liquidada</span>
                    <span className="text-sm font-bold tabular-nums">${Number(pedido.total).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-500">
                    <span className="text-[10px] font-black uppercase tracking-widest">Descuentos</span>
                    <span className="text-sm font-black italic">$0.00</span>
                  </div>
                  <div className="pt-6 border-t-2 border-[#16315f]/10 flex justify-between items-center text-[#16315f]">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Importe Final</span>
                    <span className="text-4xl font-black tracking-tighter tabular-nums">
                      ${Number(pedido.total).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4 text-amber-800">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
              <Info size={20} />
            </div>
            <p className="text-xs font-bold italic leading-relaxed">Nota: Los precios incluyen impuestos aplicables según la normativa vigente de OnWheels.</p>
          </div>
        </div>

        {/* Right Column: Entity Context */}
        <div className="lg:col-span-4 space-y-8">
          {/* Client Entity Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-[#d7e5f8] shadow-2xl relative overflow-hidden ring-1 ring-[#d7e5f8]/50">
            <div className="absolute top-0 right-0 p-10 text-indigo-50 rotate-12 -z-10 opacity-5">
              <User size={140} strokeWidth={1} />
            </div>

            <h3 className={configUi.modalEyebrow + " mb-8"}>Ficha del Solicitante</h3>

            <div className="space-y-8 relative">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-2 select-none">Nombre Registrado</p>
                <p className="text-lg font-black text-[#16315f] tracking-tight truncate leading-none uppercase">{pedido.nombre_cliente || "USUARIO GENERAL"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-2 select-none">ID Documento</p>
                  <p className="text-sm font-bold text-slate-500 font-mono italic leading-none">{pedido.documento || "CC —"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-2 select-none">Teléfono</p>
                  <p className="text-sm font-bold text-slate-500 leading-none">{pedido.telefono || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3 pt-8 border-t border-slate-50">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} strokeWidth={3} /> Logística de Despacho
                </p>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-black text-slate-400 italic leading-relaxed uppercase">"{pedido.direccion_envio || "Punto de recogida no definido"}"</p>
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
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">{pedido.metodo_pago || "Efectivo"}</span>
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
                  <span className="text-2xl font-black tracking-tighter mt-1">${parseFloat(pedido.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ANULACIÓN INFO (SOLO SI CANCELADA) */}
          {(pedido.estado === "Cancelada") && (
            <div className="bg-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <h3 className="text-lg font-extrabold mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                  <AlertCircle size={20} />
                </div>
                Registro de Anulación
              </h3>
              <div className="space-y-4">
                <label className="text-[9px] font-black text-white/50 uppercase tracking-widest block">Dictamen de Cancelación:</label>
                <div className="p-6 bg-black/10 rounded-3xl border border-white/5 italic text-sm font-medium leading-relaxed">
                  "{pedido.motivo_cancelacion || "Se procedió con la anulación del pedido por solicitud administrativa."}"
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
