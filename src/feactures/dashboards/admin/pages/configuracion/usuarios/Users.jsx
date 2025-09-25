import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Funnel, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



const initialUsers = [
  { id: 1, nombre: "Ana Gómez", email: "ana@gomez.com", telefono: "3001234567", estado: true },
  { id: 2, nombre: "Luis Pérez", email: "luis@perez.com", telefono: "3009876543", estado: false },
  { id: 3, nombre: "María Ruiz", email: "maria@ruiz.com", telefono: "3105554433", estado: true },
];

export const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [editForm, setEditForm] = useState({ nombre: "", email: "", telefono: "", estado: true });
  const [addForm, setAddForm] = useState({ nombre: "", email: "", telefono: "", estado: true });

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [message, setMessage] = useState(null);

  // debounce simple
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filtrado en memoria
  const filtered = useMemo(() => {
    if (!debouncedQuery) return users;
    const q = debouncedQuery.toLowerCase();
    return users.filter((u) =>
      (String(u.nombre || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.telefono || "").includes(q))
    );
  }, [users, debouncedQuery]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const openModal = (type, payload = null) => {
    setModalType(type);
    if (type === "add") {
      setAddForm({ nombre: "", email: "", telefono: "", estado: true });
      setSelected(null);
      return;
    }
    setSelected(payload ? { ...payload } : null);
    if (type === "edit" && payload) {
      setEditForm({ nombre: payload.nombre || "", email: payload.email || "", telefono: payload.telefono || "", estado: !!payload.estado });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
  };

  // CRUD local
  const confirmDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setMessage({ type: "success", text: "Usuario eliminado (local)" });
    closeModal();
  };

  const toggleEstado = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, estado: !u.estado } : u)));
    setMessage({ type: "success", text: "Estado modificado (local)" });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveEdit = () => {
    if (!selected) return closeModal();
    setUsers((prev) => prev.map((u) => (u.id === selected.id ? { ...u, ...editForm } : u)));
    setMessage({ type: "success", text: "Usuario actualizado (local)" });
    closeModal();
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveAdd = () => {
    const newId = users.length ? Math.max(...users.map((u) => +u.id)) + 1 : 1;
    const nuevo = { id: newId, nombre: addForm.nombre || `Usuario ${newId}`, email: addForm.email || "", telefono: addForm.telefono || "", estado: typeof addForm.estado === "boolean" ? addForm.estado : true };
    setUsers((prev) => [nuevo, ...prev]);
    setMessage({ type: "success", text: "Usuario creado (local)" });
    closeModal();
  };

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Configuracion / Usuarios</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[80px] mb-[-40px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar usuario:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input className="input pl-[50px]!" type="text" placeholder={'Por ejemplo: "Ana Gómez" o "3001234567"'} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </label>

            <label className="mb-[20px] block">
              <p className="">Filtrar por:</p>
              <div className="relative">
                <Funnel className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <select className="input pl-[50px]!" name="" id="">
                  <option value="">Estado</option>
                  <option value="">Nombre</option>
                  <option value="">rol</option>
                  <option value="">email</option>
                  <option value="">telefono</option>
                </select>
              </div>
            </label>
          </form>

          <div className="">
            <button className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]" onClick={() => openModal("add", null)}>
              <Plus size={20} strokeWidth={1.8} />
              Añadir usuario
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[30%] font-bold! opacity-80">Nombre</p>
            <p className="w-[30%] font-bold! opacity-80">Email</p>
            <p className="w-[20%] font-bold! opacity-80">Teléfono</p>
            <p className="w-[10%] font-bold! opacity-80">Estado</p>
            <p className="w-[10%] font-bold! opacity-80">Acciones</p>
          </article>

          {/* Lista de usuarios */}
          {users.map((u) => (
            <article key={u.id} className="py-[18px] border-b border-black/20 flex items-center">
              <p className="w-[30%] line-clamp-1">{u.nombre}</p>
              <p className="w-[30%] line-clamp-1">{u.email}</p>
              <p className="w-[20%] line-clamp-1">{u.telefono}</p>

              <p className="w-[10%]">
                <span onClick={() => toggleEstado(u.id)} className={`inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-full ${u.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  <span className="w-[8px] h-[8px] block rounded-full" style={{ background: 'currentColor' }}></span>
                  {u.estado ? "Activo" : "Inactivo"}
                </span>
              </p>

              {/* Acciones: Ver, Editar, Eliminar */}
              <div className="w-[10%] flex gap-[10px] items-center">
                <motion.span className="actions w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={() => openModal("details", u)}>
                  <Eye size={22} strokeWidth={1.3} />
                </motion.span>

                <motion.span className="actions w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={() => openModal("edit", u)}>
                  <Pencil size={22} strokeWidth={1.3} />
                </motion.span>

                <motion.span className="actions w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={() => openModal("delete", u)}>
                  <Trash2 size={22} strokeWidth={1.3} />
                </motion.span>
              </div>
            </article>
          ))}
        </div>

        {/* Modales */}
        <AnimatePresence>
          {modalType === "add" && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Agregar usuario</h3>

              <form>
                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Nombre:</p>
                  <input name="nombre" className="input w-full" value={addForm.nombre} onChange={(e) => setAddForm((p) => ({ ...p, nombre: e.target.value }))} placeholder={'Por ejemplo: "Ana Gómez"'} />
                </label>

                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Email:</p>
                  <input name="email" type="email" className="input w-full" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} placeholder={'Por ejemplo: "ana@gomez.com"'} />
                </label>

                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Teléfono:</p>
                  <input name="telefono" className="input w-full" value={addForm.telefono} onChange={(e) => setAddForm((p) => ({ ...p, telefono: e.target.value }))} placeholder={'Por ejemplo: "3001234567"'} />
                </label>

                <label className="flex items-center gap-3 mb-[20px]">
                  <input type="checkbox" name="estado" checked={!!addForm.estado} onChange={(e) => setAddForm((p) => ({ ...p, estado: e.target.checked }))} />
                  <span>Estado (activo)</span>
                </label>

                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button type="button" className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                  <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveAdd}>Guardar</button>
                </div>
              </form>
            </ModalWrapper>
          )}

          {modalType === "details" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Detalles del usuario</h3>

              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <p className="font-medium">Nombre:</p>
                  <p className="font-medium">Email:</p>
                  <p className="font-medium">Teléfono:</p>
                  <p className="font-medium">Estado:</p>
                </div>
                <div>
                  <p className="text-gray-700">{selected.nombre}</p>
                  <p className="text-gray-700">{selected.email}</p>
                  <p className="text-gray-700">{selected.telefono}</p>
                  <p className="text-gray-700">{selected.estado ? "Activo" : "Inactivo"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-[10px] mt-[30px]">
                <button className="btn bg-gray-200" onClick={closeModal}>Cerrar</button>
              </div>
            </ModalWrapper>
          )}

          {modalType === "edit" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Editar usuario</h3>

              <form>
                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Nombre:</p>
                  <input name="nombre" className="input w-full" value={editForm.nombre} onChange={handleEditChange} />
                </label>

                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Email:</p>
                  <input name="email" type="email" className="input w-full" value={editForm.email} onChange={handleEditChange} />
                </label>

                <label className="block mb-[20px]">
                  <p className="translate-x-[25px]">Teléfono:</p>
                  <input name="telefono" className="input w-full" value={editForm.telefono} onChange={handleEditChange} />
                </label>

                <label className="flex items-center gap-3 mb-[20px]">
                  <input type="checkbox" name="estado" checked={!!editForm.estado} onChange={handleEditChange} />
                  <span>Estado (activo)</span>
                </label>

                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button type="button" className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                  <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveEdit}>Guardar</button>
                </div>
              </form>
            </ModalWrapper>
          )}

          {modalType === "delete" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[30px]">Eliminar usuario</h3>
              <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar <span className="font-bold">{selected.nombre}</span>? Esta acción es permanente.</p>
              <div className="flex justify-end gap-[10px] mt-[20px]">
                <button className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id)}>Eliminar</button>
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
    <motion.div className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      {/* overlay clickeable con dim */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Users;
