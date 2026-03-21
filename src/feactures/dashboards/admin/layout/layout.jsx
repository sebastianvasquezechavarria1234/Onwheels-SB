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
  ChevronDown,
  ArrowLeft,
  MoreVertical,
  Truck
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [openModule, setOpenModule] = useState(
    () => localStorage.getItem("openModule") || null
  );

  const openOnly = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem("sidebarCollapsed", "false");
    }

    setOpenModule((prev) => {
      if (prev === key) {
        localStorage.removeItem("openModule");
        return null;
      }
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

  const darkSubItemClass = "!text-slate-300 hover:!bg-[#1f2f45] !rounded-lg";
  const darkSubIconClass = "!bg-transparent !border !border-[#2a3b52] !text-slate-400 group-hover:!bg-[#2b64d8] group-hover:!border-[#2b64d8] group-hover:!text-white !w-8 !h-8";
  const darkSubTextClass = "!text-[13px] !font-normal !text-slate-300 group-hover:!text-white !tracking-normal !translate-x-0";

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-100/50">
      {/* SIDEBAR CONTAINER */}
      {showSidebar && (
        <div className={`sidebar-transition h-full py-5 pl-3 pr-1 ${isCollapsed ? "w-[96px]" : "w-[270px]"}`}>
          <nav
            className={`flex flex-col h-full bg-gradient-to-b from-[#102035] via-[#13263d] to-[#101c2f] rounded-[1.5rem] shadow-[0_18px_45px_-10px_rgba(5,10,20,0.55)] border border-[#23364e] z-20 relative
              ${isCollapsed ? "px-2 py-5" : "px-3 py-5"}
            `}
          >
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 top-8 bg-[#1e3250] shadow-lg rounded-full p-1.5 text-slate-300 hover:text-white border border-[#30445f] z-30 transition-all hover:scale-110"
              title={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronRight size={16} className="rotate-180" />}
            </button>

            <div className={`flex flex-col items-center justify-center transition-all duration-300 mb-4 gap-2.5
            ${isCollapsed ? "scale-90" : "px-1"}
          `}>
              {!isCollapsed ? (
                <div className="w-full rounded-xl border border-[#2a3d55] bg-[#16283e] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-[#2b64d8] flex items-center justify-center text-white font-black text-xs tracking-wide">
                      SB
                    </div>
                    <div className="leading-tight">
                      <p className="text-[13px] font-black uppercase tracking-wide text-slate-100">Performance</p>
                      <p className="text-[10px] font-medium text-slate-400">Dashboard</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-11 w-11 rounded-xl bg-[#2b64d8] flex items-center justify-center text-white font-black text-xs tracking-wide">SB</div>
              )}


            </div>

            <div className="sidebar flex-1 overflow-y-auto pr-1 space-y-2">
              <li className="list-none">
                <BtnSideBar
                  title="Dashboard"
                  link="../admin/dashboard"
                  isCollapsed={isCollapsed}
                  itemClassName="!rounded-xl !text-slate-200 hover:!bg-[#1f2f45]"
                  iconClassName="!bg-transparent !border !border-[#2a3b52] !text-[#8aaeea] group-hover:!bg-[#2b64d8] group-hover:!border-[#2b64d8] group-hover:!text-white"
                  textClassName="!text-[15px] !font-semibold !text-slate-200 group-hover:!text-white !tracking-normal"
                >
                  <LayoutDashboard size={20} />
                </BtnSideBar>
              </li>

              {!isCollapsed && (
                <p className="px-3 mt-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-90">
                  Menú
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
                  className={`sidebar-transition rounded-xl transition-all ${openModule === key ? "bg-[#1c2d43] border border-[#2c4058]" : "border border-transparent"}
                  ${isCollapsed ? "mb-2" : "p-1.5"}
                `}
                >
                  <button
                    onClick={() => openOnly(key)}
                    className={`w-full flex items-center transition-all duration-300 group rounded-xl
                    ${isCollapsed ? "justify-center p-3" : "justify-between p-2.5 hover:bg-[#24374e]"}
                  `}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                      <div className={`
                      transition-all duration-300 flex items-center justify-center shrink-0
                      ${isCollapsed ? "w-9 h-9 rounded-xl" : "w-8 h-8 rounded-xl"}
                      ${openModule === key
                          ? "text-white bg-[#2b64d8] shadow-md"
                          : "text-slate-400 bg-transparent border border-[#2a3b52] group-hover:text-white group-hover:bg-[#2b64d8] group-hover:border-[#2b64d8]"}
                    `}>
                        {Icon}
                      </div>
                      {!isCollapsed && (
                        <h4 className={`text-[14px] md:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden tracking-normal
                        ${openModule === key ? "text-slate-100" : "text-slate-300 group-hover:text-white"}
                      `}>
                          {label}
                        </h4>
                      )}
                    </div>
                    {!isCollapsed && (
                      <motion.div
                        animate={{ rotate: openModule === key ? 90 : 0 }}
                        className="text-slate-500"
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
                        className="mt-1.5 space-y-1.5 px-1.5 mb-2"
                      >
                        {key === "config" && (
                          <>
                            <BtnSideBar title="Usuarios" link="../admin/users" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Users size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Roles" link="../admin/roles" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Shield size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Administradores" link="../admin/admins" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Shield size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "compras" && (
                          <>
                            <BtnSideBar title="Productos" link="../admin/products" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Shirt size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Categorías" link="../admin/categoriasProductos" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <ChartBarIncreasing size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Proveedores" link="../admin/proveedores" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Truck size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Compras" link="../admin/compras" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <ShoppingBag size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "eventos" && (
                          <>
                            <BtnSideBar title="Eventos" link="../admin/eventos" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Calendar size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Categorías" link="../admin/categoriasEventos" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <ChartBarIncreasing size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Patrocinadores" link="../admin/patrocinadores" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <MapPinHouse size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Sedes" link="../admin/sedes" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <MapPinHouse size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "clases" && (
                          <>
                            <BtnSideBar title="Clases" link="../admin/clases" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Calendar size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Niveles" link="../admin/classLevels" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <ChartBarIncreasing size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Estudiantes" link="../admin/estudiantes" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Users size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Instructores" link="../admin/instructores" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <User size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Matriculas" link="../admin/matriculas" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <School2 size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Preinscripciones" link="../admin/preRegistrations" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <UserPlus size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Planes" link="../admin/plans" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <CreditCard size={16} />
                            </BtnSideBar>
                          </>
                        )}

                        {key === "ventas" && (
                          <>
                            <BtnSideBar title="Clientes" link="../admin/clientes" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <Users size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Pedidos" link="../admin/pedidos" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <ShoppingCart size={16} />
                            </BtnSideBar>
                            <BtnSideBar title="Ventas" link="../admin/ventas" isCollapsed={isCollapsed} itemClassName={darkSubItemClass} iconClassName={darkSubIconClass} textClassName={darkSubTextClass}>
                              <ShoppingBag size={16} />
                            </BtnSideBar>
                          </>
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>


          </nav>
        </div>
      )}

      {/* CONTENT WITH HEADER */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-slate-100/50">
        {/* Dynamic Content Body with "White Table" effect */}
        <div className="flex-1 overflow-hidden p-3 md:p-5 pt-4 md:pt-5 flex flex-col">

          {/* Dynamic Content Body with "White Table" effect */}
          <motion.section
            className="flex-1 overflow-hidden bg-white rounded-[2rem] p-3 md:p-5 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] border border-white flex flex-col relative"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Floating user menu — dentro del área blanca */}
            <div ref={menuRef} className="absolute top-4 right-5 z-50">
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#102035] shadow-md border border-[#23364e] text-slate-300 hover:text-white hover:bg-[#1a3050] transition-all"
                title="Opciones"
              >
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                      {userProfilePic ? (
                        <img src={userProfilePic} alt="Perfil" className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{userName}</p>
                        <p className="text-[11px] text-slate-400">Administrador</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { navigate("../admin/home"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                    >
                      <ArrowLeft size={15} />
                      Volver atrás
                    </button>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm border-t border-slate-100"
                    >
                      <LogOutIcon size={15} />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {children}
          </motion.section>
        </div>
      </section>
    </main>
  );
};
