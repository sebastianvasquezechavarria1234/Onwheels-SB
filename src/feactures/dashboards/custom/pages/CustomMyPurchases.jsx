"use client"

import { useState, useEffect } from "react"
import { CustomProfileLayout } from "../layout/CustomProfileLayout"

export const CustomMyPurchases = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch purchases from API
    // Por ahora, datos de ejemplo
    setTimeout(() => {
      setPurchases([
        {
          id: 1,
          producto: "Tabla de Skate Pro",
          fecha: "2024-01-15",
          precio: 150000,
          estado: "Entregado",
        },
        {
          id: 2,
          producto: "Ruedas Speed 52mm",
          fecha: "2024-01-20",
          precio: 45000,
          estado: "En camino",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <CustomProfileLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Cargando compras...</p>
        </div>
      </CustomProfileLayout>
    )
  }

  return (
    <CustomProfileLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Compras</h2>

        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-500">No has realizado ninguna compra aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.producto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(purchase.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${purchase.precio.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          purchase.estado === "Entregado"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {purchase.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CustomProfileLayout>
  )
}
