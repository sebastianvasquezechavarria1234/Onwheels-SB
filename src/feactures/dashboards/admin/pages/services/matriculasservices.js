// src/services/matriculasServices.js
// src/services/matriculasServices.js
import api from "../../../../../services/api";

const API_URL = "/matriculas";

export const createMatricula = async (matriculaData) => {
  const response = await api.post(API_URL, matriculaData);
  return response.data;
};