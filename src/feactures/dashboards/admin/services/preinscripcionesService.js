import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Ajusta si tu API está en otra URL/puerto
  withCredentials: false,
});

export const getPreinscripciones = () => api.get("/preinscripciones").then(r => r.data);
export const getPreinscripcionById = (id) => api.get(`/preinscripciones/${id}`).then(r => r.data);
export const createPreinscripcion = (payload) => api.post("/preinscripciones", payload).then(r => r.data);
export const updatePreinscripcion = (id, payload) => api.put(`/preinscripciones/${id}`, payload).then(r => r.data);
export const deletePreinscripcion = (id) => api.delete(`/preinscripciones/${id}`).then(r => r.data);
