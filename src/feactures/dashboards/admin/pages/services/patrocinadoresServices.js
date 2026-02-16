import api from "../../../../../services/api";

const API_URL = "/patrocinadores";

// ✅ Obtener todos los patrocinadores
export const getPatrocinadores = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

// ✅ Crear patrocinador
export const createPatrocinador = async (patrocinador) => {
  let data = patrocinador;
  
  if (patrocinador.logoArchivo) {
    const formData = new FormData();
    Object.keys(patrocinador).forEach(key => {
        if (key === 'logoArchivo') {
            formData.append('logo', patrocinador.logoArchivo);
        } else if (patrocinador[key] !== null && patrocinador[key] !== undefined && key !== 'imageMode') {
            formData.append(key, patrocinador[key]);
        }
    });
    data = formData;
  }
  
  const res = await api.post(API_URL, data);
  return res.data;
};

// ✅ Editar
export const updatePatrocinador = async (id, patrocinador) => {
  let data = patrocinador;

  if (patrocinador.logoArchivo) {
    const formData = new FormData();
    Object.keys(patrocinador).forEach(key => {
        if (key === 'logoArchivo') {
            formData.append('logo', patrocinador.logoArchivo);
        } else if (patrocinador[key] !== null && patrocinador[key] !== undefined && key !== 'imageMode') {
            formData.append(key, patrocinador[key]);
        }
    });
    data = formData;
  }

  const res = await api.put(`${API_URL}/${id}`, data);
  return res.data;
};

// ✅ Eliminar
export const deletePatrocinador = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};
