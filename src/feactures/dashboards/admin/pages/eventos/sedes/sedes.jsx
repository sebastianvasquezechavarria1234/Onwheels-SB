import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSedes,
  createSede,
  updateSede,
  deleteSede,
} from "../../services/sedesServices";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // 
  const [form, setForm] = useState({
    nombre_sede: "",
    direccion: "",
    ciudad: "",
    telefono_sede: "",
  });

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = sedes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sedes.length / itemsPerPage);

  // 🔹 Cargar sedes
  const fetchSedes = async () => {
    try {
      const data = await getSedes();
      setSedes(data);
    } catch (err) {
      console.error("Error al cargar sedes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  // 🔹 Abrir modal
  const openModal = (type, sede = null) => {
    setModal(type);
    setSelected(sede);
    setForm(
      sede || {
        nombre_sede: "",
        direccion: "",
        ciudad: "",
        telefono_sede: "",
      }
    );
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ nombre_sede: "", direccion: "", ciudad: "", telefono_sede: "" });
  };

  // 🔹 Crear o editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === "crear") {
        await createSede(form);
      } else if (modal === "editar") {
        await updateSede(selected.id_sede, form);
      }
      fetchSedes();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  // 🔹 Eliminar
  const handleDelete = async () => {
    try {
      await deleteSede(selected.id_sede);
      fetchSedes();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">
          Sedes &gt; Gestión de Sedes
        </h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar sedes:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  placeholder="Ej: Skatepark La 70, Envigado"
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
              Registrar nueva sede
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[10%] font-bold! opacity-80">ID</p>
            <p className="w-[25%] font-bold! opacity-80">Nombre</p>
            <p className="w-[30%] font-bold! opacity-80">Dirección</p>
            <p className="w-[15%] font-bold! opacity-80">Ciudad</p>
            <p className="w-[10%] font-bold! opacity-80">Teléfono</p>
            <p className="w-[15%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="">
                <tr><th className="hidden" /></tr>
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
                    <td colSpan="6" className="text-center py-10 italic text-red-700">
                      No hay sedes registradas
                    </td>
                  </tr>
                ) : (
                  currentItems.map((s) => (
                    <tr key={s.id_sede} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[10%]">{s.id_sede}</td>
                      <td className="px-6 py-[18px] w-[25%] line-clamp-1">{s.nombre_sede}</td>
                      <td className="px-6 py-[18px] w-[30%] line-clamp-2">{s.direccion}</td>
                      <td className="px-6 py-[18px] w-[15%]">{s.ciudad}</td>
                      <td className="px-6 py-[18px] w-[10%]">{s.telefono_sede}</td>

                      <td className="px-6 py-[18px] w-[15%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("ver", s)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("editar", s)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("eliminar", s)}
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
                {modal === "crear" ? "Registrar Sede" : "Editar Sede"}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">Nombre</p>
                  <input
                    type="text"
                    value={form.nombre_sede}
                    onChange={(e) =>
                      setForm({ ...form, nombre_sede: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Ej: Skatepark La 70"
                    required
                  />
                </label>

                <label className="block col-span-1">
                  <p className="">Ciudad</p>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    className="input w-full"
                    placeholder="Ej: Medellín"
                    required
                  />
                </label>

                <label className="block col-span-1">
                  <p className="">Dirección</p>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) =>
                      setForm({ ...form, direccion: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Ej: Calle 10 #45-20 (parque central)"
                    required
                  />
                </label>

                <label className="block col-span-1">
                  <p className="">Teléfono</p>
                  <input
                    type="text"
                    value={form.telefono_sede}
                    onChange={(e) =>
                      setForm({ ...form, telefono_sede: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Ej: +57 300 123 4567"
                    required
                  />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn bg-blue-100 text-blue-700"
                  >
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
        {modal === "ver" && selected && (
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
              <h3 className="font-primary text-center mb-[30px]">Detalles de la Sede</h3>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <p className="font-medium">ID:</p>
                  <p className="font-medium">Nombre:</p>
                  <p className="font-medium">Dirección:</p>
                </div>
                <div>
                  <p className="text-gray-700">{selected.id_sede}</p>
                  <p className="text-gray-700">{selected.nombre_sede}</p>
                  <p className="text-gray-700">{selected.direccion}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="font-medium">Ciudad:</p>
                <p className="text-gray-700">{selected.ciudad}</p>
                <p className="font-medium mt-2">Teléfono:</p>
                <p className="text-gray-700">{selected.telefono_sede}</p>
              </div>

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
              <h3 className="font-primary text-center mb-[30px] text-red-600">Eliminar Sede</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro que deseas eliminar la sede{" "}
                <strong>{selected.nombre_sede}</strong>?
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
