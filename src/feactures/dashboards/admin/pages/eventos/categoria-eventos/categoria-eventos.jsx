import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {createCategoriaEvento,
  updateCategoriaEvento,
  deleteCategoriaEvento,getCategoriasEventos} from "../../services/EventCategory"

export default function CategoriaEventos() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [modal, setModal] = useState(null); // "crear", "editar", "ver", "eliminar"
  const [form, setForm] = useState({ nombre_categoria: "", descripcion: "", imagen: "" });

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = categorias.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categorias.length / itemsPerPage);

  // 🔹 Cargar categorías
  const fetchCategorias = async () => {
    try {
      const data = await getCategoriasEventos();
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // 🔹 Abrir modal
  const openModal = (type, categoria = null) => {
    setModal(type);
    setSelectedCategoria(categoria);
    setForm(
      categoria || { nombre_categoria: "", descripcion: "", imagen: "" }
    );
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setModal(null);
    setSelectedCategoria(null);
    setForm({ nombre_categoria: "", descripcion: "", imagen: "" });
  };

  // 🔹 Crear o editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === "crear") {
        await createCategoriaEvento(form);
      } else if (modal === "editar") {
        await updateCategoriaEvento(selectedCategoria.id_categoria_evento, form);
      }
      fetchCategorias();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  // 🔹 Eliminar
  const handleDelete = async () => {
    try {
      await deleteCategoriaEvento(selectedCategoria.id_categoria_evento);
      fetchCategorias();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Eventos &gt; Categorías de Eventos
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
            <button
              onClick={() => openModal("crear")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
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
                  <th className="px-6 py-3">Imagen</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                      Cargando...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">
                      No hay categorías registradas
                    </td>
                  </tr>
                ) : (
                  currentItems.map((c) => (
                    <tr
                      key={c.id_categoria_evento}
                      className="hover:bg-gray-50 transition border-b"
                    >
                      <td className="px-6 py-3">{c.id_categoria_evento}</td>
                      <td className="px-6 py-3">{c.nombre_categoria}</td>
                      <td className="px-6 py-3">{c.descripcion}</td>
                      <td className="px-6 py-3">
                        {c.imagen ? (
                          <img
                            src={c.imagen}
                            alt={c.nombre_categoria}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => openModal("ver", c)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("editar", c)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("eliminar", c)}
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

          {/* 🔹 Paginación */}
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Modal Crear/Editar */}
      {(modal === "crear" || modal === "editar") && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {modal === "crear" ? "Registrar Categoría" : "Editar Categoría"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  value={form.nombre_categoria}
                  onChange={(e) =>
                    setForm({ ...form, nombre_categoria: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Imagen (URL)</label>
                <input
                  type="text"
                  value={form.imagen}
                  onChange={(e) =>
                    setForm({ ...form, imagen: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Modal Ver Detalles */}
      {modal === "ver" && selectedCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Detalles de Categoría</h3>
            <p><strong>ID:</strong> {selectedCategoria.id_categoria_evento}</p>
            <p><strong>Nombre:</strong> {selectedCategoria.nombre_categoria}</p>
            <p><strong>Descripción:</strong> {selectedCategoria.descripcion}</p>
            {selectedCategoria.imagen && (
              <img
                src={selectedCategoria.imagen}
                alt={selectedCategoria.nombre_categoria}
                className="w-full h-40 object-cover rounded-lg border mt-2"
              />
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal Eliminar */}
      {modal === "eliminar" && selectedCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar Categoría</h3>
            <p>
              ¿Estás seguro que deseas eliminar la categoría{" "}
              <strong>{selectedCategoria.nombre_categoria}</strong>?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}



















