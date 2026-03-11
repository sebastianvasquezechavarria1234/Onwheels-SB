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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [filterType, setFilterType] = useState("Todos los usuarios");

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
      const [resUsuarios, dataRoles] = await Promise.all([
        getUsuarios({ page: currentPage, limit: itemsPerPage, search }),
        getRoles()
      ]);

      if (resUsuarios && resUsuarios.data) {
        setUsuarios(resUsuarios.data);
        setTotalPages(resUsuarios.totalPages || 1);
        setTotalItems(resUsuarios.total || 0);
      } else {
        setUsuarios(Array.isArray(resUsuarios) ? resUsuarios : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(resUsuarios) ? resUsuarios.length : 0);
      }

      // getRoles sin params devuelve array directo
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
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search]);

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

  const handleDownload = () => {
    if (!usuarios || usuarios.length === 0) return;
    const header = ["ID", "Nombre Completo", "Email", "Telefono", "Roles"];
    const csvData = currentItems.map(u => [
      u.id_usuario,
      `"${u.nombre_completo}"`,
      u.email,
      u.telefono || "",
      `"${getRolNombres(u.roles)}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "usuarios_report_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentItems = usuarios.filter(u => {
    if (filterType === "Clientes") {
      const isClient = u.roles?.some(r => r.nombre_rol?.toLowerCase().includes("cliente") || r.nombre_rol?.toLowerCase().includes("estudiante"));
      return isClient;
    }
    if (filterType === "Instructores") {
      const isInstr = u.roles?.some(r => r.nombre_rol?.toLowerCase().includes("instructor"));
      return isInstr;
    }
    return true; // Todos los usuarios
  });

  return (
    <>
      <div className="flex flex-col h-full bg-white overflow-hidden font-primary p-2 md:p-4">
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-[28px] font-black text-[#040529] tracking-tight whitespace-nowrap" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Gestión de Usuarios
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#040529]/10 transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="appearance-none bg-white border border-slate-200 text-slate-500 py-2.5 pl-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#040529]/10 cursor-pointer"
              >
                <option value="Todos los usuarios">Todos los usuarios</option>
                <option value="Clientes">Clientes</option>
                <option value="Instructores">Instructores</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {canManage("usuarios") && (
              <button
                onClick={() => openModal("crear")}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#040529] hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus size={18} />
                Registrar Usuario
              </button>
            )}
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm">
          {/* Table Content */}
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide rounded-tl-xl w-[10%]">ID</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[30%]">Usuario</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[25%]">Contacto</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide text-center w-[15%]">Rol</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide text-right rounded-tr-xl w-[20%]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">Cargando usuarios...</td>
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
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No se encontraron usuarios.</td>
                  </tr>
                ) : (
                  currentItems.map((u, i) => (
                    <tr key={u.id_usuario} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="text-sm font-medium text-slate-500">#{u.id_usuario}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#040529] to-[#040529]/80 text-[#F0E6E6] shadow-sm">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#040529] text-sm leading-tight">{u.nombre_completo}</p>
                            <p className="text-xs text-slate-500 font-medium truncate max-w-[180px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail size={14} className="shrink-0 text-slate-400" />
                            <span className="text-sm">{u.email}</span>
                          </div>
                          {u.telefono && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Phone size={14} className="shrink-0 text-slate-400" />
                              <span className="text-xs font-medium">{u.telefono}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {getRolNombres(u.roles)}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("ver", u)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Ver detalles"><Eye size={14} /></button>
                          {canManage("usuarios") && (
                            <>
                              <button onClick={() => openModal("editar", u)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Editar"><Pencil size={14} /></button>
                              <button onClick={() => openModal("eliminar", u)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition shadow-sm" title="Eliminar"><Trash2 size={14} /></button>
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
          {totalPages > 0 && (
            <div className="border-t border-slate-100 px-6 py-4 bg-white flex items-center justify-between mt-auto">
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#040529]">{currentPage}</span> de <span className="text-[#040529]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#040529] disabled:opacity-50 transition shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#040529] disabled:opacity-50 transition shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
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