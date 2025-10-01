const API_URL = "http://localhost:3000/api/categoria-eventos";

// ✅ Obtener todas las categorías
export const getCategoriasEventos = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener categorías de eventos");
  return await res.json();
};

// ✅ Obtener por ID
export const getCategoriaEventoById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener la categoría");
  return await res.json();
};

// ✅ Crear
export const createCategoriaEvento = async (categoria) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) throw new Error("Error al crear categoría");
  return await res.json();
};

// ✅ Editar
export const updateCategoriaEvento = async (id, categoria) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) throw new Error("Error al actualizar categoría");
  return await res.json();
};

// ✅ Eliminar
export const deleteCategoriaEvento = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar categoría");
  return await res.json();
};
