"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Users,
  Shield,
  Package,
  ShoppingCart,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  GraduationCap,
  UserCheck,
  FileText,
  CreditCard,
  Layers,
  LogOut,
  UserPlus,
  ChartBarIncreasing,
  ChevronRight
} from "lucide-react"
import { canView, canManage, getUserPermissions } from "../../../../utils/permissions"
import { motion } from "framer-motion"

const SidebarItem = ({ title, link, icon, isActive }) => (
  <Link
    to={link}
    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group text-sm font-bold tracking-tight
      ${isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
      }`}
  >
    <div className="flex items-center gap-3">
      <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`}>
        {icon}
      </span>
      {title}
    </div>
    {isActive && <ChevronRight size={14} className="opacity-50" />}
  </Link>
)

export const CustomSidebar = () => {
  const location = useLocation()
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    const perms = getUserPermissions()
    setPermissions(perms)
  }, [])

  const sidebarConfig = [
    {
      title: "Dashboard",
      link: "/custom/dashboard",
      icon: <Home size={20} />,
      permission: null,
    },
    {
      section: "Administración",
      items: [
        {
          title: "Usuarios",
          link: "/custom/usuarios",
          icon: <Users size={20} />,
          permission: "usuarios",
        },
        {
          title: "Roles y Permisos",
          link: "/custom/roles",
          icon: <Shield size={20} />,
          permission: "roles",
        },
      ],
    },
    {
      section: "Comercial",
      items: [
        {
          title: "Productos",
          link: "/custom/productos",
          icon: <Package size={20} />,
          permission: "productos",
        },
        {
          title: "Categorías",
          permission: "categoria_productos",
          link: "/custom/categorias",
          icon: <ChartBarIncreasing size={20} />,
        },
        {
          title: "Proveedores",
          link: "/custom/proveedores",
          icon: <UserCheck size={20} />,
          permission: "proveedores",
        },
        {
          title: "Compras",
          link: "/custom/compras",
          icon: <ShoppingCart size={20} />,
          permission: "compras",
        },
        {
          title: "Ventas",
          link: "/custom/ventas",
          icon: <ShoppingCart size={20} />,
          permission: "ventas",
        },
      ],
    },
    {
      section: "Gestión de Eventos",
      items: [
        {
          title: "Eventos",
          link: "/custom/eventos",
          icon: <Calendar size={20} />,
          permission: "eventos",
        },
        {
          title: "Sedes",
          link: "/custom/sedes",
          icon: <MapPin size={20} />,
          permission: "sedes",
        },
      ],
    },
    {
      section: "Academia",
      items: [
        {
          title: "Clases",
          link: "/custom/clases",
          icon: <BookOpen size={20} />,
          permission: "clases",
        },
        {
          title: "Inscripciones",
          link: "/custom/preinscripciones",
          icon: <FileText size={20} />,
          permission: "preinscripciones",
        },
        {
          title: "Matrículas",
          link: "/custom/matriculas",
          icon: <CreditCard size={20} />,
          permission: "matriculas",
        },
        {
          title: "Planes",
          link: "/custom/planes",
          icon: <FileText size={20} />,
          permission: "planes",
        },
      ],
    },
  ]

  const hasAccess = (resource) => {
    if (!resource) return true
    return canView(resource) || canManage(resource)
  }

  return (
    <aside className="w-[300px] h-screen bg-[#020617] flex flex-col sticky top-0 border-r border-slate-800/50 overflow-hidden shadow-2xl">
      <div className="p-8">
        <Link to="/custom/home" className="group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-white/5">
              <span className="text-black font-black text-xl italic tracking-tighter">SB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white leading-none tracking-tighter whitespace-nowrap">
                Performance SB
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-blue-500 uppercase leading-none mt-1">
                Dashboard
              </span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 pb-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sidebarConfig.map((item, index) => {
          if (!item.section) {
            if (!hasAccess(item.permission)) return null
            return (
              <SidebarItem
                key={index}
                title={item.title}
                link={item.link}
                icon={item.icon}
                isActive={location.pathname === item.link}
              />
            )
          }

          const visibleItems = item.items.filter(subItem => hasAccess(subItem.permission))
          if (visibleItems.length === 0) return null

          return (
            <div key={index} className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h4 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                {item.section}
              </h4>
              <div className="space-y-1.5">
                {visibleItems.map((subItem, subIndex) => (
                  <SidebarItem
                    key={`${index}-${subIndex}`}
                    title={subItem.title}
                    link={subItem.link}
                    icon={subItem.icon}
                    isActive={location.pathname === subItem.link}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="p-6 bg-[#020617] border-t border-slate-800/50">
        <Link
          to="/custom/home"
          className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-slate-900 text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all duration-500 group"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-xs uppercase tracking-widest">Salir</span>
        </Link>
      </div>
    </aside>
  )
}
