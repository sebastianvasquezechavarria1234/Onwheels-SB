// src/feactures/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

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
   <div className="min-h-screen bg-gray-50 p-8">
  <div className="max-w-6xl mx-auto">

    {/* Encabezado */}
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-light text-gray-700">
        Productos <span className="text-gray-400">› Gestión de Productos</span>
      </h1>
    </div>

    {/* Buscador y botón */}
    <div className="flex items-center justify-between mb-8">
      <input
        type="text"
        placeholder="🔍 Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        onClick={() => openProductModal(null)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-full transition-colors duration-200 flex items-center gap-2"
      >
        <Plus size={16} /> Registrar nuevo producto
      </button>
    </div>

          {/* Tabla productos */}
         <div className="overflow-hidden border border-gray-200 rounded-lg">
  <table className="w-full text-sm">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Categoría</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Precio compra</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Precio venta</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">% Ganancia</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Descuento</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Imagen</th>
        <th className="px-4 py-3 text-left font-medium text-gray-500">Acciones</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100 bg-white">
      {productosActuales.map((p) => (
        <tr key={p.id_producto} className="hover:bg-gray-50">
          <td className="px-4 py-3">{p.id_producto}</td>
          <td className="px-4 py-3">{p.nombre_producto}</td>
          <td className="px-4 py-3">{p.descripcion}</td>
          <td className="px-4 py-3">
            {categorias.find((c) => c.id_categoria === p.id_categoria)?.nombre_categoria || ""}
          </td>
          <td className="px-4 py-3">${Number(p.precio_compra || 0).toFixed(2)}</td>
          <td className="px-4 py-3">${Number(p.precio || 0).toFixed(2)}</td>
          <td className="px-4 py-3">{p.porcentaje_ganancia}%</td>
          <td className="px-4 py-3">{p.descuento_producto}%</td>
          <td className="px-4 py-3">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                p.estado === "activo"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {p.estado}
            </span>
          </td>
          <td className="px-4 py-3">
            {p.imagen_producto ? (
              <img
                src={p.imagen_producto}
                alt={p.nombre_producto}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <span className="text-gray-400 italic">Sin imagen</span>
            )}
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => openProductModal(p)}
                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                title="Ver"
              >
                👁
              </button>
              <button
                onClick={() => openProductModal(p)}
                className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteProducto(p.id_producto)}
                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                title="Eliminar"
              >
                🗑
              </button>
            </div>
          </td>
        </tr>
      ))}
      {productosActuales.length === 0 && (
        <tr>
          <td colSpan="11" className="px-4 py-10 text-center text-gray-500">
            No hay productos registrados
          </td>
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
              className="px-3 py-1 rounded-lg border"
            >
              Anterior
            </button>
            <div className="px-3 py-1 rounded-lg border bg-white">Página {paginaActual} / {totalPaginas}</div>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              className="px-3 py-1 rounded-lg border"
            >
              Siguiente
            </button>
          </div>

          {/* MODAL PRODUCTO (CREAR / EDITAR / VER) */}
          {isProductModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/5 backdrop-blur-md z-40 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {productForm.id_producto ? "Editar Producto" : "Crear Nuevo Producto"}
                    </h2>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Nombre del producto"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                      <select
                        name="id_categoria"
                        value={productForm.id_categoria}
                        onChange={handleProductChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={productForm.descripcion}
                        onChange={handleProductChange}
                        className="w-full px-2 py-2 border border-gray-300 rounded-sm"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Imagen (URL)</label>
                      <input
                        name="imagen_producto"
                        value={productForm.imagen_producto}
                        onChange={handleProductChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        name="estado"
                        value={productForm.estado}
                        onChange={handleProductChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
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
                                    className="text-red-600 hover:text-red-800 transition-colors"
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-gray-500">No hay variantes añadidas aún</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveProduct}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      Guardar producto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL VARIANTE (SUBMODAL SOBRE PRODUCT MODAL) */}
          {isVariantModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/6 backdrop-blur-lg z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="p-6">
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
                        className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 font-mono">{currentVariant.color}</span>

                      <select
                        className="ml-4 px-3 py-2 border rounded"
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
                        className="px-2 py-1 bg-gray-200 rounded"
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
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm"
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

                        <button onClick={() => setIsCreateTallaOpen(true)} className="px-2 py-1 bg-gray-200 rounded">+</button>
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>
                          {currentVariant.tallas.length > 1 && (
                            <button onClick={() => removeTalla(index)} className="text-red-600 hover:text-red-800 mb-1">
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button onClick={() => setIsVariantModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                    <button onClick={saveVariant} className="px-4 py-2 bg-green-600 text-white rounded">Guardar variante</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMODAL CREAR COLOR (encima de variante modal) */}
          {isCreateColorOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/8 backdrop-blur-xl z-60 p-4">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h3 className="font-semibold mb-2">Crear color rápido</h3>
                <input
                  type="text"
                  placeholder="Nombre color"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full border p-2 mb-2 rounded"
                />
                <div className="flex items-center gap-2 mb-4">
                  <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-12 h-12 p-0 border rounded" />
                  <input readOnly value={newColorHex} className="w-full border p-2 rounded" />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setIsCreateColorOpen(false); setNewColorName(""); setNewColorHex("#ff0000"); }} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
                  <button onClick={handleCreateColor} className="px-3 py-1 bg-blue-600 text-white rounded">Crear</button>
                </div>
              </div>
            </div>
          )}

          {/* SUBMODAL CREAR TALLA (encima de variante modal) */}
          {isCreateTallaOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/8 backdrop-blur-xl z-60 p-4">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
                <h3 className="font-semibold mb-2">Crear talla rápida</h3>
                <input
                  type="text"
                  placeholder="Nombre talla"
                  value={newTallaName}
                  onChange={(e) => setNewTallaName(e.target.value)}
                  className="w-full border p-2 mb-4 rounded"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setIsCreateTallaOpen(false); setNewTallaName(""); }} className="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
                  <button onClick={handleCreateTalla} className="px-3 py-1 bg-blue-600 text-white rounded">Crear</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
