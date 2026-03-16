// src/features/dashboards/student/pages/MyClasses.jsx
import React, { useEffect, useState } from "react";
import { StudentLayout } from "../../../landing/student/layout/StudentLayout";
import { Eye, Phone, Calendar, MapPin, Clock, Users, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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

export const MyClasses = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quoteMenuOpen, setQuoteMenuOpen] = useState(false);

  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || "+57 300 123 4567";
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "contacto@onwheels.com";
  const contactWhatsApp = import.meta.env.VITE_CONTACT_WHATSAPP || "+57 300 123 4567";
  const whatsappDigits = contactWhatsApp.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent("Hola, quiero cotizar una nueva clase.");

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!e.target.closest("[data-quote-menu]")) {
        setQuoteMenuOpen(false);
      }
    };

    if (quoteMenuOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [quoteMenuOpen]);

    const normalizeClassItem = (item = {}) => {
        const joinedInstructors = Array.isArray(item.instructores)
            ? item.instructores
                    .map((i) => i?.nombre_instructor || i?.nombre)
                    .filter(Boolean)
                    .join(", ")
            : null;

        const computedHora = item.hora || ((item.hora_inicio || item.hora_fin)
            ? `${item.hora_inicio || "--"} a ${item.hora_fin || "--"}`
            : "Por definir");

        return {
            id: item.id_clase || item.id_matricula || item.id,
            nombre: item.nombre || item.nombre_clase || item.nombre_nivel || "Clase",
            instructor: item.instructor || item.nombre_instructor || joinedInstructors || "Por asignar",
            nivel: item.nivel || item.nombre_nivel || "General",
            ubicacion: item.ubicacion || item.nombre_sede || item.sede || "Sin sede",
            direccion: item.direccion || item.direccion_sede || "Sin direccion",
            dia: item.dia || item.dia_semana || "Por definir",
            hora: computedHora,
            cantidadEstudiantes: item.cantidadEstudiantes || item.cantidad_estudiantes || item.total_estudiantes || 0,
            descripcion: item.descripcion || item.descripcion_clase || item.observaciones || "Sin descripcion disponible.",
        };
    };

    useEffect(() => {
        const fetchMisClases = async () => {
            setLoading(true);
            setError(null);

            try {
                let rawData = [];

                try {
                    const { data } = await api.get("/clases/mis-clases");
                    rawData = Array.isArray(data) ? data : [];
                } catch (primaryError) {
                    const { data } = await api.get("/matriculas/mis-matriculas");
                    rawData = Array.isArray(data) ? data : [];
                }

                setClases(rawData.map(normalizeClassItem));
            } catch (err) {
                console.error("Error cargando mis clases del estudiante:", err);
                setError("No se pudieron cargar tus clases. Intenta de nuevo.");
                setClases([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMisClases();
    }, []);

  const openView = (c) => { setSelected({ ...c }); setModalOpen(true); };
  const closeModal = () => { setSelected(null); setModalOpen(false); };

  // Convierte el array de instructores en string legible
  const getNombreInstructor = (instructores) => {
    if (!instructores || instructores.length === 0) return "Sin instructor";
    return instructores.map((i) => i.nombre_instructor).join(", ");
  };

  // Badge de estado de matrícula
  const estadoBadge = (estado) => {
    const estilos = {
      Activa: "bg-green-100 text-green-700",
      Vencida: "bg-yellow-100 text-yellow-700",
      Cancelada: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`inline-flex items-center gap-[5px] px-[12px] py-[5px] rounded-full text-xs font-medium ${estilos[estado] ?? "bg-gray-100 text-gray-600"}`}>
        <span className="w-[8px] h-[8px] block bg-[currentColor] rounded-full" />
        {estado}
      </span>
    );
  };

    return (
        <StudentLayout>
            <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[100px]">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-6 border-b border-gray-800">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                                <Calendar className="text-[#3b82f6]" size={36} />
                                Mis Clases
                            </h2>
                            <p className="text-[#9CA3AF] mt-2 font-medium">Revisa tus horarios y detalles de las clases inscritas</p>
                        </div>

                        <div className="relative" data-quote-menu>
                            <button
                                type="button"
                                onClick={() => setQuoteMenuOpen((prev) => !prev)}
                                className="flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20 group"
                            >
                                <Phone size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                Cotizar Nueva Clase
                                <ChevronDown size={14} className={`transition-transform ${quoteMenuOpen ? "rotate-180" : ""}`} />
                            </button>

                            {quoteMenuOpen && (
                                <div className="absolute right-0 mt-3 w-[290px] bg-[#121821] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-20">
                                    <a
                                        href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#1E293B] transition-colors"
                                        onClick={() => setQuoteMenuOpen(false)}
                                    >
                                        <Phone size={16} className="text-[#3b82f6]" />
                                        <span>Llamar: {contactPhone}</span>
                                    </a>

                                    <a
                                        href={`mailto:${contactEmail}?subject=${encodeURIComponent("Cotizar nueva clase")}`}
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#1E293B] transition-colors border-t border-gray-800"
                                        onClick={() => setQuoteMenuOpen(false)}
                                    >
                                        <Mail size={16} className="text-[#22c55e]" />
                                        <span>Correo: {contactEmail}</span>
                                    </a>

                                    <a
                                        href={`https://wa.me/${whatsappDigits}?text=${whatsappMessage}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#1E293B] transition-colors border-t border-gray-800"
                                        onClick={() => setQuoteMenuOpen(false)}
                                    >
                                        <MessageCircle size={16} className="text-[#25D366]" />
                                        <span>WhatsApp: {contactWhatsApp}</span>
                                    </a>

                                    <Link
                                        to="/student/class"
                                        className="block px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] hover:text-white hover:bg-[#1E293B] border-t border-gray-800 transition-colors"
                                        onClick={() => setQuoteMenuOpen(false)}
                                    >
                                        Ir al catálogo de clases
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="min-h-[300px] flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-[#121821] border border-red-500/20 rounded-[2rem] p-10 text-center text-red-300">
                            {error}
                        </div>
                    ) : clases.length === 0 ? (
                        <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-10 text-center text-[#9CA3AF]">
                            Aun no tienes clases registradas.
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clases.map((c) => (
                            <div key={c.id} className="bg-[#121821] border border-gray-800 rounded-[2rem] p-6 shadow-xl hover:border-gray-700 transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1 group-hover:text-[#3b82f6] transition-colors">{c.nombre}</h3>
                                            <p className="text-sm font-medium text-[#9CA3AF]">Instructor: <span className="text-white">{c.instructor}</span></p>
                                        </div>
                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                            {c.nivel}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-3 text-[#9CA3AF]">
                                            <MapPin size={18} className="text-[#3b82f6]" />
                                            <div>
                                                <p className="text-xs uppercase font-bold tracking-wider">Ubicación</p>
                                                <p className="text-sm text-white font-medium">{c.ubicacion} - {c.direccion}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[#9CA3AF]">
                                            <Clock size={18} className="text-[#3b82f6]" />
                                            <div>
                                                <p className="text-xs uppercase font-bold tracking-wider">Horario</p>
                                                <p className="text-sm text-white font-medium">{c.dia} • {c.hora}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openView(c)}
                                    className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl py-3 px-4 font-black uppercase tracking-widest text-xs hover:bg-[#3b82f6]/10 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye size={16} /> Ver Detalles
                                </button>
                            </div>
                        ))}
                    </div>
                    )}
                </div>

                <AnimatePresence>
                    {modalOpen && selected && (
                        <ModalWrapper onClose={closeModal}>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">
                                            {selected.nombre}
                                        </h3>
                                        <p className="text-gray-500 font-medium">Instructor: {selected.instructor}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest">
                                        {selected.nivel}
                                    </span>
                                </div>

                                <div className="space-y-6 mb-8 text-sm">
                                    <p className="text-gray-600 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                                        "{selected.descripcion}"
                                    </p>

                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <MapPin className="text-blue-500" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Lugar</p>
                                                <p className="font-semibold text-gray-900">{selected.ubicacion}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{selected.direccion}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Clock className="text-blue-500" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Horario</p>
                                                <p className="font-semibold text-gray-900">{selected.dia}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{selected.hora}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 col-span-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Users className="text-blue-500" size={20} />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 uppercase font-bold tracking-widest text-[10px] mb-1">Tamaño del Grupo</p>
                                                <p className="font-semibold text-gray-900">{selected.cantidadEstudiantes} Estudiantes</p>
                                            </div>
                                        </div>
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
        </StudentLayout>
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

export default MyClasses;
