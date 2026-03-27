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
  // Si no hay imagen nueva para subir, enviamos JSON puro para que Laravel valide correctamente nulls/enteros.
  if (!evento.imagenArchivo) {
    const jsonPayload = { ...evento };
    delete jsonPayload.imagenArchivo; // limpiar campo auxiliar
    const res = await api.post(API_Endpoint, jsonPayload);
    return res.data;
  }

  // Si hay imagen, usamos FormData
  const formData = new FormData();
  Object.keys(evento).forEach(key => {
    if (key === 'imagenArchivo') {
      formData.append('imagen_evento', evento.imagenArchivo);
    } else if (key !== 'imagen_evento') {
       // Omitimos imagen_evento aquí porque lo reemplazamos con el archivo real
       const val = evento[key] === null || evento[key] === undefined ? "" : evento[key];
       formData.append(key, val);
    }
  });

  const res = await api.post(API_Endpoint, formData);
  return res.data;
};

// ===============================
// ⭐ UPDATE — ACTUALIZAR EVENTO
// ===============================

export const updateEvento = async (id, evento) => {
  // Si no hay imagen nueva para subir, enviamos JSON puro
  if (!evento.imagenArchivo) {
    const jsonPayload = { ...evento };
    delete jsonPayload.imagenArchivo;
    const res = await api.put(`${API_Endpoint}/${id}`, jsonPayload);
    return res.data;
  }

  // En Laravel/PHP, las peticiones PUT con archivos no parsean FormData nativamente. 
  // Enviamos un POST con el campo _method='PUT'.
  const formData = new FormData();
  formData.append('_method', 'PUT');
  
  Object.keys(evento).forEach(key => {
    if (key === 'imagenArchivo') {
      formData.append('imagen_evento', evento.imagenArchivo);
    } else if (key !== 'imagen_evento') {
       const val = evento[key] === null || evento[key] === undefined ? "" : evento[key];
       formData.append(key, val);
    }
  });

  const res = await api.post(`${API_Endpoint}/${id}`, formData);
  return res.data;
};

// ===============================
// ⭐ DELETE — ELIMINAR EVENTO
// ===============================

export const deleteEvento = async (id) => {
  const res = await api.delete(`${API_Endpoint}/${id}`);
  return res.data;
};
