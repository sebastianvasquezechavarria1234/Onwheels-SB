// src/services/matriculasManualesService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/matriculas-manuales";

export const crearMatriculaManual = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};