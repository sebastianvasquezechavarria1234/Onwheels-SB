"use client"

import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export const CustomProfileLayout = ({ children }) => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserName(`${user.nombre || ""} ${user.apellido || ""}`)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleCloseDashboard = () => {
    navigate("/custom/home")
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Mi Cuenta</h2>

          <nav className="space-y-2">
            <Link
              to="/custom/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-medium">Mi Perfil</span>
            </Link>

            <Link
              to="/custom/my-purchases"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="font-medium">Mis Compras</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Usuario</p>
            <p className="text-sm font-medium text-gray-700">{userName}</p>

            <p className="text-xs text-gray-500 mt-4 mb-1">Fecha y Hora</p>
            <p className="text-sm text-gray-700">{currentTime.toLocaleDateString()}</p>
            <p className="text-sm text-gray-700">{currentTime.toLocaleTimeString()}</p>
          </div>

          <button
            onClick={handleCloseDashboard}
            className="w-full mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Volver al Inicio
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
