import React, { useState } from "react"
import { Layout } from "../layout/Layout"


const Preinscriptions = () => {
  const [edad, setEdad] = useState("")
  const isMinor = edad !== "" && Number(edad) < 18
  const [showConfirm, setShowConfirm] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [selectedEnfermedad, setSelectedEnfermedad] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("CC")
  const [hasEnfermedad, setHasEnfermedad] = useState("no")

  // 'formData' contiene todos los datos del formulario y es usado en los modales.
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nivel_experiencia: "",
    edad: "",
    id_enfermedades: "",
    OtraEnfermedad: "",
    // acudiente fields (if minor)
    nombreAcudiente: "",
    apellidoAcudiente: "",
    edadAcudiente: "",
    documentoAcudiente: "",
    telefonoAcudiente: "",
  })

  return (
    <Layout>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
  
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Preinscripción
          </h2>
          <form
            onSubmit={e => {
              e.preventDefault()
              const fd = new FormData(e.target)
              setFormData(prev => ({
                ...prev,
                tipoDocumento: fd.get("tipoDocumento"),
                documento: fd.get("documento"),
                nivel_experiencia: fd.get("nivel_experiencia"),
                edad: fd.get("edad"),
                id_enfermedades: fd.get("id_enfermedades"),
                OtraEnfermedad: fd.get("OtraEnfermedad"),
                ...(isMinor && {
                  nombreAcudiente: fd.get("nombreAcudiente"),
                  apellidoAcudiente: fd.get("apellidoAcudiente"),
                  edadAcudiente: fd.get("edadAcudiente"),
                  documentoAcudiente: fd.get("documentoAcudiente"),
                  telefonoAcudiente: fd.get("telefonoAcudiente"),
                }),
              }))
              setShowConfirm(true)
            }}
          >
            {/* Tipo de documento */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="tipoDocumento"
              >
                Tipo de documento:
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="tipoDocumento"
                name="tipoDocumento"
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                required
              >
                <option value="CC">Cédula de ciudadanía</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="PAS">Pasaporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
        
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="documento"
              >
                Documento:
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="documento"
                name="documento"
                type="text"
                required
              />
            </div>
          
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="nivel_experiencia"
              >
                Nivel de experiencia:
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="nivel_experiencia"
                name="nivel_experiencia"
                required
              >
                <option value="">Selecciona tu nivel</option>
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Experto">Experto</option>
              </select>
            </div>
          
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="edad"
              >
                Edad:
              </label>
              <input
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="edad"
                name="edad"
                type="number"
                min="1"
                required
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Posees alguna enfermedad que pueda impedir tu aprendizaje dentro de
                Performans SB?
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hasEnfermedad}
                onChange={e => {
                  setHasEnfermedad(e.target.value)
                  if (e.target.value === "no") setSelectedEnfermedad("")
                }}
                required
              >
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>
          
            {hasEnfermedad === "si" && (
              <>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="id_enfermedades"
                  >
                    Enfermedad que pueda dificultar el aprendizaje:
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="id_enfermedades"
                    name="id_enfermedades"
                    value={selectedEnfermedad}
                    onChange={(e) => setSelectedEnfermedad(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Motora">Motora</option>
                    <option value="Física">Física</option>
                    <option value="Mental">Mental</option>
                    <option value="Visual">Visual</option>
                    <option value="Auditiva">Auditiva</option>
                    <option value="Otro">Otra</option>
                  </select>
                </div>
                {selectedEnfermedad === "Otro" && (
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="OtraEnfermedad"
                    >
                      Escribe la enfermedad:
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="OtraEnfermedad"
                      name="OtraEnfermedad"
                      type="text"
                      required
                    />
                  </div>
                )}
              </>
            )}

        
            {isMinor && (
              <div className="mt-8 p-4 rounded-lg border border-blue-200 bg-blue-50">
                <h3 className="text-lg font-semibold text-red-700 mb-4 text-center">
                  Info Personal del acudiente
                </h3>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="nombreAcudiente"
                  >
                    Nombre del acudiente:
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                    id="nombreAcudiente"
                    name="nombreAcudiente"
                    type="text"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="apellidoAcudiente"
                  >
                    Apellido del acudiente:
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="apellidoAcudiente"
                    name="apellidoAcudiente"
                    type="text"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="edadAcudiente"
                  >
                    Edad del acudiente:
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="edadAcudiente"
                    name="edadAcudiente"
                    type="number"
                    min="18"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="documentoAcudiente"
                  >
                    Documento del acudiente:
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="documentoAcudiente"
                    name="documentoAcudiente"
                    type="text"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="telefonoAcudiente"
                  >
                    Teléfono del acudiente:
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="telefonoAcudiente"
                    name="telefonoAcudiente"
                    type="tel"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
              >
                Siguiente
              </button>
            </div>
          </form>
        </div>

        {/* Modal Confirmación */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 px-8 py-10 flex flex-col items-center overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-100 rounded-full p-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#3b82f6" opacity="0.12"/>
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
                Confirma tus datos
              </h2>
              <p className="text-center text-gray-500 mb-6">
                Revisa que toda la información esté correcta antes de continuar.
              </p>
              <div className="w-full flex flex-col gap-6">
                <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
                  <h3 className="text-base font-semibold text-blue-700 mb-3 border-b border-blue-100 pb-2">Datos personales</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Documento:</span>
                      <span className="font-medium text-gray-900">{formData.documento}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Nivel de experiencia:</span>
                      <span className="font-medium text-gray-900">{formData.nivel_experiencia}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium text-gray-900">{formData.edad}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Enfermedad:</span>
                      <span className="font-medium text-gray-900">{formData.id_enfermedades}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Otra Enfermedad:</span>
                      <span className="font-medium text-gray-900">{formData.OtraEnfermedad}</span>
                    </div>
                  </div>
                </div>
                {isMinor && (
                  <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
                    <h3 className="text-base font-semibold text-blue-700 mb-3 border-b border-blue-100 pb-2">Datos del acudiente</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium text-gray-900">{formData.nombreAcudiente}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Apellido:</span>
                        <span className="font-medium text-gray-900">{formData.apellidoAcudiente}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Edad:</span>
                        <span className="font-medium text-gray-900">{formData.edadAcudiente}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Documento:</span>
                        <span className="font-medium text-gray-900">{formData.documentoAcudiente}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium text-gray-900">{formData.telefonoAcudiente}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between w-full mt-8">
                <button
                  type="button"
                  className="bg-white border border-red-600 text-red-600 px-8 py-2 rounded-lg font-semibold shadow hover:bg-red-50 transition"
                  onClick={() => setShowConfirm(false)}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                  onClick={() => {
                    setShowConfirm(false)
                    setShowFinal(true)
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        
        {showFinal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 p-10 flex flex-col items-center">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mb-4">
                <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.15"/>
                <path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <h2 className="text-center text-2xl font-bold text-gray-900 mb-4">
                Preinscripción recibida
              </h2>
              <p className="text-center text-gray-700 mb-8">
                Hemos recibido tu solicitud de preinscripción.<br />
                Nuestro equipo revisará tu información y te contactará pronto para confirmar los detalles y completar el proceso de inscripción.
              </p>
              <button
                className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
                onClick={() => window.location.href = "/"}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>

  )
}

export default Preinscriptions