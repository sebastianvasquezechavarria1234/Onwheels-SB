import React, { useState, useEffect } from "react";
import {
  Eye, Plus, Search, Pencil, Trash2, X, User,
  ChevronLeft, ChevronRight, Hash, TrendingUp,
  SlidersHorizontal, ArrowUpDown, Download, AlertCircle,
  Briefcase, ShieldCheck, Mail, Phone, Calendar, Hash as IDIcon
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../../services/usuariosServices";
import { getRoles } from "../../services/RolesService";
import { canManage } from "../../../../../../utils/permissions";

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
  const [formErrors, setFormErrors] = useState({});
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
    // Limpiar error al escribir
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre_completo.trim()) errors.nombre_completo = "El nombre completo es obligatorio";
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El formato del correo es inválido";
    }
    if (!formData.documento) errors.documento = "El nro de documento es obligatorio";
    if (!formData.tipo_documento) errors.tipo_documento = "El tipo de documento es obligatorio";
    if (!formData.telefono) errors.telefono = "El teléfono es obligatorio";
    if (!formData.fecha_nacimiento) errors.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    if (!formData.id_rol) errors.id_rol = "Debes asignar un rol";

    if (modal === "crear" && !formData.contrasena.trim()) {
      errors.contrasena = "La contraseña es obligatoria para nuevos usuarios";
    } else if (formData.contrasena.trim() && formData.contrasena.length < 6) {
      errors.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }
    try {
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
    if (!validateForm()) {
      return;
    }
    try {
      if (!selectedUsuario) return;

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
    setFormErrors({});

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
      <div className="flex flex-col h-full bg-white overflow-hidden font-primary">
        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-4 p-2 pb-4">
          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                Gestión de Usuarios
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-slate-400 bg-slate-50">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs font-bold">{usuariosFiltrados.length}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-800 hover:bg-white transition shadow-sm" title="Exportar CSV">
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Row 2: Active Toolbar (Big Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100 px-4 py-3">
            {/* Search & Create Group */}
            <div className="flex flex-1 w-full sm:w-auto gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar usuario..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition bg-white"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {canManage("usuarios") && (
                <button
                  onClick={() => openModal("crear")}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Usuario
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Table Content */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <table className="w-full text-left relative">
                <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Rol</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">Cargando usuarios...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                          <AlertCircle className="h-8 w-8 opacity-80" />
                          <p className="font-medium">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">No se encontraron usuarios.</td>
                    </tr>
                  ) : (
                    currentItems.map((u) => (
                      <tr key={u.id_usuario} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-gray-400">#{u.id_usuario}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-[#040529] text-[#F0E6E6] shadow-sm">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-[#040529] text-sm leading-tight">{u.nombre_completo}</p>
                              <p className="text-[11px] text-gray-400 font-medium truncate max-w-[150px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Mail size={12} className="shrink-0" />
                              <span className="text-xs">{u.email}</span>
                            </div>
                            {u.telefono && (
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <Phone size={12} className="shrink-0" />
                                <span className="text-[11px]">{u.telefono}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                            {getRolNombres(u.roles)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal("ver", u)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver detalles"><Eye size={16} /></button>
                            {canManage("usuarios") && (
                              <>
                                <button onClick={() => openModal("editar", u)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pencil size={16} /></button>
                                <button onClick={() => openModal("eliminar", u)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 size={16} /></button>
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

            {/* Footer Pagination */}
            {totalPages > 1 && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  Mostrando <span className="font-bold text-[#040529]">{currentItems.length}</span> de <span className="font-bold text-[#040529]">{usuariosFiltrados.length}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-[#040529] px-2">{currentPage}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-[600px] overflow-hidden">
                {/* Left Side (Visual) */}
                <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                  <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                    <User size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                    {modal === "crear" ? "Nuevo Sistema" : modal === "editar" ? "Gestión de Acceso" : modal === "ver" ? "Perfil de Usuario" : "Seguridad"}
                  </p>
                </div>

                {/* Right Side (Form/Content) */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-[#040529]">
                      {modal === "crear" ? "Registrar Nuevo Usuario" : modal === "editar" ? "Actualizar Datos" : modal === "ver" ? "Detalles del Perfil" : "Confirmar Eliminación"}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                    {modal === "eliminar" ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Trash2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#040529] mb-2">¿Eliminar este usuario?</h3>
                        <p className="text-sm text-gray-500 mb-6 px-4">
                          Esta acción no se puede deshacer. El usuario <span className="font-bold text-red-600">{selectedUsuario?.nombre_completo}</span> perderá el acceso al sistema.
                        </p>
                        <div className="flex gap-3 px-4">
                          <button onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-bold text-sm">Cancelar</button>
                          <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-bold text-sm shadow-md">Eliminar</button>
                        </div>
                      </div>
                    ) : (
                      <form className="space-y-4 font-primary">
                        {/* Secciones de formulario */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tipo Doc.</label>
                            {modal === "ver" ? (
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedUsuario?.tipo_documento || "—"}</p>
                            ) : (
                              <>
                                <input
                                  name="tipo_documento"
                                  value={formData.tipo_documento}
                                  onChange={handleChange}
                                  className={cn(
                                    "w-full mt-1 px-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-[#040529]/10 outline-none transition",
                                    formErrors.tipo_documento ? "border-red-400 bg-red-50" : "border-gray-200"
                                  )}
                                  placeholder="CC, CE..."
                                />
                                {formErrors.tipo_documento && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.tipo_documento}</p>}
                              </>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nro. Documento</label>
                            {modal === "ver" ? (
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedUsuario?.documento || "—"}</p>
                            ) : (
                              <>
                                <input
                                  name="documento"
                                  value={formData.documento}
                                  onChange={handleChange}
                                  className={cn(
                                    "w-full mt-1 px-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-[#040529]/10 outline-none transition",
                                    formErrors.documento ? "border-red-400 bg-red-50" : "border-gray-200"
                                  )}
                                  placeholder="..."
                                />
                                {formErrors.documento && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.documento}</p>}
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                          {modal === "ver" ? (
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529] font-bold">{selectedUsuario?.nombre_completo}</p>
                          ) : (
                            <>
                              <input
                                name="nombre_completo"
                                value={formData.nombre_completo}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md outline-none transition ${formErrors.nombre_completo ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#040529]"}`}
                              />
                              {formErrors.nombre_completo && <p className="text-red-400 text-[11px] mt-1">{formErrors.nombre_completo}</p>}
                            </>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                          {modal === "ver" ? (
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedUsuario?.email}</p>
                          ) : (
                            <>
                              <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md outline-none transition ${formErrors.email ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#040529]"}`}
                                placeholder="correo@ejemplo.com"
                              />
                              {formErrors.email && <p className="text-red-400 text-[11px] mt-1">{formErrors.email}</p>}
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                            {modal === "ver" ? (
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedUsuario?.telefono || "—"}</p>
                            ) : (
                              <>
                                <input
                                  name="telefono"
                                  value={formData.telefono}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9+\s-]/g, '');
                                    handleChange({ ...e, target: { ...e.target, value: val } });
                                  }}
                                  className={`w-full p-2 border rounded-md outline-none transition ${formErrors.telefono ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#040529]"}`}
                                  placeholder="..."
                                />
                                {formErrors.telefono && <p className="text-red-400 text-[11px] mt-1">{formErrors.telefono}</p>}
                              </>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">F. Nacimiento</label>
                            {modal === "ver" ? (
                              <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]">{selectedUsuario?.fecha_nacimiento || "—"}</p>
                            ) : (
                              <>
                                <input
                                  name="fecha_nacimiento"
                                  type="date"
                                  value={formData.fecha_nacimiento}
                                  onChange={handleChange}
                                  className={`w-full p-2 border rounded-md outline-none transition ${formErrors.fecha_nacimiento ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#040529]"}`}
                                />
                                {formErrors.fecha_nacimiento && <p className="text-red-400 text-[11px] mt-1">{formErrors.fecha_nacimiento}</p>}
                              </>
                            )}
                          </div>
                        </div>

                        {modal !== "ver" && (
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                              {modal === "crear" ? "Contraseña" : "Contraseña (opcional)"}
                            </label>
                            <input
                              name="contrasena"
                              type="password"
                              value={formData.contrasena}
                              onChange={handleChange}
                              className={`w-full p-2 border rounded-md outline-none transition ${formErrors.contrasena ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#040529]"}`}
                              placeholder={modal === "crear" ? "******" : "Dejar vacío para mantener"}
                            />
                            {formErrors.contrasena && <p className="text-red-400 text-[11px] mt-1">{formErrors.contrasena}</p>}
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Rol Asignado</label>
                          {modal === "ver" ? (
                            <p className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529] font-bold">
                              {getRolNombres(selectedUsuario?.roles)}
                            </p>
                          ) : (
                            <>
                              <select
                                name="id_rol"
                                value={formData.id_rol}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded-md outline-none transition ${formErrors.id_rol ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#040529]"}`}
                              >
                                <option value="">Sin asignar</option>
                                {roles.map((r) => (
                                  <option key={r.id_rol} value={r.id_rol}>
                                    {r.nombre_rol}
                                  </option>
                                ))}
                              </select>
                              {formErrors.id_rol && <p className="text-red-400 text-[11px] mt-1">{formErrors.id_rol}</p>}
                            </>
                          )}
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Footer Buttons */}
                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={closeModal} className="px-5 py-2 rounded-xl text-gray-500 hover:text-gray-700 transition font-bold text-xs uppercase tracking-wider">Cerrar</button>
                    {modal === "crear" && <button onClick={handleCreate} className="px-6 py-2 bg-[#040529] text-white rounded-xl shadow-md hover:shadow-lg transition font-bold text-xs uppercase tracking-wider">Guardar Usuario</button>}
                    {modal === "editar" && <button onClick={handleEdit} className="px-6 py-2 bg-[#040529] text-white rounded-xl shadow-md hover:shadow-lg transition font-bold text-xs uppercase tracking-wider">Actualizar Datos</button>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  );
}