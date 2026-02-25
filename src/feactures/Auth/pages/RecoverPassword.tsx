
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import api from "../../../services/api";

export const RecoverPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            // Mocking existing functionality as per previous implementation logic
            // Assuming 'api' is correctly configured
            const response = await api.post("/auth/forgot-password", { email });
            setMessage(response.data.message || "Si el correo existe, recibirás instrucciones.");
        } catch (err: any) {
            console.error(err);
            setError("No se pudo enviar el correo. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-slate-900">

            {/* LEFT: Image Section (50%) */}
            <div className="hidden lg:block w-1/2 h-full relative">
                <header className="absolute z-50 top-0 left-0 w-full p-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-blue)]">
                            <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-xl uppercase tracking-tighter text-white drop-shadow-md">
                            Performance SB
                        </span>
                    </Link>
                </header>

                {/* HERO Image with Dark Filter */}
                <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
                <img
                    src="/bg_hero_landing.jpg"
                    alt="Login Background"
                    className="w-full h-full object-cover filter brightness-75 contrast-110"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 z-20 flex items-end justify-center pb-24 px-12 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                    <div className="max-w-xl text-center">
                        <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight uppercase">
                            Recuperación <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-blue)] to-cyan-400">
                                Segura
                            </span>
                        </h3>
                        <p className="text-xl text-gray-300 font-light leading-relaxed">
                            No te preocupes, te ayudaremos a volver a la pista en unos segundos.
                        </p>
                    </div>
                </div>
            </div>


            {/* RIGHT: Form Section (50%) */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-zinc-950 text-white p-8 lg:p-16 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

                <div className="w-full max-w-[480px] space-y-8 relative z-10">
                    <Link to="/login" className="inline-flex gap-2 items-center text-gray-500 hover:text-[var(--color-blue)] transition-colors mb-4 group font-medium">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Volver a Login</span>
                    </Link>

                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Recuperar Contraseña</h2>
                        <p className="text-gray-400 text-base">Ingresa tu correo para recibir instrucciones de restablecimiento.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Correo Electrónico</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                    className="w-full p-3.5 pl-12 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--color-blue)] focus:border-[var(--color-blue)] outline-none transition-all text-white placeholder:text-gray-600 font-medium text-sm"
                                    required
                                    disabled={loading}
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-blue)] hover:bg-blue-600 text-white font-bold text-base p-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[var(--color-blue)]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2 uppercase tracking-wide transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Enviando...
                                </span>
                            ) : "Enviar Instrucciones"}
                        </button>

                        {message && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 mt-4">
                                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-green-400 font-bold text-sm">Correo Enviado</h4>
                                    <p className="text-green-500/80 text-xs mt-1">{message}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center mt-4">
                                <p className="text-red-500 text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

