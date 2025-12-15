// src/services/matriculasService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/matriculas";

export const getMatriculas = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Obtener todas las matrículas de un estudiante
export const getMatriculasPorEstudiante = async (id_estudiante) => {
  const response = await axios.get(`http://localhost:3000/api/matriculas/estudiante/${id_estudiante}`);
  return response.data;
};
export const getMatriculaById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createMatricula = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateMatricula = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteMatricula = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};