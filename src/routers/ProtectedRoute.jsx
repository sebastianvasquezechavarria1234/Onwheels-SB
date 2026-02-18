import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const location = useLocation();

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Obtener el rol del usuario
  const userRole = user.roles?.[0] || user.rol || 'cliente';

  // Si no se especifican roles permitidos, permitir acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Verificar si el usuario tiene el rol permitido
  const hasValidRole = allowedRoles.includes(userRole.toLowerCase());

  if (!hasValidRole) {
    // Generic redirect for unauthorized access (prevents Admin force-redirect loops)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;