const API_URL = "http://localhost:3000/api/usuarios";

// ✅ Obtener todos los usuarios
export const getUsuarios = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return await res.json();
};

// ✅ Obtener usuario por ID
export const getUsuarioById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Error al obtener usuario");
  return await res.json();
};

// ✅ Crear usuario
export const createUsuario = async (usuario) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error("Error al crear usuario");
  return await res.json();
};

// ✅ Editar usuario
export const updateUsuario = async (id, usuario) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error("Error al actualizar usuario");
  return await res.json();
};

// ✅ Eliminar usuario
export const deleteUsuario = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar usuario");
  return await res.json();
};
