// import { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const TokenRedirect = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user")) || {};
    
//     if (token) {
//       const currentPath = location.pathname;
      
//       // Solo redirigir si estamos en rutas públicas
//       const publicRoutes = ['/', '/login', '/register', '/recover', '/reset-password'];
//       const isPublicRoute = publicRoutes.includes(currentPath);
      
//       if (isPublicRoute) {
//         const userRole = (user.roles?.[0] || user.rol || 'cliente').toLowerCase();
        
//         // Solo para los roles solicitados
//         if (userRole === 'estudiante') {
//           navigate('/student/home', { replace: true });
//         } else if (userRole === 'instructor') {
//           navigate('/instructor/home', { replace: true });
//         } else if (userRole === 'administrador') {
//           navigate('/admin/home', { replace: true });
//           } else if (userRole === 'usuario') {
//           navigate('/users/home', { replace: true });
      
//         }
//       }
//     }
//   }, [navigate, location.pathname]);

//   return null; // No renderiza nada
// };

// export default TokenRedirect;