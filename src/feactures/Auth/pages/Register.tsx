
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({ passwordMatch: "", passwordStrength: "" });
  const [serverMsg, setServerMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const validatePasswordStrength = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumber || hasSpecialChar;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      const isStrong = validatePasswordStrength(value);
      setErrors(prev => ({
        ...prev,
        passwordStrength: !isStrong && value ? "La contraseña debe contener al menos un número o carácter especial" : ""
      }));

      if (formData.confirmPassword !== "") {
        setErrors(prev => ({
          ...prev,
          passwordMatch: value !== formData.confirmPassword ? "Las contraseñas no coinciden" : ""
        }));
      }
    } else if (name === "confirmPassword") {
      setErrors(prev => ({
        ...prev,
        passwordMatch: value !== formData.password ? "Las contraseñas no coinciden" : ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg(null);

    const isPasswordStrong = validatePasswordStrength(formData.password);
    if (!isPasswordStrong) {
      setErrors(prev => ({
        ...prev,
        passwordStrength: "La contraseña debe ser más segura (incluye números o símbolos)"
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        passwordMatch: "Las contraseñas no coinciden"
      }));
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nombre: formData.fullName,
        email: formData.email.toLowerCase(),
        telefono: formData.phone || null,
        contrasena: formData.password,
      };

      const response = await api.post("/auth/register", payload);

      if (response.status === 200 || response.status === 201) {
        setServerMsg("¡Registro exitoso! Redirigiendo...");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({ passwordMatch: "", passwordStrength: "" });

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }

    } catch (err: any) {
      console.error("Error al registrar usuario:", err);
      const msg = err.response?.data?.message || err.message || "Error al conectar con el servidor";
      setServerMsg(msg);
    } finally {
      setSubmitting(false);
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
              OnWheels
            </span>
          </Link>
        </header>

        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
        <img
          src="/bg_hero_landing.jpg"
          alt="background"
          className="w-full h-full object-cover filter brightness-75 contrast-110"
        />

        <div className="absolute inset-0 z-20 flex items-end justify-center pb-24 px-12 bg-linear-to-t from-black/90 via-black/20 to-transparent">
          <div className="max-w-xl text-center text-white">
            <h3 className="text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tight uppercase">
              Únete a la <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-(--color-blue)">
                Revolución
              </span>
            </h3>
            <p className="text-xl text-gray-300 font-light leading-relaxed">
              Conecta con skaters locales, accede a eventos exclusivos y lleva tu pasión al siguiente nivel.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Form Section (50%) */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-zinc-950 text-white p-6 lg:p-12 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

        <div className="w-full max-w-[480px] space-y-6 my-auto relative z-10"> {/* Slightly reduced max-width */}
          <Link to="/login" className="inline-flex gap-2 items-center text-gray-500 hover:text-(--color-blue) transition-colors mb-2 group font-medium">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Login</span>
          </Link>

          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Crear Cuenta</h2>
            <p className="text-gray-400 text-base">Completa tus datos para empezar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6"> {/* Reduced spacing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Nombre Completo</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                // Reduced padding
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@email.com"
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+57..."
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 carc."
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                required
                minLength={6}
              />
              {errors.passwordStrength && (
                <p className="text-amber-500 text-xs mt-1 font-medium">{errors.passwordStrength}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Confirmar</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-(--color-blue) focus:border-(--color-blue) outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                required
                minLength={6}
              />
              {errors.passwordMatch && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.passwordMatch}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-(--color-blue) hover:bg-blue-600 text-white font-bold text-base p-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-(--color-blue)/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-wide transform active:scale-[0.98]"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creando cuenta...
                </span>
              ) : "Registrarse"}
            </button>

            {serverMsg && (
              <div className={`text-center p-3 rounded-xl text-xs font-medium border ${serverMsg.includes("exitoso") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                {serverMsg}
              </div>
            )}

            <p className="text-center text-gray-400 text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-(--color-blue) font-bold hover:text-white transition-colors">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
