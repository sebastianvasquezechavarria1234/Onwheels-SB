// services/classServices.js
const API_URL = "http://localhost:3000/api/clases";

// ✅ Obtener todas las clases
export const getClases = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener clases");
  return await res.json();
};

// ✅ Obtener clase por ID
export const getClaseById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener clase");
  return await res.json();
};

// ✅ Crear clase
export const createClase = async (clase) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clase),
  });
  if (!res.ok) throw new Error("Error al crear clase");
  return await res.json();
};

// ✅ Editar clase
export const updateClase = async (id, clase) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clase),
  });
  if (!res.ok) throw new Error("Error al actualizar clase");
  return await res.json();
};

// ✅ Eliminar clase
export const deleteClase = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar clase");
  return await res.json();
};