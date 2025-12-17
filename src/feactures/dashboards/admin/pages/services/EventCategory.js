// services/EventCategory.js
import api from "../../../../../services/api";

const API_URL = "/categorias-eventos"; // ✅ plural

// ⭐ Obtener todas
export const getCategoriasEventos = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

// ⭐ Obtener por ID
export const getCategoriaEventoById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

// ⭐ Crear
export const createCategoriaEvento = async (data) => {
  const res = await api.post(API_URL, data);
  return res.data;
};

// ⭐ Actualizar
export const updateCategoriaEvento = async (id, data) => {
  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data;
};

// ⭐ Eliminar
export const deleteCategoriaEvento = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};