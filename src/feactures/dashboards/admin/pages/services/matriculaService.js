// admin/services/matriculasService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajusta si tu backend usa otro puerto o prefijo
});

// ✅ Obtener todas las matrículas
export const getMatriculas = async () => {
  const res = await api.get("/matriculas");
  return Array.isArray(res.data) ? res.data : [];
};

// ✅ Obtener matrícula por ID
export const getMatriculaById = (id) => api.get(`/matriculas/${id}`);

// ✅ Crear matrícula
export const createMatricula = (payload) => api.post("/matriculas", payload);

// ✅ Actualizar matrícula
export const updateMatricula = (id, payload) =>
  api.put(`/matriculas/${id}`, payload);

// ✅ Eliminar matrícula
export const deleteMatricula = (id) => api.delete(`/matriculas/${id}`);
