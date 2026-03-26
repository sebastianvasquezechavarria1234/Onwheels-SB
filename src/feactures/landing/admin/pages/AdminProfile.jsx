"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "../layout/AdminLayout"
import { Mail, Phone, User, Edit, Save, X, Camera, Star, Zap, MapPin, Shield } from "lucide-react"
import api from "../../../../services/api"

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const AdminProfile = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre_completo: "",
    telefono: "",
    email: "", 
    documento: "",
    tipo_documento: "",
    foto_perfil: null
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      if (!storedUser.id_usuario) {
        setLoading(false)
        return
      }

      const response = await api.get(`/usuarios/${storedUser.id_usuario}`)
      setUserData(response.data)

      setFormData({
        nombre_completo: response.data.nombre_completo || "",
        telefono: response.data.telefono || "",
        email: response.data.email || "",
        documento: response.data.documento || "",
        tipo_documento: response.data.tipo_documento || "",
        foto_perfil: null
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

      await api.put(`/usuarios/${userData.id_usuario}`, {
        nombre_completo: formData.nombre_completo,
        telefono: formData.telefono,
      })

      if (formData.foto_perfil) {
        const formDataImg = new FormData();
        formDataImg.append("foto_perfil", formData.foto_perfil);
        const photoRes = await api.post(`/usuarios/${userData.id_usuario}/foto`, formDataImg);
        
        const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
        currentUserData.foto_perfil = photoRes.data?.foto_perfil || photoRes.data?.secure_url;
        localStorage.setItem("user", JSON.stringify(currentUserData));
        window.dispatchEvent(new Event("storage")); 
      }

      await fetchUserData()
      setEditing(false)
      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMsg = error.response?.data?.mensaje || "Error al actualizar perfil";
      alert(errorMsg);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[160px]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <User className="text-[#3b82f6]" size={36} />
                Mi Perfil
              </h2>
              <p className="text-[#9CA3AF] mt-2 font-medium">Panel Administrativo • Gestiona tu identidad</p>
            </div>
          </div>

          <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 md:p-12 shadow-xl hover:shadow-[#1E3A8A]/5 hover:border-gray-700 transition-all group relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#1E3A8A]/10 rounded-full blur-[80px] group-hover:bg-[#1E3A8A]/20 transition-all pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">

              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group/avatar cursor-pointer">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#1E3A8A] shadow-lg shadow-[#1E3A8A]/20 bg-[#0B0F14] flex items-center justify-center">
                    {userData?.preview_foto || userData?.foto_perfil || userData?.imagen ? (
                      <img
                        src={userData.preview_foto || userData.foto_perfil || userData.imagen}
                        alt="Avatar"
                        className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-all"
                      />
                    ) : (
                      <User size={64} className="text-gray-700" />
                    )}
                    
                    <label className={cn(
                        "absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white",
                        editing && "opacity-100"
                    )}>
                      <Camera className="text-white drop-shadow-lg" size={32} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                         if(e.target.files && e.target.files[0]) {
                            setFormData(p => ({...p, foto_perfil: e.target.files[0]}));
                            setUserData(p => ({...p, preview_foto: URL.createObjectURL(e.target.files[0])}));
                         }
                      }} />
                    </label>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#1E3A8A] text-white w-10 h-10 rounded-full border-4 border-[#121821] flex items-center justify-center shadow-md">
                    <Shield size={16} fill="currentColor" />
                  </div>
                </div>
                {editing && (
                  <span className="mt-4 text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider animate-pulse">
                    Cambiar imagen
                  </span>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                      userData?.estado ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    <Zap size={10} fill="currentColor" />
                    {userData?.estado ? "Panel Activo" : "Cuenta Restringida"}
                  </span>
                </div>

                {!editing ? (
                  <>
                    <h4 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
                      {userData?.nombre_completo || "Administrador"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1 text-left">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Phone size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Teléfono</span>
                        </div>
                        <span className="font-medium text-white pl-5">{userData?.telefono || "No especificado"}</span>
                      </div>

                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1 text-left">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Mail size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                        </div>
                        <span className="font-medium text-white pl-5 break-all">{userData?.email || "No especificado"}</span>
                      </div>

                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1 md:col-span-2 text-left">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <MapPin size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Documento de Identidad</span>
                        </div>
                        <span className="font-medium text-white pl-5">{userData?.tipo_documento} {userData?.documento}</span>
                      </div>

                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1 md:col-span-2 text-left">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Shield size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Jerarquía</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-5 mt-2">
                          {userData?.roles && userData.roles.length > 0 ? (
                            userData.roles.map((rol, idx) => (
                              <span key={idx} className="bg-[#1E3A8A]/20 text-[#3b82f6] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#1E3A8A]/30">
                                {rol.nombre_rol || rol}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm font-medium text-gray-400">Sin roles registrados</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 block">Nombre Completo</label>
                        <input
                          type="text"
                          name="nombre_completo"
                          value={formData.nombre_completo}
                          onChange={handleInputChange}
                          className="w-full bg-[#0B0F14] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] transition-all font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 block">Teléfono</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full bg-[#0B0F14] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 block opacity-50">Email (Sólo lectura)</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full bg-[#0B0F14]/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row gap-4 justify-end h-[60px]">
              {!editing ? (
                <button 
                  onClick={() => setEditing(true)}
                  className="px-8 py-3 bg-[#1E3A8A] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20 flex items-center justify-center gap-2 group"
                >
                  <Edit size={14} className="group-hover:rotate-12 transition-transform" />
                  Editar Mi Perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-8 py-3 bg-[#0B0F14] border border-gray-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    Confirmar Cambios
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
