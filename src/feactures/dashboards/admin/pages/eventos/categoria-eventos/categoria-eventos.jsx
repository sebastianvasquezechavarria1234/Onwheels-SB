import React, { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Layout from "../../layout-dashboard/layout";

export default function CategoriasEventos() {
  const [modal, setModal] = useState({ type: null, data: null });

  // Datos de ejemplo
  const categorias = [
    { id: 1, nombre: "Conciertos", descripcion: "Eventos musicales en vivo" },
    { id: 2, nombre: "Deportes", descripcion: "Competiciones deportivas" },
    { id: 3, nombre: "Conferencias", descripcion: "Charlas y congresos académicos" },
  ];

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              eventos &gt; Categorías de Eventos
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
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50 border-b transition"
                  >
                    <td className="px-6 py-3">{cat.id}</td>
                    <td className="px-6 py-3">{cat.nombre}</td>
                    <td className="px-6 py-3">{cat.descripcion}</td>
                    <td className="px-6 py-3 text-center flex justify-center gap-3">
                      <button
                        onClick={() => setModal({ type: "view", data: cat })}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setModal({ type: "edit", data: cat })}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setModal({ type: "delete", data: cat })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modales */}
          {modal.type && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-lg w-96 p-6">
                {/* Modal Ver */}
                {modal.type === "view" && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">
                      Detalles de Categoría
                    </h3>
                    <p>
                      <strong>ID:</strong> {modal.data.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {modal.data.nombre}
                    </p>
                    <p>
                      <strong>Descripción:</strong> {modal.data.descripcion}
                    </p>
                    <button
                      className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
                      onClick={() => setModal({ type: null, data: null })}
                    >
                      Cerrar
                    </button>
                  </>
                )}

                {/* Modal Editar */}
                {modal.type === "edit" && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">
                      Editar Categoría
                    </h3>
                    <input
                      type="text"
                      defaultValue={modal.data.nombre}
                      className="w-full mb-3 p-2 border rounded-lg"
                    />
                    <textarea
                      defaultValue={modal.data.descripcion}
                      className="w-full mb-3 p-2 border rounded-lg"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl"
                        onClick={() => setModal({ type: null, data: null })}
                      >
                        Cancelar
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                        Guardar
                      </button>
                    </div>
                  </>
                )}

                {/* Modal Eliminar */}
                {modal.type === "delete" && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-red-600">
                      Eliminar Categoría
                    </h3>
                    <p>
                      ¿Seguro que deseas eliminar la categoría{" "}
                      <strong>{modal.data.nombre}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl"
                        onClick={() => setModal({ type: null, data: null })}
                      >
                        Cancelar
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
