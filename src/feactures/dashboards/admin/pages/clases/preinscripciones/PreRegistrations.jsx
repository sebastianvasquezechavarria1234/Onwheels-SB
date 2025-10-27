// Preinscripciones.jsx
import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Layout } from "../../../layout/layout";
import * as preinsService from "../../services/preinscripcionesService";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";


export default function Preinscripciones() {
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [acudientes, setAcudientes] = useState([]);

  const [modalType, setModalType] = useState(null); // null | "add" | "edit" | "delete" | "details"
  const [selected, setSelected] = useState(null);

  const emptyForm = {
    id_usuario: "",
    id_acudiente: "",
    nivel_experiencia: "",
    edad: "",
    otra_enfermedad: "",
  };
  const [addForm, setAddForm] = useState({ ...emptyForm });
  const [editForm, setEditForm] = useState({ ...emptyForm });

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(preinscripciones.length / pageSize));

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [preins, usersRes, acudientesRes] = await Promise.all([
        preinsService.getPreinscripciones(),
        axios.get("http://localhost:3000/api/usuarios").then((r) => r.data).catch(() => []),
        axios.get("http://localhost:3000/api/acudientes").then((r) => r.data).catch(() => []),
      ]);

      setPreinscripciones(Array.isArray(preins) ? preins : []);
      setUsuarios(Array.isArray(usersRes) ? usersRes : []);
      setAcudientes(Array.isArray(acudientesRes) ? acudientesRes : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error cargando preinscripciones:", err);
      setError("Error cargando datos. Revisa la API.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Modales helpers ---------------- */
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if (type === "add") setAddForm({ ...emptyForm });
    if (type === "edit" && item)
      setEditForm({
        id_usuario: item.id_usuario ?? "",
        id_acudiente: item.id_acudiente ?? "",
        nivel_experiencia: item.nivel_experiencia ?? "",
        edad: item.edad ?? "",
        otra_enfermedad: item.otra_enfermedad ?? "",
      });
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  /* ---------------- CRUD ---------------- */
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdd = async () => {
    try {
      const payload = { ...addForm, id_acudiente: addForm.id_acudiente || null };
      await preinsService.createPreinscripcion(payload);
      await loadInitialData();
      closeModal();
    } catch (err) {
      console.error("Error creando preinscripción:", err);
      alert("Error creando preinscripción (ver consola).");
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    try {
      const payload = { ...editForm, id_acudiente: editForm.id_acudiente || null };
      await preinsService.updatePreinscripcion(selected.id_preinscripcion, payload);
      await loadInitialData();
      closeModal();
    } catch (err) {
      console.error("Error actualizando preinscripción:", err);
      alert("Error actualizando (ver consola).");
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await preinsService.deletePreinscripcion(selected.id_preinscripcion);
      await loadInitialData();
      closeModal();
    } catch (err) {
      console.error("Error eliminando preinscripción:", err);
      alert("Error eliminando (ver consola).");
    }
  };

  /* ---------------- Pagination helpers ---------------- */
  const pageStart = (currentPage - 1) * pageSize;
  const pageSlice = preinscripciones.slice(pageStart, pageStart + pageSize);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goPage = (n) => setCurrentPage(() => Math.min(Math.max(1, n), totalPages));

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Preinscripciones &gt; Gestión</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar preinscripciones:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez — busca por nombre de usuario"
                  className="input pl-[50px]!"
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    if (!q) {
                      loadInitialData();
                      return;
                    }
                    const filtered = preinscripciones.filter((p) =>
                      (p.nombre_usuario || "").toLowerCase().includes(q)
                    );
                    setPreinscripciones(filtered);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </label>
          </form>

          <div>
            <button onClick={() => openModal("add")} className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]">
              <Plus className="h-4 w-4" />
              Registrar preinscripción
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles */}
          <article className="font-semibold italic mt-[10px] flex items-center border-b border-black/20 pb-[12px]">
            <p className="w-[8%] font-bold! opacity-80">#</p>
            <p className="w-[40%] font-bold! opacity-80">Usuario</p>
            <p className="w-[12%] font-bold! opacity-80">Edad</p>
            <p className="w-[20%] font-bold! opacity-80">Nivel</p>
            <p className="w-[20%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="">
                <tr><th className="hidden" /></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">Cargando...</td>
                  </tr>
                ) : preinscripciones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 italic text-red-700">No hay preinscripciones</td>
                  </tr>
                ) : pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 italic text-red-700">No hay resultados en esta página</td>
                  </tr>
                ) : (
                  pageSlice.map((p, idx) => (
                    <tr key={p.id_preinscripcion} className="py-[18px] border-b border-black/20 flex items-center">
                      <td className="px-6 py-[18px] w-[8%]">{pageStart + idx + 1}</td>
                      <td className="px-6 py-[18px] w-[40%] line-clamp-1">{p.nombre_usuario}</td>
                      <td className="px-6 py-[18px] w-[12%]">{p.edad}</td>
                      <td className="px-6 py-[18px] w-[20%]">{p.nivel_experiencia}</td>

                      <td className="px-6 py-[18px] w-[20%] flex gap-[10px] items-center justify-center">
                        <motion.span
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => openModal("details", p)}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.span>

                        <motion.span
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => openModal("edit", p)}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.span>

                        <motion.span
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onClick={() => openModal("delete", p)}
                          className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación - estilo consistente */}
          <div className="flex justify-center items-center gap-2 py-4 italic">
            <button disabled={currentPage === 1} onClick={() => goPage(1)} className="btn cursor-pointer bg-gray-200">Inicio</button>
            <button disabled={currentPage === 1} onClick={goPrev} className="btn cursor-pointer bg-gray-200">Anterior</button>
            <span className="text-[18px]">Página <span className="text-blue-700">{currentPage}</span> de {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={goNext} className="btn cursor-pointer bg-gray-200">Siguiente</button>
            <button disabled={currentPage === totalPages} onClick={() => goPage(totalPages)} className="btn cursor-pointer bg-gray-200">Última</button>
          </div>
        </div>

        {/* ---------------- Modales (usa ModalWrapper para mantener el mismo patrón que Roles) ---------------- */}
        <AnimatePresence>
          {/* ADD */}
          {modalType === "add" && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[16px] text-xl font-semibold">Agregar Preinscripción</h3>

              <form className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">Usuario asociado</p>
                  <select name="id_usuario" value={addForm.id_usuario} onChange={handleAddChange} className="input w-full">
                    <option value="">-- Seleccionar usuario (Ej: Juan Pérez) --</option>
                    {usuarios.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} ({u.email})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block col-span-1">
                  <p className="">Acudiente (opcional)</p>
                  <select name="id_acudiente" value={addForm.id_acudiente} onChange={handleAddChange} className="input w-full">
                    <option value="">-- Ninguno --</option>
                    {acudientes.map((a) => (
                      <option key={a.id_acudiente} value={a.id_acudiente}>
                        {a.nombre_completo} ({a.parentesco})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block col-span-1">
                  <p className="">Nivel de experiencia</p>
                  <input name="nivel_experiencia" value={addForm.nivel_experiencia} onChange={handleAddChange} className="input w-full" placeholder="Ej: Principiante (ej: street / bowl)" />
                </label>

                <label className="block col-span-1">
                  <p className="">Edad</p>
                  <input type="number" name="edad" value={addForm.edad} onChange={handleAddChange} className="input w-full" placeholder="Ej: 14" />
                </label>

                <label className="block col-span-1">
                  <p className="">Otra enfermedad (opcional)</p>
                  <input name="otra_enfermedad" value={addForm.otra_enfermedad} onChange={handleAddChange} className="input w-full" placeholder="Ej: Asma" />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button type="button" className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                  <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveAdd}>Guardar</button>
                </div>
              </form>
            </ModalWrapper>
          )}

          {/* EDIT */}
          {modalType === "edit" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[16px] text-xl font-semibold">Editar Preinscripción</h3>

              <form className="grid grid-cols-2 gap-[16px]">
                <label className="block col-span-1">
                  <p className="">Usuario asociado</p>
                  <select name="id_usuario" value={editForm.id_usuario} onChange={handleEditChange} className="input w-full">
                    <option value="">-- Seleccionar usuario --</option>
                    {usuarios.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} ({u.email})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block col-span-1">
                  <p className="">Acudiente (opcional)</p>
                  <select name="id_acudiente" value={editForm.id_acudiente} onChange={handleEditChange} className="input w-full">
                    <option value="">-- Ninguno --</option>
                    {acudientes.map((a) => (
                      <option key={a.id_acudiente} value={a.id_acudiente}>
                        {a.nombre_completo} ({a.parentesco})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block col-span-1">
                  <p className="">Nivel de experiencia</p>
                  <input name="nivel_experiencia" value={editForm.nivel_experiencia} onChange={handleEditChange} className="input w-full" placeholder="Ej: Intermedio" />
                </label>

                <label className="block col-span-1">
                  <p className="">Edad</p>
                  <input type="number" name="edad" value={editForm.edad} onChange={handleEditChange} className="input w-full" placeholder="Ej: 16" />
                </label>

                <label className="block col-span-1">
                  <p className="">Otra enfermedad (opcional)</p>
                  <input name="otra_enfermedad" value={editForm.otra_enfermedad} onChange={handleEditChange} className="input w-full" placeholder="Ej: Alergia al látex" />
                </label>

                <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                  <button type="button" className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                  <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveEdit}>Guardar cambios</button>
                </div>
              </form>
            </ModalWrapper>
          )}

          {/* DELETE */}
          {modalType === "delete" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[8px] text-lg font-semibold">Eliminar preinscripción</h3>
              <p className="text-gray-600 mb-4 text-center">
                ¿Estás seguro que deseas eliminar la preinscripción de <strong>{selected.nombre_usuario}</strong>? Esta acción es permanente.
              </p>
              <div className="flex justify-end gap-[10px] mt-[6px]">
                <button className="btn bg-gray-200" onClick={closeModal}>Cancelar</button>
                <button className="btn bg-red-100 text-red-700" onClick={confirmDelete}>Eliminar</button>
              </div>
            </ModalWrapper>
          )}

          {/* DETAILS */}
          {modalType === "details" && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[12px] text-xl font-semibold">Detalles Preinscripción</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-blue-600 font-medium mb-2">Información del usuario</h4>
                  <p className="text-sm"><strong>Nombre:</strong> {selected.nombre_usuario}</p>
                  <p className="text-sm"><strong>Documento:</strong> {selected.tipo_documento} {selected.documento}</p>
                  <p className="text-sm"><strong>Email:</strong> {selected.email_usuario}</p>
                  <p className="text-sm"><strong>Teléfono:</strong> {selected.telefono_usuario}</p>
                  <p className="text-sm"><strong>Dirección:</strong> {selected.direccion_usuario || "-"}</p>
                  <p className="text-sm"><strong>Fecha de nacimiento:</strong> {selected.fecha_nacimiento || "-"}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-blue-600 font-medium mb-2">Datos de la preinscripción</h4>
                  <p className="text-sm"><strong>Nivel de experiencia:</strong> {selected.nivel_experiencia}</p>
                  <p className="text-sm"><strong>Edad:</strong> {selected.edad}</p>
                  <p className="text-sm"><strong>Otra enfermedad:</strong> {selected.otra_enfermedad || "N/A"}</p>
                </div>

                <div className="col-span-2 bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-blue-600 font-medium mb-2">Acudiente</h4>
                  {selected.id_acudiente ? (
                    <>
                      <p className="text-sm"><strong>Nombre:</strong> {selected.nombre_acudiente}</p>
                      <p className="text-sm"><strong>Email:</strong> {selected.email_acudiente || "-"}</p>
                      <p className="text-sm"><strong>Teléfono (principal):</strong> {selected.telefono_principal || "-"}</p>
                      <p className="text-sm"><strong>Teléfono (secundario):</strong> {selected.telefono_secundario || "-"}</p>
                      <p className="text-sm"><strong>Dirección:</strong> {selected.direccion_acudiente || "-"}</p>
                      <p className="text-sm"><strong>Parentesco:</strong> {selected.parentesco || "-"}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No hay acudiente registrado para esta preinscripción.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="btn bg-gray-200" onClick={closeModal}>Cerrar</button>
              </div>
            </ModalWrapper>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}

/* === ModalWrapper: same visual pattern as Roles (motion + overlay) === */
const ModalWrapper = ({ children, onClose }) => {
  return (
    <motion.div
      className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[760px] max-h-[85vh] overflow-auto"
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
