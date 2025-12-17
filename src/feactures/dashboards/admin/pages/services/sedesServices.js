// services/sedesServices.js
import api from "../../../../../services/api";

const API_Endpoint = "/sedes";

export const getSedes = async () => {
  const res = await api.get(API_Endpoint);
  return res.data;
};

export const createSede = async (data) => {
  const res = await api.post(API_Endpoint, data);
  return res.data;
};

export const updateSede = async (id, data) => {
  const res = await api.put(`${API_Endpoint}/${id}`, data);
  return res.data;
};

export const deleteSede = async (id) => {
  const res = await api.delete(`${API_Endpoint}/${id}`);
  return res.data;
};