import React, { useEffect, useState } from "react";
import { Layout} from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {
  getPatrocinadores,
  createPatrocinador,
  updatePatrocinador,
  deletePatrocinador,
} from "../../services/patrocinadoresServices";

export default function Patrocinadores() {
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // "crear", "editar", "ver", "eliminar"
  const [form, setForm] = useState({
    nombre_patrocinador: "",
    email: "",
    telefono: "",
    logo_patrocinador: "",
  });

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = patrocinadores.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(patrocinadores.length / itemsPerPage);

  // 🔹 Cargar patrocinadores
  const fetchPatrocinadores = async () => {
    try {
      const data = await getPatrocinadores();
      setPatrocinadores(data);
    } catch (err) {
      console.error("Error al cargar patrocinadores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrocinadores();
  }, []);

  // 🔹 Abrir modal
  const openModal = (type, patrocinador = null) => {
    setModal(type);
    setSelected(patrocinador);
    setForm(
      patrocinador || {
        nombre_patrocinador: "",
        email: "",
        telefono: "",
        logo_patrocinador: "",
      }
    );
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_patrocinador: "", email: "", telefono: "", logo_patrocinador: "" });
  };

  // 🔹 Crear o editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === "crear") {
        await createPatrocinador(form);
      } else if (modal === "editar") {
        await updatePatrocinador(selected.id_patrocinador, form);
      }
      fetchPatrocinadores();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  // 🔹 Eliminar
  const handleDelete = async () => {
    try {
      await deletePatrocinador(selected.id_patrocinador);
      fetchPatrocinadores();
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
              Patrocinadores &gt; Gestión de Patrocinadores
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar patrocinadores..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Registrar nuevo patrocinador
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Logo</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      Cargando...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      No hay patrocinadores registrados
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => (
                    <tr
                      key={p.id_patrocinador}
                      className="hover:bg-gray-50 transition border-b"
                    >
                      <td className="px-6 py-3">{p.id_patrocinador}</td>
                      <td className="px-6 py-3">{p.nombre_patrocinador}</td>
                      <td className="px-6 py-3">{p.email}</td>
                      <td className="px-6 py-3">{p.telefono}</td>
                      <td className="px-6 py-3">
                        {p.logo_patrocinador ? (
                          <img
                            src={p.logo_patrocinador}
                            alt={p.nombre_patrocinador}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => openModal("ver", p)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("editar", p)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("eliminar", p)}
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
              {modal === "crear" ? "Registrar Patrocinador" : "Editar Patrocinador"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  value={form.nombre_patrocinador}
                  onChange={(e) =>
                    setForm({ ...form, nombre_patrocinador: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <input
                  type="text"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Logo (URL)</label>
                <input
                  type="text"
                  value={form.logo_patrocinador}
                  onChange={(e) =>
                    setForm({ ...form, logo_patrocinador: e.target.value })
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
      {modal === "ver" && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Detalles del Patrocinador</h3>
            <p><strong>ID:</strong> {selected.id_patrocinador}</p>
            <p><strong>Nombre:</strong> {selected.nombre_patrocinador}</p>
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Teléfono:</strong> {selected.telefono}</p>
            {selected.logo_patrocinador && (
              <img
                src={selected.logo_patrocinador}
                alt={selected.nombre_patrocinador}
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
      {modal === "eliminar" && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar Patrocinador</h3>
            <p>
              ¿Estás seguro que deseas eliminar al patrocinador{" "}
              <strong>{selected.nombre_patrocinador}</strong>?
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
