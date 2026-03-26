import React, { useEffect, useState, useCallback } from "react";
import { 
  Phone, 
  Mail, 
  Shield, 
  User, 
  Camera, 
  Star, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Lock,
  Pencil,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { configUi, cn } from "../../admin/pages/configuracion/configUi";
import { useAuth } from "../../dinamico/context/AuthContext";

export const CustomProfile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id_usuario) return;
    
    setLoading(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append("foto_perfil", file);
      const token = localStorage.getItem("token");
      
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000';
      const photoRes = await fetch(`${apiUrl}/api/usuarios/${user.id_usuario}/foto`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formDataImg
      });
      
      if (!photoRes.ok) {
        const errData = await photoRes.json();
        throw new Error(errData.mensaje || "Error al subir la imagen");
      }
      
      await refreshUser();
      showNotification("Foto de perfil actualizada correctamente");
    } catch (err) {
      showNotification(err.message || "Error al subir la imagen", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={configUi.pageShell}>
        {/* Header */}
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title}>Mi Perfil</h2>
            <span className={configUi.countBadge}>
              CONFIGURACIÓN PERSONAL
            </span>
          </div>
          <div className={configUi.toolbar}>
            <button 
              onClick={() => refreshUser()} 
              className={cn(configUi.secondaryButton, "px-4")}
            >
              <RefreshCw size={14} />
              Sincronizar
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 mt-6 overflow-hidden">
          {/* Left Side - Avatar & Summary */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className={cn(configUi.tableCard, "p-8 items-center text-center")}>
              <div className="relative group/avatar">
                <div className={cn(
                  "w-36 h-36 rounded-[2.5rem] overflow-hidden border-4 border-indigo-50 shadow-xl bg-slate-50 flex items-center justify-center mx-auto transition-all",
                  loading && "opacity-50 grayscale"
                )}>
                  {user.foto_perfil ? (
                    <img src={user.foto_perfil} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:opacity-40 transition-all duration-300" />
                  ) : (
                    <User size={64} className="text-slate-200" />
                  )}
                  <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer z-10">
                    <div className="bg-[#16315f]/80 p-3 rounded-2xl text-white backdrop-blur-sm">
                       {loading ? <RefreshCw size={24} className="animate-spin" /> : <Camera size={24} />}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={loading} />
                  </label>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
              
              <h3 className="text-xl font-black text-[#16315f] mt-6 uppercase tracking-tight">{user.nombre_completo || user.nombre || "Usuario"}</h3>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 italic">
                <Zap size={12} fill="currentColor" />
                Miembro Activo
              </div>
            </div>

            <div className={cn(configUi.tableCard, "p-6")}>
               <h4 className={configUi.fieldLabel}>Roles e Insignias</h4>
               <div className="flex flex-wrap gap-2 mt-4">
                  {user.roles?.map(role => (
                    <span key={role} className={configUi.subtlePill}>
                      {role}
                    </span>
                  )) || (
                    <span className={configUi.subtlePill}>
                      {user.rol || "Sin roles"}
                    </span>
                  )}
               </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex-1 min-w-0">
            <div className={cn(configUi.tableCard, "h-full")}>
               <div className={configUi.modalHeader}>
                  <h3 className="text-sm font-black text-[#16315f] uppercase tracking-widest">Información de Contacto</h3>
               </div>
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={configUi.fieldGroup}>
                      <label className={configUi.fieldLabel}>Correo Electrónico</label>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[#16315f] font-bold text-sm">
                         <Mail size={16} className="text-slate-400" />
                         <span className="truncate">{user.email || "No especificado"}</span>
                      </div>
                    </div>

                    <div className={configUi.fieldGroup}>
                      <label className={configUi.fieldLabel}>Número Telefónico</label>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[#16315f] font-bold text-sm">
                         <Phone size={16} className="text-slate-400" />
                         <span>{user.telefono || user.phone || "Sin registrar"}</span>
                      </div>
                    </div>
                  </div>

                  <div className={configUi.fieldGroup}>
                     <label className={configUi.fieldLabel}>Estado de Seguridad</label>
                     <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Shield size={20} className="text-indigo-400" />
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-[#16315f] uppercase">Protección de Datos</span>
                              <span className="text-[10px] text-slate-500 font-medium">Contraseña encriptada y sesión segura</span>
                           </div>
                        </div>
                        <CheckCircle size={20} className="text-emerald-500" />
                     </div>
                  </div>
               </div>

               <div className={cn(configUi.modalFooter, "mt-auto")}>
                  <button className={configUi.secondaryButton}>
                     <Lock size={16} className="mr-2" />
                     Cambiar Contraseña
                  </button>
                  <button className={configUi.primaryButton}>
                     <Pencil size={16} className="mr-2" />
                     Actualizar Datos
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notification.show && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className={cn("fixed top-4 right-4 z-[1000] px-6 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-3", 
              notification.type === "success" ? "bg-[#16315f]" : "bg-rose-500")}
            >
              {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};
