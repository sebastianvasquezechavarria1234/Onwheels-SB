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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminLayout } from "../../context/AdminLayoutContext";

export const Layout = ({ children }) => {
  const { showSidebar } = useAdminLayout(); // Consume context
   console.log('AdminLayout showSidebar:', showSidebar);
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [timeLeft, setTimeLeft] = useState("");
  const expRef = useRef(null);

  useEffect(() => {
    let exp = localStorage.getItem("tokenExp");
    if (!exp) {
      const oneHourLater = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("tokenExp", oneHourLater);
      exp = oneHourLater;
    }
    expRef.current = parseInt(exp);

    const updateCountdown = () => {
      const remaining = expRef.current - Date.now();
      if (remaining <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = String(Math.floor(remaining / 3600000)).padStart(2, "0");
      const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerRef.current);
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
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-50">
      {/* SIDEBAR - Conditionally rendered */}
      {showSidebar && (
        <nav className="w-[20%] min-w-[280px] flex flex-col px-6 py-8 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-r border-slate-200 shadow-sm">
          <h2 className="mb-8 pb-6 border-b border-slate-200 text-xl font-semibold text-blue-900">
            Admin
          </h2>

          <div className="sidebar flex-1 overflow-y-auto pr-1 space-y-4">
            <li>
              <BtnSideBar title="Dashboard" link="../admin/dashboard">
                <LayoutDashboard size={20} />
              </BtnSideBar>
            </li>

            {[
              ["config", "Configuración"],
              ["compras", "Compras"],
              ["eventos", "Eventos"],
              ["clases", "Clases"],
              ["ventas", "Ventas"],
            ].map(([key, label]) => (
              <div
                key={key}
                className={`rounded-xl p-3 transition-all ${openModule === key
                  ? "bg-white shadow-sm"
                  : "hover:bg-slate-100"
                  }`}
              >
                <button
                  onClick={() => openOnly(key)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h4 className="font-medium text-slate-700 group-hover:text-blue-800 transition">
                    {label}
                  </h4>
                  <motion.div
                    animate={{ rotate: openModule === key ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="text-slate-400 group-hover:text-blue-600"
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openModule === key && (
                    <motion.ul
                      variants={listVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="mt-3 space-y-1"
                    >
                      {key === "config" && (
                        <>
                          <BtnSideBar title="Usuarios" link="../admin/users">
                            <Users size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Administradores" link="../admin/admins">
                            <Shield size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Roles" link="../admin/roles">
                            <Shield size={18} />
                          </BtnSideBar>
                        </>
                      )}

                      {key === "compras" && (
                        <>
                          <BtnSideBar title="Productos" link="../admin/products">
                            <Shirt size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Categorías" link="../admin/categoriasProductos">
                            <ChartBarIncreasing size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Proveedores" link="../admin/proveedores">
                            <Users size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Compras" link="../admin/compras">
                            <ShoppingBag size={18} />
                          </BtnSideBar>
                        </>
                      )}

                      {key === "eventos" && (
                        <>
                          <BtnSideBar title="Eventos" link="../admin/eventos">
                            <Calendar size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Categorías" link="../admin/categoriasEventos">
                            <ChartBarIncreasing size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Correos" link="../admin/correos-masivos">
                            <Mails size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Sedes" link="../admin/sedes">
                            <MapPinHouse size={18} />
                          </BtnSideBar>
                        </>
                      )}

                      {key === "clases" && (
                        <>
                          <BtnSideBar title="Clases" link="../admin/clases">
                            <Calendar size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Niveles" link="../admin/classLevels">
                            <ChartBarIncreasing size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Estudiantes" link="../admin/estudiantes">
                            <Users size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Instructores" link="../admin/instructores">
                            <User size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Preinscripciones" link="../admin/preRegistrations">
                            <UserPlus size={18} />
                          </BtnSideBar>
                        </>
                      )}

                      {key === "ventas" && (
                        <>
                          <BtnSideBar title="Ventas" link="../admin/ventas">
                            <ShoppingBag size={18} />
                          </BtnSideBar>
                          <BtnSideBar title="Clientes" link="../admin/clientes">
                            <Users size={18} />
                          </BtnSideBar>
                        </>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-full
             bg-blue-900 hover:bg-blue-800
             text-white px-4 py-3
             transition shadow-md"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full">
              <LogOutIcon size={18} className="text-blue-900" />
            </div>
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </nav>
      )}

      {/* CONTENT */}
      <motion.section
        className={`${showSidebar ? "w-[80%]" : "w-full"} h-full overflow-y-auto bg-white`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.section>
    </main>
  );
};
