// services/sedesServices.js
const API = "http://localhost:3000/api";

export const getSedes = async () => {
  const res = await fetch(`${API}/sedes`);
  if (!res.ok) throw new Error("Error al obtener sedes");
  return await res.json();
};

export const createSede = async (data) => {
  const res = await fetch(`${API}/sedes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = new Error("Error al crear sede");
    error.response = res;
    throw error;
  }
  return await res.json();
};

export const updateSede = async (id, data) => {
  const res = await fetch(`${API}/sedes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = new Error("Error al actualizar sede");
    error.response = res;
    throw error;
  }
  return await res.json();
};

export const deleteSede = async (id) => {
  const res = await fetch(`${API}/sedes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = new Error("Error al eliminar sede");
    error.response = res;
    throw error;
  }
  return await res.json();
};