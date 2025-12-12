"use client"

import { CustomLayout } from "../layout/CustomLayout"
import { useEffect, useState } from "react"
import { Phone, Mail, Shield } from "lucide-react"

export const CustomProfile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <CustomLayout>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Cargando perfil...</p>
        </div>
      </CustomLayout>
    )
  }

  return (
    <CustomLayout>
      <section
        style={{
          maxWidth: "800px",
          margin: "3rem auto",
          padding: "2rem",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "2rem",
            color: "#1e293b",
          }}
        >
          Mi perfil
        </h2>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginBottom: "2rem" }}>
          <picture>
            <img
              src="/placeholder.svg?height=120&width=120"
              alt="Avatar"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #667eea",
              }}
            />
          </picture>

          <div style={{ flex: 1 }}>
            <span
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "#10b981",
                color: "white",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Activo
            </span>
            <h4
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "#1e293b",
              }}
            >
              {user.name || "Usuario"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#64748b" }}>
                <Phone size={20} />
                <span>{user.phone || "No especificado"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#64748b" }}>
                <Mail size={20} />
                <span>{user.email || "No especificado"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#64748b" }}>
                <Shield size={20} />
                <span>Roles: {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "Sin roles"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CustomLayout>
  )
}
