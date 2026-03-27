import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BtnSideBar } from "../../BtnSideBar";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";
import { ArrowLeft, LogOut, Menu, Settings, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Layout = ({ children }) => {
  const [now, setNow] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const dateStr = now.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("es-CO");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      <h2 className="mb-[20px] border-b pb-[30px] border-black/20 font-primary">
        Cliente
      </h2>
      <div className="flex flex-col justify-between h-[83%]">
        <ul>
          <li>
            <BtnSideBar title="Mi cuenta" link="../users/setting" onClick={() => setSidebarOpen(false)}>
              <Settings size={20} strokeWidth={1.5} />
            </BtnSideBar>
          </li>
          <li>
            <BtnSideBar title="Mis compras" link="../users/myPurchases" onClick={() => setSidebarOpen(false)}>
              <ShoppingBag size={20} className="text-black/80" strokeWidth={1.5} />
            </BtnSideBar>
          </li>

          <li>
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full flex items-center gap-[10px] text-red-700"
            >
              <span className="w-[60px] h-[60px] flex justify-center items-center bg-red-700 rounded-full max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[40px] max-md:h-[40px]">
                <LogOut className="text-white" size={20} strokeWidth={2} />
              </span>
              <h4>Cerrar sesión</h4>
            </button>
          </li>
        </ul>

        <ul className="sticky bottom-0 bg-gray-100 p-[20px] rounded-[30px] border-1 border-black/10">
          <div className="flex flex-col gap-[10px] mb-[10px]">
            <p className="text-sm capitalize">{dateStr}</p>
            <p className="flex gap-[10px] items-center">
              <span className="w-[10px] h-[10px] block bg-green-600 rounded-full"></span>
              {timeStr}
            </p>
          </div>
          <BtnLinkIcon
            link="../student/home"
            title="Cerrar Dashboard"
            style="bg-[var(--color-blue)]! text-white pr-[25px] w-full"
            styleIcon="bg-white!"
          >
            <ArrowLeft className="text-[var(--color-blue)]" strokeWidth={2} />
          </BtnLinkIcon>
        </ul>
      </div>
    </>
  );

  return (
    <main
      className="relative w-full h-screen flex gap-[10px] overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* ─── Sidebar DESKTOP (visible en md+) ─── */}
      <nav className="hidden md:flex flex-col h-full w-[20%] p-[30px] border-r border-black/20 z-10">
        <SidebarContent />
      </nav>

      {/* ─── Botón hamburguesa MOBILE ─── */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[150] bg-white border border-black/10 rounded-full w-11 h-11 flex items-center justify-center shadow-lg"
        aria-label="Abrir menú"
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      {/* ─── Drawer MOBILE ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.nav
              key="drawer"
              className="fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-[170] p-[30px] flex flex-col overflow-y-auto shadow-2xl md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full border border-black/10 flex items-center justify-center"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>

              <SidebarContent />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ─── Contenido animado ─── */}
      <motion.section
        className="w-full md:w-[80%] hide-scrollbar"
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
          delay: 0.1,
          duration: 1,
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
