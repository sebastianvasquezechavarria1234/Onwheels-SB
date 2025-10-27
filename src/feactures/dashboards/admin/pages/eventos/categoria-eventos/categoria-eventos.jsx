import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createCategoriaEvento,
  updateCategoriaEvento,
  deleteCategoriaEvento,
  getCategoriasEventos,
} from "../../services/EventCategory";

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
    setForm(categoria || { nombre_categoria: "", descripcion: "", imagen: "" });
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
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">
          Eventos &gt; Categorías de Eventos
        </h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar categorías:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
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
              Registrar nueva categoría
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[10%] font-bold! opacity-80">ID</p>
            <p className="w-[30%] font-bold! opacity-80">Nombre</p>
            <p className="w-[35%] font-bold! opacity-80">Descripción</p>
            <p className="w-[15%] font-bold! opacity-80">Imagen</p>
            <p className="w-[15%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="">
                {/* Keeping an empty thead to preserve semantics; visual header is the article above */}
                <tr><th className="hidden" /></tr>
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
                    <td colSpan="5" className="text-center py-10 italic text-red-700">
                      No hay categorías registradas
                    </td>
                  </tr>
                ) : (
                  currentItems.map((c) => (
                    <tr key={c.id_categoria_evento} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[10%]">{c.id_categoria_evento}</td>
                      <td className="px-6 py-[18px] w-[30%] line-clamp-1">{c.nombre_categoria}</td>
                      <td className="px-6 py-[18px] w-[35%] line-clamp-2">{c.descripcion}</td>
                      <td className="px-6 py-[18px] w-[15%]">
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

                      <td className="px-6 py-[18px] w-[15%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("ver", c)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("editar", c)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("eliminar", c)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
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
      </section>

      {/* Modales: Crear/Editar (con motion + formulario 2-col) */}
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
                {modal === "crear" ? "Registrar Categoría" : "Editar Categoría"}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">Nombre</p>
                  <input
                    type="text"
                    value={form.nombre_categoria}
                    onChange={(e) => setForm({ ...form, nombre_categoria: e.target.value })}
                    className="input w-full"
                    placeholder="Ej: Street Session Medellín"
                    required
                  />
                </label>

                <label className="block col-span-1">
                  <p className="">Imagen (URL)</p>
                  <input
                    type="text"
                    value={form.imagen}
                    onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                    className="input w-full"
                    placeholder="Ej: https://cdn.tuproyecto.com/skate/street-session.jpg"
                  />
                </label>

                <label className="block col-span-2">
                  <p className="">Descripción</p>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    className="input w-full h-[120px]"
                    rows="3"
                    placeholder="Ej: Competencia de best trick y demo con skaters locales. Entrada libre — música en vivo y puestos de skate shops."
                  />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button type="button" onClick={closeModal} className="btn bg-gray-200">
                    Cancelar
                  </button>
                  <button type="submit" className="btn bg-blue-100 text-blue-700">
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ver Detalles */}
      <AnimatePresence>
        {modal === "ver" && selectedCategoria && (
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
              <h3 className="font-primary text-center mb-[30px]">Detalles de Categoría</h3>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <p className="font-medium">ID:</p>
                  <p className="font-medium">Nombre:</p>
                  <p className="font-medium">Descripción:</p>
                </div>
                <div>
                  <p className="text-gray-700">{selectedCategoria.id_categoria_evento}</p>
                  <p className="text-gray-700">{selectedCategoria.nombre_categoria}</p>
                  <p className="text-gray-700">{selectedCategoria.descripcion}</p>
                </div>
              </div>

              {selectedCategoria.imagen && (
                <img
                  src={selectedCategoria.imagen}
                  alt={selectedCategoria.nombre_categoria}
                  className="w-full h-40 object-cover rounded-lg mt-2 border"
                />
              )}

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
        {modal === "eliminar" && selectedCategoria && (
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
              <h3 className="font-primary text-center mb-[30px] text-red-600">Eliminar Categoría</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro que deseas eliminar la categoría{" "}
                <strong>{selectedCategoria.nombre_categoria}</strong>?
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
    </Layout>
  );
}
