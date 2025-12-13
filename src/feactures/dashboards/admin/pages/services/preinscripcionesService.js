// src/services/preinscripcionesServices.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/preinscripciones";

// -------------------------------------------------
// Listar preinscripciones pendientes
// -------------------------------------------------
export const getPreinscripcionesPendientes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// -------------------------------------------------
// Obtener preinscripción por ID
// -------------------------------------------------
export const getPreinscripcionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// -------------------------------------------------
// Crear preinscripción (USUARIO NORMAL)
// -------------------------------------------------
export const crearPreinscripcion = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

// -------------------------------------------------
// Rechazar preinscripción (ADMIN) — usa la ruta correcta
// -------------------------------------------------
export const rechazarPreinscripcion = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/rechazar`);
  return response.data;
};

// -------------------------------------------------
// Aceptar preinscripción y crear matrícula (ADMIN) — usa la ruta correcta
// -------------------------------------------------
export const aceptarPreinscripcionYCrearMatricula = async (id, data) => {
  // data = { id_clase, id_plan, fecha_matricula }
  const response = await axios.post(`${API_URL}/${id}/aceptar`, data);
  return response.data;
};