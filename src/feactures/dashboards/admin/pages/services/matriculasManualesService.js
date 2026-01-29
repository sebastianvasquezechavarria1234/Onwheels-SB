// src/services/matriculasManualesService.js
import api from "../../../../../services/api";

const API_URL = "/matriculas-manuales";

export const crearMatriculaManual = async (data) => {
  const response = await api.post(API_URL, data);
  return response.data;
};