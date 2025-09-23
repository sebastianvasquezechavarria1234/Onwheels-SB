import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Layout } from "../../../layout/layout";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [search, setSearch] = useState("");

  // 🔹 Cargar proveedores desde la API
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/proveedores"); // Ajusta la URL según tu backend
        const data = await res.json();
        setProveedores(data);
      } catch (err) {
        console.error("Error cargando proveedores:", err);
=======
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/proveedores"); // Ajusta al puerto de tu backend
        const data = await res.json();
        setProveedores(data);
      } catch (error) {
        console.error("Error al obtener proveedores:", error);
>>>>>>> 10c15a7470bd2fc235caf80fefaba0aebf1bce1d
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, []);

<<<<<<< HEAD
  // 🔹 Filtrar búsqueda
  const proveedoresFiltrados = proveedores.filter((prov) =>
    prov.nombre_proveedor.toLowerCase().includes(search.toLowerCase())
=======
  // Filtrar proveedores por nombre o NIT
  const proveedoresFiltrados = proveedores.filter((prov) =>
    prov.nombre_proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    prov.NIT_proveedor.toString().includes(busqueda)
>>>>>>> 10c15a7470bd2fc235caf80fefaba0aebf1bce1d
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Compras &gt; Proveedores
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar proveedores..."
<<<<<<< HEAD
                value={search}
                onChange={(e) => setSearch(e.target.value)}
=======
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
>>>>>>> 10c15a7470bd2fc235caf80fefaba0aebf1bce1d
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" />
              Registrar nuevo proveedor
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">NIT</th>
                  <th className="px-6 py-3">Nombre Proveedor</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
<<<<<<< HEAD
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      Cargando proveedores...
                    </td>
                  </tr>
                ) : proveedoresFiltrados.length > 0 ? (
                  proveedoresFiltrados.map((prov) => (
                    <tr
                      key={prov.NIT_proveedor}
                      className="hover:bg-gray-50 transition"
                    >
=======
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      Cargando proveedores...
                    </td>
                  </tr>
                ) : proveedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      No hay proveedores registrados
                    </td>
                  </tr>
                ) : (
                  proveedoresFiltrados.map((prov) => (
                    <tr key={prov.NIT_proveedor} className="hover:bg-gray-50 transition">
>>>>>>> 10c15a7470bd2fc235caf80fefaba0aebf1bce1d
                      <td className="px-6 py-3">{prov.NIT_proveedor}</td>
                      <td className="px-6 py-3">{prov.nombre_proveedor}</td>
                      <td className="px-6 py-3">{prov.email}</td>
                      <td className="px-6 py-3">{prov.telefono}</td>
                      <td className="px-6 py-3">{prov.direccion}</td>
                      <td className="px-6 py-3 text-center">
<<<<<<< HEAD
                        <button className="text-blue-600 hover:underline text-xs mr-2">
                          Editar
                        </button>
                        <button className="text-red-600 hover:underline text-xs">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      No hay proveedores registrados
                    </td>
                  </tr>
=======
                        <button className="text-blue-600 hover:underline text-sm">Editar</button> |{" "}
                        <button className="text-red-600 hover:underline text-sm">Eliminar</button>
                      </td>
                    </tr>
                  ))
>>>>>>> 10c15a7470bd2fc235caf80fefaba0aebf1bce1d
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
