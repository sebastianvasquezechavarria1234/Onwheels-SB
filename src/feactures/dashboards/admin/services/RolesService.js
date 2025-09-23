// admin/services/rolesService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // cambia si tu API usa otra ruta o puerto
  // timeout: 5000,
});

// Obtener lista de roles
export const getRoles = async () => {
  const res = await api.get("/getRoles"); // o '/roles' según tu backend
  return Array.isArray(res.data) ? res.data : res.data?.roles ?? [];
};

// (opcional) otros helpers CRUD para cuando quieras persistir
export const createRole = (payload) => api.post("/roles", payload);
export const updateRole = (id, payload) => api.put(`/roles/${id}`, payload);
export const deleteRole = (id) => api.delete(`/roles/${id}`);
