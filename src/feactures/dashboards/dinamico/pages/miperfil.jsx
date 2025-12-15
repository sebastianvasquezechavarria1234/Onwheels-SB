// // src/pages/DinamicoPages/MiPerfil.jsx
// import { useAuth } from "../context/AuthContext";
// export default function MiPerfil() {
//   const { user } = useAuth();

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
//       <p><strong>Nombre:</strong> {user?.nombre || user?.nombre_completo}</p>
//       <p><strong>Email:</strong> {user?.email}</p>
//       <p><strong>Rol(es):</strong> {user?.roles?.join(", ")}</p>
//     </div>
//   );
// }