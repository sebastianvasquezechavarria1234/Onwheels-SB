import React, { useEffect, useState } from "react";
import { Layout } from "../../student/layout/layout";
import { Eye, Shirt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";



const initialPurchases = [
    {
        id: 1,
        fecha: "21/07/2025",
        codigo: "KS-10234",
        producto: "Camisa Skate",
        categoria: "Camisa",
        cantidad: 1,
        precio: 100000,
        estado: "Entregado",
    },
    {
        id: 2,
        fecha: "22/07/2025",
        codigo: "KS-10235",
        producto: "Pantalón Cargo",
        categoria: "Pantalón",
        cantidad: 2,
        precio: 180000,
        estado: "Pendiente",
    },
];

export const MyPurchases = () => {
    const [compras, setCompras] = useState(initialPurchases);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

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

    return (
        <Layout>
            <section className="relative w-full bg-[var(--gray-bg-body)] side_bar">
                 <div className="flex justify-between items-center">
                    <h2 className="font-primary sticky top-0 bg-[var(--gray-bg-body)] p-[30px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-secundaria">
                        Mis compras
                    </h2>

                    <BtnLinkIcon title="Ir a la tienda" link="../student/store" style="bg-[var(--color-blue)]! text-white pr-[25px] m-[30px] max-md:pr-[15px]" styleIcon="bg-white!">
                        <Shirt className="text-[var(--color-blue)]" strokeWidth={1.5} size={20}/>
                    </BtnLinkIcon>

                 </div>

                <div className="p-[30px]">
                    {/* Encabezados */}
                    <article className="font-semibold italic mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
                        <p className="w-[20%]">Fecha:</p>
                        <p className="w-[15%]">Producto</p>
                        <p className="w-[10%]">Categoría:</p>
                        <p className="w-[15%]">Cantidad</p>
                        <p className="w-[20%]">Precio</p>
                        <p className="w-[15%]">Estado</p>
                        <p className="w-[15%]">Acciones</p>
                    </article>

                    {/* Lista de Compras */}
                    {compras.map((c) => (
                        <article
                            key={c.id}
                            className="py-[18px] border-b border-black/20 flex items-center"
                        >
                            {/* Avatar */}
                            <div className="w-[20%] flex gap-[15px] items-center">
                                <span className="w-[55px] h-[55px] rounded-full flex justify-center items-center overflow-hidden">
                                    <img
                                        className="w-full h-full"
                                        src="https://i.pinimg.com/originals/48/b2/48/48b2481ad12e90b731516e9403ad21f7.jpg"
                                        alt=""
                                    />
                                </span>
                                <div className="flex flex-col">
                                    <h4 className="font-primary text-black/80 italic">{c.fecha}</h4>
                                    <p>{c.codigo}</p>
                                </div>
                            </div>

                            <p className="w-[15%] line-clamp-1">{c.producto}</p>
                            <p className="w-[10%] line-clamp-1">{c.categoria}</p>
                            <p className="w-[15%] line-clamp-1">X {c.cantidad}</p>
                            <p className="w-[20%]">${c.precio.toLocaleString()}</p>

                            <p className="w-[15%]">
                                {c.estado === "Entregado" ? (
                                    <span className="inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-green-100 text-green-700">
                                        <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                                        {c.estado}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-red-100 text-red-700">
                                        <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                                        {c.estado}
                                    </span>
                                )}
                            </p>

                            {/* Solo acción Ver */}
                            <div className="w-[15%] flex">
                                <motion.span
                                    className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => openView(c)}
                                >
                                    <Eye size={22} strokeWidth={1.3} />
                                </motion.span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Modal animado */}
                <AnimatePresence>
                    {modalOpen && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[50px]">
                                Detalles de la compra
                            </h3>

                            <div className="grid grid-cols-2">
                                <div className="flex flex-col gap-[10px] font-medium">
                                    <p>Fecha:</p>
                                    <p>Código:</p>
                                    <p>Producto:</p>
                                    <p>Categoría:</p>
                                    <p>Cantidad:</p>
                                    <p>Precio:</p>
                                    <p>Estado:</p>
                                </div>
                                <div className="flex flex-col gap-[10px] text-gray-700">
                                    <p>{selected.fecha}</p>
                                    <p>{selected.codigo}</p>
                                    <p>{selected.producto}</p>
                                    <p>{selected.categoria}</p>
                                    <p>{selected.cantidad}</p>
                                    <p>${selected.precio.toLocaleString()}</p>
                                    <p>{selected.estado}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-[10px] mt-[30px]">
                                <button className="btn bg-gray-200" onClick={closeModal}>
                                    Cerrar
                                </button>
                            </div>
                        </ModalWrapper>
                    )}
                </AnimatePresence>
            </section>
        </Layout>
    );
};

/*  Modal wrapper  === */
const ModalWrapper = ({ children, onClose }) => {
    return (
        <motion.div
            className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            {/* overla */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default MyPurchases;
