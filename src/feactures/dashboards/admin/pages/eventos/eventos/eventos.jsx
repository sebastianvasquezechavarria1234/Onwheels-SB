import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">
          Eventos &gt; Gestión de Eventos
        </h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar eventos:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  className="input pl-[50px]!"
                />
              </div>
            </label>
          </form>

          <div>
            <button
              onClick={() => openModal("crear")}
              className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
            >
              <Plus className="h-4 w-4" />
              Registrar nuevo evento
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles (sin mayúsculas forzadas, sin sombra extra) */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[30%] font-bold! opacity-80">Nombre</p>
            <p className="w-[20%] font-bold! opacity-80">Categoría</p>
            <p className="w-[20%] font-bold! opacity-80">Patrocinador</p>
            <p className="w-[15%] font-bold! opacity-80">Sede</p>
            <p className="w-[15%] font-bold! opacity-80">Fecha</p>
            <p className="w-[15%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 hidden">--</th>
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
                      className="text-center py-10 italic text-red-700"
                    >
                      No hay eventos registrados
                    </td>
                  </tr>
                ) : (
                  currentItems.map((e) => (
                    <tr
                      key={e.id_evento}
                      className="border-b border-black/20"
                    >
                      <td className="px-6 py-[18px] w-[30%] line-clamp-1">{e.nombre_evento}</td>
                      <td className="px-6 py-[18px] w-[20%] line-clamp-1">{getNombreCategoria(e.id_categoria_evento)}</td>
                      <td className="px-6 py-[18px] w-[20%] line-clamp-1">{getNombrePatrocinador(e.id_patrocinador)}</td>
                      <td className="px-6 py-[18px] w-[15%] line-clamp-1">{getNombreSede(e.id_sede)}</td>
                      <td className="px-6 py-[18px] w-[15%]">{e.fecha_evento}</td>
                      <td className="px-6 py-[18px] w-[15%] flex gap-[10px] items-center justify-center">
                        <button
                          onClick={() => openModal("ver", e)}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("editar", e)}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("eliminar", e)}
                          className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
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
          <div className="flex justify-center items-center gap-2 py-4 italic">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="btn cursor-pointer bg-gray-200"
            >
              Anterior
            </button>
            <span className="text-[18px]">
              Página <span className="text-blue-700">{currentPage}</span> de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="btn cursor-pointer bg-gray-200"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Modales: Crear/Editar */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <h3 className="font-primary text-center mb-[30px]">
                  {modal === "crear" ? "Registrar Evento" : "Editar Evento"}
                </h3>

                {/* --- FORM: ahora en grid 2 columnas --- */}
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[16px]">
                  {/* Nombre - Col 1 */}
                  <label className="block col-span-1">
                    <p className="">Nombre</p>
                    <input
                      type="text"
                      value={form.nombre_evento}
                      onChange={(e) => setForm({ ...form, nombre_evento: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </label>

                  {/* Categoría - Col 2 */}
                  <label className="block col-span-1">
                    <p className="">Categoría</p>
                    <select
                      value={form.id_categoria_evento}
                      onChange={(e) => setForm({ ...form, id_categoria_evento: e.target.value })}
                      className="input w-full"
                      required
                    >
                      <option value="">Seleccione...</option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria_evento} value={c.id_categoria_evento}>
                          {c.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Patrocinador - Col 1 */}
                  <label className="block col-span-1">
                    <p className="">Patrocinador</p>
                    <select
                      value={form.id_patrocinador}
                      onChange={(e) => setForm({ ...form, id_patrocinador: e.target.value })}
                      className="input w-full"
                      required
                    >
                      <option value="">Seleccione...</option>
                      {patrocinadores.map((p) => (
                        <option key={p.id_patrocinador} value={p.id_patrocinador}>
                          {p.nombre_patrocinador}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Sede - Col 2 */}
                  <label className="block col-span-1">
                    <p className="">Sede</p>
                    <select
                      value={form.id_sede}
                      onChange={(e) => setForm({ ...form, id_sede: e.target.value })}
                      className="input w-full"
                      required
                    >
                      <option value="">Seleccione...</option>
                      {sedes.map((s) => (
                        <option key={s.id_sede} value={s.id_sede}>
                          {s.nombre_sede}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Fecha - Col 1 */}
                  <label className="block col-span-1">
                    <p className="">Fecha</p>
                    <input
                      type="date"
                      value={form.fecha_evento}
                      onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </label>

                  {/* Estado - Col 2 */}
                  <label className="block col-span-1">
                    <p className="">Estado</p>
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      className="input w-full"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </label>

                  {/* Hora inicio - Col 1 */}
                  <label className="block col-span-1">
                    <p className="mb-[8px]">Hora inicio</p>
                    <input
                      type="time"
                      value={form.hora_inicio}
                      onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                      className="input w-full"
                    />
                  </label>

                  {/* Hora fin - Col 2 */}
                  <label className="block col-span-1">
                    <p className="mb-[8px]">Hora fin</p>
                    <input
                      type="time"
                      value={form.hora_aproximada_fin}
                      onChange={(e) => setForm({ ...form, hora_aproximada_fin: e.target.value })}
                      className="input w-full"
                    />
                  </label>

                  {/* Descripción - ocupa 2 columnas */}
                  <label className="block col-span-2">
                    <p className="">Descripción</p>
                    <textarea
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className="input w-full h-[120px]"
                    />
                  </label>

                  {/* Imagen - ocupa 2 columnas */}
                  <label className="block col-span-2">
                    <p className="">Imagen</p>
                    <input
                      type="text"
                      value={form.imagen_evento}
                      onChange={(e) => setForm({ ...form, imagen_evento: e.target.value })}
                      placeholder="URL de la imagen"
                      className="input w-full"
                    />
                  </label>

                  {/* botones - ocupa 2 columnas */}
                  <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                    <button type="button" onClick={closeModal} className="btn bg-gray-200">
                      Cancelar
                    </button>
                    <button type="submit" className="btn bg-blue-100 text-blue-700">
                      Guardar
                    </button>
                  </div>
                </form>
                {/* --- FIN FORM --- */}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Ver */}
        <AnimatePresence>
          {modal === "ver" && selected && (
            <motion.div
              className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <h3 className="font-primary text-center mb-[30px]">Detalles del Evento</h3>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <p className="font-medium">Nombre:</p>
                    <p className="font-medium">Categoría:</p>
                    <p className="font-medium">Patrocinador:</p>
                    <p className="font-medium">Sede:</p>
                    <p className="font-medium">Fecha:</p>
                    <p className="font-medium">Hora inicio:</p>
                    <p className="font-medium">Hora fin:</p>
                    <p className="font-medium">Descripción:</p>
                  </div>
                  <div>
                    <p className="text-gray-700">{selected.nombre_evento}</p>
                    <p className="text-gray-700">{getNombreCategoria(selected.id_categoria_evento)}</p>
                    <p className="text-gray-700">{getNombrePatrocinador(selected.id_patrocinador)}</p>
                    <p className="text-gray-700">{getNombreSede(selected.id_sede)}</p>
                    <p className="text-gray-700">{selected.fecha_evento}</p>
                    <p className="text-gray-700">{selected.hora_inicio}</p>
                    <p className="text-gray-700">{selected.hora_aproximada_fin}</p>
                    <p className="text-gray-700">{selected.descripcion}</p>
                  </div>
                </div>

                {selected.imagen_evento && (
                  <img src={selected.imagen_evento} alt="Evento" className="w-full h-40 object-cover rounded-lg mt-2" />
                )}

                <p className="mt-2 text-gray-600">
                  <strong>Estado:</strong> {selected.estado}
                </p>

                <div className="flex justify-end gap-[10px] mt-[30px]">
                  <button onClick={closeModal} className="btn bg-gray-200">
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Eliminar */}
        <AnimatePresence>
          {modal === "eliminar" && selected && (
            <motion.div
              className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <h3 className="font-primary text-center mb-[30px]">Confirmar eliminación</h3>
                <p className="text-gray-600 mb-4">
                  ¿Seguro que deseas eliminar el evento <span className="font-bold">{selected.nombre_evento}</span>?
                </p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button onClick={closeModal} className="btn bg-gray-200">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} className="btn bg-red-100 text-red-700">
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
