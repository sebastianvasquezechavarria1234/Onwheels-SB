// admin/services/MatriculaService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajusta a tu backend
});

// Obtener todas las matrículas
export const getMatriculas = async () => {
  const res = await api.get("/matriculas");
  return Array.isArray(res.data) ? res.data : res.data?.matriculas ?? [];
};

// Obtener matrícula por ID
export const getMatriculaById = async (id) => {
  const res = await api.get(`/matriculas/${id}`);
  return res.data;
};

// Crear nueva matrícula
export const createMatricula = (payload) => api.post("/matriculas", payload);

// Actualizar matrícula por ID
export const updateMatricula = (id, payload) => api.put(`/matriculas/${id}`, payload);

// Eliminar matrícula por ID
export const deleteMatricula = (id) => api.delete(`/matriculas/${id}`);
