// // src/feactures/dashboards/dinamico/layout/DinamicoLayout.jsx
// import { Outlet, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function DinamicoLayout() {
//   const { hasPermission, user } = useAuth();

//   const menu = [
//     // Cliente común (siempre visible)
//     { name: "Mi Perfil", path: "/dinamico/mi-perfil", permiso: null },
//     { name: "Mis Compras", path: "/dinamico/mis-compras", permiso: null },
    
//     // Módulos administrativos (solo si tiene permiso)
//     { name: "Roles", path: "/dinamico/roles", permiso: "ver_roles" },
//     { name: "Usuarios", path: "/dinamico/usuarios", permiso: "ver_usuarios" },
//     { name: "Clientes", path: "/dinamico/clientes", permiso: "ver_clientes" },
//     { name: "Productos", path: "/dinamico/productos", permiso: "ver_productos" },
//     { name: "Compras", path: "/dinamico/compras", permiso: "ver_compras" },
//     { name: "Ventas", path: "/dinamico/ventas", permiso: "ver_ventas" },
//     { name: "Estudiantes", path: "/dinamico/estudiantes", permiso: "ver_estudiantes" },
//     { name: "Instructores", path: "/dinamico/instructores", permiso: "ver_instructores" },
//     { name: "Clases", path: "/dinamico/clases", permiso: "ver_clases" },
//   ];

//   const itemsVisibles = menu.filter(item => !item.permiso || hasPermission(item.permiso));

//   return (
//     <div className="dashboard-dinamico">
//       <aside className="sidebar">
//         <h2>Hola, {user?.email}</h2>
//         <nav>
//           {itemsVisibles.map((item) => (
//             <Link
//               key={item.path}
//               to={item.path}
//               className="block py-2 px-4 hover:bg-gray-200 rounded"
//             >
//               {item.name}
//             </Link>
//           ))}
//         </nav>
//       </aside>
//       <main className="content p-6">
//         <Outlet />
//       </main>
//     </div>
//   );
// }