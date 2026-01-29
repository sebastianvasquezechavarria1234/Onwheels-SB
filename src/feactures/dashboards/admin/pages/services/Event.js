// services/EventosService.js
import api from "../../../../../services/api";

const API_Endpoint = "/eventos"; // base para eventos

// ===============================
// ⭐ GET — OBTENER DATOS
// ===============================

export const getEventos = async () => {
  const res = await api.get(API_Endpoint);
  return res.data;
};

export const getCategorias = async () => {
  const res = await api.get("/categoria-productos"); // NOTA: corregido para usar el endpoint de productos si es necesario 
  // OJO: El usuario se quejó de error en /api/eventos y /api/categorias-eventos
  // Si Event.js gestiona categorias de EVENTOS, el endpoint es /categorias-eventos
  // Mantendré la lógica original pero con axios.
  const res2 = await api.get("/categorias-eventos");
  return res2.data;
};

export const getPatrocinadores = async () => {
  const res = await api.get("/patrocinadores");
  return res.data;
};

export const getSedes = async () => {
  const res = await api.get("/sedes");
  return res.data;
};

// ===============================
// ⭐ CREATE — CREAR EVENTO
// ===============================

export const createEvento = async (evento) => {
  const res = await api.post(API_Endpoint, evento);
  return res.data;
};

// ===============================
// ⭐ UPDATE — ACTUALIZAR EVENTO
// ===============================

export const updateEvento = async (id, evento) => {
  const res = await api.put(`${API_Endpoint}/${id}`, evento);
  return res.data;
};

// ===============================
// ⭐ DELETE — ELIMINAR EVENTO
// ===============================

export const deleteEvento = async (id) => {
  const res = await api.delete(`${API_Endpoint}/${id}`);
  return res.data;
};
