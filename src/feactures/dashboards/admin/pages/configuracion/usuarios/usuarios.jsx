import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {Layout} from "../../../layout/layout";
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

  const [showModal, setShowModal] = useState(null); // "crear" | "editar" | "ver" | "eliminar"
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

  // 🔹 Cargar usuarios y roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataUsuarios = await getUsuarios();
        const dataRoles = await getRoles();
        setUsuarios(dataUsuarios);
        setRoles(dataRoles);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Crear
  const handleCreate = async () => {
    try {
      await createUsuario(formData);
      const updated = await getUsuarios();
      setUsuarios(updated);
      setShowModal(null);
    } catch (err) {
      console.error("Error creando usuario:", err);
    }
  };

  // 🔹 Editar
  const handleEdit = async () => {
    try {
      await updateUsuario(selectedUsuario.id_usuario, formData);
      const updated = await getUsuarios();
      setUsuarios(updated);
      setShowModal(null);
    } catch (err) {
      console.error("Error editando usuario:", err);
    }
  };

  // 🔹 Eliminar
  const handleDelete = async () => {
    try {
      await deleteUsuario(selectedUsuario.id_usuario);
      setUsuarios(usuarios.filter((u) => u.id_usuario !== selectedUsuario.id_usuario));
      setShowModal(null);
    } catch (err) {
      console.error("Error eliminando usuario:", err);
    }
  };

  // 🔹 Abrir modal
  const openModal = (type, usuario = null) => {
    setShowModal(type);
    if (usuario) {
      setSelectedUsuario(usuario);
      if (type === "editar") {
        setFormData(usuario);
      }
    } else {
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

  const getRolNombre = (idRol) => {
    const rol = roles.find((r) => r.id_rol === idRol);
    return rol ? rol.nombre_rol : "Sin rol";
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Usuarios &gt; Registro de Usuarios
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => openModal("crear")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Registrar nuevo usuario
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Nombre Completo</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      Cargando...
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-gray-50 transition border-b">
                      <td className="px-6 py-3">{u.id_usuario}</td>
                      <td className="px-6 py-3">{u.nombre_completo}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">{u.telefono}</td>
                      <td className="px-6 py-3">{getRolNombre(u.id_rol)}</td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => openModal("ver", u)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("editar", u)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("eliminar", u)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODALES ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✖
            </button>

            {/* Crear / Editar */}
            {(showModal === "crear" || showModal === "editar") && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  {showModal === "crear" ? "Registrar Usuario" : "Editar Usuario"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Documento</label>
                    <input
                      type="text"
                      name="documento"
                      value={formData.documento}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tipo Documento</label>
                    <input
                      type="text"
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Nombre Completo</label>
                    <input
                      type="text"
                      name="nombre_completo"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Fecha Nacimiento</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Contraseña</label>
                    <input
                      type="password"
                      name="contraseña"
                      value={formData.contraseña}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Género</label>
                    <input
                      type="text"
                      name="tipo_genero"
                      value={formData.tipo_genero}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Rol</label>
                    <select
                      name="id_rol"
                      value={formData.id_rol}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map((r) => (
                        <option key={r.id_rol} value={r.id_rol}>
                          {r.nombre_rol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={showModal === "crear" ? handleCreate : handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {showModal === "crear" ? "Guardar" : "Actualizar"}
                  </button>
                </div>
              </>
            )}

            {/* Ver Detalles */}
            {showModal === "ver" && selectedUsuario && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Detalles del Usuario
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>ID:</strong> {selectedUsuario.id_usuario}</p>
                  <p><strong>Documento:</strong> {selectedUsuario.documento}</p>
                  <p><strong>Tipo Documento:</strong> {selectedUsuario.tipo_documento}</p>
                  <p><strong>Nombre:</strong> {selectedUsuario.nombre_completo}</p>
                  <p><strong>Email:</strong> {selectedUsuario.email}</p>
                  <p><strong>Teléfono:</strong> {selectedUsuario.telefono}</p>
                  <p><strong>Fecha Nacimiento:</strong> {selectedUsuario.fecha_nacimiento}</p>
                  <p><strong>Dirección:</strong> {selectedUsuario.direccion}</p>
                  <p><strong>Género:</strong> {selectedUsuario.tipo_genero}</p>
                  <p><strong>Rol:</strong> {getRolNombre(selectedUsuario.id_rol)}</p>
                </div>
              </>
            )}

            {/* Eliminar */}
            {showModal === "eliminar" && selectedUsuario && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Confirmar Eliminación
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  ¿Seguro que deseas eliminar al usuario{" "}
                  <strong>{selectedUsuario.nombre_completo}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(null)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
