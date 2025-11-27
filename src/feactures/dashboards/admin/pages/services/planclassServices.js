// src/feactures/dashboards/admin/services/planclassServices.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/planes";

// ✅ Obtener todos los planes
export const getPlanes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error en getPlanes:", error);
    throw error;
  }
};

// ✅ Obtener plan por ID (aunque no se usa actualmente en el frontend, es bueno tenerlo)
export const getPlanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en getPlanById (${id}):`, error);
    throw error;
  }
};

// ✅ Crear nuevo plan
export const createPlan = async (planData) => {
  try {
    // Aseguramos que los campos numéricos sean del tipo correcto
    const payload = {
      nombre_plan: planData.nombre_plan,
      descripcion: planData.descripcion || null,
      precio: parseFloat(planData.precio),
      descuento_porcentaje: planData.descuento_porcentaje
        ? parseFloat(planData.descuento_porcentaje)
        : 0
    };
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error en createPlan:", error);
    throw error;
  }
};

// ✅ Actualizar plan existente
export const updatePlan = async (id, planData) => {
  try {
    const payload = {
      nombre_plan: planData.nombre_plan,
      descripcion: planData.descripcion || null,
      precio: parseFloat(planData.precio),
      descuento_porcentaje: planData.descuento_porcentaje
        ? parseFloat(planData.descuento_porcentaje)
        : 0
    };
    const response = await axios.put(`${API_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error en updatePlan (${id}):`, error);
    throw error;
  }
};

// ✅ Eliminar plan
export const deletePlan = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en deletePlan (${id}):`, error);
    throw error;
  }
};