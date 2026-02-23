import React, { useEffect, useState } from "react";
import { Layout } from "../../instructor/layout/layout";
import { Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const MyClassesInstructor = () => {
    const [clases, setClases] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") closeModal(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        fetchMisClases();
    }, []);

    const fetchMisClases = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const userId = user.id_usuario;

            if (!userId || !token) {
                setError("No se encontró sesión activa.");
                return;
            }

            const res = await fetch(`${API_BASE}/api/clases/instructor/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.mensaje || "Error al obtener clases");
            }

            const data = await res.json();
            setClases(data);
        } catch (err) {
            console.error("Error cargando mis clases:", err);
            setError("No se pudieron cargar las clases. Revisa la API / CORS.");
        } finally {
            setLoading(false);
        }
    };

    const openView = (c) => { setSelected({ ...c }); setModalOpen(true); };
    const closeModal = () => { setSelected(null); setModalOpen(false); };

    return (
        <Layout>
            <section className="relative w-full bg-[var(--gray-bg-body)] side_bar">
                <h2 className="font-primary sticky top-0 bg-[var(--gray-bg-body)] p-[30px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-secundaria">
                    Mis clases
                </h2>

                <div className="p-[30px]">
                    <article className="font-semibold italic mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
                        <p className="w-[15%]">Sede</p>
                        <p className="w-[10%]">Día</p>
                        <p className="w-[20%]">Hora</p>
                        <p className="w-[20%]">Cupo máximo</p>
                        <p className="w-[15%]">Nivel</p>
                        <p className="w-[20%]">Acciones</p>
                    </article>

                    {loading ? (
                        <p className="text-center py-10 text-gray-400 italic">Cargando clases...</p>
                    ) : error ? (
                        <p className="text-center py-10 text-red-600 italic">{error}</p>
                    ) : clases.length === 0 ? (
                        <p className="text-center py-10 text-gray-400 italic">No tienes clases asignadas</p>
                    ) : (
                        clases.map((c) => (
                            <article key={c.id_clase} className="py-[18px] border-b border-black/20 flex items-center">
                                <p className="w-[15%] line-clamp-1">{c.nombre_sede}</p>
                                <p className="w-[10%] line-clamp-1">{c.dia_semana}</p>
                                <p className="w-[20%] line-clamp-1">{c.hora_inicio} - {c.hora_fin}</p>
                                <p className="w-[20%]">{c.cupo_maximo}</p>
                                <p className="w-[15%]">
                                    <span className="inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-orange-100 text-orange-700">
                                        <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                                        {c.nombre_nivel}
                                    </span>
                                </p>
                                <div className="w-[20%] flex">
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
                        ))
                    )}
                </div>

                <AnimatePresence>
                    {modalOpen && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[50px]">Detalles de la clase</h3>
                            <div className="grid grid-cols-2 gap-y-[10px]">
                                <div className="flex flex-col gap-[10px]">
                                    <p className="font-medium">Sede:</p>
                                    <p className="font-medium">Día:</p>
                                    <p className="font-medium">Hora inicio:</p>
                                    <p className="font-medium">Hora fin:</p>
                                    <p className="font-medium">Nivel:</p>
                                    <p className="font-medium">Cupo máximo:</p>
                                    <p className="font-medium">Estado:</p>
                                    <p className="font-medium">Descripción:</p>
                                    {selected.instructores?.length > 0 && (
                                        <p className="font-medium">Instructores:</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-[10px]">
                                    <p className="text-gray-700">{selected.nombre_sede}</p>
                                    <p className="text-gray-700">{selected.dia_semana}</p>
                                    <p className="text-gray-700">{selected.hora_inicio}</p>
                                    <p className="text-gray-700">{selected.hora_fin}</p>
                                    <p className="text-gray-700">{selected.nombre_nivel}</p>
                                    <p className="text-gray-700">{selected.cupo_maximo}</p>
                                    <p className="text-gray-700">{selected.estado}</p>
                                    <p className="text-gray-700">{selected.descripcion}</p>
                                    {selected.instructores?.length > 0 && (
                                        <p className="text-gray-700">
                                            {selected.instructores.map(i => i.nombre_instructor).join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-[10px] mt-[30px]">
                                <button className="btn bg-gray-200" onClick={closeModal}>Cerrar</button>
                            </div>
                        </ModalWrapper>
                    )}
                </AnimatePresence>
            </section>
        </Layout>
    );
};

const ModalWrapper = ({ children, onClose }) => (
    <motion.div
        className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
    >
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
            className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
            {children}
        </motion.div>
    </motion.div>
);

export default MyClassesInstructor;
