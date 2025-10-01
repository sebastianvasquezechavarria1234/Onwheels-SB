const API_URL = "http://localhost:3000/api/compras";

// Obtener todas las compras
export const getCompras = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener compras");
  return await res.json();
};

// Crear compra
export const createCompra = async (compra) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(compra),
  });
  if (!res.ok) throw new Error("Error al crear compra");
  return await res.json();
};

// Actualizar compra
export const updateCompra = async (id, compra) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(compra),
  });
  if (!res.ok) throw new Error("Error al actualizar compra");
  return await res.json();
};

// Eliminar compra
export const deleteCompra = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar compra");
  return true;
};
