import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Layout } from "../../../layout/layout";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔹 Consumir API al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/categorias"); // ajusta puerto/URL
        const data = await res.json();
        setCategorias(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  // 🔹 Filtrar resultados con búsqueda
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre_categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              compras &gt; Categorías de Productos
            </h2>

          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-betwee items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" />
              Registrar nueva categoría
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nombre Categoría</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      Cargando categorías...
                    </td>
                  </tr>
                ) : categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((cat) => (
                    <tr
                      key={cat.id_categoria}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">{cat.id_categoria}</td>
                      <td className="px-6 py-3">{cat.nombre_categoria}</td>
                      <td className="px-6 py-3">{cat.descripcion}</td>
                      <td className="px-6 py-3 text-center">
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
                      colSpan="4"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      No hay categorías registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
