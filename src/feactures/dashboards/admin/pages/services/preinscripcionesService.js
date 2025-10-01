import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", 
});

export const getPreinscripciones = async () => {
  const res = await api.get("/preinscripciones");
  return res.data;
};

export const getPreinscripcionById = async (id) => {
  const res = await api.get(`/preinscripciones/${id}`);
  return res.data;
};

export const createPreinscripcion = async (payload) => {
  const res = await api.post("/preinscripciones", payload);
  return res.data; 
};

export const updatePreinscripcion = async (id, payload) => {
  const res = await api.put(`/preinscripciones/${id}`, payload);
  return res.data;
};

export const deletePreinscripcion = async (id) => {
  const res = await api.delete(`/preinscripciones/${id}`);
  return res.data;
};
