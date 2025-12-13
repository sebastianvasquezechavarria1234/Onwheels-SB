
import axios from "axios";
// ⚠️ ASEGÚRATE DE USAR EL MISMO PUERTO QUE TU BACKEND (3000 según tus logs)
const API_URL = "http://localhost:3000/api/estudiantes";
const API_USUARIOS = "http://localhost:3000/api/usuarios";
const API_ACUDIENTES = "http://localhost:3000/api/acudientes";

export const getEstudiantes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getEstudianteById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createEstudiante = async (estudianteData) => {
  const response = await axios.post(API_URL, estudianteData);
  return response.data;
};

export const updateEstudiante = async (id, estudianteData) => {
  const response = await axios.put(`${API_URL}/${id}`, estudianteData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteEstudiante = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Servicios para datos relacionados
export const getUsuariosActivos = async () => {
  const response = await axios.get(`${API_USUARIOS}`);
  // Filtrar solo usuarios activos si es necesario
  return response.data.filter(usuario => usuario.estado !== false);
};

export const getAcudientes = async () => {
  const response = await axios.get(API_ACUDIENTES);
  return response.data;
};

export const createAcudiente = async (acudienteData) => {
  const response = await axios.post(API_ACUDIENTES, acudienteData);
  return response.data;
};

// Servicios adicionales para preinscripciones
export const getPreinscripcionesPendientes = async () => {
  const response = await axios.get(`${API_URL}/preinscripciones/pendientes`);
  return response.data;
};

export const updateEstadoEstudiante = async (id, estado) => {
  const response = await axios.put(`${API_URL}/${id}/estado`, { estado });
  return response.data;
};