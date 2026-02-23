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
                navigate("/iniciar-sesion"); // Ajusta la ruta de login
            }, 3000);

        } catch (error) {
            setStatus("error");
            setMessage(error.response?.data?.message || "Error al activar la cuenta");
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">Enlace de activación inválido.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Activar Cuenta</h2>

                {status === "success" ? (
                    <div className="text-center">
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">¡Cuenta Activada!</h3>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-400">Redirigiendo al inicio de sesión...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {status === "error" && (
                            <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Crea tu Contraseña
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className={`w-full py-2 px-4 rounded text-white font-semibold transition-colors
                ${status === "loading" ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {status === "loading" ? "Activando..." : "Activar Cuenta"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ActivationPage;
