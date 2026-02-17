import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { ArrowLeft } from "lucide-react";

export const RecoverPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setError("");
        setMessage("");
        setLoading(true);

        if (!email.includes("@")) {
            setError("El correo ingresado no es válido.");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/auth/request-password-reset", {
                email: email.trim()
            });

            setMessage(response.data.message);
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            console.error("Recover password error:", err);
            setError(err.response?.data?.message || "Error al procesar la solicitud");
        } finally {
            setLoading(false);
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
                    
                    <picture className="absolute top-0 left-0 bg-red-600 h-full! w-full">
                        <img
                            src="https://tse1.mm.bing.net/th/id/OIP.zbkHq42XuCly3kUMTpGTQgHaHa?cb=defcachec2&rs=1&pid=ImgDetMain&o=7&rm=3"
                            alt="background"
                            className="w-full h-full object-cover"
                        />
                    </picture>
                    
                    <div className="absolute z-40 top-0 left-0 bg-red-600 w-full h-full gradient flex justify-center items-end">
                        <div className="max-w-[300px] text-center pb-[20px]">
                            <h3 className="italic mb-[20px]">¿Olvidaste tu contraseña?</h3>
                            <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
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
                            
                            <h2 className="text-3xl font-bold">Recuperar contraseña</h2>

                            <div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ingresa tu correo aquí"
                                    className="w-full p-[16px_18px] text-white/70! bg-white/10 rounded-lg focus:ring-1 focus:ring-white/60 focus:border-transparent outline-none transition-all max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <p className="text-red-600 text-sm text-center">{error}</p>
                            )}
                            {message && (
                                <p className="text-green-600 text-sm text-center">{message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-800 cursor-pointer text-white font-medium p-[16px_18px] rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-80 max-2xl:p-[12px_14px] max-2xl:text-[12px]!"
                            >
                                {loading ? "Enviando..." : "Enviar correo"}
                            </button>

                            <p className="mb-4">
                                <Link to="/login" className="underline text-blue-400 font-medium hover:text-blue-300">
                                    Volver al inicio de sesión
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
