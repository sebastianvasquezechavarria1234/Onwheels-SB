// src/pages/usuarios/Usuarios.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Eye, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../../services/usuariosServices";
import { getRoles } from "../../services/RolesService";
import { canManage } from "../../../../../../utils/permissions";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formData, setFormData] = useState({
    // Campos base (USUARIOS)
    documento: "",
    tipo_documento: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    contrasena: "",
    id_rol: "",

    // Campos adicionales (solo si aplica)
    años_experiencia: "",
    estado_estudiante: true,
    estado_instructor: true,
  });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notificación
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cargar usuarios y roles
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dataUsuarios, dataRoles] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(Array.isArray(dataUsuarios) ? dataUsuarios : []);
      setRoles(Array.isArray(dataRoles) ? dataRoles : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos. Verifica la conexión con el backend.");
      showNotification("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Función corregida: recibe un array de roles y devuelve los nombres
  const getRolNombres = (rolesArr) => {
    if (!rolesArr || rolesArr.length === 0) return "Sin rol";
    return rolesArr.map((r) => r.nombre_rol).join(", ");
  };

  const isEstudiante = (idRol) => {
    const rol = roles.find((r) => r.id_rol === idRol);
    return rol?.nombre_rol?.toLowerCase().includes("estudiante");
  };

  const isInstructor = (idRol) => {
    const rol = roles.find((r) => r.id_rol === idRol);
    return rol?.nombre_rol?.toLowerCase().includes("instructor");
  };

  const handleCreate = async () => {
    try {
      // validaciones mínimas
      if (!formData.nombre_completo.trim() || !formData.email.trim() || !formData.contrasena.trim()) {
        showNotification("Nombre completo, email y contraseña son obligatorios", "error");
        return;
      }

      const payload = {
        documento: formData.documento || null,
        tipo_documento: formData.tipo_documento || null,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        contrasena: formData.contrasena,
        id_rol: formData.id_rol ? Number(formData.id_rol) : null,
      };

      await createUsuario(payload);
      await fetchData();
      closeModal();
      showNotification("Usuario creado con éxito");
    } catch (err) {
      console.error("Error creando usuario:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando usuario";
      showNotification(errorMessage, "error");
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedUsuario) return;

      // Validación básica
      if (!formData.nombre_completo.trim() || !formData.email.trim()) {
        showNotification("Nombre completo y email son obligatorios", "error");
        return;
      }

      const payload = {
        documento: formData.documento || null,
        tipo_documento: formData.tipo_documento || null,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        // Solo incluir contraseña si se proporciona
        ...(formData.contrasena ? { contrasena: formData.contrasena } : {}),
        id_rol: formData.id_rol ? Number(formData.id_rol) : null,
      };

      await updateUsuario(selectedUsuario.id_usuario, payload);
      await fetchData();
      closeModal();
      showNotification("Usuario actualizado con éxito");
    } catch (err) {
      console.error("Error editando usuario:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando usuario";
      showNotification(errorMessage, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedUsuario) return;
      await deleteUsuario(selectedUsuario.id_usuario);
      await fetchData();
      closeModal();
      showNotification("Usuario eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      const errorMessage = err.response?.data?.mensaje || "Error eliminando usuario";
      showNotification(errorMessage, "error");
    }
  };

  const openModal = (type, usuario = null) => {
    setModal(type);
    setSelectedUsuario(usuario);

    if (usuario && type === "editar") {
      setFormData({
        documento: usuario.documento ?? "",
        tipo_documento: usuario.tipo_documento ?? "",
        nombre_completo: usuario.nombre_completo ?? "",
        email: usuario.email ?? "",
        telefono: usuario.telefono ?? "",
        fecha_nacimiento: usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split("T")[0] : "",
        contrasena: "", // No prellenar contraseña al editar
        id_rol: usuario.roles && usuario.roles.length > 0 ? String(usuario.roles[0].id_rol) : "",
      });
    } else if (!usuario) {
      setFormData({
        documento: "",
        tipo_documento: "",
        nombre_completo: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
        contrasena: "",
        id_rol: "",
        años_experiencia: "",
        estado_estudiante: true,
        estado_instructor: true,
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUsuario(null);
    setFormData({
      documento: "",
      tipo_documento: "",
      nombre_completo: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      contrasena: "",
      id_rol: "",
    });
  };

  // Filtrado por búsqueda
  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    String(u.documento || "").includes(search)
  );

  // Paginación derivada
  const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / itemsPerPage));
  const currentItems = usuariosFiltrados.slice(
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuarios\Registro de Usuarios</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar usuarios (Documento, Nombre o email)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            {canManage("usuarios") && (
              <button
                onClick={() => openModal("crear")}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
              >
                <Plus size={18} />
                Registrar Nuevo Usuario
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[10%]">ID</th>
                    <th className="px-6 py-3 w-[30%]">Nombre Completo</th>
                    <th className="px-6 py-3 w-[20%]">Email</th>
                    <th className="px-6 py-3 w-[15%]">Teléfono</th>
                    <th className="px-6 py-3 w-[15%]">Rol</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((u) => (
                      <tr key={u.id_usuario} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{u.id_usuario}</td>
                        <td className="px-6 py-4 text-gray-600">{u.nombre_completo}</td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 text-gray-600">{u.telefono || "— No especificado —"}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {getRolNombres(u.roles)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("ver", u)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            {canManage("usuarios") && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openModal("editar", u)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="Editar"
                                >
                                  <Pencil size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openModal("eliminar", u)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {usuariosFiltrados.length > 0 && (
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
          {modal && (
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
                  {modal === "crear"
                    ? "Registrar Usuario"
                    : modal === "editar"
                      ? "Editar Usuario"
                      : modal === "ver"
                        ? "Detalles del Usuario"
                        : "Eliminar Usuario"}
                </h3>

                {modal === "crear" && (
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                        <input
                          type="text"
                          name="documento"
                          value={formData.documento}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: 900123456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                        <input
                          type="text"
                          name="tipo_documento"
                          value={formData.tipo_documento}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: CC, CE"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: correo@dominio.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: +57 300 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
                        <input
                          type="date"
                          name="fecha_nacimiento"
                          value={formData.fecha_nacimiento}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="******"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rol (opcional)</label>
                      <select
                        name="id_rol"
                        value={formData.id_rol}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Sin asignar</option>
                        {roles.map((r) => (
                          <option key={r.id_rol} value={r.id_rol}>
                            {r.nombre_rol}
                          </option>
                        ))}
                      </select>
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
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {modal === "editar" && selectedUsuario && (
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                        <input
                          type="text"
                          name="documento"
                          value={formData.documento}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: 900123456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Documento</label>
                        <input
                          type="text"
                          name="tipo_documento"
                          value={formData.tipo_documento}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: CC, CE"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: correo@dominio.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                          type="text"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Ej: +57 300 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
                        <input
                          type="date"
                          name="fecha_nacimiento"
                          value={formData.fecha_nacimiento}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña (opcional)
                      </label>
                      <input
                        type="password"
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Dejar en blanco para no cambiar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rol (opcional)</label>
                      <select
                        name="id_rol"
                        value={formData.id_rol}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Sin asignar</option>
                        {roles.map((r) => (
                          <option key={r.id_rol} value={r.id_rol}>
                            {r.nombre_rol}
                          </option>
                        ))}
                      </select>
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
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                )}

                {modal === "ver" && selectedUsuario && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">ID:</span>
                      <span>{selectedUsuario.id_usuario}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre Completo:</span>
                      <span className="text-right">{selectedUsuario.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-right">{selectedUsuario.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Documento:</span>
                      <span className="text-right">{selectedUsuario.documento || "— No especificado —"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span className="text-right">{selectedUsuario.telefono || "— No especificado —"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha Nacimiento:</span>
                      <span className="text-right">
                        {selectedUsuario.fecha_nacimiento ? selectedUsuario.fecha_nacimiento : "— No especificado —"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Rol:</span>
                      <span className="text-right">{getRolNombres(selectedUsuario.roles)}</span>
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

                {modal === "eliminar" && selectedUsuario && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Está seguro de eliminar al usuario{" "}
                      <span className="font-bold text-red-600">{selectedUsuario.nombre_completo}</span>?
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
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Eliminar
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
}