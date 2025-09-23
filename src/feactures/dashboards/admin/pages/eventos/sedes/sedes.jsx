import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Layout from "../../layout-dashboard/layout";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/sedes"); // Ajusta al puerto de tu backend
        const data = await res.json();
        setSedes(data);
      } catch (error) {
        console.error("Error al obtener sedes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSedes();
  }, []);

  // Filtrar sedes por nombre o ciudad
  const sedesFiltradas = sedes.filter(
    (sede) =>
      sede.nombre_sede.toLowerCase().includes(busqueda.toLowerCase()) ||
      sede.ciudad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              eventos &gt; Sedes
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar sedes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" />
              Registrar nueva sede
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID Sede</th>
                  <th className="px-6 py-3">Nombre Sede</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Ciudad</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      Cargando sedes...
                    </td>
                  </tr>
                ) : sedesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      No hay sedes registradas
                    </td>
                  </tr>
                ) : (
                  sedesFiltradas.map((sede) => (
                    <tr key={sede.id_sede} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">{sede.id_sede}</td>
                      <td className="px-6 py-3">{sede.nombre_sede}</td>
                      <td className="px-6 py-3">{sede.direccion}</td>
                      <td className="px-6 py-3">{sede.ciudad}</td>
                      <td className="px-6 py-3">{sede.telefono_sede}</td>
                      <td className="px-6 py-3 text-center">
                        <button className="text-blue-600 hover:underline text-sm">Editar</button> |{" "}
                        <button className="text-red-600 hover:underline text-sm">Eliminar</button>
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
