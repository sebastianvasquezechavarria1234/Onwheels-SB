"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "../layout/AdminLayout"
import { Mail, Phone, User, Edit, LayoutDashboard } from "lucide-react"
import { Link } from "react-router-dom"

export const AdminProfile = () => {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const userDataString = localStorage.getItem("user")
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString)
        setUserData(user)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  return (
    <AdminLayout>
      <section className="p-[30px] relative w-[100%] pt-[150px]">
        <div className="flex justify-between items-center">
          <h2 className="font-primary">Mi perfil de Administrador</h2>

          {/* Botón rápido al Dashboard */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-200 transition-colors"
          >
            <LayoutDashboard size={20} strokeWidth={1.5} />
            <span className="font-semibold">Ir al Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-[30px] mt-[80px] max-lg:flex-col">
          <picture className="relative w-[200px] h-[200px] rounded-full flex justify-center items-center">
            <img
              className="w-full h-full object-cover opacity-50 rounded-full"
              src="https://tse4.mm.bing.net/th/id/OIP.XmX3OORybgBCLw-Xd6rYrQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="avatar"
            />
          </picture>

          <div className="flex flex-col gap-[10px]">
            <div className="flex gap-[10px] items-center">
              <span className="inline-flex justify-center w-[100px] items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-green-100 text-green-700">
                <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                Activo
              </span>
              <span className="inline-flex justify-center items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-purple-100 text-purple-700">
                <User size={16} />
                Administrador
              </span>
            </div>

            <h4 className="font-primary">
              {userData?.nombre || "Administrador"} {userData?.apellido || ""}
            </h4>

            {/* Información de contacto */}
            <div className="flex gap-[20px] max-md:flex-col">
              {userData?.telefono && (
                <div className="flex gap-[10px] items-center">
                  <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full">
                    <Phone color="white" size={20} strokeWidth={1.3} />
                  </span>
                  <p className="font-semibold!">{userData.telefono}</p>
                </div>
              )}
              {userData?.email && (
                <div className="flex gap-[10px] items-center">
                  <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full">
                    <Mail color="white" size={20} strokeWidth={1.3} />
                  </span>
                  <p className="font-semibold!">{userData.email}</p>
                </div>
              )}
            </div>

            {/* Botón de editar (placeholder por ahora) */}
            <button
              className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors w-fit"
              onClick={() => alert("Función de editar perfil - Por implementar")}
            >
              <Edit size={18} />
              <span>Editar Perfil</span>
            </button>
          </div>
        </div>

        {/* Sección de acciones rápidas */}
        <div className="mt-[60px] grid grid-cols-3 gap-[20px] max-lg:grid-cols-1">
          <Link
            to="/admin/purchases"
            className="p-[30px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all"
          >
            <h4 className="font-primary text-blue-700">Mis Compras</h4>
            <p className="text-sm text-gray-600 mt-2">Ver historial de compras personales</p>
          </Link>

          <Link
            to="/admin/dashboard"
            className="p-[30px] bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl hover:shadow-lg transition-all"
          >
            <h4 className="font-primary text-emerald-700">Panel de Control</h4>
            <p className="text-sm text-gray-600 mt-2">Administrar el sistema completo</p>
          </Link>

          <Link
            to="/admin/store"
            className="p-[30px] bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all"
          >
            <h4 className="font-primary text-purple-700">Tienda</h4>
            <p className="text-sm text-gray-600 mt-2">Explorar y comprar productos</p>
          </Link>
        </div>
      </section>
    </AdminLayout>
  )
}
