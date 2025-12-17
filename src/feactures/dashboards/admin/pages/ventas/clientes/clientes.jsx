// src/features/dashboards/admin/pages/clientes/Clientes.jsx
import React, { useEffect, useState, useCallback } from "react";

import { Eye, Plus, Search, Pencil, Trash2, X, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getUsuariosSinCliente
} from "../../services/clientesServices";

export const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [usuariosSinCliente, setUsuariosSinCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    id_usuario: "",
    direccion_envio: "",
    telefono_contacto: "",
    metodo_pago: ""
  });
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setError("Error al cargar los datos.");
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsuariosSinCliente = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      const data = await getUsuariosSinCliente();
      if (!Array.isArray(data)) {
        throw new Error("Respuesta inválida del servidor");
      }
      setUsuariosSinCliente(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      showNotification("Error al cargar usuarios. Revisa la consola.", "error");
      setUsuariosSinCliente([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (type, cliente = null) => {
    setModalType(type);
    setSelectedCliente(cliente);
    if (type === "add") {
      setFormData({
        id_usuario: "",
        direccion_envio: "",
        telefono_contacto: "",
        metodo_pago: ""
      });
      fetchUsuariosSinCliente(); // Cargar usuarios al abrir modal
    } else if (type === "edit" && cliente) {
      setFormData({
        id_usuario: cliente.id_usuario,
        direccion_envio: cliente.direccion_envio || "",
        telefono_contacto: cliente.telefono_contacto || "",
        metodo_pago: cliente.metodo_pago || ""
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCliente(null);
    setFormData({
      id_usuario: "",
      direccion_envio: "",
      telefono_contacto: "",
      metodo_pago: ""
    });
    setUsuariosSinCliente([]); // Limpiar lista al cerrar
  };

  const handleCreate = async () => {
    try {
      if (!formData.id_usuario) {
        showNotification("Debes seleccionar un usuario", "error");
        return;
      }
      if (!formData.direccion_envio.trim()) {
        showNotification("La dirección de envío es obligatoria", "error");
        return;
      }

      await createCliente({
        id_usuario: formData.id_usuario,
        direccion_envio: formData.direccion_envio,
        telefono_contacto: formData.telefono_contacto || undefined,
        metodo_pago: formData.metodo_pago || undefined
      });

      await fetchClientes();
      closeModal();
      showNotification("Cliente creado con éxito");
    } catch (err) {
      console.error("Error creando cliente:", err);
      const errorMessage = err.response?.data?.mensaje || "Error creando cliente";
      showNotification(errorMessage, "error");
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedCliente) return;
      if (!formData.direccion_envio.trim()) {
        showNotification("La dirección de envío es obligatoria", "error");
        return;
      }

      await updateCliente(selectedCliente.id_cliente, {
        direccion_envio: formData.direccion_envio,
        telefono_contacto: formData.telefono_contacto || undefined,
        metodo_pago: formData.metodo_pago || undefined
      });

      await fetchClientes();
      closeModal();
      showNotification("Cliente actualizado con éxito");
    } catch (err) {
      console.error("Error editando cliente:", err);
      const errorMessage = err.response?.data?.mensaje || "Error editando cliente";
      showNotification(errorMessage, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedCliente) return;
      await deleteCliente(selectedCliente.id_cliente);
      await fetchClientes();
      closeModal();
      showNotification("Cliente eliminado con éxito");
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      const errorMessage = err.response?.data?.mensaje || "Error eliminando cliente";
      showNotification(errorMessage, "error");
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.documento?.includes(search) ||
    c.direccion_envio?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono_contacto?.includes(search) ||
    c.telefono_usuario?.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(clientesFiltrados.length / itemsPerPage));
  const currentItems = clientesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const formatMetodoPago = (metodo) => {
    const map = {
      tarjeta: "Tarjeta",
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      nequi: "Nequi",
      daviplata: "Daviplata"
    };
    return map[metodo] || metodo || "—";
  };

  return (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar cliente (Nombre, Email, Documento, Teléfono, Dirección)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Añadir Cliente
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[20%]">Nombre</th>
                    <th className="px-6 py-3 w-[15%]">Email</th>
                    <th className="px-6 py-3 w-[10%]">Documento</th>
                    <th className="px-6 py-3 w-[20%]">Dirección</th>
                    <th className="px-6 py-3 w-[10%]">Teléfono</th>
                    <th className="px-6 py-3 w-[10%]">Método Pago</th>
                    <th className="px-6 py-3 w-[15%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                        No hay clientes registrados.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((cliente) => (
                      <tr key={cliente.id_cliente} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{cliente.nombre_completo}</td>
                        <td className="px-6 py-4 text-gray-600">{cliente.email}</td>
                        <td className="px-6 py-4 text-gray-600">{cliente.documento}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{cliente.direccion_envio}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {cliente.telefono_contacto || cliente.telefono_usuario || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{formatMetodoPago(cliente.metodo_pago)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("details", cliente)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("edit", cliente)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal("delete", cliente)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              title="Eliminar"
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

          {clientesFiltrados.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Siguiente
              </button>
            </div>
          )}
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
          {modalType && (
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
                  {modalType === "add"
                    ? "Agregar Cliente"
                    : modalType === "edit"
                      ? "Editar Cliente"
                      : modalType === "details"
                        ? "Detalles del Cliente"
                        : "Eliminar Cliente"}
                </h3>

                {modalType === "add" && (
                  <form className="space-y-4">
                    {/* SELECCIÓN DE USUARIO */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Usuario *
                      </label>
                      {loadingUsuarios ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                          Cargando usuarios...
                        </div>
                      ) : usuariosSinCliente.length === 0 ? (
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-yellow-50 text-yellow-700">
                          No hay usuarios disponibles. Registra uno primero.
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            name="id_usuario"
                            value={formData.id_usuario}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                          >
                            <option value="">— Seleccionar un usuario —</option>
                            {usuariosSinCliente.map((usuario) => (
                              <option key={usuario.id_usuario} value={usuario.id_usuario}>
                                {usuario.nombre_completo} ({usuario.email}) {usuario.es_cliente ? " (Ya es cliente)" : ""}
                              </option>
                            ))}
                          </select>
                          <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección de Envío *
                      </label>
                      <input
                        type="text"
                        name="direccion_envio"
                        value={formData.direccion_envio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Calle 123 #45-67, Bogotá"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="text"
                        name="telefono_contacto"
                        value={formData.telefono_contacto}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 3001234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pago
                      </label>
                      <select
                        name="metodo_pago"
                        value={formData.metodo_pago}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">— Seleccionar —</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="nequi">Nequi</option>
                        <option value="daviplata">Daviplata</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "edit" && selectedCliente && (
                  <form className="space-y-4">
                    <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                      <span className="font-medium">Usuario:</span> {selectedCliente.nombre_completo}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección de Envío *
                      </label>
                      <input
                        type="text"
                        name="direccion_envio"
                        value={formData.direccion_envio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: Calle 123 #45-67, Bogotá"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="text"
                        name="telefono_contacto"
                        value={formData.telefono_contacto}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Ej: 3001234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pago
                      </label>
                      <select
                        name="metodo_pago"
                        value={formData.metodo_pago}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">— Seleccionar —</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="nequi">Nequi</option>
                        <option value="daviplata">Daviplata</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                  </form>
                )}

                {modalType === "details" && selectedCliente && (
                  <div className="space-y-3 text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Usuario:</span>
                      <span className="text-right">{selectedCliente.nombre_completo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-right">{selectedCliente.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Documento:</span>
                      <span className="text-right">{selectedCliente.documento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dirección:</span>
                      <span className="text-right">{selectedCliente.direccion_envio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teléfono:</span>
                      <span className="text-right">
                        {selectedCliente.telefono_contacto || selectedCliente.telefono_usuario || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Método Pago:</span>
                      <span className="text-right">{formatMetodoPago(selectedCliente.metodo_pago)}</span>
                    </div>
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}

                {modalType === "delete" && selectedCliente && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      ¿Estás seguro de eliminar el cliente{" "}
                      <span className="font-bold text-red-600">{selectedCliente.nombre_completo}</span>?
                      <br />
                      <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Clientes;