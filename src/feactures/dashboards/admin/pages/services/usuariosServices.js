import api from "../../../../../services/api";

const API_URL = "/usuarios";

export const getUsuarios = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

export const createUsuario = async (data) => {
  const res = await api.post(API_URL, data);
  return res.data;
};

export const updateUsuario = async (id, data) => {
  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteUsuario = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};
