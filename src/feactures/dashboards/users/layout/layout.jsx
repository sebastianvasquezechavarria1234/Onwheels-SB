import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BtnSideBar } from "../../BtnSideBar";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";
import { ArrowLeft, LogOut, Settings, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Layout = ({ children }) => {
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("es-CO");

  // --- Lógica cerrar sesión ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  // ----------------------------

  return (
    <main
      className="relative w-full h-screen flex gap-[10px] overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Sidebar */}
      <nav className="h-full w-[20%] p-[30px] border-r border-black/20 z-10">
        <h2 className="mb-[20px] border-b pb-[30px] border-black/20 font-primary">
          Estudiante
        </h2>
        <div className="flex flex-col justify-between h-[83%]">
          <ul>
            <li>
              <BtnSideBar title="Mi cuenta" link="../users/setting">
                <Settings size={20} strokeWidth={1.5} />
              </BtnSideBar>
            </li>
            <li>
              <BtnSideBar title="Mis compras" link="../users/myPurchases">
                <ShoppingBag size={20} className="text-black/80" strokeWidth={1.5} />
              </BtnSideBar>
            </li>

            {/* 🔴 Botón rojo de cerrar sesión funcional */}
            <li>
              <button
                onClick={handleLogout}
               
                className="cursor-pointer w-full flex items-center gap-[10px] text-red-700"
              >
                <span className="w-[60px] h-[60px] flex justify-center items-center bg-red-700 rounded-full max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[30px] max-md:h-[30px]">
                  <LogOut className="text-white" size={20} strokeWidth={2} />

                </span>
                <h4>Cerrar session</h4>
              </button>
            </li>
          </ul>

          {/* Footer con fecha y hora */}
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
      </nav>

      {/* Contenido animado */}
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
