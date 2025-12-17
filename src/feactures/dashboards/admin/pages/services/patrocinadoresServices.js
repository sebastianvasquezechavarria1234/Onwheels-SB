import api from "../../../../../services/api";

const API_URL = "/patrocinadores";

// ✅ Obtener todos los patrocinadores
export const getPatrocinadores = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

// ✅ Crear patrocinador
export const createPatrocinador = async (patrocinador) => {
  const res = await api.post(API_URL, patrocinador);
  return res.data;
};

// ✅ Editar
export const updatePatrocinador = async (id, patrocinador) => {
  const res = await api.put(`${API_URL}/${id}`, patrocinador);
  return res.data;
};

// ✅ Eliminar
export const deletePatrocinador = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};
