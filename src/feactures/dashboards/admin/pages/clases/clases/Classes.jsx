import React, { useEffect, useState } from "react";
import { getClases, createClase, updateClase, deleteClase } from "../../services/classServices.js";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../../../layout/layout.jsx";

function Clases() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [addForm, setAddForm] = useState({
    id_nivel: "",
    id_sede: "",
    id_instructor: "",
    cupo_maximo: "",
    dia_semana: "",
    descripcion: "",
    estado: "Disponible",
    hora_inicio: "",
    hora_fin: "",
  });

  const [editForm, setEditForm] = useState({ ...addForm });

  //cargaclases
  useEffect(() => {
    fetchClases();
  }, []);

  const fetchClases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClases();
      setClases(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar clases. Revisa la API.");
    } finally {
      setLoading(false);
    }
  };

  //* ---------- CRUD ---------- *//
  const saveAdd = async () => {
    try {
      const res = await createClase(addForm);
      setClases((prev) => [res, ...prev]);
      closeModal();
    } catch (err) {
      console.error("Error creando clase:", err);
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      const res = await updateClase(selected.id_clase, editForm);
      setClases((prev) =>
        prev.map((c) => (c.id_clase === selected.id_clase ? { ...c, ...editForm } : c))
      );
      closeModal();
    } catch (err) {
      console.error("Error actualizando clase:", err);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await deleteClase(id);
      setClases((prev) => prev.filter((c) => c.id_clase !== id));
      closeModal();
    } catch (err) {
      console.error("Error eliminando clase:", err);
    }
  };

  //* ---------- Modal helpers ---------- *//
  const openModal = (type, item) => {
    setModalType(type);
    if (type === "add") {
      setAddForm({
        id_nivel: "",
        id_sede: "",
        id_instructor: "",
        cupo_maximo: "",
        dia_semana: "",
        descripcion: "",
        estado: "Disponible",
        hora_inicio: "",
        hora_fin: "",
      });
      setSelected(null);
      return;
    }
    if (item) {
      setSelected(item);
      setEditForm({ ...item });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
  };

  const handleChange = (e, formSetter) => {
    const { name, value, type, checked } = e.target;
    formSetter((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // búsqueda
  const [search, setSearch] = useState("");

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrado y paginación
  const clasesFiltradas = clases.filter((c) => 
    c.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
    c.id_nivel?.toString().includes(search.toLowerCase()) ||
    c.id_sede?.toString().includes(search.toLowerCase())
  );
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = clasesFiltradas.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(clasesFiltradas.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Configuracion / Clases</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar Clase:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="input pl-[50px]!"
                  type="text"
                  placeholder="Por ejem: 'Yoga'"
                />
              </div>
            </label>
          </form>

          <div className="">
            <button
              className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
              onClick={() => openModal("add", null)}
            >
              <Plus size={20} strokeWidth={1.8} />
              Añadir clase
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Clases */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[8%] font-bold! opacity-80">ID</p>
            <p className="w-[10%] font-bold! opacity-80">Nivel</p>
            <p className="w-[10%] font-bold! opacity-80">Sede</p>
            <p className="w-[10%] font-bold! opacity-80">Instructor</p>
            <p className="w-[8%] font-bold! opacity-80">Cupo</p>
            <p className="w-[10%] font-bold! opacity-80">Día</p>
            <p className="w-[12%] font-bold! opacity-80">Horario</p>
            <p className="w-[20%] font-bold! opacity-80">Descripción</p>
            <p className="w-[8%] font-bold! opacity-80">Estado</p>
            <p className="w-[4%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr><th className="hidden" /></tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-gray-400 italic">Cargando clases...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 italic text-red-700">{error}</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-10 italic text-red-700">No hay clases registradas</td>
                  </tr>
                ) : (
                  currentItems.map((clase) => (
                    <tr key={clase.id_clase} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[8%]">{clase.id_clase}</td>
                      <td className="px-6 py-[18px] w-[10%]">{clase.id_nivel}</td>
                      <td className="px-6 py-[18px] w-[10%]">{clase.id_sede}</td>
                      <td className="px-6 py-[18px] w-[10%]">{clase.id_instructor}</td>
                      <td className="px-6 py-[18px] w-[8%]">{clase.cupo_maximo}</td>
                      <td className="px-6 py-[18px] w-[10%]">{clase.dia_semana}</td>
                      <td className="px-6 py-[18px] w-[12%]">{clase.hora_inicio} - {clase.hora_fin}</td>
                      <td className="px-6 py-[18px] w-[20%] line-clamp-2">{clase.descripcion}</td>

                      <td className="px-6 py-[18px] w-[8%]">
                        <span
                          className={`px-[15px] py-[7px] rounded-full inline-flex items-center gap-[10px] cursor-pointer ${
                            clase.estado === "Disponible" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                          {clase.estado}
                        </span>
                      </td>

                      <td className="px-6 py-[18px] w-[4%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("details", clase)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("edit", clase)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("delete", clase)}
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

          {/* Paginación (siempre visible) */}
          <div className="flex justify-center items-center gap-2 py-4 italic">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Anterior
            </button>

            <span className="text-[18px]">Página <span className="text-blue-700">{currentPage}</span> de {totalPages}</span>

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
          {/* Add */}
          {modalType === "add" && (
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
                <h3 className="font-primary text-center mb-[30px]">Agregar clase</h3>

                <form>
                  <label className="block mb-[20px]">
                    <p className="">Descripción</p>
                    <input name="descripcion" className="input w-full" value={addForm.descripcion} onChange={(e) => handleChange(e, setAddForm)} placeholder="Ej: Clase de Yoga" />
                  </label>

                  <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                    <label className="block">
                      <p className="">Nivel</p>
                      <input name="id_nivel" className="input w-full" value={addForm.id_nivel} onChange={(e) => handleChange(e, setAddForm)} placeholder="Ej: 1" />
                    </label>

                    <label className="block">
                      <p className="">Sede</p>
                      <input name="id_sede" className="input w-full" value={addForm.id_sede} onChange={(e) => handleChange(e, setAddForm)} placeholder="Ej: 1" />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                    <label className="block">
                      <p className="">Instructor</p>
                      <input name="id_instructor" className="input w-full" value={addForm.id_instructor} onChange={(e) => handleChange(e, setAddForm)} placeholder="Ej: 1" />
                    </label>

                    <label className="block">
                      <p className="">Cupo Máximo</p>
                      <input name="cupo_maximo" className="input w-full" value={addForm.cupo_maximo} onChange={(e) => handleChange(e, setAddForm)} placeholder="Ej: 20" />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                    <label className="block">
                      <p className="">Día de la Semana</p>
                      <input name="dia_semana" className="input w-full" value={addForm.dia_semana} onChange={(e) => handleChange(e, setAddForm)} placeholder="Ej: Lunes" />
                    </label>

                    <label className="block">
                      <p className="">Horario</p>
                      <div className="grid grid-cols-2 gap-[10px]">
                        <input name="hora_inicio" className="input" value={addForm.hora_inicio} onChange={(e) => handleChange(e, setAddForm)} placeholder="Inicio" type="time" />
                        <input name="hora_fin" className="input" value={addForm.hora_fin} onChange={(e) => handleChange(e, setAddForm)} placeholder="Fin" type="time" />
                      </div>
                    </label>
                  </div>

                  <label className="block mb-[20px]">
                    <p className="">Estado</p>
                    <select name="estado" className="input w-full" value={addForm.estado} onChange={(e) => handleChange(e, setAddForm)}>
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </label>

                  <div className="flex justify-end gap-[10px] mt-[20px]">
                    <button type="button" className="btn bg-gray-200" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveAdd}>
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Details */}
          {modalType === "details" && selected && (
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
                <h3 className="font-primary text-center mb-[30px]">Detalles de la clase</h3>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <p className="font-medium">ID:</p>
                    <p className="font-medium">Nivel:</p>
                    <p className="font-medium">Sede:</p>
                    <p className="font-medium">Instructor:</p>
                    <p className="font-medium">Cupo Máximo:</p>
                    <p className="font-medium">Día de la Semana:</p>
                    <p className="font-medium">Horario:</p>
                    <p className="font-medium">Descripción:</p>
                    <p className="font-medium">Estado:</p>
                  </div>
                  <div>
                    <p className="text-gray-700">{selected.id_clase}</p>
                    <p className="text-gray-700">{selected.id_nivel}</p>
                    <p className="text-gray-700">{selected.id_sede}</p>
                    <p className="text-gray-700">{selected.id_instructor}</p>
                    <p className="text-gray-700">{selected.cupo_maximo}</p>
                    <p className="text-gray-700">{selected.dia_semana}</p>
                    <p className="text-gray-700">{selected.hora_inicio} - {selected.hora_fin}</p>
                    <p className="text-gray-700">{selected.descripcion}</p>
                    <p className="text-gray-700">{selected.estado}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-[10px] mt-[30px]">
                  <button className="btn bg-gray-200" onClick={closeModal}>
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Edit */}
          {modalType === "edit" && selected && (
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
                <h3 className="font-primary text-center mb-[30px]">Editar clase</h3>

                <form>
                  <label className="block mb-[20px]">
                    <p className="">Descripción</p>
                    <input name="descripcion" className="input w-full" value={editForm.descripcion} onChange={(e) => handleChange(e, setEditForm)} placeholder="Ej: Clase de Yoga" />
                  </label>

                  <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                    <label className="block">
                      <p className="">Nivel</p>
                      <input name="id_nivel" className="input w-full" value={editForm.id_nivel} onChange={(e) => handleChange(e, setEditForm)} placeholder="Ej: 1" />
                    </label>

                    <label className="block">
                      <p className="">Sede</p>
                      <input name="id_sede" className="input w-full" value={editForm.id_sede} onChange={(e) => handleChange(e, setEditForm)} placeholder="Ej: 1" />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                    <label className="block">
                      <p className="">Instructor</p>
                      <input name="id_instructor" className="input w-full" value={editForm.id_instructor} onChange={(e) => handleChange(e, setEditForm)} placeholder="Ej: 1" />
                    </label>

                    <label className="block">
                      <p className="">Cupo Máximo</p>
                      <input name="cupo_maximo" className="input w-full" value={editForm.cupo_maximo} onChange={(e) => handleChange(e, setEditForm)} placeholder="Ej: 20" />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                    <label className="block">
                      <p className="">Día de la Semana</p>
                      <input name="dia_semana" className="input w-full" value={editForm.dia_semana} onChange={(e) => handleChange(e, setEditForm)} placeholder="Ej: Lunes" />
                    </label>

                    <label className="block">
                      <p className="">Horario</p>
                      <div className="grid grid-cols-2 gap-[10px]">
                        <input name="hora_inicio" className="input" value={editForm.hora_inicio} onChange={(e) => handleChange(e, setEditForm)} placeholder="Inicio" type="time" />
                        <input name="hora_fin" className="input" value={editForm.hora_fin} onChange={(e) => handleChange(e, setEditForm)} placeholder="Fin" type="time" />
                      </div>
                    </label>
                  </div>

                  <label className="block mb-[20px]">
                    <p className="">Estado</p>
                    <select name="estado" className="input w-full" value={editForm.estado} onChange={(e) => handleChange(e, setEditForm)}>
                      <option value="Disponible">Disponible</option>
                      <option value="Ocupado">Ocupado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </label>

                  <div className="flex justify-end gap-[10px] mt-[20px]">
                    <button type="button" className="btn bg-gray-200" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveEdit}>
                      Guardar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Delete */}
          {modalType === "delete" && selected && (
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
                <h3 className="font-primary text-center mb-[30px]">Eliminar clase</h3>
                <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar <span className="font-bold">{selected?.descripcion}</span>? Esta acción es permanente.</p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button className="btn bg-gray-200" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id_clase)}>
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

export default Clases;
