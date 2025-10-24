// admin/services/rolesService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // apunta a tu prefijo de rutas
});

// Obtener lista de roles
export const getRoles = async () => {
  const res = await api.get("/roles"); 
  return Array.isArray(res.data) ? res.data : res.data?.roles ?? [];
};

// Crear rol
export const createRole = (payload) => api.post("/roles", payload);

// Actualizar rol
export const updateRole = (id, payload) => api.put(`/roles/${id}`, payload);

// Eliminar rol
export const deleteRole = (id) => api.delete(`/roles/${id}`);
