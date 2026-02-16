"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "../layout/AdminLayout"
import { Mail, Phone, User, Edit, Save, X, Camera } from "lucide-react"
import api from "../../../../services/api"

export const AdminProfile = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre_completo: "",
    telefono: "",
    email: "", // Generalmente el email no se debería editar tan fácil, pero lo pondré como disabled si se desea
    documento: "",
    tipo_documento: ""
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // 1. Obtener ID del usuario del localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (!storedUser.id_usuario) {
        setLoading(false)
        return
      }

      // 2. Llamada real a la API
      const response = await api.get(`/usuarios/${storedUser.id_usuario}`)
      setUserData(response.data)

      // Inicializar form data
      setFormData({
        nombre_completo: response.data.nombre_completo || "",
        telefono: response.data.telefono || "",
        email: response.data.email || "",
        documento: response.data.documento || "",
        tipo_documento: response.data.tipo_documento || ""
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!userData?.id_usuario) return

      // Llamada a la API para actualizar
      // Nota: El backend espera currentPassword si se cambia la contraseña. 
      // Aquí estamos editando perfil básico, así que solo enviamos datos básicos.
      await api.put(`/usuarios/${userData.id_usuario}`, {
        nombre_completo: formData.nombre_completo,
        telefono: formData.telefono,
        // email: formData.email, // Depende si permitimos cambiar email
        // documento: formData.documento // Depende si permitimos cambiar documento
      })

      // Actualizar vista y cerrar edición
      await fetchUserData()
      setEditing(false)
      // Mostrar feedback de éxito (ajustar según librería de UI)
      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error al actualizar perfil")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <section className="p-[30px] pt-[150px] w-full flex flex-col items-center">

        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 font-primary">Mi Perfil</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <Edit size={18} />
                <span>Editar</span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-50 bg-emerald-100 flex items-center justify-center">
                {userData?.imagen ? (
                  <img src={userData.imagen} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-emerald-400" />
                )}
              </div>
              {/* Overlay para cambiar foto (visual por ahora) */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={24} />
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${userData?.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {userData?.estado ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">{userData?.nombre_completo}</h3>
              <p className="text-gray-500">{userData?.email}</p>
            </div>
          </div>

          {!editing ? (
            // VISTA DE LECTURA
            <div className="grid gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Teléfono</p>
                  <p className="text-gray-900 font-medium">{userData?.telefono || "No registrado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Documento</p>
                  <p className="text-gray-900 font-medium">
                    {userData?.tipo_documento} {userData?.documento}
                  </p>
                </div>
              </div>

              {/* Roles */}
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-500 font-medium mb-3">Roles asignados</p>
                <div className="flex flex-wrap gap-2">
                  {userData?.roles?.map((rol, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                      {rol.nombre_rol || rol}
                    </span>
                  ))}
                  {(!userData?.roles || userData.roles.length === 0) && (
                    <span className="text-gray-400 text-sm italic">Sin roles asignados</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // VISTA DE EDICIÓN
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc.</label>
                    <input
                      type="text"
                      value={formData.tipo_documento}
                      disabled
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc.</label>
                    <input
                      type="text"
                      value={formData.documento}
                      disabled
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">El email no se puede editar.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}

        </div>
      </section>
    </AdminLayout>
  )
}
