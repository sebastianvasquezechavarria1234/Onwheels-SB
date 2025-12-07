// src/services/RolesService.js
import axios from "axios";

// Base URL de tu API
const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Función para obtener el token
const getToken = () => localStorage.getItem("token");

// Función genérica que añade el token a las peticiones
const authRequest = async (method, url, data = null) => {
  const token = getToken();
  const config = {
    method,
    url,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  if (data) config.data = data;
  const response = await API(config);
  return response.data;
};

// === Roles ===
export const getRoles = () => authRequest("get", "/roles");
export const createRole = (rolData) => authRequest("post", "/roles", rolData);
export const updateRole = (id, rolData) => authRequest("put", `/roles/${id}`, rolData);
export const deleteRole = (id) => authRequest("delete", `/roles/${id}`);

// === Permisos ===
export const getPermisos = () => authRequest("get", "/permisos");

// === Roles-Permisos ===
export const getPermisosByRol = (idRol) => authRequest("get", `/roles/${idRol}/permisos`);
export const asignarPermisoARol = (idRol, idPermiso) => 
  authRequest("post", `/roles/${idRol}/permisos`, { id_permiso: idPermiso });
export const eliminarPermisoDeRol = (idRol, idPermiso) => 
  authRequest("delete", `/roles/${idRol}/permisos/${idPermiso}`);