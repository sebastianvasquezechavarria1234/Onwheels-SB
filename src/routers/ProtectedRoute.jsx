// src/routers/protectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const location = useLocation();
  
  // Verificar autenticación
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol si se especifican roles permitidos
  if (allowedRoles.length > 0) {
    const userRole = user.rol?.toLowerCase() || "usuario";
    const hasValidRole = allowedRoles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!hasValidRole) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;