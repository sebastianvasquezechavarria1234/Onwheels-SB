import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const location = useLocation();

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = user.roles || (user.rol ? [user.rol] : []);

  // Si no se especifican roles permitidos o el array está vacío, denegar acceso por seguridad
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasValidRole = userRoles.some(role => 
    allowedRoles.includes(role.toLowerCase())
  );

  if (!hasValidRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;