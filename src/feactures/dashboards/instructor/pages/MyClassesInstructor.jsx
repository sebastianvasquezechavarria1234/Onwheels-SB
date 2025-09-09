import React, { useEffect, useState } from "react";
import { Layout } from "../../instructor/layout/layout";
import { Eye, Pencil, Trash2 } from "lucide-react";

/**
 * Componente con datos quemados (hardcoded) y modales internos (view / edit / delete).
 * Listo para pegar.
 */

const initialClases = [
  {
    id: 1,
    nombre: "Dibujo Básico",
    descripcion: "Introducción a las bases del dibujo: líneas, formas y proporciones.",
    instructor: "Laura Pérez",
    ubicacion: "Sede Centro",
    horario: "Lun - Mié 6:00pm - 8:00pm",
    estado: "activa",
  },
  {
    id: 2,
    nombre: "Acuarela para Principiantes",
    descripcion: "Técnicas básicas de acuarela y mezcla de pigmentos.",
    instructor: "Carlos Torres",
    ubicacion: "Sede Norte",
    horario: "Mar - Jue 4:00pm - 6:00pm",
    estado: "no activa",
  },
  {
    id: 3,
    nombre: "Perspectiva y Volumen",
    descripcion: "Estudio de perspectiva 1 y teoría del volumen aplicado al dibujo.",
    instructor: "María Gómez",
    ubicacion: "Sede Centro",
    horario: "Sáb 9:00am - 12:00pm",
    estado: "activa",
  },
  {
    id: 4,
    nombre: "Figura Humana Intermedia",
    descripcion: "Anatomía básica aplicada al dibujo de figura humana.",
    instructor: "Sebastián Vásquez",
    ubicacion: "Sede Sur",
    horario: "Vie 5:00pm - 8:00pm",
    estado: "activa",
  },
];

export const MyClassesInstructor = () => {
  const [clases, setClases] = useState(initialClases);
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view' | 'edit' | 'delete' | null

  // cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openView = (c) => { setSelected({ ...c }); setModalType("view"); };
  const openEdit = (c) => { setSelected({ ...c }); setModalType("edit"); };
  const openDelete = (c) => { setSelected({ ...c }); setModalType("delete"); };
  const closeModal = () => { setSelected(null); setModalType(null); };

  const handleSave = (updated) => {
    setClases((prev) => prev.map((p) => (p.id === updated.id ? { ...updated } : p)));
    closeModal();
  };

  const handleDelete = (id) => {
    setClases((prev) => prev.filter((p) => p.id !== id));
    closeModal();
  };

  return (
    <Layout>
      <section className="relative w-full bg-[var(--gray-bg-body)] side_bar">
        <h1 className="sticky top-0 bg-[var(--gray-bg-body)] p-[30px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-secundaria">
          Clases
        </h1>

        <div className="p-[30px]">
          {/* Encabezados */}
          <article className="font-semibold italic  mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[30%]">Nombre de la clase</p>
            <p className="w-[10%]">Instructor</p>
            <p className="w-[15%]">Sede</p>
            <p className="w-[20%]">Horario</p>
            <p className="w-[10%]">Estado</p>
            <p className="w-[15%]">Acciones</p>
          </article>

          {/* Lista de Clases (hardcoded) */}
          {clases.map((element) => (
            <article key={element.id} className="py-[30px] border-b border-black/20 flex items-center">
              <div className="w-[30%]">
                <p className="italic font-semibold line-clamp-1">
                  {element.nombre}
                </p>
                <p className="line-clamp-1 text-sm text-gray-700">
                  {element.descripcion}
                </p>
              </div>

              <p className="w-[10%] line-clamp-1">{element.instructor}</p>
              <p className="w-[15%] line-clamp-1">{element.ubicacion}</p>
              <p className="w-[20%]">{element.horario}</p>

              <div className="w-[10%]">
                <p
                  className={`inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full ${
                    element.estado === "activa"
                      ? "text-green-700! bg-green-100"
                      : "text-gray-700! bg-gray-200"
                  }`}
                >
                  <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                  {element.estado}
                </p>
              </div>

              {/* Acciones icons */}
              <div className="w-[15%] flex gap-[10px] items-center">
                <ActionBtn onClick={() => openView(element)} bg="bg-green-100" color="text-green-700" title="Ver">
                  <Eye size={22} strokeWidth={1.3} />
                </ActionBtn>

                <ActionBtn onClick={() => openEdit(element)} bg="bg-blue-100" color="text-blue-700" title="Editar">
                  <Pencil size={22} strokeWidth={1.3} />
                </ActionBtn>

                <ActionBtn onClick={() => openDelete(element)} bg="bg-red-100" color="text-red-700" title="Eliminar">
                  <Trash2 size={22} strokeWidth={1.3} />
                </ActionBtn>
              </div>
            </article>
          ))}
        </div>

        {/* Modales */}
        {modalType === "view" && selected && (
          <ViewModal clase={selected} onClose={closeModal} />
        )}

        {modalType === "edit" && selected && (
          <EditModal clase={selected} onClose={closeModal} onSave={handleSave} />
        )}

        {modalType === "delete" && selected && (
          <ConfirmDelete clase={selected} onClose={closeModal} onConfirm={() => handleDelete(selected.id)} />
        )}
      </section>
    </Layout>
  );
};

/* ---------- Action button pequeño ---------- */
const ActionBtn = ({ children, onClick, bg = "bg-gray-100", color = "text-gray-700", title }) => (
  <span
    className={`${bg} ${color} w-[45px] h-[45px] flex justify-center items-center rounded-[18px] cursor-pointer border border-black/5 shadow-md hover:scale-[1.25] transition-transform`}
    style={{ transitionDuration: "450ms", transitionTimingFunction: "cubic-bezier(0.3, 1.8, 0.4, 1)" }}
    onClick={onClick}
    title={title}
  >
    {children}
  </span>
);

/* ---------- View Modal ---------- */
const ViewModal = ({ clase, onClose }) => {
  if (!clase) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white p-6 rounded-lg w-[90%] max-w-[700px]">
        <h3 className="text-xl font-semibold mb-3">{clase.nombre}</h3>
        <p className="mb-1"><strong>Instructor:</strong> {clase.instructor}</p>
        <p className="mb-1"><strong>Sede:</strong> {clase.ubicacion}</p>
        <p className="mb-1"><strong>Horario:</strong> {clase.horario}</p>
        <p className="mb-3 text-sm text-gray-700">{clase.descripcion}</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Edit Modal ---------- */
const EditModal = ({ clase, onClose, onSave }) => {
  const [form, setForm] = useState({ id: null, nombre: "", descripcion: "", instructor: "", ubicacion: "", horario: "", estado: "" });

  useEffect(() => {
    if (clase) setForm({ ...clase });
  }, [clase]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.instructor) {
      alert("Nombre e instructor son requeridos.");
      return;
    }
    onSave({ ...form });
  };

  if (!clase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form className="relative z-10 bg-white p-6 rounded-lg w-[90%] max-w-[700px]" onSubmit={handleSubmit}>
        <h3 className="text-xl font-semibold mb-3">Editar clase</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Instructor</label>
            <input name="instructor" value={form.instructor} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border p-2 rounded" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm">Sede</label>
            <input name="ubicacion" value={form.ubicacion} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Horario</label>
            <input name="horario" value={form.horario} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Selecciona</option>
            <option value="activa">activa</option>
            <option value="no activa">no activa</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
        </div>
      </form>
    </div>
  );
};

/* ---------- Confirm Delete ---------- */
const ConfirmDelete = ({ clase, onClose, onConfirm }) => {
  if (!clase) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white p-6 rounded-lg w-[90%] max-w-[480px]">
        <h3 className="text-lg font-semibold mb-3">Confirmar eliminación</h3>
        <p className="mb-4">¿Eliminar la clase <strong>{clase.nombre}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default MyClassesInstructor;
