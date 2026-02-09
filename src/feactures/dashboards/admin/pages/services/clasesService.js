// src/feactures/dashboards/admin/services/clasesService.js
import api from "../../../../../services/api";

const API_URL = "/clases";

export const getClases = () => api.get(API_URL).then(r => r.data);
export const getClaseById = (id) => api.get(`${API_URL}/${id}`).then(r => r.data);
export const createClase = (data) => api.post(API_URL, {
  ...data, instructores: data.instructores || []
}).then(r => r.data);
export const updateClase = (id, data) => api.put(`${API_URL}/${id}`, data).then(r => r.data);
export const deleteClase = (id) => api.delete(`${API_URL}/${id}`).then(r => r.data);

// Endpoints auxiliares para obtener datos relacionados
export const getNiveles = () => api.get("/niveles").then(r => r.data);
export const getSedes = () => api.get("/sedes").then(r => r.data);
export const getInstructores = () => api.get("/instructores").then(r => r.data);