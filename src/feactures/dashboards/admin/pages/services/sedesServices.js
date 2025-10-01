const API_URL = "http://localhost:3000/api/sedes";

// ✅ Obtener todas las sedes
export const getSedes = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener sedes");
  return await res.json();
};

// ✅ Crear sede
export const createSede = async (sede) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sede),
  });
  if (!res.ok) throw new Error("Error al crear sede");
  return await res.json();
};

// ✅ Editar sede
export const updateSede = async (id, sede) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sede),
  });
  if (!res.ok) throw new Error("Error al actualizar sede");
  return await res.json();
};

// ✅ Eliminar sede
export const deleteSede = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar sede");
  return await res.json();
};
