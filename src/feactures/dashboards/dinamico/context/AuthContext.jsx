// // src/feactures/dashboards/dinamico/context/AuthContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";

// const AuthContext = createContext();

// // Hook personalizado con validación
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// // Proveedor del contexto
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     // Asegúrate de que esta URL coincida con tu backend
//     axios.get("http://localhost:3000/api/auth/me", {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(res => {
//       setUser(res.data);
//     })
//     .catch(err => {
//       console.error("Error al cargar usuario:", err);
//       localStorage.removeItem("token");
//     })
//     .finally(() => setLoading(false));
//   }, []);

//   const login = (token) => {
//     localStorage.setItem("token", token);
//     window.location.reload();
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   const hasPermission = (permiso) => {
//     return user?.roles?.includes("administrador") || user?.permisos?.includes(permiso);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };