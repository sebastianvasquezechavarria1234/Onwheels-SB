import axios from "axios";

// Ajusta la URL si tu backend corre en otro puerto
const API = "http://localhost:3000/api/admin/correos-masivos";

// Obtener roles disponibles
export const obtenerRolesDisponibles = async () => {
  try {
    const res = await axios.get(`${API}/roles-disponibles`);
    return res.data;
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    throw error;
  }
};

// Obtener vista previa de destinatarios
export const obtenerVistaPreviaDestinatarios = async (idsRoles) => {
  try {
    const res = await axios.post(`${API}/vista-previa`, {
      idsRoles,
    });
    return res.data;
  } catch (error) {
    console.error("Error obteniendo vista previa:", error);
    throw error;
  }
};


// Enviar correos masivos
export const enviarCorreosMasivos = async (asunto, mensaje, idsRoles, rolesNombres) => {
  try {
    const res = await axios.post(`${API}/enviar`, {
      asunto,
      mensaje,
      idsRoles,
      rolesNombres,
    });
    return res.data;
  } catch (error) {
    console.error("Error enviando correos:", error);
    throw error;
  }
};

// Obtener historial de envíos
export const obtenerHistorialEnvios = async () => {
  try {
    const res = await axios.get(`${API}/historial`);
    return res.data;
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    throw error;
  }
};

// Eliminar envío
export const eliminarEnvio = async (id) => {
    try {
        const res = await axios.delete(`${API}/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error eliminando envío:", error);
        throw error;
    }
};

