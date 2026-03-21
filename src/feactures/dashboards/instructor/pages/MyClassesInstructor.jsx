import React, { useEffect, useState } from "react";
import { InstructorLayout } from "../../../landing/instructor/layout/InstructorLayout";
import { Eye, Calendar, MapPin, Clock, Users, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../services/api";

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
	const [clases, setClases] = useState([]);
	const [selected, setSelected] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [viewMode, setViewMode] = useState("list"); // "list" or "students"
	const [activeClass, setActiveClass] = useState(null);

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				closeModal();
				if (viewMode === "students") setViewMode("list");
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [viewMode]);

	useEffect(() => {
		fetchMisClases();
	}, []);

	const fetchMisClases = async () => {
		setLoading(true);
		setError(null);
		try {
			const user = JSON.parse(localStorage.getItem("user") || "{}");
			const userId = user.id_usuario;

			if (!userId) {
				setError("No se encontró sesión activa.");
				return;
			}

			const { data } = await api.get(`/clases/instructor/${userId}`);
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

    const showStudents = (c) => {
        setActiveClass(c);
        setViewMode("students");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

	return (
		<InstructorLayout>
			<section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[100px]">
				<div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    <AnimatePresence mode="wait">
                        {viewMode === "list" ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-6 border-b border-gray-800">
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                                            <Calendar className="text-[#3b82f6]" size={36} />
                                            Clases Impartidas
                                        </h2>
                                        <p className="text-[#9CA3AF] mt-2 font-medium">Revisa los horarios y detalles de las clases a tu cargo</p>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                                        <div className="w-12 h-12 border-4 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin"></div>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando itinerarios...</p>
                                    </div>
                                ) : error ? (
                                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center">
                                        <p className="text-red-400 font-bold">{error}</p>
                                        <button onClick={fetchMisClases} className="mt-4 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-6 py-2 rounded-xl">Reintentar</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        {clases.map((c, index) => (
                                            <div key={c.id_clase || index} className="bg-[#121821] border border-gray-800 rounded-[2rem] shadow-xl hover:border-gray-700 transition-all group flex flex-col md:flex-row overflow-hidden items-stretch">
                                                {c.url_imagen && (
                                                    <div className="h-48 md:h-auto md:w-[240px] shrink-0 w-full relative overflow-hidden bg-gray-900 border-r border-gray-800/50">
                                                        <img src={c.url_imagen} alt={c.nombre || "Clase"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#121821]/80 via-transparent to-transparent"></div>
                                                    </div>
                                                )}
                                                <div className="p-6 md:p-8 flex flex-col flex-grow w-full">
                                                    <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                                                        <div>
                                                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-[#3b82f6] transition-colors line-clamp-2">{c.nombre || c.descripcion || `Clase en ${c.nombre_sede}`}</h3>
                                                            <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">Cupo total <span className="text-white italic">{c.cupo_maximo || 0}</span></p>
                                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3b82f6]">Estudiantes inscritos <span className="text-white italic">{c.estudiantes?.length || 0}</span></p>
                                                        </div>
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 whitespace-nowrap">
                                                            {c.nivel}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 flex-grow">
                                                        <div className="flex items-start gap-3 text-[#9CA3AF]">
                                                            <div className="bg-gray-800/50 p-2 rounded-lg">
                                                                <MapPin size={16} className="text-[#3b82f6]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase font-black tracking-widest mb-0.5">Ubicación</p>
                                                                <p className="text-xs text-white font-bold">{c.ubicacion || c.nombre_sede || "Sin sede"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3 text-[#9CA3AF]">
                                                            <div className="bg-gray-800/50 p-2 rounded-lg">
                                                                <Clock size={16} className="text-[#3b82f6]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase font-black tracking-widest mb-0.5">Horario</p>
                                                                <p className="text-xs text-white font-bold">{c.dia || c.dia_semana || "Por definir"}</p>
                                                                <p className="text-[10px] text-gray-400">{c.hora || `${c.hora_inicio?.slice(0,5)} a ${c.hora_fin?.slice(0,5)}`}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-gray-800 flex flex-wrap gap-2 justify-end">
                                                        <button
                                                            onClick={() => showStudents(c)}
                                                            className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] rounded-xl py-2 px-4 font-black uppercase tracking-widest text-[9px] hover:bg-[#3b82f6] hover:text-white transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Users size={12} /> Ver Estudiantes
                                                        </button>
                                                        <button
                                                            onClick={() => openView(c)}
                                                            className="bg-[#0B0F14] border border-gray-800 text-white rounded-xl py-2 px-4 font-black uppercase tracking-widest text-[9px] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Eye size={12} /> Detalles
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="students"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <button 
                                        onClick={() => setViewMode("list")}
                                        className="h-12 w-12 bg-gray-800 rounded-2xl flex items-center justify-center text-white hover:bg-[#3b82f6] transition-all group shadow-lg"
                                    >
                                        <Calendar size={20} className="group-hover:scale-110" />
                                    </button>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Listado de Estudiantes</h2>
                                        <p className="text-[#3b82f6] text-[10px] font-black uppercase tracking-[0.2em]">{activeClass?.nombre || activeClass?.descripcion || "Clase Seleccionada"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                                    {/* Sidebar Resumen */}
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-[#121821] p-6 rounded-3xl border border-gray-800">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Resumen de Clase</p>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Inscritos</p>
                                                    <p className="text-2xl font-black text-white">{activeClass?.estudiantes?.length || 0} / {activeClass?.cupo_maximo || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Nivel</p>
                                                    <p className="text-sm font-black text-orange-400 uppercase tracking-widest">{activeClass?.nivel || "General"}</p>
                                                </div>
                                                <div className="pt-4 border-t border-gray-800">
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Horario</p>
                                                    <p className="text-xs text-white font-bold">{activeClass?.dia || activeClass?.dia_semana}</p>
                                                    <p className="text-[10px] text-[#3b82f6] font-bold">{activeClass?.hora || `${activeClass?.hora_inicio?.slice(0,5)} - ${activeClass?.hora_fin?.slice(0,5)}`}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => setViewMode("list")}
                                            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl shadow-white/5"
                                        >
                                            Volver al Itinerario
                                        </button>
                                    </div>

                                    {/* Lista Detallada */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-[#121821] rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
                                            {activeClass?.estudiantes && activeClass.estudiantes.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-900/50">
                                                            <tr>
                                                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Estudiante</th>
                                                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Información de Contacto</th>
                                                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-800/50">
                                                            {activeClass.estudiantes.map((est, i) => (
                                                                <tr key={est.id_estudiante || i} className="hover:bg-white/[0.02] transition-colors group">
                                                                    <td className="py-6 px-8">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-xs font-black text-[#3b82f6] border border-gray-700 shadow-inner group-hover:bg-[#3b82f6] group-hover:text-white transition-all">
                                                                                {est.nombre_estudiante?.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-white font-black text-sm tracking-tight uppercase italic">{est.nombre_estudiante}</p>
                                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID: {est.id_estudiante || "—"}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-6 px-8">
                                                                        <div className="flex flex-col gap-1">
                                                                            <p className="text-white font-bold text-xs flex items-center gap-2">
                                                                                <Phone size={14} className="text-[#3b82f6]" />
                                                                                {est.telefono || "Sin teléfono"}
                                                                            </p>
                                                                            <p className="text-[10px] text-gray-500 font-medium lowercase italic pl-6">{est.email || "No se registró email"}</p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-6 px-8 text-right">
                                                                        <button className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-[#3b82f6]/20 transition-all border border-transparent hover:border-[#3b82f6]/30">
                                                                            <Users size={14} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="py-32 text-center flex flex-col items-center gap-6">
                                                    <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center text-gray-700 border border-gray-800 border-dashed">
                                                        <Users size={40} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-white font-black uppercase tracking-widest text-xs">Sin alumnos asignados</p>
                                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto">No hay estudiantes inscritos en esta sección. Contacta con administración para más detalles.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
				</div>

				<AnimatePresence>
					{modalOpen && selected ? (
						<ModalWrapper onClose={closeModal}>
							<div className="p-8">
								<div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
									<div>
										<h3 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
											{selected.nombre || selected.descripcion}
										</h3>
										<p className="text-[#9CA3AF] font-medium">Instructor Especialista</p>
									</div>
									<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-widest border border-orange-500/20">
										{selected.nivel}
									</span>
								</div>

								<div className="space-y-6 mb-8 text-sm">
									<p className="text-[#9CA3AF] leading-relaxed italic border-l-4 border-[#3b82f6] pl-4">
										"{selected.descripcion || "Información detallada de la sesión operativa."}"
									</p>

									<div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-[#0B0F14] p-6 rounded-2xl border border-gray-800">
										<div className="flex items-start gap-3">
											<div className="p-2 bg-gray-800/50 rounded-lg">
												<MapPin className="text-[#3b82f6]" size={20} />
											</div>
											<div>
												<p className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-1">Lugar</p>
												<p className="font-semibold text-white">{selected.ubicacion || selected.nombre_sede}</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<div className="p-2 bg-gray-800/50 rounded-lg">
												<Clock className="text-[#3b82f6]" size={20} />
											</div>
											<div>
												<p className="text-[#9CA3AF] uppercase font-bold tracking-widest text-[10px] mb-1">Horario</p>
												<p className="font-semibold text-white">{selected.dia || selected.dia_semana}</p>
												<p className="text-gray-400 text-xs mt-0.5">{selected.hora || `${selected.hora_inicio?.slice(0,5)} a ${selected.hora_fin?.slice(0,5)}`}</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex justify-end pt-6 border-t border-gray-800">
									<button
										className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#3b82f6] hover:text-white transition-all shadow-xl shadow-white/5"
										onClick={closeModal}
									>
										Entendido
									</button>
								</div>
							</div>
						</ModalWrapper>
					) : null}
				</AnimatePresence>
			</section>
		</InstructorLayout>
	);
};

const ModalWrapper = ({ children, onClose, maxWidth = "max-w-[640px]" }) => {
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
				className={`relative z-10 bg-[#121821] border border-gray-800 rounded-3xl w-[90%] ${maxWidth} shadow-2xl overflow-hidden`}
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

export default MyClassesInstructor;
