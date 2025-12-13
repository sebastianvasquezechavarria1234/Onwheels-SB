// services/EventosService.js

const API_URL = "http://localhost:3000/api"; // base para todos

// ===============================
// ⭐ GET — OBTENER DATOS
// ===============================

export const getEventos = async () => {
  const res = await fetch(`${API_URL}/eventos`);
  if (!res.ok) throw new Error("Error al obtener eventos");
  return await res.json();
};

export const getCategorias = async () => {
  const res = await fetch(`${API_URL}/categorias-eventos`);
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
};

export const getPatrocinadores = async () => {
  const res = await fetch(`${API_URL}/patrocinadores`);
  if (!res.ok) throw new Error("Error al obtener patrocinadores");
  return await res.json();
};

export const getSedes = async () => {
  const res = await fetch(`${API_URL}/sedes`);
  if (!res.ok) throw new Error("Error al obtener sedes");
  return await res.json();
};

// ===============================
// ⭐ CREATE — CREAR EVENTO
// ===============================

export const createEvento = async (evento) => {
  const res = await fetch(`${API_URL}/eventos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(evento),
  });

  if (!res.ok) throw new Error("Error al crear el evento");
  return await res.json();
};

// ===============================
// ⭐ UPDATE — ACTUALIZAR EVENTO
// ===============================

export const updateEvento = async (id, evento) => {
  const res = await fetch(`${API_URL}/eventos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(evento),
  });

  if (!res.ok) throw new Error("Error al actualizar evento");
  return await res.json();
};

// ===============================
// ⭐ DELETE — ELIMINAR EVENTO
// ===============================

export const deleteEvento = async (id) => {
  const res = await fetch(`${API_URL}/eventos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error al eliminar evento");
  return await res.json();
};
