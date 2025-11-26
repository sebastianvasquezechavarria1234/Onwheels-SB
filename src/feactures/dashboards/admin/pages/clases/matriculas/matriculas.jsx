import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { Layout } from "../../../layout/layout";
import { AnimatePresence, motion } from "framer-motion";

const Matriculas = () => {
  // UN DATO "quemado" en la tabla
  const [matriculas, setMatriculas] = useState([
    {
      id_matricula: "M-0001",
      id_preinscripcion: "P-12345",
      id_clase: "10",
      id_plan: "2",
      id_metodo_pago: "Tarjeta",
      fecha_matricula: "2025-11-01",
      valor_matricula: 50000,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState(null); // "add" | "edit" | "delete" | "details" | "addPlanClase"
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    id_preinscripcion: "",
    id_clase: "",
    id_plan: "",
    id_metodo_pago: "",
    fecha_matricula: "",
    valor_matricula: "",
  });

  // Form para el modal nuevo (añadir plan y clase)
  const [formAddPC, setFormAddPC] = useState({
    id_plan: "",
    id_clase: "",
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // no hay fetch real, dato quemado
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item || null);

    if (type === "add") {
      setForm({
        id_preinscripcion: "",
        id_clase: "",
        id_plan: "",
        id_metodo_pago: "",
        fecha_matricula: "",
        valor_matricula: "",
      });
    }

    if (type === "edit" && item) {
      setForm({
        id_preinscripcion: item.id_preinscripcion || "",
        id_clase: item.id_clase || "",
        id_plan: item.id_plan || "",
        id_metodo_pago: item.id_metodo_pago || "",
        fecha_matricula: item.fecha_matricula || "",
        valor_matricula: item.valor_matricula || "",
      });
    }

    if (type === "addPlanClase" && item) {
      setFormAddPC({
        id_plan: item.id_plan || "",
        id_clase: item.id_clase || "",
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleChangePC = (e) => setFormAddPC((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        const newItem = {
          ...form,
          id_matricula: `M-${Math.floor(Math.random() * 9000) + 1000}`,
          valor_matricula: Number(form.valor_matricula) || 0,
        };
        setMatriculas((p) => [newItem, ...p]);
      } else if (modalType === "edit" && selected) {
        setMatriculas((p) =>
          p.map((it) =>
            it.id_matricula === selected.id_matricula
              ? { ...it, ...form, valor_matricula: Number(form.valor_matricula) || it.valor_matricula }
              : it
          )
        );
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Error al guardar la matrícula (local).");
    }
  };

  const handleAddPlanClase = (e) => {
    e.preventDefault();
    if (!selected) return;

    setMatriculas((p) =>
      p.map((it) =>
        it.id_matricula === selected.id_matricula
          ? {
              ...it,
              id_plan: formAddPC.id_plan || it.id_plan,
              id_clase: formAddPC.id_clase || it.id_clase,
            }
          : it
      )
    );

    closeModal();
  };

  const handleDelete = async (id) => {
    try {
      setMatriculas((p) => p.filter((it) => it.id_matricula !== id));
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar la matrícula (local).");
    }
  };

  // Filtrado antes de paginación (QUITÉ id_preinscripcion del filtro)
  const filtered = matriculas.filter((m) =>
    [
      m.id_matricula,
      m.id_clase,
      m.id_plan,
      m.fecha_matricula,
      m.valor_matricula,
      m.id_metodo_pago,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Matrículas &gt; Gestión de Matrículas</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar matrículas:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  placeholder="Por ejemplo: Buscar por ID, clase o fecha"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="input pl-[50px]!"
                />
              </div>
            </label>
          </form>

          <div>
            <button
              onClick={() => openModal("add")}
              className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
            >
              <Plus size={18} strokeWidth={1.8} />
              Registrar nueva matrícula
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados (quitada Preinscripción) */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[12%] font-bold! opacity-80">Nombre:</p>
            <p className="w-[14%] font-bold! opacity-80">Correo:</p>
            <p className="w-[12%] font-bold! opacity-80">Telefono:</p>
            <p className="w-[14%] font-bold! opacity-80">Plan:</p>
            <p className="w-[12%] font-bold! opacity-80">Estado</p>
            <p className="w-[10%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr><th className="hidden"/></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-400 italic">Cargando matrículas...</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 italic text-red-700">No hay matrículas registradas</td>
                  </tr>
                ) : (
                  currentItems.map((m) => (
                    <tr key={m.id_matricula} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[12%]">{m.id_matricula}</td>
                      <td className="px-6 py-[18px] w-[14%] line-clamp-1">{m.id_clase}</td>
                      <td className="px-6 py-[18px] w-[12%]">{m.id_plan}</td>
                      <td className="px-6 py-[18px] w-[14%]">{m.fecha_matricula}</td>
                      <td className="px-6 py-[18px] w-[12%]">${m.valor_matricula}</td>
                      <td className="px-6 py-[18px] w-[12%]">{m.id_metodo_pago}</td>

                      <td className="px-6 py-[18px] w-[20%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("details", m)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("edit", m)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        {/* NUEVO BOTÓN + (misma estética que los demás) */}
                        <motion.button
                          onClick={() => openModal("addPlanClase", m)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-purple-100 text-purple-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-purple-300 shadow-md"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("delete", m)}
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
      </section>

      {/* Modales */}
      <AnimatePresence>
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
              <h3 className="font-primary text-center mb-[30px]">Registrar Matrícula</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">ID Preinscripción</p>
                  <input name="id_preinscripcion" className="input w-full" value={form.id_preinscripcion} onChange={handleChange} placeholder="Ej: 12345" required />
                </label>

                <label className="block col-span-1">
                  <p className="">ID Clase</p>
                  <input name="id_clase" className="input w-full" value={form.id_clase} onChange={handleChange} placeholder="Ej: 10" required />
                </label>

                <label className="block col-span-1">
                  <p className="">ID Plan</p>
                  <input name="id_plan" className="input w-full" value={form.id_plan} onChange={handleChange} placeholder="Ej: 2" required />
                </label>

                <label className="block col-span-1">
                  <p className="">ID Método Pago</p>
                  <input name="id_metodo_pago" className="input w-full" value={form.id_metodo_pago} onChange={handleChange} placeholder="Ej: Tarjeta" required />
                </label>

                <label className="block col-span-1">
                  <p className="">Fecha Matrícula</p>
                  <input type="date" name="fecha_matricula" className="input w-full" value={form.fecha_matricula} onChange={handleChange} required />
                </label>

                <label className="block col-span-1">
                  <p className="">Valor Matrícula</p>
                  <input type="number" name="valor_matricula" className="input w-full" value={form.valor_matricula} onChange={handleChange} placeholder="Ej: 50000" required />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                  <button type="submit" className="btn bg-blue-100 text-blue-700">Guardar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

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
              <h3 className="font-primary text-center mb-[30px]">Editar Matrícula</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">Valor Matrícula</p>
                  <input type="number" name="valor_matricula" className="input w-full" value={form.valor_matricula} onChange={handleChange} required />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                  <button type="submit" className="btn bg-blue-100 text-blue-700">Actualizar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

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
              <h3 className="font-primary text-center mb-[30px]">Eliminar Matrícula</h3>
              <p className="text-gray-600 mb-4">¿Seguro que deseas eliminar la matrícula <strong>{selected.id_matricula}</strong>?</p>
              <div className="flex justify-end gap-[10px] mt-[10px]">
                <button className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                <button className="btn bg-red-100 text-red-700" onClick={() => handleDelete(selected.id_matricula)}>Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
              <h3 className="font-primary text-center mb-[30px]">Detalles Matrícula</h3>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <p className="font-medium">ID Matrícula:</p>
                  <p className="font-medium">Preinscripción:</p>
                  <p className="font-medium">Clase:</p>
                  <p className="font-medium">Plan:</p>
                  <p className="font-medium">Fecha:</p>
                  <p className="font-medium">Valor:</p>
                  <p className="font-medium">Método Pago:</p>
                </div>
                <div>
                  <p className="text-gray-700">{selected.id_matricula}</p>
                  <p className="text-gray-700">{selected.id_preinscripcion}</p>
                  <p className="text-gray-700">{selected.id_clase}</p>
                  <p className="text-gray-700">{selected.id_plan}</p>
                  <p className="text-gray-700">{selected.fecha_matricula}</p>
                  <p className="text-gray-700">${selected.valor_matricula}</p>
                  <p className="text-gray-700">{selected.id_metodo_pago}</p>
                </div>
              </div>
              <div className="flex justify-end gap-[10px] mt-[20px]">
                <button className="btn bg-gray-200" onClick={closeModal}>Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL NUEVO: addPlanClase */}
        {modalType === "addPlanClase" && selected && (
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
              <h3 className="font-primary text-center mb-[30px]">Agregar Plan y Clase</h3>

              <form onSubmit={handleAddPlanClase} className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">ID Plan</p>
                  <input name="id_plan" className="input w-full" value={formAddPC.id_plan} onChange={handleChangePC} placeholder="Ej: 2" required />
                </label>

                <label className="block col-span-1">
                  <p className="">ID Clase</p>
                  <input name="id_clase" className="input w-full" value={formAddPC.id_clase} onChange={handleChangePC} placeholder="Ej: 10" required />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                  <button type="submit" className="btn bg-blue-100 text-blue-700">Añadir</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Matriculas;
