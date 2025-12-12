// src/feactures/Auth/pages/ResetPassword.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/api";

export const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        let emailParam = params.get('email');
        
        // MEJOR MANEJO DE DECODIFICACIÓN DE EMAIL
        if (emailParam) {
            try {
                // Reemplazar %40 por @ y luego decodificar
                emailParam = emailParam.replace(/%40/g, '@');
                // Decodificar cualquier otro carácter especial
                emailParam = decodeURIComponent(emailParam);
                console.log('📧 Email decodificado correctamente:', emailParam);
            } catch (e) {
                console.log('⚠️ Error decodificando email, usando valor directo:', e);
                // Si falla la decodificación, usar el valor directo
                emailParam = emailParam.replace(/%40/g, '@');
            }
        }

        if (!tokenParam || !emailParam) {
            setError("Enlace inválido o expirado");
            setTimeout(() => navigate("/login"), 3000);
            return;
        }
        
        setToken(tokenParam);
        setEmail(emailParam);
        
        // DEBUG: Ver qué token y email recibimos
        console.log('📋 Token recibido:', tokenParam);
        console.log('📧 Email final recibido:', emailParam);
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setError("");
        setMessage("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            setLoading(false);
            return;
        }

        try {
            console.log('📤 Enviando solicitud de reset con:');
            console.log('Token:', token);
            console.log('Email:', email);
            console.log('Nueva contraseña:', '*'.repeat(password.length));

            // ✅ ENVIAR EMAIL JUNTO CON EL TOKEN
            const response = await api.post("/auth/reset-password", {
                token,
                newPassword: password,
                email: email // ✅ INCLUIR EL EMAIL
            });

            console.log('✅ Respuesta del servidor:', response.data);
            setMessage(response.data.message || 'Contraseña actualizada correctamente');
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            console.error("❌ Reset password error completo:", err);
            console.log('❌ Respuesta del servidor:', err.response?.data);
            
            let errorMessage = "Error al restablecer la contraseña";
            
            if (err.response) {
                // Errores del servidor
                errorMessage = err.response.data.message || errorMessage;
                
                // Detectar específicamente token expirado/inválido
                if (err.response.data.message?.includes('expirado') || 
                    err.response.data.message?.includes('inválido') ||
                    err.response.data.message?.includes('no coincide')) {
                    errorMessage = "El enlace ha expirado o es inválido. Por favor, solicita uno nuevo.";
                }
            } else if (err.request) {
                // Errores de red
                errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
             <button
                      onClick={() => navigate("/")}
                      className="absolute top-[20px] right-[20px] bg-white w-[60px] h-[60px] rounded-full flex items-center justify-center text-[33px] cursor-pointer font-medium! duration-300 transition-all hover:scale-[1.1]"
                    >
                      ×
                    </button>
            <div className="w-full max-w-6xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex flex-col lg:flex-row min-h-[600px]">

                    {/* Sección de ilustración - Derecha */}
                    <div className="lg:w-1/2 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-transparent"></div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl font-bold mb-4">Nueva Contraseña</h2>
                            <div className="w-80 h-80 mx-auto mb-6 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full opacity-20"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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

                    {/* Formulario - Izquierda */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-50">
                        <div className="max-w-md mx-auto w-full">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center mb-6">
                                   <p className="text-slate-600 mt-2">
                                        Ingresa tu nueva contraseña para <span className="font-medium">{email ? email : "tu cuenta"}</span>
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Nueva contraseña
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Ingresa tu nueva contraseña"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirma tu nueva contraseña"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                                        <p className="text-red-700 text-sm font-medium">{error}</p>
                                    </div>
                                )}
                                {message && (
                                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                                        <p className="text-green-700 text-sm font-medium">{message}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full ${
                                        loading ? "opacity-70 cursor-wait" : "hover:bg-green-600"
                                    } bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`}
                                >
                                    {loading ? "Guardando..." : "Guardar nueva contraseña"}
                                </button>

                                <p className="text-slate-600 ">
                                    <Link
                                        to="/login"
                                        className="underline text-blue-800 hover:text-red-600 font-medium transition-colors"
                                    >
                                        Volver al inicio de sesión
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