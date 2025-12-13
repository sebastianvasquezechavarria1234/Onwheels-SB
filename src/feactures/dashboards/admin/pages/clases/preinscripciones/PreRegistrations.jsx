// src/features/dashboards/admin/pages/clases/preinscripciones/PreinscripcionesAdmin.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Eye, Check, X, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getPreinscripcionesPendientes,
  rechazarPreinscripcion,
  aceptarPreinscripcionYCrearMatricula
} from "../../services/preinscripcionesService";

import axios from "axios";

const PreinscripcionesAdmin = () => {
  const [preinscripciones, setPreinscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Datos para el modal de matrícula
  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [fechaMatricula, setFechaMatricula] = useState(new Date().toISOString().split('T')[0]);

  const [modal, setModal] = useState(null); // "details" | "matricula" | "rechazar"
  const [selectedPreinscripcion, setSelectedPreinscripcion] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Cargar preinscripciones pendientes y datos para matrícula
  const fetchPreinscripciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [preinscripcionesData, clasesData, planesData] = await Promise.all([
        getPreinscripcionesPendientes(),
        axios.get("http://localhost:3000/api/clases").then(r => r.data),
        axios.get("http://localhost:3000/api/planes").then(r => r.data)
      ]);
      setPreinscripciones(Array.isArray(preinscripcionesData) ? preinscripcionesData : []);
      setClases(Array.isArray(clasesData) ? clasesData : []);
      setPlanes(Array.isArray(planesData) ? planesData : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreinscripciones();
  }, [fetchPreinscripciones]);

  // Abrir modal
  const openModal = (type, preinscripcion = null) => {
    setModal(type);
    setSelectedPreinscripcion(preinscripcion);
    if (type === "matricula") {
      setClaseSeleccionada("");
      setPlanSeleccionado("");
      setFechaMatricula(new Date().toISOString().split('T')[0]);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedPreinscripcion(null);
  };

  // Rechazar preinscripción
  const handleRechazar = async () => {
    try {
      await rechazarPreinscripcion(selectedPreinscripcion.id_estudiante);
      await fetchPreinscripciones();
      showNotification("Preinscripción rechazada correctamente");
      closeModal();
    } catch (err) {
      console.error("Error rechazando preinscripción:", err);
      const errorMessage = err.response?.data?.mensaje || "Error rechazando preinscripción";
      showNotification(errorMessage, "error");
    }
  };

  // Aceptar preinscripción y crear matrícula
  const handleAceptarYMatricular = async () => {
    try {
      if (!claseSeleccionada || !planSeleccionado) {
        showNotification("Debes seleccionar clase y plan", "error");
        return;
      }

      const matriculaData = {
        id_clase: parseInt(claseSeleccionada),
        id_plan: parseInt(planSeleccionado),
        fecha_matricula: fechaMatricula,
      };

      await aceptarPreinscripcionYCrearMatricula(selectedPreinscripcion.id_estudiante, matriculaData);
      
      await fetchPreinscripciones();
      showNotification("Preinscripción aceptada y matrícula creada correctamente");
      closeModal();
      
    } catch (err) {
      console.error("Error aceptando preinscripción:", err);
      const errorMessage = err.response?.data?.mensaje || "Error al aceptar preinscripción";
      showNotification(errorMessage, "error");
    }
  };

  // Filtrado por búsqueda
  const preinscripcionesFiltradas = preinscripciones.filter((p) =>
    (p.nombre_completo || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.documento || "").includes(search) ||
    (p.nivel_experiencia || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.enfermedad || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.nombre_acudiente || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Preinscripciones</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar preinscripciones (Nombre, Email, Documento, Enfermedad)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[15%]">Estudiante</th>
                    <th className="px-6 py-3 w-[15%]">Email</th>
                    <th className="px-6 py-3 w-[8%]">Edad</th>
                    <th className="px-6 py-3 w-[12%]">Nivel Experiencia</th>
                    <th className="px-6 py-3 w-[10%]">Documento</th>
                    <th className="px-6 py-3 w-[15%]">Enfermedad</th>
                    <th className="px-6 py-3 w-[15%]">Acudiente</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        Cargando preinscripciones...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : preinscripcionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500 italic">
                        No hay preinscripciones pendientes.
                      </td>
                    </tr>
                  ) : (
                    preinscripcionesFiltradas.map((p) => (
                      <tr key={p.id_estudiante} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">
                          <div className="text-sm font-medium">{p.nombre_completo}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.email}</td>
                        <td className="px-6 py-4 text-gray-600">{p.edad || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{p.nivel_experiencia || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{p.documento || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{p.enfermedad || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {p.nombre_acudiente ? `${p.nombre_acudiente} (${p.telefono_acudiente || "—"})` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("details", p)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("matricula", p)}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                              title="Aceptar y crear matrícula"
                            >
                              <Check size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("rechazar", p)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Rechazar preinscripción"
                            >
                              <X size={16} />
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
        </div>

        {/* Notificación Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${
                notification.type === "success" ? "bg-blue-600" : "bg-red-600"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        <AnimatePresence>
          {modal === "details" && selectedPreinscripcion && (
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
                  Detalles de Preinscripción
                </h3>

                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Nombre Completo:</span>
                    <span className="text-right">{selectedPreinscripcion.nombre_completo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-right">{selectedPreinscripcion.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Documento:</span>
                    <span className="text-right">{selectedPreinscripcion.documento || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Teléfono:</span>
                    <span className="text-right">{selectedPreinscripcion.telefono || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Edad:</span>
                    <span className="text-right">{selectedPreinscripcion.edad || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Nivel Experiencia:</span>
                    <span className="text-right">{selectedPreinscripcion.nivel_experiencia || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Enfermedad:</span>
                    <span className="text-right">{selectedPreinscripcion.enfermedad || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Fecha Preinscripción:</span>
                    <span className="text-right">
                      {selectedPreinscripcion.fecha_preinscripcion 
                        ? new Date(selectedPreinscripcion.fecha_preinscripcion).toLocaleDateString('es-ES')
                        : "—"
                      }
                    </span>
                  </div>
                  {selectedPreinscripcion.nombre_acudiente && (
                    <>
                      <div className="border-t pt-3">
                        <h4 className="font-medium text-gray-800 mb-2">Información del Acudiente</h4>
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">Nombre:</span> {selectedPreinscripcion.nombre_acudiente}</div>
                          {selectedPreinscripcion.telefono_acudiente && (
                            <div><span className="font-medium">Teléfono:</span> {selectedPreinscripcion.telefono_acudiente}</div>
                          )}
                          {selectedPreinscripcion.email_acudiente && (
                            <div><span className="font-medium">Email:</span> {selectedPreinscripcion.email_acudiente}</div>
                          )}
                          {selectedPreinscripcion.relacion && (
                            <div><span className="font-medium">Relación:</span> {selectedPreinscripcion.relacion}</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Estado:</span>
                    <span className="text-right">
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        Pendiente
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {modal === "rechazar" && selectedPreinscripcion && (
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

                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Rechazar Preinscripción
                </h3>

                <p className="text-gray-700 text-center mb-6">
                  ¿Estás seguro de rechazar la preinscripción de{" "}
                  <span className="font-bold text-red-600">{selectedPreinscripcion.nombre_completo}</span>?
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRechazar}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Rechazar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {modal === "matricula" && selectedPreinscripcion && (
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

                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Crear Matrícula
                </h3>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Estudiante:</strong> {selectedPreinscripcion.nombre_completo}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Email:</strong> {selectedPreinscripcion.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clase
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={claseSeleccionada}
                      onChange={(e) => setClaseSeleccionada(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar clase</option>
                      {clases.map(clase => (
                        <option key={clase.id_clase} value={clase.id_clase}>
                          {clase.nombre_nivel} - {clase.dia_semana} {clase.hora_inicio} ({clase.nombre_sede})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={planSeleccionado}
                      onChange={(e) => setPlanSeleccionado(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar plan</option>
                      {planes.map(plan => (
                        <option key={plan.id_plan} value={plan.id_plan}>
                          {plan.nombre_plan} - ${plan.precio}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de matrícula
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={fechaMatricula}
                      onChange={(e) => setFechaMatricula(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAceptarYMatricular}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Aceptar y Matricular
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default PreinscripcionesAdmin;