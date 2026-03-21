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
import { cn, configUi } from "../configUi";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Campos base (USUARIOS)
    documento: "",
    tipo_documento: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    contrasena: "",
    id_rol: "",

    // Campos adicionales (solo si aplica)
    años_experiencia: "",
    estado_estudiante: true,
    estado_instructor: true,
    foto_perfil: null, // Guardaremos el File seleccionado temporalmente
    foto_perfil_url: "", // Guardaremos la URL actual para previsualizar
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
    if (!formData.id_rol) errors.id_rol = "Debes asignar un rol";

    if (modal === "crear" && !formData.contrasena.trim()) {
      errors.contrasena = "La contraseña es obligatoria para nuevos usuarios";
    } else if (formData.contrasena.trim() && formData.contrasena.length < 6) {
      errors.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    setFormErrors(errors);
    if (Object.keys(errors).some((key) => ["tipo_documento", "documento", "nombre_completo", "email", "telefono"].includes(key))) {
      setFormStep(1);
    } else if (Object.keys(errors).length > 0) {
      setFormStep(2);
    }
    return Object.keys(errors).length === 0;
  };

  const validateStepOne = () => {
    const errors = {};
    if (!formData.tipo_documento) errors.tipo_documento = "El tipo de documento es obligatorio";
    if (!formData.documento) errors.documento = "El nro de documento es obligatorio";
    if (!formData.nombre_completo.trim()) errors.nombre_completo = "El nombre completo es obligatorio";
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El formato del correo es inválido";
    }
    if (!formData.telefono) errors.telefono = "El teléfono es obligatorio";

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        documento: formData.documento || null,
        tipo_documento: formData.tipo_documento || null,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono || null,
        contrasena: formData.contrasena,
        id_rol: formData.id_rol ? Number(formData.id_rol) : null,
      };

      const newUserRes = await createUsuario(payload);
      
      // Si el usuario seleccionó una foto, la subimos
      if (formData.foto_perfil && newUserRes?.usuario?.id_usuario) {
        const formDataImg = new FormData();
        formDataImg.append("foto_perfil", formData.foto_perfil);
        const token = localStorage.getItem("token");
        const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
        const photoRes = await fetch(`${API_URL}/api/usuarios/${newUserRes.usuario.id_usuario}/foto`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formDataImg
        });
        
        if (!photoRes.ok) {
           const errData = await photoRes.json();
           throw new Error(errData.mensaje || "Error al subir la imagen de perfil");
        }
      }

      await fetchData();
      closeModal();
      showNotification("Usuario creado con éxito");
    } catch (err) {
      console.error("Error creando usuario:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando usuario";
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setSubmitting(true);
      if (!selectedUsuario) return;

      const payload = {
        documento: formData.documento || null,
        tipo_documento: formData.tipo_documento || null,
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        telefono: formData.telefono || null,
        // Solo incluir contraseña si se proporciona
        ...(formData.contrasena ? { contrasena: formData.contrasena } : {}),
        id_rol: formData.id_rol ? Number(formData.id_rol) : null,
      };

      await updateUsuario(selectedUsuario.id_usuario, payload);

      // Si el usuario seleccionó una foto, la subimos
      if (formData.foto_perfil) {
        const formDataImg = new FormData();
        formDataImg.append("foto_perfil", formData.foto_perfil);
        const token = localStorage.getItem("token");
        
        const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
        const photoRes = await fetch(`${API_URL}/api/usuarios/${selectedUsuario.id_usuario}/foto`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formDataImg
        });

        if (!photoRes.ok) {
           const errData = await photoRes.json();
           throw new Error(errData.mensaje || "Error al subir la imagen de perfil");
        }
        
        // Actualizamos localstorage si nos estamos editando a nosotros mismos
        const photoData = await photoRes.json();
        const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
        if(String(currentUserData.id_usuario) === String(selectedUsuario.id_usuario)){
          currentUserData.foto_perfil = photoData.foto_perfil || photoData.secure_url;
          localStorage.setItem("user", JSON.stringify(currentUserData));
          window.dispatchEvent(new Event("storage")); 
        }
      }

      await fetchData();
      closeModal();
      showNotification("Usuario actualizado con éxito");
    } catch (err) {
      console.error("Error editando usuario:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando usuario";
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      if (!selectedUsuario) return;
      await deleteUsuario(selectedUsuario.id_usuario);
      await fetchData();
      closeModal();
      showNotification("Usuario eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      // Mostrar el error exacto del backend
      const errorMessage = err.response?.data?.mensaje || "Error eliminando usuario";
      showNotification(errorMessage, "error");
      closeModal(); // Cerrar modal después del error
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type, usuario = null) => {
    setModal(type);
    setSelectedUsuario(usuario);
    setFormErrors({});
    setFormStep(1);

    if (usuario && type === "editar") {
      setFormData({
        documento: usuario.documento ?? "",
        tipo_documento: usuario.tipo_documento ?? "",
        nombre_completo: usuario.nombre_completo ?? "",
        email: usuario.email ?? "",
        telefono: usuario.telefono ?? "",
        contrasena: "", // No prellenar contraseña al editar
        id_rol: usuario.roles && usuario.roles.length > 0 ? String(usuario.roles[0].id_rol) : "",
        foto_perfil: null,
        foto_perfil_url: usuario.foto_perfil || "",
      });
    } else if (!usuario) {
      setFormData({
        documento: "",
        tipo_documento: "",
        nombre_completo: "",
        email: "",
        telefono: "",
        contrasena: "",
        id_rol: "",
        años_experiencia: "",
        estado_estudiante: true,
        estado_instructor: true,
        foto_perfil: null,
        foto_perfil_url: "",
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUsuario(null);
    setFormStep(1);
    setSubmitting(false);
    setFormData({
      documento: "",
      tipo_documento: "",
      nombre_completo: "",
      email: "",
      telefono: "",
      contrasena: "",
      id_rol: "",
      foto_perfil: null,
      foto_perfil_url: "",
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
      <div className={`${configUi.pageShell} font-primary`}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
               Usuarios
            </h2>
            <span className={configUi.countBadge}>{totalItems} usuarios</span>
          </div>

          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className={configUi.select}
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
              className={configUi.iconButton} title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {canManage("usuarios") && (
              <button
                onClick={() => openModal("crear")}
                className={`${configUi.primaryButton} whitespace-nowrap`}
              >
                <Plus size={18} />
                Registrar Usuario
              </button>
            )}
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          {/* Table Content */}
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[10%]`}>ID</th>
                  <th className={`${configUi.th} w-[30%]`}>Usuario</th>
                  <th className={`${configUi.th} w-[25%]`}>Contacto</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Rol</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[20%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>Cargando usuarios...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>
                      <div className="flex flex-col items-center justify-center gap-2 text-red-500">
                        <AlertCircle className="h-8 w-8 opacity-80" />
                        <p className="font-medium">{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={configUi.emptyState}>No se encontraron usuarios.</td>
                  </tr>
                ) : (
                  currentItems.map((u, i) => (
                    <tr key={u.id_usuario} className={configUi.row}>
                      <td className={configUi.td}>
                        <span className="text-sm font-medium text-slate-500">#{u.id_usuario}</span>
                      </td>
                      <td className={configUi.td}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#223a63] text-[#eff6ff] shadow-sm">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight text-[#16315f]">{u.nombre_completo}</p>
                            <p className="text-xs text-slate-500 font-medium truncate max-w-[180px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={configUi.td}>
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
                      <td className={`${configUi.td} text-center`}>
                        <div className={configUi.pill}>
                          {getRolNombres(u.roles)}
                        </div>
                      </td>
                      <td className={`${configUi.td} text-right`}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal("ver", u)} className={configUi.actionButton} title="Ver detalles"><Eye size={14} /></button>
                          {canManage("usuarios") && (
                            <>
                              <button onClick={() => openModal("editar", u)} className={configUi.actionButton} title="Editar"><Pencil size={14} /></button>
                              <button onClick={() => openModal("eliminar", u)} className={configUi.actionDangerButton} title="Eliminar"><Trash2 size={14} /></button>
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
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={configUi.paginationButton}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={configUi.paginationButton}
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
            className={configUi.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`${configUi.modalPanel} max-w-5xl`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={configUi.modalSplit}>
                {/* Left Side (Visual) */}
                <div className={configUi.modalSide}>
                  <div>
                    <div className={`${configUi.modalSideIcon} mb-5`}>
                      <User size={40} strokeWidth={1.7} />
                    </div>
                    <p className={configUi.modalEyebrow}>
                      {modal === "crear" ? "Alta de acceso" : modal === "editar" ? "Edicion de perfil" : modal === "ver" ? "Informacion de usuario" : "Control de seguridad"}
                    </p>
                    <h4 className="mt-3 text-2xl font-black text-[#16315f]">
                      {modal === "crear" ? "Nuevo usuario" : modal === "editar" ? "Actualizar usuario" : modal === "ver" ? "Perfil" : "Eliminar"}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#6b84aa]">
                      {modal === "crear" || modal === "editar"
                        ? "Organiza la informacion personal primero y luego define acceso, rol y foto de perfil."
                        : modal === "ver"
                          ? "Consulta la informacion principal del usuario con una vista compacta y clara."
                          : "Confirma la eliminacion solo si estas seguro de retirar el acceso del usuario."}
                    </p>
                  </div>
                  {(modal === "crear" || modal === "editar") && (
                    <div className="rounded-[1.5rem] border border-[#d7e5f8] bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b84aa]">Flujo</p>
                      <div className="mt-3 flex items-center gap-3 text-sm text-[#5d7498]">
                        <span className={configUi.stepBadge}>1</span>
                        <span>Datos personales</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-[#5d7498]">
                        <span className={configUi.stepBadge}>2</span>
                        <span>Acceso y permisos</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side (Form/Content) */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Header */}
                  <div className={configUi.modalHeader}>
                    <div>
                      <h3 className={configUi.modalTitle}>
                        {modal === "crear" ? "Registrar nuevo usuario" : modal === "editar" ? "Actualizar datos" : modal === "ver" ? "Detalles del perfil" : "Confirmar eliminacion"}
                      </h3>
                      <p className={configUi.modalSubtitle}>
                        {modal === "crear" || modal === "editar"
                          ? formStep === 1
                            ? "Paso 1 de 2: informacion personal y contacto."
                            : "Paso 2 de 2: acceso, foto y rol asignado."
                          : modal === "ver"
                            ? "Vista consolidada del usuario seleccionado."
                            : "Esta accion no se puede deshacer."}
                      </p>
                    </div>
                    <button onClick={closeModal} className={configUi.modalClose}>
                      <X size={20} />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className={configUi.modalContent}>
                    {modal === "eliminar" ? (
                      <div className="py-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                          <Trash2 size={32} />
                        </div>
                        <h3 className="mb-2 text-xl font-black text-[#16315f]">Eliminar este usuario</h3>
                        <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#6b84aa]">
                          Esta accion no se puede deshacer. El usuario <span className="font-bold text-[#d44966]">{selectedUsuario?.nombre_completo}</span> perdera el acceso al sistema.
                        </p>
                        <div className="mx-auto flex max-w-md gap-3">
                          <button onClick={closeModal} disabled={submitting} className={`${configUi.secondaryButton} flex-1`}>Cancelar</button>
                          <button onClick={handleDelete} disabled={submitting} className={`${configUi.dangerButton} flex-1`}>{submitting ? "Eliminando..." : "Eliminar"}</button>
                        </div>
                      </div>
                    ) : modal === "ver" ? (
                      <div className="space-y-5">
                        <div className={`${configUi.formSection} flex items-center gap-4`}>
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#bfd1f4] bg-white">
                            {selectedUsuario?.foto_perfil ? (
                              <img src={selectedUsuario.foto_perfil} alt="perfil" className="h-full w-full object-cover" />
                            ) : (
                              <User size={24} className="text-[#86a0c6]" />
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-black text-[#16315f]">{selectedUsuario?.nombre_completo}</p>
                            <p className="text-sm text-[#6b84aa]">{selectedUsuario?.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Tipo de documento</label>
                            <p className={configUi.readOnlyField}>{selectedUsuario?.tipo_documento || "-"}</p>
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Numero de documento</label>
                            <p className={configUi.readOnlyField}>{selectedUsuario?.documento || "-"}</p>
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Nombre completo</label>
                            <p className={configUi.readOnlyField}>{selectedUsuario?.nombre_completo || "-"}</p>
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Correo electronico</label>
                            <p className={configUi.readOnlyField}>{selectedUsuario?.email || "-"}</p>
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Telefono</label>
                            <p className={configUi.readOnlyField}>{selectedUsuario?.telefono || "-"}</p>
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Rol asignado</label>
                            <p className={configUi.readOnlyField}>{getRolNombres(selectedUsuario?.roles)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form className="space-y-5 font-primary">
                        <div className="flex items-center justify-between rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={cn(configUi.stepBadge, formStep === 1 && "border-[#7da7e8] bg-[#dbeafe]")}>1</span>
                            <div>
                              <p className="text-sm font-bold text-[#16315f]">Datos personales</p>
                              <p className="text-xs text-[#6b84aa]">Identidad y contacto</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(configUi.stepBadge, formStep === 2 && "border-[#7da7e8] bg-[#dbeafe]")}>2</span>
                            <div>
                              <p className="text-sm font-bold text-[#16315f]">Acceso</p>
                              <p className="text-xs text-[#6b84aa]">Rol, foto y seguridad</p>
                            </div>
                          </div>
                        </div>

                        {formStep === 1 && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Tipo de documento</label>
                              <select
                                name="tipo_documento"
                                value={formData.tipo_documento}
                                onChange={handleChange}
                                className={cn(configUi.fieldSelect, formErrors.tipo_documento && "border-red-400 bg-red-50")}
                              >
                                <option value="">Selecciona tipo</option>
                                <option value="CC">CC</option>
                                <option value="CE">CE</option>
                                <option value="TI">TI</option>
                                <option value="PP">PP</option>
                                <option value="NIT">NIT</option>
                              </select>
                              {formErrors.tipo_documento && <p className="pl-1 text-[11px] text-red-500">{formErrors.tipo_documento}</p>}
                            </div>
                            <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Numero de documento</label>
                              <input
                                name="documento"
                                value={formData.documento}
                                onChange={handleChange}
                                className={cn(configUi.fieldInput, formErrors.documento && "border-red-400 bg-red-50")}
                                placeholder="Ingresa el documento"
                              />
                              {formErrors.documento && <p className="pl-1 text-[11px] text-red-500">{formErrors.documento}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Nombre completo</label>
                                <input
                                  name="nombre_completo"
                                  value={formData.nombre_completo}
                                  onChange={handleChange}
                                  className={cn(configUi.fieldInput, formErrors.nombre_completo && "border-red-400 bg-red-50")}
                                  placeholder="Nombre y apellidos"
                                />
                                {formErrors.nombre_completo && <p className="pl-1 text-[11px] text-red-500">{formErrors.nombre_completo}</p>}
                              </div>
                            </div>
                            <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Correo electronico</label>
                              <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={cn(configUi.fieldInput, formErrors.email && "border-red-400 bg-red-50")}
                                placeholder="correo@ejemplo.com"
                              />
                              {formErrors.email && <p className="pl-1 text-[11px] text-red-500">{formErrors.email}</p>}
                            </div>
                            <div className={configUi.fieldGroup}>
                              <label className={configUi.fieldLabel}>Telefono</label>
                              <input
                                name="telefono"
                                value={formData.telefono}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9+\s-]/g, "");
                                  setFormData((prev) => ({ ...prev, telefono: val }));
                                  if (formErrors.telefono) {
                                    setFormErrors((prev) => {
                                      const next = { ...prev };
                                      delete next.telefono;
                                      return next;
                                    });
                                  }
                                }}
                                className={cn(configUi.fieldInput, formErrors.telefono && "border-red-400 bg-red-50")}
                                placeholder="3001234567"
                              />
                              {formErrors.telefono && <p className="pl-1 text-[11px] text-red-500">{formErrors.telefono}</p>}
                            </div>
                          </div>
                        )}

                        {formStep === 2 && (
                          <div className="space-y-4">
                            <div className={`${configUi.formSection} flex items-center gap-4`}>
                              <div className="relative shrink-0">
                                <label htmlFor="foto_perfil_upload" className="group block cursor-pointer">
                                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#bfd1f4] bg-white transition group-hover:border-[#7da7e8]">
                                    {formData.foto_perfil ? (
                                      <img src={URL.createObjectURL(formData.foto_perfil)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : formData.foto_perfil_url ? (
                                      <img src={formData.foto_perfil_url} alt="Current" className="h-full w-full object-cover" />
                                    ) : (
                                      <User size={28} className="text-[#86a0c6]" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#16315f]/45 opacity-0 transition group-hover:opacity-100">
                                      <Plus size={18} className="text-white" />
                                    </div>
                                  </div>
                                  <input
                                    type="file"
                                    id="foto_perfil_upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setFormData((prev) => ({ ...prev, foto_perfil: e.target.files[0] }));
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-[#16315f]">Foto de perfil</h4>
                                <p className="mt-1 text-sm leading-6 text-[#6b84aa]">Sube una imagen cuadrada. Formatos recomendados: JPG, PNG o WEBP.</p>
                                <label htmlFor="foto_perfil_upload" className="mt-2 inline-block cursor-pointer text-sm font-bold text-[#1d4f91] hover:underline">
                                  Seleccionar archivo
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>{modal === "crear" ? "Contrasena" : "Contrasena opcional"}</label>
                                <input
                                  name="contrasena"
                                  type="password"
                                  value={formData.contrasena}
                                  onChange={handleChange}
                                  className={cn(configUi.fieldInput, formErrors.contrasena && "border-red-400 bg-red-50")}
                                  placeholder={modal === "crear" ? "Minimo 6 caracteres" : "Dejar vacio para mantener"}
                                />
                                {formErrors.contrasena && <p className="pl-1 text-[11px] text-red-500">{formErrors.contrasena}</p>}
                              </div>
                              <div className={configUi.fieldGroup}>
                                <label className={configUi.fieldLabel}>Rol asignado</label>
                                <select
                                  name="id_rol"
                                  value={formData.id_rol}
                                  onChange={handleChange}
                                  className={cn(configUi.fieldSelect, formErrors.id_rol && "border-red-400 bg-red-50")}
                                >
                                  <option value="">Seleccionar rol</option>
                                  {roles.map((r) => (
                                    <option key={r.id_rol} value={r.id_rol}>
                                      {r.nombre_rol}
                                    </option>
                                  ))}
                                </select>
                                {formErrors.id_rol && <p className="pl-1 text-[11px] text-red-500">{formErrors.id_rol}</p>}
                              </div>
                            </div>
                          </div>
                        )}
                      </form>
                    )}
                  </div>

                  {/* Footer Buttons */}
                  <div className={configUi.modalFooter}>
                    <div>
                      {(modal === "crear" || modal === "editar") && (
                        <span className="text-sm text-[#6b84aa]">{formStep === 1 ? "Completa los datos basicos para continuar." : "Revisa rol, foto y seguridad antes de guardar."}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {(modal === "crear" || modal === "editar") && formStep === 2 && (
                        <button onClick={() => setFormStep(1)} disabled={submitting} className={configUi.secondaryButton}>Volver</button>
                      )}
                      <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>{modal === "ver" ? "Cerrar" : "Cancelar"}</button>
                      {modal === "crear" && formStep === 1 && (
                        <button onClick={() => { if (validateStepOne()) setFormStep(2); }} disabled={submitting} className={configUi.primarySoftButton}>Continuar</button>
                      )}
                      {modal === "editar" && formStep === 1 && (
                        <button onClick={() => { if (validateStepOne()) setFormStep(2); }} disabled={submitting} className={configUi.primarySoftButton}>Continuar</button>
                      )}
                      {modal === "crear" && formStep === 2 && <button onClick={handleCreate} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Guardando..." : "Guardar usuario"}</button>}
                      {modal === "editar" && formStep === 2 && <button onClick={handleEdit} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Actualizando..." : "Actualizar datos"}</button>}
                    </div>
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