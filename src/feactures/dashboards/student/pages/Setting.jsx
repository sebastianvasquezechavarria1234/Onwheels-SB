import React, { useState, useEffect, useRef } from "react";
import { Layout } from "../../student/layout/layout";
import { Mail, Phone, Edit2, Lock, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

export const Setting = () => {
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
      // devolver siempre el json (para leer mensajes del backend)
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        // incluir status para el frontend si quiere diferenciar
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
        // tratar como no válido si el servidor responde error
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

  if (loading) {
    return (
      <Layout>
        <section className="p-[30px]">
          <div className="text-center text-gray-600">Cargando perfil...</div>
        </section>
      </Layout>
    );
  }

  // Validación para nueva contraseña con número y caracter especial
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
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasMinLength) {
      setPasswordValidation(prev => ({
        ...prev,
        newPassword: { valid: false, message: "Mínimo 6 caracteres" }
      }));
    } else if (!hasNumber) {
      setPasswordValidation(prev => ({
        ...prev,
        newPassword: { valid: false, message: "Debe contener al menos 1 número" }
      }));
    } else if (!hasSpecialChar) {
      setPasswordValidation(prev => ({
        ...prev,
        newPassword: { valid: false, message: "Debe contener al menos 1 caracter especial" }
      }));
    } else {
      setPasswordValidation(prev => ({
        ...prev,
        newPassword: { valid: true, message: "Contraseña válida" }
      }));
    }
  };

  // Chequear si newPassword y confirmPassword coinciden
  const validateConfirmPassword = (confirm) => {
    if (!confirm) {
      setPasswordValidation(prev => ({
        ...prev,
        confirmPassword: { valid: null, message: "" }
      }));
      return;
    }
    if (passwordData.newPassword === confirm) {
      setPasswordValidation(prev => ({
        ...prev,
        confirmPassword: { valid: true, message: "Las contraseñas coinciden" }
      }));
    } else {
      setPasswordValidation(prev => ({
        ...prev,
        confirmPassword: { valid: false, message: "Las contraseñas no coinciden" }
      }));
    }
  };

  // Verificación en tiempo real con debounce y abort (para el campo contraseña actual)
  const scheduleVerifyCurrentPassword = (value) => {
    // limpiar timeout anterior
    if (verifyTimeout.current) {
      clearTimeout(verifyTimeout.current);
      verifyTimeout.current = null;
    }
    // abortar petición anterior si existiera
    if (lastAbortController.current) {
      try { lastAbortController.current.abort(); } catch (e) {}
      lastAbortController.current = null;
    }

    if (!value) {
      setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: null, message: "" } }));
      return;
    }

    // debounce 600ms
    verifyTimeout.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        lastAbortController.current = controller;

        const userId = getCurrentUserId();
        const resp = await api.verifyCurrentPassword(userId, value, controller.signal);

        if (resp && typeof resp.valid !== "undefined") {
          if (resp.valid) {
            setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: true, message: "Contraseña actual correcta" } }));
          } else {
            setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "Contraseña actual incorrecta" } }));
          }
        } else {
          setPasswordValidation(prev => ({ ...prev, currentPassword: { valid: false, message: "No se pudo verificar" } }));
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          // petición abortada: no hacer nada
          return;
        }
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
      const updateData = {
        nombre_completo: editData.nombre_completo,
        telefono: editData.telefono
      };
      
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
      
      const updateData = {
        contrasena: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        confirmPassword: passwordData.confirmPassword
      };
      
      const response = await api.updateUsuario(userId, updateData);
      setUserData(response.usuario);
      setSuccessMessage(response.mensaje || "Contraseña actualizada correctamente");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordValidation({
        currentPassword: { valid: null, message: "" },
        newPassword: { valid: null, message: "" },
        confirmPassword: { valid: null, message: "" }
      });
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
    setEditData({
      nombre_completo: userData.nombre_completo || "",
      telefono: userData.telefono || ""
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
    // abort any pending verify request
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
      <section className="p-[30px] relative w-full">
        <h2 className="font-primary text-2xl mb-6">Mi perfil</h2>

        <div className="flex items-center gap-[30px] mt-[80px]">
          <picture className="relative w-[200px] h-[200px] rounded-full flex justify-center items-center bg-gray-100">
            <img 
              className="w-full h-full object-cover rounded-full" 
              src="https://placehold.co/200x200/3b82f6/ffffff?text=SV" 
              alt="avatar" 
            />
          </picture>

          <div className="flex flex-col gap-[10px]">
            <span className="inline-flex justify-center w-[100px] items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-green-100 text-green-700">
              <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
              Activo
            </span>
            
            {isEditingProfile ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.nombre_completo}
                  onChange={(e) => setEditData({...editData, nombre_completo: e.target.value})}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
                <input
                  type="tel"
                  value={editData.telefono}
                  onChange={(e) => setEditData({...editData, telefono: e.target.value})}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Teléfono"
                />
                
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg font-semibold ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    onClick={handleCancelProfile}
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
                {successMessage && <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-lg">{successMessage}</div>}
                {passwordError && <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">{passwordError}</div>}
              </div>
            ) : isChangingPassword ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPasswordData(prev => ({ ...prev, currentPassword: val }));
                      scheduleVerifyCurrentPassword(val);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese su contraseña actual"
                  />
                  {passwordValidation.currentPassword.message && (
                    <p className={`text-sm mt-1 ${passwordValidation.currentPassword.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.currentPassword.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPasswordData(prev => ({ ...prev, newPassword: val }));
                        validateNewPassword(val);
                        // revalidate confirm
                        validateConfirmPassword(passwordData.confirmPassword);
                      }}
                      className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                        passwordValidation.newPassword.valid === true 
                          ? 'border-green-500 focus:ring-green-500' 
                          : passwordValidation.newPassword.valid === false 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Mínimo 6 caracteres + 1 número + 1 caracter especial"
                    />
                    {passwordValidation.newPassword.valid !== null && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {passwordValidation.newPassword.valid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {passwordValidation.newPassword.message && (
                    <p className={`text-sm mt-1 ${passwordValidation.newPassword.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPasswordData(prev => ({ ...prev, confirmPassword: val }));
                        validateConfirmPassword(val);
                      }}
                      className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                        passwordValidation.confirmPassword.valid === true 
                          ? 'border-green-500 focus:ring-green-500' 
                          : passwordValidation.confirmPassword.valid === false 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Repita la nueva contraseña"
                    />
                    {passwordValidation.confirmPassword.valid !== null && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {passwordValidation.confirmPassword.valid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {passwordValidation.confirmPassword.message && (
                    <p className={`text-sm mt-1 ${passwordValidation.confirmPassword.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValidation.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleSavePassword}
                    disabled={isLoading || passwordValidation.newPassword.valid !== true || passwordValidation.confirmPassword.valid !== true || passwordValidation.currentPassword.valid !== true}
                    className={`px-4 py-2 rounded-lg font-semibold ${isLoading || passwordValidation.newPassword.valid !== true || passwordValidation.confirmPassword.valid !== true || passwordValidation.currentPassword.valid !== true ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                  >
                    {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                  <button
                    onClick={handleCancelPassword}
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {successMessage && (
                  <div className="mt-2 p-2 bg-green-100 text-green-700 rounded-lg">
                    {successMessage}
                  </div>
                )}
                {passwordError && (
                  <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg">
                    {passwordError}
                  </div>
                )}
              </div>
            ) : (
              <>
                <h4 className="font-primary text-xl">{userData?.nombre_completo}</h4>
                <div className="flex gap-[20px]">
                  <div className="flex gap-[10px] items-center">
                    <span className="w-[60px] h-[60px] flex justify-center items-center bg-blue-600 rounded-full">
                      <Phone color="white" size={20} strokeWidth={1.3} />
                    </span>
                    <p className="font-semibold">{userData?.telefono}</p>
                  </div>
                  <div className="flex gap-[10px] items-center">
                    <span className="w-[60px] h-[60px] flex justify-center items-center bg-blue-600 rounded-full">
                      <Mail color="white" size={20} strokeWidth={1.3} />
                    </span>
                    <p className="font-semibold">{userData?.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={16} /> Editar perfil
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors flex items-center gap-2"
                  >
                    <Lock size={16} /> Cambiar contraseña
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};
