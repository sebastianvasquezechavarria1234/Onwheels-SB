import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, User, Calendar, DollarSign, Package,
    Clock, Hash, MapPin, Phone, Mail, AlertTriangle,
    ChevronRight, Info, CheckCircle, CreditCard, Printer,
    Truck, Briefcase, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getCompraById } from "../../services/comprasService";
import { cn, configUi } from "../../configuracion/configUi";

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
                setError("No se pudo recuperar la información de este registro de compra.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCompra();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black tracking-widest text-[#16315f] uppercase">Sincronizando Orden de Compra...</p>
            </div>
        );
    }

    if (error || !compra) {
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
                    onClick={() => navigate(`${basePath}/compras`)}
                    className={cn(configUi.primaryButton, "h-11 px-8")}
                >
                    <ArrowLeft size={20} />
                    Regresar al Historial
                </button>
            </div>
        );
    }

    return (
        <div className={configUi.pageShell}>
            {/* Header Row */}
            <div className={configUi.headerRow + " mb-8"}>
                <div className={configUi.titleWrap}>
                    <button
                        onClick={() => navigate(`${basePath}/compras`)}
                        className={configUi.iconButton + " w-10 h-10 rounded-xl"}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={cn(configUi.title, "text-lg")}>Detalle de Compra</h1>
                            <span className={cn(configUi.successPill, "text-[9px] uppercase tracking-widest")}>
                                Liquidada
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                            ORDEN: <span className="text-indigo-400 font-black">#ORD-{String(compra.id_compra).padStart(6, '0')}</span> &bull;
                            <Calendar size={12} className="opacity-40" /> {new Date(compra.fecha_compra).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className={configUi.toolbar}>
                    <button onClick={() => window.print()} className={configUi.secondaryButton + " gap-2"}>
                        <Printer size={18} />
                        Imprimir Registro
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-y-auto pr-2 custom-scrollbar min-h-0">

                {/* Left: Items List */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    <div className={configUi.tableCard}>
                        <div className="px-6 py-4 border-b border-[#d7e5f8] flex justify-between items-center bg-[#fbfdff]/50">
                            <h3 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                                <Package size={14} className="text-indigo-500" /> Mercancía Ingresada
                            </h3>
                            <span className={configUi.subtlePill}>{compra.items?.length || 0} ÍTEMS</span>
                        </div>

                        <div className={configUi.tableScroll}>
                            <table className={configUi.table}>
                                <thead className={configUi.thead}>
                                    <tr>
                                        <th className={configUi.th}>Producto / Variante</th>
                                        <th className={configUi.th + " text-center"}>Cantidad</th>
                                        <th className={configUi.th + " text-right"}>Unitario</th>
                                        <th className={configUi.th + " text-right"}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#d7e5f8]">
                                    {compra.items?.map((it, idx) => (
                                        <tr key={idx} className={configUi.row}>
                                            <td className={configUi.td}>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                        {it.imagen || it.url_imagen ? (
                                                            <img src={it.imagen || it.url_imagen} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Package size={18} className="text-slate-200" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold uppercase tracking-tight text-[#16315f]">{it.nombre_producto}</span>
                                                        <span className="text-[10px] text-indigo-400 font-black uppercase mt-0.5">
                                                            {it.nombre_variante || `${it.nombre_color || 'Unico'} / ${it.nombre_talla || 'Unica'}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={configUi.td + " text-center"}>
                                                <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-xs font-black text-[#16315f]">
                                                    x{it.cantidad}
                                                </span>
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
                                <p className={configUi.modalEyebrow}>Impacto en Inventario</p>
                                <div className="h-1 w-16 bg-indigo-500 rounded-full mt-1"></div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión Total de Compra</p>
                                <p className="text-4xl font-black text-[#16315f] tracking-tighter">${Number(compra.total_compra).toLocaleString('es-CO')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Supplier & Totals */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Supplier Info */}
                    <div className={cn(configUi.formSection, "p-8 space-y-8")}>
                        <h3 className={configUi.modalEyebrow + " flex items-center gap-2"}>
                            <Truck size={16} className="text-indigo-500" /> Datos del Proveedor
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Empresa / Razón Social</p>
                                <p className="text-lg font-black text-[#16315f] leading-tight uppercase tracking-tight">{compra.nombre_empresa || compra.nombre_proveedor || "Desconocido"}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={configUi.subtlePill}>NIT: {compra.nit_proveedor || "—"}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#d7e5f8]">
                                <div className="flex items-center gap-4">
                                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                        <Mail size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Correo Electrónico</span>
                                        <span className="text-xs font-bold text-[#16315f]">{compra.email || "No registrado"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                        <Phone size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Teléfono de Contacto</span>
                                        <span className="text-xs font-bold text-[#16315f]">{compra.telefono || "No disponible"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Balance */}
                    <div className="bg-[#16315f] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Briefcase size={100} />
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <FileText size={16} /> Resumen de Operación
                        </h3>

                        <div className="space-y-8">
                            <div className="flex justify-between items-center py-4 border-b border-white/10">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fiscalización</span>
                                <span className="text-xs font-black uppercase bg-white/10 px-4 py-1.5 rounded-xl border border-white/5">Completada</span>
                            </div>

                            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center space-y-2">
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Monto Desembolsado</p>
                                <p className="text-3xl font-black tracking-tighter">${Number(compra.total_compra).toLocaleString('es-CO')}</p>
                                <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-white/30 uppercase mt-2">
                                    <CheckCircle size={10} className="text-emerald-400" /> Fondo de Inventario
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
