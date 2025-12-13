// src/feactures/Auth/pages/RecoverPassword.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";

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
                            <h2 className="text-3xl font-bold mb-4">Recuperar contraseña</h2>
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
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ingresa tu correo aquí"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-700 text-center">{error}</p>
                                )}
                                {message && (
                                    <p className="text-green-700 text-center">{message}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full ${
                                        loading ? "opacity-70 cursor-wait" : "hover:bg-red-600"
                                    } bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl`}
                                >
                                    {loading ? "Enviando..." : "Enviar correo"}
                                </button>

                                <p className="text-slate-600 mt-[0px]">
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