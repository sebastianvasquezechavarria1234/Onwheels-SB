"use client"

import { CustomHeader } from "./CustomHeader"
import { Footer } from "../../layout/Footer"
import { useEffect, useState } from "react"

export const CustomLayout = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <>
      <CustomHeader />
      {user && (
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "1rem",
            textAlign: "center",
            color: "white",
          }}
        >
          <p style={{ margin: 0, fontSize: "1.1rem" }}>
            Bienvenido, <strong>{user.name || "Usuario"}</strong>
          </p>
        </div>
      )}
      <main>{children}</main>
      <Footer />
    </>
  )
}
