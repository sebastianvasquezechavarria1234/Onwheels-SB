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
  LogOut
} from "lucide-react"
import { canView, canManage, getUserPermissions } from "../../../../utils/permissions"

const SidebarItem = ({ title, link, icon, isActive }) => (
  <Link
    to={link}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium
      ${isActive
        ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] border border-emerald-500/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
  >
    <span className={`${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white"}`}>
      {icon}
    </span>
    {title}
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
          link: "/custom/categorias",
          icon: <Layers size={20} />,
          permission: "categorias",
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
          title: "Cat. Eventos",
          link: "/custom/categoria-eventos",
          icon: <Award size={20} />,
          permission: "categoria_eventos",
        },
        {
          title: "Sedes",
          link: "/custom/sedes",
          icon: <MapPin size={20} />,
          permission: "sedes",
        },
        {
          title: "Patrocinadores",
          link: "/custom/patrocinadores",
          icon: <Award size={20} />,
          permission: "patrocinadores",
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
          title: "Niveles",
          link: "/custom/niveles",
          icon: <Layers size={20} />,
          permission: "niveles",
        },
        {
          title: "Estudiantes",
          link: "/custom/estudiantes",
          icon: <GraduationCap size={20} />,
          permission: "estudiantes",
        },
        {
          title: "Instructores",
          link: "/custom/instructores",
          icon: <UserCheck size={20} />,
          permission: "instructores",
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
    <aside className="w-[280px] h-screen bg-[#0f172a] flex flex-col sticky top-0 border-r border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-6 pb-2">
        <Link to="/custom/home" className="block">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
              OW
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Performance SB<span className="text-emerald-500">.</span></span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
            <div key={index} className="animate-in fade-in duration-500">
              <h4 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                {item.section}
              </h4>
              <div className="space-y-1">
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

      <div className="p-4 bg-[#0B1120] border-t border-slate-800">
        <Link
          to="/custom/home"
          className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 border border-transparent transition-all duration-300 group"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Salir del Dashboard</span>
        </Link>
      </div>
    </aside>
  )
}

 
