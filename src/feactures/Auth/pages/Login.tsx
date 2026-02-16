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
    } catch (err) {
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
    <div className="text-white! h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="min-w-[1300px] mx-auto h-full flex gap-[20px] max-2xl:min-w-[900px] max-2xl:gap-[10px] max-lg:min-w-[500px] max-md:min-w-[350px]">
        
        {/* Panel izquierdo con imagen - IDENTICO al Register */}
        <div className="relative w-[50%] h-full block bg-white rounded-[30px] overflow-hidden max-lg:hidden">
          <header className="absolute z-50 top-0 left-0 w-full p-[20px]">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-[50px] h-[50px] bg-white rounded-full overflow-hidden border-2 border-[var(--color-blue)] max-2xl:w-[40px] max-2xl:h-[40px]">
                <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg uppercase tracking-tighter text-white">
                Performance SB
              </span>
            </Link>
          </header>
          
          <picture className="absolute top-0 left-0 h-full! w-full">
            <img
              src="https://surfsflow.com/images/large/comprehensive-guide-beginner-skateboard-types.webp"
              alt="background"
              className="w-full h-full object-cover"
            />
          </picture>
          
          <div className="absolute z-40 top-0 left-0 w-full h-full gradient flex justify-center items-end">
            <div className="max-w-[300px] text-center pb-[20px]">
              <h3 className="italic mb-[20px]">¡Bienvenido de nuevo!</h3>
              <p>Inicia sesión para conectarte con la comunidad de skaters y compartir tus mejores trucos.</p>
            </div>
          </div>
        </div>

        {/* FORMULARIO - IDENTICO al Register en estructura y estilos */}
        <div className="w-[50%] p-8 lg:p-12 flex flex-col justify-center max-lg:w-[100%] max-lg:p-[20px]">
          <div>
            <form onSubmit={handleSubmit} className="space-y-[20px] max-2xl:space-y-[10px]">
             <Link to="/"  className="inline-flex gap-[5px] items-center cursor-pointer">
              <ArrowLeft size={20}/>
                <p className="italic hover:underline">Regresar</p>
              </Link>
              
              <h2 className="text-3xl font-bold">Iniciar sesión</h2>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                  required
                  disabled={loading}
                />
                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
              </div>

              <Link to="/recover" className="text-sm text-blue-400 underline hover:text-blue-300">
                ¿Olvidaste tu contraseña?
              </Link>

                <p className="mb-4 mt-4">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="underline text-blue-400 font-medium">
                  Regístrate
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 cursor-pointer text-white font-medium p-[16px_18px] rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-80 max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
              >
                {loading ? "Iniciando..." : "Iniciar sesión"}
              </button>

            
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
