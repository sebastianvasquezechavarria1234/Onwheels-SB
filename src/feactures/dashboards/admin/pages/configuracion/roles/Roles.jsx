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
import { cn, configUi, groupPermissionsByModule, getPermissionMeta } from "../configUi";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permisosTotales, setPermisosTotales] = useState([]);
  const [permisosAsignados, setPermisosAsignados] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'permisos', 'delete'
  const [editForm, setEditForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [addForm, setAddForm] = useState({ nombre_rol: "", descripcion: "", estado: true });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
      const res = await getRoles(); // Fetch all
      setRoles(Array.isArray(res) ? res : (res.data || []));
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
    setSubmitting(false);
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
      setSubmitting(true);
      await updateRole(selected.id_rol, editForm);
      showNotification("Rol actualizado correctamente");
      fetchRoles();
      closeModal();
    } catch (err) {
      const errMsg = err.response?.data?.mensaje || "Error al actualizar el rol";
      showNotification(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const saveAdd = async () => {
    if (!validateRolesForm(addForm)) {
      return;
    }
    try {
      setSubmitting(true);
      await createRole(addForm);
      showNotification("Rol creado correctamente");
      fetchRoles();
      closeModal();
    } catch (err) {
      const errMsg = err.response?.data?.mensaje || "Error al crear el rol";
      showNotification(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (rol) => {
    setSelected(rol);
    setModalType("delete");
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      await deleteRole(selected.id_rol);
      showNotification("Rol eliminado correctamente");
      fetchRoles();
      closeModal();
    } catch (err) {
      // Mostrar el error exacto del backend (ej: "No se pueden eliminar roles oficiales")
      const errMsg = err.response?.data?.mensaje || "Error al eliminar el rol";
      showNotification(errMsg, "error");
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const togglePermiso = (idPermiso) => {
    const permission = permisosTotales.find(p => p.id_permiso === idPermiso);
    if (!permission) return;


    setPermisosAsignados(prev => {
      const isRemoving = prev.includes(idPermiso);
      let next = isRemoving
        ? prev.filter(id => id !== idPermiso)
        : [...prev, idPermiso];

      // Control automático de permisos "ver" ocultos al alternar "gestionar"
      const meta = getPermissionMeta(permission);

      if (meta.action === "gestionar") {
        const verPermiso = permisosTotales.find(p => {
          const pMeta = getPermissionMeta(p);
          return pMeta.action === "ver" && pMeta.moduleKey === meta.moduleKey;
        });

        if (verPermiso) {
          if (!isRemoving && !next.includes(verPermiso.id_permiso)) {
            next.push(verPermiso.id_permiso);
          } else if (isRemoving && next.includes(verPermiso.id_permiso)) {
            next = next.filter(id => id !== verPermiso.id_permiso);
          }
        }
      }
      return next;
    });
  };

  const guardarPermisos = async () => {
    try {
      setSubmitting(true);
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
      setSubmitting(false);
    }
  };

  const filteredRoles = React.useMemo(() => {
    return roles.filter(r => {
      const matchesSearch = r.nombre_rol.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "Todos los roles" ||
        (filterType === "Activos" && r.estado) ||
        (filterType === "Inactivos" && !r.estado);
      return matchesSearch && matchesType;
    });
  }, [roles, search, filterType]);

  const totalFiltered = filteredRoles.length;
  const totalPagesLocal = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const currentItems = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDownload = () => {
    if (!filteredRoles || filteredRoles.length === 0) return;
    const header = ["ID", "Nombre Rol", "Descripcion", "Estado"];
    const csvData = filteredRoles.map(r => [
      r.id_rol,
      `"${r.nombre_rol}"`,
      `"${r.descripcion || ""}"`,
      r.estado ? "Activo" : "Inactivo"
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [header.join(","), ...csvData].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_roles_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredPermissions = (permisosTotales || []).filter(p => {
    const meta = getPermissionMeta(p);
    return meta.action !== "ver";
  });

  const groupedPermissions = groupPermissionsByModule(filteredPermissions);

  return (
    <>
      <div className={configUi.pageShell}>
        {/* --- SECTION 1: HEADER & TOOLBAR --- */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
              Roles
            </h2>
            <span className={configUi.countBadge}>{totalFiltered} roles</span>
          </div>

          <div className={configUi.toolbar}>
            {/* Search Bar */}
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar roles..."
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
              className={configUi.iconButton} title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {/* Create Button */}
            <button
              onClick={() => { setModalType("add"); setFormErrors({}); }}
              className={`${configUi.primaryButton} whitespace-nowrap`}
            >
              <Plus size={18} />
              Crear Rol
            </button>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className={configUi.tableCard}>
          <div className={configUi.tableScroll}>
            <table className={configUi.table}>
              <thead className={configUi.thead}>
                <tr>
                  <th className={`${configUi.th} rounded-tl-[1.4rem] w-[10%]`}>ID</th>
                  <th className={`${configUi.th} w-[25%]`}>Nombre del rol</th>
                  <th className={`${configUi.th} w-[35%]`}>Descripcion</th>
                  <th className={`${configUi.th} text-center w-[15%]`}>Estado</th>
                  <th className={`${configUi.th} rounded-tr-[1.4rem] text-right w-[15%]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className={configUi.emptyState}>Cargando roles...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="5" className={configUi.emptyState}>No se encontraron roles.</td></tr>
                ) : (
                  currentItems.map((r, i) => {
                    const isOfficial = [3, 9, 10, 12].includes(r.id_rol);
                    return (
                      <tr key={r.id_rol} className={configUi.row}>
                        <td className={configUi.td}>#{r.id_rol}</td>
                        <td className={`${configUi.td} font-bold text-[#16315f]`}>{r.nombre_rol}</td>
                        <td className={`${configUi.td} text-[#5b7398]`}>{r.descripcion || "-"}</td>
                        <td className={`${configUi.td}`}>
                          <div className="flex justify-center">
                            {r.estado ? (
                              <span className={configUi.successPill}>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Activo
                              </span>
                            ) : (
                              <span className={configUi.dangerPill}>
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                Inactivo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`${configUi.td} text-right`}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openPermisos(r)}
                              disabled={isOfficial}
                              className={cn(configUi.actionButton, isOfficial && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300")}
                              title={isOfficial ? "Rol protegido del sistema" : "Permisos"}
                            >
                              <Key size={14} />
                            </button>
                            <button
                              onClick={() => openEdit(r)}
                              disabled={isOfficial}
                              className={cn(configUi.actionButton, isOfficial && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300")}
                              title={isOfficial ? "Rol protegido del sistema" : "Editar"}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => confirmDelete(r)}
                              disabled={isOfficial}
                              className={cn(configUi.actionDangerButton, isOfficial && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300")}
                              title={isOfficial ? "Rol protegido del sistema" : "Eliminar"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPagesLocal > 1 && (
            <div className={configUi.paginationBar}>
              <p className="text-sm font-bold text-slate-500">
                Página <span className="text-[#16315f]">{currentPage}</span> de <span className="text-[#16315f]">{totalPagesLocal}</span>
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
                  disabled={currentPage === totalPagesLocal}
                  onClick={() => setCurrentPage((p) => Math.min(totalPagesLocal, p + 1))}
                  className={configUi.paginationButton}
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
        {modalType && modalType !== "delete" && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div
              className={`${configUi.modalPanel} ${modalType === 'permisos' ? 'max-w-2xl' : 'max-w-3xl'}`}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className={modalType === "permisos" ? configUi.modalSplit : configUi.modalSplitCompact}>
                <div className={configUi.modalSide}>
                  <div>
                    <div className={`${configUi.modalSideIcon} mb-5`}><ShieldCheck size={40} /></div>
                    <p className={configUi.modalEyebrow}>Configuracion de seguridad</p>
                    <h4 className="mt-3 text-2xl font-black text-[#16315f]">{modalType === "permisos" ? "Permisos" : "Roles"}</h4>
                    <p className="mt-2 text-sm leading-6 text-[#6b84aa]">Centraliza nombres, descripciones y permisos de cada rol con una distribucion uniforme y clara.</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className={configUi.modalHeader}>
                    <div>
                      <h3 className={configUi.modalTitle}>{modalType === "add" ? "Nuevo rol" : modalType === "edit" ? "Editar rol" : "Gestion de permisos"}</h3>
                      <p className={configUi.modalSubtitle}>{modalType === "permisos" ? `Define los permisos del rol ${selected?.nombre_rol || ""}.` : "Completa los campos obligatorios del rol."}</p>
                    </div>
                    <button onClick={closeModal} className={configUi.modalClose}><X size={20} /></button>
                  </div>
                  <div className={configUi.modalContent}>
                    {modalType === "permisos" ? (
                      <div className="space-y-4">
                        {groupedPermissions.map((group) => (
                          <div key={group.key} className="rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <h4 className="text-sm font-black uppercase tracking-[0.14em] text-[#16315f]">{group.label}</h4>
                                <p className="mt-1 text-xs text-[#6b84aa]">Permisos del mismo modulo agrupados y ordenados.</p>
                              </div>
                              <span className={configUi.subtlePill}>{group.items.length} permisos</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {group.items.map((permission) => {
                                const isActive = permisosAsignados.includes(permission.id_permiso);
                                return (
                                  <button
                                    key={permission.id_permiso}
                                    type="button"
                                    onClick={() => togglePermiso(permission.id_permiso)}
                                    className={cn(
                                      "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition",
                                      isActive
                                        ? "border-[#9fbce7] bg-[#edf5ff]"
                                        : "border-[#d7e5f8] bg-white hover:bg-[#f8fbff]"
                                    )}
                                  >
                                    <div>
                                      <p className="text-sm font-bold text-[#16315f]">{permission.meta.actionLabel}</p>
                                      <p className="mt-0.5 text-xs text-[#6b84aa]">{permission.rawName}</p>
                                    </div>
                                    <span className={cn(
                                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                      isActive ? configUi.toggleTrackOn : configUi.toggleTrackOff
                                    )}>
                                      <span className={cn(configUi.toggleThumb, isActive ? "translate-x-6" : "translate-x-1")} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <form className="space-y-5 font-primary">
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Nombre del rol</label>
                          <input
                            type="text"
                            name="nombre_rol"
                            value={modalType === "add" ? addForm.nombre_rol : editForm.nombre_rol}
                            onChange={modalType === "add" ? handleAddChange : handleEditChange}
                            className={cn(
                              configUi.fieldInput,
                              formErrors.nombre_rol ? "border-red-400 bg-red-50" : "border-gray-200"
                            )}
                          />
                          {formErrors.nombre_rol && <p className="text-red-400 text-[11px] mt-1 ml-1">{formErrors.nombre_rol}</p>}
                        </div>
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Descripcion</label>
                          <textarea
                            name="descripcion"
                            value={modalType === "add" ? addForm.descripcion : editForm.descripcion}
                            onChange={modalType === "add" ? handleAddChange : handleEditChange}
                            className={cn(
                              configUi.fieldTextarea,
                              formErrors.descripcion ? "border-red-400 bg-red-50" : "border-gray-200"
                            )}
                          />
                          {formErrors.descripcion && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formErrors.descripcion}</p>}
                        </div>
                        {modalType === "edit" && (
                          <button
                            type="button"
                            onClick={() => handleEditChange({ target: { name: "estado", type: "checkbox", checked: !editForm.estado } })}
                            className="flex w-full items-center justify-between rounded-2xl border border-[#d7e5f8] bg-[#fbfdff] p-4 text-left"
                          >
                            <div>
                              <p className="text-sm font-bold text-[#16315f]">Rol activo</p>
                              <p className="text-xs text-[#6b84aa]">Controla si el rol puede seguir asignandose.</p>
                            </div>
                            <span className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              editForm.estado ? configUi.toggleTrackOn : configUi.toggleTrackOff
                            )}>
                              <span className={cn(configUi.toggleThumb, editForm.estado ? "translate-x-6" : "translate-x-1")} />
                            </span>
                          </button>
                        )}
                      </form>
                    )}
                  </div>
                  <div className={configUi.modalFooter}>
                    <span className="text-sm text-[#6b84aa]">{modalType === "permisos" ? "Activa o desactiva permisos y guarda para aplicar cambios." : "Los campos obligatorios deben estar completos para guardar."}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>Cerrar</button>
                      {modalType === "add" && <button onClick={saveAdd} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Guardando..." : "Guardar rol"}</button>}
                      {modalType === "edit" && <button onClick={saveEdit} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? "Actualizando..." : "Actualizar rol"}</button>}
                      {modalType === "permisos" && <button onClick={guardarPermisos} disabled={submitting} className={configUi.primarySoftButton}>{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> Guardando...</> : <><Save size={14} /> Guardar permisos</>}</button>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {modalType === "delete" && selected && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div className={`${configUi.modalPanel} max-w-md`} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                  <Trash2 size={32} />
                </div>
                <h3 className="mb-2 text-xl font-black text-[#16315f]">Eliminar rol</h3>
                <p className="mb-6 text-sm leading-6 text-[#6b84aa]">
                  ¿Estas seguro que deseas eliminar el rol <span className="font-bold text-[#16315f]">&quot;{selected.nombre_rol}&quot;</span>? Esta accion no se puede deshacer.
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={closeModal} disabled={loading} className={`${configUi.secondaryButton} min-w-[110px]`}>
                    Cancelar
                  </button>
                  <button onClick={handleDelete} disabled={loading} className={`${configUi.dangerButton} min-w-[110px]`}>
                    {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> : "Eliminar"}
                  </button>
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
