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
} from "lucide-react"

import { canView, canManage, getUserPermissions } from "../../../../utils/permissions"

interface SidebarItemProps {
  title: string
  link: string
  icon: React.ReactNode
  isActive: boolean
}

const SidebarItem = ({ title, link, icon, isActive }: SidebarItemProps) => (
  <Link
    to={link}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
      ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
  >
    <span className={isActive ? "text-emerald-400" : "text-slate-500"}>
      {icon}
    </span>
    {title}
  </Link>
)

export const CustomSidebar = () => {
  const location = useLocation()
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    setPermissions(getUserPermissions())
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

  const hasAccess = (resource: string | null) => {
    if (!resource) return true
    return canView(resource) || canManage(resource)
  }

  return (
    <aside className="w-[280px] h-screen bg-[#0f172a] flex flex-col sticky top-0 border-r border-slate-800">
      {/* Logo */}
      <div className="p-6">
        <Link to="/custom/home" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
            OW
          </div>
          <span className="text-xl font-bold text-white">
            OnWheels<span className="text-emerald-500">.</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
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

          const visibleItems = item.items.filter(sub =>
            hasAccess(sub.permission)
          )

          if (visibleItems.length === 0) return null

          return (
            <div key={index}>
              <h4 className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase">
                {item.section}
              </h4>
              <div className="space-y-1">
                {visibleItems.map((sub, subIndex) => (
                  <SidebarItem
                    key={`${index}-${subIndex}`}
                    title={sub.title}
                    link={sub.link}
                    icon={sub.icon}
                    isActive={location.pathname === sub.link}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/custom/home"
          className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Salir del Dashboard</span>
        </Link>
      </div>
    </aside>
  )
}
