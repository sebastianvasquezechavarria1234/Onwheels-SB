import React, { useEffect, useState } from "react";
import { Layout } from "../layout/layout";
import { Eye, Funnel, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialClases = [
    {
        id: 1,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
    {
        id: 2,
        ubicacion: "Estadio",
        direccion: "Calle 4 int 131",
        dia: "Lunes",
        hora: "11 pm a 1 pm",
        nivel: "Intermedio",
        cantidadEstudiantes: 12,
        nombre: "Dibujo Intermedio",
        instructor: "Sebastián Vásquez",
        descripcion: "Clase enfocada en figura humana y composición (intermedio).",
        sede: "VillaTiva",
    },
];

export const Classes = () => {
    const [clases, setClases] = useState(initialClases);

    const [selected, setSelected] = useState(null);
    const [modalType, setModalType] = useState(null);

    const [editForm, setEditForm] = useState({
        ubicacion: "",
        direccion: "",
        dia: "",
        hora: "",
        nivel: "",
        cantidadEstudiantes: "",
        nombre: "",
        instructor: "",
        descripcion: "",
    });

    // addForm vacío para que se vean los placeholders al abrir el modal de registro
    const [addForm, setAddForm] = useState({
        dia: "",
        horaInicio: "",
        horaFinal: "",
        ubicacion: "",
        direccion: "",
        sede: "",
        profesor: "",
        nivel: "",
    });

    // cerrar con Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const openModal = (type, c) => {
        setModalType(type);

        if (type === "add") {
            // reseteo vacío para que aparezcan los placeholders
            setAddForm({
                dia: "",
                horaInicio: "",
                horaFinal: "",
                ubicacion: "",
                direccion: "",
                sede: "",
                profesor: "",
                nivel: "",
            });
            setSelected(null);
            return;
        }

        setSelected(c ? { ...c } : null);

        if (type === "edit" && c) {
            setEditForm({
                ubicacion: c.ubicacion || "",
                direccion: c.direccion || "",
                dia: c.dia || "",
                hora: c.hora || "",
                nivel: c.nivel || "",
                cantidadEstudiantes: c.cantidadEstudiantes || "",
                nombre: c.nombre || "",
                instructor: c.instructor || "",
                descripcion: c.descripcion || "",
            });
        }
    };

    const openView = (c) => openModal("details", c);

    const closeModal = () => {
        setSelected(null);
        setModalType(null);
    };

    const confirmDelete = (id) => {
        setClases((prev) => prev.filter((item) => item.id !== id));
        closeModal();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdit = () => {
        if (!selected) return closeModal();
        setClases((prev) =>
            prev.map((item) =>
                item.id === selected.id ? { ...item, ...editForm, cantidadEstudiantes: Number(editForm.cantidadEstudiantes) } : item
            )
        );
        closeModal();
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveAdd = () => {
        const newId = clases.length ? Math.max(...clases.map((c) => c.id)) + 1 : 1;
        const nuevaClase = {
            id: newId,
            ubicacion: addForm.ubicacion,
            direccion: addForm.direccion,
            dia: addForm.dia,
            hora: `${addForm.horaInicio} a ${addForm.horaFinal}`,
            nivel: addForm.nivel,
            cantidadEstudiantes: 0,
            nombre: `Clase - ${addForm.dia || "sin día"}`,
            instructor: addForm.profesor,
            descripcion: "",
            sede: addForm.sede,
        };
        setClases((prev) => [nuevaClase, ...prev]);
        closeModal();
    };

    return (
        <Layout>
            <section className="dashboard__pages relative w-full overflow-y-scroll sidebar  h-screen">
                <h2 className="dashboard__title font-primary  p-[30px] font-secundaria">
                    Clases / Clases
                </h2>

                <div className="flex justify-between items-center p-[0px_40px_0px_20px] mt-[80px] mb-[-40px]">
                    <form action="" className="flex gap-[10px]">
                        <label className="mb-[20px] block">
                            <p className="">Buscar clase:</p>
                            <div className="relative">
                                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                                <input
                                    className="input pl-[50px]!"
                                    type="text"
                                    placeholder={'Por ejemplo: "Skate para principiantes"'}
                                />
                            </div>
                        </label>
                        <label className="mb-[20px] block">
                            <p className="">Filtrar por:</p>
                            <div className="relative">
                                <Funnel className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                                <select className="input pl-[50px]!" name="" id="">
                                    <option value="">Dia</option>
                                    <option value="">Hora</option>
                                    <option value="">Dirección</option>
                                </select>
                            </div>
                        </label>
                    </form>

                    <div className="">
                        <button
                            className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
                            onClick={() => openModal("add", null)}
                        >
                            <Plus size={20} strokeWidth={1.8}/>
                            Añadir clase
                        </button>
                    </div>
                </div>

                <div className="p-[30px]">
                    {/* Encabezados */}
                    <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
                        <p className="w-[10%] font-bold! opacity-80">Ubicación</p>
                        <p className="w-[15%] font-bold! opacity-80">Dirección</p>
                        <p className="w-[10%] font-bold! opacity-80">Día</p>
                        <p className="w-[15%] font-bold! opacity-80">Hora</p>
                        <p className="w-[20%] font-bold! opacity-80">Profesor</p>
                        <p className="w-[15%] font-bold! opacity-80">Nivel de la clase</p>
                        <p className="w-[15%] font-bold! opacity-80">Acciones</p>
                    </article>

                    {/* Lista de Clases */}
                    {clases.map((c) => (
                        <article
                            key={c.id}
                            className="py-[18px] border-b border-black/20 flex items-center"
                        >
                            <p className="w-[10%] line-clamp-1">{c.ubicacion}</p>
                            <p className="w-[15%] line-clamp-1">{c.direccion}</p>
                            <p className="w-[10%] line-clamp-1">{c.dia}</p>
                            <p className="w-[15%] line-clamp-1">{c.hora}</p>
                            <p className="w-[20%]">{c.instructor}</p>
                            <p className="w-[15%]">
                                <span className="inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-orange-100 text-orange-700">
                                    <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                                    {c.nivel}
                                </span>
                            </p>

                            {/* Acciones: Ver, Editar, Eliminar */}
                            <div className="w-[15%] flex gap-[10px] items-center">
                                <motion.span
                                    className="actions w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => openModal("details", c)}
                                >
                                    <Eye size={22} strokeWidth={1.3} />
                                </motion.span>

                                <motion.span
                                    className="actions w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => openModal("edit", c)}
                                >
                                    <Pencil size={22} strokeWidth={1.3} />
                                </motion.span>

                                <motion.span
                                    className="actions w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => openModal("delete", c)}
                                >
                                    <Trash2 size={22} strokeWidth={1.3} />
                                </motion.span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Modal animado con AnimatePresence y ModalWrapper */}
                <AnimatePresence>
                    {/* ADD Modal */}
                    {modalType === "add" && (
                        <ModalWrapper onClose={closeModal}>
                            <h3 className="font-primary text-center mb-[30px]">Agregar clase</h3>

                            <form className="">
                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Día:</p>
                                        <input
                                            name="dia"
                                            className="input w-full"
                                            value={addForm.dia}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "Lunes"'}
                                        />
                                    </label>

                                    <label className="block mb-[20px] w-1/2">
                                        <p>Nivel de clase:</p>
                                        <input
                                            name="nivel"
                                            className="input w-full"
                                            value={addForm.nivel}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "Principiante"'}
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Hora inicio:</p>
                                        <input
                                            name="horaInicio"
                                            className="input w-full"
                                            value={addForm.horaInicio}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "7:00 pm"'}
                                        />
                                    </label>

                                    <label className="block mb-[20px] w-1/2">
                                        <p>Hora final:</p>
                                        <input
                                            name="horaFinal"
                                            className="input w-full"
                                            value={addForm.horaFinal}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "9:00 pm"'}
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Ubicación:</p>
                                        <input
                                            name="ubicacion"
                                            className="input w-full"
                                            value={addForm.ubicacion}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "Skate Park VillaTiva"'}
                                        />
                                    </label>
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Dirección:</p>
                                        <input
                                            name="direccion"
                                            className="input w-full"
                                            value={addForm.direccion}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "Calle 4 int 131"'}
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Sede:</p>
                                        <input
                                            name="sede"
                                            className="input w-full"
                                            value={addForm.sede}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "VillaTiva"'}
                                        />
                                    </label>
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Profesor:</p>
                                        <input
                                            name="profesor"
                                            className="input w-full"
                                            value={addForm.profesor}
                                            onChange={handleAddChange}
                                            placeholder={'Por ejemplo: "Sebastián Vásquez"'}
                                        />
                                    </label>
                                </div>

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
                            <h3 className="font-primary text-center mb-[50px]">Detalles de la clase</h3>

                            <div className="grid grid-cols-2">
                                <div className="flex flex-col gap-[10px]">
                                    <p className="font-medium">Ubicación:</p>
                                    <p className="font-medium">Dirección:</p>
                                    <p className="font-medium">Día:</p>
                                    <p className="font-medium">Hora:</p>
                                    <p className="font-medium">Nivel de la clase:</p>
                                    <p className="font-medium">Cantidad de estudiantes:</p>
                                    <p className="font-medium">Instructor:</p>
                                </div>
                                <div className="flex flex-col gap-[10px]">
                                    <p className="text-gray-700">{selected.ubicacion}</p>
                                    <p className="text-gray-700">{selected.direccion}</p>
                                    <p className="text-gray-700">{selected.dia}</p>
                                    <p className="text-gray-700">{selected.hora}</p>
                                    <p className="text-gray-700">{selected.nivel}</p>
                                    <p className="text-gray-700">{selected.cantidadEstudiantes}</p>
                                    <p className="text-gray-700">{selected.instructor}</p>
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
                            <h3 className="font-primary text-center mb-[50px]">Editar clase</h3>
                            <form className="">
                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Nombre:</p>
                                        <input
                                            name="nombre"
                                            className="input w-full"
                                            value={editForm.nombre}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Instructor:</p>
                                        <input
                                            name="instructor"
                                            className="input w-full"
                                            value={editForm.instructor}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Ubicación:</p>
                                        <input
                                            name="ubicacion"
                                            className="input w-full"
                                            value={editForm.ubicacion}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Dirección:</p>
                                        <input
                                            name="direccion"
                                            className="input w-full"
                                            value={editForm.direccion}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/1">
                                        <p>Día:</p>
                                        <input
                                            name="dia"
                                            className="input w-full"
                                            value={editForm.dia}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                  
                                    <label className="block mb-[20px] w-1/1">
                                        <p>Nivel:</p>
                                        <input
                                            name="nivel"
                                            className="input w-full"
                                            value={editForm.nivel}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                </div>

                                <div className="flex gap-[10px]">
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Cantidad de estudiantes:</p>
                                        <input
                                            name="cantidadEstudiantes"
                                            type="number"
                                            className="input w-full"
                                            value={editForm.cantidadEstudiantes}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                    <label className="block mb-[20px] w-1/2">
                                        <p>Descripción:</p>
                                        <input
                                            name="descripcion"
                                            className="input w-full"
                                            value={editForm.descripcion}
                                            onChange={handleEditChange}
                                        />
                                    </label>
                                </div>

                                <div className="flex justify-end gap-[10px] mt-[30px]">
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
                            <h3 className="font-primary text-center mb-[50px]">Eliminar clase</h3>
                            <p className="text-gray-600 mb-4">
                                ¿Estás seguro que deseas eliminar <span className="font-bold">{selected.nombre}</span>? Esta acción es permanente.
                            </p>
                            <div className="flex justify-end gap-[10px] mt-[30px]">
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
        <motion.div
            className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
        >
            {/* overlay clickeable con dim */}
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

export default Classes;
