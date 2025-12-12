import React, { useState, useEffect, useRef } from "react";
import { Layout } from "../../instructor/layout/layout";
import { Mail, Phone, User, Lock, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

export const SettingInstructor = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editData, setEditData] = useState({
    nombre_completo: "",
    telefono: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordValidation, setPasswordValidation] = useState({
    currentPassword: { valid: null, message: "" },
    newPassword: { valid: null, message: "" },
    confirmPassword: { valid: null, message: "" }
  });
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // refs para debounce + abort
  const verifyTimeout = useRef(null);
  const lastAbortController = useRef(null);

  // anim timers refs para mensaje
  const enterTimerRef = useRef(null);
  const visibleTimerRef = useRef(null);
  const exitTimerRef = useRef(null);

  // fase del mensaje: null | 'entering' | 'visible' | 'exiting'
  const [messagePhase, setMessagePhase] = useState(null);

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id_usuario;
  };

  const getCurrentUserToken = () => {
    return localStorage.getItem('token');
  };

  const api = {
    getUsuario: async (id) => {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${getCurrentUserToken()}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener usuario');
      return response.json();
    },
    
    updateUsuario: async (id, userData) => {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCurrentUserToken()}`
        },
        body: JSON.stringify(userData)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        data._status = response.status;
        throw data;
      }
      return data;
    },

    verifyCurrentPassword: async (id, currentPassword, signal) => {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCurrentUserToken()}`
        },
        body: JSON.stringify({ currentPassword }),
        signal
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { valid: false, ...errData };
      }
      return response.json();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          window.location.href = '/login';
          return;
        }
        
        const data = await api.getUsuario(userId);
        setUserData(data);
        setEditData({
          nombre_completo: data.nombre_completo || "",
          telefono: data.telefono || ""
        });
      } catch (error) {
        console.error("Error fetching user ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ---- NEW: control de animación del mensaje de éxito ----
  const ENTER_DUR = 400;
  const VISIBLE_DUR = 3500; // 3.5s
  const EXIT_DUR = 400;

  useEffect(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (visibleTimerRef.current) {
      clearTimeout(visibleTimerRef.current);
      visibleTimerRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (!successMessage) {
      setMessagePhase(null);
      return;
    }

    setMessagePhase('entering');

    enterTimerRef.current = setTimeout(() => {
      setMessagePhase('visible');
    }, ENTER_DUR);

    visibleTimerRef.current = setTimeout(() => {
      setMessagePhase('exiting');
    }, ENTER_DUR + VISIBLE_DUR);

    exitTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      setMessagePhase(null);
    }, ENTER_DUR + VISIBLE_DUR + EXIT_DUR);

    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      enterTimerRef.current = visibleTimerRef.current = exitTimerRef.current = null;
    };
  }, [successMessage]);

  useEffect(() => {
    return () => {
      if (verifyTimeout.current) clearTimeout(verifyTimeout.current);
      if (lastAbortController.current) {
        try { lastAbortController.current.abort(); } catch {}
      }
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <section className="p-[30px]">
          <div className="text-center text-gray-600">Cargando perfil...</div>
        </section>
      </Layout>
    );
  }

  // Validación nueva contraseña: mínimo 6 caracteres + (al menos 1 número OR 1 caracter especial)
  const validateNewPassword = (password) => {
    if (!password) {
      setPasswordValidation(prev => ({
        ...prev,
        newPassword: { valid: null, message: "" }
      }));
      return;
    }

    const hasMinLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength) {
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: false, message: "Mínimo 6 caracteres" } }));
    } else if (!(hasNumber || hasSpecialChar)) {
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: false, message: "Debe contener al menos 1 número o 1 caracter especial" } }));
    } else {
      setPasswordValidation(prev => ({ ...prev, newPassword: { valid: true, message: "Contraseña válida" } }));
    }
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) {
      setPasswordValidation(prev => ({ ...prev, confirmPassword: { valid: null, message: "" } }));
      return;
    }
    if (passwordData.newPassword === confirm) {
      setPasswordValidation(prev => ({ ...prev, confirmPassword: { valid: true, message: "Las contraseñas coinciden" } }));
    } else {
      setPasswordValidation(prev => ({ ...prev, confirmPassword: { valid: false, message: "Las contraseñas no coinciden" } }));
    }
  };

  const scheduleVerifyCurrentPassword = (value) => {
    if (verifyTimeout.current) {
      clearTimeout(verifyTimeout.current);
      verifyTimeout.current = null;
    }
    if (lastAbortController.current) {
      try { lastAbortController.current.abort(); } catch (e) {}
      lastAbortController.current = null;
    }

    if (!value) {
      setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: null, message: "" } }));
      return;
    }

    verifyTimeout.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        lastAbortController.current = controller;

        const userId = getCurrentUserId();
        const resp = await api.verifyCurrentPassword(userId, value, controller.signal);

        if (resp && typeof resp.valid !== 'undefined') {
          if (resp.valid) {
            setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: true, message: "Contraseña actual correcta" } }));
          } else {
            setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "Contraseña actual incorrecta" } }));
          }
        } else {
          setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "No se pudo verificar" } }));
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("Error verify current password:", err);
        setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "Error al verificar" } }));
      } finally {
        lastAbortController.current = null;
      }
    }, 600);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setPasswordError("");
    setSuccessMessage("");
    try {
      const userId = getCurrentUserId();
      const updateData = { nombre_completo: editData.nombre_completo, telefono: editData.telefono };
      const response = await api.updateUsuario(userId, updateData);
      setUserData(response.usuario);
      setSuccessMessage("Perfil actualizado correctamente");
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
      if (error && error.mensaje) setPasswordError(error.mensaje);
      else setPasswordError("Error al actualizar el perfil. Por favor intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setIsLoading(true);
    setPasswordError("");
    setSuccessMessage("");

    try {
      const userId = getCurrentUserId();
      if (!passwordData.currentPassword) {
        setPasswordError("Debe ingresar su contraseña actual");
        setIsLoading(false);
        return;
      }
      if (passwordValidation.newPassword.valid !== true) {
        setPasswordError("La nueva contraseña no cumple con los requisitos");
        setIsLoading(false);
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("La nueva contraseña y la confirmación no coinciden");
        setIsLoading(false);
        return;
      }
      if (passwordValidation.currentPassword.valid !== true) {
        setPasswordError("La contraseña actual no coincide");
        setIsLoading(false);
        return;
      }

      const updateData = { contrasena: passwordData.newPassword, currentPassword: passwordData.currentPassword, confirmPassword: passwordData.confirmPassword };
      const response = await api.updateUsuario(userId, updateData);
      setUserData(response.usuario);
      setSuccessMessage(response.mensaje || "Contraseña actualizada correctamente");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordValidation({ currentPassword: { valid: null, message: "" }, newPassword: { valid: null, message: "" }, confirmPassword: { valid: null, message: "" } });
      setIsChangingPassword(false);
    } catch (error) {
      console.error("Error al guardar contraseña:", error);
      if (error && error.mensaje) setPasswordError(error.mensaje);
      else setPasswordError("Error al actualizar la contraseña. Verifique sus datos e intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setEditData({ nombre_completo: userData.nombre_completo || "", telefono: userData.telefono || "" });
    setPasswordError("");
    setSuccessMessage("");
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordValidation({ currentPassword: { valid: null, message: "" }, newPassword: { valid: null, message: "" }, confirmPassword: { valid: null, message: "" } });
    setPasswordError("");
    setSuccessMessage("");
    if (lastAbortController.current) {
      try { lastAbortController.current.abort(); } catch (e) {}
      lastAbortController.current = null;
    }
    if (verifyTimeout.current) {
      clearTimeout(verifyTimeout.current);
      verifyTimeout.current = null;
    }
  };

  return (
    <Layout>
      <style>{`
        .msg-wrap {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: 17px;
          border-radius: 22px;
          background: #ECFDF5;
          color: #40c17eff;
          font-weight: 600;
          will-change: transform, opacity;
        }
        .msg-entering { transform: translateX(-120%); opacity: 0; animation: slideInFromLeft ${ENTER_DUR}ms cubic-bezier(.2,.9,.2,1) forwards; }
        .msg-visible { transform: translateX(0); opacity: 1; }
        .msg-exiting { transform: translateX(0); opacity: 1; animation: slideOutToLeft ${EXIT_DUR}ms cubic-bezier(.3,.1,.25,1) forwards; }
        @keyframes slideInFromLeft { 0% { transform: translateX(-120%); opacity: 0; } 60% { transform: translateX(12%); opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutToLeft { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-120%); opacity: 0; } }
      `}</style>

      <section className="p-[30px] relative w-[100%]">
        <h2 className="font-primary">Mi perfil</h2>

        <div className="flex items-start gap-[30px] mt-[80px]">

          <picture className="relative w-[200px] h-[200px] rounded-full flex justify-center items-center">
            <img className="w-full h-full object-cover opacity-50" src="https://tse4.mm.bing.net/th/id/OIP.XmX3OORybgBCLw-Xd6rYrQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="avatar" />
          </picture>

          <div className="flex flex-col gap-[10px]">
            <span className="inline-flex justify-center w-[100px] items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-green-100 text-green-700">
              <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
              Activo
            </span>

            {isEditingProfile ? (
              <div className="w-[400px] block space-y-4">
                <h3 className="italic mt-[30px]">Editar perfil</h3>
                <label className="mb-[10px] block">
                  <p className="translate-x-[20px] font-bold! italic">Nombre completo:</p>
                  <input type="text" value={editData.nombre_completo} onChange={(e)=>setEditData({...editData,nombre_completo:e.target.value})} className="input w-[200px]" placeholder="Nombre completo" />
                </label>
                <label className="mb-[10px] block">
                  <p className="translate-x-[20px] font-bold! italic">Telefono:</p>
                  <input type="tel" value={editData.telefono} onChange={(e)=>setEditData({...editData,telefono:e.target.value})} className="input" placeholder="Teléfono" />
                </label>

                <div className="flex gap-[10px] pt-2">
                  <button onClick={handleSaveProfile} disabled={isLoading} className={`btn ${isLoading? 'bg-blue-100 cursor-not-allowed':'bg-blue-100 text-blue-600'} text-blue-500 transition-colors`}><h4>{isLoading? 'Guardando...':'Guardar cambios'}</h4></button>
                  <button onClick={handleCancelProfile} className="btn bg-red-100 text-red-500"><h4>Cancelar</h4></button>
                </div>
                {passwordError && <div className="mt-2 p-[12px] rounded-[16px] bg-red-100 text-red-700">{passwordError}</div>}
              </div>
            ) : isChangingPassword ? (
              <div className="space-y-4 max-w-md">
                <h3 className="italic mt-[30px]">Cambiar contraseña</h3>

                <label className="mb-[10px] block">
                  <p className="translate-x-[20px] font-bold! italic">Contraseña actual:</p>
                  <input type="password" value={passwordData.currentPassword} onChange={(e)=>{const val=e.target.value; setPasswordData(prev=>({...prev,currentPassword:val})); scheduleVerifyCurrentPassword(val);}} className="input" placeholder="Ingrese su contraseña actual" />
                </label>
                {passwordValidation.currentPassword.message && (<p className={`text-sm mt-1 ${passwordValidation.currentPassword.valid? 'text-green-600':'text-red-600'}`}>{passwordValidation.currentPassword.message}</p>)}

                <label className="mb-[10px] block">
                  <p className="translate-x-[20px] font-bold! italic">Nueva contraseña:</p>
                  <input type="password" value={passwordData.newPassword} onChange={(e)=>{const val=e.target.value; setPasswordData(prev=>({...prev,newPassword:val})); validateNewPassword(val); validateConfirmPassword(passwordData.confirmPassword);}} className="input" placeholder="Mínimo 6 caracteres + 1 número o 1 caracter especial" />
                </label>
                {passwordValidation.newPassword.message && (<p className={`text-sm mt-1 ${passwordValidation.newPassword.valid? 'text-green-600':'text-red-600'}`}>{passwordValidation.newPassword.message}</p>)}

                <label className="mb-[10px] block">
                  <p className="translate-x-[20px] font-bold! italic">Confirmar nueva contraseña:</p>
                  <input type="password" value={passwordData.confirmPassword} onChange={(e)=>{const val=e.target.value; setPasswordData(prev=>({...prev,confirmPassword:val})); validateConfirmPassword(val);}} className="input" placeholder="Repita la nueva contraseña" />
                </label>
                {passwordValidation.confirmPassword.message && (<p className={`text-sm mt-1 ${passwordValidation.confirmPassword.valid? 'text-green-600':'text-red-600'}`}>{passwordValidation.confirmPassword.message}</p>)}

                <div className="flex gap-[10px] pt-2">
                  <button onClick={handleSavePassword} disabled={isLoading || passwordValidation.newPassword.valid !== true || passwordValidation.confirmPassword.valid !== true || passwordValidation.currentPassword.valid !== true} className={`btn min-w-[220px] flex items-center justify-center ${isLoading || passwordValidation.newPassword.valid !== true || passwordValidation.confirmPassword.valid !== true || passwordValidation.currentPassword.valid !== true ? 'bg-blue-100 cursor-not-allowed text-blue-300' : 'bg-blue-100 text-blue-600'} transition-colors`}><h4>{isLoading? 'Actualizando...':'Actualizar contraseña'}</h4></button>
                  <button onClick={handleCancelPassword} className="btn bg-red-100 text-red-500"><h4>Cancelar</h4></button>
                </div>

                {passwordError && (<div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">{passwordError}</div>)}
              </div>
            ) : (
              <>
                <h3 className="font-primary italic font-bold! mt-[30px]">{userData?.nombre_completo}</h3>
                <div className="flex gap-[20px]">
                  <div className="flex gap-[10px] items-center">
                    <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full"><Phone color="white" size={20} strokeWidth={1.3} /></span>
                    <p className="font-semibold!">{userData?.telefono}</p>
                  </div>
                  <div className="flex gap-[10px] items-center">
                    <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full"><Mail color="white" size={20} strokeWidth={1.3} /></span>
                    <p className="font-semibold! underline">{userData?.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={()=>setIsEditingProfile(true)} className="btn bg-blue-100 flex items-center gap-[10px] text-blue-600"><h4>Editar perfil</h4></button>
                  <button onClick={()=>setIsChangingPassword(true)} className="btn bg-gray-200 flex items-center gap-[10px] text-gray-700"><h4>Cambiar contraseña</h4></button>
                </div>
              </>
            )}

            {successMessage && (
              <div className={`msg-wrap ${messagePhase === 'entering' ? 'msg-entering' : messagePhase === 'visible' ? 'msg-visible' : messagePhase === 'exiting' ? 'msg-exiting' : ''}`}>
                <CheckCircle className="w-5 h-5" />
                <span>{successMessage}</span>
              </div>
            )}

          </div>
        </div>
      </section>
    </Layout>
  );
};
