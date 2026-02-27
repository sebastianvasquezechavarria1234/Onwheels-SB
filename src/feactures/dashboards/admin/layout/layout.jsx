import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../hooks/dashboard.css";
import { BtnSideBar } from "../../BtnSideBar";
import {
  ChevronRight,
  Calendar,
  ChartBarIncreasing,
  LayoutDashboard,
  MapPinHouse,
  Shield,
  Shirt,
  ShoppingBag,
  User,
  UserPlus,
  Users,
  LogOutIcon,
  Mails,
  Package,
  GraduationCap,
  ShoppingCart,
  CreditCard,
  School2,
  Search,
  Bell,
  Mail,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminLayout } from "../../context/AdminLayoutContext";

export const Layout = ({ children }) => {
  const { showSidebar } = useAdminLayout(); // Consume context
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", next);
      return next;
    });
  };

  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@empresa.com");

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || "Administrador");
        setUserEmail(user.email || "admin@Performance SB.com");
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExp");
    navigate("/login");
  };

  const [openModule, setOpenModule] = useState(
    () => localStorage.getItem("openModule") || "config"
  );

  const openOnly = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("sidebarCollapsed", "false");
    }

    setOpenModule((prev) => {
      if (prev === key) return prev;
      localStorage.setItem("openModule", key);
      return key;
    });
  };

  const listVariants = {
    initial: { opacity: 0, height: 0, y: -6 },
    animate: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { type: "spring", stiffness: 320, damping: 26 },
    },
    exit: { opacity: 0, height: 0, y: -6 },
  };

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-100/50">
      {/* SIDEBAR CONTAINER */}
      {showSidebar && (
        <div className={`sidebar-transition h-full py-4 pl-4 pr-1 ${isCollapsed ? "w-[100px]" : "w-[260px]"}`}>
          <nav
            className={`flex flex-col h-full bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white z-20 relative
              ${isCollapsed ? "px-2 py-6" : "px-4 py-6"}
            `}
          >
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 top-8 bg-white shadow-lg rounded-full p-1.5 text-slate-400 hover:text-blue-600 border border-slate-50 z-30 transition-all hover:scale-110"
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} className="rotate-180" />}
            </button>

            <div className={`mb-8 flex items-center justify-center transition-all duration-300
            ${isCollapsed ? "scale-90" : "px-4"}
          `}>
              <img
                src="/logo.png"
                alt="Onwheels"
                className={isCollapsed ? "h-7 object-contain" : "h-14 w-auto object-contain"}
              />
            </div>

            <div className="sidebar flex-1 overflow-y-auto pr-1 space-y-3">
              <li className="list-none">
                <BtnSideBar title="Dashboard" link="../admin/dashboard" isCollapsed={isCollapsed}>
                  <LayoutDashboard size={20} />
                </BtnSideBar>
              </li>

              {!isCollapsed && (
                <p className="px-4 mt-6 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">
                  Menu Principal
                </p>
              )}

              {[
                ["config", "Configuración", <Shield size={isCollapsed ? 20 : 18} />],
                ["compras", "Compras", <Package size={isCollapsed ? 20 : 18} />],
                ["eventos", "Eventos", <Calendar size={isCollapsed ? 20 : 18} />],
                ["clases", "Clases", <GraduationCap size={isCollapsed ? 20 : 18} />],
                ["ventas", "Ventas", <ShoppingCart size={isCollapsed ? 20 : 18} />],
              ].map(([key, label, Icon]) => (
                <div
                  key={key}
                  className={`sidebar-transition rounded-2xl transition-all ${openModule === key ? "bg-slate-50/50" : ""}
                  ${isCollapsed ? "mb-2" : "p-1"}
                `}
                >
                  <button
                    onClick={() => openOnly(key)}
                    className={`w-full flex items-center transition-all duration-300 group rounded-xl
                    ${isCollapsed ? "justify-center p-2.5" : "justify-between p-2 hover:bg-slate-50"}
                  `}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                      <div className={`
                      transition-all duration-300 flex items-center justify-center shrink-0
                      ${isCollapsed ? "w-11 h-11 rounded-xl shadow-[0_8px_15px_-5px_rgba(59,130,246,0.2)]" : "w-10 h-10 rounded-xl"}
                      ${openModule === key
                          ? "text-white bg-blue-800 shadow-lg shadow-blue-800/20"
                          : "text-slate-400 bg-white border border-slate-100 group-hover:text-blue-800 group-hover:border-blue-100 group-hover:bg-blue-50/30"}
                    `}>
                        {Icon}
                      </div>
                      {!isCollapsed && (
                        <h4 className={`text-sm font-bold transition-all duration-300 whitespace-nowrap overflow-hidden tracking-tight
                        ${openModule === key ? "text-slate-800" : "text-slate-500 group-hover:text-slate-800"}
                      `}>
                          {label}
                        </h4>
                      )}
                    </div>
                    {!isCollapsed && (
                      <motion.div
                        animate={{ rotate: openModule === key ? 90 : 0 }}
                        className="text-slate-300"
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence>
                    {openModule === key && !isCollapsed && (
                      <motion.ul
                        variants={listVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="mt-1 space-y-1 px-2 mb-2"
                      >
                        {key === "config" && (
                          <>
                            <BtnSideBar title="Usuarios" link="../admin/users" isCollapsed={isCollapsed}>
                              <Users size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Administradores" link="../admin/admins" isCollapsed={isCollapsed}>
                              <Shield size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Roles" link="../admin/roles" isCollapsed={isCollapsed}>
                              <Shield size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "compras" && (
                          <>
                            <BtnSideBar title="Productos" link="../admin/products" isCollapsed={isCollapsed}>
                              <Shirt size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Categorías" link="../admin/categoriasProductos" isCollapsed={isCollapsed}>
                              <ChartBarIncreasing size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Proveedores" link="../admin/proveedores" isCollapsed={isCollapsed}>
                              <Users size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Compras" link="../admin/compras" isCollapsed={isCollapsed}>
                              <ShoppingBag size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "eventos" && (
                          <>
                            <BtnSideBar title="Eventos" link="../admin/eventos" isCollapsed={isCollapsed}>
                              <Calendar size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Categorías" link="../admin/categoriasEventos" isCollapsed={isCollapsed}>
                              <ChartBarIncreasing size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Correos" link="../admin/correos-masivos" isCollapsed={isCollapsed}>
                              <Mails size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Patrocinadores" link="../admin/patrocinadores" isCollapsed={isCollapsed}>
                              <MapPinHouse size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Sedes" link="../admin/sedes" isCollapsed={isCollapsed}>
                              <MapPinHouse size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "clases" && (
                          <>
                            <BtnSideBar title="Clases" link="../admin/clases">
                              <Calendar size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Niveles" link="../admin/classLevels">
                              <ChartBarIncreasing size={16} />
                            </BtnSideBar>

                            <BtnSideBar title="Planes" link="../admin/plans">
                              <CreditCard size={16} />
                            </BtnSideBar>

                            <BtnSideBar title="Estudiantes" link="../admin/estudiantes">
                              <Users size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Instructores" link="../admin/instructores">
                              <User size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Preinscripciones" link="../admin/preRegistrations">
                              <UserPlus size={16} />
                            </BtnSideBar>

                            <BtnSideBar title="Matriculas" link="../admin/matriculas">
                              <School2 size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "ventas" && (
                          <>
                            <BtnSideBar title="Pedidos" link="../admin/pedidos">
                              <ShoppingCart size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Ventas" link="../admin/ventas">
                              <ShoppingBag size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Clientes" link="../admin/clientes">
                              <Users size={16} />
                            </BtnSideBar>
                          </>
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* User logout button only when collapsed */}
            {isCollapsed && (
              <div className="mt-auto pt-4 flex justify-center border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="Cerrar sesión"
                >
                  <LogOutIcon size={18} />
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* CONTENT WITH HEADER */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-slate-100/50">
        {/* Global Header Container */}
        <div className="px-3 md:px-5 pt-4 pb-1">
          <header className="bg-white rounded-[1.25rem] px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] border border-white/50">
            <div className="relative group max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 group-focus-within:text-blue-800 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search task"
                className="w-full pl-11 pr-11 py-1.5 bg-slate-50 border-none rounded-full text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <span className="text-[9px] font-black text-slate-400 bg-white px-1.5 py-0.5 rounded-lg border border-slate-100 italic">⌘ F</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-800 hover:bg-blue-50 transition-all relative">
                  <Mail size={16} strokeWidth={2} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full border border-white shadow-sm"></span>
                </button>
                <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-800 hover:bg-blue-50 transition-all">
                  <Bell size={16} strokeWidth={2} />
                </button>
              </div>

              <div className="h-6 w-[1px] bg-slate-100 mx-1 hidden md:block"></div>

              <div className="flex items-center gap-4 pl-2 group cursor-pointer">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-800 transition-colors uppercase tracking-tight leading-tight">{userName}</span>
                  <span className="text-[8px] text-slate-400 font-medium leading-none">{userEmail}</span>
                </div>
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                      alt="Profile"
                      className="w-7 h-7 object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 px-2 text-slate-300 hover:text-red-500 transition-colors border border-transparent hover:border-red-50 hover:bg-red-50 rounded-lg"
                  title="Salir"
                >
                  <LogOutIcon size={14} />
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Dynamic Content Body with "White Table" effect */}
        <div className="flex-1 overflow-hidden px-3 md:px-5 pb-5 pt-2">
          <motion.section
            className="h-full overflow-y-auto bg-white rounded-[2rem] p-3 md:p-5 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] border border-white"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.section>
        </div>
      </section>
    </main>
  );
};
