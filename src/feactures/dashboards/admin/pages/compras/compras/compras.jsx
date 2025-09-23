import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Layout } from "../../../layout/layout";

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar compras
  const fetchCompras = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/compras"); // ajusta la URL según tu backend
      const data = await res.json();
      setCompras(data);
    } catch (err) {
      console.error("Error al cargar compras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  // 🔹 Eliminar compra
  const deleteCompra = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta compra?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/compras/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCompras(compras.filter((c) => c.id_compra !== id));
      }
    } catch (err) {
      console.error("Error al eliminar compra:", err);
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Compras &gt; Registro de Compras
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar compras..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" />
              Registrar nueva compra
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID Compra</th>
                  <th className="px-6 py-3">Proveedor</th>
                  <th className="px-6 py-3">Fecha Compra</th>
                  <th className="px-6 py-3">Fecha Entrega</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                      Cargando...
                    </td>
                  </tr>
                ) : compras.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                      No hay compras registradas
                    </td>
                  </tr>
                ) : (
                  compras.map((c) => (
                    <tr
                      key={c.id_compra}
                      className="hover:bg-gray-50 transition border-b"
                    >
                      <td className="px-6 py-3">{c.id_compra}</td>
                      <td className="px-6 py-3">{c.nombre_proveedor}</td>
                      <td className="px-6 py-3">{c.fecha_compra}</td>
                      <td className="px-6 py-3">
                        {c.fecha_aproximada_entrega || "-"}
                      </td>
                      <td className="px-6 py-3">${c.total_compra}</td>
                      <td className="px-6 py-3">{c.estado}</td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCompra(c.id_compra)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
