import {
  obtenerProveedores,
  obtenerProveedorPorNit,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from "../services/proveedores.service.js";

export const getProveedores = async (req, res) => {
  try {
    const proveedores = await obtenerProveedores();
    res.json(proveedores);
  } catch (err) {
    console.error("❌ Error al obtener proveedores:", err);
    res.status(500).json({ mensaje: "Error al obtener proveedores" });
  }
};

export const getProveedorById = async (req, res) => {
  try {
    const { nit } = req.params;
    const proveedor = await obtenerProveedorPorNit(nit);
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }
    res.json(proveedor);
  } catch (err) {
    console.error("❌ Error al obtener proveedor:", err);
    res.status(500).json({ mensaje: "Error al obtener proveedor" });
  }
};

export const createProveedor = async (req, res) => {
  try {
    const nuevoProveedor = await crearProveedor(req.body);
    res.status(201).json({
      mensaje: "Proveedor creado correctamente",
      proveedor: nuevoProveedor
    });
  } catch (err) {
    console.error("❌ Error al crear proveedor:", err);
    res.status(400).json({ mensaje: "Error al crear proveedor", error: err.message });
  }
};

export const updateProveedor = async (req, res) => {
  try {
    const { nit } = req.params;
    const proveedorActualizado = await actualizarProveedor(nit, req.body);
    if (!proveedorActualizado) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }
    res.json({ mensaje: "Proveedor actualizado correctamente", proveedor: proveedorActualizado });
  } catch (err) {
    console.error("❌ Error al actualizar proveedor:", err);
    res.status(400).json({ mensaje: "Error al actualizar proveedor", error: err.message });
  }
};

export const deleteProveedor = async (req, res) => {
  try {
    const { nit } = req.params;
    const proveedorEliminado = await eliminarProveedor(nit);
    if (!proveedorEliminado) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }
    res.json({ mensaje: "Proveedor eliminado correctamente", proveedor: proveedorEliminado });
  } catch (err) {
    console.error("❌ Error al eliminar proveedor:", err);
    res.status(500).json({ mensaje: "Error al eliminar proveedor" });
  }
};