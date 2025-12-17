// src/services/matriculasService.js
import api from "../../../../../services/api";

const API_URL = "/matriculas";

export const getMatriculas = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// Obtener todas las matrículas de un estudiante
export const getMatriculasPorEstudiante = async (id_estudiante) => {
  const response = await api.get(`${API_URL}/estudiante/${id_estudiante}`);
  return response.data;
};
export const getMatriculaById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createMatricula = async (data) => {
  const response = await api.post(API_URL, data);
  return response.data;
};

export const updateMatricula = async (id, data) => {
  const response = await api.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteMatricula = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};