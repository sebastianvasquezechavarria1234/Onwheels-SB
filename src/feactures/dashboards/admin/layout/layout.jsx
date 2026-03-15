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
  const [userProfilePic, setUserProfilePic] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || "Administrador");
        setUserEmail(user.email || "admin@Performance SB.com");
        setUserProfilePic(user.foto_perfil || null);
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

            <div className={`flex flex-col items-center justify-center transition-all duration-300 mb-6 gap-3
            ${isCollapsed ? "scale-90" : "px-2"}
          `}>
              <img
                src="/logo.png"
                alt="Onwheels"
                className={isCollapsed ? "h-7 object-contain" : "h-14 w-auto object-contain"}
              />

              {!isCollapsed && (
                <div className="flex items-center gap-3 px-3 py-2 mt-1">
                  {userProfilePic ? (
                    <img
                      src={userProfilePic}
                      alt="Perfil"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#040529] shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-[#040529] text-white font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-slate-800 text-lg font-bold tracking-wide lowercase truncate max-w-[150px]">
                    {userName}
                  </div>
                </div>
              )}
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
                      ${isCollapsed ? "w-11 h-11 rounded-xl shadow-[0_8px_15px_-5px_rgba(4,5,41,0.2)]" : "w-10 h-10 rounded-xl"}
                      ${openModule === key
                          ? "text-white bg-[#040529] shadow-md"
                          : "text-slate-400 bg-white border border-slate-100 group-hover:text-white group-hover:bg-[#040529] group-hover:border-[#040529]"}
                    `}>
                        {Icon}
                      </div>
                      {!isCollapsed && (
                        <h4 className={`text-[18px] md:text-[19px] font-bold transition-all duration-300 whitespace-nowrap overflow-hidden tracking-tight
                        ${openModule === key ? "text-[#040529]" : "text-slate-500 group-hover:text-[#040529]"}
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

            {/* User logout button */}
            <div className="mt-auto pt-4 flex justify-center w-full px-2 pb-2">
              <button
                onClick={handleLogout}
                className="w-12 h-12 flex items-center justify-center rounded-[1rem] bg-[#040529] text-white hover:bg-slate-800 transition-all shadow-md group"
                title="Cerrar sesión"
              >
                <LogOutIcon size={22} className="group-hover:scale-110 transition-transform translate-x-0.5" />
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* CONTENT WITH HEADER */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-slate-100/50">
        {/* Dynamic Content Body with "White Table" effect */}
        <div className="flex-1 overflow-hidden p-3 md:p-5 pt-4 md:pt-5 relative flex flex-col">


          {/* Dynamic Content Body with "White Table" effect */}
          <motion.section
            className="flex-1 overflow-hidden bg-white rounded-[2rem] p-3 md:p-5 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] border border-white flex flex-col"
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
