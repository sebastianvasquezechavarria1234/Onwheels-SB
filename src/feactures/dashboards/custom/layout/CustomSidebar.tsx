"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
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
  LogOut,
  UserPlus,
  ChartBarIncreasing,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react"
import { canView, canManage, getUserPermissions } from "../../../../utils/permissions"

// ─── Ítem del sidebar (estilo captura: navy oscuro, hover sutil, activo azul) ─
const SidebarItem = ({ title, link, icon, isActive }) => (
  <Link
    to={link}
    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-[13px] font-semibold"
    style={{
      color:      isActive ? "#fff" : "rgba(255,255,255,0.5)",
      background: isActive ? "rgba(59,130,246,0.18)" : "transparent",
    }}
    onMouseEnter={e => {
      if (!isActive) {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)"
        e.currentTarget.style.color      = "rgba(255,255,255,0.9)"
      }
    }}
    onMouseLeave={e => {
      if (!isActive) {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color      = "rgba(255,255,255,0.5)"
      }
    }}
  >
    <div className="flex items-center gap-3">
      <span style={{ color: isActive ? "#60a5fa" : "rgba(255,255,255,0.3)" }}>
        {icon}
      </span>
      {title}
    </div>
    {isActive && (
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}
      />
    )}
  </Link>
)

// ─── Logo SB con gradiente (idéntico a la captura) ──────────────────────────
const SBLogo = () => (
  <div
    style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
    }}
  >
    <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: "-0.5px" }}>
      SB
    </span>
  </div>
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
      section: "Administración",
      items: [
        { title: "Usuarios",       link: "/custom/usuarios",  icon: <Users size={16} />,           permission: "usuarios" },
        { title: "Roles y Permisos",link: "/custom/roles",   icon: <Shield size={16} />,           permission: "roles" },
      ],
    },
    {
      section: "Comercial",
      items: [
        { title: "Productos",   link: "/custom/productos",   icon: <Package size={16} />,          permission: "productos" },
        { title: "Categorías",  link: "/custom/categorias",  icon: <ChartBarIncreasing size={16}/>, permission: "categoria_productos" },
        { title: "Proveedores", link: "/custom/proveedores", icon: <UserCheck size={16} />,        permission: "proveedores" },
        { title: "Compras",     link: "/custom/compras",     icon: <ShoppingCart size={16} />,     permission: "compras" },
        { title: "Ventas",      link: "/custom/ventas",      icon: <ShoppingCart size={16} />,     permission: "ventas" },
      ],
    },
    {
      section: "Gestión de Eventos",
      items: [
        { title: "Eventos", link: "/custom/eventos", icon: <Calendar size={16} />, permission: "eventos" },
        { title: "Sedes",   link: "/custom/sedes",   icon: <MapPin size={16} />,   permission: "sedes" },
      ],
    },
    {
      section: "Academia",
      items: [
        { title: "Clases",        link: "/custom/clases",          icon: <BookOpen size={16} />,  permission: "clases" },
        { title: "Inscripciones", link: "/custom/preinscripciones",icon: <FileText size={16} />,  permission: "preinscripciones" },
        { title: "Matrículas",    link: "/custom/matriculas",      icon: <CreditCard size={16} />, permission: "matriculas" },
        { title: "Planes",        link: "/custom/planes",          icon: <FileText size={16} />,  permission: "planes" },
      ],
    },
  ]

  const hasAccess = (resource: string | undefined) => {
    if (!resource) return true
    return canView(resource) || canManage(resource)
  }

  // Obtener usuario del localStorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}") } catch { return {} }
  })()
  const userName  = user?.nombre_completo || "Usuario"
  const userRole  = user?.rol             || "Cliente"
  const initials  = userName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()

  return (
    <aside
      className="w-[260px] h-screen flex flex-col sticky top-0 overflow-hidden"
      style={{
        background:   "#0d1436",
        borderRight:  "1px solid rgba(255,255,255,0.07)",
        boxShadow:    "4px 0 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* ── LOGO / MARCA ──────────────────────────────────────── */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link to="/custom/home" className="flex items-center gap-3 select-none">
          <SBLogo />
          <div className="leading-none">
            <p className="text-[14px] font-black text-white uppercase tracking-tight">
              Performance
            </p>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.18em] mt-0.5">
              Dashboard
            </p>
          </div>
        </Link>
      </div>

      {/* ── PERFIL DE USUARIO (igual que la captura) ──────────── */}
      <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
          >
            {initials}
          </div>
          <div className="leading-none min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-white/35 mt-0.5">{userRole}</p>
          </div>
        </div>
      </div>

      {/* ── NAV ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {sidebarConfig.map((group, gIdx) => {
          const visible = group.items.filter(i => hasAccess(i.permission))
          if (!visible.length) return null
          return (
            <div key={gIdx}>
              {/* Etiqueta sección — igual "MENÚ" de la captura */}
              <p
                className="text-[9.5px] font-bold uppercase tracking-[0.18em] px-3 mb-1.5"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                {group.section}
              </p>
              <div className="space-y-0.5">
                {visible.map((item, iIdx) => (
                  <SidebarItem
                    key={`${gIdx}-${iIdx}`}
                    title={item.title}
                    link={item.link}
                    icon={item.icon}
                    isActive={location.pathname === item.link}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── CERRAR SESIÓN ─────────────────────────────────────── */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          to="/custom/home"
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
          style={{
            color:      "rgba(255,255,255,0.45)",
            background: "rgba(255,255,255,0.05)",
            border:     "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)"
            e.currentTarget.style.color      = "#f87171"
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = "rgba(255,255,255,0.05)"
            e.currentTarget.style.color        = "rgba(255,255,255,0.45)"
            e.currentTarget.style.borderColor  = "rgba(255,255,255,0.08)"
          }}
        >
          <LogOut size={15} />
          <span>Salir</span>
        </Link>
      </div>
    </aside>
  )
}
