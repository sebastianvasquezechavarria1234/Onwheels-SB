// src/feactures/dashboards/admin/pages/eventos/correos/CorreosMasivos.jsx
import React, { useState, useEffect } from "react";
import { Plus, X, Eye, Mail, AlertCircle, Trash2, Calendar, Users, FileText, Send } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
  obtenerRolesDisponibles,
  obtenerVistaPreviaDestinatarios,
  enviarCorreosMasivos,
  obtenerHistorialEnvios,
  eliminarEnvio
} from "../../services/emailMasivoServices";

export default function EnviarCorreosMasivos() {
  const [roles, setRoles] = useState([]);
  const [historial, setHistorial] = useState([]);
  
  // Modal states
  const [modal, setModal] = useState(false); // New Email Modal
  const [modalPreview, setModalPreview] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  
  // Selection states
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [detalleEnvio, setDetalleEnvio] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Form
  const [form, setForm] = useState({
    asunto: "",
    mensaje: "",
  });
  const [errores, setErrores] = useState({});

  // Notification
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Load initial data
  useEffect(() => {
    cargarRoles();
    cargarHistorial();
  }, []);

  const cargarRoles = async () => {
    try {
      const respuesta = await obtenerRolesDisponibles();
      if (respuesta.success) {
        setRoles(respuesta.data);
      }
    } catch (err) {
      mostrarNotificacion("Error cargando roles", "error");
    }
  };

  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const respuesta = await obtenerHistorialEnvios();
      if (respuesta.success) {
        setHistorial(respuesta.data);
      }
    } catch (err) {
      console.error(err);
      mostrarNotificacion("Error cargando historial", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const mostrarNotificacion = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleToggle = (idRol, nombreRol) => {
    setRolesSeleccionados((prev) => {
      const existe = prev.some((r) => r.idRol === idRol);
      if (existe) {
        return prev.filter((r) => r.idRol !== idRol);
      } else {
        return [...prev, { idRol, nombreRol }];
      }
    });
    if (errores.roles) {
      setErrores((prev) => ({ ...prev, roles: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.asunto.trim() || form.asunto.trim().length < 3) {
      nuevosErrores.asunto = "Asunto debe tener al menos 3 caracteres";
    } else if (form.asunto.trim().length > 255) {
      nuevosErrores.asunto = "Asunto no puede exceder 255 caracteres";
    }

    if (!form.mensaje.trim() || form.mensaje.trim().length < 10) {
      nuevosErrores.mensaje = "Mensaje debe tener al menos 10 caracteres";
    } else if (form.mensaje.trim().length > 10000) {
      nuevosErrores.mensaje = "Mensaje no puede exceder 10000 caracteres";
    }

    if (rolesSeleccionados.length === 0) {
      nuevosErrores.roles = "Debes seleccionar al menos un rol";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Actions
  const handleVistaPrevia = async () => {
    if (rolesSeleccionados.length === 0) {
      mostrarNotificacion("Selecciona al menos un rol", "error");
      return;
    }

    setLoadingPreview(true);
    try {
      const idsRoles = rolesSeleccionados.map((r) => r.idRol);
      const respuesta = await obtenerVistaPreviaDestinatarios(idsRoles);

      if (respuesta.success) {
        setPreviewData(respuesta);
        setModalPreview(true);
      }
    } catch (err) {
      const mensaje = err.response?.data?.msg || "Error obteniendo vista previa";
      mostrarNotificacion(mensaje, "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleEnviarCorreos = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const idsRoles = rolesSeleccionados.map((r) => r.idRol);
      const rolesNombres = rolesSeleccionados.map((r) => r.nombreRol);

      const respuesta = await enviarCorreosMasivos(
        form.asunto,
        form.mensaje,
        idsRoles,
        rolesNombres
      );

      if (respuesta.success) {
        mostrarNotificacion(`✓ ${respuesta.data.mensaje}`, "success");
        setForm({ asunto: "", mensaje: "" });
        setRolesSeleccionados([]);
        setModal(false);
        setErrores({});
        cargarHistorial();
      }
    } catch (err) {
      const erroresBackend = err.response?.data?.errores;
      if (erroresBackend && Array.isArray(erroresBackend)) {
        setErrores({ backend: erroresBackend.join(", ") });
        mostrarNotificacion(erroresBackend[0], "error");
      } else {
        const mensaje = err.response?.data?.msg || "Error enviando correos";
        mostrarNotificacion(mensaje, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (idEnvio) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro del historial?")) return;

    try {
      await eliminarEnvio(idEnvio);
      mostrarNotificacion("Registro eliminado", "success");
      cargarHistorial();
    } catch (error) {
      mostrarNotificacion("Error al eliminar", "error");
    }
  };

  const verDetalle = (envio) => {
    setDetalleEnvio(envio);
    setModalDetalle(true);
  };

  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    Envío Masivo de Correos
                </h2>
                <p className="text-gray-500 text-sm mt-1">Gestiona comunicados para tus usuarios</p>
            </div>
            
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} /> Nuevo Envío
            </button>
          </div>

          {/* Historial Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Asunto</th>
                    <th className="px-6 py-3">Destinatarios</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingHistorial ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 italic">Cargando historial...</td>
                    </tr>
                  ) : historial.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500 italic">No hay envíos registrados aún.</td>
                    </tr>
                  ) : (
                    historial.map((envio) => (
                      <tr key={envio.id_envio} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-900">
                                {new Date(envio.fecha_envio).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(envio.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {envio.asunto}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {envio.roles_destinatarios?.split(',').map((rol, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {rol.trim()}
                                </span>
                            )) || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                             <Users size={12} className="mr-1"/> {envio.total_destinatarios}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => verDetalle(envio)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Ver detalle"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEliminar(envio.id_envio)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Eliminar registro"
                            >
                              <Trash2 size={16} />
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

          {/* Toast Notification */}
          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
                  }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Create Email */}
          <AnimatePresence>
            {modal && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModal(false)}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                   <button
                    onClick={() => {
                        setModal(false);
                        setErrores({});
                      }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>

                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Mail className="text-blue-600" /> Crear Envío Masivo
                  </h3>

                  <div className="space-y-5">
                    {/* Asunto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asunto *
                      </label>
                      <input
                        type="text"
                        name="asunto"
                        placeholder="Ej: Notificación importante"
                        value={form.asunto}
                        onChange={handleChange}
                        maxLength={255}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition ${errores.asunto ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errores.asunto && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} /> {errores.asunto}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-right text-gray-400">
                        {form.asunto.length}/255
                      </p>
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje *
                      </label>
                      <textarea
                        name="mensaje"
                        placeholder="Escribe tu mensaje aquí..."
                        rows="6"
                        value={form.mensaje}
                        onChange={handleChange}
                        maxLength={10000}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition resize-none ${errores.mensaje ? "border-red-500" : "border-gray-300"
                          }`}
                      />
                      {errores.mensaje && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} /> {errores.mensaje}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-right text-gray-400">
                        {form.mensaje.length}/10000
                      </p>
                    </div>

                    {/* Roles */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destinatarios por Rol *
                      </label>
                      {errores.roles && (
                        <p className="mb-2 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={12} /> {errores.roles}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map((rol) => (
                          <label
                            key={rol.id_rol}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition hover:bg-gray-50 ${rolesSeleccionados.some((r) => r.idRol === rol.id_rol)
                                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                : "border-gray-200"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={rolesSeleccionados.some((r) => r.idRol === rol.id_rol)}
                              onChange={() => handleRoleToggle(rol.id_rol, rol.nombre_rol)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 flex-1">
                              <span className="block text-sm font-semibold text-gray-900 capitalize">
                                {rol.nombre_rol}
                              </span>
                              <span className="block text-xs text-gray-500">
                                {rol.cantidad_usuarios} usuarios
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={handleVistaPrevia}
                        disabled={rolesSeleccionados.length === 0 || loadingPreview}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                        <Eye size={18} />
                        {loadingPreview ? "Cargando..." : "Vista Previa"}
                      </button>
                      <button
                        onClick={handleEnviarCorreos}
                        disabled={loading}
                        className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                      >
                         {loading ? "Enviando..." : (
                            <>
                                <Send size={18} /> Enviar Correos
                            </>
                         )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Preview */}
          <AnimatePresence>
            {modalPreview && previewData && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalPreview(false)}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setModalPreview(false)}
                  >
                    <X size={20} />
                  </button>

                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Vista Previa de Destinatarios
                  </h3>

                  <div className="grid gap-6">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 text-blue-800">
                      <Users size={20} />
                      <span className="font-semibold">Total: {previewData.total} destinatarios</span>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(previewData.porRol).map(([rol, usuarios]) => (
                        <div key={rol}>
                            <h4 className="font-bold text-gray-700 mb-3 capitalize flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {rol} <span className="text-gray-400 font-normal">({usuarios.length})</span>
                            </h4>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto">
                            {usuarios.map((usuario) => (
                                <div
                                key={usuario.id_usuario}
                                className="p-3 flex items-center justify-between hover:bg-white transition"
                                >
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                    {usuario.nombre_completo}
                                    </p>
                                    <p className="text-xs text-gray-500">{usuario.correo}</p>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                     <button
                        onClick={() => setModalPreview(false)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                      >
                        Cerrar Vista Previa
                      </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Detail */}
          <AnimatePresence>
            {modalDetalle && detalleEnvio && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalDetalle(false)}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setModalDetalle(false)}
                  >
                    <X size={20} />
                  </button>

                  <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                    Detalle del Envío
                  </h3>

                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Asunto</p>
                          <p className="text-lg font-bold text-gray-900">{detalleEnvio.asunto}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Fecha</p>
                          <p className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            {new Date(detalleEnvio.fecha_envio).toLocaleString()}
                          </p>
                       </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Destinatarios</p>
                      <div className="flex flex-wrap gap-2">
                         {detalleEnvio.roles_destinatarios?.split(',').map((rol, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium border border-blue-100">
                                {rol.trim()}
                            </span>
                         ))}
                         <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium border border-gray-200">
                           Total: {detalleEnvio.total_destinatarios}
                         </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Mensaje</p>
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                        {detalleEnvio.mensaje}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-8">
                     <button
                        onClick={() => setModalDetalle(false)}
                        className="px-8 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                      >
                        Cerrar
                      </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
