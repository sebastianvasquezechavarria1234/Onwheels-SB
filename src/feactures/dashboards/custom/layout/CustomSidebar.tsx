"use client"

import React, { useState } from "react";
import { 
  Users, 
  Shield, 
  Package, 
  ShoppingCart, 
  Calendar, 
  MapPin, 
  BookOpen, 
  UserCheck, 
  FileText, 
  CreditCard, 
  LayoutDashboard,
  ChevronRight,
  ChartBarIncreasing
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BtnSideBar } from "../../BtnSideBar";
import { canView, canManage } from "../../../../utils/permissions";

export const CustomSidebar = ({ isCollapsed, toggleSidebar }) => {
  const [openModule, setOpenModule] = useState(
    () => localStorage.getItem("customOpenModule") || null
  );

  const openOnly = (key) => {
    setOpenModule((prev) => {
      const next = prev === key ? null : key;
      if (next) localStorage.setItem("customOpenModule", next);
      else localStorage.removeItem("customOpenModule");
      return next;
    });
  };

  const hasAccess = (resource: string) => {
    return canView(resource) || canManage(resource);
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

  const modules = [
    {
      key: "admin",
      label: "Configuración",
      icon: <Shield size={isCollapsed ? 20 : 18} />,
      items: [
        { title: "Usuarios", link: "/custom/usuarios", icon: <Users size={16} />, permission: "usuarios" },
        { title: "Roles", link: "/custom/roles", icon: <Shield size={16} />, permission: "roles" },
      ]
    },
    {
      key: "comercial",
      label: "Compras",
      icon: <Package size={isCollapsed ? 20 : 18} />,
      items: [
        { title: "Productos", link: "/custom/productos", icon: <Package size={16} />, permission: "productos" },
        { title: "Categorías", link: "/custom/categorias", icon: <ChartBarIncreasing size={16} />, permission: "categoria_productos" },
        { title: "Proveedores", link: "/custom/proveedores", icon: <UserCheck size={16} />, permission: "proveedores" },
        { title: "Compras", link: "/custom/compras", icon: <ShoppingCart size={16} />, permission: "compras" },
        { title: "Ventas", link: "/custom/ventas", icon: <ShoppingCart size={16} />, permission: "ventas" },
      ]
    },
    {
      key: "eventos",
      label: "Gestión de Eventos",
      icon: <Calendar size={isCollapsed ? 20 : 18} />,
      items: [
        { title: "Eventos", link: "/custom/eventos", icon: <Calendar size={16} />, permission: "eventos" },
        { title: "Sedes", link: "/custom/sedes", icon: <MapPin size={16} />, permission: "sedes" },
      ]
    },
    {
      key: "academia",
      label: "Clases",
      icon: <BookOpen size={isCollapsed ? 20 : 18} />,
      items: [
        { title: "Clases", link: "/custom/clases", icon: <BookOpen size={16} />, permission: "clases" },
        { title: "Inscripciones", link: "/custom/preinscripciones", icon: <FileText size={16} />, permission: "preinscripciones" },
        { title: "Matrículas", link: "/custom/matriculas", icon: <CreditCard size={16} />, permission: "matriculas" },
        { title: "Planes", link: "/custom/planes", icon: <FileText size={16} />, permission: "planes" },
      ]
    }
  ];

  return (
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

      <div className="sidebar flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        <li className="list-none">
          <BtnSideBar
            title="Dashboard"
            link="/custom/home"
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

        {modules.map((mod) => {
          const visibleItems = mod.items.filter(item => hasAccess(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <div
              key={mod.key}
              className={`sidebar-transition rounded-xl transition-all ${openModule === mod.key ? "bg-[#1c2d43] border border-[#2c4058]" : "border border-transparent"}
                ${isCollapsed ? "mb-2" : "p-1.5"}
              `}
            >
              <button
                onClick={() => openOnly(mod.key)}
                className={`w-full flex items-center transition-all duration-300 group rounded-xl
                  ${isCollapsed ? "justify-center p-3" : "justify-between p-2.5 hover:bg-[#24374e]"}
                `}
              >
                <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                  <div className={`
                    transition-all duration-300 flex items-center justify-center shrink-0
                    ${isCollapsed ? "w-9 h-9 rounded-xl" : "w-8 h-8 rounded-xl"}
                    ${openModule === mod.key
                      ? "text-white bg-[#2b64d8] shadow-md"
                      : "text-slate-400 bg-transparent border border-[#2a3b52] group-hover:text-white group-hover:bg-[#2b64d8] group-hover:border-[#2b64d8]"}
                  `}>
                    {mod.icon}
                  </div>
                  {!isCollapsed && (
                    <h4 className={`text-[14px] md:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden tracking-normal
                      ${openModule === mod.key ? "text-slate-100" : "text-slate-300 group-hover:text-white"}
                    `}>
                      {mod.label}
                    </h4>
                  )}
                </div>
                {!isCollapsed && (
                  <motion.div
                    animate={{ rotate: openModule === mod.key ? 90 : 0 }}
                    className="text-slate-500"
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                )}
              </button>

              <AnimatePresence>
                {openModule === mod.key && !isCollapsed && (
                  <motion.ul
                    variants={listVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="mt-1.5 space-y-1.5 px-1.5 mb-2"
                  >
                    {visibleItems.map((item, idx) => (
                      <BtnSideBar 
                        key={idx}
                        title={item.title} 
                        link={item.link} 
                        isCollapsed={isCollapsed} 
                        itemClassName={darkSubItemClass} 
                        iconClassName={darkSubIconClass} 
                        textClassName={darkSubTextClass}
                      >
                        {item.icon}
                      </BtnSideBar>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
