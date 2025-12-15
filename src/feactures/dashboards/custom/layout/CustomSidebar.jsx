"use client"

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
} from "lucide-react"
import { BtnSideBar } from "../../BtnSideBar"
import { canView, canManage } from "../../../../utils/permissions"

export const CustomSidebar = () => {
  const location = useLocation()

  const sidebarConfig = [
    {
      title: "Dashboard",
      link: "/custom/dashboard",
      icon: <Home />,
      permission: null, // Siempre visible
    },
    {
      section: "Configuración",
      items: [
        {
          title: "Usuarios",
          link: "/custom/usuarios",
          icon: <Users />,
          permission: "usuarios",
        },
        {
          title: "Roles",
          link: "/custom/roles",
          icon: <Shield />,
          permission: "roles",
        },
      ],
    },
    {
      section: "Compras",
      items: [
        {
          title: "Productos",
          link: "/custom/productos",
          icon: <Package />,
          permission: "productos",
        },
        {
          title: "Categorías",
          link: "/custom/categorias",
          icon: <Layers />,
          permission: "categorias",
        },
        {
          title: "Proveedores",
          link: "/custom/proveedores",
          icon: <UserCheck />,
          permission: "proveedores",
        },
        {
          title: "Compras",
          link: "/custom/compras",
          icon: <ShoppingCart />,
          permission: "compras",
        },
      ],
    },
    {
      section: "Eventos",
      items: [
        {
          title: "Eventos",
          link: "/custom/eventos",
          icon: <Calendar />,
          permission: "eventos",
        },
        {
          title: "Categorías de Eventos",
          link: "/custom/categoria-eventos",
          icon: <Award />,
          permission: "categoria_eventos",
        },
        {
          title: "Sedes",
          link: "/custom/sedes",
          icon: <MapPin />,
          permission: "sedes",
        },
        {
          title: "Patrocinadores",
          link: "/custom/patrocinadores",
          icon: <Award />,
          permission: "patrocinadores",
        },
      ],
    },
    {
      section: "Clases",
      items: [
        {
          title: "Clases",
          link: "/custom/clases",
          icon: <BookOpen />,
          permission: "clases",
        },
        {
          title: "Niveles",
          link: "/custom/niveles",
          icon: <Layers />,
          permission: "niveles",
        },
        {
          title: "Estudiantes",
          link: "/custom/estudiantes",
          icon: <GraduationCap />,
          permission: "estudiantes",
        },
        {
          title: "Instructores",
          link: "/custom/instructores",
          icon: <UserCheck />,
          permission: "instructores",
        },
        {
          title: "PreInscripciones",
          link: "/custom/preinscripciones",
          icon: <FileText />,
          permission: "preinscripciones",
        },
        {
          title: "Matrículas",
          link: "/custom/matriculas",
          icon: <CreditCard />,
          permission: "matriculas",
        },
        {
          title: "Planes",
          link: "/custom/planes",
          icon: <FileText />,
          permission: "planes",
        },
      ],
    },
  ]

  const hasAccess = (resource) => {
    if (!resource) return true // Sin permiso requerido = siempre visible
    return canView(resource) || canManage(resource)
  }

  const filterItemsByPermission = (items) => {
    return items.filter((item) => {
      if (item.section) {
        // Es una sección, filtrar sus items
        const visibleItems = item.items.filter((subItem) => hasAccess(subItem.permission))
        return visibleItems.length > 0
      }
      // Es un item individual
      return hasAccess(item.permission)
    })
  }

  const visibleConfig = filterItemsByPermission(sidebarConfig)

  return (
    <aside
      style={{
        width: "280px",
        height: "100vh",
        background: "#1e293b",
        overflowY: "auto",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ padding: "2rem 1rem" }}>
        <Link
          to="/custom/home"
          style={{
            display: "block",
            marginBottom: "2rem",
            textDecoration: "none",
          }}
        >
          <img src="/logo.svg" alt="Logo" style={{ width: "100%", maxWidth: "150px" }} />
        </Link>

        <nav>
          {visibleConfig.map((item, index) => {
            if (item.section) {
              // Renderizar sección con items
              const sectionItems = item.items.filter((subItem) => hasAccess(subItem.permission))

              if (sectionItems.length === 0) return null

              return (
                <div key={index} style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.75rem",
                      padding: "0 1rem",
                    }}
                  >
                    {item.section}
                  </h4>
                  {sectionItems.map((subItem, subIndex) => (
                    <BtnSideBar key={subIndex} title={subItem.title} link={subItem.link}>
                      {subItem.icon}
                    </BtnSideBar>
                  ))}
                </div>
              )
            }

            // Renderizar item individual
            return (
              <BtnSideBar key={index} title={item.title} link={item.link}>
                {item.icon}
              </BtnSideBar>
            )
          })}
        </nav>

        <div style={{ marginTop: "2rem", padding: "0 1rem" }}>
          <Link
            to="/custom/home"
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              background: "rgba(100, 116, 139, 0.2)",
              color: "#e2e8f0",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(100, 116, 139, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(100, 116, 139, 0.2)"
            }}
          >
            Cerrar Dashboard
          </Link>
        </div>
      </div>
    </aside>
  )
}
