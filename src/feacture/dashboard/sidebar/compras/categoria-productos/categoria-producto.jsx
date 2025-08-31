import React from "react";
import { Search, Plus } from "lucide-react";
import Layout from "../../configuracion/usuarios/layout";

export default function Categorias() {
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
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar categorías..."
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
                {/* Ejemplo de fila vacía */}
                <tr className="hover:bg-gray-50 transition">
                  <td colSpan="4" className="text-center py-10 text-gray-400 italic">
                    No hay categorías registradas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
