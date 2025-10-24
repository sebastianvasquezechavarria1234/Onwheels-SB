import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Layout } from "../../../layout/layout";
import { motion, AnimatePresence } from "framer-motion";
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

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔹 Estados modales
  const [modal, setModal] = useState(null); // "crear" | "editar" | "eliminar"
  const [form, setForm] = useState({ nombre_categoria: "", descripcion: "" });
  const [selected, setSelected] = useState(null);

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

  // Abrir modal (crear, editar, eliminar)
  const openModal = (type, cat = null) => {
    setModal(type);
    setSelected(cat);
    setForm(
      cat || {
        nombre_categoria: "",
        descripcion: "",
      }
    );
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_categoria: "", descripcion: "" });
  };

  const handleGuardar = async (e) => {
    e && e.preventDefault();
    try {
      if (modal === "crear") {
        await createCategoria(form);
      } else if (modal === "editar") {
        await updateCategoria(selected.id_categoria, form);
      }
      await cargarCategorias();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminar = async () => {
    try {
      await deleteCategoria(selected.id_categoria);
      await cargarCategorias();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre_categoria?.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación derivada
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = categoriasFiltradas.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(categoriasFiltradas.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">
          compras &gt; Categorías de Productos
        </h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar categorías:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Ej: Ropa, Skates, Accesorios"
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
            <p className="w-[30%] font-bold! opacity-80">Nombre categoría</p>
            <p className="w-[35%] font-bold! opacity-80">Descripción</p>
            <p className="w-[25%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr>
                  <th className="hidden" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-400 italic">
                      Cargando categorías...
                    </td>
                  </tr>
                ) : categoriasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 italic text-red-700">
                      No hay categorías registradas
                    </td>
                  </tr>
                ) : (
                  currentItems.map((cat) => (
                    <tr key={cat.id_categoria} className="py-[18px] border-b border-black/20">
                      <td className="px-6 py-[18px] w-[10%]">{cat.id_categoria}</td>
                      <td className="px-6 py-[18px] w-[30%] line-clamp-1">{cat.nombre_categoria}</td>
                      <td className="px-6 py-[18px] w-[35%] line-clamp-2">{cat.descripcion || '-'}</td>

                      <td className="px-6 py-[18px] w-[25%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("editar", cat)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                          aria-label={`Editar ${cat.nombre_categoria}`}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                          </svg>
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("eliminar", cat)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                          aria-label={`Eliminar ${cat.nombre_categoria}`}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                          </svg>
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Anterior
            </button>

            <span className="text-[18px]">
              Página <span className="text-blue-700">{currentPage}</span> de {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Modales */}
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
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px]">
                  {modal === "crear" ? "Registrar Categoría" : "Editar Categoría"}
                </h3>

                <form onSubmit={handleGuardar} className="grid grid-cols-2 gap-[16px]">
                  <label className="block col-span-1">
                    <p className="">Nombre</p>
                    <input
                      type="text"
                      value={form.nombre_categoria}
                      onChange={(e) => setForm({ ...form, nombre_categoria: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: Ropa y Accesorios"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Descripción</p>
                    <input
                      type="text"
                      value={form.descripcion}
                      onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: Camisetas, gorras y accesorios relacionados"
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

          {modal === "eliminar" && selected && (
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
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px] text-red-600">Eliminar Categoría</h3>
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro que deseas eliminar la categoría <strong>{selected.nombre_categoria}</strong>?
                </p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button onClick={closeModal} className="btn bg-gray-200">
                    Cancelar
                  </button>
                  <button onClick={handleEliminar} className="btn bg-red-100 text-red-700">
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
