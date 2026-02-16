import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  // Función para validar la fortaleza de la contraseña
  const validatePasswordStrength = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasNumber || hasSpecialChar;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // VALIDACIÓN EN TIEMPO REAL
    if (name === "password") {
      // Validar fortaleza de la contraseña
      const isStrong = validatePasswordStrength(value);
      setErrors(prev => ({
        ...prev,
        passwordStrength: !isStrong && value ? "La contraseña debe contener al menos un número o carácter especial" : ""
      }));

      // Validar coincidencia con confirmación si ya hay valor en confirmPassword
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

    // Validar fortaleza de la contraseña antes de enviar
    const isPasswordStrong = validatePasswordStrength(formData.password);
    if (!isPasswordStrong) {
      setErrors(prev => ({
        ...prev,
        passwordStrength: "La contraseña debe contener al menos un número o carácter especial"
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

      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setServerMsg(data.message || "Registro exitoso");
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
      } else {
        setServerMsg(data.message || "Error en el registro");
      }
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setServerMsg("No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-white! h-screen bg-slate-900 flex items-center justify-center p-4">
      
      <div className=" min-w-[1300px] mx-auto h-full flex gap-[20px] max-2xl:min-w-[900px] max-2xl:gap-[10px] max-lg:min-w-[500px] max-md:min-w-[350px]">


        <div className="relative w-[50%] h-full block bg-white rounded-[30px] overflow-hidden max-lg:hidden">
          <header className="absolute z-50 top-0 lef-0 w-full p-[20px]">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-[50px] h-[50px] bg-white rounded-full overflow-hidden border-2 border-[var(--color-blue)] max-2xl:w-[40px] max-2xl:h-[40px]">
                <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg uppercase tracking-tighter text-white">
                Performance SB
              </span>
            </Link>



          </header>
            <picture className="absolute top-0 left-0 h-full!
          w-full">
              <img
                src="https://streetsskaters.com/images/large/kryptonics-skateboard-classic-design.webp"
                alt="background"
                className="w-full h-full object-cover" />

            </picture>

            <div className="absolute z-40 top-0 left-0 w-full h-full gradient flex justify-center items-end">
              <div className="max-w-[300px] text-center pb-[20px]">
                <h3 className="italic mb-[20px]">Sé parte de la comunidad</h3>
                <p>Conecta con skaters, comparte tus mejores trucos y encuentra sesiones y encuentros locales.</p>
              </div>
            </div>
        </div>

        {/* FORMULARIO */}
        <div className="w-[50%] p-8 lg:p-12 flex flex-col justify-center max-lg:w-[100%] max-lg:p-[20px]">
          <div className="">
            <form onSubmit={handleSubmit} className="space-y-[20px] max-2xl:space-y-[10px]">
              <Link to="/"  className="inline-flex gap-[5px] items-center cursor-pointer">
              <ArrowLeft size={20}/>
                <p className="italic hover:underline">Regresar</p>
              </Link>
              <h2>Crear cuenta</h2>

              <div>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre completo"
                  className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-[20px] max-2xl:gap-[10px]">
                <div>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu correo"
                    className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                    required
                  />
                </div>

                <div>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Número"
                    className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                    required
                  />
                </div>
              </div>

              <div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                  required
                  minLength="6"
                />
                {errors.passwordStrength && (
                  <p className="text-red-600 text-sm mt-1">{errors.passwordStrength}</p>
                )}
              </div>

              <div>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmar contraseña"
                  className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                  required
                  minLength="6"
                />
                {errors.passwordMatch && (
                  <p className="text-red-600 text-sm mt-1">{errors.passwordMatch}</p>
                )}
              </div>

              <p className=" mb-4 mt-4">
                ¿Ya tienes una cuenta?{" "}
                <Link to="/login" className="underline text-blue-400 font-medium">
                  Iniciar sesión
                </Link>
              </p>
              <button
                type="submit"
                className="w-full bg-blue-800 cursor-pointer text-white font-medium p-[16px_18px] rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl  disabled:opacity-80 max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                disabled={submitting}
              >
                {submitting ? "Registrando..." : "Registrarse"}
              </button>

              {serverMsg && (
                <p className="text-center mt-2 text-sm text-gray-700">{serverMsg}</p>
              )}


            </form>
          </div>
        </div>




      </div>
    </div>
  );
};

export default Register;
