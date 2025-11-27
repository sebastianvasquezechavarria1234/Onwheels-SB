// src/services/RolesService.js (CORRECTO)
import axios from "axios";

const API_URL = "http://localhost:3000/api/roles";

export const getRoles = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createRole = async (rolData) => {
  const response = await axios.post(API_URL, rolData);
  return response.data;
};

export const updateRole = async (id, rolData) => {
  const response = await axios.put(`${API_URL}/${id}`, rolData);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};