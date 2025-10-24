import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Layout } from "../../../layout/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../../services/usuariosServices";
import { getRoles } from "../../services/RolesService";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const [formData, setFormData] = useState({
    documento: "",
    tipo_documento: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    direccion: "",
    contraseña: "",
    tipo_genero: "",
    id_rol: "",
  });

  const [search, setSearch] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cargar usuarios y roles
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dataUsuarios, dataRoles] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(dataUsuarios);
      setRoles(dataRoles);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Crear
  const handleCreate = async () => {
    try {
      await createUsuario(formData);
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Error creando usuario:", err);
    }
  };

  // Editar
  const handleEdit = async () => {
    try {
      await updateUsuario(selectedUsuario.id_usuario, formData);
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Error editando usuario:", err);
    }
  };

  // Eliminar
  const handleDelete = async () => {
    try {
      await deleteUsuario(selectedUsuario.id_usuario);
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  // Abrir modal
  const openModal = (type, usuario = null) => {
    setModal(type);
    setSelectedUsuario(usuario);
    if (usuario && type === "editar") setFormData(usuario);
    if (!usuario) {
      setFormData({
        documento: "",
        tipo_documento: "",
        nombre_completo: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
        direccion: "",
        contraseña: "",
        tipo_genero: "",
        id_rol: "",
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUsuario(null);
    setFormData({
      documento: "",
      tipo_documento: "",
      nombre_completo: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      direccion: "",
      contraseña: "",
      tipo_genero: "",
      id_rol: "",
    });
  };

  const getRolNombre = (idRol) => {
    const rol = roles.find((r) => r.id_rol === idRol);
    return rol ? rol.nombre_rol : "Sin rol";
  };

  // Filtrado por búsqueda
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.documento).includes(search)
  );

  // Paginación derivada
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = usuariosFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(usuariosFiltrados.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Usuarios &gt; Registro de Usuarios</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar usuarios:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Ej: Documento, Nombre o email"
                  className="input pl-[50px]!"
                />
              </div>
            </label>
          </form>

          <div>
            <button
              onClick={() => openModal("crear")}
              className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
            >
              <Plus className="h-4 w-4" />
              Registrar nuevo usuario
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[10%] font-bold! opacity-80">ID</p>
            <p className="w-[30%] font-bold! opacity-80">Nombre Completo</p>
            <p className="w-[20%] font-bold! opacity-80">Email</p>
            <p className="w-[15%] font-bold! opacity-80">Teléfono</p>
            <p className="w-[15%] font-bold! opacity-80">Rol</p>
            <p className="w-[10%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr>
                  <th className="hidden" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">Cargando...</td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 italic text-red-700">No hay usuarios registrados</td>
                  </tr>
                ) : (
                  currentItems.map((u) => (
                    <tr key={u.id_usuario} className="py-[18px] border-b border-black/20">
                      <td className="px-6 py-[18px] w-[10%]">{u.id_usuario}</td>
                      <td className="px-6 py-[18px] w-[30%] line-clamp-1">{u.nombre_completo}</td>
                      <td className="px-6 py-[18px] w-[20%] line-clamp-1">{u.email}</td>
                      <td className="px-6 py-[18px] w-[15%]">{u.telefono}</td>
                      <td className="px-6 py-[18px] w-[15%]">{getRolNombre(u.id_rol)}</td>

                      <td className="px-6 py-[18px] w-[10%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("ver", u)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("editar", u)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("eliminar", u)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 py-4 italic">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Anterior
            </button>

            <span className="text-[18px]">Página <span className="text-blue-700">{currentPage}</span> de {totalPages}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Modales */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px]">{modal === "crear" ? "Registrar Usuario" : "Editar Usuario"}</h3>

                <form onSubmit={(e) => { e.preventDefault(); modal === "crear" ? handleCreate() : handleEdit(); }} className="grid grid-cols-2 gap-[16px]">
                  <label className="block col-span-1">
                    <p className="">Documento</p>
                    <input
                      type="text"
                      name="documento"
                      value={formData.documento}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: 900123456"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Tipo Documento</p>
                    <input
                      type="text"
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: CC, CE"
                    />
                  </label>

                  <label className="block col-span-2">
                    <p className="">Nombre Completo</p>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Email</p>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: correo@dominio.com"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Teléfono</p>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: +57 300 123 4567"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Fecha Nacimiento</p>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Dirección</p>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: Calle 123 #45-67"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Contraseña</p>
                    <input
                      type="password"
                      name="contraseña"
                      value={formData.contraseña}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="********"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Género</p>
                    <input
                      type="text"
                      name="tipo_genero"
                      value={formData.tipo_genero}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ej: Masculino / Femenino"
                    />
                  </label>

                  <label className="block col-span-2">
                    <p className="">Rol</p>
                    <select name="id_rol" value={formData.id_rol} onChange={handleChange} className="input w-full">
                      <option value="">Seleccione un rol</option>
                      {roles.map((r) => (
                        <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                      ))}
                    </select>
                  </label>

                  <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                    <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                    <button type="submit" className="btn bg-blue-100 text-blue-700">{modal === "crear" ? "Guardar" : "Actualizar"}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {modal === "ver" && selectedUsuario && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px]">Detalles del Usuario</h3>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <p className="font-medium">ID:</p>
                    <p className="font-medium">Documento:</p>
                    <p className="font-medium">Nombre:</p>
                  </div>
                  <div>
                    <p className="text-gray-700">{selectedUsuario.id_usuario}</p>
                    <p className="text-gray-700">{selectedUsuario.documento}</p>
                    <p className="text-gray-700">{selectedUsuario.nombre_completo}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="font-medium">Email:</p>
                  <p className="text-gray-700">{selectedUsuario.email}</p>
                </div>

                <div className="mt-4">
                  <p className="font-medium">Teléfono:</p>
                  <p className="text-gray-700">{selectedUsuario.telefono}</p>
                </div>

                <div className="flex justify-end gap-[10px] mt-[30px]">
                  <button onClick={closeModal} className="btn bg-gray-200">Cerrar</button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {modal === "eliminar" && selectedUsuario && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px] text-red-600">Eliminar Usuario</h3>
                <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar al usuario <strong>{selectedUsuario.nombre_completo}</strong>?</p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                  <button onClick={handleDelete} className="btn bg-red-100 text-red-700">Eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
