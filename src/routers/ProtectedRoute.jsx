import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../feactures/dashboards/dinamico/context/AuthContext";
import { getHomePath, getUserRoleSlug } from "../utils/roleHelpers";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const safeUser = user || {};
  const userRoles = Array.isArray(safeUser.roles) 
    ? safeUser.roles.map(r => (typeof r === 'string' ? r : r.nombre_rol).trim().toLowerCase()) 
    : [safeUser.rol?.trim().toLowerCase()].filter(Boolean);
  const roleSlug = getUserRoleSlug(safeUser);
  const roleSlugMap = {
    administrador: "admin",
    admin: "admin",
    estudiante: "student",
    student: "student",
    instructor: "instructor",
    cliente: "users",
    users: "users",
    custom: "custom",
  };
  const allowedRoleSlugs = allowedRoles.map((allowedRole) => roleSlugMap[allowedRole.toLowerCase()] || allowedRole.toLowerCase());

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

  if (roleSlug !== "store" && !allowedRoleSlugs.includes(roleSlug)) {
    return <Navigate to={getHomePath(safeUser)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;