import axios from "axios";

const API = "http://localhost:3000/api";

// 🔹 Eventos
export const getEventos = async () => {
  const res = await axios.get(`${API}/eventos`);
  return res.data;
};

export const createEvento = async (evento) => {
  const res = await axios.post(`${API}/eventos`, evento);
  return res.data;
};

export const updateEvento = async (id, evento) => {
  const res = await axios.put(`${API}/eventos/${id}`, evento);
  return res.data;
};

export const deleteEvento = async (id) => {
  const res = await axios.delete(`${API}/eventos/${id}`);
  return res.data;
};

// 🔹 Categorías
export const getCategorias = async () => {
  const res = await axios.get(`${API}/categorias`);
  return res.data;
};

// 🔹 Patrocinadores
export const getPatrocinadores = async () => {
  const res = await axios.get(`${API}/patrocinadores`);
  return res.data;
};

// 🔹 Sedes
export const getSedes = async () => {
  const res = await axios.get(`${API}/sedes`);
  return res.data;
};
