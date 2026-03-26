import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentLayout } from "../../../landing/student/layout/StudentLayout";
import {
    Package,
    ChevronLeft,
    Calendar,
    CreditCard,
    Truck,
    ShoppingBag,
    MapPin,
    FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { getVentaById } from "../../../dashboards/admin/pages/services/ventasService";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const StudentPurchaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getVentaById(id);
                setPurchase(data);
            } catch (err) {
                console.error("Error fetching purchase detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date);
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </StudentLayout>
        );
    }

    if (!purchase) {
        return (
            <StudentLayout>
                <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-4 pt-24 text-white">
                    <FileText size={64} className="text-gray-700 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Pedido no encontrado</h2>
                    <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">Volver atrás</button>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="bg-[#0B0F14] min-h-screen text-white font-primary pb-24">
                <div className="max-w-[1200px] mx-auto px-4 pt-[160px]">
                    {/* Header con botón volver */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase">Volver a mis compras</span>
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Status Card Principal */}
                        <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-[#1E3A8A]/20 p-2 rounded-xl text-[#3b82f6]">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                                            Detalle de Pedido <span className="text-[#3b82f6]">#{purchase.id_venta}</span>
                                        </h1>
                                    </div>
                                    <p className="text-[#9CA3AF] text-sm font-medium">Realizado el {formatDate(purchase.fecha_venta)}</p>
                                </div>

                                <div className={cn(
                                    "px-6 py-3 rounded-2xl border text-[10px] font-black tracking-[0.2em] uppercase shadow-lg",
                                    purchase.estado === "Entregada" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    purchase.estado === "Pendiente" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {purchase.estado}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Productos (2/3 col) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-[#121821] border border-gray-800 rounded-[2rem] overflow-hidden shadow-xl">
                                    <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                                        <h3 className="font-black tracking-widest text-[10px] uppercase text-[#9CA3AF]">Artículos ({purchase.items?.length || 0})</h3>
                                    </div>
                                    <div className="p-4 space-y-1">
                                        {purchase.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-colors border-b border-gray-800/50 last:border-0">
                                                <div className="h-16 w-16 bg-[#0B0F14] rounded-xl overflow-hidden border border-gray-800 shrink-0">
                                                    {item.imagen ? (
                                                        <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                            <Package size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-bold text-sm text-white truncate">{item.nombre_producto}</h4>
                                                    <div className="flex gap-3 mt-1">
                                                        {item.nombre_talla && <span className="text-[10px] font-black tracking-widest text-[#9CA3AF] uppercase">{item.nombre_talla}</span>}
                                                        {item.nombre_color && <span className="text-[10px] font-black tracking-widest text-[#9CA3AF] uppercase">{item.nombre_color}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-white">${Number(item.precio_unitario).toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase">Cantidad: {item.cantidad}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-8 py-6 bg-gray-900/30 border-t border-gray-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black uppercase text-[#9CA3AF] tracking-[0.2em]">Total del pedido</span>
                                            <span className="text-2xl font-black text-emerald-400">${Number(purchase.total).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info (1/3 col) */}
                            <div className="space-y-6">
                                <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full" />
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
                                            <CreditCard size={24} />
                                        </div>
                                        <h3 className="font-black tracking-widest text-[10px] uppercase text-white">Método de Pago</h3>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <div className="bg-[#0B0F14] border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-[#9CA3AF]">Vía</span>
                                            <span className="text-sm font-black text-white">{purchase.metodo_pago}</span>
                                        </div>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-emerald-500/70">Monto Final</span>
                                            <span className="text-sm font-black text-emerald-400">${Number(purchase.total).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 shadow-xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-400">
                                            <MapPin size={24} />
                                        </div>
                                        <h3 className="font-black tracking-widest text-[10px] uppercase text-white">Dirección de Envío</h3>
                                    </div>
                                    <div className="bg-[#0B0F14] border border-gray-800 p-6 rounded-2xl">
                                        <p className="text-[#9CA3AF] font-medium text-sm leading-relaxed">
                                            {purchase.direccion_envio || "Recoger en sede principal"}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-gray-600">
                                            <Truck size={14} />
                                            <span className="text-[10px] font-black tracking-widest uppercase">Envío terrestre</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentPurchaseDetail;
