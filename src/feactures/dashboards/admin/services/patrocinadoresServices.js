// admin/services/patrocinadoresService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // Ajusta según tu backend
});

export const getPatrocinadores = async () => {
  const res = await api.get("/patrocinadores");
  return Array.isArray(res.data) ? res.data : [];
};

export const getPatrocinadorById = (id) => api.get(`/patrocinadores/${id}`);

export const createPatrocinador = (payload) =>
  api.post("/patrocinadores", payload);

export const updatePatrocinador = (id, payload) =>
  api.put(`/patrocinadores/${id}`, payload);

export const deletePatrocinador = (id) =>
  api.delete(`/patrocinadores/${id}`);
