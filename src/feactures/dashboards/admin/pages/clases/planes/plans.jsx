import React, { useEffect, useState } from "react";
import { Eye, Plus, Search, Pencil, Trash2 } from "lucide-react";
import {  motion, AnimatePresence } from "framer-motion";
import { Layout } from "../../../layout/layout";
import { createPlan, deletePlan, getPlanes, updatePlan } from "../../services/planclassServices"

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

  
  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    const data = await getPlanes();
    setPlanes(data);
  };

  const openModal = (type, item) => {
    setModalType(type);

    if (type === "add") {
      setAddForm({
        nombre_plan: "",
        descripcion: "",
        precio: "",
        descuento_porcentaje: "",
      });
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
    await deletePlan(id);
    await loadPlanes();
    closeModal();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!selected) return closeModal();
    await updatePlan(selected.id_plan, editForm);
    await loadPlanes();
    closeModal();
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdd = async () => {
    await createPlan(addForm);
    await loadPlanes();
    closeModal();
  };

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">
          Clases / Planes de clases
        </h2>

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

        {/* Lista de planes */}
        <div className="p-[30px]">
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[20%] font-bold! opacity-80">Nombre</p>
            <p className="w-[30%] font-bold! opacity-80">Descripción</p>
            <p className="w-[15%] font-bold! opacity-80">Precio</p>
            <p className="w-[15%] font-bold! opacity-80">Descuento</p>
            <p className="w-[20%] font-bold! opacity-80">Acciones</p>
          </article>

          {planes.map((plan) => (
            <article key={plan.id_plan} className="py-[18px] border-b border-black/20 flex items-center">
              <p className="w-[20%] line-clamp-1">{plan.nombre_plan}</p>
              <p className="w-[30%] line-clamp-2">{plan.descripcion}</p>
              <p className="w-[15%]">${plan.precio}</p>
              <p className="w-[15%]">{plan.descuento_porcentaje}%</p>

              <div className="w-[20%] flex gap-[10px] items-center">
                <motion.span
                  className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal("details", plan)}
                >
                  <Eye size={22} strokeWidth={1.3} />
                </motion.span>

                <motion.span
                  className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal("edit", plan)}
                >
                  <Pencil size={22} strokeWidth={1.3} />
                </motion.span>

                <motion.span
                  className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal("delete", plan)}
                >
                  <Trash2 size={22} strokeWidth={1.3} />
                </motion.span>
              </div>
            </article>
          ))}
        </div>

        {/* === Modales === */}
        <AnimatePresence>
          {/* Agregar */}
          {modalType === "add" && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Agregar plan</h3>
              <FormPlan
                form={addForm}
                handleChange={handleAddChange}
                onCancel={closeModal}
                onSave={saveAdd}
              />
            </ModalWrapper>
          )}

          {/* Detalles */}
          {modalType === "details" && selected && (
            <ModalWrapper onClose={closeModal}>
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
            </ModalWrapper>
          )}

          {/* Editar */}
          {modalType === "edit" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Editar plan</h3>
              <FormPlan
                form={editForm}
                handleChange={handleEditChange}
                onCancel={closeModal}
                onSave={saveEdit}
              />
            </ModalWrapper>
          )}

          {/* Eliminar */}
          {modalType === "delete" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Eliminar plan</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro que deseas eliminar el plan{" "}
                <span className="font-bold">{selected.nombre_plan}</span>? Esta acción es permanente.
              </p>
              <div className="flex justify-end gap-[10px] mt-[20px]">
                <button className="btn bg-gray-200" onClick={closeModal}>
                  Cancelar
                </button>
                <button
                  className="btn bg-red-100 text-red-700"
                  onClick={() => confirmDelete(selected.id_plan)}
                >
                  Eliminar
                </button>
              </div>
            </ModalWrapper>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
};

/* === Formulario reutilizable para agregar/editar === */
const FormPlan = ({ form, handleChange, onCancel, onSave }) => (
  <form>
    <label className="block mb-[20px]">
      <p>Nombre:</p>
      <input
        name="nombre_plan"
        className="input w-full"
        value={form.nombre_plan}
        onChange={handleChange}
      />
    </label>

    <label className="block mb-[20px]">
      <p>Descripción:</p>
      <textarea
        name="descripcion"
        className="input w-full h-[100px]"
        value={form.descripcion}
        onChange={handleChange}
      />
    </label>

    <label className="block mb-[20px]">
      <p>Precio:</p>
      <input
        type="number"
        name="precio"
        className="input w-full"
        value={form.precio}
        onChange={handleChange}
      />
    </label>

    <label className="block mb-[20px]">
      <p>Descuento (%):</p>
      <input
        type="number"
        name="descuento_porcentaje"
        className="input w-full"
        value={form.descuento_porcentaje}
        onChange={handleChange}
      />
    </label>

    <div className="flex justify-end gap-[10px] mt-[20px]">
      <button type="button" className="btn bg-gray-200" onClick={onCancel}>
        Cancelar
      </button>
      <button type="button" className="btn bg-blue-100 text-blue-700" onClick={onSave}>
        Guardar
      </button>
    </div>
  </form>
);

/* === Modal Wrapper === */
const ModalWrapper = ({ children, onClose }) => {
  return (
    <motion.div
      className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <motion.div
        className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PlanClasses;
