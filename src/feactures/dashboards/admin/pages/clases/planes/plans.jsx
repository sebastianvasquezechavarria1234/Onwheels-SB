import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "../../../layout/layout";
import { createPlan, deletePlan, getPlanes, updatePlan } from "../../services/planclassServices";

export const PlanClasses = () => {
  const [planes, setPlanes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [editForm, setEditForm] = useState({
    nombre_plan: "",
    descripcion: "",
    precio: "",
    descuento_porcentaje: "",
  });

  const [addForm, setAddForm] = useState({
    nombre_plan: "",
    descripcion: "",
    precio: "",
    descuento_porcentaje: "",
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    try {
      setLoading(true);
      const data = await getPlanes();
      setPlanes(data || []);
    } catch (err) {
      console.error("Error cargando planes:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item) => {
    setModalType(type);

    if (type === "add") {
      setAddForm({ nombre_plan: "", descripcion: "", precio: "", descuento_porcentaje: "" });
      setSelected(null);
      return;
    }

    setSelected(item || null);

    if (type === "edit" && item) {
      setEditForm({
        nombre_plan: item.nombre_plan || "",
        descripcion: item.descripcion || "",
        precio: item.precio || "",
        descuento_porcentaje: item.descuento_porcentaje || "",
      });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
  };

  const confirmDelete = async (id) => {
    try {
      await deletePlan(id);
      await loadPlanes();
      closeModal();
    } catch (err) {
      console.error("Error eliminando plan:", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!selected) return closeModal();
    try {
      await updatePlan(selected.id_plan, editForm);
      await loadPlanes();
      closeModal();
    } catch (err) {
      console.error("Error actualizando plan:", err);
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdd = async () => {
    try {
      await createPlan(addForm);
      await loadPlanes();
      closeModal();
    } catch (err) {
      console.error("Error creando plan:", err);
    }
  };

  // Filtrado antes de la paginación
  const planesFiltrados = planes.filter((p) =>
    p.nombre_plan?.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.precio).includes(search)
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = planesFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(planesFiltrados.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Clases / Planes de clases</h2>

        {/* Barra de búsqueda y botón */}
        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar plan:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  className="input pl-[50px]!"
                  type="text"
                  placeholder={'Por ejemplo: "Mensual"'}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
              Añadir plan
            </button>
          </div>
        </div>

        {/* Lista de planes (tabla estilo) */}
        <div className="p-[30px]">
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[20%] font-bold! opacity-80">Nombre</p>
            <p className="w-[30%] font-bold! opacity-80">Descripción</p>
            <p className="w-[15%] font-bold! opacity-80">Precio</p>
            <p className="w-[15%] font-bold! opacity-80">Descuento</p>
            <p className="w-[20%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr><th className="hidden" /></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">Cargando planes...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 italic text-red-700">No hay planes registrados</td>
                  </tr>
                ) : (
                  currentItems.map((plan) => (
                    <tr key={plan.id_plan} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[20%]">{plan.nombre_plan}</td>
                      <td className="px-6 py-[18px] w-[30%] line-clamp-2">{plan.descripcion}</td>
                      <td className="px-6 py-[18px] w-[15%]">${plan.precio}</td>
                      <td className="px-6 py-[18px] w-[15%]">{plan.descuento_porcentaje}%</td>
                      <td className="px-6 py-[18px] w-[20%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("details", plan)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("edit", plan)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("delete", plan)}
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

        {/* === Modales === */}
        <AnimatePresence>
          {/* Agregar */}
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
                <h3 className="font-primary text-center mb-[30px]">Agregar plan</h3>

                <form className="grid grid-cols-2 gap-[16px]">
                  <label className="block col-span-1">
                    <p className="">Nombre</p>
                    <input
                      name="nombre_plan"
                      className="input w-full"
                      value={addForm.nombre_plan}
                      onChange={handleAddChange}
                      placeholder="Ej: Mensual"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Precio</p>
                    <input
                      type="number"
                      name="precio"
                      className="input w-full"
                      value={addForm.precio}
                      onChange={handleAddChange}
                      placeholder="Ej: 45000"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Descuento (%)</p>
                    <input
                      type="number"
                      name="descuento_porcentaje"
                      className="input w-full"
                      value={addForm.descuento_porcentaje}
                      onChange={handleAddChange}
                      placeholder="Ej: 10"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Descripción</p>
                    <input
                      name="descripcion"
                      className="input w-full"
                      value={addForm.descripcion}
                      onChange={handleAddChange}
                      placeholder="Ej: Acceso ilimitado a clases mensuales"
                    />
                  </label>

                  <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                    <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                    <button type="button" onClick={saveAdd} className="btn bg-blue-100 text-blue-700">Guardar</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Detalles */}
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
                <h3 className="font-primary text-center mb-[30px]">Detalles del plan</h3>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <p className="font-medium">Nombre:</p>
                    <p className="font-medium">Descripción:</p>
                    <p className="font-medium">Precio:</p>
                    <p className="font-medium">Descuento:</p>
                  </div>
                  <div>
                    <p className="text-gray-700">{selected.nombre_plan}</p>
                    <p className="text-gray-700">{selected.descripcion}</p>
                    <p className="text-gray-700">${selected.precio}</p>
                    <p className="text-gray-700">{selected.descuento_porcentaje}%</p>
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

          {/* Editar */}
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
                <h3 className="font-primary text-center mb-[30px]">Editar plan</h3>

                <form className="grid grid-cols-2 gap-[16px]">
                  <label className="block col-span-1">
                    <p className="">Nombre</p>
                    <input
                      name="nombre_plan"
                      className="input w-full"
                      value={editForm.nombre_plan}
                      onChange={handleEditChange}
                      placeholder="Ej: Mensual"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Precio</p>
                    <input
                      type="number"
                      name="precio"
                      className="input w-full"
                      value={editForm.precio}
                      onChange={handleEditChange}
                      placeholder="Ej: 45000"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Descuento (%)</p>
                    <input
                      type="number"
                      name="descuento_porcentaje"
                      className="input w-full"
                      value={editForm.descuento_porcentaje}
                      onChange={handleEditChange}
                      placeholder="Ej: 10"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Descripción</p>
                    <input
                      name="descripcion"
                      className="input w-full"
                      value={editForm.descripcion}
                      onChange={handleEditChange}
                      placeholder="Ej: Acceso ilimitado a clases mensuales"
                    />
                  </label>

                  <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                    <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                    <button type="button" onClick={saveEdit} className="btn bg-blue-100 text-blue-700">Guardar</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Eliminar */}
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
                <h3 className="font-primary text-center mb-[30px]">Eliminar plan</h3>
                <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar el plan <span className="font-bold">{selected?.nombre_plan}</span>? Esta acción es permanente.</p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button className="btn bg-gray-200" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id_plan)}>
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
};

export default PlanClasses;
