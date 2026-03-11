import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "../layout/AdminLayout";
import {
    Package, ChevronLeft, Calendar, CreditCard,
    Truck, ShoppingBag, MapPin, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../../services/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const AdminPurchaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/ventas/${id}`);
                setPurchase(res.data);
            } catch (err) {
                console.error("Error fetching purchase detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center pt-[100px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!purchase) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-4 pt-[100px]">
                    <FileText size={64} className="text-gray-700 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Pedido no encontrado</h2>
                    <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">Volver atrás</button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-[#0B0F14] min-h-screen text-white font-primary pb-24 pt-[100px]">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    {/* Header con botón volver */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest">Volver a mis compras</span>
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
                                        <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
                                            Pedido <span className="text-blue-500">#{purchase.id_venta}</span>
                                        </h1>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">Realizado el {new Date(purchase.fecha_venta).toLocaleDateString()} a las {new Date(purchase.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                <div className={cn(
                                    "px-6 py-3 rounded-2xl border text-sm font-black tracking-widest shadow-lg",
                                    purchase.estado === "Entregada" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                    purchase.estado === "Pendiente" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                                    purchase.estado === "Procesada" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                    purchase.estado === "Cancelada" && "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                )}>
                                    {purchase.estado}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Productos (2/3 col) */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Productos */}
                                <div className="bg-[#121821] border border-gray-800 rounded-[2rem] overflow-hidden shadow-xl">
                                    <div className="px-8 py-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                                        <h3 className="font-black tracking-widest text-sm text-gray-400">Productos ({purchase.items?.length || 0})</h3>
                                    </div>
                                    <div className="p-2">
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
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-sm text-white line-clamp-1">{item.nombre_producto}</h4>
                                                    <div className="flex gap-3 mt-1">
                                                        {item.nombre_talla && <span className="text-[10px] font-black tracking-widest text-gray-500">Talla: {item.nombre_talla}</span>}
                                                        {item.nombre_color && <span className="text-[10px] font-black tracking-widest text-gray-500">Color: {item.nombre_color}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-white">${Number(item.precio_unitario)?.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 tracking-widest">Cant: {item.cantidad}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-8 py-6 bg-gray-900/30 border-t border-gray-800">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-400 tracking-widest">Total del pedido</span>
                                            <span className="text-2xl font-black text-white">${Number(purchase.total)?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info (1/3 col) — Pago + Dirección */}
                            <div className="space-y-6">
                                {/* Resumen de Pago */}
                                <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full" />

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-500/5">
                                            <CreditCard size={24} />
                                        </div>
                                        <h3 className="font-black tracking-widest text-sm text-white shadow-sm">Método de Pago</h3>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <div className="bg-[#0B0F14] border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500">Método</span>
                                            <span className="text-sm font-black text-white">{purchase.metodo_pago}</span>
                                        </div>
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                                            <span className="text-xs font-bold text-emerald-500/70">Total Pagado</span>
                                            <span className="text-sm font-black text-emerald-400">${Number(purchase.total)?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dirección de Entrega */}
                                <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 shadow-xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-400 shadow-lg shadow-purple-500/5">
                                            <MapPin size={24} />
                                        </div>
                                        <h3 className="font-black tracking-widest text-sm text-white shadow-sm">Dirección de Entrega</h3>
                                    </div>
                                    <div className="bg-[#0B0F14] border border-gray-800 p-6 rounded-2xl">
                                        <p className="text-gray-300 font-medium text-sm leading-relaxed">
                                            {purchase.direccion_envio || "Dirección no especificada"}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-gray-500">
                                            <Truck size={14} />
                                            <span className="text-xs font-bold tracking-wider">Envío Estándar (2-3 días)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPurchaseDetail;
