// src/services/matriculasServices.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/matriculas";

export const createMatricula = async (matriculaData) => {
  const response = await axios.post(API_URL, matriculaData);
  return response.data;
};