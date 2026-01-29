import api from "../../../../../services/api";

const ENDPOINT = "/categoria-productos";

// ✅ Obtener todas las categorías
export const getCategorias = async () => {
  const res = await api.get(ENDPOINT);
  return res.data;
};

// ✅ Crear categoría
export const createCategoria = async (categoria) => {
  const res = await api.post(ENDPOINT, categoria);
  return res.data;
};

// ✅ Editar categoría
export const updateCategoria = async (id, categoria) => {
  const res = await api.put(`${ENDPOINT}/${id}`, categoria);
  return res.data;
};

// ✅ Eliminar categoría
export const deleteCategoria = async (id) => {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
};
