// src/features/dashboards/student/pages/MyClasses.jsx
import React, { useEffect, useState } from "react";
import { Layout } from "../../student/layout/layout";
import { Eye, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";
import { getMisClases } from "../../admin/pages/services/clasesService";

export const MyClasses = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Cargar clases del estudiante autenticado ──────────────────────────────
  useEffect(() => {
    const fetchClases = async () => {
      try {
        setLoading(true);
        const data = await getMisClases();
        setClases(data);
      } catch (err) {
        console.error("Error al cargar clases:", err);
        setError("No se pudieron cargar tus clases.");
      } finally {
        setLoading(false);
      }
    };
    fetchClases();
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openView = (c) => { setSelected({ ...c }); setModalOpen(true); };
  const closeModal = () => { setSelected(null); setModalOpen(false); };

  // Convierte el array de instructores en string legible
  const getNombreInstructor = (instructores) => {
    if (!instructores || instructores.length === 0) return "Sin instructor";
    return instructores.map((i) => i.nombre_instructor).join(", ");
  };

  // Badge de estado de matrícula
  const estadoBadge = (estado) => {
    const estilos = {
      Activa: "bg-green-100 text-green-700",
      Vencida: "bg-yellow-100 text-yellow-700",
      Cancelada: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`inline-flex items-center gap-[5px] px-[12px] py-[5px] rounded-full text-xs font-medium ${estilos[estado] ?? "bg-gray-100 text-gray-600"}`}>
        <span className="w-[8px] h-[8px] block bg-[currentColor] rounded-full" />
        {estado}
      </span>
    );
  };

  return (
    <Layout>
      <section className="relative w-full bg-[var(--gray-bg-body)] side_bar">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-primary sticky top-0 bg-[var(--gray-bg-body)] p-[30px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-secundaria">
            Mis clases
          </h2>
          <BtnLinkIcon
            title="Cotizar nueva clase"
            link="../student/class"
            style="bg-[var(--color-blue)]! text-white pr-[25px] m-[30px] max-md:pr-[15px]"
            styleIcon="bg-white!"
          >
            <Phone className="text-[var(--color-blue)]" strokeWidth={1.5} size={20} />
          </BtnLinkIcon>
        </div>

        <div className="p-[30px]">

          {/* Encabezados de tabla */}
          <article className="font-semibold italic mt-[120px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[10%]">Sede</p>
            <p className="w-[15%]">Dirección</p>
            <p className="w-[10%]">Día</p>
            <p className="w-[15%]">Hora</p>
            <p className="w-[20%]">Instructor</p>
            <p className="w-[15%]">Nivel</p>
            <p className="w-[15%]">Acciones</p>
          </article>

          {/* Estado: cargando */}
          {loading && (
            <p className="text-center text-gray-500 py-16">
              Cargando tus clases...
            </p>
          )}

          {/* Estado: error */}
          {!loading && error && (
            <p className="text-center text-red-500 py-16">{error}</p>
          )}

          {/* Estado: sin clases */}
          {!loading && !error && clases.length === 0 && (
            <p className="text-center text-gray-500 py-16">
              No tienes clases asignadas actualmente.
            </p>
          )}

          {/* Filas de clases */}
          {!loading && !error && clases.map((c) => (
            <article
              key={c.id_clase}
              className="py-[18px] border-b border-black/20 flex items-center"
            >
              <p className="w-[10%] line-clamp-1">{c.nombre_sede ?? "—"}</p>
              <p className="w-[15%] line-clamp-1">{c.direccion_sede ?? "—"}</p>
              <p className="w-[10%] line-clamp-1">{c.dia_semana ?? "—"}</p>
              <p className="w-[15%] line-clamp-1">
                {c.hora_inicio} - {c.hora_fin}
              </p>
              <p className="w-[20%] line-clamp-1">
                {getNombreInstructor(c.instructores)}
              </p>
              <p className="w-[15%]">
                <span className="inline-flex items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-orange-100 text-orange-700">
                  <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full" />
                  {c.nombre_nivel ?? "—"}
                </span>
              </p>
              <div className="w-[15%] flex">
                <motion.span
                  className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => openView(c)}
                >
                  <Eye size={22} strokeWidth={1.3} />
                </motion.span>
              </div>
            </article>
          ))}

        </div>

        {/* ── Modal de detalles ── */}
        <AnimatePresence>
          {modalOpen && selected && (
            <ModalWrapper onClose={closeModal}>
              <h3 className="font-primary text-center mb-[50px]">
                Detalles de la clase
              </h3>

              <div className="grid grid-cols-2 gap-y-[12px] text-sm">
                <p className="font-medium">Sede:</p>
                <p className="text-gray-700">{selected.nombre_sede ?? "—"}</p>

                <p className="font-medium">Dirección:</p>
                <p className="text-gray-700">{selected.direccion_sede ?? "—"}</p>

                <p className="font-medium">Día:</p>
                <p className="text-gray-700">{selected.dia_semana ?? "—"}</p>

                <p className="font-medium">Horario:</p>
                <p className="text-gray-700">
                  {selected.hora_inicio} - {selected.hora_fin}
                </p>

                <p className="font-medium">Nivel:</p>
                <p className="text-gray-700">{selected.nombre_nivel ?? "—"}</p>

                <p className="font-medium">Instructor(es):</p>
                <p className="text-gray-700">
                  {getNombreInstructor(selected.instructores)}
                </p>

                <p className="font-medium">Cupo máximo:</p>
                <p className="text-gray-700">{selected.cupo_maximo ?? "N/A"}</p>

                <p className="font-medium">Estado matrícula:</p>
                <div>{estadoBadge(selected.estado_matricula)}</div>

                {selected.clases_restantes !== null &&
                  selected.clases_restantes !== undefined && (
                    <>
                      <p className="font-medium">Clases restantes:</p>
                      <p className="text-gray-700">{selected.clases_restantes}</p>
                    </>
                  )}

                {selected.descripcion && (
                  <>
                    <p className="font-medium">Descripción:</p>
                    <p className="text-gray-700 col-span-2">
                      {selected.descripcion}
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-[10px] mt-[30px]">
                <button className="btn bg-gray-200" onClick={closeModal}>
                  Cerrar
                </button>
              </div>
            </ModalWrapper>
          )}
        </AnimatePresence>

      </section>
    </Layout>
  );
};

/* === Modal wrapper reutilizable === */
const ModalWrapper = ({ children, onClose }) => (
  <motion.div
    className="modal fixed w-full h-screen top-0 left-0 z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <div className="absolute inset-0" onClick={onClose} />
    <motion.div
      className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px] max-h-[85vh] overflow-y-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      {children}
    </motion.div>
  </motion.div>
);

export default MyClasses;
