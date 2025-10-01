import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { BtnSideBar } from "../../BtnSideBar";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";
import { ArrowLeft, LogOut, School, Settings, ShoppingBag, User, Users, X } from "lucide-react";

export const Layout = ({ children }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // actualiza cada segundo
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("es-CO");

  return (
    <main
      className="relative w-full h-screen flex gap-[10px] overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Sidebar */}
      <nav className=" h-full w-[20%] p-[30px] border-r border-black/20  z-10">
        <h2 className="mb-[20px] border-b pb-[30px] border-black/20 font-primary">
          Estudiante
        </h2>
        <div className="flex flex-col justify-between h-[83%]">
          <ul className="">
            <li>
              <BtnSideBar title="Mi cuenta" link="../student/setting">
                <Settings size={20} strokeWidth={1.5}/>
              </BtnSideBar>
            </li>

            <li>
              <BtnSideBar title="Mis clases" link="../student/myClasses">
                <School size={20} className="text-black/70" strokeWidth={1.5}/>
              </BtnSideBar>
            </li>
            <li>
              <BtnSideBar title="Mis compras" link="../student/myPurchases">
                <ShoppingBag size={20} className="text-black/80 " strokeWidth={1.5} />
              </BtnSideBar>
            </li>
            <li>
              <BtnSideBar title="Cerrar session" link="/" styleIcon="bg-red-700" style="text-red-700">
                <LogOut size={20} className="text-white " strokeWidth={2} />
              </BtnSideBar>
            </li>
          </ul>

          {/* Footer movido (fecha, hora y botón) — exactamente igual en estilos */}
          <ul className="sticky bottom-0 bg-gray-100 p-[20px] rounded-[30px] border-1 border-black/10 ">
            <div className="flex flex-col gap-[10px] mb-[10px]">
              <p className="text-sm capitalize">{dateStr}</p>
              <p className="flex gap-[10px] items-center">
                <span className="w-[10px] h-[10px] block bg-green-600 rounded-full"></span>
                {timeStr}
              </p>
            </div>
            <BtnLinkIcon link="../student/home" title="Cerrar Dashboard" style="bg-[var(--color-blue)]! text-white pr-[25px] w-full" styleIcon="bg-white!">
              <ArrowLeft className="text-[var(--color-blue)]" strokeWidth={2}/>
            </BtnLinkIcon>
          </ul>

        </div>

      </nav>

      {/* Contenido animado con entrada y salida mejoradas */}
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
          overflowY: "auto", // Scroll funcional
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.section>
    </main>
  );
};
