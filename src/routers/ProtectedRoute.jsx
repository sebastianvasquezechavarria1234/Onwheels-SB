import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserRoleSlug } from "../utils/roleHelpers";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const location = useLocation();

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = Array.isArray(user.roles) 
    ? user.roles.map(r => (typeof r === 'string' ? r : r.nombre_rol).trim().toLowerCase()) 
    : [user.rol?.trim().toLowerCase()].filter(Boolean);
  const roleSlug = getUserRoleSlug(user);

  // Si no se especifican roles permitidos o el array está vacío, denegar acceso por seguridad
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Verificar si el usuario tiene alguno de los roles permitidos (vía nombre real o slug virtual)
  const hasValidRole = allowedRoles.some(allowedRole => 
    allowedRole === roleSlug || userRoles.includes(allowedRole.toLowerCase())
  );

  if (!hasValidRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;