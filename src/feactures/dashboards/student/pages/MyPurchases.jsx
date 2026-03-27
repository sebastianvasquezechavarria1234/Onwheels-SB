import React, { useEffect, useState } from "react";
import { StudentLayout } from "../../../landing/student/layout/StudentLayout";
import { Shirt, ShoppingBag, Package, ChevronRight, Calendar } from "lucide-react";
import api from "../../../../services/api";
import { Link, useNavigate } from "react-router-dom";

export const MyPurchases = () => {
    const navigate = useNavigate();
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const { data } = await api.get("/ventas/mis-compras");
                // Ordenar por fecha descendente
                const sorted = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
            <StudentLayout>
                <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[80px] md:pt-[100px]">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-6 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                                <ShoppingBag className="text-[#3b82f6]" size={36} />
                                Mis Compras
                            </h2>
                            <p className="text-[#9CA3AF] mt-2 font-medium">Historial de tus pedidos y estado de envíos</p>
                        </div>

                        <Link
                            to="/student/store"
                            className="flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20 group"
                        >
                            <Shirt size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                            Ir a la Tienda
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
                                to="/student/store"
                                className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all shadow-xl active:scale-95 transition-transform"
                            >
                                Ver Productos
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {compras.map((c, index) => (
                                <article
                                    key={c.id_venta}
                                    className="bg-[#121821] border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:border-[#1E3A8A]/50 hover:shadow-2xl transition-all cursor-pointer group"
                                    onClick={() => navigate(`/student/myPurchases/${c.id_venta}`)}
                                >
                                    {/* Orden + fecha */}
                                    <div className="flex items-center gap-4 md:w-1/3">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#0B0F14] rounded-xl flex items-center justify-center border border-gray-800 flex-shrink-0 group-hover:bg-[#1E3A8A]/10 group-hover:border-[#1E3A8A]/30 transition-colors">
                                            <Package size={24} className="text-[#3b82f6]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mb-1 uppercase">Orden #{compras.length - index}</p>
                                            <div className="flex items-center gap-2 text-white font-bold">
                                                <Calendar size={14} className="text-gray-500" />
                                                <span className="text-sm">{formatDate(c.fecha)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total + Estado en fila en móvil */}
                                    <div className="flex flex-row items-center justify-between md:flex-row md:w-[50%] gap-4 border-t border-gray-800/60 md:border-0 pt-3 md:pt-0">
                                        <div className="flex flex-col md:items-center">
                                            <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mb-1 uppercase">Total</p>
                                            <p className="text-lg md:text-xl font-black text-emerald-400">
                                                <span className="text-xs mr-0.5">$</span>
                                                {parseInt(c.total).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex flex-col md:items-center">
                                            <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mb-2 uppercase">Estado</p>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border
                                                ${c.estado === "Pagado" || c.estado === "Entregada"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                                                {c.estado}
                                            </span>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#0B0F14] border border-gray-800 flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:border-[#1E3A8A] transition-all shadow-lg active:scale-95">
                                                <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </StudentLayout>
    );
};

export default MyPurchases;

