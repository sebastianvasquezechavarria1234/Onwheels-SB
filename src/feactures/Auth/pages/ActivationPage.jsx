import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ActivationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Token de activación no proporcionado.");
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setMessage("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setStatus("loading");
        try {
            // Ajusta la URL según tu configuración de API
            const response = await axios.post("http://localhost:3000/api/auth/activate", {
                token,
                newPassword: password
            });

            setStatus("success");
            setMessage(response.data.message);

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error) {
            setStatus("error");
            setMessage(error.response?.data?.message || "Error al activar la cuenta");
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl shadow-2xl text-center">
                    <div className="bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                    <p className="text-zinc-400">Enlace de activación inválido.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 pt-10 pb-20">
            <div className="w-full max-w-md bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white">Performance-SB</h2>
                    <p className="text-zinc-400 mt-2">Activa tu cuenta para comenzar</p>
                </div>

                {status === "success" ? (
                    <div className="text-center py-4">
                        <div className="bg-emerald-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                               <circle cx="12" cy="12" r="12" fill="#10b981" opacity="0.15" />
                               <path d="M7 13l3 3 7-7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                             </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">¡Cuenta Activada!</h3>
                        <p className="text-zinc-400 mb-6">{message}</p>
                        <p className="text-sm font-medium text-[var(--color-blue)] animate-pulse">Redirigiendo al inicio de sesión...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {status === "error" && (
                            <div className="mb-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Crea tu Contraseña
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:border-transparent transition"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className={`bg-white text-black font-bold py-3 px-8 rounded-full shadow-md transition duration-200 transform hover:scale-105 uppercase tracking-wider text-sm w-full flex items-center justify-center
                                ${status === "loading" ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--color-blue)] hover:text-white"}`}
                            >
                                {status === "loading" ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Activando...
                                    </>
                                ) : "Activar Cuenta"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ActivationPage;
