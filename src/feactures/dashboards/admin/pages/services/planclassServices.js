import axios from "axios";

const API_URL = "http://localhost:3000/api/planes"; // ajusta el puerto si es necesario

// ✅ Listar todos los planes
export const getPlanes = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ✅ Obtener plan por ID
export const getPlanById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// ✅ Crear plan
export const createPlan = async (planData) => {
  const res = await axios.post(API_URL, planData);
  return res.data;
};

// ✅ Actualizar plan
export const updatePlan = async (id, planData) => {
  const res = await axios.put(`${API_URL}/${id}`, planData);
  return res.data;
};

// ✅ Eliminar plan
export const deletePlan = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
