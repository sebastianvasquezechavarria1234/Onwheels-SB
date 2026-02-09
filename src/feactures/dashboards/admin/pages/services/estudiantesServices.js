import api from "../../../../../services/api";

const ENDPOINT = "/estudiantes";
const ENDPOINT_USUARIOS = "/usuarios";
const ENDPOINT_ACUDIENTES = "/acudientes";

export const getEstudiantes = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

export const getEstudianteById = async (id) => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
};

export const createEstudiante = async (estudianteData) => {
  const response = await api.post(ENDPOINT, estudianteData);
  return response.data;
};

export const updateEstudiante = async (id, estudianteData) => {
  const response = await api.put(`${ENDPOINT}/${id}`, estudianteData);
  return response.data;
};

export const deleteEstudiante = async (id) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};

// Servicios para datos relacionados
export const getUsuariosActivos = async () => {
  const response = await api.get(ENDPOINT_USUARIOS);
  // Filtrar solo usuarios activos si es necesario
  return response.data ? response.data.filter(usuario => usuario.estado !== false) : [];
};

export const getAcudientes = async () => {
  const response = await api.get(ENDPOINT_ACUDIENTES);
  return response.data;
};

export const createAcudiente = async (acudienteData) => {
  const response = await api.post(ENDPOINT_ACUDIENTES, acudienteData);
  return response.data;
};

// Servicios adicionales para preinscripciones
export const getPreinscripcionesPendientes = async () => {
  const response = await api.get(`${ENDPOINT}/preinscripciones/pendientes`);
  return response.data;
};

export const updateEstadoEstudiante = async (id, estado) => {
  const response = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return response.data;
};