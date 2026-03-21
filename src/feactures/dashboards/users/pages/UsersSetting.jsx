import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { User, Camera, Star, Zap, Lock, Phone, Mail, Shield, CheckCircle } from "lucide-react";
import { UsersLayout } from "../../../landing/users/layout/UsersLayout";
import api from "../../../../services/api";

export const UsersSetting = () => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  // ... rest of state ...
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editData, setEditData] = useState({ nombre_completo: "", nombre: "", telefono: "", fecha_nacimiento: "", foto_perfil: null });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordValidation, setPasswordValidation] = useState({
    currentPassword: { valid: null, message: "" },
    newPassword: { valid: null, message: "" },
    confirmPassword: { valid: null, message: "" }
  });
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const verifyTimeout = useRef(null);
  const lastAbortController = useRef(null);
  const enterTimerRef = useRef(null);
  const visibleTimerRef = useRef(null);
  const exitTimerRef = useRef(null);
  const [messagePhase, setMessagePhase] = useState(null);

  const userApi = {
    getUsuario: async (id) => {
      const { data } = await api.get(`/usuarios/${id}`);
      return data;
    },
    updateUsuario: async (id, updateData) => {
      try {
        const { data } = await api.put(`/usuarios/${id}`, updateData);
        return data;
      } catch (err) {
        const errData = err.response?.data || {};
        errData._status = err.response?.status;
        throw errData;
      }
    },
    verifyCurrentPassword: async (id, currentPassword, signal) => {
      try {
        const { data } = await api.post(`/usuarios/${id}/verify-password`, { currentPassword }, { signal });
        return data;
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') throw err;
        const errData = err.response?.data || {};
        return { valid: false, ...errData };
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = authUser?.id_usuario;
        if (!userId) return; // Wait for authUser to be ready
        const data = await userApi.getUsuario(userId);
        setUserData(data);
        setEditData({ 
          nombre_completo: data.nombre_completo || data.nombre || "", 
          telefono: data.telefono || "", 
          fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : "",
          foto_perfil: null 
        });
      } catch (err) { console.error('Error fetching user', err); }
      finally { setLoading(false); }
    };
    if (authUser) fetchUserData();
  }, [authUser]);

  const ENTER_DUR = 400, VISIBLE_DUR = 3500, EXIT_DUR = 400;

  useEffect(() => {
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    if (!successMessage) { setMessagePhase(null); return; }

    setMessagePhase('entering');
    enterTimerRef.current = setTimeout(() => setMessagePhase('visible'), ENTER_DUR);
    visibleTimerRef.current = setTimeout(() => setMessagePhase('exiting'), ENTER_DUR + VISIBLE_DUR);
    exitTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      setMessagePhase(null);
    }, ENTER_DUR + VISIBLE_DUR + EXIT_DUR);
  }, [successMessage]);

  useEffect(() => () => {
    if (verifyTimeout.current) clearTimeout(verifyTimeout.current);
    if (lastAbortController.current) { try { lastAbortController.current.abort(); } catch { } }
  }, []);

  const validateNewPassword = (password) => {
    if (!password) {
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: null, message: "" } }));
      return;
    }
    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasMinLength)
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: false, message: "Mínimo 6 caracteres" } }));
    else if (!(hasNumber || hasSpecialChar))
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: false, message: "Debe contener al menos 1 número o 1 caracter especial" } }));
    else
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: true, message: "Contraseña válida" } }));
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) {
      setPasswordValidation(prev => ({ ...prev, confirmPassword: { valid: null, message: "" } }));
      return;
    }
    if (passwordData.newPassword === confirm)
      setPasswordValidation(prev => ({ ...prev, confirmPassword: { valid: true, message: "Las contraseñas coinciden" } }));
    else
      setPasswordValidation(prev => ({ ...prev, confirmPassword: { valid: false, message: "Las contraseñas no coinciden" } }));
  };

  const scheduleVerifyCurrentPassword = (value) => {
    if (verifyTimeout.current) clearTimeout(verifyTimeout.current);
    if (lastAbortController.current) { try { lastAbortController.current.abort(); } catch { } }
    if (!value) {
      setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: null, message: "" } }));
      return;
    }
    verifyTimeout.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        lastAbortController.current = controller;
        const userId = authUser?.id_usuario;
        const resp = await userApi.verifyCurrentPassword(userId, value, controller.signal);
        if (resp?.valid)
          setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: true, message: "Contraseña actual correcta" } }));
        else
          setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "Contraseña actual incorrecta" } }));
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error verify current password:', err);
          setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "Error al verificar" } }));
        }
      }
    }, 600);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setPasswordError("");
    setSuccessMessage("");
    try {
      const userId = authUser?.id_usuario;
      const updateData = { 
        nombre: editData.nombre_completo, 
        telefono: editData.telefono,
        fecha_nacimiento: editData.fecha_nacimiento
      };
      const response = await userApi.updateUsuario(userId, updateData);
      
      // Subir foto si la hay
      if (editData.foto_perfil) {
         const formDataImg = new FormData();
         formDataImg.append("foto_perfil", editData.foto_perfil);
         const token = localStorage.getItem('token');
         const photoRes = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api'}/usuarios/${userId}/foto`, {
           method: "POST",
           headers: { Authorization: `Bearer ${token}` },
           body: formDataImg
         });
         if (!photoRes.ok) {
           const errData = await photoRes.json();
           throw new Error(errData.mensaje || "Error al subir la imagen de perfil");
         }
         const photoData = await photoRes.json();
         // Update user in local storage
         const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
         currentUserData.foto_perfil = photoData.foto_perfil || photoData.secure_url;
         localStorage.setItem("user", JSON.stringify(currentUserData));
         window.dispatchEvent(new Event("storage"));
      }

      // Volvemos a pedir los datos después de que se grabó la imagen
      const finalData = await userApi.getUsuario(userId);
      setUserData(finalData);

      setSuccessMessage("Perfil actualizado correctamente");
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      setPasswordError(err?.mensaje || "Error al actualizar el perfil. Por favor intente nuevamente.");
    } finally { setIsLoading(false); }
  };

  const handleSavePassword = async () => {
    setIsLoading(true);
    setPasswordError("");
    setSuccessMessage("");
    try {
      const userId = authUser?.id_usuario;
      if (!passwordData.currentPassword)
        return setPasswordError("Debe ingresar su contraseña actual"), setIsLoading(false);
      if (passwordValidation.newPassword.valid !== true)
        return setPasswordError("La nueva contraseña no cumple con los requisitos"), setIsLoading(false);
      if (passwordData.newPassword !== passwordData.confirmPassword)
        return setPasswordError("La nueva contraseña y la confirmación no coinciden"), setIsLoading(false);
      if (passwordValidation.currentPassword.valid !== true)
        return setPasswordError("La contraseña actual no coincide"), setIsLoading(false);
      const updateData = {
        contrasena: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        confirmPassword: passwordData.confirmPassword
      };
      const response = await userApi.updateUsuario(userId, updateData);
      setUserData(response.usuario);
      setSuccessMessage(response.mensaje || "Contraseña actualizada correctamente");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordValidation({
        currentPassword: { valid: null, message: "" },
        newPassword: { valid: null, message: "" },
        confirmPassword: { valid: null, message: "" }
      });
      setIsChangingPassword(false);
    } catch (err) {
      console.error("Error al guardar contraseña:", err);
      setPasswordError(err?.mensaje || "Error al actualizar la contraseña. Verifique sus datos e intente nuevamente.");
    } finally { setIsLoading(false); }
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setEditData({ 
      nombre_completo: userData.nombre_completo || "", 
      telefono: userData.telefono || "", 
      fecha_nacimiento: userData.fecha_nacimiento ? userData.fecha_nacimiento.split('T')[0] : "",
      foto_perfil: null 
    });
    setPasswordError("");
    setSuccessMessage("");
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordValidation({
      currentPassword: { valid: null, message: "" },
      newPassword: { valid: null, message: "" },
      confirmPassword: { valid: null, message: "" }
    });
    setPasswordError("");
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <UsersLayout>
        <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
        </div>
      </UsersLayout>
    );
  }

  return (
    <UsersLayout>
      <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[100px] md:pt-10">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                <User className="text-[#3b82f6]" size={36} />
                Mi Perfil
              </h2>
              <p className="text-[#9CA3AF] mt-2 font-medium">Gestiona tu información personal y configuración</p>
            </div>
          </div>

          <div className="bg-[#121821] border border-gray-800 rounded-[2rem] p-8 md:p-12 shadow-xl hover:shadow-[#1E3A8A]/5 hover:border-gray-700 transition-all relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#1E3A8A]/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group/avatar cursor-pointer">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#1E3A8A] bg-[#0B0F14] flex items-center justify-center shadow-lg shadow-[#1E3A8A]/20">
                    <img
                      src={editData.foto_perfil ? URL.createObjectURL(editData.foto_perfil) : (userData?.foto_perfil || "/placeholder.svg?height=144&width=144")}
                      alt="Avatar"
                      className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-all opacity-90"
                    />
                    {isEditingProfile && (
                      <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white" size={32} />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                           if(e.target.files && e.target.files[0]) {
                              setEditData(p => ({...p, foto_perfil: e.target.files[0]}));
                           }
                        }} />
                      </label>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-full border-4 border-[#121821] flex items-center justify-center shadow-md">
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
                {isEditingProfile ? (
                   <span className="mt-4 text-xs font-bold text-[#3b82f6] uppercase tracking-wider">
                     Haz clic en la foto para cambiarla
                   </span>
                ) : (
                   <span className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                     Foto de Perfil
                   </span>
                )}
              </div>

              {/* Info Section / Form */}
              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest border border-emerald-500/20">
                    <Zap size={10} fill="currentColor" />
                    Cuenta Activa
                  </span>
                </div>

                {/* EDIT PROFILE VIEW */}
                {isEditingProfile ? (
                  <div className="flex flex-col gap-4 text-left">
                    <h4 className="text-xl font-black text-white tracking-tight mb-2">
                      Editar Perfil
                    </h4>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#9CA3AF] font-bold tracking-wider ml-2">Nombre completo</label>
                      <input
                        type="text"
                        value={editData.nombre_completo}
                        onChange={(e) => setEditData({ ...editData, nombre_completo: e.target.value })}
                        className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#9CA3AF] font-bold tracking-wider ml-2">Teléfono</label>
                      <input
                        type="tel"
                        value={editData.telefono}
                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                        className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#9CA3AF] font-bold tracking-wider ml-2">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        value={editData.fecha_nacimiento}
                        onChange={(e) => setEditData({ ...editData, fecha_nacimiento: e.target.value })}
                        className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors [color-scheme:dark]"
                      />
                    </div>

                    {passwordError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex gap-3 justify-end mt-4">
                      <button
                        onClick={handleCancelProfile}
                        className="px-6 py-3 bg-[#0B0F14] border border-gray-700 text-white flex-1 md:flex-none rounded-xl font-black tracking-widest text-xs hover:bg-gray-800 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#1E3A8A] text-white flex-1 md:flex-none rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1E3A8A]/20"
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                ) : isChangingPassword ? (
                  /* CHANGE PASSWORD VIEW */
                  <div className="flex flex-col gap-4 text-left">
                    <h4 className="text-xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
                      <Lock size={20} className="text-[#3b82f6]" /> Cambiar Contraseña
                    </h4>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#9CA3AF] font-bold tracking-wider ml-2">Contraseña Actual</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPasswordData(prev => ({ ...prev, currentPassword: val }));
                          scheduleVerifyCurrentPassword(val);
                        }}
                        className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors"
                      />
                      {passwordValidation.currentPassword.message && (
                        <p className={`text-xs mt-1 ml-2 font-medium ${passwordValidation.currentPassword.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                          {passwordValidation.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#9CA3AF] font-bold tracking-wider ml-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        placeholder="Mínimo 6 caracteres + 1 número o carácter especial"
                        onChange={(e) => {
                          const val = e.target.value;
                          setPasswordData(prev => ({ ...prev, newPassword: val }));
                          validateNewPassword(val);
                          validateConfirmPassword(passwordData.confirmPassword);
                        }}
                        className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors"
                      />
                      {passwordValidation.newPassword.message && (
                        <p className={`text-xs mt-1 ml-2 font-medium ${passwordValidation.newPassword.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                          {passwordValidation.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#9CA3AF] font-bold tracking-wider ml-2">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPasswordData(prev => ({ ...prev, confirmPassword: val }));
                          validateConfirmPassword(val);
                        }}
                        className="w-full bg-[#0B0F14] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors"
                      />
                      {passwordValidation.confirmPassword.message && (
                        <p className={`text-xs mt-1 ml-2 font-medium ${passwordValidation.confirmPassword.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                          {passwordValidation.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {passwordError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex gap-3 justify-end mt-4">
                      <button
                        onClick={handleCancelPassword}
                        className="px-6 py-3 bg-[#0B0F14] border border-gray-700 text-white flex-1 md:flex-none rounded-xl font-black tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSavePassword}
                        disabled={isLoading || passwordValidation.newPassword.valid !== true || passwordValidation.confirmPassword.valid !== true || passwordValidation.currentPassword.valid !== true}
                        className="px-6 py-3 bg-[#1E3A8A] text-white flex-1 md:flex-none rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1E3A8A]/20 flex items-center justify-center"
                      >
                        {isLoading ? 'Actualizando...' : 'Actualizar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* DEFAULT DATA VIEW */
                  <>
                    <h4 className="text-3xl font-black text-white mb-6 tracking-tight">
                      {userData.nombre_completo || "Usuario"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Phone size={14} />
                          <span className="text-[10px] font-bold tracking-wider">Teléfono</span>
                        </div>
                        <span className="font-medium text-white pl-5">{userData.telefono || "No especificado"}</span>
                      </div>

                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Mail size={14} />
                          <span className="text-[10px] font-bold tracking-wider">Email</span>
                        </div>
                        <span className="font-medium text-white pl-5 break-all">{userData.email || "No especificado"}</span>
                      </div>

                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Zap size={14} />
                          <span className="text-[10px] font-bold tracking-wider">Fecha de Nacimiento</span>
                        </div>
                        <span className="font-medium text-white pl-5">
                          {userData?.fecha_nacimiento 
                            ? new Date(userData.fecha_nacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                            : "No especificada"}
                        </span>
                      </div>

                      <div className="bg-[#0B0F14] p-4 rounded-2xl border border-gray-800/50 flex flex-col gap-1 md:col-span-2">
                        <div className="flex items-center gap-2 text-[#9CA3AF]">
                          <Shield size={14} />
                          <span className="text-[10px] font-bold tracking-wider">Rol de Cuenta</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-5 mt-2">
                          <span className="bg-[#1E3A8A]/20 text-[#3b82f6] px-3 py-1 rounded-lg text-xs font-bold tracking-wider border border-[#1E3A8A]/30">
                            {userData.rol_nombre || "Cliente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions for default view */}
            {!isEditingProfile && !isChangingPassword && (
              <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-6 py-3 bg-[#0B0F14] border border-gray-700 text-white rounded-xl font-black tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> Cambiar Contraseña
                </button>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-black tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-[#1E3A8A]/20 flex items-center justify-center gap-2"
                >
                  <User size={16} /> Editar Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Success Message */}
      {successMessage && messagePhase && (
        <div
          className={`fixed bottom-10 right-10 z-[200] flex items-center gap-3 px-6 py-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none 
          ${messagePhase === 'entering' ? 'translate-x-[120%] opacity-0' : messagePhase === 'visible' ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}
        >
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}
    </UsersLayout>
  );
};
