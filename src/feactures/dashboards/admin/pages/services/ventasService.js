// ================== CONFIG ==================
const API_URL = "http://localhost:3000/api";

// ================== VENTAS ==================

export const getVentas = async () => {
  const res = await fetch(`${API_URL}/ventas`);
  if (!res.ok) throw new Error("Error obteniendo ventas");
  return res.json();
};

export const getVentaById = async (id) => {
  const res = await fetch(`${API_URL}/ventas/${id}`);
  if (!res.ok) throw new Error("Error obteniendo venta");
  return res.json();
};

export const createVenta = async (data) => {
  const res = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let mensaje = "Error creando venta";
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

export const updateVenta = async (id, data) => {
  const res = await fetch(`${API_URL}/ventas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let mensaje = "Error actualizando venta";
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

export const deleteVenta = async (id) => {
  const res = await fetch(`${API_URL}/ventas/${id}`, { method: "DELETE" });
  if (!res.ok) {
    let mensaje = "Error eliminando venta";
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