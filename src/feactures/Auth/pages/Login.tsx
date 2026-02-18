// src/features/Auth/pages/Login.tsx
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import api from "../../../services/api"
import { getRoleHomePath } from "../../../utils/roleUtils"
import { getCheckoutPath } from "../../../utils/roleHelpers"
import { useAuth } from "../../dashboards/dinamico/context/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth() // Usar context para login (dispara merge carrito)

  useEffect(() => {
    if (error && formSubmitted) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, formSubmitted])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setFormSubmitted(true)
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/auth/login", {
        email,
        contrasena: password,
      })

      // USAR LOGIN DEL CONTEXTO (Importante: esto dispara evento para merge del carrito)
      login(response.data.token, response.data.user);

      // REDIRECCIÓN INTELIGENTE
      // 1. Check for specific intent (e.g., checkout)
      if (location.state?.intent === 'checkout') {
        const checkoutPath = getCheckoutPath(response.data.user);
        navigate(checkoutPath, { replace: true });
        return;
      }

      // 2. Si viene con estado 'from' (ej: protected route redirect), volver ahí.
      const from = location.state?.from?.pathname || getRoleHomePath();

      // Prevent redirect loop if from is login
      const targetPath = from === "/login" ? getRoleHomePath() : from;

      navigate(targetPath, { replace: true })
    } catch (err: any) {
      console.error("Login error:", err)

      if (err.response) {
        setError(err.response.data.message || "Credenciales incorrectas")
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión a internet")
      } else {
        setError("Error al procesar la solicitud")
      }
    } finally {
      setLoading(false)
      setFormSubmitted(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <button
        onClick={() => navigate("/")}
        className="absolute top-[20px] right-[20px] bg-white w-[60px] h-[60px] rounded-full flex items-center justify-center text-[33px] font-medium transition-all hover:scale-110"
      >
        ×
      </button>

      <div className="w-full max-w-6xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Ilustración */}
          <div className="lg:w-1/2 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-transparent"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4">Inicia sesión</h2>

              <div className="w-80 h-80 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full opacity-20"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-slate-700 rounded-2xl shadow-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-700 rounded-lg"></div>
                  </div>
                </div>

                <div className="absolute top-20 right-20 w-8 h-8 bg-white rounded opacity-80"></div>
                <div className="absolute bottom-20 left-20 w-6 h-6 bg-red-500 rounded-full"></div>
                <div className="absolute top-32 left-16 w-4 h-4 bg-white rounded-full opacity-60"></div>
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
                    placeholder="Ingresa tu correo"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                    required
                    disabled={loading}
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${loading ? "opacity-70 cursor-wait" : "hover:bg-red-600"
                    } bg-blue-800 text-white font-medium py-3 rounded-lg transition`}
                >
                  {loading ? "Iniciando..." : "Iniciar sesión"}
                </button>

                <Link to="/recover" className="text-sm text-blue-700 underline">
                  ¿Olvidaste tu contraseña?
                </Link>

                <p className="text-slate-600">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/register" className="underline text-blue-800 font-medium">
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
