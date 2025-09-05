import React from "react";
import Layout from "../../../layout/layout";

import { Plus, PlusCircle, Search } from "lucide-react";

export default function Productos() {
  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Compras &gt; Productos
            </h2>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <PlusCircle className="h-4 w-4" />
              Registrar nuevo producto
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Precio Compra</th>
                  <th className="px-6 py-3">Imagen</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Ganancia %</th>
                  <th className="px-6 py-3">Descuento</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Ejemplo de fila vacía */}
                <tr className="hover:bg-gray-50 transition">
                  <td colSpan="10" className="text-center py-10 text-gray-400 italic">
                    No hay productos registrados
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
