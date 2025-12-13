// src/feactures/dashboards/admin/services/clasesService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/clases";

export const getClases = () => axios.get(API_URL).then(r => r.data);
export const getClaseById = (id) => axios.get(`${API_URL}/${id}`).then(r => r.data);
export const createClase = (data) => axios.post(API_URL,{
  ...data, instructores: data.instructores || []}).then(r => r.data);
export const updateClase = (id, data) => axios.put(`${API_URL}/${id}`, data).then(r => r.data);
export const deleteClase = (id) => axios.delete(`${API_URL}/${id}`).then(r => r.data);

// Endpoints auxiliares para obtener datos relacionados
export const getNiveles = () => axios.get("http://localhost:3000/api/niveles").then(r => r.data);
export const getSedes = () => axios.get("http://localhost:3000/api/sedes").then(r => r.data);
export const getInstructores = () => axios.get("http://localhost:3000/api/instructores").then(r => r.data);