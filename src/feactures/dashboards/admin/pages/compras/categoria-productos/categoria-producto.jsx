import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Layout } from "../../../layout/layout";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../../services/categoriasService";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔹 Estados modales
  const [isOpen, setIsOpen] = useState(false);
  const [modo, setModo] = useState("crear"); // crear | editar
  const [form, setForm] = useState({ nombre_categoria: "", descripcion: "" });
  const [editId, setEditId] = useState(null);

  const [modalEliminar, setModalEliminar] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 🔹 Cargar categorías
  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // 🔹 Abrir modal en modo "crear"
  const handleRegistrar = () => {
    setModo("crear");
    setForm({ nombre_categoria: "", descripcion: "" });
    setIsOpen(true);
  };

  // 🔹 Abrir modal en modo "editar"
  const handleEditar = (cat) => {
    setModo("editar");
    setEditId(cat.id_categoria);
    setForm({
      nombre_categoria: cat.nombre_categoria,
      descripcion: cat.descripcion,
    });
    setIsOpen(true);
  };

  // 🔹 Guardar cambios
  const handleGuardar = async () => {
    try {
      if (modo === "crear") {
        await createCategoria(form);
      } else {
        await updateCategoria(editId, form);
      }
      cargarCategorias();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Eliminar
  const handleEliminar = async () => {
    try {
      await deleteCategoria(deleteId);
      cargarCategorias();
      setModalEliminar(false);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Filtrar búsqueda
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre_categoria.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Modal Genérico
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Fondo difuminado */}
        <div
          className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Contenedor */}
        <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6 z-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
          {children}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <button
              onClick={handleRegistrar}
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
                        <button
                          onClick={() => handleEditar(cat)}
                          className="text-blue-600 hover:underline text-xs mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(cat.id_categoria);
                            setModalEliminar(true);
                          }}
                          className="text-red-600 hover:underline text-xs"
                        >
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

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modo === "crear" ? "Registrar Categoría" : "Editar Categoría"}
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={form.nombre_categoria}
            onChange={(e) =>
              setForm({ ...form, nombre_categoria: e.target.value })
            }
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
          >
            Guardar
          </button>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        title="Confirmar Eliminación"
      >
        <p className="text-gray-600">
          ¿Estás seguro de que deseas eliminar esta categoría?
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={handleEliminar}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
