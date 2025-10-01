import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {
  getEventos,
  getCategorias,
  getPatrocinadores,
  getSedes,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../../services/Event";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({
    id_categoria_evento: "",
    id_patrocinador: "",
    id_sede: "",
    nombre_evento: "",
    fecha_evento: "",
    hora_inicio: "",
    hora_aproximada_fin: "",
    descripcion: "",
    imagen_evento: "",
    estado: "activo",
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = eventos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(eventos.length / itemsPerPage);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ev, cat, pat, sed] = await Promise.all([
        getEventos(),
        getCategorias(),
        getPatrocinadores(),
        getSedes(),
      ]);
      setEventos(ev);
      setCategorias(cat);
      setPatrocinadores(pat);
      setSedes(sed);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (type, evento = null) => {
    setModal(type);
    setSelected(evento);
    setForm(
      evento || {
        id_categoria_evento: "",
        id_patrocinador: "",
        id_sede: "",
        nombre_evento: "",
        fecha_evento: "",
        hora_inicio: "",
        hora_aproximada_fin: "",
        descripcion: "",
        imagen_evento: "",
        estado: "activo",
      }
    );
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === "crear") {
        await createEvento(form);
      } else if (modal === "editar") {
        await updateEvento(selected.id_evento, form);
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error("Error al guardar evento:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvento(selected.id_evento);
      fetchData();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const getNombreCategoria = (id) =>
    categorias.find((c) => c.id_categoria_evento === id)?.nombre_categoria ||
    "—";

  const getNombrePatrocinador = (id) =>
    patrocinadores.find((p) => p.id_patrocinador === id)?.nombre_patrocinador ||
    "—";

  const getNombreSede = (id) =>
    sedes.find((s) => s.id_sede === id)?.nombre_sede || "—";

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Eventos &gt; Gestión de Eventos
            </h2>
          </div>

          {/* Barra búsqueda */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" /> Registrar nuevo evento
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Patrocinador</th>
                  <th className="px-6 py-3">Sede</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      Cargando...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      No hay eventos registrados
                    </td>
                  </tr>
                ) : (
                  currentItems.map((e) => (
                    <tr
                      key={e.id_evento}
                      className="hover:bg-gray-50 transition border-b"
                    >
                      <td className="px-6 py-3">{e.nombre_evento}</td>
                      <td className="px-6 py-3">
                        {getNombreCategoria(e.id_categoria_evento)}
                      </td>
                      <td className="px-6 py-3">
                        {getNombrePatrocinador(e.id_patrocinador)}
                      </td>
                      <td className="px-6 py-3">{getNombreSede(e.id_sede)}</td>
                      <td className="px-6 py-3">{e.fecha_evento}</td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => openModal("ver", e)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("editar", e)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("eliminar", e)}
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

          {/* Paginación */}
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

      {/* Modal Crear/Editar */}
      {(modal === "crear" || modal === "editar") && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {modal === "crear" ? "Registrar Evento" : "Editar Evento"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  value={form.nombre_evento}
                  onChange={(e) =>
                    setForm({ ...form, nombre_evento: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Categoría</label>
                <select
                  value={form.id_categoria_evento}
                  onChange={(e) =>
                    setForm({ ...form, id_categoria_evento: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((c) => (
                    <option
                      key={c.id_categoria_evento}
                      value={c.id_categoria_evento}
                    >
                      {c.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Patrocinador</label>
                <select
                  value={form.id_patrocinador}
                  onChange={(e) =>
                    setForm({ ...form, id_patrocinador: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Seleccione...</option>
                  {patrocinadores.map((p) => (
                    <option key={p.id_patrocinador} value={p.id_patrocinador}>
                      {p.nombre_patrocinador}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Sede</label>
                <select
                  value={form.id_sede}
                  onChange={(e) => setForm({ ...form, id_sede: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Seleccione...</option>
                  {sedes.map((s) => (
                    <option key={s.id_sede} value={s.id_sede}>
                      {s.nombre_sede}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  value={form.fecha_evento}
                  onChange={(e) =>
                    setForm({ ...form, fecha_evento: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Hora inicio</label>
                  <input
                    type="time"
                    value={form.hora_inicio}
                    onChange={(e) =>
                      setForm({ ...form, hora_inicio: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">Hora fin</label>
                  <input
                    type="time"
                    value={form.hora_aproximada_fin}
                    onChange={(e) =>
                      setForm({ ...form, hora_aproximada_fin: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Imagen</label>
                <input
                  type="text"
                  value={form.imagen_evento}
                  onChange={(e) =>
                    setForm({ ...form, imagen_evento: e.target.value })
                  }
                  placeholder="URL de la imagen"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
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

      {/* Modal Ver */}
      {modal === "ver" && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Detalles del Evento</h3>
            <p>
              <strong>Nombre:</strong> {selected.nombre_evento}
            </p>
            <p>
              <strong>Categoría:</strong>{" "}
              {getNombreCategoria(selected.id_categoria_evento)}
            </p>
            <p>
              <strong>Patrocinador:</strong>{" "}
              {getNombrePatrocinador(selected.id_patrocinador)}
            </p>
            <p>
              <strong>Sede:</strong> {getNombreSede(selected.id_sede)}
            </p>
            <p>
              <strong>Fecha:</strong> {selected.fecha_evento}
            </p>
            <p>
              <strong>Hora inicio:</strong> {selected.hora_inicio}
            </p>
            <p>
              <strong>Hora fin:</strong> {selected.hora_aproximada_fin}
            </p>
            <p>
              <strong>Descripción:</strong> {selected.descripcion}
            </p>
            {selected.imagen_evento && (
              <img
                src={selected.imagen_evento}
                alt="Evento"
                className="w-full h-40 object-cover rounded-lg mt-2"
              />
            )}
            <p className="mt-2">
              <strong>Estado:</strong> {selected.estado}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modal === "eliminar" && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p>
              ¿Seguro que deseas eliminar el evento{" "}
              <strong>{selected.nombre_evento}</strong>?
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
