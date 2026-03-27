// services/EventosService.js
import api from "../../../../../services/api";

const API_Endpoint = "/eventos"; // base para eventos

// ===============================
// ⭐ GET — OBTENER DATOS
// ===============================

export const getEventos = async (params = {}) => {
  const options = Object.keys(params).length > 0 ? { params } : {};
  const res = await api.get(API_Endpoint, options);
  return res.data;
};

export const getCategorias = async () => {
  // OJO: El usuario se quejó de error en /api/eventos y /api/categorias-eventos
  const res = await api.get("/categorias-eventos");
  return res.data;
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
  // Usar FormData siempre para asegurar que google_forms[] y otros campos se envíen bien
  const formData = new FormData();
  Object.keys(evento).forEach(key => {
    if (key === 'imagenArchivo') {
      if (evento.imagenArchivo) formData.append('imagen', evento.imagenArchivo);
    } else if (key === 'google_forms' && Array.isArray(evento[key])) {
      evento[key].forEach(link => formData.append('google_forms[]', link));
    } else if (evento[key] !== null && evento[key] !== undefined) {
      formData.append(key, evento[key]);
    }
  });

  const res = await api.post(API_Endpoint, formData);
  return res.data;
};

// ===============================
// ⭐ UPDATE — ACTUALIZAR EVENTO
// ===============================

export const updateEvento = async (id, evento) => {
  // Usar FormData siempre
  const formData = new FormData();
  Object.keys(evento).forEach(key => {
    if (key === 'imagenArchivo') {
      if (evento.imagenArchivo) formData.append('imagen', evento.imagenArchivo);
    } else if (key === 'google_forms' && Array.isArray(evento[key])) {
      evento[key].forEach(link => formData.append('google_forms[]', link));
    } else if (evento[key] !== null && evento[key] !== undefined) {
      formData.append(key, evento[key]);
    }
  });

  const res = await api.put(`${API_Endpoint}/${id}`, formData);
  return res.data;
};

// ===============================
// ⭐ DELETE — ELIMINAR EVENTO
// ===============================

export const deleteEvento = async (id) => {
  const res = await api.delete(`${API_Endpoint}/${id}`);
  return res.data;
};
