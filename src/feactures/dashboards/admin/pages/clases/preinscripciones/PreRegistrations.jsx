// Preinscripciones.jsx
import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Layout } from "../../../layout/layout";
import * as preinsService from "../../services/preinscripcionesService";
import axios from "axios";



export default function Preinscripciones() {
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // datos auxiliares
  const [usuarios, setUsuarios] = useState([]);
  const [acudientes, setAcudientes] = useState([]);

  // modal control
  const [modalType, setModalType] = useState(null); // null | "add" | "edit" | "delete" | "details"
  const [selected, setSelected] = useState(null);

  // forms
  const emptyForm = {
    id_usuario: "",
    id_acudiente: "",
    nivel_experiencia: "",
    edad: "",
    otra_enfermedad: ""
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
        axios.get("http://localhost:3000/api/usuarios").then(r => r.data).catch(() => []),
        axios.get("http://localhost:3000/api/acudientes").then(r => r.data).catch(() => [])
      ]);

      // preins viene del controller con JOIN, con campos nombre_usuario, ... (según tu controller)
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
    if (type === "add") {
      setAddForm({ ...emptyForm });
    }
    if (type === "edit" && item) {
      setEditForm({
        id_usuario: item.id_usuario ?? "",
        id_acudiente: item.id_acudiente ?? "",
        nivel_experiencia: item.nivel_experiencia ?? "",
        edad: item.edad ?? "",
        otra_enfermedad: item.otra_enfermedad ?? ""
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  /* ---------------- CRUD (via service) ---------------- */
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveAdd = async () => {
    try {
      // id_acudiente puede ser '' -> enviar null
      const payload = {
        ...addForm,
        id_acudiente: addForm.id_acudiente || null
      };
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
      const payload = {
        ...editForm,
        id_acudiente: editForm.id_acudiente || null
      };
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

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const goPage = (n) => setCurrentPage(() => Math.min(Math.max(1, n), totalPages));

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Preinscripciones &gt; Gestión
            </h2>
          </div>

          {/* Barra de búsqueda + botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de usuario..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  // if there's a search, we filter client-side; for simplicity we filter preinscripciones entirely
                  if (!q) {
                    // reload original list
                    loadInitialData();
                    return;
                  }
                  const filtered = preinscripciones.filter(p => (p.nombre_usuario || "").toLowerCase().includes(q));
                  setPreinscripciones(filtered);
                  setCurrentPage(1);
                }}
              />
            </div>

            <button
              onClick={() => openModal("add")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Registrar preinscripción
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Edad</th>
                  <th className="px-6 py-3">Nivel</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">Cargando...</td>
                  </tr>
                ) : preinscripciones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">No hay preinscripciones</td>
                  </tr>
                ) : pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400 italic">No hay resultados en esta página</td>
                  </tr>
                ) : (
                  pageSlice.map((p, idx) => (
                    <tr key={p.id_preinscripcion} className="hover:bg-gray-50 transition border-b">
                      <td className="px-6 py-3">{pageStart + idx + 1}</td>
                      <td className="px-6 py-3">{p.nombre_usuario}</td>
                      <td className="px-6 py-3">{p.edad}</td>
                      <td className="px-6 py-3">{p.nivel_experiencia}</td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => openModal("details", p)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openModal("edit", p)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openModal("delete", p)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="p-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {Math.min(preinscripciones.length, pageSize)} de {preinscripciones.length} resultados
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(1)}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Inicio
              </button>
              <button
                onClick={goPrev}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <span className="px-3 py-1">{currentPage} / {totalPages}</span>

              <button
                onClick={goNext}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
              <button
                onClick={() => goPage(totalPages)}
                className="px-3 py-1 rounded-md border disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Última
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- Modales (todos en este mismo archivo) ---------------- */}

        <ModalWrapper visible={modalType !== null} onClose={closeModal}>
          {/* Agregar */}
          {modalType === "add" && (
            <div className="max-w-[720px] w-full">
              <h3 className="text-2xl font-semibold text-center mb-4">Agregar Preinscripción</h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Usuario asociado</label>
                  <p className="text-xs text-gray-400 mb-1">Selecciona el usuario que realiza la preinscripción</p>
                  <select
                    name="id_usuario"
                    value={addForm.id_usuario}
                    onChange={handleAddChange}
                    className="input w-full"
                  >
                    <option value="">-- Seleccionar usuario --</option>
                    {usuarios.map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Acudiente (opcional)</label>
                  <p className="text-xs text-gray-400 mb-1">Si aplica, selecciona el acudiente</p>
                  <select
                    name="id_acudiente"
                    value={addForm.id_acudiente}
                    onChange={handleAddChange}
                    className="input w-full"
                  >
                    <option value="">-- Ninguno --</option>
                    {acudientes.map(a => (
                      <option key={a.id_acudiente} value={a.id_acudiente}>
                        {a.nombre_completo} ({a.parentesco})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Nivel de experiencia</label>
                  <p className="text-xs text-gray-400 mb-1">Ej: Principiante, Intermedio, Avanzado</p>
                  <input
                    name="nivel_experiencia"
                    value={addForm.nivel_experiencia}
                    onChange={handleAddChange}
                    className="input w-full"
                    placeholder="Ej: Principiante"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Edad</label>
                    <p className="text-xs text-gray-400 mb-1">Edad del estudiante</p>
                    <input
                      type="number"
                      name="edad"
                      value={addForm.edad}
                      onChange={handleAddChange}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Otra enfermedad (opcional)</label>
                    <p className="text-xs text-gray-400 mb-1">Describe alergias o condiciones relevantes</p>
                    <input
                      name="otra_enfermedad"
                      value={addForm.otra_enfermedad}
                      onChange={handleAddChange}
                      className="input w-full"
                      placeholder="Ej: Asma"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="px-6 py-2 rounded-full bg-gray-200" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="button" className="px-6 py-2 rounded-full bg-blue-600 text-white" onClick={saveAdd}>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Editar */}
          {modalType === "edit" && selected && (
            <div className="max-w-[720px] w-full">
              <h3 className="text-2xl font-semibold text-center mb-4">Editar Preinscripción</h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Usuario asociado</label>
                  <p className="text-xs text-gray-400 mb-1">Usuario (no editable si quieres mantener)</p>
                  <select
                    name="id_usuario"
                    value={editForm.id_usuario}
                    onChange={handleEditChange}
                    className="input w-full"
                  >
                    <option value="">-- Seleccionar usuario --</option>
                    {usuarios.map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Acudiente (opcional)</label>
                  <p className="text-xs text-gray-400 mb-1">Selecciona si aplica</p>
                  <select
                    name="id_acudiente"
                    value={editForm.id_acudiente}
                    onChange={handleEditChange}
                    className="input w-full"
                  >
                    <option value="">-- Ninguno --</option>
                    {acudientes.map(a => (
                      <option key={a.id_acudiente} value={a.id_acudiente}>
                        {a.nombre_completo} ({a.parentesco})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Nivel de experiencia</label>
                  <p className="text-xs text-gray-400 mb-1">Ej: Principiante, Intermedio, Avanzado</p>
                  <input
                    name="nivel_experiencia"
                    value={editForm.nivel_experiencia}
                    onChange={handleEditChange}
                    className="input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Edad</label>
                    <p className="text-xs text-gray-400 mb-1">Edad del estudiante</p>
                    <input
                      type="number"
                      name="edad"
                      value={editForm.edad}
                      onChange={handleEditChange}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Otra enfermedad (opcional)</label>
                    <p className="text-xs text-gray-400 mb-1">Describe alergias o condiciones relevantes</p>
                    <input
                      name="otra_enfermedad"
                      value={editForm.otra_enfermedad}
                      onChange={handleEditChange}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="px-6 py-2 rounded-full bg-gray-200" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="button" className="px-6 py-2 rounded-full bg-blue-600 text-white" onClick={saveEdit}>
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Eliminar */}
          {modalType === "delete" && selected && (
            <div className="max-w-[620px] w-full">
              <h3 className="text-2xl font-semibold text-center mb-2">Eliminar preinscripción</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                ¿Estás seguro que deseas eliminar la preinscripción de <strong>{selected.nombre_usuario}</strong>? Esta acción es permanente.
              </p>

              <div className="flex justify-end gap-3">
                <button className="px-6 py-2 rounded-full bg-gray-200" onClick={closeModal}>Cancelar</button>
                <button className="px-6 py-2 rounded-full bg-red-100 text-red-700" onClick={confirmDelete}>Eliminar</button>
              </div>
            </div>
          )}

          {/* Detalles */}
          {modalType === "details" && selected && (
            <div className="max-w-[760px] w-full">
              <h3 className="text-2xl font-semibold text-center mb-4">Detalles Preinscripción</h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Usuario card (estético, similar al form) */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-blue-600 font-medium mb-2">Información del usuario</h4>
                  <p className="text-sm"><strong>Nombre:</strong> {selected.nombre_usuario}</p>
                  <p className="text-sm"><strong>Documento:</strong> {selected.tipo_documento} {selected.documento}</p>
                  <p className="text-sm"><strong>Email:</strong> {selected.email_usuario}</p>
                  <p className="text-sm"><strong>Teléfono:</strong> {selected.telefono_usuario}</p>
                  <p className="text-sm"><strong>Dirección:</strong> {selected.direccion_usuario || "-"}</p>
                  <p className="text-sm"><strong>Fecha de nacimiento:</strong> {selected.fecha_nacimiento || "-"}</p>
                </div>

                {/* Preinscripción card */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-blue-600 font-medium mb-2">Datos de la preinscripción</h4>
                  <p className="text-sm"><strong>Nivel de experiencia:</strong> {selected.nivel_experiencia}</p>
                  <p className="text-sm"><strong>Edad:</strong> {selected.edad}</p>
                  <p className="text-sm"><strong>Otra enfermedad:</strong> {selected.otra_enfermedad || "N/A"}</p>
                </div>

                {/* Acudiente (si hay) */}
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
                <button className="px-6 py-2 rounded-full bg-blue-600 text-white" onClick={closeModal}>Cerrar</button>
              </div>
            </div>
          )}
        </ModalWrapper>
      </div>
    </Layout>
  );
}

/* ---------------- Modal wrapper (overlay difuminado, no negro) ---------------- */
const ModalWrapper = ({ children, visible, onClose }) => {
  // visible prop: if undefined we assume visible true when children exist
  const show = visible === undefined ? !!children : visible;
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay: ligero, con blur (no negro) */}
      <div
        className="absolute inset-0 bg-white/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
