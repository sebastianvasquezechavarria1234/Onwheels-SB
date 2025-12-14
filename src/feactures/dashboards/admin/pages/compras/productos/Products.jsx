// src/feactures/dashboards/admin/pages/compras/productos/Products.styled.fixed.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, Eye, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  getColores,
  createColor,
  getTallas,
  createTalla,
  createVariante,
  deleteVariante,
  getVariantes,
} from "../../services/productosServices";

import { getCategorias } from "../../services/categoriasService";
import { Layout } from "../../../layout/layout";

export default function Productos() {
  // listas
  const [busqueda, setBusqueda] = useState(""); 
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [variantesGlobales, setVariantesGlobales] = useState([]);

  // UI / modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCreateColorOpen, setIsCreateColorOpen] = useState(false);
  const [isCreateTallaOpen, setIsCreateTallaOpen] = useState(false);

  // Paginación simple
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;

  // estado del formulario del producto
  const [productForm, setProductForm] = useState({
    id_producto: null,
    nombre_producto: "",
    id_categoria: "",
    precio_compra: "",
    precio: "",
    porcentaje_ganancia: "",
    descuento_producto: "",
    descripcion: "",
    imagen_producto: "",
    estado: "activo",
  });

  // Variantes manejadas localmente dentro del modal producto.
  const [variants, setVariants] = useState([]);

  // estado de la variante que vemos/creamos (estilo del ejemplo: color + tallas dinámicas)
  const [currentVariant, setCurrentVariant] = useState({
    color: "#2563eb",
    tallas: [{ talla: "", cantidad: "" }],
  });

  // submodal crear color / talla
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ff0000");
  const [newTallaName, setNewTallaName] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prods, cats, cols, tls, vars] = await Promise.all([
        getProductos(),
        getCategorias(),
        getColores(),
        getTallas(),
        getVariantes(),
      ]);
      setProductos(prods || []);
      setCategorias(cats || []);
      setColores(cols || []);
      setTallas(tls || []);
      setVariantesGlobales(vars || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      alert("Error cargando datos: " + (err.message || err));
    }
  };

  // Abrir modal producto (nuevo o editar)
  const openProductModal = (producto = null) => {
    if (producto) {
      setProductForm({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto || "",
        id_categoria: producto.id_categoria || "",
        precio_compra: producto.precio_compra ?? producto.precio ?? "",
        precio: producto.precio ?? "",
        porcentaje_ganancia: producto.porcentaje_ganancia ?? "",
        descuento_producto: producto.descuento_producto ?? "",
        descripcion: producto.descripcion ?? "",
        imagen_producto: producto.imagen_producto ?? "",
        estado: producto.estado ?? "activo",
      });
      const vars = (variantesGlobales || []).filter((v) => v.id_producto === producto.id_producto);
      setVariants(vars || []);
    } else {
      setProductForm({
        id_producto: null,
        nombre_producto: "",
        id_categoria: "",
        precio_compra: "",
        precio: "",
        porcentaje_ganancia: "",
        descuento_producto: "",
        descripcion: "",
        imagen_producto: "",
        estado: "activo",
      });
      setVariants([]);
    }
    setIsProductModalOpen(true);
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

 const saveProduct = async () => {
  try {
    // Validaciones básicas
    if (!productForm.nombre_producto?.trim()) {
      return alert("⚠️ El nombre del producto es obligatorio");
    }
    if (!productForm.id_categoria) {
      return alert("⚠️ Debe seleccionar una categoría");
    }
    if (!productForm.precio_compra || Number(productForm.precio_compra) <= 0) {
      return alert("⚠️ El precio de compra debe ser mayor a 0");
    }

    // Construir payload actualizado
    const payload = {
      ...productForm,
      nombre_producto: productForm.nombre_producto?.trim() || "",
      descripcion: productForm.descripcion?.trim() || "",
      precio_compra: Number(productForm.precio_compra) || 0,
      precio: Number(productForm.precio) || 0,
      estado: productForm.estado === "activo" ? 1 : 0,
      porcentaje_ganancia: Math.min(Number(productForm.porcentaje_ganancia) || 0, 999.99),
      descuento_producto: Math.min(Number(productForm.descuento_producto) || 0, 999.99),
      id_categoria: Number(productForm.id_categoria) || null,
      imagen_producto: productForm.imagen_producto?.startsWith("data:image")
        ? "" // no se guarda base64, solo urls
        : (productForm.imagen_producto || "")
    };

    console.log("✅ Payload final:", payload);

    let nuevoProducto;

    if (productForm.id_producto) {
      // 🟢 EDITAR
      nuevoProducto = await updateProducto(productForm.id_producto, payload);
    } else {
      // 🟢 CREAR
      nuevoProducto = await createProducto(payload);

      // Si se creó bien, crear también las variantes
      if (nuevoProducto?.id_producto) {
        for (const v of variants) {
          await createVariante({
            id_producto: nuevoProducto.id_producto,
            id_color: v.id_color,
            id_talla: v.id_talla,
            stock: v.stock
          });
        }
      }
    }

    if (!nuevoProducto || nuevoProducto.error) {
      throw new Error(nuevoProducto?.error || "No se pudo guardar el producto");
    }

    alert("✅ Producto guardado correctamente");

    // Recargar lista de productos después de guardar
    await cargarDatos();

    // Cerrar modal y limpiar formulario
    setIsProductModalOpen(false);
    setProductForm({
      id_producto: null,
      nombre_producto: "",
      descripcion: "",
      precio_compra: "",
      precio: "",
      estado: "activo",
      porcentaje_ganancia: "",
      descuento_producto: "",
      id_categoria: "",
      imagen_producto: ""
    });
    setVariants([]);

  } catch (err) {
    console.error("❌ saveProduct error:", err);
    alert("❌ Error guardando producto: " + (err.message || err));
  }
};


  const handleDeleteProducto = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    try {
      await deleteProducto(id);
      await cargarDatos();
    } catch (err) {
      console.error("eliminar producto error:", err);
      alert("Error eliminando producto: " + (err.message || err));
    }
  };

  // VARIANTES
  const handleVariantChange = (field, value) => {
    setCurrentVariant((prev) => ({ ...prev, [field]: value }));
  };

  const handleTallaChange = (index, field, value) => {
    const newTallas = [...currentVariant.tallas];
    newTallas[index][field] = value;
    setCurrentVariant((prev) => ({ ...prev, tallas: newTallas }));
  };

  const addTalla = () => {
    setCurrentVariant((prev) => ({ ...prev, tallas: [...prev.tallas, { talla: "", cantidad: "" }] }));
  };

  const removeTalla = (index) => {
    const newTallas = [...currentVariant.tallas];
    newTallas.splice(index, 1);
    setCurrentVariant((prev) => ({ ...prev, tallas: newTallas }));
  };

  const saveVariant = async () => {
  try {
    const validTallas = currentVariant.tallas.filter(
      (t) => t.talla?.toString().trim() && Number(t.cantidad) >= 0
    );
    if (validTallas.length === 0)
      return alert("Agrega al menos una talla con cantidad válida");

    const newVariants = [];

    for (const t of validTallas) {
      let id_color = null;
      let id_talla = null;

      // 🔹 Buscar color existente
      let colorMatch = colores.find(
        (c) =>
          String(c.codigo_hex || c.hex || "").toLowerCase() ===
            String(currentVariant.color).toLowerCase() ||
          c.nombre_color === currentVariant.color
      );

      // Si no existe, lo creamos
      if (!colorMatch) {
        const newColor = await createColor({
          nombre_color: currentVariant.color,
          codigo_hex: currentVariant.color,
        });
        if (newColor) {
          colorMatch = newColor;
          setColores((prev) => [...prev, newColor]);
        }
      }
      if (colorMatch) id_color = colorMatch.id_color;

      // 🔹 Buscar talla existente
      let tallaMatch = tallas.find((tt) => tt.nombre_talla === t.talla);

      // Si no existe, la creamos
      if (!tallaMatch) {
        const newTalla = await createTalla({ nombre_talla: t.talla });
        if (newTalla) {
          tallaMatch = newTalla;
          setTallas((prev) => [...prev, newTalla]);
        }
      }
      if (tallaMatch) id_talla = tallaMatch.id_talla;

      // 🔹 Construir objeto variante
      const variantObj = {
        id_color,
        id_talla,
        stock: Number(t.cantidad) || 0,
        nombre_color: currentVariant.color,
        nombre_talla: t.talla,
        codigo_hex: currentVariant.color,
      };

      // 🔹 Si ya existe producto en BD, guardamos la variante en la API
      if (productForm.id_producto) {
        const payloadVar = {
          id_producto: productForm.id_producto,
          id_color: variantObj.id_color,
          id_talla: variantObj.id_talla,
          stock: variantObj.stock,
        };
        const created = await createVariante(payloadVar);
        newVariants.push(created || { ...payloadVar });
      } else {
        // Si no existe aún el producto, guardamos solo en memoria
        newVariants.push(variantObj);
      }
    }

    // 🔹 Actualizar variantes locales
    setVariants((prev) => [...prev, ...newVariants]);

    // Reset modal
    setCurrentVariant({
      color: "#2563eb",
      tallas: [{ talla: "", cantidad: "" }],
    });
    setIsVariantModalOpen(false);
  } catch (err) {
    console.error("saveVariant error:", err);
    alert("Error guardando variante: " + (err.message || err));
  }
};


  const removeVariant = async (variant) => {
    try {
      if (variant.id_variante) {
        if (!window.confirm("¿Eliminar variante?")) return;
        await deleteVariante(variant.id_variante);
        await cargarDatos();
        setVariants((prev) => prev.filter((v) => v.id_variante !== variant.id_variante));
      } else {
        setVariants((prev) => prev.filter((v) => v !== variant));
      }
    } catch (err) {
      console.error("removeVariant error:", err);
      alert("Error eliminando variante: " + (err.message || err));
    }
  };

  // Crear color / talla rápido
  const handleCreateColor = async () => {
    try {
      if (!newColorName.trim()) return alert("Ingrese nombre del color");
      const payload = { nombre_color: newColorName.trim(), codigo_hex: newColorHex };
      const created = await createColor(payload);
      if (created) {
        setColores((prev) => [...prev, created]);
      } else {
        await cargarDatos();
      }
      setNewColorName("");
      setNewColorHex("#ff0000");
      setIsCreateColorOpen(false);
    } catch (err) {
      console.error("handleCreateColor error:", err);
      alert("Error creando color: " + (err.message || err));
    }
  };

  const handleCreateTalla = async () => {
    try {
      if (!newTallaName.trim()) return alert("Ingrese nombre de talla");
      const payload = { nombre_talla: newTallaName.trim() };
      const created = await createTalla(payload);
      if (created) {
        setTallas((prev) => [...prev, created]);
      } else {
        await cargarDatos();
      }
      setNewTallaName("");
      setIsCreateTallaOpen(false);
    } catch (err) {
      console.error("handleCreateTalla error:", err);
      alert("Error creando talla: " + (err.message || err));
    }
  };

  // paginación slice
  const indexOfLast = paginaActual * productosPorPagina;
  const indexOfFirst = indexOfLast - productosPorPagina;
  const productosActuales = productos.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.max(1, Math.ceil(productos.length / productosPorPagina));

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Productos &gt; Gestión de Productos</h2>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-[40px]">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <button
              onClick={() => openProductModal(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar nuevo producto
            </button>
          </div>
        </div>

        {/* Tabla productos */}
        <div className="p-[30px]">
          <article className="font-semibold italic mt-[20px] flex items-center border-b border-black/20 pb-[12px]">
            <p className="w-[6%] font-bold opacity-80">ID</p>
            <p className="w-[20%] font-bold opacity-80">Nombre</p>
            <p className="w-[22%] font-bold opacity-80">Descripción</p>
            <p className="w-[12%] font-bold opacity-80">Categoría</p>
            <p className="w-[8%] font-bold opacity-80">Precio C.</p>
            <p className="w-[8%] font-bold opacity-80">Precio V.</p>
            <p className="w-[6%] font-bold opacity-80">%G</p>
            <p className="w-[6%] font-bold opacity-80">Desc</p>
            <p className="w-[6%] font-bold opacity-80">Estado</p>
            <p className="w-[10%] font-bold opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-left text-gray-600">
              <tbody>
                {productosActuales.map((p) => (
                  <tr key={p.id_producto} className="py-[18px] border-b border-black/20 hover:bg-gray-50">
                    <td className="px-6 py-[18px] w-[6%]">{p.id_producto}</td>
                    <td className="px-6 py-[18px] w-[20%] line-clamp-1">{p.nombre_producto}</td>
                    <td className="px-6 py-[18px] w-[22%] line-clamp-2">{p.descripcion}</td>
                    <td className="px-6 py-[18px] w-[12%]">{categorias.find((c) => c.id_categoria === p.id_categoria)?.nombre_categoria || ""}</td>
                    <td className="px-6 py-[18px] w-[8%]">${Number(p.precio_compra || 0).toFixed(2)}</td>
                    <td className="px-6 py-[18px] w-[8%]">${Number(p.precio || 0).toFixed(2)}</td>
                    <td className="px-6 py-[18px] w-[6%]">{p.porcentaje_ganancia}%</td>
                    <td className="px-6 py-[18px] w-[6%]">{p.descuento_producto}%</td>
                    <td className="px-6 py-[18px] w-[6%]"><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.estado === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.estado}</span></td>
                    <td className="px-6 py-[18px] w-[10%]">
                      <div className="flex gap-2 items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openProductModal(p)}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openProductModal(p)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteProducto(p.id_producto)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}

                {productosActuales.length === 0 && (
                  <tr>
                    <td colSpan="11" className="px-6 py-10 text-center text-gray-400 italic">No hay productos registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              className="btn bg-gray-200"
            >
              Anterior
            </button>
            <div className="px-3 py-1 rounded-lg border bg-white">Página {paginaActual} / {totalPaginas}</div>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              className="btn bg-gray-200"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* MODAL PRODUCTO (CREAR / EDITAR / VER) */}
        <AnimatePresence>
        {isProductModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProductModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{productForm.id_producto ? "Editar Producto" : "Crear Nuevo Producto"}</h2>
                <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {/* formulario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    name="nombre_producto"
                    value={productForm.nombre_producto}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    name="id_categoria"
                    value={productForm.id_categoria}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio compra</label>
                  <input
                    name="precio_compra"
                    type="number"
                    step="0.01"
                    value={productForm.precio_compra}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio venta *</label>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    value={productForm.precio}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">% Ganancia</label>
                  <input
                    name="porcentaje_ganancia"
                    type="number"
                    step="0.01"
                    value={productForm.porcentaje_ganancia}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">% Descuento</label>
                  <input
                    name="descuento_producto"
                    type="number"
                    step="0.01"
                    value={productForm.descuento_producto}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={productForm.descripcion}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen (URL)</label>
                  <input
                    name="imagen_producto"
                    value={productForm.imagen_producto}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    name="estado"
                    value={productForm.estado}
                    onChange={handleProductChange}
                    className="input w-full p-2 border rounded-lg"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* tabla variantes dentro del modal producto */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Variantes</h3>
                  <button
                    onClick={() => {
                      setCurrentVariant({ color: "#2563eb", tallas: [{ talla: "", cantidad: "" }] });
                      setIsVariantModalOpen(true);
                    }}
                    className="btn bg-blue-100 text-blue-700 flex items-center gap-2 px-4 py-2"
                  >
                    <Plus size={14} /> Añadir variante
                  </button>
                </div>

                {variants.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talla</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {variants.map((variant, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: variant.codigo_hex || variant.nombre_color || variant.color }} />
                                <span className="text-sm text-gray-600">{variant.codigo_hex || variant.nombre_color || variant.color}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{variant.nombre_talla || variant.talla}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">{variant.stock ?? variant.cantidad}</span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeVariant(variant)}
                                className="text-red-600 hover:text-red-800 transition-colors flex items-center justify-center h-8 w-8"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-[18px] p-8 text-center">
                    <p className="text-gray-500">No hay variantes añadidas aún</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn bg-gray-200 px-6 py-3"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProduct}
                  className="btn bg-blue-100 text-blue-700 px-6 py-3"
                >
                  Guardar producto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* MODAL VARIANTE (SUBMODAL SOBRE PRODUCT MODAL) */}
        <AnimatePresence>
        {isVariantModalOpen && (
          <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
            <div className="absolute inset-0" onClick={() => setIsVariantModalOpen(false)} />
            <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-2xl overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Añadir Variante</h2>
                <button onClick={() => setIsVariantModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {/* Color picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={currentVariant.color}
                    onChange={(e) => handleVariantChange("color", e.target.value)}
                    className="input w-1/2 p-2 border rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-mono">{currentVariant.color}</span>

                  <select
                    className="ml-4 input w-1/2 p-2 border rounded-lg"
                    value=""
                    onChange={(e) => {
                      const col = colores.find((c) => String(c.id_color) === String(e.target.value));
                      if (col) handleVariantChange("color", col.codigo_hex || col.hex || col.codigo || currentVariant.color);
                    }}
                  >
                    <option value="">Colores del catálogo</option>
                    {colores.map((c) => (
                      <option key={c.id_color} value={c.id_color}>{c.nombre_color} {c.codigo_hex ? `(${c.codigo_hex})` : ""}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsCreateColorOpen(true)}
                    className="w-10 h-10 border rounded-lg flex items-center justify-center"
                    title="Crear color rápido"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* tallas dinámicas */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tallas</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addTalla}
                      className="input px-3 py-2 bg-blue-100 text-blue-700 border rounded-lg flex items-center gap-1 text-sm"
                    >
                      <Plus size={14} /> Agregar talla
                    </button>
                    <select
                      className="px-3 py-2 border rounded"
                      value=""
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) return;
                        const t = tallas.find((tt) => String(tt.id_talla) === String(selectedId));
                        if (t) {
                          setCurrentVariant((prev) => ({ ...prev, tallas: [...prev.tallas, { talla: t.nombre_talla, cantidad: "" }] }));
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="">Tallas disponibles</option>
                      {tallas.map((t) => (
                        <option key={t.id_talla} value={t.id_talla}>{t.nombre_talla}</option>
                      ))}
                    </select>

                    <button onClick={() => setIsCreateTallaOpen(true)} className="w-10 h-10 border rounded-lg flex items-center justify-center">+</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentVariant.tallas.map((talla, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Talla</label>
                        <input
                          type="text"
                          value={talla.talla}
                          onChange={(e) => handleTallaChange(index, "talla", e.target.value)}
                          className="input w-full p-2 border rounded-lg"
                          placeholder="Ej: XL, S, 38"
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input
                          type="number"
                          min="0"
                          value={talla.cantidad}
                          onChange={(e) => handleTallaChange(index, "cantidad", e.target.value)}
                          className="input w-full p-2 border rounded-lg"
                          placeholder="0"
                        />
                      </div>
                      {currentVariant.tallas.length > 1 && (
                        <button onClick={() => removeTalla(index)} className="text-red-600 hover:text-red-800 mb-1 flex items-center justify-center h-8 w-8">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsVariantModalOpen(false)} className="btn bg-gray-200 px-4 py-2">Cancelar</button>
                <button onClick={saveVariant} className="btn bg-blue-100 text-blue-700 px-4 py-2">Guardar variante</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* SUBMODAL CREAR COLOR (encima de variante modal) */}
        <AnimatePresence>
        {isCreateColorOpen && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-white/8 backdrop-blur-xl z-60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
              <h3 className="font-semibold mb-2">Crear color rápido</h3>
              <input
                type="text"
                placeholder="Nombre color"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="input w-full p-2 mb-2"
              />
              <div className="flex items-center gap-2 mb-4">
                <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-12 h-12 p-0 border rounded" />
                <input readOnly value={newColorHex} className="input w-full p-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setIsCreateColorOpen(false); setNewColorName(""); setNewColorHex("#ff0000"); }} className="btn bg-gray-200 px-3 py-1">Cancelar</button>
                <button onClick={handleCreateColor} className="btn bg-blue-100 text-blue-700 px-3 py-1">Crear</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* SUBMODAL CREAR TALLA (encima de variante modal) */}
        <AnimatePresence>
        {isCreateTallaOpen && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-white/8 backdrop-blur-xl z-60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
              <h3 className="font-semibold mb-2">Crear talla rápida</h3>
              <input
                type="text"
                placeholder="Nombre talla"
                value={newTallaName}
                onChange={(e) => setNewTallaName(e.target.value)}
                className="input w-full p-2 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setIsCreateTallaOpen(false); setNewTallaName(""); }} className="btn bg-gray-200 px-3 py-1">Cancelar</button>
                <button onClick={handleCreateTalla} className="btn bg-blue-100 text-blue-700 px-3 py-1">Crear</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
