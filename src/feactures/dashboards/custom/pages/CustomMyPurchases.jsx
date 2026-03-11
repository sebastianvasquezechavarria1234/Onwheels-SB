"use client"

import React, { useEffect, useState } from "react";
import { CustomLayout } from "../../../landing/custom/layout/CustomLayout";
import { Eye, Shirt, ShoppingBag, Calendar, Package, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../../../services/api";

export const CustomMyPurchases = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
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

  // cerrar con Escape
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
      <CustomLayout>
        <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3b82f6]"></div>
        </div>
      </CustomLayout>
    );
  }

  return (
    <CustomLayout>
      <section className="min-h-screen bg-[#0B0F14] text-white font-primary pt-[100px] md:pt-10 pb-24 border border-transparent">
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
              <h3 className="text-2xl font-black mb-3">No tienes compras aún</h3>
              <p className="text-[#9CA3AF] mb-8 max-w-md">¡Explora nuestra tienda y descubre los mejores productos para ti!</p>
              <Link
                to="/custom/store"
                className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
              >
                Empezar a comprar
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
                    <div className="w-16 h-16 bg-[#0B0F14] rounded-xl flex items-center justify-center border border-gray-800 flex-shrink-0 group-hover:border-[#1E3A8A]/50 transition-colors">
                      <Package size={28} className="text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Orden #{c.id_venta}</p>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Calendar size={14} className="text-gray-500" />
                        <span>{formatDate(c.fecha_venta)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-center md:w-1/4">
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-1">Total</p>
                    <p className="text-xl font-black text-emerald-400">${Number(c.total).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col md:items-center md:w-1/4">
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mb-2">Estado</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border
                                            ${c.estado === "Entregada" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        c.estado === "Pendiente" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {c.estado}
                    </span>
                  </div>

                  <div className="flex justify-end md:w-20">
                    <div className="w-10 h-10 rounded-full bg-[#0B0F14] border border-gray-800 flex items-center justify-center group-hover:bg-[#1E3A8A] group-hover:border-[#1E3A8A] transition-all">
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        <AnimatePresence>
          {modalOpen && selected && (
            <ModalWrapper onClose={closeModal}>
              <div className="mb-8 border-b border-gray-800 pb-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                  Detalles de la Orden
                </h3>
                <p className="text-[#9CA3AF] font-medium flex items-center gap-2">
                  Orden #{selected.id_venta} • <Calendar size={14} /> {formatDate(selected.fecha_venta)}
                </p>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Artículos</h4>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {selected.items && selected.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-[#0B0F14] p-3 rounded-xl border border-gray-800/50">
                      <div className="w-16 h-16 bg-[#121821] rounded-lg overflow-hidden flex-shrink-0">
                        {item.imagen ? (
                          <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt size={24} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm text-white truncate">{item.nombre_producto}</h5>
                        <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider mt-1">
                          {item.nombre_color} / {item.nombre_talla}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-emerald-400">${Number(item.precio_unitario).toLocaleString()}</p>
                        <p className="text-xs text-[#9CA3AF] font-bold">x{item.cantidad}</p>
                      </div>
                    </div>
                  ))}
                  {(!selected.items || selected.items.length === 0) && (
                    <p className="text-[#9CA3AF] text-sm text-center py-4">No hay detalles de artículos disponibles.</p>
                  )}
                </div>
              </div>

              <div className="bg-[#0B0F14] rounded-xl p-5 border border-gray-800 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-[#9CA3AF] font-bold">Método de pago:</span>
                  <span className="text-sm text-white font-bold">{selected.metodo_pago}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-[#9CA3AF] font-bold">Estado:</span>
                  <span className={`text-xs font-black uppercase px-2 py-1 rounded-md ${selected.estado === "Entregada" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-500"
                    }`}>{selected.estado}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                  <span className="text-base font-black text-white uppercase tracking-wider">Total:</span>
                  <span className="text-2xl font-black text-emerald-400">${Number(selected.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="px-6 py-3 bg-[#0B0F14] border border-gray-700 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            </ModalWrapper>
          )}
        </AnimatePresence>
      </section>
    </CustomLayout>
  );
};

/*  Modal wrapper  */
const ModalWrapper = ({ children, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        className="relative z-10 bg-[#121821] p-6 md:p-8 rounded-[2rem] w-full max-w-lg border border-gray-800 shadow-2xl"
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
