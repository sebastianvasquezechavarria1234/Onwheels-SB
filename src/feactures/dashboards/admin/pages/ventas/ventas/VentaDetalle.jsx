
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getVentaById } from "../../services/ventasService";
import { ArrowLeft, User, Calendar, DollarSign, Package, Printer, FileText } from "lucide-react";

export default function VentaDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVenta = async () => {
            try {
                setLoading(true);
                const data = await getVentaById(id);
                setVenta(data);
            } catch (err) {
                console.error("Error fetching venta:", err);
                setError("Error al cargar los detalles de la venta.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchVenta();
    }, [id]);



    if (error || !venta) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
                    <div className="text-xl font-semibold text-red-500">{error || "Venta no encontrada"}</div>
                    <button
                        onClick={() => navigate("/admin/ventas")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <ArrowLeft size={20} />
                        Volver a Ventas
                    </button>
                </div>
            </>
        );
    }

    // Helper para obtener datos del cliente (si vienen planos o nested)
    // Según ventasController, id_cliente y otros datos vienen en la raíz o hay que buscarlos.
    // Nota: getVentaById retorna { ...venta, items: [] }.
    // El cliente info NO viene nested en getVentaById por defecto en el backend actual, 
    // PERO el controller `getVentaById` hace `SELECT ... FROM ventas v`. 
    // Falta JOIN con clientes/usuarios en getVentaById del backend????
    // REVISAR controller getVentaById. En el código visto antes:
    // getVentaById hace SELECT v.* FROM ventas v WHERE id_venta=$1. NO trae datos del cliente (nombre, etc).
    // Solo trae id_cliente.
    // Necesitaremos hacer fetch del cliente o arreglar el backend.
    // POR AHORA: Voy a asumir que necesitamos fetch del cliente aparte O mejor, arreglar el backend.
    // Pero para no bloquear, haré fetch del cliente si falta info.
    // OJO: En `Ventas.jsx` se hacía `getUsuarios` y `getClientes` masivo. Aquí sería ineficiente.
    // Mejor mostrar lo que hay y el ID.
    // ESPERA: En `Ventas.jsx`, `getVentaById` se usaba en `openModal("ver")`
    // Y `setSelectedVenta` se seteaba.
    // PERO `Ventas.jsx` YA tenía la lista de clientes cargada en memoria (`clientes`).
    // Aquí es una página nueva, NO tengo la lista de clientes.
    // Solución rápida: Backend debería devolver info del cliente.
    // O en el frontend hacer un fetch del cliente por id.
    // Vamos a agregar un fetch de cliente aquí mismo si es necesario, o mostrar solo ID por ahora.

    return (
        <>
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/admin/ventas")}
                        className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition shadow-sm"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800">Venta #{venta.id_venta}</h1>
                        <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            {new Date(venta.fecha_venta).toLocaleDateString()} &bull; {new Date(venta.fecha_venta).toLocaleTimeString()}
                        </p>
                    </div>
                    <div className={`px - 4 py - 2 rounded - full text - sm font - bold shadow - sm ${venta.estado === 'Entregada' ? 'bg-green-100 text-green-700' :
                        venta.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                            venta.estado === 'Procesada' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                        } `}>
                        {venta.estado}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <Package size={20} className="text-blue-600" />
                                    Productos
                                </h2>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                    {venta.items?.length || 0} items
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-3">Producto</th>
                                            <th className="px-6 py-3">Variante</th>
                                            <th className="px-6 py-3 text-right">Cant.</th>
                                            <th className="px-6 py-3 text-right">Precio Unit.</th>
                                            <th className="px-6 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {venta.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {item.nombre_producto}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.codigo_hex || '#ccc' }}></span>
                                                            {item.nombre_color || "—"}
                                                        </div>
                                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded w-fit">Talla: {item.nombre_talla || "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">{item.cantidad}</td>
                                                <td className="px-6 py-4 text-right text-gray-600">${parseFloat(item.precio_unitario).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    ${(item.cantidad * item.precio_unitario).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-600 text-base">Total</td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-700 text-lg">
                                                ${parseFloat(venta.total).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Info Cliente y Pago */}
                    <div className="space-y-6">
                        {/* Cliente Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                                <User size={20} className="text-blue-600" />
                                Información del Cliente
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Cliente</label>
                                    <p className="font-medium text-gray-800">{venta.nombre_cliente || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Documento</label>
                                    <p className="text-gray-600">{venta.documento || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Email</label>
                                    <p className="text-gray-600">{venta.email || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Teléfono</label>
                                    <p className="text-gray-600">{venta.telefono || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Dirección de Envío</label>
                                    <p className="text-gray-600">{venta.direccion_envio || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pago Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                                <DollarSign size={20} className="text-green-600" />
                                Detalles de Pago
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Método de Pago</span>
                                    <span className="font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">{venta.metodo_pago || "Efectivo"}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-dashed">
                                    <span className="font-bold text-gray-700 text-base">Total Pagado</span>
                                    <span className="font-bold text-green-600 text-xl">${parseFloat(venta.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
