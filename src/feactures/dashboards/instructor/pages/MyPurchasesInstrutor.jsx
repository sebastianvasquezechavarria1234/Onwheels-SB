import React, { useEffect, useState } from "react";
import { InstructorLayout } from "../../../landing/instructor/layout/InstructorLayout";
import { Eye, Shirt, ShoppingBag, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../../../services/api";

export const MyPurchasesInstrutor = () => {
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
            <InstructorLayout>
                <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
                </div>
            </InstructorLayout>
        );
    }

    return (
        <InstructorLayout>
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
                            to="/instructor/store"
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
                                to="/instructor/store"
                                className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
                            >
                                Ver Productos
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-[#121821] border border-gray-800 rounded-[2rem] overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-[#0B0F14]">
                                            <th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Fecha</th>
                                            <th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Producto</th>
                                            <th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Cantidad</th>
                                            <th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Total</th>
                                            <th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Estado</th>
                                            <th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF] text-right">Detalle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {compras.map((c) => (
                                            <tr key={c.id_venta} className="hover:bg-[#0B0F14]/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <span className="font-semibold">{formatDate(c.fecha)}</span>
                                                </td>
                                                <td className="py-4 px-6 max-w-[200px]">
                                                    <span className="block truncate font-medium text-white group-hover:text-[#3b82f6] transition-colors">
                                                        {c.detalles && c.detalles.length > 0
                                                            ? c.detalles.map(d => d.producto_nombre).join(", ")
                                                            : "Múltiples productos"}
                                                    </span>
                                                    <span className="text-xs text-[#9CA3AF] block mt-1">
                                                        Ref: {c.transaccion_id || `VTA-${c.id_venta}`}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="bg-[#0B0F14] inline-flex items-center px-3 py-1 rounded-lg border border-gray-800 text-sm font-medium">
                                                        {c.detalles ? c.detalles.reduce((acc, d) => acc + d.cantidad, 0) : 1} uds.
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-emerald-400">
                                                        ${parseInt(c.total).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {c.estado === "Pagado" || c.estado === "Entregada" ? (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                            {c.estado}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                                            {c.estado}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => openView(c)}
                                                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#0B0F14] border border-gray-800 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 text-[#9CA3AF] hover:text-[#3b82f6] transition-all"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {modalOpen && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                                        Detalle del Pedido
                                    </h3>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Estado</p>
                                        <p className={`font-black uppercase tracking-wider ${selected.estado === 'Pagado' || selected.estado === 'Entregada' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                            {selected.estado}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 text-sm">
                                    <div>
                                        <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Fecha</p>
                                        <p className="font-semibold text-gray-900">{formatDate(selected.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Referencia / ID</p>
                                        <p className="font-semibold text-gray-900">{selected.transaccion_id || `VTA-${selected.id_venta}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Método de Pago</p>
                                        <p className="font-semibold text-gray-900">{selected.metodo_pago || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Total Pagado</p>
                                        <p className="font-black text-lg text-emerald-600">${parseInt(selected.total).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-3 pb-2 border-b border-gray-100">Productos</h4>
                                    <div className="flex flex-col gap-3">
                                        {selected.detalles && selected.detalles.length > 0 ? (
                                            selected.detalles.map((d, index) => (
                                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900">{d.producto_nombre || 'Producto'}</p>
                                                        {d.talla && <p className="text-xs text-gray-500 mt-0.5">Talla: {d.talla}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <p className="text-gray-600 text-sm font-semibold text-center w-16 bg-white py-1 px-2 rounded-md shadow-sm border border-gray-200">
                                                            {d.cantidad} ud.
                                                        </p>
                                                        <p className="font-bold text-gray-900 w-24 text-right">
                                                            ${parseInt(d.precio_unitario || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">Ocurrió un error leyendo los productos.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-100">
                                    <button
                                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
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
        </InstructorLayout>
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
                className="relative z-10 bg-white rounded-3xl w-[90%] max-w-[640px] shadow-2xl overflow-hidden"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default MyPurchasesInstrutor;
