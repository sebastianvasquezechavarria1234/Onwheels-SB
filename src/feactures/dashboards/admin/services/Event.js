import axios from "axios";

const API_URL = "http://localhost:3000/api/eventos"; // ajusta si tu endpoint es otro

// Obtener todos los eventos
export const getEventos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error;
  }
};

// Obtener un evento por ID
export const getEventoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el evento:", error);
    throw error;
  }
};

// Crear un nuevo evento
export const createEvento = async (evento) => {
  try {
    const response = await axios.post(API_URL, evento);
    return response.data;
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
};

// Actualizar un evento
export const updateEvento = async (id, evento) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, evento);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    throw error;
  }
};

// Eliminar un evento
export const deleteEvento = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    throw error;
  }
};
