import React, { useState } from "react";
import { Eye, Pencil, Trash2, Mail, Phone, Award } from "lucide-react";
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
		<div className="w-full">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="border-b border-gray-800 bg-[#0B0F14]">
							<th className="py-5 px-8 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Estudiante</th>
							<th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Contacto</th>
							<th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF]">Nivel</th>
							<th className="py-5 px-6 font-bold uppercase tracking-wider text-xs text-[#9CA3AF] text-right">Acciones</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-800">
						{usuarios.map((element) => {
							const colores = [
								{ fondo: "bg-red-500/10", border: "border-red-500/20", texto: "text-red-400" },
								{ fondo: "bg-green-500/10", border: "border-green-500/20", texto: "text-emerald-400" },
								{ fondo: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/20", texto: "text-[#3b82f6]" },
								{ fondo: "bg-yellow-500/10", border: "border-yellow-500/20", texto: "text-yellow-400" },
								{ fondo: "bg-purple-500/10", border: "border-purple-500/20", texto: "text-purple-400" },
								{ fondo: "bg-pink-500/10", border: "border-pink-500/20", texto: "text-pink-400" },
							];
							const color = colores[(element.id || 0) % colores.length];
							const inicial = element.name?.charAt(0).toUpperCase() || "?";

							return (
								<tr key={element.id} className="hover:bg-[#0B0F14]/50 transition-colors group">
									<td className="py-5 px-8">
										<div className="flex items-center gap-4">
											<div className={`w-12 h-12 rounded-full ${color.fondo} border ${color.border} ${color.texto} flex justify-center items-center text-xl font-black shadow-lg shadow-black/20`}>
												{inicial}
											</div>
											<div>
												<h4 className="font-white font-bold text-white group-hover:text-[#3b82f6] transition-colors">{element.name} {element.lastName}</h4>
												<p className="text-xs text-[#9CA3AF]">ID: STU-{element.id.toString().padStart(4, '0')}</p>
											</div>
										</div>
									</td>

									<td className="py-5 px-6">
										<div className="flex flex-col gap-1 text-sm text-[#D1D5DB]">
											<div className="flex items-center gap-2">
												<Mail size={12} className="text-[#9CA3AF]" /> {element.email}
											</div>
											<div className="flex items-center gap-2">
												<Phone size={12} className="text-[#9CA3AF]" /> {element.phone}
											</div>
										</div>
									</td>

									<td className="py-5 px-6">
										<span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border 
                                            ${element.nivel === "Principiante" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
												element.nivel === "Intermedio" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
													element.nivel === "Avanzado" ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20" :
														element.nivel === "Profesional" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
															"text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
											<span className="w-1.5 h-1.5 rounded-full bg-[currentColor]"></span>
											{element.nivel}
										</span>
									</td>

									<td className="py-5 px-6 text-right">
										<div className="flex gap-2 justify-end">
											<button
												onClick={() => openModal("details", element)}
												className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-gray-800 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 text-[#9CA3AF] hover:text-[#3b82f6] flex justify-center items-center transition-all"
												title="Ver detalles"
											>
												<Eye size={18} />
											</button>
											<button
												onClick={() => openModal("edit", element)}
												className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-gray-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-[#9CA3AF] hover:text-emerald-400 flex justify-center items-center transition-all"
												title="Editar"
											>
												<Pencil size={18} />
											</button>
											<button
												onClick={() => openModal("delete", element)}
												className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-gray-800 hover:border-red-500 hover:bg-red-500/10 text-[#9CA3AF] hover:text-red-400 flex justify-center items-center transition-all"
												title="Eliminar"
											>
												<Trash2 size={18} />
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<AnimatePresence>
				{modalType === "details" && selectedUser && (
					<ModalWrapper onClose={closeModal}>
						<div className="p-8">
							<div className="flex items-center gap-5 mb-8 border-b border-gray-800 pb-6">
								<div className="w-16 h-16 rounded-full bg-[#1E3A8A] flex justify-center items-center text-3xl font-black text-white shadow-lg">
									{selectedUser.name?.charAt(0).toUpperCase()}
								</div>
								<div>
									<h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
										{selectedUser.name} {selectedUser.lastName}
									</h3>
									<span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
                                            ${selectedUser.nivel === "Principiante" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
											selectedUser.nivel === "Intermedio" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
												selectedUser.nivel === "Avanzado" ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20" :
													selectedUser.nivel === "Profesional" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" :
														"text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
										<Award size={10} /> {selectedUser.nivel}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8 text-sm">
								<div className="bg-[#0B0F14] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
									<Phone className="text-[#3b82f6]" size={20} />
									<div>
										<p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Teléfono</p>
										<p className="font-semibold text-white">{selectedUser.phone}</p>
									</div>
								</div>
								<div className="bg-[#0B0F14] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
									<Mail className="text-[#3b82f6]" size={20} />
									<div>
										<p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Email</p>
										<p className="font-semibold text-white truncate max-w-[150px]">{selectedUser.email}</p>
									</div>
								</div>
								<div className="bg-[#0B0F14] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
									<div className="font-bold text-[#3b82f6] text-xl px-1">23</div>
									<div>
										<p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Edad</p>
										<p className="font-semibold text-white">23 años</p>
									</div>
								</div>
								<div className="bg-[#0B0F14] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
									<div className="font-bold text-[#3b82f6] text-sm px-1">#</div>
									<div>
										<p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">ID Estudiante</p>
										<p className="font-semibold text-white">STU-{selectedUser.id.toString().padStart(4, '0')}</p>
									</div>
								</div>
							</div>

							<div className="flex justify-end pt-6 border-t border-gray-800">
								<button className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all shadow-[0_8px_30px_rgba(255,255,255,0.1)]" onClick={closeModal}>
									Cerrar Detalle
								</button>
							</div>
						</div>
					</ModalWrapper>
				)}

				{modalType === "edit" && selectedUser && (
					<ModalWrapper onClose={closeModal}>
						<div className="p-8">
							<h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8 pb-4 border-b border-gray-800 flex items-center gap-3">
								<Pencil className="text-[#3b82f6]" size={24} /> Editar Estudiante
							</h3>
							<form>
								<div className="flex gap-4 mb-4">
									<div className="flex-1">
										<label className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider ml-2 block mb-1">Nombre</label>
										<input className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors" defaultValue={selectedUser.name} />
									</div>
									<div className="flex-1">
										<label className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider ml-2 block mb-1">Apellido</label>
										<input className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors" defaultValue={selectedUser.lastName} />
									</div>
								</div>
								<div className="mb-4">
									<label className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider ml-2 block mb-1">Correo electrónico</label>
									<input type="email" className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors" defaultValue={selectedUser.email} />
								</div>
								<div className="mb-6">
									<label className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider ml-2 block mb-1">Teléfono</label>
									<input type="tel" className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors" defaultValue={selectedUser.phone} />
								</div>

								<div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
									<button type="button" className="px-6 py-3 bg-[#0B0F14] border border-gray-700 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all" onClick={closeModal}>
										Cancelar
									</button>
									<button type="button" className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20" onClick={closeModal}>
										Guardar Cambios
									</button>
								</div>
							</form>
						</div>
					</ModalWrapper>
				)}

				{modalType === "delete" && selectedUser && (
					<ModalWrapper onClose={closeModal}>
						<div className="p-8 text-center">
							<div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
								<Trash2 size={32} />
							</div>
							<h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Eliminar Estudiante</h3>
							<p className="text-gray-400 mb-8 max-w-[300px] mx-auto text-sm">
								¿Estás seguro que deseas eliminar a <br /><span className="font-bold text-white text-base mt-2 inline-block">{selectedUser.name} {selectedUser.lastName}</span>?<br /><br />Esta acción no se puede deshacer.
							</p>
							<div className="flex justify-center gap-3">
								<button className="px-8 py-3 bg-[#0B0F14] border border-gray-700 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all" onClick={closeModal}>
									Cancelar
								</button>
								<button className="px-8 py-3 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20" onClick={() => confirmDelete(selectedUser.id)}>
									Eliminar
								</button>
							</div>
						</div>
					</ModalWrapper>
				)}
			</AnimatePresence>
		</div>
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
				className="relative z-10 bg-[#121821] border border-gray-800 rounded-3xl w-[90%] max-w-[600px] shadow-2xl overflow-hidden"
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

export default Table;
