// src/feactures/dashboards/admin/services/instructoresServices.js
import api from "../../../../../services/api";

const API_URL = "/instructores";

// ✅ Obtener todos los instructores
export const getInstructores = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// ✅ Obtener instructor por ID
export const getInstructorById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

// ✅ Crear instructor
export const createInstructor = async (instructorData) => {
  const response = await api.post(API_URL, instructorData);
  return response.data;
};

// ✅ Actualizar instructor
export const updateInstructor = async (id, instructorData) => {
  const response = await api.put(`${API_URL}/${id}`, instructorData);
  return response.data;
};

// ✅ Desactivar instructor (soft delete)
export const deleteInstructor = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

// ✅ Obtener usuarios que NO son instructores (para el select de creación)
export const getUsuariosNoInstructores = async () => {
  const response = await api.get(`${API_URL}/usuarios/disponibles`);
  return response.data;
};