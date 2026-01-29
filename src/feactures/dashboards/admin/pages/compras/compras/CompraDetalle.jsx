import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getCompraById } from "../../services/comprasService";
import { ArrowLeft, Truck, Calendar, DollarSign, Package, AlertCircle } from "lucide-react";

export default function CompraDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [compra, setCompra] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompra = async () => {
            try {
                setLoading(true);
                const data = await getCompraById(id);
                setCompra(data);
            } catch (err) {
                console.error("Error fetching compra:", err);
                setError("Error al cargar los detalles de la compra.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCompra();
    }, [id]);

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center h-screen bg-gray-50">
                    <div className="text-xl font-semibold text-gray-500">Cargando detalles...</div>
                </div>
            </>
        );
    }

    if (error || !compra) {
        return (
            <>
                <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
                    <div className="text-xl font-semibold text-red-500">{error || "Compra no encontrada"}</div>
                    <button
                        onClick={() => navigate("/admin/compras")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <ArrowLeft size={20} />
                        Volver a Compras
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/admin/compras")}
                        className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition shadow-sm"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800">Compra #{compra.id_compra}</h1>
                        <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <Calendar size={14} />
                            {new Date(compra.fecha_compra).toLocaleDateString()}
                            {compra.fecha_aproximada_entrega && (
                                <span className="text-orange-600 ml-2">
                                    (Entrega Aprox: {new Date(compra.fecha_aproximada_entrega).toLocaleDateString()})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${compra.estado === 'Recibida' ? 'bg-green-100 text-green-700' :
                        compra.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                            compra.estado === 'Cancelada' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                        }`}>
                        {compra.estado}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <Package size={20} className="text-blue-600" />
                                    Productos Solicitados
                                </h2>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                    {compra.items?.length || 0} items
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-3">Producto</th>
                                            <th className="px-6 py-3">Variante</th>
                                            <th className="px-6 py-3 text-right">Cant.</th>
                                            <th className="px-6 py-3 text-right">Costo Unit.</th>
                                            <th className="px-6 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {compra.items?.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {item.nombre_producto}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            {item.nombre_color !== "—" && (
                                                                <span className="w-3 h-3 rounded-full border border-gray-200 bg-gray-300"></span>
                                                            )}
                                                            {item.nombre_color}
                                                        </div>
                                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded w-fit">Talla: {item.nombre_talla}</span>
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
                                            <td colSpan="4" className="px-6 py-4 text-right font-bold text-gray-600 text-base">Total Compra</td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-700 text-lg">
                                                ${parseFloat(compra.total_compra).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Info Proveedor */}
                    <div className="space-y-6">
                        {/* Proveedor Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                                <Truck size={20} className="text-blue-600" />
                                Proveedor
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Empresa</label>
                                    <p className="font-medium text-gray-800 text-lg">{compra.nombre_proveedor || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase font-bold mb-1">NIT</label>
                                    <p className="font-mono text-gray-600">{compra.nit_proveedor}</p>
                                </div>
                            </div>
                        </div>

                        {/* Estado Alert */}
                        {compra.estado === 'Recibida' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-green-800">
                                <AlertCircle size={20} />
                                <div className="text-sm">
                                    <p className="font-bold">Compra Recibida</p>
                                    <p>El stock de los productos ha sido actualizado.</p>
                                </div>
                            </div>
                        )}
                        {compra.estado === 'Cancelada' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
                                <AlertCircle size={20} />
                                <div className="text-sm">
                                    <p className="font-bold">Compra Cancelada</p>
                                    <p>Esta compra no afectó el inventario.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
