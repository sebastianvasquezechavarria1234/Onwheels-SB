const API_URL = "http://localhost:3000/api/patrocinadores";

// ✅ Obtener todos los patrocinadores
export const getPatrocinadores = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener patrocinadores");
  return await res.json();
};

// ✅ Crear patrocinador
export const createPatrocinador = async (patrocinador) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patrocinador),
  });
  if (!res.ok) throw new Error("Error al crear patrocinador");
  return await res.json();
};

// ✅ Editar
export const updatePatrocinador = async (id, patrocinador) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patrocinador),
  });
  if (!res.ok) throw new Error("Error al actualizar patrocinador");
  return await res.json();
};

// ✅ Eliminar
export const deletePatrocinador = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar patrocinador");
  return await res.json();
};
