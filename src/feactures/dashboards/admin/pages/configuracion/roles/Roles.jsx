// src/pages/admin/Roles.jsx
import React, { useEffect, useState } from "react";

import { Eye, Plus, Search, Pencil, Trash2, X, Key, Save, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermisos,
  getPermisosByRol,
  asignarPermisoARol,
  eliminarPermisoDeRol
} from "../../services/RolesService";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permisosTotales, setPermisosTotales] = useState([]);
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editForm, setEditForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [addForm, setAddForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando roles:", err);
      setError("No se pudieron cargar los roles.");
      showNotification("Error al cargar roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermisos = async () => {
    try {
      const data = await getPermisos();
      setPermisosTotales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando permisos:", err);
      showNotification("Error al cargar permisos", "error");
    }
  };

  const fetchPermisosRol = async (idRol) => {
    try {
      const data = await getPermisosByRol(idRol);
      setPermisosAsignados(Array.isArray(data) ? data.map(p => p.id_permiso) : []);
    } catch (err) {
      console.error("Error cargando permisos del rol:", err);
      showNotification("Error al cargar permisos del rol", "error");
      setPermisosAsignados([]);
    }
  };

  const openModal = async (type, item = null) => {
    setModalType(type);
    setSelected(item);
    if (type === "add") {
      setAddForm({ nombre_rol: "", descripcion: "", estado: true });
    } else if (type === "edit" && item) {
      setEditForm({
        nombre_rol: item.nombre_rol || "",
        descripcion: item.descripcion || "",
        estado: !!item.estado,
      });
    } else if (type === "permisos" && item) {
      await fetchPermisosRol(item.id_rol || item.id);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setModalType(null);
    setPermisosAsignados([]);
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const saveAdd = async () => {
    try {
      const payload = {
        nombre_rol: addForm.nombre_rol.trim(),
        descripcion: addForm.descripcion.trim(),
        estado: addForm.estado,
      };
      if (!payload.nombre_rol) {
        showNotification("El nombre del rol es obligatorio", "error");
        return;
      }
      const newRole = await createRole(payload);
      setRoles((prev) => [newRole, ...prev]);
      closeModal();
      showNotification("Rol creado con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al crear el rol", "error");
    }
  };

  const saveEdit = async () => {
    if (!selected) return closeModal();
    try {
      const payload = {
        nombre_rol: editForm.nombre_rol.trim(),
        descripcion: editForm.descripcion.trim(),
        estado: editForm.estado,
      };
      if (!payload.nombre_rol) {
        showNotification("El nombre del rol es obligatorio", "error");
        return;
      }
      await updateRole(selected.id_rol || selected.id, payload);
      setRoles((prev) =>
        prev.map((r) =>
          (r.id_rol || r.id) === (selected.id_rol || selected.id) ? { ...r, ...payload } : r
        )
      );
      closeModal();
      showNotification("Rol actualizado con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al actualizar el rol", "error");
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteRole(selected.id_rol || selected.id);
      setRoles((prev) =>
        prev.filter((r) => (r.id_rol || r.id) !== (selected.id_rol || selected.id))
      );
      closeModal();
      showNotification("Rol eliminado con éxito");
    } catch (err) {
      console.error(err);
      showNotification("Error al eliminar el rol", "error");
    }
  };

  const toggleEstado = async (role) => {
    const newEstado = !role.estado;
    try {
      await updateRole(role.id_rol || role.id, { ...role, estado: newEstado });
      setRoles((prev) =>
        prev.map((r) =>
          (r.id_rol || r.id) === (role.id_rol || role.id) ? { ...r, estado: newEstado } : r
        )
      );
      showNotification(`Rol ${newEstado ? "activado" : "desactivado"} con éxito`);
    } catch (err) {
      console.error(err);
      showNotification("Error al cambiar el estado", "error");
    }
  };

  // === GESTIÓN DE PERMISOS ===
  const togglePermiso = (idPermiso) => {
    setPermisosAsignados(prev =>
      prev.includes(idPermiso)
        ? prev.filter(id => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  const guardarPermisos = async () => {
    if (!selected) return;
    const idRol = selected.id_rol || selected.id;
    try {
      const permisosActuales = await getPermisosByRol(idRol);
      const idsActuales = permisosActuales.map(p => p.id_permiso);

      const nuevos = permisosAsignados.filter(id => !idsActuales.includes(id));
      for (const id of nuevos) {
        await asignarPermisoARol(idRol, id);
      }

      const eliminados = idsActuales.filter(id => !permisosAsignados.includes(id));
      for (const id of eliminados) {
        await eliminarPermisoDeRol(idRol, id);
      }

      showNotification("Permisos actualizados con éxito");
      closeModal();
    } catch (err) {
      console.error("Error al guardar permisos:", err);
      showNotification("Error al actualizar permisos", "error");
    }
  };

  // Filtrado y paginación
  const rolesFiltrados = roles.filter((r) =>
    r.nombre_rol?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(rolesFiltrados.length / itemsPerPage));
  const currentItems = rolesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración / Roles</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                type="text"
                placeholder="Buscar rol (ej: Administrador)"
              />
            </div>
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Añadir Rol
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-1/3">Nombre</th>
                    <th className="px-6 py-3 w-1/2">Descripción</th>
                    <th className="px-6 py-3 w-1/6">Estado</th>
                    <th className="px-6 py-3 w-1/6">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Cargando roles...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">
                        No se encontraron roles.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((role) => (
                      <tr key={role.id_rol || role.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{role.nombre_rol}</td>
                        <td className="px-6 py-4 text-gray-600 line-clamp-2">{role.descripcion || "— Sin descripción —"}</td>
                        <td className="px-6 py-4">
                          <span
                            onClick={() => toggleEstado(role)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition ${role.estado
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${role.estado ? "bg-green-600" : "bg-red-600"
                                }`}
                            ></span>
                            {role.estado ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("details", role)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("edit", role)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("permisos", role)}
                              className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                              title="Gestionar permisos"
                            >
                              <Key size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("delete", role)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {rolesFiltrados.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Notificación Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-blue-600" : "bg-red-600"
                }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {modalType && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">
                  {modalType === "add"
                    ? "Añadir Rol"
                    : modalType === "edit"
                      ? "Editar Rol"
                      : modalType === "details"
                        ? "Detalles del Rol"
                        : modalType === "permisos"
                          ? `Permisos: ${selected?.nombre_rol}`
                          : "Eliminar Rol"}
                </h3>

                {modalType === "add" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        name="nombre_rol"
                        value={addForm.nombre_rol}
                        onChange={handleAddChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Administrador"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={addForm.descripcion}
                        onChange={handleAddChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Breve descripción del rol"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="estado"
                        checked={!!addForm.estado}
                        onChange={handleAddChange}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Activo</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "edit" && selected && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        name="nombre_rol"
                        value={editForm.nombre_rol}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Editor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={editForm.descripcion}
                        onChange={handleEditChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Actualice la descripción"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="estado"
                        checked={!!editForm.estado}
                        onChange={handleEditChange}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Activo</label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "details" && selected && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span>{selected.nombre_rol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descripción:</span>
                      <span className="text-right">{selected.descripcion || "— Sin descripción —"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className={selected.estado ? "text-green-600" : "text-red-600"}>
                        {selected.estado ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}

                {modalType === "delete" && selected && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar el rol{" "}
                      <span className="font-bold text-red-600">{selected.nombre_rol}</span>?
                      <br />
                      <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}

                {modalType === "permisos" && selected && (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <p className="text-gray-600 text-sm">
                      Seleccione los permisos que tendrá este rol:
                    </p>
                    {permisosTotales.length === 0 ? (
                      <p className="text-gray-500 italic">No hay permisos disponibles</p>
                    ) : (
                      permisosTotales.map((permiso) => (
                        <div
                          key={permiso.id_permiso}
                          className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div>
                            <div className="font-medium">{permiso.nombre_permiso}</div>
                            <div className="text-xs text-gray-500">{permiso.descripcion || "Sin descripción"}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={permisosAsignados.includes(permiso.id_permiso)}
                            onChange={() => togglePermiso(permiso.id_permiso)}
                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                        </div>
                      ))
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-1"
                      >
                        <RotateCcw size={16} />
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={guardarPermisos}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-1"
                      >
                        <Save size={16} />
                        Guardar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Roles;