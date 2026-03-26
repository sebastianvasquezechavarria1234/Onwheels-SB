import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  Tag,
  ShoppingCart,
  Truck,
  CreditCard,
  Calendar,
  Layers,
  Handshake,
  MapPin,
  GraduationCap,
  ClipboardList,
  FilePlus,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";
import { BtnLink } from "../../../landing/components/BtnLink";

const Sidebar = () => {
  const [openModule, setOpenModule] = useState(null);
  const location = useLocation();

  const isActive = (href) => {
    if (!href) return false;
    const path = href.replace(/^#/, "");
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const moduleActive = (paths = []) => paths.some((p) => isActive(p));

  const toggleModule = (module) => {
    setOpenModule(openModule === module ? null : module);
  };

  // Obtener usuario del localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userName = user?.nombre_completo || "Usuario";
  const userRole = user?.roles && user.roles.length > 0 ? user.roles[0].nombre_rol || user.roles[0] : "Invitado";
  const userPhoto = user?.foto_perfil;
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // NOTE: diseño tipo tarjeta clara con avatar superior y botón circular inferior
  return (
    <aside className="w-64 min-h-screen p-4">
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 flex items-center gap-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0a1a33] flex items-center justify-center text-white font-extrabold overflow-hidden border-2 border-slate-100 shrink-0">
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{initials || "U"}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#081a2b] truncate">
                {userName}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 capitalize truncate">
                {userRole}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <nav className="flex-1 overflow-auto px-3 py-4">
          {/* Dashboard */}
          <div className="mb-3">
            <a
              href="#/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive("#/admin/dashboard")
                  ? "bg-[#071a34] text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  isActive("#/admin/dashboard") ? "bg-white/10" : "bg-slate-100"
                }`}
              >
                <LayoutDashboard
                  size={16}
                  className={
                    isActive("#/admin/dashboard")
                      ? "text-white"
                      : "text-slate-500"
                  }
                />
              </div>
              <span className="text-sm font-semibold">Dashboard</span>
            </a>
          </div>

          {/* Sección: Compras (Maestros primero -> Productos -> Compras) */}
          <div className="mb-2">
            <button
              onClick={() => toggleModule("compras")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                moduleActive([
                  "#/admin/categoriasProductos",
                  "#/admin/proveedores",
                  "#/admin/products",
                  "#/admin/compras",
                ])
                  ? "bg-[#eef6ff]"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#0a1a33] text-white">
                  <Package size={16} />
                </div>
                <span className="text-sm font-semibold text-[#081a2b]">
                  Compras
                </span>
              </div>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  openModule === "compras" ? "rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openModule === "compras" && (
              <div className="mt-3 ml-10 space-y-2">
                <a
                  href="#/admin/products"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/products")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-md ${
                      isActive("#/admin/products")
                        ? "bg-white/10"
                        : "bg-slate-100"
                    }`}
                  >
                    <Package
                      size={14}
                      className={
                        isActive("#/admin/products")
                          ? "text-white"
                          : "text-slate-500"
                      }
                    />
                  </div>
                  <span className="text-sm">Productos</span>
                </a>

                <a
                  href="#/admin/categoriasProductos"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/categoriasProductos")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Tag size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Categorías</span>
                </a>

                <a
                  href="#/admin/proveedores"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/proveedores")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Truck size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Proveedores</span>
                </a>

                <a
                  href="#/admin/compras"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/compras")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <CreditCard size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Compras</span>
                </a>
              </div>
            )}
          </div>

          {/* Sección: Eventos */}
          <div className="mb-2">
            <button
              onClick={() => toggleModule("eventos")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                moduleActive([
                  "#/admin/categoriasEventos",
                  "#/admin/patrocinadores",
                  "#/admin/sedes",
                  "#/admin/eventos",
                ])
                  ? "bg-[#eef6ff]"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#0a1a33] text-white">
                  <Calendar size={16} />
                </div>
                <span className="text-sm font-semibold text-[#081a2b]">
                  Eventos
                </span>
              </div>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  openModule === "eventos" ? "rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openModule === "eventos" && (
              <div className="mt-3 ml-10 space-y-2">
                <a
                  href="#/admin/eventos"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/eventos")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Calendar size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Eventos</span>
                </a>
                <a
                  href="#/admin/categoriasEventos"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/categoriasEventos")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Layers size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Categorías eventos</span>
                </a>
                <a
                  href="#/admin/patrocinadores"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/patrocinadores")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Handshake size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Patrocinadores</span>
                </a>
                <a
                  href="#/admin/sedes"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/sedes")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <MapPin size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Sedes</span>
                </a>
              </div>
            )}
          </div>

          {/* Sección: Clases */}
          <div className="mb-2">
            <button
              onClick={() => toggleModule("clases")}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${
                moduleActive([
                  "#/admin/classLevels",
                  "#/admin/plans",
                  "#/admin/clases",
                  "#/admin/instructores",
                  "#/admin/estudiantes",
                ])
                  ? "bg-[#eef6ff]"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#0a1a33] text-white">
                  <GraduationCap size={16} />
                </div>
                <span className="text-sm font-semibold text-[#081a2b]">
                  Clases
                </span>
              </div>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  openModule === "clases" ? "rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openModule === "clases" && (
              <div className="mt-3 ml-10 space-y-2">
                <a
                  href="#/admin/classLevels"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/classLevels")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <ClipboardList size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Niveles</span>
                </a>
                <a
                  href="#/admin/plans"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/plans")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <BookOpen size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Planes</span>
                </a>
                <a
                  href="#/admin/clases"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/clases")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <BookOpen size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Clases</span>
                </a>
                <a
                  href="#/admin/instructores"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/instructores")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <User size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Instructores</span>
                </a>
                <a
                  href="#/admin/estudiantes"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/estudiantes")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Users size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Estudiantes</span>
                </a>
                <a
                  href="#/admin/preRegistrations"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/preRegistrations")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <FilePlus size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Preinscripciones</span>
                </a>
                <a
                  href="#/admin/matriculas"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/matriculas")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <CreditCard size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Matrículas</span>
                </a>
              </div>
            )}
          </div>

          {/* Ventas */}
          <div className="mb-2">
            <button
              onClick={() => toggleModule("ventas")}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${
                moduleActive(["#/admin/pedidos", "#/admin/ventas"])
                  ? "bg-[#eef6ff]"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#0a1a33] text-white">
                  <ShoppingCart size={16} />
                </div>
                <span className="text-sm font-semibold text-[#081a2b]">
                  Ventas
                </span>
              </div>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  openModule === "ventas" ? "rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openModule === "ventas" && (
              <div className="mt-3 ml-10 space-y-2">
                <a
                  href="#/admin/pedidos"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/pedidos")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <ShoppingCart size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Pedidos</span>
                </a>
                <a
                  href="#/admin/ventas"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/ventas")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <ShoppingCart size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Ventas</span>
                </a>
              </div>
            )}
          </div>

          {/* Configuración final */}
          <div className="mt-4">
            <button
              onClick={() => toggleModule("config")}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${
                moduleActive(["#/admin/users", "#/admin/roles"])
                  ? "bg-[#eef6ff]"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#0a1a33] text-white">
                  <Shield size={16} />
                </div>
                <span className="text-sm font-semibold text-[#081a2b]">
                  Configuración
                </span>
              </div>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  openModule === "config" ? "rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openModule === "config" && (
              <div className="mt-3 ml-10 space-y-2">
                <a
                  href="#/admin/users"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/users")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Users size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Usuarios</span>
                </a>
                <a
                  href="#/admin/roles"
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
                    isActive("#/admin/roles")
                      ? "bg-[#071a34] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="p-2 rounded-md bg-slate-100">
                    <Shield size={14} className="text-slate-500" />
                  </div>
                  <span className="text-sm">Roles</span>
                </a>
              </div>
            )}
          </div>
        </nav>

        {/* Footer / Logout + collapse button */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full p-3 bg-transparent border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition">
            <LogOut size={16} />
            <span className="font-semibold text-sm">Cerrar sesión</span>
          </button>

          {/* collapse/expand floating button */}
          <div className="flex justify-center mt-4">
            <button className="w-12 h-12 rounded-full bg-[#071a34] text-white shadow-lg flex items-center justify-center">
              {/* icon for collapse - simple arrow */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M8 5l8 7-8 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

