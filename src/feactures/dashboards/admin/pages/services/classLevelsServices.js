// src/feactures/dashboards/admin/services/nivelesService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/niveles";

export const getNiveles = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getNivelById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createNivel = async (nivelData) => {
  const res = await axios.post(API_URL, nivelData);
  return res.data;
};

export const updateNivel = async (id, nivelData) => {
  const res = await axios.put(`${API_URL}/${id}`, nivelData);
  return res.data;
};

export const deleteNivel = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};