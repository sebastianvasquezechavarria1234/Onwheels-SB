import api from "../../../../../services/api";

const ENDPOINT = "/proveedores";

export const getProveedores = async (req, res) => {
  try {
    const { data } = await api.get(ENDPOINT);
    if (res) res.json(data);
    return data;
  } catch (err) {
    console.error("❌ Error al obtener proveedores:", err);
    if (res) res.status(500).json({ mensaje: "Error al obtener proveedores" });
    throw err;
  }
};

export const getProveedorById = async (req, res) => {
  try {
    const { nit } = req.params || req; // Soporte para llamada directa o via controlador simulado
    const { data } = await api.get(`${ENDPOINT}/${nit}`);
    if (res) res.json(data);
    return data;
  } catch (err) {
    console.error("❌ Error al obtener proveedor:", err);
    if (res) res.status(500).json({ mensaje: "Error al obtener proveedor" });
    throw err;
  }
};

export const createProveedor = async (req, res) => {
  try {
    const body = req.body || req;
    const { data } = await api.post(ENDPOINT, body);
    if (res) res.status(201).json({ mensaje: "Proveedor creado correctamente", proveedor: data });
    return data;
  } catch (err) {
    console.error("❌ Error al crear proveedor:", err);
    if (res) res.status(400).json({ mensaje: "Error al crear proveedor", error: err.message });
    throw err;
  }
};

export const updateProveedor = async (req, res) => {
  try {
    const { nit } = req.params || req; // Ajuste por si nit viene suelto
    const body = req.body || (arguments[1] ? arguments[1] : {});
    const { data } = await api.put(`${ENDPOINT}/${nit}`, body);
    if (res) res.json({ mensaje: "Proveedor actualizado correctamente", proveedor: data });
    return data;
  } catch (err) {
    console.error("❌ Error al actualizar proveedor:", err);
    if (res) res.status(400).json({ mensaje: "Error al actualizar proveedor", error: err.message });
    throw err;
  }
};

export const deleteProveedor = async (req, res) => {
  try {
    const { nit } = req.params || req;
    const { data } = await api.delete(`${ENDPOINT}/${nit}`);
    if (res) res.json({ mensaje: "Proveedor eliminado correctamente", proveedor: data });
    return data;
  } catch (err) {
    console.error("❌ Error al eliminar proveedor:", err);
    if (res) res.status(500).json({ mensaje: "Error al eliminar proveedor" });
    throw err;
  }
};