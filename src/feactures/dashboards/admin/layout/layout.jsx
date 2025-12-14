import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../hooks/dashboard.css";
import { BtnSideBar } from "../../BtnSideBar";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";
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

export const Layout = ({ children }) => {
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔐 Contador persistente y sin brinco
  const [timeLeft, setTimeLeft] = useState("");
  const expRef = useRef(null);

  useEffect(() => {
    // Leer o crear expiración persistente
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
      const hours = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(2, "0");
      const minutes = String(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
      const seconds = String(Math.floor((remaining % (1000 * 60)) / 1000)).padStart(2, "0");
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerRef.current);
  }, []); // ✅ Solo corre una vez, no se reinicia al cambiar de ruta

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExp");
    navigate("/login");
  };

  const [openModule, setOpenModule] = useState(() => localStorage.getItem("openModule") || "config");

  const openOnly = (key) => {
    setOpenModule((prev) => {
      if (prev === key) return prev;
      localStorage.setItem("openModule", key);
      return key;
    });
  };

  const listVariants = {
    initial: { opacity: 0, height: 0, rotateX: -8, y: -4, scaleY: 0.98 },
    animate: {
      opacity: 1,
      height: "auto",
      rotateX: 0,
      y: 0,
      scaleY: 1,
      transition: {
        type: "spring",
        stiffness: 360,
        damping: 28,
        restDelta: 0.001,
        duration: 0.25,
        staggerChildren: 0,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      rotateX: -8,
      y: -4,
      scaleY: 0.98,
      transition: { duration: 0.2, ease: [0.25, 0.8, 0.25, 1], staggerChildren: 0 },
    },
  };

  const itemVariants = {
    initial: { opacity: 1, y: 0, scale: 1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <main
      className="relative w-full h-screen flex gap-[10px] overflow-hidden"
      style={{ perspective: "1600px" }}
    >
      <nav className="relative h-full w-[20%] p-[30px] border-r pb-[10px] border-black/20 z-10 max-2xl:p-[15px] flex flex-col">
        <h2 className="mb-[20px] border-b pb-[30px] border-black/20 font-primary max-2xl:pb-[15px] dashboard__title">
          Admin
        </h2>

        <div className="sidebar flex-1 overflow-y-scroll pr-1">
          <li className="mt-[7px] mb-[13px]">
            <BtnSideBar title="Dashboard" link="/admin/dashboard">
              <LayoutDashboard size={20} strokeWidth={1.5} />
            </BtnSideBar>
          </li>

          {/* CONFIGURACIÓN */}
          <div
            className={`mb-[20px] border-b ${
              openModule === "config" ? "border-transparent" : "border-black/10"
            } transition-all duration-300 pb-[14px]`}
          >
            <button
              type="button"
              onClick={() => openOnly("config")}
              className="w-full text-left flex items-center justify-between mb-[6px] cursor-pointer group"
            >
              <h4 className="font-primary mb-[0px] group-hover:text-[var(--color-blue)] transition-colors duration-200">
                Configuración:
              </h4>
              <motion.div
                animate={{ rotate: openModule === "config" ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                className="ml-2 text-black/70 group-hover:text-[var(--color-blue)]"
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openModule === "config" && (
                <motion.ul
                  key="config"
                  variants={listVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ overflow: "hidden" }}
                >
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Usuarios" link="/admin/users">
                      <Users size={20} strokeWidth={1.5} />
                    </BtnSideBar>
                  </motion.li>

           <motion.li variants={itemVariants}>
                    <BtnSideBar title="Adminsitradores" link="/admin/admins">
                      <Shield
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>

                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Roles" link="/admin/roles">
                      <Shield
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>

                  
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* COMPRAS */}
          <div
            className={`mb-[20px] border-b ${
              openModule === "compras" ? "border-transparent" : "border-black/10"
            } transition-all duration-300 pb-[14px]`}
          >
            <button
              type="button"
              onClick={() => openOnly("compras")}
              className="w-full text-left flex items-center justify-between mb-[6px] cursor-pointer group"
            >
              <h4 className="font-primary mb-[0px] group-hover:text-[var(--color-blue)] transition-colors duration-200">
                Compras:
              </h4>
              <motion.div
                animate={{ rotate: openModule === "compras" ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                className="ml-2 text-black/70 group-hover:text-[var(--color-blue)]"
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openModule === "compras" && (
                <motion.ul
                  key="compras"
                  variants={listVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ overflow: "hidden" }}
                >
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Productos" link="/admin/products">
                      <Shirt size={20} strokeWidth={1.5} />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar
                      title="Categoria de productos"
                      link="/admin/categoriasProductos"
                    >
                      <ChartBarIncreasing
                        size={20}
                        strokeWidth={1.8}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Proveedores" link="/admin/proveedores">
                      <Users
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Compras" link="/admin/compras">
                      <ShoppingBag
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* EVENTOS */}
          <div
            className={`mb-[20px] border-b ${
              openModule === "eventos" ? "border-transparent" : "border-black/10"
            } transition-all duration-300 pb-[14px]`}
          >
            <button
              type="button"
              onClick={() => openOnly("eventos")}
              className="w-full text-left flex items-center justify-between mb-[6px] cursor-pointer group"
            >
              <h4 className="font-primary mb-[0px] group-hover:text-[var(--color-blue)] transition-colors duration-200">
                Eventos:
              </h4>
              <motion.div
                animate={{ rotate: openModule === "eventos" ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                className="ml-2 text-black/70 group-hover:text-[var(--color-blue)]"
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openModule === "eventos" && (
                <motion.ul
                  key="eventos"
                  variants={listVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ overflow: "hidden" }}
                >
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Eventos" link="/admin/eventos">
                      <Calendar size={20} strokeWidth={1.5} />
                    </BtnSideBar>
                  </motion.li>

                  <motion.li variants={itemVariants}>
                    <BtnSideBar
                      title="Categoria de eventos"
                      link="/admin/categoriasEventos"
                    >
                      <ChartBarIncreasing
                        size={20}
                        strokeWidth={1.8}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>

                   <motion.li variants={itemVariants}>
                    <BtnSideBar
                      title="Correos Masivos"
                      link="/admin/correos-masivos"
                    >
                      <Mails
                        size={20}
                        strokeWidth={1.8}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>

                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Sedes" link="/admin/sedes">
                      <MapPinHouse
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar
                      title="Patrocinadores"
                      link="/admin/patrocinadores"
                    >
                      <Users
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* CLASES */}
          <div
            className={`mb-[20px] border-b ${
              openModule === "clases" ? "border-transparent" : "border-black/10"
            } transition-all duration-300 pb-[14px]`}
          >
            <button
              type="button"
              onClick={() => openOnly("clases")}
              className="w-full text-left flex items-center justify-between mb-[6px] cursor-pointer group"
            >
              <h4 className="font-primary mb-[0px] group-hover:text-[var(--color-blue)] transition-colors duration-200">
                Clases:
              </h4>
              <motion.div
                animate={{ rotate: openModule === "clases" ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                className="ml-2 text-black/70 group-hover:text-[var(--color-blue)]"
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openModule === "clases" && (
                <motion.ul
                  key="clases"
                  variants={listVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ overflow: "hidden" }}
                >
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Clases" link="/admin/clases">
                      <Calendar size={20} strokeWidth={1.5} />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar
                      title="Niveles de clases"
                      link="/admin/classLevels"
                    >
                      <ChartBarIncreasing
                        size={20}
                        strokeWidth={1.8}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Estudiantes" link="/admin/estudiantes">
                      <Users
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Instructores" link="/admin/instructores">
                      <User size={20} strokeWidth={1.5} />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar
                      title="PreInscrpciones"
                      link="/admin/preRegistrations"
                    >
                      <UserPlus
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Matriculas" link="/admin/matriculas">
                      <Users
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                  <motion.li variants={itemVariants}>
                    <BtnSideBar title="Planes" link="/admin/plans">
                      <Users
                        size={20}
                        strokeWidth={1.5}
                        className="text-black/80"
                      />
                    </BtnSideBar>
                  </motion.li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER STICKY */}
        <ul className="sticky bottom-0 bg-gray-100 p-[20px] rounded-[30px] border-1 border-black/10 mt-auto shadow-sm">
        
        <div className="flex gap-[10px] items-start">
            <span className="translate-y-[6px] w-[10px] h-[10px] block bg-green-600 rounded-full"></span>
          <p className=" mb-[10px] select-none">
            El token de seguridad expirará en:{" "}
            <span className="font-semibold italic text-green-700 transition-none">
              {timeLeft}
            </span>
          </p>

        </div>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer bg-[var(--color-blue)] text-white w-full inline-flex items-center rounded-full gap-[8px] p-[3px_13px_3px_3px]"
          >
            <div className="w-[60px] h-[60px] flex justify-center items-center bg-white rounded-full">
              <LogOutIcon className="text-black" strokeWidth={2.5} size={20} />
            </div>
            <h4 className="italic">Cerrar sesión</h4>
          </button>
        </ul>
      </nav>

      <motion.section
        className="w-[80%] hide-scrollbar"
        initial={{
          opacity: 0,
          scale: 0.3,
          rotateX: -45,
          rotateY: 10,
          filter: "blur(20px)",
          transformOrigin: "center center",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          filter: "blur(0px)",
        }}
        transition={{
          delay: 0.05,
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          height: "100%",
          overflowY: "auto",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.section>
    </main>
  );
};