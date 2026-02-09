// src/features/dashboards/admin/services/planclassServices.js
import api from "../../../../../services/api";

const API_URL = "/planes";

export const getPlanes = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error en getPlanes:", error);
    throw error;
  }
};

export const getPlanById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en getPlanById (${id}):`, error);
    throw error;
  }
};

export const createPlan = async (planData) => {
  try {
    const payload = {
      nombre_plan: planData.nombre_plan,
      descripcion: planData.descripcion || null,
      precio: parseFloat(planData.precio),
      descuento_porcentaje: planData.descuento_porcentaje
        ? parseFloat(planData.descuento_porcentaje)
        : 0,
      numero_clases: parseInt(planData.numero_clases) || 4
    };
    const response = await api.post(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error en createPlan:", error);
    throw error;
  }
};

export const updatePlan = async (id, planData) => {
  try {
    const payload = {
      nombre_plan: planData.nombre_plan,
      descripcion: planData.descripcion || null,
      precio: parseFloat(planData.precio),
      descuento_porcentaje: planData.descuento_porcentaje
        ? parseFloat(planData.descuento_porcentaje)
        : 0,
      numero_clases: parseInt(planData.numero_clases) || 4
    };
    const response = await api.put(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error en updatePlan (${id}):`, error);
    throw error;
  }
};

export const deletePlan = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en deletePlan (${id}):`, error);
    throw error;
  }
};