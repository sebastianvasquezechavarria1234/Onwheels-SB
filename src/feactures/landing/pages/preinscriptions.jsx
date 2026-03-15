import React, { useState, useEffect } from "react";
import { Layout } from "../layout/Layout";
import api from "../../../services/api"
// Importamos la instancia de API (con interceptores)
import { crearPreinscripcion } from "../../dashboards/admin/pages/services/preinscripcionesService";

const Preinscriptions = () => {
    const [edad, setEdad] = useState("");
    const isMinor = edad !== "" && Number(edad) < 18;
    const [showConfirm, setShowConfirm] = useState(false);
    const [showFinal, setShowFinal] = useState(false);
    const [hasEnfermedad, setHasEnfermedad] = useState("no");
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Datos del formulario (campos de ESTUDIANTES)
    const [formData, setFormData] = useState({
        nombre_completo: "",
        email: "",
        fecha_nacimiento: "",
        enfermedad: "",
        nivel_experiencia: "",
        edad: "",
        id_acudiente: null,
        // Datos del acudiente (si es menor y se crea nuevo)
        nuevoAcudiente: {
            nombre_acudiente: "",
            telefono: "",
            email: "",
            relacion: ""
        }
    });

    // Cargar datos del usuario logueado
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Usamos la instancia api que ya inyecta el token
                const response = await api.get("/auth/me");
                setCurrentUser(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error cargando usuario:", err);
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validar datos básicos para invitados
            if (!currentUser) {
                if (!formData.nombre_completo || !formData.email || !formData.fecha_nacimiento) {
                    setError("Por favor completa tus datos básicos (Nombre, Email y Fecha de Nacimiento)");
                    return;
                }
            }

            if (!formData.nivel_experiencia) {
                setError("Debes seleccionar tu nivel de experiencia");
                return;
            }

            if (!formData.edad || formData.edad < 1) {
                setError("Debes ingresar una edad válida");
                return;
            }

            // Preparar payload para el backend
            const payload = {
                // Si es invitado, usamos la lógica de TERCERO pero sin id_usuario de origen (el backend creará el registro)
                // O mejor aún, si el backend está diseñado para recibir nombre/email directamente
                ...(currentUser ? { id_usuario: currentUser.id_usuario } : {
                    tipo_preinscripcion: 'TERCERO_INVITADO', // Flag para identificar que es un invitado
                    datos_tercero: {
                        nombre_completo: formData.nombre_completo,
                        email: formData.email,
                        fecha_nacimiento: formData.fecha_nacimiento
                    }
                }),
                enfermedad: hasEnfermedad === "si" ? formData.enfermedad : "No aplica",
                nivel_experiencia: formData.nivel_experiencia,
                edad: parseInt(formData.edad),
                id_acudiente: formData.id_acudiente,
                nuevoAcudiente: isMinor ? formData.nuevoAcudiente : null
            };

            // Guardar en el estado para confirmación (mezclamos con lo existente para no perder datos de UI)
            setFormData(prev => ({ ...prev, ...payload }));
            setShowConfirm(true);
        } catch (err) {
            console.error("Error en validación:", err);
            setError("Error al procesar el formulario");
        }
    };

    const handleConfirm = async () => {
        try {
            // Usamos el servicio centralizado
            await crearPreinscripcion(formData);

            setShowConfirm(false);
            setShowFinal(true);
        } catch (err) {
            console.error("Error creando preinscripción:", err);
            setError(err.response?.data?.mensaje || "Error al crear preinscripción");
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-blue)] mx-auto"></div>
                        <p className="mt-4 text-zinc-400">Cargando tus datos...</p>
                    </div>
                </div>
            </Layout>
        );
    }

// Eliminamos el return de error mandatorio para permitir modo invitado

    return (
        <Layout>
            {/* Contenedor principal con padding superior para no pegarse al navbar */}
            <div className="py-10 px-4 sm:px-6 lg:px-8 pt-36 bg-zinc-950 min-h-screen">
                {/* Contenedor de las dos mitades */}
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                    {/* Mitad Izquierda: Imagen / Branding */}
                    <div className="lg:w-1/2 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center justify-center">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white">¡Bienvenido a Performace-SB!</h3>
                            <p className="text-zinc-400 mt-2">Tu camino hacia el aprendizaje comienza aquí.</p>
                            {currentUser && (
                                <div className="mt-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                                    <p className="text-sm font-medium text-zinc-300">
                                        Preinscribiendo como: <span className="text-[var(--color-blue)] font-bold">{currentUser.nombre_completo}</span>
                                    </p>
                                    <p className="text-xs text-zinc-500">{currentUser.email}</p>
                                </div>
                            )}
                        </div>
                        {/* Aquí puedes poner una imagen de tu marca o un icono */}
                        <div className="w-full h-64 bg-gradient-to-br from-[var(--color-blue)] to-cyan-900 rounded-2xl flex items-center justify-center border border-zinc-700">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path d="M12 2L2 7l10 5 10-5M2 12v5c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5M2 17v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2M12 11v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Mitad Derecha: Formulario */}
                    <div className="lg:w-1/2">
                        {!showConfirm && !showFinal ? (
                            <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl">
                                <h2 className="text-center text-3xl font-bold text-white mb-6">
                                    Preinscripción
                                </h2>

                                <form onSubmit={handleSubmit}>
                                    {/* SECCIÓN DATOS BÁSICOS (Solo invitados) */}
                                    {!currentUser && (
                                        <div className="mb-8 p-6 bg-zinc-800/30 rounded-2xl border border-zinc-700">
                                            <h3 className="text-lg font-semibold text-white mb-4">Tus Datos Personales</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre Completo:</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                        value={formData.nombre_completo}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, nombre_completo: e.target.value }))}
                                                        placeholder="Juan Pérez"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Email:</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                        placeholder="juan@ejemplo.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-400 mb-2">Fecha Nacimiento:</label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                        value={formData.fecha_nacimiento}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Grid de dos columnas para los campos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Campo: Nivel de experiencia */}
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-zinc-400 mb-2"
                                                htmlFor="nivel_experiencia"
                                            >
                                                Nivel de experiencia:
                                            </label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition [&>option]:bg-zinc-800 [&>option]:text-white"
                                                id="nivel_experiencia"
                                                value={formData.nivel_experiencia}
                                                onChange={(e) => setFormData(prev => ({ ...prev, nivel_experiencia: e.target.value }))}
                                                required
                                            >
                                                <option value="">Selecciona tu nivel</option>
                                                <option value="Principiante">Principiante</option>
                                                <option value="Intermedio">Intermedio</option>
                                                <option value="Avanzado">Avanzado</option>
                                            </select>
                                        </div>

                                        {/* Campo: Edad */}
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-zinc-400 mb-2"
                                                htmlFor="edad"
                                            >
                                                Edad:
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                id="edad"
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={edad}
                                                onChange={(e) => {
                                                    setEdad(e.target.value);
                                                    setFormData(prev => ({ ...prev, edad: e.target.value }));
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Sección: Enfermedad */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                                            ¿Tienes alguna enfermedad o condición médica?
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition [&>option]:bg-zinc-800 [&>option]:text-white"
                                            value={hasEnfermedad}
                                            onChange={(e) => setHasEnfermedad(e.target.value)}
                                            required
                                        >
                                            <option value="no">No</option>
                                            <option value="si">Sí</option>
                                        </select>
                                    </div>

                                    {hasEnfermedad === "si" && (
                                        <div className="mb-6">
                                            <label
                                                className="block text-sm font-medium text-zinc-400 mb-2"
                                                htmlFor="enfermedad"
                                            >
                                                Enfermedad o condición médica:
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                id="enfermedad"
                                                value={formData.enfermedad}
                                                onChange={(e) => setFormData(prev => ({ ...prev, enfermedad: e.target.value }))}
                                                placeholder="Ej: Alergia a frutos secos, asma, etc."
                                                rows="3"
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* Sección: Acudiente (solo si es menor de edad) */}
                                    {isMinor && (
                                        <div className="mt-8 p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                                            <h3 className="text-lg font-semibold text-amber-400 mb-4 text-center">
                                                ⚠️ Información del Acudiente
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        className="block text-sm font-medium text-zinc-400 mb-2"
                                                        htmlFor="nombre_acudiente"
                                                    >
                                                        Nombre del acudiente:
                                                    </label>
                                                    <input
                                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                        id="nombre_acudiente"
                                                        type="text"
                                                        value={formData.nuevoAcudiente.nombre_acudiente}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            nuevoAcudiente: {
                                                                ...prev.nuevoAcudiente,
                                                                nombre_acudiente: e.target.value
                                                            }
                                                        }))}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-zinc-400 mb-2"
                                                            htmlFor="telefono"
                                                        >
                                                            Teléfono:
                                                        </label>
                                                        <input
                                                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                            id="telefono"
                                                            type="text"
                                                            value={formData.nuevoAcudiente.telefono}
                                                            onChange={(e) => setFormData(prev => ({
                                                                ...prev,
                                                                nuevoAcudiente: {
                                                                    ...prev.nuevoAcudiente,
                                                                    telefono: e.target.value
                                                                }
                                                            }))}
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium text-zinc-400 mb-2"
                                                            htmlFor="email"
                                                        >
                                                            Email:
                                                        </label>
                                                        <input
                                                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                                            id="email"
                                                            type="email"
                                                            value={formData.nuevoAcudiente.email}
                                                            onChange={(e) => setFormData(prev => ({
                                                                ...prev,
                                                                nuevoAcudiente: {
                                                                    ...prev.nuevoAcudiente,
                                                                    email: e.target.value
                                                                }
                                                            }))}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        className="block text-sm font-medium text-zinc-400 mb-2"
                                                        htmlFor="relacion"
                                                    >
                                                        Relación con el estudiante:
                                                    </label>
                                                    <select
                                                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition [&>option]:bg-zinc-800 [&>option]:text-white"
                                                        id="relacion"
                                                        value={formData.nuevoAcudiente.relacion}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            nuevoAcudiente: {
                                                                ...prev.nuevoAcudiente,
                                                                relacion: e.target.value
                                                            }
                                                        }))}
                                                        required
                                                    >
                                                        <option value="">Seleccionar relación</option>
                                                        <option value="Padre">Padre</option>
                                                        <option value="Madre">Madre</option>
                                                        <option value="Tutor">Tutor</option>
                                                        <option value="Otro">Otro</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botón Submit */}
                                    <div className="flex justify-end mt-8">
                                        <button
                                            type="submit"
                                            className="bg-white text-black font-bold py-3 px-8 rounded-full shadow-md transition duration-200 transform hover:scale-105 hover:bg-[var(--color-blue)] hover:text-white uppercase tracking-wider text-sm"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : showConfirm ? (
                            // Modal de confirmación
                            <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl">
                                <div className="flex flex-col items-center mb-6">
                                    <h2 className="text-center text-2xl font-bold text-white mb-2">
                                        Confirma tus datos
                                    </h2>
                                    <p className="text-center text-zinc-400">
                                        Revisa que toda la información esté correcta antes de continuar.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50">
                                        <h3 className="text-base font-semibold text-[var(--color-blue)] mb-3 border-b border-zinc-800 pb-2 text-white">
                                            Datos del estudiante
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex justify-between py-2 border-b border-zinc-800/30">
                                                <span className="text-zinc-500">Nombre:</span>
                                                <span className="font-medium text-white">
                                                    {currentUser
                                                        ? (currentUser.nombre_completo || currentUser.nombre || "Usuario")
                                                        : formData.nombre_completo}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-zinc-800/30">
                                                <span className="text-zinc-500">Nivel de experiencia:</span>
                                                <span className="font-medium text-white">{formData.nivel_experiencia}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-zinc-800/30">
                                                <span className="text-zinc-500">Edad:</span>
                                                <span className="font-medium text-white">{formData.edad}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-zinc-500">Enfermedad:</span>
                                                <span className="font-medium text-white">
                                                    {hasEnfermedad === "si" ? formData.enfermedad : "No aplica"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isMinor && formData.nuevoAcudiente.nombre_acudiente && (
                                        <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50">
                                            <h3 className="text-base font-semibold text-amber-400 mb-3 border-b border-zinc-800 pb-2">
                                                Datos del acudiente
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                <div className="flex justify-between py-2 border-b border-zinc-800/30">
                                                    <span className="text-zinc-500">Nombre:</span>
                                                    <span className="font-medium text-white">{formData.nuevoAcudiente.nombre_acudiente}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-zinc-800/30">
                                                    <span className="text-zinc-500">Teléfono:</span>
                                                    <span className="font-medium text-white">{formData.nuevoAcudiente.telefono}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-zinc-800/30">
                                                    <span className="text-zinc-500">Email:</span>
                                                    <span className="font-medium text-white">{formData.nuevoAcudiente.email}</span>
                                                </div>
                                                <div className="flex justify-between py-2">
                                                    <span className="text-zinc-500">Relación:</span>
                                                    <span className="font-medium text-white">{formData.nuevoAcudiente.relacion}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between w-full mt-8 space-x-4">
                                    <button
                                        type="button"
                                        className="flex-1 border border-zinc-600 text-zinc-400 font-bold py-3 px-4 rounded-full hover:border-zinc-400 hover:text-white transition-all"
                                        onClick={() => setShowConfirm(false)}
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-full hover:bg-[var(--color-blue)] hover:text-white transition-all uppercase tracking-wider text-sm"
                                        onClick={handleConfirm}
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Éxito
                            <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="bg-green-500/10 rounded-full p-4 mb-4 border border-green-500/20">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.15" />
                                            <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        </svg>
                                    </div>
                                    <h2 className="text-center text-2xl font-bold text-white mb-2">
                                        Preinscripción recibida
                                    </h2>
                                    <p className="text-center text-zinc-400">
                                        Hemos recibido tu solicitud de preinscripción.<br />
                                        Nuestro equipo revisará tu información y te contactará pronto.
                                    </p>
                                </div>
                                <div className="flex justify-center mt-8">
                                    <button
                                        className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-[var(--color-blue)] hover:text-white transition-all uppercase tracking-wider text-sm"
                                        onClick={() => window.location.href = "/"}
                                    >
                                        Volver al inicio
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Preinscriptions;
