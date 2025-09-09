import React, { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Table = ({ usuarios, setUsuarios }) => {
	const [selectedUser, setSelectedUser] = useState(null);
	const [modalType, setModalType] = useState(null); // "details" | "edit" | "delete" | null

	const openModal = (type, user) => {
		setSelectedUser(user);
		setModalType(type);
	};

	const closeModal = () => {
		setModalType(null);
		setSelectedUser(null);
	};

	const confirmDelete = (id) => {
		setUsuarios((prev) => prev.filter((u) => u.id !== id));
		closeModal();
	};

	return (
		<div className="relative px-[30px] overflow-hidden ">
			{/* Header tabla */}
			<div className="sticky top-[120px] z-50">
				<article className="font-semibold italic mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
					<p className="w-[20%]">Nombre</p>
					<p className="w-[30%]">Correo electronico</p>
					<p className="w-[15%]">Telefono</p>
					<p className="w-[20%]">Nivel</p>
					<p className="w-[15%]">Acciones</p>
				</article>
			</div>

			{usuarios.map((element) => {
				const colores = [
					{ fondo: "bg-red-100", texto: "text-red-700" },
					{ fondo: "bg-green-100", texto: "text-green-700" },
					{ fondo: "bg-blue-100", texto: "text-blue-700" },
					{ fondo: "bg-yellow-100", texto: "text-yellow-700" },
					{ fondo: "bg-purple-100", texto: "text-purple-700" },
					{ fondo: "bg-pink-100", texto: "text-pink-700" },
					{ fondo: "bg-indigo-100", texto: "text-indigo-700" },
					{ fondo: "bg-teal-100", texto: "text-teal-700" },
					{ fondo: "bg-orange-100", texto: "text-orange-700" },
				];
				const color = colores[(element.id || 0) % colores.length];
				const inicial = element.name?.charAt(0).toUpperCase() || "?";

				return (
					<article key={element.id} className="py-[30px] border-b border-black/20 flex items-center">
						{/* Avatar */}
						<div className="w-[20%] flex gap-[15px] items-center">
							<span className={`w-[55px] h-[55px] ${color.fondo} ${color.texto} rounded-full flex justify-center items-center text-[2rem]`}>
								<h5 className="font-primary">{inicial}</h5>
							</span>
							<div className="flex flex-col">
								<h4 className="font-primary text-black/80 italic">{element.name}</h4>
								<p>{element.lastName}</p>
							</div>
						</div>

						<p className="w-[30%] underline italic">{element.email}</p>
						<p className="w-[15%]">{element.phone}</p>

						{/* Nivel */}
						<div className="w-[20%]">
							<p
								className={`inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full ${element.nivel === "Principiante"
									? "text-green-700 bg-green-100"
									: element.nivel === "Intermedio"
										? "text-yellow-700 bg-yellow-100"
										: element.nivel === "Avanzado"
											? "text-blue-700 bg-blue-100"
											: element.nivel === "Profesional"
												? "text-purple-700 bg-purple-100"
												: "text-gray-700 bg-gray-200"
									}`}
							>
								<span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
								{element.nivel}
							</p>
						</div>

						{/* Acciones */}
						<div className="w-[15%] flex gap-[10px] items-center">
							{/* Details */}
							<motion.span
								className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-200 shadow-md"
								whileHover={{ scale: 1.15 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
								onClick={() => openModal("details", element)}
							>
								<Eye size={22} strokeWidth={1.3} />
							</motion.span>

							{/* Edit */}
							<motion.span
								className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
								whileHover={{ scale: 1.15 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
								onClick={() => openModal("edit", element)}
							>
								<Pencil size={22} strokeWidth={1.3} />
							</motion.span>

							{/* Delete */}
							<motion.span
								className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
								whileHover={{ scale: 1.15 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
								onClick={() => openModal("delete", element)}
							>
								<Trash2 size={22} strokeWidth={1.3} />
							</motion.span>
						</div>
					</article>
				);
			})}

			{/* === Modales (animate presence para animaciones limpias) === */}
			<AnimatePresence>
				{modalType === "details" && selectedUser && (
					<ModalWrapper onClose={closeModal}>
						<h3 className="font-primary text-center mb-[50px]">Detalles del estudiante</h3>
						<div className="grid grid-cols-2">
							<div className="flex flex-col gap-[10px]">
								<p>Nombre:</p>
								<p>Telefono:</p>
								<p>Correo electronico:</p>
								<p>Edad:</p>
								<p>Nivel:</p>
							</div>
							<div className="flex flex-col gap-[10px]">
								<p>{selectedUser.name} {selectedUser.lastName}</p>
								<p>{selectedUser.phone}</p>
								<p>{selectedUser.email}</p>
								<p>23</p>
								<p>{selectedUser.nivel}</p>
							</div>
						</div>
						<div className="flex justify-end mt-[30px]">
							<button className="btn bg-gray-200" onClick={closeModal}>
								Cerrar
							</button>

						</div>

					</ModalWrapper>
				)}

				{modalType === "edit" && selectedUser && (
					<ModalWrapper onClose={closeModal}>
						<h3 className="font-primary text-center mb-[50px]">Editar estudiante</h3>
						<form className="">
							<div className="flex gap-[10px]">
								<label className="block mb-[20px]">
									<p className="translate-x-[25px]">Nombre:</p>
									<input className="input w-full" defaultValue={selectedUser.name} />
								</label>
								<label className="block mb-[20px]">
									<p className="translate-x-[25px]">Apellido:</p>
									<input className="input w-full " defaultValue={selectedUser.lastName} />
								</label>

							</div>
							<label className="block mb-[20px]">
								<p className="translate-x-[25px]">Correo electronico:</p>
								<input className="input w-full " defaultValue={selectedUser.email} />
							</label>
							<label className="block mb-[20px]">
								<p className="translate-x-[25px]">Telefono:</p>
								<input className="input w-full " defaultValue={selectedUser.phone} />
							</label>
							<div className="flex justify-end gap-[10px] mt-[30px]">
								<button type="button" className="btn bg-gray-200" onClick={closeModal}>
									Cancel
								</button>
								<button type="button" className="btn bg-blue-100 text-blue-700" onClick={closeModal}>
									Guardar
								</button>
							</div>
						</form>
					</ModalWrapper>
				)}

				{modalType === "delete" && selectedUser && (
					<ModalWrapper onClose={closeModal}>
						<h3 className="font-primary text-center mb-[50px]">Eliminar estudiante</h3>
						<p className="text-gray-600 mb-4">
							¿Estás seguro que deseas eliminar <span className="font-bold">{selectedUser.name} {selectedUser.lastName} </span>? Esta accion es permanente.
						</p>
						<div className="flex justify-end gap-[10px] mt-[30px]">
							<button className="btn bg-gray-200" onClick={closeModal}>
								Cancelar
							</button>
							<button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selectedUser.id)}>
								Eliminar
							</button>
						</div>
					</ModalWrapper>
				)}
			</AnimatePresence>
		</div>
	);
};

/* === Modal wrapper reutilizable === */
const ModalWrapper = ({ children, onClose }) => {
	return (
		<motion.div
			className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.15 }}
		>
			{/* overlay clickeable */}
			<div className="absolute inset-0" onClick={onClose} />

			<motion.div
				className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[600px] shadow-xl"
				initial={{ scale: 0.85, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.85, opacity: 0 }}
				transition={{ type: "spring", stiffness: 200, damping: 16 }}
			>
				{children}
				{/* close botón opcional (ya existe en cada modal) */}
			</motion.div>
		</motion.div>
	);
};

export default Table;
