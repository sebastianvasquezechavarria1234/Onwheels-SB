import React, { useEffect, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRoles } from "../../services/RolesService";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [editForm, setEditForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [addForm, setAddForm] = useState({ nombre_rol: "", descripcion: "", estado: true });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // búsqueda
  const [search, setSearch] = useState("");

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // cargar roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setError("No se pudieron cargar los roles. Revisa la API / CORS.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Modales ---------------- */
  const openModal = (type, item) => {
    setModalType(type);
    if (type === "add") {
      setAddForm({ nombre_rol: "", descripcion: "", estado: true });
      setSelected(null);
      return;
    }
    setSelected(item ? { ...item } : null);
    if (type === "edit" && item) {
      setEditForm({ nombre_rol: item.nombre_rol || "", descripcion: item.descripcion || "", estado: !!item.estado });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
  };

  /* ---------------- CRUD local (in-memory) ---------------- */
  const confirmDelete = (id) => {
    setRoles((prev) => prev.filter((it) => it.id !== id));
    closeModal();
  };

  const toggleEstado = (id) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, estado: !r.estado } : r)));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveEdit = () => {
    if (!selected) return closeModal();
    setRoles((prev) => prev.map((it) => (it.id === selected.id ? { ...it, ...editForm } : it)));
    closeModal();
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveAdd = () => {
    const newId = roles.length ? Math.max(...roles.map((c) => +c.id)) + 1 : 1;
    const newRole = {
      id: newId,
      nombre_rol: addForm.nombre_rol || `Rol ${newId}`,
      descripcion: addForm.descripcion || "",
      estado: typeof addForm.estado === "boolean" ? addForm.estado : true,
    };
    setRoles((prev) => [newRole, ...prev]);
    closeModal();
  };

  // Filtrado y paginación
  const rolesFiltrados = roles.filter((r) => r.nombre_rol?.toLowerCase().includes(search.toLowerCase()));
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = rolesFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(rolesFiltrados.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Configuracion / Roles</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar Rol:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="input pl-[50px]!"
                  type="text"
                  placeholder="Por ejem: 'Administrador'"
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
              Añadir rol
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles (igual que ejemplo) */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[30%] font-bold! opacity-80">Nombre</p>
            <p className="w-[55%] font-bold! opacity-80">Descripción</p>
            <p className="w-[15%] font-bold! opacity-80">Estado</p>
            <p className="w-[15%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr><th className="hidden" /></tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-400 italic">Cargando roles...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 italic text-red-700">{error}</td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 italic text-red-700">No hay roles registrados</td>
                  </tr>
                ) : (
                  currentItems.map((role) => (
                    <tr key={role.id} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[30%]">{role.nombre_rol}</td>
                      <td className="px-6 py-[18px] w-[55%] line-clamp-2">{role.descripcion}</td>

                      <td className="px-6 py-[18px] w-[15%]">
                        <span
                          onClick={() => toggleEstado(role.id)}
                          className={`px-[15px] py-[7px] rounded-full inline-flex items-center gap-[10px] cursor-pointer ${
                            role.estado ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                          {role.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-[18px] w-[15%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("details", role)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("edit", role)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("delete", role)}
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
                <h3 className="font-primary text-center mb-[30px]">Agregar rol</h3>

                <form>
                  <label className="block mb-[20px]">
                    <p className="">Nombre</p>
                    <input name="nombre_rol" className="input w-full" value={addForm.nombre_rol} onChange={handleAddChange} placeholder="Ej: Administrador" />
                  </label>

                  <label className="block mb-[20px]">
                    <p className="">Descripción:</p>
                    <textarea name="descripcion" className="input w-full h-[120px]" value={addForm.descripcion} onChange={handleAddChange} placeholder="Ej: Permite acceso completo al sistema" />
                  </label>

                  <label className="flex items-center gap-3 mb-[20px]">
                    <input type="checkbox" name="estado" checked={!!addForm.estado} onChange={handleAddChange} />
                    <span>Estado (activo)</span>
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
                <h3 className="font-primary text-center mb-[30px]">Detalles del rol</h3>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <p className="font-medium">Nombre:</p>
                    <p className="font-medium">Descripción:</p>
                    <p className="font-medium">Estado:</p>
                  </div>
                  <div>
                    <p className="text-gray-700">{selected.nombre_rol}</p>
                    <p className="text-gray-700">{selected.descripcion}</p>
                    <p className="text-gray-700">{selected.estado ? "Activo" : "Inactivo"}</p>
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
                <h3 className="font-primary text-center mb-[30px]">Editar rol</h3>

                <form>
                  <label className="block mb-[20px]">
                    <p className="">Nombre</p>
                    <input name="nombre_rol" className="input w-full" value={editForm.nombre_rol} onChange={handleEditChange} placeholder="Ej: Administrador" />
                  </label>

                  <label className="block mb-[20px]">
                    <p className="">Descripción:</p>
                    <textarea name="descripcion" className="input w-full h-[120px]" value={editForm.descripcion} onChange={handleEditChange} placeholder="Ej: Permite acceso completo al sistema" />
                  </label>

                  <label className="flex items-center gap-3 mb-[20px]">
                    <input type="checkbox" name="estado" checked={!!editForm.estado} onChange={handleEditChange} />
                    <span>Estado (activo)</span>
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
                <h3 className="font-primary text-center mb-[30px]">Eliminar rol</h3>
                <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar <span className="font-bold">{selected?.nombre_rol}</span>? Esta acción es permanente.</p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button className="btn bg-gray-200" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id)}>
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

export default Roles;
