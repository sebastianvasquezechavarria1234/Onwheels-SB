"use client"

import { CustomLayout } from "../layout/CustomLayout"
import { useState } from "react"
import { Package, Calendar, DollarSign, CheckCircle } from "lucide-react"

export const CustomPurchases = () => {
  // Mock data - en producción esto vendría de la API
  const [purchases] = useState([
    {
      id: 1,
      product: "Skateboard Pro X",
      date: "2024-01-15",
      price: 150000,
      status: "Entregado",
    },
    {
      id: 2,
      product: "Casco Protector",
      date: "2024-01-10",
      price: 85000,
      status: "En camino",
    },
    {
      id: 3,
      product: "Rodilleras Premium",
      date: "2024-01-05",
      price: 45000,
      status: "Entregado",
    },
  ])

  return (
    <CustomLayout>
      <section
        style={{
          maxWidth: "1200px",
          margin: "3rem auto",
          padding: "2rem",
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
          Mis Compras
        </h2>

        <div style={{ display: "grid", gap: "1.5rem" }}>
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "1.5rem",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <Package size={24} color="#667eea" />
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>{purchase.product}</h3>
                </div>
                <div style={{ display: "flex", gap: "2rem", color: "#64748b" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Calendar size={16} />
                    <span>{purchase.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <DollarSign size={16} />
                    <span>${purchase.price.toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: purchase.status === "Entregado" ? "#10b981" : "#f59e0b",
                    color: "white",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                  }}
                >
                  <CheckCircle size={16} />
                  {purchase.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </CustomLayout>
  )
}
