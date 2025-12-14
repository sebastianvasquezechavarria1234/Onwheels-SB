// services/EventCategory.js

const API_URL = "http://localhost:3000/api/categorias-eventos"; // ✅ plural

// ⭐ Obtener todas
export const getCategoriasEventos = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
};

// ⭐ Obtener por ID
export const getCategoriaEventoById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener categoría");
  return await res.json();
};

// ⭐ Crear
export const createCategoriaEvento = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear categoría");
  return await res.json();
};

// ⭐ Actualizar
export const updateCategoriaEvento = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar categoría");
  return await res.json();
};

// ⭐ Eliminar
export const deleteCategoriaEvento = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar categoría");
  return await res.json();
};