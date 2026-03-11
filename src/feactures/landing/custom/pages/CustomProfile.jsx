"use client"

import { CustomLayout } from "../layout/CustomLayout"
import { useEffect, useState } from "react"
import { Phone, Mail, Shield, User, Camera, Star, Zap } from "lucide-react"

export const CustomProfile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <CustomLayout>
        <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
        </div>
      </CustomLayout>
    )
  }

  return (
    <CustomLayout>
      <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[100px]">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <User className="text-[#3b82f6]" size={36} />
                Mi Perfil
              </h2>
              <p className="text-[#9CA3AF] mt-2 font-medium">Gestiona tu información personal y configuración</p>
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
                    <img
                      src="/placeholder.svg?height=144&width=144"
                      alt="Avatar"
                      className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-all"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      <Camera className="text-white" size={32} />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-full border-4 border-[#121821] flex items-center justify-center shadow-md">
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
                <button className="mt-4 text-xs font-bold text-[#3b82f6] uppercase tracking-wider hover:text-white transition-colors">
                  Editar Foto
                </button>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <Zap size={10} fill="currentColor" />
                    Cuenta Activa
                  </span>
                </div>

                <h4 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
                  {user.name || "Usuario"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[#9CA3AF]">
                      <Phone size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Teléfono</span>
                    </div>
                    <span className="font-medium text-white pl-5">{user.phone || "No especificado"}</span>
                  </div>

                  <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[#9CA3AF]">
                      <Mail size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                    </div>
                    <span className="font-medium text-white pl-5 break-all">{user.email || "No especificado"}</span>
                  </div>

                  <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-[#9CA3AF]">
                      <Shield size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Roles Asignados</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-5 mt-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span key={role} className="bg-[#1E3A8A]/20 text-[#3b82f6] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#1E3A8A]/30">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-white">Sin roles</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row gap-4 justify-end">
              <button className="px-6 py-3 bg-[#0B0F14] border border-gray-700 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                Cambiar Contraseña
              </button>
              <button className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20 flex items-center justify-center gap-2">
                Editar Perfil
              </button>
            </div>

          </div>
        </div>
      </section>
    </CustomLayout>
  )
}
