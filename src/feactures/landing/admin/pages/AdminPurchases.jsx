"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "../layout/AdminLayout"
import { Package, Calendar, DollarSign, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react"
import api from "../../../../services/api"

export const AdminPurchases = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState({})

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await api.get("/ventas/mis-compras") // Endpoint nuevo
      setPurchases(response.data)
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case "entregado":
      case "completado":
        return <CheckCircle className="text-green-600" size={20} />
      case "pendiente":
        return <Clock className="text-yellow-600" size={20} />
      case "enviado":
      case "en camino":
        return <Package className="text-blue-600" size={20} />
      case "cancelado":
        return <XCircle className="text-red-600" size={20} />
      default:
        return <Clock className="text-gray-600" size={20} />
    }
  }

  const getStatusBadge = (estado) => {
    const status = estado?.toLowerCase() || ""
    if (status === "entregado" || status === "completado") return "bg-green-100 text-green-700"
    if (status === "pendiente") return "bg-yellow-100 text-yellow-700"
    if (status === "en camino" || status === "enviado") return "bg-blue-100 text-blue-700"
    if (status === "cancelado") return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-700"
  }

  // Calcular totales para stats
  const totalCompras = purchases.length
  const totalGastado = purchases
    .filter(p => p.estado?.toLowerCase() !== 'cancelado')
    .reduce((sum, p) => sum + Number(p.total), 0)
  const completadas = purchases
    .filter(p => p.estado?.toLowerCase() === 'entregado' || p.estado?.toLowerCase() === 'completado').length

  return (
    <AdminLayout>
      <section className="p-[30px] relative w-[100%] pt-[150px]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-primary mb-4 text-2xl font-bold text-gray-800">Mis Compras Personales</h2>
          <p className="text-gray-600 mb-8">Historial completo de tus pedidos y estado actual</p>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-[20px] mb-8 max-lg:grid-cols-1">
            <div className="p-[20px] bg-white border border-blue-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-blue-50 rounded-full flex items-center justify-center">
                  <Package className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Pedidos</p>
                  <h4 className="font-primary text-blue-700 text-2xl">{totalCompras}</h4>
                </div>
              </div>
            </div>

            <div className="p-[20px] bg-white border border-green-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-green-50 rounded-full flex items-center justify-center">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Invertido</p>
                  <h4 className="font-primary text-green-700 text-2xl">${totalGastado.toLocaleString()}</h4>
                </div>
              </div>
            </div>

            <div className="p-[20px] bg-white border border-purple-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-[50px] h-[50px] bg-purple-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Entregados</p>
                  <h4 className="font-primary text-purple-700 text-2xl">{completadas}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de compras */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-500">Cargando tu historial...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-gray-300" size={40} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tienes compras registradas</h3>
              <p className="text-gray-500 mt-1">¡Explora la tienda y realiza tu primer pedido!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id_venta} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  {/* Cabecera de la tarjeta / Fila principal */}
                  <div
                    className="p-6 cursor-pointer flex items-center flex-wrap gap-4 justify-between"
                    onClick={() => toggleRow(purchase.id_venta)}
                  >
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{purchase.id_venta}</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          {new Date(purchase.fecha_venta).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="font-bold text-gray-900">${Number(purchase.total).toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Método de Pago</span>
                      <span className="font-medium text-gray-700 capitalize">{purchase.metodo_pago}</span>
                    </div>

                    <div className="min-w-[140px]">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadge(purchase.estado)}`}>
                        {getStatusIcon(purchase.estado)}
                        {purchase.estado}
                      </span>
                    </div>

                    <div className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${expandedRows[purchase.id_venta] ? 'rotate-180' : ''}`}>
                      <ChevronDown className="text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {expandedRows[purchase.id_venta] && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-2 duration-200">
                      <h5 className="text-sm font-semibold text-gray-700 mb-4 px-2">Detalle de productos</h5>
                      <div className="space-y-3">
                        {purchase.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imagen ? (
                                  <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package size={24} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-900">{item.nombre_producto}</h6>
                                <p className="text-sm text-gray-500">
                                  {item.nombre_color && `Color: ${item.nombre_color}`}
                                  {item.nombre_color && item.nombre_talla && " | "}
                                  {item.nombre_talla && `Talla: ${item.nombre_talla}`}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Precio unitario: ${Number(item.precio_unitario).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-sm font-medium text-gray-900">x{item.cantidad}</span>
                              <span className="block font-semibold text-emerald-600 mt-1">
                                ${(item.cantidad * item.precio_unitario).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {(!purchase.items || purchase.items.length === 0) && (
                          <p className="text-sm text-gray-500 italic p-2">Sin detalles de productos disponibles.</p>
                        )}
                      </div>

                      {purchase.direccion_envio && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">Dirección de envío:</span> {purchase.direccion_envio}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
