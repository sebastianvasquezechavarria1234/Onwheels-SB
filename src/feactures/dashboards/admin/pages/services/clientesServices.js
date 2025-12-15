// ================== CONFIG ==================
const API_URL = "http://localhost:3000/api";

// ================== CLIENTES ==================

export const getClientes = async () => {
  const res = await fetch(`${API_URL}/clientes`);
  if (!res.ok) throw new Error("Error obteniendo clientes");
  return res.json();
};

export const getClienteById = async (id) => {
  const res = await fetch(`${API_URL}/clientes/${id}`);
  if (!res.ok) throw new Error("Error obteniendo cliente");
  return res.json();
};

export const createCliente = async (data) => {
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let mensaje = "Error creando cliente";
    try {
      const errorData = await res.json();
      mensaje = errorData.mensaje || errorData.error || mensaje;
    } catch (e) {
      mensaje = res.statusText || mensaje;
    }
    throw new Error(mensaje);
  }
  return res.json();
};

export const updateCliente = async (id, data) => {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let mensaje = "Error actualizando cliente";
    try {
      const errorData = await res.json();
      mensaje = errorData.mensaje || errorData.error || mensaje;
    } catch (e) {
      mensaje = res.statusText || mensaje;
    }
    throw new Error(mensaje);
  }
  return res.json();
};

export const deleteCliente = async (id) => {
  const res = await fetch(`${API_URL}/clientes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let mensaje = "Error eliminando cliente";
    try {
      const errorData = await res.json();
      mensaje = errorData.mensaje || errorData.error || mensaje;
    } catch (e) {
      mensaje = res.statusText || mensaje;
    }
    throw new Error(mensaje);
  }
  return res.json();
};