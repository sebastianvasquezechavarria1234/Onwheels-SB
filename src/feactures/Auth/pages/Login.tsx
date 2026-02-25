import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { getRoleHomePath } from "../../../utils/roleUtils";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (error && formSubmitted) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, formSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormSubmitted(true);
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        contrasena: password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const homePath = getRoleHomePath();
      navigate(homePath, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.response) {
        setError(err.response.data.message || "Credenciales incorrectas");
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión a internet");
      } else {
        setError("Error al procesar la solicitud");
      }
    } finally {
      setLoading(false);
      setFormSubmitted(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-900">

      {/* LEFT: Image Section (50%) */}
      <div className="hidden lg:block w-1/2 h-full relative">
        <header className="absolute z-50 top-0 left-0 w-full p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-(--color-blue)">
              <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl uppercase tracking-tighter text-white drop-shadow-md">
              Performance SB
            </span>
          </Link>
        </header>

        {/* HERO Image with Dark Filter */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
        <img
          src="/bg_hero_landing.jpg"
          alt="Login Background"
          className="w-full h-full object-cover filter brightness-75 contrast-110"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-24 px-12 bg-linear-to-t from-black/90 via-black/20 to-transparent">
          <div className="max-w-xl text-center">
            <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight uppercase">
              Bienvenido al <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-(--color-blue) to-cyan-400">
                Nivel Pro
              </span>
            </h3>
            <p className="text-xl text-gray-300 font-light leading-relaxed">
              Tu comunidad, tus eventos, tu progreso. <br />
              Todo lo que necesitas para dominar el asfalto.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Form Section (50%) */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-zinc-950 text-white p-8 lg:p-16 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

        <div className="w-full max-w-[480px] space-y-8 relative z-10"> {/* Slightly reduced max-width */}
          <Link to="/" className="inline-flex gap-2 items-center text-white  hover:text-(--color-gray) transition-colors mb-4 group font-medium">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Regresar</span>
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray">Iniciar Sesión</h2>
            <p className="text-gray-400 text-base">Accede a tu cuenta Performance Sb</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                // Reduced padding: p-3.5 instead of p-4
                className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all placeholder:text-gray text-gray-50 font-medium text-sm"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Contraseña</label>
                <Link to="/recover" className="text-xs text-white font-bold hover:text-blue-300 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                // Reduced padding: p-3.5 instead of p-4
                className="w-full p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                required
                disabled={loading}
              />
              {error && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
                  <p className="text-red-500 text-xs font-medium flex items-center gap-2">
                    <span className="block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {error}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              // Reduced padding: p-3.5 instead of p-4
              className="w-full bg-(--color-blue) hover:bg-blue-600 text-white font-bold text-base p-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-(--color-blue)/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6 uppercase tracking-wide transform active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Iniciando...
                </span>
              ) : "Ingresar"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-zinc-950 text-gray-500">O</span>
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/register" className="text-white font-bold hover:text-white transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
