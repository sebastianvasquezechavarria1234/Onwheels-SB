// src/feactures/dashboards/admin/services/nivelesService.js
import api from "../../../../../services/api";

const API_URL = "/niveles";

export const getNiveles = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

export const getNivelById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

export const createNivel = async (nivelData) => {
  const res = await api.post(API_URL, nivelData);
  return res.data;
};

export const updateNivel = async (id, nivelData) => {
  const res = await api.put(`${API_URL}/${id}`, nivelData);
  return res.data;
};

export const deleteNivel = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};