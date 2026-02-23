

import React, { useState, useEffect } from "react";
import axios from "axios";
import { UsersLayout } from "../layout/UsersLayout";

const UsersPreinscriptions = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [hasEnfermedad, setHasEnfermedad] = useState("no");
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    enfermedad: "",
    nivel_experiencia: "",
    edad: "",
    id_acudiente: null,
    tipo_preinscripcion: "PROPIA", // Valores: 'PROPIA' | 'TERCERO'
    datos_tercero: {
      nombre_completo: "",
      email: "",
      fecha_nacimiento: ""
    },
    nuevoAcudiente: {
      nombre_acudiente: "",
      telefono: "",
      email: "",
      relacion: ""
    }
  });

  const isMinor = formData.edad !== "" && Number(formData.edad) < 18;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // ✅ Modo desarrollo: usar usuario simulado si no hay token
          console.warn("No token found. Using mock user for development.");
          setCurrentUser({
            id_usuario: 999,
            nombre_completo: "Usuario de Prueba",
            email: "prueba@ejemplo.com"
          });
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error cargando usuario:", err);

        // ✅ Si estás en desarrollo y el endpoint falla, usar usuario simulado
        if (err.response?.status === 404) {
          console.warn("Endpoint /api/auth/me not found. Using mock user for development.");
          setCurrentUser({
            id_usuario: 999,
            nombre_completo: "Usuario de Prueba (Simulado)",
            email: "mock@ejemplo.com"
          });
          setLoading(false);
          return;
        }

        setError("Error al cargar tus datos. Por favor inicia sesión.");
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!currentUser) {
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

      // Validar acudiente solo si es PROPIA y es menor de edad
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
    try {
      const edadNum = parseInt(formData.edad);
      const payload = {
        id_usuario: currentUser.id_usuario,
        enfermedad: hasEnfermedad === "si" ? formData.enfermedad : "No aplica",
        nivel_experiencia: formData.nivel_experiencia,
        edad: edadNum,
        id_acudiente: null,
        tipo_preinscripcion: formData.tipo_preinscripcion,
        // Solo enviar datos_tercero si es TERCERO
        ...(formData.tipo_preinscripcion === 'TERCERO' && {
          datos_tercero: formData.datos_tercero
        }),
        // Solo enviar nuevoAcudiente si es PROPIA y es Menor
        ...(formData.tipo_preinscripcion === 'PROPIA' && edadNum < 18 && {
          nuevoAcudiente: formData.nuevoAcudiente
        })
      };

      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post("http://localhost:3000/api/preinscripciones", payload, config);

      if (response.status === 201) {
        // Verificar si la respuesta trae credenciales
        if (response.data.credenciales) {
          setFormData(prev => ({ ...prev, credenciales: response.data.credenciales }));
        }
        setShowConfirm(false);
        setShowFinal(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error creando preinscripción:", err);
      setError(err.response?.data?.mensaje || "Error al crear preinscripción");
    }
  };

  if (loading) {
    return (
      <UsersLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando tus datos...</p>
          </div>
        </div>
      </UsersLayout>
    );
  }

  return (
    <UsersLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 pt-24">
        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            {/* <div className="text-sm text-red-600 text-center">{error}</div> */}
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">¡Bienvenido a Performace-SB!</h3>
              <p className="text-gray-600 mt-2">Tu camino hacia el aprendizaje comienza aquí.</p>
            </div>

            <div className="w-full h-64 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">

              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7l10 5 10-5M2 12v5c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5M2 17v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2M12 11v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="lg:w-1/2">
            {!showConfirm && !showFinal ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-center text-3xl font-bold text-gray-900 mb-6">
                  Preinscripción
                </h2>

                {/* Selector de Tipo de Preinscripción */}
                <div className="mb-8 flex justify-center">
                  <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    <button
                      type="button"
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.tipo_preinscripcion === 'PROPIA'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, tipo_preinscripcion: 'PROPIA' }))}
                    >
                      Para mí
                    </button>
                    <button
                      type="button"
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.tipo_preinscripcion === 'TERCERO'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, tipo_preinscripcion: 'TERCERO' }))}
                    >
                      Para otra persona
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>

                  {/* Campos específicos si es para TERCERO */}
                  {formData.tipo_preinscripcion === 'TERCERO' && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4">Datos del Estudiante</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo:</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            value={formData.datos_tercero?.nombre_completo || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              datos_tercero: { ...prev.datos_tercero, nombre_completo: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            value={formData.datos_tercero?.email || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              datos_tercero: { ...prev.datos_tercero, email: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Nacimiento:</label>
                          <input
                            type="date"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            value={formData.datos_tercero?.fecha_nacimiento || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              datos_tercero: { ...prev.datos_tercero, fecha_nacimiento: e.target.value }
                            }))}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="nivel_experiencia"
                      >
                        Nivel de experiencia:
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="edad"
                      >
                        Edad:
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Tienes alguna enfermedad o condición médica?
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="enfermedad"
                      >
                        Enfermedad o condición médica:
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        id="enfermedad"
                        value={formData.enfermedad}
                        onChange={(e) => setFormData(prev => ({ ...prev, enfermedad: e.target.value }))}
                        placeholder="Ej: Alergia a frutos secos, asma, etc."
                        rows="3"
                        required
                      />
                    </div>
                  )}

                  {/* Solo mostrar Acudiente si es PROPIA y es Menor (lógica original) */}
                  {/* Si es TERCERO, el acudiente ES el usuario logueado automáticamente */}
                  {formData.tipo_preinscripcion === 'PROPIA' && isMinor && (
                    <div className="mt-8 p-6 rounded-xl border-t-4 border-yellow-500 bg-yellow-50">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-4 text-center">
                        ⚠️ Información del Acudiente
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            htmlFor="nombre_acudiente"
                          >
                            Nombre del acudiente:
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                              className="block text-sm font-medium text-gray-700 mb-2"
                              htmlFor="telefono"
                            >
                              Teléfono:
                            </label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                              className="block text-sm font-medium text-gray-700 mb-2"
                              htmlFor="email"
                            >
                              Email:
                            </label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                            className="block text-sm font-medium text-gray-700 mb-2"
                            htmlFor="relacion"
                          >
                            Relación con el estudiante:
                          </label>
                          <select
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                    >
                      Siguiente
                    </button>
                  </div>
                </form>
              </div>
            ) : showConfirm ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex flex-col items-center mb-6">
                  <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
                    Confirma tus datos
                  </h2>
                  <p className="text-center text-gray-500">
                    Revisa que toda la información esté correcta antes de continuar.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 text-red-600 text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
                    <h3 className="text-base font-semibold text-blue-700 mb-3 border-b border-blue-100 pb-2">
                      Datos del estudiante
                    </h3>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium text-gray-900">
                          {formData.tipo_preinscripcion === 'TERCERO'
                            ? formData.datos_tercero?.nombre_completo
                            : currentUser?.nombre_completo}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Nivel de experiencia:</span>
                        <span className="font-medium text-gray-900">{formData.nivel_experiencia}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Edad:</span>
                        <span className="font-medium text-gray-900">{formData.edad}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Enfermedad:</span>
                        <span className="font-medium text-gray-900">
                          {hasEnfermedad === "si" ? formData.enfermedad : "No aplica"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.tipo_preinscripcion === 'PROPIA' && isMinor && formData.nuevoAcudiente.nombre_acudiente && (
                    <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
                      <h3 className="text-base font-semibold text-blue-700 mb-3 border-b border-blue-100 pb-2">
                        Datos del acudiente
                      </h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Nombre:</span>
                          <span className="font-medium text-gray-900">{formData.nuevoAcudiente.nombre_acudiente}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Teléfono:</span>
                          <span className="font-medium text-gray-900">{formData.nuevoAcudiente.telefono}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">{formData.nuevoAcudiente.email}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Relación:</span>
                          <span className="font-medium text-gray-900">{formData.nuevoAcudiente.relacion}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between w-full mt-8 space-x-4">
                  <button
                    type="button"
                    className="flex-1 bg-white border border-red-600 text-red-600 font-semibold py-3 px-4 rounded-lg shadow hover:bg-red-50 transition"
                    onClick={() => setShowConfirm(false)}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow transition"
                    onClick={handleConfirm}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-green-100 rounded-full p-4 mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.15" />
                      <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
                    Preinscripción recibida
                  </h2>
                  <p className="text-center text-gray-500">
                    Hemos recibido tu solicitud de preinscripción.<br />
                    Nuestro equipo revisará tu información y te contactará pronto.
                  </p>

                  {/* Mostrar mensaje de activación si es tercero */}
                  {formData.tipo_preinscripcion === 'TERCERO' && (
                    <div className="mt-6 w-full bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-blue-800 font-bold text-lg mb-2 text-center">¡Preinscripción Exitosa!</h4>
                      <p className="text-sm text-gray-700 mb-4 text-center">
                        Se ha enviado un correo electrónico a <span className="font-bold">{formData.datos_tercero.email}</span> con las instrucciones para activar la cuenta.
                      </p>
                      <p className="mt-4 text-xs text-blue-600 text-center font-medium">
                        Por favor revisa tu bandeja de entrada (y spam) para continuar.
                      </p>
                    </div>
                  )}

                </div>
                <div className="flex justify-center mt-8">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition"
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
    </UsersLayout>
  );
};

export default UsersPreinscriptions;

