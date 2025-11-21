import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const routeByRole: Record<string, string> = {
  administrador: "/admin/dashboard",
  estudiante: "/student/setting",
  instructor: "/instructor/setting",
  Usuario: "/home"
}

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        email,
        contrasena: password // backend espera este campo
      }

      const response = await axios.post("http://localhost:3000/api/auth/login", payload)
      const usuario = response.data.user

      // Guardamos usuario en localStorage
      localStorage.setItem("user", JSON.stringify(usuario))

      // Redirigimos según el rol
      const destination = routeByRole[usuario.rol] || "/home"
      navigate(destination, { replace: true })
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.response?.data?.message) setError(err.response.data.message)
      else setError("Error al conectarse al servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">

          {/* Sección de ilustración */}
          <div className="lg:w-1/2 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-transparent"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4">inicia sesion</h2>
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

          {/* Formulario */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-50">
            <div className="max-w-md mx-auto w-full">
              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo aquí"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {error && (
                  <div>
                    <p className="text-red-600">{error}</p>
                    <Link
                      to="/recover"
                      className="block mt-2 text-sm text-blue-700 hover:text-blue-900 underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${loading ? "opacity-70 cursor-wait" : "hover:bg-red-600"} bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`}
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </button>

                <p className="text-slate-600 mb-8 text-center">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" className="text-blue-800 hover:text-red-600 font-medium transition-colors">
                    Regístrate
                  </Link>
                </p>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login
