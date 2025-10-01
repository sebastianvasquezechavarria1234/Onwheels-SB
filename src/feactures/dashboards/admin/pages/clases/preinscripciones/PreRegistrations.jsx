import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

 // ajusta
import { Layout } from "../../../layout/layout";
import { createPreinscripcion, getPreinscripciones, updatePreinscripcion,deletePreinscripcion } from "../../../services/preinscripcionesService";

export default function Preinscripciones() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    id_usuario: "",
    id_acudiente: "",
    nivel_experiencia: "",
    edad: "",
    otra_enfermedad: ""
  });

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getPreinscripciones();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if (type === "add") setForm({ id_usuario: "", id_acudiente: "", nivel_experiencia: "", edad: "", otra_enfermedad: "" });
    if (type === "edit" && item) setForm({ id_usuario: item.id_usuario, id_acudiente: item.id_acudiente, nivel_experiencia: item.nivel_experiencia, edad: item.edad, otra_enfermedad: item.otra_enfermedad });
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      await createPreinscripcion(form);
      await fetchItems();
      closeModal();
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
    try {
      await updatePreinscripcion(selected.id_preinscripcion, form);
      await fetchItems();
      closeModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta preinscripción?")) return;
    try {
      await deletePreinscripcion(id);
      await fetchItems();
      // adjust page if empty
      const newTotal = items.length - 1;
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      closeModal();
    } catch (err) { console.error(err); }
  };

  // pagination controls
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visible = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Preinscripciones &gt; Gestión</h2>
          </div>

          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input type="text" placeholder="Buscar preinscripciones..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button onClick={() => openModal("add")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all">
              <Plus className="h-4 w-4" /> Registrar preinscripción
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Acudiente</th>
                  <th className="px-6 py-3">Nivel</th>
                  <th className="px-6 py-3">Edad</th>
                  <th className="px-6 py-3">Otra enfermedad</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-10 text-gray-400 italic">Cargando...</td></tr>
                ) : visible.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-gray-400 italic">No hay preinscripciones</td></tr>
                ) : (
                  visible.map(p => (
                    <tr key={p.id_preinscripcion} className="hover:bg-gray-50 transition border-b">
                      <td className="px-6 py-3">{p.id_preinscripcion}</td>
                      <td className="px-6 py-3">{p.id_usuario}</td>
                      <td className="px-6 py-3">{p.id_acudiente || "-"}</td>
                      <td className="px-6 py-3">{p.nivel_experiencia}</td>
                      <td className="px-6 py-3">{p.edad}</td>
                      <td className="px-6 py-3">{p.otra_enfermedad || "-"}</td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button onClick={() => openModal("details", p)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openModal("edit", p)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id_preinscripcion)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination controls */}
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-600">Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} de {total}</div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">Anterior</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalType && (
          <ModalWrapper onClose={closeModal}>
            {modalType === "add" && (
              <>
                <h3 className="text-center text-xl font-semibold mb-4">Registrar preinscripción</h3>
                <form>
                  <label className="block mb-3"><p className="text-sm text-gray-500">ID Usuario</p><input name="id_usuario" value={form.id_usuario} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">ID Acudiente (opcional)</p><input name="id_acudiente" value={form.id_acudiente} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">Nivel de experiencia</p><input name="nivel_experiencia" value={form.nivel_experiencia} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">Edad</p><input type="number" name="edad" value={form.edad} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">Otra enfermedad / observaciones</p><textarea name="otra_enfermedad" value={form.otra_enfermedad} onChange={handleChange} className="input w-full h-24" /></label>
                  <div className="flex justify-end gap-3 mt-4"><button onClick={closeModal} type="button" className="px-6 py-2 rounded-full bg-gray-200">Cancelar</button><button onClick={handleCreate} type="button" className="px-6 py-2 rounded-full bg-blue-600 text-white">Guardar</button></div>
                </form>
              </>
            )}

            {modalType === "edit" && selected && (
              <>
                <h3 className="text-center text-xl font-semibold mb-4">Editar preinscripción</h3>
                <form>
                  <label className="block mb-3"><p className="text-sm text-gray-500">ID Usuario</p><input name="id_usuario" value={form.id_usuario} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">ID Acudiente (opcional)</p><input name="id_acudiente" value={form.id_acudiente} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">Nivel de experiencia</p><input name="nivel_experiencia" value={form.nivel_experiencia} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">Edad</p><input type="number" name="edad" value={form.edad} onChange={handleChange} className="input w-full" /></label>
                  <label className="block mb-3"><p className="text-sm text-gray-500">Otra enfermedad / observaciones</p><textarea name="otra_enfermedad" value={form.otra_enfermedad} onChange={handleChange} className="input w-full h-24" /></label>
                  <div className="flex justify-end gap-3 mt-4"><button onClick={closeModal} type="button" className="px-6 py-2 rounded-full bg-gray-200">Cancelar</button><button onClick={handleUpdate} type="button" className="px-6 py-2 rounded-full bg-blue-600 text-white">Guardar</button></div>
                </form>
              </>
            )}

            {modalType === "details" && selected && (
              <>
                <h3 className="text-center text-xl font-semibold mb-4">Detalles</h3>
                <pre className="bg-gray-50 p-4 rounded">{JSON.stringify(selected, null, 2)}</pre>
                <div className="flex justify-end gap-3 mt-4"><button onClick={closeModal} className="px-6 py-2 rounded-full bg-gray-200">Cerrar</button></div>
              </>
            )}
          </ModalWrapper>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* Modal wrapper */
const ModalWrapper = ({ children, onClose }) => (
  <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose}></div>
    <motion.div className="relative z-10 bg-white p-8 rounded-2xl w-[90%] max-w-2xl shadow-lg" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
      {children}
    </motion.div>
  </motion.div>
);
