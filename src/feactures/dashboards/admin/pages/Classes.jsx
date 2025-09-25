import React, { useEffect, useState } from "react";
import Layout from "../layout/layout";
import { getClases, createClase, updateClase, deleteClase } from "../../services/ClassService";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {  AnimatePresence } from "framer-motion";

export default function Clases() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [addForm, setAddForm] = useState({
    id_nivel: "",
    id_sede: "",
    id_usuario: "",
    cupo_maximo: "",
    dia_semana: "",
    descripcion: "",
    estado: true,
    hora_inicio: "",
    hora_fin: "",
  });

  const [editForm, setEditForm] = useState({ ...addForm });

  // cargar clases
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

  /* ---------- CRUD ---------- */
  const saveAdd = async () => {
    try {
      const res = await createClase(addForm);
      setClases((prev) => [res.data, ...prev]);
      closeModal();
    } catch (err) {
      console.error("Error creando clase:", err);
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      await updateClase(selected.id, editForm);
      setClases((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...c, ...editForm } : c))
      );
      closeModal();
    } catch (err) {
      console.error("Error actualizando clase:", err);
    }
  };

  const confirmDelete = async (id) => {
    try {
      await deleteClase(id);
      setClases((prev) => prev.filter((c) => c.id !== id));
      closeModal();
    } catch (err) {
      console.error("Error eliminando clase:", err);
    }
  };

  /* ---------- Modal helpers ---------- */
  const openModal = (type, item) => {
    setModalType(type);
    if (type === "add") {
      setAddForm({
        id_nivel: "",
        id_sede: "",
        id_usuario: "",
        cupo_maximo: "",
        dia_semana: "",
        descripcion: "",
        estado: true,
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

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">eventos &gt; Clases</h2>
          </div>

          {/* Barra búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar clases..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2"
              onClick={() => openModal("add")}
            >
              <Plus className="h-4 w-4" />
              Registrar nueva clase
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nivel</th>
                  <th className="px-6 py-3">Sede</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Cupo</th>
                  <th className="px-6 py-3">Día</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Horario</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="10" className="text-center py-10">Cargando...</td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-red-500">{error}</td>
                  </tr>
                )}
                {!loading && !error && clases.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-gray-400 italic">
                      No hay clases registradas
                    </td>
                  </tr>
                )}
                {clases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-2">{c.id}</td>
                    <td className="px-6 py-2">{c.id_nivel}</td>
                    <td className="px-6 py-2">{c.id_sede}</td>
                    <td className="px-6 py-2">{c.id_usuario}</td>
                    <td className="px-6 py-2">{c.cupo_maximo}</td>
                    <td className="px-6 py-2">{c.dia_semana}</td>
                    <td className="px-6 py-2">{c.descripcion}</td>
                    <td className="px-6 py-2">{c.estado ? "Activo" : "Inactivo"}</td>
                    <td className="px-6 py-2">{c.hora_inicio} - {c.hora_fin}</td>
                    <td className="px-6 py-2 flex gap-2 justify-center">
                      <button onClick={() => openModal("edit", c)} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => openModal("delete", c)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                      <button onClick={() => openModal("details", c)} className="text-green-600 hover:text-green-800">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {modalType === "add" && (
          <ModalWrapper onClose={closeModal}>
            <h3 className="font-bold mb-4">Nueva Clase</h3>
            <form>
              <input name="descripcion" value={addForm.descripcion} onChange={(e) => handleChange(e, setAddForm)} className="input w-full mb-4" placeholder="Descripción" />
              <button type="button" className="btn bg-blue-500 text-white" onClick={saveAdd}>
                Guardar
              </button>
            </form>
          </ModalWrapper>
        )}

        {modalType === "edit" && selected && (
          <ModalWrapper onClose={closeModal}>
            <h3 className="font-bold mb-4">Editar Clase</h3>
            <form>
              <input name="descripcion" value={editForm.descripcion} onChange={(e) => handleChange(e, setEditForm)} className="input w-full mb-4" />
              <button type="button" className="btn bg-blue-500 text-white" onClick={saveEdit}>
                Guardar
              </button>
            </form>
          </ModalWrapper>
        )}

        {modalType === "delete" && selected && (
          <ModalWrapper onClose={closeModal}>
            <h3 className="font-bold mb-4">Eliminar Clase</h3>
            <p>¿Seguro que deseas eliminar <b>{selected.descripcion}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
              <button className="btn bg-red-500 text-white" onClick={() => confirmDelete(selected.id)}>Eliminar</button>
            </div>
          </ModalWrapper>
        )}

        {modalType === "details" && selected && (
          <ModalWrapper onClose={closeModal}>
            <h3 className="font-bold mb-4">Detalles Clase</h3>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(selected, null, 2)}</pre>
            <button className="btn bg-gray-200 mt-4" onClick={closeModal}>Cerrar</button>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* === Modal Wrapper === */
const ModalWrapper = ({ children, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-lg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      {children}
    </motion.div>
    <div className="absolute inset-0" onClick={onClose}></div>
  </motion.div>
);
