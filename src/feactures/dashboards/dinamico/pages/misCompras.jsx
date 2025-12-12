// // src/pages/DinamicoPages/MisCompras.jsx
// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function MisCompras() {
//   const [compras, setCompras] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     axios.get("http://localhost:3000/api/compras", {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(res => setCompras(res.data))
//     .catch(err => console.error("Error al cargar compras:", err));
//   }, []);

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Mis Compras</h1>
//       {compras.length === 0 ? (
//         <p>No tienes compras aún.</p>
//       ) : (
//         <ul>
//           {compras.map(compra => (
//             <li key={compra.id_compra}>Compra #{compra.id_compra} - ${compra.total}</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }