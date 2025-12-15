"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "../layout/AdminLayout"
import { Package, Calendar, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react"

export const AdminPurchases = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de compras - Aquí deberías hacer un fetch al API
    // Por ahora usamos datos de ejemplo
    setTimeout(() => {
      const mockPurchases = [
        {
          id: 1,
          producto: "Skateboard Professional Pro X",
          fecha: "2024-01-15",
          precio: 299.99,
          estado: "completado",
          cantidad: 1,
        },
        {
          id: 2,
          producto: "Ruedas Racing Speed 54mm",
          fecha: "2024-01-10",
          precio: 45.99,
          estado: "completado",
          cantidad: 4,
        },
        {
          id: 3,
          producto: "Casco de Protección Pro",
          fecha: "2024-01-08",
          precio: 89.99,
          estado: "pendiente",
          cantidad: 1,
        },
        {
          id: 4,
          producto: "Kit de Protección Completo",
          fecha: "2024-01-05",
          precio: 129.99,
          estado: "enviado",
          cantidad: 1,
        },
      ]
      setPurchases(mockPurchases)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "completado":
        return <CheckCircle className="text-green-600" size={20} />
      case "pendiente":
        return <Clock className="text-yellow-600" size={20} />
      case "enviado":
        return <Package className="text-blue-600" size={20} />
      case "cancelado":
        return <XCircle className="text-red-600" size={20} />
      default:
        return <Clock className="text-gray-600" size={20} />
    }
  }

  const getStatusBadge = (estado) => {
    const badges = {
      completado: "bg-green-100 text-green-700",
      pendiente: "bg-yellow-100 text-yellow-700",
      enviado: "bg-blue-100 text-blue-700",
      cancelado: "bg-red-100 text-red-700",
    }
    return badges[estado] || "bg-gray-100 text-gray-700"
  }

  const totalGastado = purchases
    .filter((p) => p.estado !== "cancelado")
    .reduce((sum, p) => sum + p.precio * p.cantidad, 0)

  return (
    <AdminLayout>
      <section className="p-[30px] relative w-[100%] pt-[150px]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-primary mb-4">Mis Compras Personales</h2>
          <p className="text-gray-600 mb-8">Historial de compras realizadas como usuario</p>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-[20px] mb-8 max-lg:grid-cols-1">
            <div className="p-[20px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-blue-500 rounded-full flex items-center justify-center">
                  <Package color="white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Compras</p>
                  <h4 className="font-primary text-blue-700">{purchases.length}</h4>
                </div>
              </div>
            </div>

            <div className="p-[20px] bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-green-500 rounded-full flex items-center justify-center">
                  <DollarSign color="white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gastado</p>
                  <h4 className="font-primary text-green-700">${totalGastado.toFixed(2)}</h4>
                </div>
              </div>
            </div>

            <div className="p-[20px] bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-purple-500 rounded-full flex items-center justify-center">
                  <CheckCircle color="white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completadas</p>
                  <h4 className="font-primary text-purple-700">
                    {purchases.filter((p) => p.estado === "completado").length}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de compras */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando compras...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Package className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No tienes compras registradas</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cantidad</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[40px] h-[40px] bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="text-blue-600" size={20} />
                          </div>
                          <span className="font-medium">{purchase.producto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{new Date(purchase.fecha).toLocaleDateString("es-ES")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">x{purchase.cantidad}</td>
                      <td className="px-6 py-4 text-gray-700">${purchase.precio.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${(purchase.precio * purchase.cantidad).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(purchase.estado)}`}
                        >
                          {getStatusIcon(purchase.estado)}
                          {purchase.estado.charAt(0).toUpperCase() + purchase.estado.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
