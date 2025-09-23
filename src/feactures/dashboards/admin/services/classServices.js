// admin/services/ClassService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajusta puerto/base según tu backend
});

// Obtener todas las clases
export const getClases = async () => {
  const res = await api.get("/clases");
  return Array.isArray(res.data) ? res.data : res.data?.clases ?? [];
};

// Crear nueva clase
export const createClase = (payload) => api.post("/clases", payload);

// Actualizar clase por ID
export const updateClase = (id, payload) => api.put(`/clases/${id}`, payload);

// Eliminar clase por ID
export const deleteClase = (id) => api.delete(`/clases/${id}`);
