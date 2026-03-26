"use client"

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LogOutIcon,
  ArrowLeft,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSidebar } from "./CustomSidebar";
import { AdminLayoutContext } from "../../context/AdminLayoutContext";

export const CustomDashboardLayout = ({ children }) => {
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

  const [userName, setUserName] = useState("Usuario");
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || "Usuario");
        setUserProfilePic(user.foto_perfil || null);
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExp");
    navigate("/login");
  };

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-100/50">
      {/* SIDEBAR CONTAINER */}
      <div className={`sidebar-transition h-full py-5 pl-3 pr-1 ${isCollapsed ? "w-[96px]" : "w-[270px]"}`}>
        <CustomSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* CONTENT WITH HEADER */}
      <section className="flex-1 h-full overflow-hidden flex flex-col bg-slate-100/50">
        <div className="flex-1 overflow-hidden p-3 md:p-5 pt-4 md:pt-5 flex flex-col">
          <motion.section
            className="flex-1 overflow-y-auto bg-white rounded-[2rem] p-3 md:p-5 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] border border-white flex flex-col relative"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Floating user menu */}
            <div ref={menuRef} className="absolute top-4 right-5 z-30">
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
                        <p className="text-[11px] text-slate-400">Cliente</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { navigate("/custom/home"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
                    >
                      <ArrowLeft size={15} />
                      Ir al inicio
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

            <AdminLayoutContext.Provider value={{ showSidebar: false }}>
              {children}
            </AdminLayoutContext.Provider>
          </motion.section>
        </div>
      </section>
    </main>
  );
};
