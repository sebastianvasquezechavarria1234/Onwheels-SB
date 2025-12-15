"use client"

import { CustomSidebar } from "./CustomSidebar"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"

export const CustomDashboardLayout = ({ children }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <CustomSidebar />

      <main
        style={{
          flex: 1,
          background: "#f8fafc",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>Dashboard Personalizado</h1>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "600",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b91c1c"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#dc2626"
            }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>

        <div style={{ padding: "2rem" }}>{children}</div>
      </main>
    </div>
  )
}
