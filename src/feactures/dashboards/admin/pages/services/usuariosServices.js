import axios from "axios";

const API_URL = "http://localhost:3000/api/usuarios";

export const getUsuarios = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createUsuario = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateUsuario = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteUsuario = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
