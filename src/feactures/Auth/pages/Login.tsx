// src/feactures/Auth/pages/Login.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Manejar errores globales para evitar recargas
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (loading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading]);

  const handleSubmit = async (e) => {
    // ✅ PREVENCIÓN MÁXIMA DE RECARGA
    e.preventDefault();
    e.stopPropagation();
    
    setError("");
    setLoading(true);

    try {
      // ✅ Validación previa para evitar llamadas innecesarias
      if (!email || !password) {
        setError("Por favor completa todos los campos");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/login", {
        email: email.trim(),
        contrasena: password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const rol = response.data.user.rol?.toLowerCase() || "usuario";
      
      if (rol === "administrador") {
        navigate("/admin/dashboard", { replace: true });
      } else if (rol === "estudiante") {
        navigate("/student/setting", { replace: true });
      } else if (rol === "instructor") {
        navigate("/instructor/setting", { replace: true });
      } else {
        navigate("/users/home", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // ✅ MANEJO SEGURO DE ERRORES SIN RECARGA
      let errorMessage = "Error en el inicio de sesión";
      
      if (err.response) {
        errorMessage = err.response.data.message || "Credenciales incorrectas";
      } else if (err.message === 'Network Error') {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión";
      } else if (err.request) {
        errorMessage = "El servidor no respondió. Intenta nuevamente";
      }
      
      setError(errorMessage);
      
      // ✅ SCROLL SUAVE AL MENSAJE DE ERROR
      setTimeout(() => {
        const errorElement = document.querySelector('.login-error-message');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

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
              {/* ✅ FORM CON ON_SUBMIT EXPLÍCITO */}
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

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
                    disabled={loading}
                    autoComplete="email"
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
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                {/* ✅ MENSAJE DE ERROR CON CLASE ESPECÍFICA PARA SCROLL */}
                {error && (
                  <div className="login-error-message bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg animate-shake">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${loading ? "opacity-70 cursor-wait" : "hover:bg-red-600"} bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`}
                  onClick={(e) => {
                    // ✅ PREVENCIÓN EXTRA EN EL BOTÓN
                    e.stopPropagation();
                  }}
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </button>

                <div className="text-center mt-2">
                  <Link
                    to="/recover"
                    className="text-sm text-blue-700 hover:text-blue-900 underline"
                    onClick={(e) => {
                      // ✅ PREVENCIÓN AL HACER CLIC EN EL LINK
                      e.stopPropagation();
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

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
  );
};

export default Login;