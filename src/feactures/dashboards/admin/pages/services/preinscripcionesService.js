// src/services/preinscripcionesServices.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/preinscripciones";

export const getPreinscripcionesPendientes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getPreinscripcionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const actualizarEstadoPreinscripcion = async (id, estado) => {
  const response = await axios.put(`${API_URL}/${id}/estado`, { estado });
  return response.data;
};