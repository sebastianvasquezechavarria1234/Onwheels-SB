import { CustomDashboardLayout } from "../layout/CustomDashboardLayout"
import { Package, Users, Calendar, ShoppingCart } from "lucide-react"

export const CustomDashboard = () => {
  return (
    <CustomDashboardLayout>
      <div>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "2rem" }}>Bienvenido a tu Dashboard</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, opacity: 0.9 }}>Total Productos</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "700", margin: "0.5rem 0 0 0" }}>124</h3>
              </div>
              <Package size={48} style={{ opacity: 0.8 }} />
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, opacity: 0.9 }}>Total Usuarios</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "700", margin: "0.5rem 0 0 0" }}>89</h3>
              </div>
              <Users size={48} style={{ opacity: 0.8 }} />
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, opacity: 0.9 }}>Eventos Activos</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "700", margin: "0.5rem 0 0 0" }}>12</h3>
              </div>
              <Calendar size={48} style={{ opacity: 0.8 }} />
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              padding: "1.5rem",
              borderRadius: "12px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, opacity: 0.9 }}>Ventas del Mes</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "700", margin: "0.5rem 0 0 0" }}>$2.5M</h3>
              </div>
              <ShoppingCart size={48} style={{ opacity: 0.8 }} />
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Información</h3>
          <p style={{ color: "#64748b", lineHeight: "1.6" }}>
            Este es tu dashboard personalizado. Usa el menú lateral para navegar entre las diferentes secciones según
            tus permisos asignados.
          </p>
        </div>
      </div>
    </CustomDashboardLayout>
  )
}
