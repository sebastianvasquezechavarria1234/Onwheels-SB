import React, { useState, useEffect } from "react";
import { StudentLayout } from "../layout/StudentLayout";
import api from "../../../../services/api";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { User, Users, Check } from "lucide-react";

const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const StudentPreinscriptions = () => {
  const { user } = useAuth();
  const isUserMinor = calculateAge(user?.fecha_nacimiento) < 18;

  const [showConfirm, setShowConfirm] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [hasEnfermedad, setHasEnfermedad] = useState("no");
  const [loading, setLoading] = useState(false); // Changed to false as we use context user
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    enfermedad: "",
    nivel_experiencia: "",
    edad: "",
    id_acudiente: null,
    tipo_preinscripcion: "PROPIA", // Valores: 'PROPIA' | 'TERCERO'
    datos_tercero: {
      nombre_completo: "",
      email: "",
      telefono: "",
      genero: "",
      tipo_documento: "CC",
      documento: ""
    },
    nuevoAcudiente: {
      nombre_acudiente: "",
      telefono: "",
      email: "",
      relacion: ""
    }
  });

  const isMinor = formData.edad !== "" && Number(formData.edad) < 18;

  // We use the user from context, no need for redundant fetch

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        setError("Debes estar logueado para preinscribirte");
        return;
      }
      if (!formData.nivel_experiencia) {
        setError("Debes seleccionar tu nivel de experiencia");
        return;
      }
      const edadNum = parseInt(formData.edad);
      if (!edadNum || edadNum < 1) {
        setError("Debes ingresar una edad válida");
        return;
      }

      if (formData.tipo_preinscripcion === 'TERCERO') {
        const { nombre_completo, email, telefono, genero, documento, tipo_documento } = formData.datos_tercero;
        if (!nombre_completo || !email || !telefono || !genero || !documento || !tipo_documento) {
          setError("Por favor completa todos los datos obligatorios de la persona a preinscribir");
          return;
        }
      }

      if (formData.tipo_preinscripcion === 'PROPIA' && edadNum < 18) {
        const { nombre_acudiente, telefono, email, relacion } = formData.nuevoAcudiente;
        if (!nombre_acudiente || !telefono || !email || !relacion) {
          setError("Por favor completa todos los datos del acudiente");
          return;
        }
      }

      setShowConfirm(true);
      setError(null);
    } catch (err) {
      console.error("Error en validación:", err);
      setError("Error al procesar el formulario");
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const edadNum = parseInt(formData.edad);
      const payload = {
        id_usuario: user.id_usuario,
        enfermedad: hasEnfermedad === "si" ? formData.enfermedad : "No aplica",
        nivel_experiencia: formData.nivel_experiencia,
        edad: edadNum,
        id_acudiente: null,
        tipo_preinscripcion: formData.tipo_preinscripcion,
        ...(formData.tipo_preinscripcion === 'TERCERO' && {
          datos_tercero: formData.datos_tercero
        }),
        ...(edadNum < 18 && {
          nuevoAcudiente: formData.nuevoAcudiente
        })
      };

      const response = await api.post("/preinscripciones", payload);

      if (response.status === 201 || response.status === 200) {
        setShowConfirm(false);
        setShowFinal(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error creando preinscripción:", err);
      let msg = "Error al crear preinscripción";
      if (err.response?.data) {
        msg = err.response.data.mensaje || 
              err.response.data.error || 
              err.response.data.message || 
              (Array.isArray(err.response.data.errors) ? err.response.data.errors.join(", ") : null) ||
              msg;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-blue)] mx-auto"></div>
            <p className="mt-4 text-zinc-400">Cargando tus datos...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 pt-36 bg-zinc-950 min-h-screen">
        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center">
              {error}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white">¡Bienvenido a Performace-SB!</h3>
              <p className="text-zinc-400 mt-2">Tu camino hacia el aprendizaje comienza aquí.</p>
            </div>
            <div className="w-full h-64 bg-linear-to-br from-[var(--color-blue)] to-cyan-900 rounded-2xl flex items-center justify-center border border-zinc-700">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5M2 12v5c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5M2 17v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2M12 11v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="lg:w-1/2">
            {!showConfirm && !showFinal ? (
              <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl">
                <h2 className="text-center text-3xl font-bold text-white mb-6">Preinscripción</h2>
                <div className="mb-8 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, tipo_preinscripcion: 'PROPIA' })}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${formData.tipo_preinscripcion === 'PROPIA'
                                ? 'border-[var(--color-blue)] bg-[var(--color-blue)]/5 ring-2 ring-[var(--color-blue)]/20'
                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-3 rounded-xl ${formData.tipo_preinscripcion === 'PROPIA' ? 'bg-[var(--color-blue)] text-white' : 'bg-zinc-800 text-gray-400 group-hover:bg-zinc-700 group-hover:text-gray-300'}`}>
                                    <User size={24} />
                                </div>
                                {formData.tipo_preinscripcion === 'PROPIA' && (
                                    <div className="w-6 h-6 bg-[var(--color-blue)] rounded-full flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <h4 className={`font-bold text-lg mb-1 ${formData.tipo_preinscripcion === 'PROPIA' ? 'text-white' : 'text-gray-300'}`}>Para mí</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">Inscríbete tú mismo en una de nuestras clases.</p>
                        </button>

                        {!isUserMinor && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, tipo_preinscripcion: 'TERCERO' })}
                                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${formData.tipo_preinscripcion === 'TERCERO'
                                    ? 'border-[var(--color-blue)] bg-[var(--color-blue)]/5 ring-2 ring-[var(--color-blue)]/20'
                                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-3 rounded-xl ${formData.tipo_preinscripcion === 'TERCERO' ? 'bg-[var(--color-blue)] text-white' : 'bg-zinc-800 text-gray-400 group-hover:bg-zinc-700 group-hover:text-gray-300'}`}>
                                        <Users size={24} />
                                    </div>
                                    {formData.tipo_preinscripcion === 'TERCERO' && (
                                        <div className="w-6 h-6 bg-[var(--color-blue)] rounded-full flex items-center justify-center">
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <h4 className={`font-bold text-lg mb-1 ${formData.tipo_preinscripcion === 'TERCERO' ? 'text-white' : 'text-gray-300'}`}>Para otra persona</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">Incribe a un hijo, familiar o amigo.</p>
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {formData.tipo_preinscripcion === 'TERCERO' && (
                    <div className="mb-6 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Datos del Estudiante</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre Completo:</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                            value={formData.datos_tercero?.nombre_completo || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, datos_tercero: { ...prev.datos_tercero, nombre_completo: e.target.value } }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Email:</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                            value={formData.datos_tercero?.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, datos_tercero: { ...prev.datos_tercero, email: e.target.value } }))}
                            placeholder="ejemplo@correo.com"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo Doc:</label>
                            <select
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition [&>option]:bg-zinc-800 [&>option]:text-white"
                              value={formData.datos_tercero?.tipo_documento || 'CC'}
                              onChange={(e) => setFormData(prev => ({ ...prev, datos_tercero: { ...prev.datos_tercero, tipo_documento: e.target.value } }))}
                              required
                            >
                              <option value="CC">CC</option>
                              <option value="TI">TI</option>
                              <option value="CE">CE</option>
                              <option value="PASAPORTE">Pasaporte</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Documento:</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                              value={formData.datos_tercero?.documento || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, datos_tercero: { ...prev.datos_tercero, documento: e.target.value } }))}
                              placeholder="12345678"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Teléfono:</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                            value={formData.datos_tercero?.telefono || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, datos_tercero: { ...prev.datos_tercero, telefono: e.target.value } }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Género:</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition [&>option]:bg-zinc-800 [&>option]:text-white"
                            value={formData.datos_tercero?.genero || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, datos_tercero: { ...prev.datos_tercero, genero: e.target.value } }))}
                            required
                          >
                            <option value="">Seleccionar</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="nivel_experiencia">Nivel de experiencia:</label>
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
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="edad">Edad:</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                        id="edad"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.edad}
                        onChange={(e) => setFormData(prev => ({ ...prev, edad: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">¿Tienes alguna enfermedad o condición médica?</label>
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
                      <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="enfermedad">Enfermedad o condición médica:</label>
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

                  {isMinor && (
                    <div className="mt-8 p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                      <h3 className="text-lg font-semibold text-amber-400 mb-4 text-center">⚠️ Información del Acudiente</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="nombre_acudiente">Nombre del acudiente:</label>
                          <input
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                            id="nombre_acudiente"
                            type="text"
                            value={formData.nuevoAcudiente.nombre_acudiente}
                            onChange={(e) => setFormData(prev => ({ ...prev, nuevoAcudiente: { ...prev.nuevoAcudiente, nombre_acudiente: e.target.value } }))}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="telefono">Teléfono:</label>
                            <input
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                              id="telefono"
                              type="text"
                              value={formData.nuevoAcudiente.telefono}
                              onChange={(e) => setFormData(prev => ({ ...prev, nuevoAcudiente: { ...prev.nuevoAcudiente, telefono: e.target.value } }))}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="email">Email:</label>
                            <input
                              className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                              id="email"
                              type="email"
                              value={formData.nuevoAcudiente.email}
                              onChange={(e) => setFormData(prev => ({ ...prev, nuevoAcudiente: { ...prev.nuevoAcudiente, email: e.target.value } }))}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2" htmlFor="relacion">Relación con el estudiante:</label>
                          <select
                            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition [&>option]:bg-zinc-800 [&>option]:text-white"
                            id="relacion"
                            value={formData.nuevoAcudiente.relacion}
                            onChange={(e) => setFormData(prev => ({ ...prev, nuevoAcudiente: { ...prev.nuevoAcudiente, relacion: e.target.value } }))}
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

                  <div className="flex justify-end mt-8">
                    <button type="submit" className="bg-white text-black font-bold py-3 px-8 rounded-full shadow-md transition duration-200 transform hover:scale-105 hover:bg-[var(--color-blue)] hover:text-white uppercase tracking-wider text-sm">Siguiente</button>
                  </div>
                </form>
              </div>
            ) : showConfirm ? (
              <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl">
                <div className="flex flex-col items-center mb-6">
                  <h2 className="text-center text-2xl font-bold text-white mb-2">Confirma tus datos</h2>
                  <p className="text-center text-zinc-400">Revisa que toda la información esté correcta antes de continuar.</p>
                </div>

                {error && (
                  <div className="mb-4 text-red-400 text-center bg-red-500/10 border border-red-500/20 p-2 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50">
                    <h3 className="text-base font-semibold text-white mb-3 border-b border-zinc-800 pb-2">Datos del estudiante</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-zinc-800/30">
                        <span className="text-zinc-500">Nombre:</span>
                        <span className="font-medium text-white">{formData.tipo_preinscripcion === 'TERCERO' ? formData.datos_tercero?.nombre_completo : (user?.nombre_completo || user?.nombre || "Usuario")}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-zinc-800/30">
                        <span className="text-zinc-500">Email:</span>
                        <span className="font-medium text-white">{formData.tipo_preinscripcion === 'TERCERO' ? formData.datos_tercero?.email : user?.email}</span>
                      </div>
                      {formData.tipo_preinscripcion === 'TERCERO' && (
                        <>
                          <div className="flex justify-between py-2 border-b border-zinc-800/30">
                            <span className="text-zinc-500">Documento:</span>
                            <span className="font-medium text-white">{formData.datos_tercero?.tipo_documento} {formData.datos_tercero?.documento}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-zinc-800/30">
                            <span className="text-zinc-500">Teléfono:</span>
                            <span className="font-medium text-white">{formData.datos_tercero?.telefono}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-zinc-800/30">
                            <span className="text-zinc-500">Género:</span>
                            <span className="font-medium text-white">{formData.datos_tercero?.genero}</span>
                          </div>
                        </>
                      )}
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
                        <span className="font-medium text-white">{hasEnfermedad === "si" ? formData.enfermedad : "No aplica"}</span>
                      </div>
                    </div>
                  </div>

                  {formData.tipo_preinscripcion === 'PROPIA' && isMinor && formData.nuevoAcudiente.nombre_acudiente && (
                    <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-800/50">
                      <h3 className="text-base font-semibold text-amber-400 mb-3 border-b border-zinc-800 pb-2">Datos del acudiente</h3>
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
                  <button type="button" className="flex-1 border border-zinc-600 text-zinc-400 font-bold py-3 px-4 rounded-full hover:border-zinc-400 hover:text-white transition-all" onClick={() => setShowConfirm(false)}>Atrás</button>
                  <button type="button" className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-full hover:bg-[var(--color-blue)] hover:text-white transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2" onClick={handleConfirm} disabled={isSubmitting}>
                    {isSubmitting ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>Enviando...</> : 'Confirmar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl">
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-green-500/10 rounded-full p-4 mb-4 border border-green-500/20">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.15" />
                      <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <h2 className="text-center text-2xl font-bold text-white mb-2">Preinscripción recibida</h2>
                  <p className="text-center text-zinc-400">Hemos recibido tu solicitud de preinscripción.<br />Nuestro equipo revisará tu información y te contactará pronto.</p>
                  {formData.tipo_preinscripcion === 'TERCERO' && (
                    <div className="mt-6 w-full bg-zinc-800/30 border border-zinc-700 rounded-2xl p-6">
                      <h4 className="text-white font-bold text-lg mb-2 text-center">¡Preinscripción Exitosa!</h4>
                      <p className="text-sm text-zinc-300 mb-4 text-center">Se ha enviado un correo electrónico a <span className="font-bold text-white">{formData.datos_tercero.email}</span> con las instrucciones para activar la cuenta.</p>
                      <p className="mt-4 text-xs text-zinc-500 text-center font-medium">Por favor revisa tu bandeja de entrada (y spam) para continuar.</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-8">
                  <button className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-[var(--color-blue)] hover:text-white transition-all uppercase tracking-wider text-sm" onClick={() => window.location.href = "/"}>Volver al inicio</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentPreinscriptions;
