import api from './api';

/**
 * Normaliza la respuesta del backend para siempre devolver un array.
 */
const normalizeEventos = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.eventos && Array.isArray(data.eventos)) return data.eventos;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

// Obtener todos los eventos
export const getEventos = async () => {
  const response = await api.get('/eventos');
  return normalizeEventos(response.data);
};

// Obtener evento por ID
export const getEventoById = async (id) => {
  const response = await api.get(`/eventos/${id}`);
  return response.data;
};

// Obtener eventos futuros
export const getEventosFuturos = async () => {
  const response = await api.get('/eventos/futuros');
  return normalizeEventos(response.data);
};

// Obtener eventos por categoría
export const getEventosPorCategoria = async (categoriaId) => {
  const response = await api.get(`/eventos/categoria/${categoriaId}`);
  return normalizeEventos(response.data);
};