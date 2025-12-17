// src/services/RolesService.js
import api from "../../../../../services/api";

// === Roles ===
export const getRoles = () => api.get("/roles").then(res => res.data);
export const createRole = (rolData) => api.post("/roles", rolData).then(res => res.data);
export const updateRole = (id, rolData) => api.put(`/roles/${id}`, rolData).then(res => res.data);
export const deleteRole = (id) => api.delete(`/roles/${id}`).then(res => res.data);

// === Permisos ===
export const getPermisos = () => api.get("/permisos").then(res => res.data);

// === Roles-Permisos ===
export const getPermisosByRol = (idRol) => api.get(`/roles/${idRol}/permisos`).then(res => res.data);
export const asignarPermisoARol = (idRol, idPermiso) =>
  api.post(`/roles/${idRol}/permisos`, { id_permiso: idPermiso }).then(res => res.data);
export const eliminarPermisoDeRol = (idRol, idPermiso) =>
  api.delete(`/roles/${idRol}/permisos/${idPermiso}`).then(res => res.data);