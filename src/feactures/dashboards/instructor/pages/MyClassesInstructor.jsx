import React, { useEffect, useState } from "react";
import { Layout } from "../../instructor/layout/layout";
import { Eye } from "lucide-react";
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
	},
];

export const MyClassesInstructor = () => {
	const [clases, setClases] = useState(initialClases);
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
				<h2 className="font-primary sticky top-0 bg-[var(--gray-bg-body)] p-[30px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-secundaria">
					Mis clases
				</h2>

				<div className="p-[30px]">
					{/* Encabezados */}
					<article className="font-semibold italic mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
						<p className="w-[10%]">Ubicación</p>
						<p className="w-[15%]">Dirección</p>
						<p className="w-[10%]">Día</p>
						<p className="w-[15%]">Hora</p>
						<p className="w-[20%]">Cantidad de estudiantes</p>
						<p className="w-[15%]">Nivel de la clase</p>
						<p className="w-[15%]">Acciones</p>
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
							<p className="w-[20%]">{c.cantidadEstudiantes}</p>
							<p className="w-[15%]">
								<span className="inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-orange-100 text-orange-700">
									<span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
									{c.nivel}
								</span>
							</p>

							{/* Solo acción Ver (estilo original con framer-motion) */}
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

				{/* Modal animado con AnimatePresence y ModalWrapper */}
				<AnimatePresence>
					{modalOpen && selected && (
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
				</AnimatePresence>
			</section>
		</Layout>
	);
};

/* === Modal wrapper reutilizable (igual al ejemplo) === */
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

export default MyClassesInstructor;
