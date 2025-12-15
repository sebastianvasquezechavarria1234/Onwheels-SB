"use client"

import { useState, useEffect } from "react"
import { CustomProfileLayout } from "../layout/CustomProfileLayout"

export const CustomProfile = () => {
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserData(user)
  }, [])

  if (!userData) {
    return (
      <CustomProfileLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </CustomProfileLayout>
    )
  }

  return (
    <CustomProfileLayout>
      <section className="flex flex-col gap-4 items-center justify-center">
        <h2 className="title-section text-2xl font-bold text-gray-800">Mi perfil</h2>

        <picture className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {userData.imagen ? (
            <img src={userData.imagen || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </picture>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium self-start">
            Activo
          </span>

          <h4 className="text-xl font-semibold text-gray-800">
            {userData.nombre} {userData.apellido}
          </h4>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{userData.telefono || "No especificado"}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{userData.email}</span>
            </div>

            {userData.roles && userData.roles.length > 0 && (
              <div className="flex items-start gap-2 text-gray-600">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div className="flex flex-wrap gap-2">
                  {userData.roles.map((role, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </CustomProfileLayout>
  )
}
