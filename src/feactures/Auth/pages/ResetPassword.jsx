// import { useState } from "react";
// import { useSearchParams, Link } from "react-router-dom";
// import axios from "axios";

// export const ResetPassword = () => {
//   const [searchParams] = useSearchParams();
//   const token = searchParams.get("token") || "";
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setMessage("");

//     if (password.length < 6) {
//       setError("La contraseña debe tener al menos 6 caracteres.");
//       return;
//     }
//     if (password !== confirm) {
//       setError("Las contraseñas no coinciden.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post("/api/auth/reset-password", { token, password });
//       setMessage(res.data.message || "Contraseña actualizada correctamente.");
//     } catch (err: any) {
//       setError(err?.response?.data?.message || "Error al actualizar la contraseña.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="p-8 bg-white rounded shadow">
//           <p className="text-red-600">Token inválido o ausente.</p>
//           <Link to="/recover" className="text-blue-600 underline mt-4 block">Solicitar recuperar contraseña</Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white p-8 rounded shadow">
//         <h2 className="text-2xl font-bold mb-4">Restablecer contraseña</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Nueva contraseña</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" required />
//           </div>
//           <div>
//             <label className="block text-sm font-medium">Confirmar contraseña</label>
//             <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2 border rounded" required />
//           </div>

//           {error && <p className="text-red-600">{error}</p>}
//           {message && <p className="text-green-600">{message}</p>}

//           <button type="submit" disabled={loading} className={`w-full py-2 rounded bg-blue-700 text-white ${loading ? "opacity-70" : "hover:bg-blue-800"}`}>
//             {loading ? "Procesando..." : "Actualizar contraseña"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };
// export default ResetPassword;
