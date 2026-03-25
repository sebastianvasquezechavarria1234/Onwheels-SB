import React, { useEffect, useState } from "react";
import { StudentLayout } from "../../../landing/student/layout/StudentLayout";
import { Eye, Shirt, ShoppingBag, Package, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../../../services/api";

export const MyPurchases = () => {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                // Same implementation as UsersMyPurchases
                const { data } = await api.get("/ventas/mis-compras");
                setCompras(data);
            } catch (error) {
                console.error("Error fetching purchases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const openView = (c) => {
        setSelected({ ...c });
        setModalOpen(true);
    };
    const closeModal = () => {
        setSelected(null);
        setModalOpen(false);
    };

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
                <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[100px]">
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
                            <h3 className="text-2xl font-black mb-3">No tienes compras aún</h3>
                            <p className="text-[#9CA3AF] mb-8 max-w-md">¡Explora nuestra tienda y descubre los mejores productos para ti!</p>
                            <Link
                                to="/student/store"
                                className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
                            >
                                Ver Productos
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {compras.map((c) => (
                                <article
                                    key={c.id_venta}
                                    className="bg-[#121821] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-700 hover:shadow-xl transition-all cursor-pointer group"
                                    onClick={() => openView(c)}
                                >
                                    <div className="flex items-center gap-6 md:w-1/3">
                                        <div className="w-16 h-16 bg-[#0B0F14] rounded-xl flex items-center justify-center border border-gray-800 flex-shrink-0 group-hover:border-[#3b82f6]/50 transition-colors">
                                            <Package size={28} className="text-[#3b82f6]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mb-1">Orden #{compras.length - compras.indexOf(c)}</p>
                                            <div className="flex items-center gap-2 text-white font-medium">
                                                <span className="text-sm font-bold truncate max-w-[150px]">
                                                    {c.detalles && c.detalles.length > 0
                                                        ? c.detalles.map(d => d.producto_nombre).join(", ")
                                                        : "Múltiples productos"}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#9CA3AF] font-medium mt-1">{formatDate(c.fecha)}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-center md:w-1/4">
                                        <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mb-1">Total</p>
                                        <p className="text-xl font-black text-emerald-400">${parseInt(c.total).toLocaleString()}</p>
                                    </div>

                                    <div className="flex flex-col md:items-center md:w-1/4">
                                        <p className="text-[10px] text-[#9CA3AF] font-bold tracking-wider mb-2">Estado</p>
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider border
                                            ${c.estado === "Pagado" || c.estado === "Entregada"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {c.estado}
                                        </span>
                                    </div>

                                    <div className="flex justify-end md:w-20">
                                        <div className="w-10 h-10 rounded-full bg-[#0B0F14] border border-gray-800 flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:border-[#1E3A8A] transition-all shadow-inner">
                                            <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {modalOpen && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                                        Detalle del Pedido
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-widest">Estado</p>
                                        <p className={`font-black uppercase tracking-wider ${selected.estado === 'Pagado' || selected.estado === 'Entregada' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                            {selected.estado}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 text-sm">
                                    <div>
                                        <p className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-1">Fecha</p>
                                        <p className="font-semibold text-white">{formatDate(selected.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-1">Referencia / Orden</p>
                                        <p className="font-semibold text-white">Pedido #{compras.length - compras.indexOf(selected)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-1">Método de Pago</p>
                                        <p className="font-semibold text-white">{selected.metodo_pago || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-1">Total Pagado</p>
                                        <p className="font-black text-lg text-emerald-400">${parseInt(selected.total).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-3 pb-2 border-b border-gray-800">Productos</h4>
                                    <div className="flex flex-col gap-3">
                                        {selected.detalles && selected.detalles.length > 0 ? (
                                            selected.detalles.map((d, index) => (
                                                <div key={index} className="flex justify-between items-center bg-[#0B0F14] p-3 rounded-lg border border-gray-800">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-white">{d.producto_nombre || 'Producto'}</p>
                                                        {d.talla && <p className="text-xs text-[#9CA3AF] mt-0.5 font-medium">Talla: {d.talla}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-[#9CA3AF] text-xs font-bold text-center w-20 bg-[#121821] py-1.5 px-2 rounded-md border border-gray-800">
                                                            {d.cantidad} ud.
                                                        </p>
                                                        <p className="font-bold text-white w-24 text-right">
                                                            ${parseInt(d.precio_unitario || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[#9CA3AF] text-sm italic">Ocurrió un error leyendo los productos.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-800">
                                    <button
                                        className="bg-[#1E3A8A] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/10 active:scale-95"
                                        onClick={closeModal}
                                    >
                                        Cerrar Detalle
                                    </button>
                                </div>
                            </div>
                        </ModalWrapper>
                    )}
                </AnimatePresence>
            </section>
        </StudentLayout>
    );
};

const ModalWrapper = ({ children, onClose }) => {
    return (
        <motion.div
            className="modal fixed w-full h-screen top-0 left-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                className="relative z-10 bg-[#121821] rounded-[2.5rem] w-[95%] max-w-[680px] shadow-2xl overflow-hidden border border-gray-800"
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default MyPurchases;
