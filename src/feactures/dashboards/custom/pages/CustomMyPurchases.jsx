import React, { useEffect, useState } from "react";
import { CustomLayout } from "../../../landing/custom/layout/CustomLayout";
import { Eye, Shirt, ShoppingBag, Calendar, Package, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../services/api";

export const CustomMyPurchases = () => {
    const navigate = useNavigate();
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const { data } = await api.get("/ventas/mis-compras");
                // Ordenar por fecha_venta descendente (la última debe ir primero)
                const sorted = data.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta));
                setCompras(sorted);
            } catch (error) {
                console.error("Error fetching purchases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

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
            <CustomLayout>
                <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
                </div>
            </CustomLayout>
        );
    }

    return (
        <CustomLayout>
            <section className="min-h-screen bg-[#0B0F14] text-white font-primary pt-24 md:pt-10 pb-24">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-6 pb-6 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                                <ShoppingBag className="text-[#3b82f6]" size={36} />
                                Mis Compras
                            </h2>
                            <p className="text-[#9CA3AF] mt-2 font-medium">Historial de tus pedidos y estado de envíos</p>
                        </div>

                        <Link
                            to="/custom/store"
                            className="flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20 group"
                        >
                            <Shirt size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                            Ir a la tienda
                        </Link>
                    </div>

                    {compras.length === 0 ? (
                        <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-16 text-center shadow-xl flex flex-col items-center">
                            <div className="w-24 h-24 bg-[#0B0F14] rounded-full flex items-center justify-center mb-6 border border-gray-800">
                                <Package size={48} className="text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-white">No tienes compras aún</h3>
                            <p className="text-[#9CA3AF] mb-8 max-w-md font-medium">¡Explora nuestra tienda y descubre los mejores productos para ti!</p>
                            <Link
                                to="/custom/store"
                                className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95 transition-transform"
                            >
                                Empezar a comprar
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {compras.map((c, index) => (
                                <article
                                    key={c.id_venta}
                                    className="bg-[#121821] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1E3A8A]/50 hover:shadow-2xl hover:shadow-[#1E3A8A]/5 transition-all cursor-pointer group"
                                    onClick={() => navigate(`/custom/my-purchases/${c.id_venta}`)}
                                >
                                    <div className="flex items-center gap-6 md:w-1/3">
                                        <div className="w-16 h-16 bg-[#0B0F14] rounded-xl flex items-center justify-center border border-gray-800 flex-shrink-0 group-hover:bg-[#1E3A8A]/10 group-hover:border-[#1E3A8A]/30 transition-all">
                                            <Package size={28} className="text-[#3b82f6]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#9CA3AF] font-black uppercase tracking-[0.2em] mb-1">Orden #{compras.length - index}</p>
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Calendar size={14} className="text-gray-500" />
                                                <span className="text-sm">{formatDate(c.fecha_venta)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-center md:w-1/4">
                                        <p className="text-[10px] text-[#9CA3AF] font-black uppercase tracking-[0.2em] mb-1">Inversión Total</p>
                                        <p className="text-xl font-black text-emerald-400">
                                            <span className="text-xs mr-0.5">$</span>
                                            {Number(c.total).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col md:items-center md:w-1/4">
                                        <p className="text-[10px] text-[#9CA3AF] font-black uppercase tracking-[0.2em] mb-2">Estado Logístico</p>
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                            ${c.estado === "Entregada" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            c.estado === "Pendiente" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                            {c.estado}
                                        </span>
                                    </div>

                                    <div className="flex justify-end md:w-20">
                                        <div className="w-10 h-10 rounded-full bg-[#0B0F14] border border-gray-800 flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:border-[#1E3A8A] group-hover:scale-110 transition-all shadow-lg active:scale-90">
                                            <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </CustomLayout>
    );
};

export default CustomMyPurchases;

