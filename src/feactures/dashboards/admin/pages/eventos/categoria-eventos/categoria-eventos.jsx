import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search, Plus, Pen, Trash2, Eye, X, Tag, Hash, ArrowUpDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCategoriasEventos as getCategorias,
  createCategoriaEvento as createCategoria,
  updateCategoriaEvento as updateCategoria,
  deleteCategoriaEvento as deleteCategoria,
} from "../../services/EventCategory";
import { configUi, cn } from "../../configuracion/configUi";
import ModalErrorAlert from "../../configuracion/ModalErrorAlert";

export default function CategoriaEventos() {
  // Data
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Aumentado para mayor densidad
  
  // Sorting
  const [sortField, setSortField] = useState("nombre_categoria");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal & selection
  const [modal, setModal] = useState(null); // crear | editar | ver | eliminar
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form
  const [form, setForm] = useState({ nombre_categoria: "", descripcion: "" });

  // Validation
  const [formErrors, setFormErrors] = useState({});

  // Notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Field validation
  const validateField = (name, value) => {
    let error = "";

    if (name === "nombre_categoria") {
      if (!value || !value.trim()) error = "El nombre es obligatorio";
      else if (value.trim().length < 3) error = "Mínimo 3 caracteres";
      else if (value.trim().length > 50) error = "Máximo 50 caracteres";
    }

    if (name === "descripcion" && value) {
        if (value.length > 200) error = "Máximo 200 caracteres";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateAll = () => {
    const ok1 = validateField("nombre_categoria", form.nombre_categoria);
    const ok2 = validateField("descripcion", form.descripcion);
    return ok1 && ok2;
  };

  // Fetch categories
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data || []);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      showNotification("Error cargando categorías", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Modal handlers
  const openModal = (type, categoria = null) => {
    setModal(type);
    setSelected(categoria);
    setSubmitting(false);
    setModalError(null);

    setForm(
      categoria
        ? {
          nombre_categoria: categoria.nombre_categoria || "",
          descripcion: categoria.descripcion || "",
        }
        : { nombre_categoria: "", descripcion: "" }
    );

    setFormErrors({});
  };

  const closeModal = () => {
    if (submitting) return;
    setModal(null);
    setSelected(null);
    setModalError(null);
    setForm({ nombre_categoria: "", descripcion: "" });
    setFormErrors({});
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // Save data
  const handleSave = async () => {
    if (!validateAll()) {
      showNotification("Corrige los errores del formulario", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      nombre_categoria: form.nombre_categoria.trim(),
      descripcion: form.descripcion.trim() || null,
    };

    try {
      if (modal === "crear") {
        await createCategoria(payload);
        showNotification("Categoría creada con éxito");
      } else if (modal === "editar" && selected) {
        await updateCategoria(selected.id_categoria_evento, payload);
        showNotification("Categoría actualizada");
      }

      await fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error guardando:", err);
      showNotification("Error guardando la categoría", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    setModalError(null);
    try {
      await deleteCategoria(selected.id_categoria_evento);
      showNotification("Categoría eliminada con éxito", "success");
      await fetchAll();
      closeModal();
    } catch (err) {
      console.error("Error eliminando categoría:", err);
      const errorMessage =
        err.response?.data?.mensaje ||
        err.response?.data?.msg ||
        "Se produjo un error al intentar eliminar la categoría.";

      setModalError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter + Sort + Pagination
  const filteredAndSorted = useMemo(() => {
    let result = [...categorias];
    
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(c =>
        c.nombre_categoria.toLowerCase().includes(q) ||
        (c.descripcion || "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return result;
  }, [categorias, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const currentItems = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className={configUi.pageShell}>
      {/* 1. HEADER */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Categorías de Eventos</h2>
          <span className={configUi.countBadge}>
            <Hash className="mr-1 h-3 w-3" />
            {filteredAndSorted.length} registros
          </span>
        </div>

        <div className={configUi.toolbar}>
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86a0c6]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar categoría..."
              className={configUi.inputWithIcon}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86a0c6] hover:text-[#16315f]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={() => openModal("crear")} className={configUi.primaryButton}>
            <Plus size={18} />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* 2. TABLE AREA */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
            <thead className={configUi.thead}>
              <tr>
                <th className={cn(configUi.th, "w-[30%] pl-5")}>
                  <button onClick={() => toggleSort("nombre_categoria")} className="flex items-center gap-2">
                    Nombre
                    {sortField === "nombre_categoria" && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </th>
                <th className={cn(configUi.th, "w-[55%]")}>Descripción</th>
                <th className={cn(configUi.th, "w-[15%] pr-5 text-right")}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className={configUi.emptyState}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#223a63] border-t-transparent" />
                      <span>Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="3" className={configUi.emptyState}>No se encontraron categorías.</td>
                </tr>
              ) : (
                currentItems.map((c) => (
                  <tr key={c.id_categoria_evento} className={configUi.row}>
                    <td className={cn(configUi.td, "pl-5 font-bold text-[#16315f]")}>
                      {c.nombre_categoria}
                    </td>
                    <td className={cn(configUi.td, "text-[#5b7398]")}>
                      {c.descripcion || "—"}
                    </td>
                    <td className={cn(configUi.td, "pr-5 text-right")}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal("ver", c)}
                          className={configUi.actionButton}
                          title="Ver detalles"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openModal("editar", c)}
                          className={configUi.actionButton}
                          title="Editar"
                        >
                          <Pen size={14} />
                        </button>
                        <button
                          onClick={() => openModal("eliminar", c)}
                          className={configUi.actionDangerButton}
                          title="Eliminar"
                        >
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

        {/* PAGINATION */}
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

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={cn(
                "fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-white font-medium",
                notification.type === "success" ? "bg-blue-600" : "bg-red-600"
            )}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALES */}
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
              className={cn(configUi.modalPanel, modal === "eliminar" ? "max-w-md" : "max-w-xl", "max-h-[92vh] flex flex-col")}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className={configUi.modalHeader}>
                  <div>
                    <h3 className={configUi.modalTitle}>
                      {modal === "crear" ? "Nueva Categoría" : 
                       modal === "editar" ? "Editar Categoría" : 
                       modal === "ver" ? "Detalles de la Categoría" : "Eliminar Categoría"}
                    </h3>
                    <p className={configUi.modalSubtitle}>
                      {modal === "eliminar" ? "Seleccione con cuidado antes de confirmar." : "Complete la información requerida."}
                    </p>
                  </div>
                  <button onClick={closeModal} className={configUi.modalClose} disabled={submitting}>
                    <X size={20} />
                  </button>
                </div>

                <div className={configUi.modalContent}>
                  {modal === "eliminar" ? (
                    <div className="py-4 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f3] text-[#d44966]">
                        <Trash2 size={30} />
                      </div>
                      <h3 className="mb-2 text-xl font-black text-[#16315f]">Confirmar Eliminación</h3>
                      <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#6b84aa]">
                        ¿Estás seguro de que deseas eliminar la categoría <span className="font-bold text-[#d44966]">{selected?.nombre_categoria}</span>?
                        <br />Esta operación no se puede deshacer y fallará si hay eventos asociados.
                      </p>

                      <ModalErrorAlert error={modalError} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Nombre *</label>
                        <input
                          name="nombre_categoria"
                          value={form.nombre_categoria}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          readOnly={modal === "ver"}
                          disabled={modal === "ver" || submitting}
                          placeholder="Ej: Conferencias Académicas"
                          className={cn(configUi.fieldInput, formErrors.nombre_categoria && "border-red-500")}
                        />
                        {formErrors.nombre_categoria && (
                          <p className="mt-1 text-xs font-bold text-red-500">{formErrors.nombre_categoria}</p>
                        )}
                      </div>

                      <div className={configUi.fieldGroup}>
                        <label className={configUi.fieldLabel}>Descripción</label>
                        <textarea
                          name="descripcion"
                          value={form.descripcion}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          readOnly={modal === "ver"}
                          disabled={modal === "ver" || submitting}
                          placeholder="Breve descripción..."
                          rows={4}
                          className={cn(configUi.fieldTextarea, formErrors.descripcion && "border-red-500")}
                        />
                        {formErrors.descripcion && (
                          <p className="mt-1 text-xs font-bold text-red-500">{formErrors.descripcion}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className={configUi.modalFooter}>
                  <span className="text-xs text-[#6b84aa]">
                    {modal === "ver" ? "Vista de solo lectura." : "Los cambios se guardarán permanentemente."}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={closeModal} disabled={submitting} className={configUi.secondaryButton}>
                      {modal === "ver" ? "Cerrar" : "Cancelar"}
                    </button>
                    {modal === "crear" && (
                      <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>
                        {submitting ? "Guardando..." : "Guardar"}
                      </button>
                    )}
                    {modal === "editar" && (
                      <button onClick={handleSave} disabled={submitting} className={configUi.primarySoftButton}>
                        {submitting ? "Actualizando..." : "Actualizar"}
                      </button>
                    )}
                    {modal === "eliminar" && !modalError && (
                      <button onClick={handleDelete} disabled={submitting} className={configUi.dangerButton}>
                        {submitting ? "Eliminando..." : "Eliminar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
