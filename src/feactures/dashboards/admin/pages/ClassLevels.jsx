import React, { useEffect, useState } from "react";
import { Layout } from "../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialRoles = [
    { id: 1, nombre: "Principiante", descripcion: "Nivel para quienes empiezan, enfocado en fundamentos." },
    { id: 2, nombre: "Intermedio", descripcion: "Nivel para quienes ya conocen lo básico y buscan mejorar." },
    { id: 3, nombre: "Profesional", descripcion: "Nivel avanzado, orientado a técnicas profesionales." },
    { id: 4, nombre: "Amateur", descripcion: "Para aficionados con práctica ocasional." },
];

export const ClassLevels = () => {
    const [roles, setRoles] = useState(initialRoles);
    const [selected, setSelected] = useState(null);
    const [modalType, setModalType] = useState(null);

    const [editForm, setEditForm] = useState({ nombre: "", descripcion: "" });
    const [addForm, setAddForm] = useState({ nombre: "", descripcion: "" });

    // cerrar con Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const openModal = (type, item) => {
        setModalType(type);

        if (type === "add") {
            setAddForm({ nombre: "", descripcion: "" });
            setSelected(null);
            return;
        }

        setSelected(item ? { ...item } : null);

        if (type === "edit" && item) {
            setEditForm({ nombre: item.nombre || "", descripcion: item.descripcion || "" });
        }
    };

    const closeModal = () => {
        setSelected(null);
        setModalType(null);
    };

    const confirmDelete = (id) => {
        setRoles((prev) => prev.filter((it) => it.id !== id));
        closeModal();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdit = () => {
        if (!selected) return closeModal();
        setRoles((prev) => prev.map((it) => (it.id === selected.id ? { ...it, ...editForm } : it)));
        closeModal();
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveAdd = () => {
        const newId = roles.length ? Math.max(...roles.map((c) => c.id)) + 1 : 1;
        const newRole = { id: newId, nombre: addForm.nombre || `Nivel ${newId}`, descripcion: addForm.descripcion || "" };
        setRoles((prev) => [newRole, ...prev]);
        closeModal();
    };

    return (
        <Layout>
            <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
                <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Clases / Niveles de clases</h2>

                <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
                    <form action="" className="flex gap-[10px]">
                        <label className="mb-[20px] block">
                            <p className="">Buscar nivel:</p>
                            <div className="relative">
                                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                                <input
                                    className="input pl-[50px]!"
                                    type="text"
                                    placeholder={'Por ejemplo: "Principiante"'}
                                />
                            </div>
                        </label>
                    </form>

                    <div className="">
                        <button className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]" onClick={() => openModal("add", null)}>
                            <Plus size={20} strokeWidth={1.8} />
                            Añadir nivel
                        </button>
                    </div>
                </div>

                <div className="p-[30px]">
                    {/* Encabezados */}
                    <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
                        <p className="w-[30%] font-bold! opacity-80">Nombre</p>
                        <p className="w-[55%] font-bold! opacity-80">Descripción</p>
                        <p className="w-[15%] font-bold! opacity-80">Acciones</p>
                    </article>

                    {/* Lista de niveles */}
                    {roles.map((role) => (
                        <article key={role.id} className="py-[18px] border-b border-black/20 flex items-center">
                            <p className="w-[30%] line-clamp-1">{role.nombre}</p>
                            <p className="w-[55%] line-clamp-2">{role.descripcion}</p>

                            {/* Acciones: Ver, Editar, Eliminar */}
                            <div className="w-[15%] flex gap-[10px] items-center">
                                <motion.span className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={() => openModal("details", role)}>
                                    <Eye size={22} strokeWidth={1.3} />
                                </motion.span>

                                <motion.span className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={() => openModal("edit", role)}>
                                    <Pencil size={22} strokeWidth={1.3} />
                                </motion.span>

                                <motion.span className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={() => openModal("delete", role)}>
                                    <Trash2 size={22} strokeWidth={1.3} />
                                </motion.span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Modales */}
                <AnimatePresence>
                    {modalType === "add" && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[30px]">Agregar nivel</h3>

                            <form>
                                <label className="block mb-[20px]">
                                    <p className="translate-x-[25px]">Nombre:</p>
                                    <input
                                        name="nombre"
                                        className="input w-full"
                                        value={addForm.nombre}
                                        onChange={handleAddChange}
                                        placeholder={'Por ejemplo: "Principiante"'}
                                    />
                                </label>

                                <label className="block mb-[20px]">
                                    <p className="translate-x-[25px]">Descripción:</p>
                                    <textarea
                                        name="descripcion"
                                        className="input w-full h-[120px]"
                                        value={addForm.descripcion}
                                        onChange={handleAddChange}
                                        placeholder={'Por ejemplo: "Nivel para quienes empiezan, enfocado en fundamentos."'}
                                    />
                                </label>

                                <div className="flex justify-end gap-[10px] mt-[20px]">
                                    <button type="button" className="btn bg-gray-200" onClick={closeModal}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveAdd}>
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </ModalWrapper>
                    )}

                    {modalType === "details" && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[30px]">Detalles del nivel</h3>

                            <div className="grid grid-cols-2 gap-[10px]">
                                <div>
                                    <p className="font-medium">Nombre:</p>
                                    <p className="font-medium">Descripción:</p>
                                </div>
                                <div>
                                    <p className="text-gray-700">{selected.nombre}</p>
                                    <p className="text-gray-700">{selected.descripcion}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-[10px] mt-[30px]">
                                <button className="btn bg-gray-200" onClick={closeModal}>
                                    Cerrar
                                </button>
                            </div>
                        </ModalWrapper>
                    )}

                    {modalType === "edit" && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[30px]">Editar nivel</h3>

                            <form>
                                <label className="block mb-[20px]">
                                    <p className="translate-x-[25px]">Nombre:</p>
                                    <input
                                        name="nombre"
                                        className="input w-full"
                                        value={editForm.nombre}
                                        onChange={handleEditChange}
                                        placeholder={'Por ejemplo: "Intermedio"'}
                                    />
                                </label>

                                <label className="block mb-[20px]">
                                    <p className="translate-x-[25px]">Descripción:</p>
                                    <textarea
                                        name="descripcion"
                                        className="input w-full h-[120px]"
                                        value={editForm.descripcion}
                                        onChange={handleEditChange}
                                        placeholder={'Por ejemplo: "Nivel para quienes ya conocen lo básico y buscan mejorar."'}
                                    />
                                </label>

                                <div className="flex justify-end gap-[10px] mt-[20px]">
                                    <button type="button" className="btn bg-gray-200" onClick={closeModal}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveEdit}>
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </ModalWrapper>
                    )}

                    {modalType === "delete" && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[30px]">Eliminar nivel</h3>
                            <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar el nivel <span className="font-bold">{selected.nombre}</span>? Esta acción es permanente.</p>
                            <div className="flex justify-end gap-[10px] mt-[20px]">
                                <button className="btn bg-gray-200" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </ModalWrapper>
                    )}
                </AnimatePresence>
            </section>
        </Layout>
    );
};

/* === Modal  === */
const ModalWrapper = ({ children, onClose }) => {
    return (
        <motion.div className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {/* overlay clickeable con dim */}
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
                {children}
            </motion.div>
        </motion.div>
    );
};

export default ClassLevels;
