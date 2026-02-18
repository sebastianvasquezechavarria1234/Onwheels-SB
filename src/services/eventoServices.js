import api from './api';

// Obtener todos los eventos
export const getEventos = async () => {
  const response = await api.get('/eventos');
  return response.data;
};

// Obtener evento por ID
export const getEventoById = async (id) => {
  const response = await api.get(`/eventos/${id}`);
  return response.data;
};

// Obtener eventos futuros (puedes ajustar el endpoint si existe o filtrar en frontend)
export const getEventosFuturos = async () => {
  const response = await api.get('/eventos/futuros'); // Asumiendo que existe este endpoint basado en el controlador
  return response.data;
};

// Obtener eventos por categoría
export const getEventosPorCategoria = async (categoriaId) => {
  const response = await api.get(`/eventos/categoria/${categoriaId}`);
  return response.data;
};