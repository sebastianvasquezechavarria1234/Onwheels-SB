import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({ passwordMatch: "" })
  const [serverMsg, setServerMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // VALIDACIÓN EN TIEMPO REAL
    if (name === "password" || name === "confirmPassword") {
      if (name === "password" && formData.confirmPassword !== "") {
        setErrors({
          passwordMatch: value !== formData.confirmPassword ? "Las contraseñas no coinciden" : ""
        })
      } else if (name === "confirmPassword") {
        setErrors({
          passwordMatch: value !== formData.password ? "Las contraseñas no coinciden" : ""
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerMsg(null)

    if (formData.password !== formData.confirmPassword) {
      setErrors({ passwordMatch: "Las contraseñas no coinciden" })
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        nombre: formData.fullName,
        email: formData.email,
        telefono: formData.phone || null,
        contrasena: formData.password, // backend espera este campo
      }

      // Apuntando al endpoint correcto
      const res = await axios.post("http://localhost:3000/api/auth/register", payload)

      setServerMsg(res.data.message || "Registro exitoso")
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      })
      setErrors({ passwordMatch: "" })

      navigate("/login")
    } catch (err: any) {
      console.error("Error al registrar usuario:", err)
      if (err.response?.data?.message) setServerMsg(err.response.data.message)
      else setServerMsg("No se pudo conectar con el servidor")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[700px]">

          {/* FORMULARIO */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-50">
            <div className="max-w-md mx-auto w-full">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Correo
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Ingresa tu correo"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Número"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                    required
                  />
                  {errors.passwordMatch && (
                    <p className="text-red-600 text-sm mt-1">{errors.passwordMatch}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl mt-6 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Registrando..." : "Registrarse"}
                </button>

                {serverMsg && (
                  <p className="text-center mt-2 text-sm text-gray-700">{serverMsg}</p>
                )}

                <p className="text-slate-600 text-center mb-8 mt-4">
                  ¿Ya tienes una cuenta?{" "}
                  <Link to="/login" className="text-blue-800 hover:text-red-600 font-medium">
                    Iniciar sesión
                  </Link>
                </p>

              </form>
            </div>
          </div>

          {/* Imagen derecha */}
          <div className="lg:w-1/2 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-transparent"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4">Registrate</h2>

              <div className="w-80 h-80 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-slate-700 rounded-2xl shadow-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-700 rounded-lg"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register
