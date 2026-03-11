import React, { useState, useEffect } from "react";
import { Eye, Plus, Search, Pencil, Trash2, X, Key, Save, Download, SlidersHorizontal, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
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

// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permisosTotales, setPermisosTotales] = useState([]);
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editForm, setEditForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [addForm, setAddForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [filterType, setFilterType] = useState("Todos los roles");

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
    fetchPermisosTotales();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRoles();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, currentPage]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRoles({ page: currentPage, limit: itemsPerPage, search });
      if (res && res.data) {
        setRoles(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      } else {
        setRoles(Array.isArray(res) ? res : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(res) ? res.length : 0);
      }
    } catch (err) {
      setError("Error al cargar los roles. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermisosTotales = async () => {
    try {
      const data = await getPermisos();
      setPermisosTotales(data || []);
    } catch (err) {
      console.error("Error al cargar permisos:", err);
    }
  };

  const fetchPermisosDeRol = async (idRol) => {
    try {
      const data = await getPermisosByRol(idRol);
      setPermisosAsignados(data.map(p => p.id_permiso) || []);
    } catch (err) {
      console.error("Error cargando permisos del rol:", err);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelected(null);
    setEditForm({ nombre_rol: "", descripcion: "", estado: true });
    setAddForm({ nombre_rol: "", descripcion: "", estado: true });
    setFormErrors({});
    setPermisosAsignados([]);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const openEdit = (rol) => {
    setFormErrors({});
    setSelected(rol);
    setEditForm({
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion || "",
      estado: rol.estado
    });
    setModalType("edit");
  };

  const openPermisos = (rol) => {
    setSelected(rol);
    setModalType("permisos");
    fetchPermisosDeRol(rol.id_rol);
  };

  const validateRolesForm = (data) => {
    const errors = {};
    if (!data.nombre_rol.trim()) {
      errors.nombre_rol = "El nombre del rol es obligatorio";
    } else if (data.nombre_rol.trim().length < 3) {
      errors.nombre_rol = "El nombre debe tener al menos 3 caracteres";
    }
    if (!data.descripcion.trim()) errors.descripcion = "La descripción es obligatoria";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveEdit = async () => {
    if (!validateRolesForm(editForm)) {
      return;
    }
    try {
      await updateRole(selected.id_rol, editForm);
      showNotification("Rol actualizado correctamente");
      fetchRoles();
      closeModal();
    } catch (err) {
      showNotification("Error al actualizar el rol", "error");
    }
  };

  const saveAdd = async () => {
    if (!validateRolesForm(addForm)) {
      return;
    }
    try {
      await createRole(addForm);
      showNotification("Rol creado correctamente");
      fetchRoles();
      closeModal();
    } catch (err) {
      showNotification("Error al crear el rol", "error");
    }
  };

  const handleDelete = async (rol) => {
    if (window.confirm(`¿Estás seguro de eliminar el rol "${rol.nombre_rol}"?`)) {
      try {
        await deleteRole(rol.id_rol);
        showNotification("Rol eliminado");
        fetchRoles();
      } catch (err) {
        showNotification("Error al eliminar", "error");
      }
    }
  };

  const togglePermiso = (idPermiso) => {
    setPermisosAsignados(prev =>
      prev.includes(idPermiso)
        ? prev.filter(id => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  const guardarPermisos = async () => {
    try {
      setLoading(true);
      const actuales = await getPermisosByRol(selected.id_rol);
      const idsActuales = actuales.map(p => p.id_permiso);

      const aEliminar = idsActuales.filter(id => !permisosAsignados.includes(id));
      const aAgregar = permisosAsignados.filter(id => !idsActuales.includes(id));

      await Promise.all([
        ...aEliminar.map(id => eliminarPermisoDeRol(selected.id_rol, id)),
        ...aAgregar.map(id => asignarPermisoARol(selected.id_rol, id))
      ]);

      showNotification("Permisos actualizados!");
      closeModal();
    } catch (err) {
      showNotification("Error al actualizar permisos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Generate CSV from current items
    if (!roles || roles.length === 0) return;
    const header = ["ID", "Nombre Rol", "Descripcion", "Estado"];
    const csvData = currentItems.map(r => [
      r.id_rol,
      r.nombre_rol,
      r.descripcion || "",
      r.estado ? "Activo" : "Inactivo"
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "roles_report_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentItems = roles.filter(r => {
    if (filterType === "Activos") return r.estado === true;
    if (filterType === "Inactivos") return r.estado === false;
    return true; // Todos los roles
  });

  return (
    <>
      <div className="flex flex-col h-full bg-white overflow-hidden p-2 md:p-4">
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-[28px] font-black text-[#040529] tracking-tight whitespace-nowrap" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Gestión de Roles
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar roles..."
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
                <option value="Todos los roles">Todos los roles</option>
                <option value="Activos">Activos</option>
                <option value="Inactivos">Inactivos</option>
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

            {/* Create Button */}
            <button
              onClick={() => { setModalType("add"); setFormErrors({}); }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#040529] hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              <Plus size={18} />
              Crear Rol
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide rounded-tl-xl w-[10%]">ID</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[25%]">Nombre del Rol</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide w-[35%]">Descripción</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide text-center w-[15%]">Estado</th>
                  <th className="px-6 py-4 font-bold text-sm tracking-wide text-right rounded-tr-xl w-[15%]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">Cargando roles...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No se encontraron roles.</td></tr>
                ) : (
                  currentItems.map((r, i) => (
                    <tr key={r.id_rol} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-slate-500">#{r.id_rol}</td>
                      <td className="px-6 py-3 font-bold text-[#040529] text-base">{r.nombre_rol}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 truncate max-w-[200px]">{r.descripcion || "—"}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-center">
                          {r.estado ? (
                            <span className="px-3 py-1 bg-green-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-2 border border-green-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              Activo
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold flex items-center gap-2 border border-rose-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                              Inactivo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openPermisos(r)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Permisos">
                            <Key size={14} />
                          </button>
                          <button onClick={() => openEdit(r)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(r)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition shadow-sm" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
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

      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${notification.type === "success" ? "bg-blue-600" : "bg-red-600"}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalType && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex h-[550px]">
                <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col items-center justify-center border-r border-gray-100 p-8">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-[#040529]"><ShieldCheck size={40} /></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Configuración de Seguridad</p>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-[#040529]">{modalType === "add" ? "Nuevo Rol" : modalType === "edit" ? "Editar Rol" : "Gestión de Permisos"}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                    {modalType === "permisos" ? (
                      <div className="grid grid-cols-2 gap-3">
                        {permisosTotales.map(p => (
                          <label key={p.id_permiso} className={cn("flex items-center justify-between p-3 rounded-xl border transition cursor-pointer", permisosAsignados.includes(p.id_permiso) ? "bg-[#040529]/5 border-[#040529]/20" : "bg-white border-gray-100 hover:bg-gray-50")}>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{p.nombre_permiso}</span>
                            <input type="checkbox" checked={permisosAsignados.includes(p.id_permiso)} onChange={() => togglePermiso(p.id_permiso)} className="h-4 w-4 rounded border-gray-300 text-[#040529] focus:ring-[#040529]/10" />
                          </label>
                        ))}
                      </div>
                    ) : (
                      <form className="space-y-5 font-primary">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del Rol</label>
                          <input
                            type="text"
                            name="nombre_rol"
                            value={modalType === "add" ? addForm.nombre_rol : editForm.nombre_rol}
                            onChange={modalType === "add" ? handleAddChange : handleEditChange}
                            className={cn(
                              "w-full mt-1 px-4 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[#040529]/10 transition",
                              formErrors.nombre_rol ? "border-red-400 bg-red-50" : "border-gray-200"
                            )}
                          />
                          {formErrors.nombre_rol && <p className="text-red-400 text-[11px] mt-1 ml-1">{formErrors.nombre_rol}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción</label>
                          <textarea
                            name="descripcion"
                            value={modalType === "add" ? addForm.descripcion : editForm.descripcion}
                            onChange={modalType === "add" ? handleAddChange : handleEditChange}
                            className={cn(
                              "w-full mt-1 px-4 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[#040529]/10 transition h-24 resize-none",
                              formErrors.descripcion ? "border-red-400 bg-red-50" : "border-gray-200"
                            )}
                          />
                          {formErrors.descripcion && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formErrors.descripcion}</p>}
                        </div>
                        {modalType === "edit" && (
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <input type="checkbox" name="estado" checked={editForm.estado} onChange={handleEditChange} className="h-4 w-4 text-[#040529] rounded focus:ring-[#040529]" />
                            <label className="text-sm font-bold text-[#040529]">Rol Activo</label>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={closeModal} className="px-5 py-2 rounded-xl text-gray-500 hover:text-gray-700 transition font-bold text-xs uppercase tracking-wider">Cerrar</button>
                    {modalType === "add" && <button onClick={saveAdd} className="px-6 py-2 bg-[#040529] text-white rounded-xl shadow-md font-bold text-xs uppercase tracking-wider">Guardar Rol</button>}
                    {modalType === "edit" && <button onClick={saveEdit} className="px-6 py-2 bg-[#040529] text-white rounded-xl shadow-md font-bold text-xs uppercase tracking-wider">Actualizar Rol</button>}
                    {modalType === "permisos" && <button onClick={guardarPermisos} className="px-6 py-2 bg-[#040529] text-white rounded-xl shadow-md font-bold text-xs uppercase tracking-wider flex items-center gap-2"><Save size={14} /> Guardar Permisos</button>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Roles;