// admin/pages/configuracion/Roles.jsx
import React, { useEffect, useState } from "react";
import { getRoles /*, createRole, updateRole, deleteRole */ } from "../services/RolesService";
import { Layout } from "../layout/layout";
import { Eye, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Roles = () => {
  const [roles, setRoles] = useState([]); // viene de la API
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", estado: true });
  const [addForm, setAddForm] = useState({ nombre: "", descripcion: "", estado: true });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // cargar roles al montar
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoles(); // llama al servicio
      setRoles(data);
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
      setAddForm({ nombre: "", descripcion: "", estado: true });
      setSelected(null);
      return;
    }

    setSelected(item ? { ...item } : null);

    if (type === "edit" && item) {
      setEditForm({ nombre: item.nombre || "", descripcion: item.descripcion || "", estado: !!item.estado });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
  };

  /* ---------------- CRUD (local) ----------------
     Actualmente las operaciones se mantienen en memoria.
     Si quieres persistir en la API, descomenta e implementa las llamadas
     a createRole/updateRole/deleteRole en admin/services/rolesService.js
  */

  const confirmDelete = (id) => {
    // Para persistir: await deleteRole(id) y luego fetchRoles()
    setRoles((prev) => prev.filter((it) => it.id !== id));
    closeModal();
  };

  const toggleEstado = (id) => {
    // Para persistir: llamar a updateRole(id, { estado: !current }) y actualizar la lista
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, estado: !r.estado } : r)));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveEdit = async () => {
    if (!selected) return closeModal();
    // Para persistir:
    // await updateRole(selected.id, editForm);
    // fetchRoles();
    setRoles((prev) => prev.map((it) => (it.id === selected.id ? { ...it, ...editForm } : it)));
    closeModal();
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveAdd = async () => {
    // Para persistir en API:
    // const created = await createRole(addForm);
    // setRoles(prev => [created, ...prev]);
    const newId = roles.length ? Math.max(...roles.map((c) => +c.id)) + 1 : 1;
    const newRole = {
      id: newId,
      nombre: addForm.nombre || `Rol ${newId}`,
      descripcion: addForm.descripcion || "",
      estado: typeof addForm.estado === "boolean" ? addForm.estado : true,
    };
    setRoles((prev) => [newRole, ...prev]);
    closeModal();
  };

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
                <input className="input pl-[50px]!" type="text" placeholder="Por ejem: 'Administrador'" />
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
          {/* Encabezados */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[30%] font-bold! opacity-80">Nombre</p>
            <p className="w-[55%] font-bold! opacity-80">Descripción</p>
            <p className="w-[15%] font-bold! opacity-80">Estado</p>
            <p className="w-[15%] font-bold! opacity-80">Acciones</p>
          </article>

          {/* Estado de carga / error */}
          {loading && <p className="mt-6">Cargando roles...</p>}
          {error && <p className="mt-6 text-red-600">{error}</p>}

          {/* Lista de roles */}
          {!loading &&
            !error &&
            roles.map((role) => (
              <article key={role.id} className="py-[18px] border-b border-black/20 flex items-center">
                <p className="w-[30%] line-clamp-1">{role.nombre}</p>
                <p className="w-[55%] line-clamp-2">{role.descripcion}</p>

                <p className="w-[15%]">
                  <span
                    onClick={() => toggleEstado(role.id)}
                    className={`px-[15px] py-[7px] rounded-full inline-flex items-center gap-[10px] cursor-pointer ${
                      role.estado ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                    {role.estado ? "Activo" : "Inactivo"}
                  </span>
                </p>

                {/* Acciones: Ver, Editar, Eliminar */}
                <div className="w-[15%] flex gap-[10px] items-center">
                  <motion.span
                    className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => openModal("details", role)}
                  >
                    <Eye size={22} strokeWidth={1.3} />
                  </motion.span>

                  <motion.span
                    className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => openModal("edit", role)}
                  >
                    <Pencil size={22} strokeWidth={1.3} />
                  </motion.span>

                  <motion.span
                    className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => openModal("delete", role)}
                  >
                    <Trash2 size={22} strokeWidth={1.3} />
                  </motion.span>
                </div>
              </article>
            ))}
        </div>

        {/* Modales */}
        <AnimatePresence>
          {/* Add */}
          {modalType === "add" && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Agregar rol</h3>

              <form>
                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Nombre:</p>
                  <input name="nombre" className="input w-full" value={addForm.nombre} onChange={handleAddChange} />
                </label>

                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Descripción:</p>
                  <textarea name="descripcion" className="input w-full h-[120px]" value={addForm.descripcion} onChange={handleAddChange} />
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
            </ModalWrapper>
          )}

          {/* Details */}
          {modalType === "details" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Detalles del rol</h3>

              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <p className="font-medium">Nombre:</p>
                  <p className="font-medium">Descripción:</p>
                  <p className="font-medium">Estado:</p>
                </div>
                <div>
                  <p className="text-gray-700">{selected.nombre}</p>
                  <p className="text-gray-700">{selected.descripcion}</p>
                  <p className="text-gray-700">{selected.estado ? "Activo" : "Inactivo"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-[10px] mt-[30px]">
                <button className="btn bg-gray-200" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            </ModalWrapper>
          )}

          {/* Edit */}
          {modalType === "edit" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Editar rol</h3>

              <form>
                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Nombre:</p>
                  <input name="nombre" className="input w-full" value={editForm.nombre} onChange={handleEditChange} />
                </label>

                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Descripción:</p>
                  <textarea name="descripcion" className="input w-full h-[120px]" value={editForm.descripcion} onChange={handleEditChange} />
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
            </ModalWrapper>
          )}

          {/* Delete */}
          {modalType === "delete" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Eliminar rol</h3>
              <p className="text-gray-600 mb-4">
                ¿Estás seguro que deseas eliminar <span className="font-bold">{selected.nombre}</span>? Esta acción es permanente.
              </p>
              <div className="flex justify-end gap-[10px] mt-[20px]">
                <button className="btn bg-gray-200" onClick={closeModal}>
                  Cancelar
                </button>
                <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id)}>
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

/* === Modal  === */
const ModalWrapper = ({ children, onClose }) => {
  return (
    <motion.div
      className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* overlay clickeable con dim */}
      <div className="absolute inset-0" onClick={onClose} />

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

export default Roles;
