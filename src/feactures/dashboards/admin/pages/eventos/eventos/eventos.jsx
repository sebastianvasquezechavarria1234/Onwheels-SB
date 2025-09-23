import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Layout } from "../../../layout/layout";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState("");

  // Traer eventos del backend
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/eventos"); // 👈 Ajusta tu endpoint
        setEventos(res.data);
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      }
    };
    fetchEventos();
  }, []);

  // Filtrar eventos con búsqueda
  const filteredEventos = eventos.filter((evento) =>
    evento.nombreEvento?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              eventos &gt; Eventos
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" />
              Registrar nuevo evento
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID Evento</th>
                  <th className="px-6 py-3">ID Categoría Evento</th>
                  <th className="px-6 py-3">ID Sede</th>
                  <th className="px-6 py-3">Nombre Evento</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Hora Inicio</th>
                  <th className="px-6 py-3">Hora Fin</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Imagen</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEventos.length > 0 ? (
                  filteredEventos.map((evento) => (
                    <tr key={evento._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">{evento._id}</td>
                      <td className="px-6 py-3">{evento.idCategoriaEvento}</td>
                      <td className="px-6 py-3">{evento.idSede}</td>
                      <td className="px-6 py-3">{evento.nombreEvento}</td>
                      <td className="px-6 py-3">
                        {new Date(evento.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">{evento.horaInicio}</td>
                      <td className="px-6 py-3">{evento.horaFin}</td>
                      <td className="px-6 py-3">{evento.descripcion}</td>
                      <td className="px-6 py-3">
                        <img
                          src={evento.imagen}
                          alt={evento.nombreEvento}
                          className="h-10 w-10 rounded object-cover"
                        />
                      </td>
                      <td className="px-6 py-3">{evento.estado}</td>
                      <td className="px-6 py-3 flex gap-3 justify-center">
                        <button className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200">
                          <Pencil className="h-4 w-4 text-yellow-600" />
                        </button>
                        <button className="p-2 rounded-full bg-red-100 hover:bg-red-200">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      No hay eventos registrados
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
