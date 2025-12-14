import React, { useState, useEffect } from "react";
import { Layout } from "../../../layout/layout";
import { Plus, X, Eye, Mail, AlertCircle, Trash2, Calendar, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
  obtenerRolesDisponibles,
  obtenerVistaPreviaDestinatarios,
  enviarCorreosMasivos,
  obtenerHistorialEnvios,
  eliminarEnvio
} from "../../services/emailMasivoServices"; // Ajusta el path si es necesario, parece que estaba en "../../services" antes pero la busqueda dio en "pages/services"

export default function EnviarCorreosMasivos() {
  const [roles, setRoles] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalPreview, setModalPreview] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [detalleEnvio, setDetalleEnvio] = useState(null);
  
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [form, setForm] = useState({
    asunto: "",
    mensaje: "",
  });

  const [errores, setErrores] = useState({});

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Cargar roles y historial
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
    setTimeout(() => setNotification({ show: false }), 4000);
  };

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

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!form.asunto.trim() || form.asunto.trim().length < 3) {
      nuevosErrores.asunto = "Asunto debe tener al menos 3 caracteres";
    }

    if (form.asunto.trim().length > 255) {
      nuevosErrores.asunto = "Asunto no puede exceder 255 caracteres";
    }

    if (!form.mensaje.trim() || form.mensaje.trim().length < 10) {
      nuevosErrores.mensaje = "Mensaje debe tener al menos 10 caracteres";
    }

    if (form.mensaje.trim().length > 10000) {
      nuevosErrores.mensaje = "Mensaje no puede exceder 10000 caracteres";
    }

    if (rolesSeleccionados.length === 0) {
      nuevosErrores.roles = "Debes seleccionar al menos un rol";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Obtener vista previa
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

  // Enviar correos
  const handleEnviarCorreos = async () => {
    if (!validarFormulario()) {
      return;
    }

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
        mostrarNotificacion(
          `✓ ${respuesta.data.mensaje}`,
          "success"
        );
        
        // Limpiar formulario y recargar historial
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

  // Eliminar envío
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
    <Layout>
      <section className="dashboard__pages w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Envío Masivo de Correos
                </h2>
                <p className="text-gray-600">
                Gestiona y envía comunicados a tus usuarios
                </p>
            </div>
            <button
                onClick={() => setModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
                <Plus size={20} /> Nuevo Envío
            </button>
          </div>

          {/* Historial de Envíos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={20} /> Historial de Envíos
                </h3>
            </div>
            
            {loadingHistorial ? (
                <div className="p-8 text-center text-gray-500">Cargando historial...</div>
            ) : historial.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No hay envíos registrados aún.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="px-6 py-3 font-medium">Fecha</th>
                                <th className="px-6 py-3 font-medium">Asunto</th>
                                <th className="px-6 py-3 font-medium">Destinatarios</th>
                                <th className="px-6 py-3 font-medium">Total</th>
                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {historial.map((envio) => (
                                <tr key={envio.id_envio} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(envio.fecha_envio).toLocaleDateString()}
                                            <span className="text-xs text-gray-400 ml-1">
                                                {new Date(envio.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {envio.asunto}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Users size={16} className="text-gray-400" />
                                            {envio.roles_destinatarios || "N/A"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {envio.total_destinatarios}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button 
                                            onClick={() => verDetalle(envio)}
                                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition"
                                            title="Ver detalle"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleEliminar(envio.id_envio)}
                                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>

          {/* Notificación */}
          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 200 }}
                className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm z-50 ${
                  notification.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Principal (Nuevo Envío) */}
          <AnimatePresence>
            {modal && (
              <motion.div
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModal(false)}
              >
                <motion.div
                  className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      Crear Envío Masivo
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setModal(false);
                        setErrores({});
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Asunto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asunto *
                      </label>
                      <input
                        type="text"
                        name="asunto"
                        placeholder="Ej: Notificación importante"
                        value={form.asunto}
                        onChange={handleChange}
                        maxLength={255}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          errores.asunto ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      {errores.asunto && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={16} /> {errores.asunto}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {form.asunto.length}/255 caracteres
                      </p>
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        name="mensaje"
                        placeholder="Escribe tu mensaje aquí..."
                        rows="6"
                        value={form.mensaje}
                        onChange={handleChange}
                        maxLength={10000}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
                          errores.mensaje ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                      />
                      {errores.mensaje && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={16} /> {errores.mensaje}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {form.mensaje.length}/10000 caracteres
                      </p>
                    </div>

                    {/* Seleccionar Roles */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Destinatarios por Rol *
                      </label>
                      {errores.roles && (
                        <p className="mb-3 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={16} /> {errores.roles}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map((rol) => (
                          <label
                            key={rol.id_rol}
                            className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                              rolesSeleccionados.some((r) => r.idRol === rol.id_rol)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={rolesSeleccionados.some((r) => r.idRol === rol.id_rol)}
                              onChange={() => handleRoleToggle(rol.id_rol, rol.nombre_rol)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 flex-1">
                              <span className="font-medium text-gray-900">
                                {rol.nombre_rol.charAt(0).toUpperCase() + rol.nombre_rol.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500 block">
                                {rol.cantidad_usuarios} usuario(s)
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="border-t border-gray-200 pt-6 flex gap-3">
                      <button
                        onClick={handleVistaPrevia}
                        disabled={rolesSeleccionados.length === 0 || loadingPreview}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Eye size={18} />
                        {loadingPreview ? "Cargando..." : "Vista Previa"}
                      </button>
                      <button
                        onClick={handleEnviarCorreos}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Mail size={18} />
                        {loading ? "Enviando..." : "Enviar Correos"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Vista Previa */}
          <AnimatePresence>
            {modalPreview && previewData && (
              <motion.div
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalPreview(false)}
              >
                <motion.div
                  className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      Vista Previa de Destinatarios
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setModalPreview(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Total de destinatarios:</strong> {previewData.total}
                      </p>
                    </div>

                    {Object.entries(previewData.porRol).map(([rol, usuarios]) => (
                      <div key={rol} className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                          {rol} ({usuarios.length})
                        </h4>
                        <div className="bg-gray-50 rounded-lg divide-y max-h-64 overflow-y-auto">
                          {usuarios.map((usuario) => (
                            <div
                              key={usuario.id_usuario}
                              className="p-3 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {usuario.nombre_completo}
                                </p>
                                <p className="text-sm text-gray-600">{usuario.correo}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Detalle Historial */}
          <AnimatePresence>
            {modalDetalle && detalleEnvio && (
              <motion.div
                className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalDetalle(false)}
              >
                <motion.div
                  className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      Detalle del Envío
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setModalDetalle(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-sm text-gray-500">Asunto</p>
                            <p className="font-semibold text-lg text-gray-900">{detalleEnvio.asunto}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm text-gray-500">Fecha</p>
                           <p className="text-sm font-medium text-gray-700">
                             {new Date(detalleEnvio.fecha_envio).toLocaleString()}
                           </p>
                        </div>
                    </div>
                    
                    <div className="border-b border-gray-100 pb-4">
                        <p className="text-sm text-gray-500 mb-1">Destinatarios</p>
                        <div className="flex gap-2">
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                {detalleEnvio.roles_destinatarios}
                             </span>
                             <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                                Total: {detalleEnvio.total_destinatarios}
                             </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500 mb-2">Mensaje Enviado</p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap">
                            {detalleEnvio.mensaje}
                        </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
}
