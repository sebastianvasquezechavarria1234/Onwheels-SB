// src/features/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
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
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [variantesGlobales, setVariantesGlobales] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCreateColorOpen, setIsCreateColorOpen] = useState(false);
  const [isCreateTallaOpen, setIsCreateTallaOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;
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
  const [formErrors, setFormErrors] = useState({});
  const validateField = (name, value) => {
    let error = "";
    if (name === "nombre_producto" && (!value || value.trim() === "")) {
      error = "El nombre es obligatorio";
    } else if (name === "id_categoria" && !value) {
      error = "Seleccione una categoría";
    } else if (name === "precio_compra") {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) error = "Debe ser un número > 0";
    } else if (name === "precio") {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) error = "Debe ser un número > 0";
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    color: "#2563eb",
    tallas: [{ talla: "", cantidad: "" }],
  });
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ff0000");
  const [newTallaName, setNewTallaName] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };
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
      showNotification("Error cargando datos", "error");
    }
  };
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleProductBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  const openProductModal = (producto = null) => {
    if (producto) {
      setProductForm({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto || "",
        id_categoria: producto.id_categoria || "",
        precio_compra: producto.precio_compra?.toString() ?? "",
        precio: producto.precio?.toString() ?? "",
        porcentaje_ganancia: producto.porcentaje_ganancia?.toString() ?? "",
        descuento_producto: producto.descuento_producto?.toString() ?? "",
        descripcion: producto.descripcion ?? "",
        imagen_producto: producto.imagen_producto ?? "",
        // 👇 CORREGIDO: maneja booleano directamente
        estado: producto.estado ? "activo" : "inactivo",
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
    setFormErrors({});
    setIsProductModalOpen(true);
  };
  const openViewModal = (producto) => {
    setSelectedProductForView(producto);
    setIsViewModalOpen(true);
  };
  const saveProduct = async () => {
    const isNombreValid = validateField("nombre_producto", productForm.nombre_producto);
    const isCategoriaValid = validateField("id_categoria", productForm.id_categoria);
    const isCompraValid = validateField("precio_compra", productForm.precio_compra);
    const isPrecioValid = validateField("precio", productForm.precio);
    if (!isNombreValid || !isCategoriaValid || !isCompraValid || !isPrecioValid) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }
    try {
      const payload = {
        ...productForm,
        nombre_producto: productForm.nombre_producto.trim(),
        descripcion: productForm.descripcion?.trim() || "",
        precio_compra: Number(productForm.precio_compra),
        precio: Number(productForm.precio),
        // 👇 CORREGIDO: envía booleano, no 1/0
        estado: productForm.estado === "activo",
        porcentaje_ganancia: Math.min(Number(productForm.porcentaje_ganancia || 0), 999.99),
        descuento_producto: Math.min(Number(productForm.descuento_producto || 0), 999.99),
        id_categoria: Number(productForm.id_categoria),
        imagen_producto: productForm.imagen_producto || "",
      };
      let nuevoProducto;
      if (productForm.id_producto) {
        await updateProducto(productForm.id_producto, payload);
        showNotification("Producto actualizado con éxito");
      } else {
        nuevoProducto = await createProducto(payload);
        if (!nuevoProducto || !nuevoProducto.id_producto) {
          throw new Error("No se recibió ID del producto creado");
        }
        showNotification("Producto creado con éxito");
        for (const v of variants) {
          if (v.id_color != null && v.id_talla != null) {
            await createVariante({
              id_producto: nuevoProducto.id_producto,
              id_color: v.id_color,
              id_talla: v.id_talla,
              stock: v.stock || 0,
            });
          }
        }
        const varsActualizadas = await getVariantes();
        setVariantesGlobales(varsActualizadas || []);
      }
      await cargarDatos();
      setIsProductModalOpen(false);
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
    } catch (err) {
      console.error("❌ saveProduct error:", err);
      showNotification("Error guardando producto: " + (err.message || err), "error");
    }
  };
  const openDeleteConfirm = (producto) => {
    setProductoToDelete(producto);
    setIsDeleteConfirmOpen(true);
  };
 const confirmDelete = async () => {
  try {
    await deleteProducto(productoToDelete.id_producto);
    await cargarDatos();
    showNotification("Producto eliminado con éxito");
  } catch (err) {
    console.error("eliminar producto error:", err);
    showNotification(err.message || "Error al eliminar el producto", "error"); // ✅ Usa tu sistema de notificaciones
  } finally {
    setIsDeleteConfirmOpen(false);
    setProductoToDelete(null);
  }
};

  // === Lógica de variantes ===
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
        return showNotification("Agrega al menos una talla con cantidad válida", "error");
      const newVariants = [];
      for (const t of validTallas) {
        let id_color = null;
        let id_talla = null;
        let colorMatch = colores.find(
          (c) =>
            String(c.codigo_hex || c.hex || "").toLowerCase() ===
              String(currentVariant.color).toLowerCase() ||
            c.nombre_color === currentVariant.color
        );
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
        let tallaMatch = tallas.find((tt) => tt.nombre_talla === t.talla);
        if (!tallaMatch) {
          const newTalla = await createTalla({ nombre_talla: t.talla });
          if (newTalla) {
            tallaMatch = newTalla;
            setTallas((prev) => [...prev, newTalla]);
          }
        }
        if (tallaMatch) id_talla = tallaMatch.id_talla;
        const variantObj = {
          id_color,
          id_talla,
          stock: Number(t.cantidad) || 0,
          nombre_color: currentVariant.color,
          nombre_talla: t.talla,
          codigo_hex: currentVariant.color,
        };
        newVariants.push(variantObj);
      }
      setVariants((prev) => [...prev, ...newVariants]);
      setCurrentVariant({ color: "#2563eb", tallas: [{ talla: "", cantidad: "" }] });
      setIsVariantModalOpen(false);
      showNotification("Variante agregada con éxito");
    } catch (err) {
      console.error("saveVariant error:", err);
      showNotification("Error guardando variante: " + (err.message || err), "error");
    }
  };
  const removeVariant = (variant) => {
  if (variant.id_variante) {
    // ✅ Corregido: ahora es una alerta ROJA y usa tu sistema
    showNotification("No puedes eliminar variantes ya guardadas. Guarda primero.", "error");
    return;
  }
  // Solo si es una variante temporal, la eliminamos y mostramos éxito
  setVariants((prev) => prev.filter((v) => v !== variant));
  showNotification("Variante eliminada", "success");
};
  const handleCreateColor = async () => {
    try {
      if (!newColorName.trim()) return showNotification("Ingrese nombre del color", "error");
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
      showNotification("Color creado con éxito");
    } catch (err) {
      console.error("handleCreateColor error:", err);
      showNotification("Error creando color: " + (err.message || err), "error");
    }
  };
  const handleCreateTalla = async () => {
    try {
      if (!newTallaName.trim()) return showNotification("Ingrese nombre de talla", "error");
      const payload = { nombre_talla: newTallaName.trim() };
      const created = await createTalla(payload);
      if (created) {
        setTallas((prev) => [...prev, created]);
      } else {
        await cargarDatos();
      }
      setNewTallaName("");
      setIsCreateTallaOpen(false);
      showNotification("Talla creada con éxito");
    } catch (err) {
      console.error("handleCreateTalla error:", err);
      showNotification("Error creando talla: " + (err.message || err), "error");
    }
  };
  const indexOfLast = paginaActual * productosPorPagina;
  const indexOfFirst = indexOfLast - productosPorPagina;
  const productosFiltrados = productos.filter(p =>
    p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(p.id_producto).includes(busqueda)
  );
  const productosActuales = productosFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / productosPorPagina));
  useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(1);
  }, [totalPaginas, paginaActual, busqueda]);
  const getCategoriaNombre = (idCat) => {
    const cat = categorias.find((c) => c.id_categoria === idCat);
    return cat ? cat.nombre_categoria : "—";
  };
  const getTallaNombre = (idTalla) => {
    const t = tallas.find(t => t.id_talla === idTalla);
    return t ? t.nombre_talla : "—";
  };
  const getColorNombre = (idColor) => {
    const c = colores.find(c => c.id_color === idColor);
    return c ? c.nombre_color : "—";
  };
  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Productos &gt; Gestión de Productos</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[40px] items-center">
          <div className="w-1/3">
            <div className="relative">
              <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input !pl-[50px] w-full p-2"
              />
            </div>
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
                      <div className="flex gap-[14px] items-center justify-center">
                        <button onClick={() => openProductModal(p)} className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md">👁</button>
                        <button onClick={() => openProductModal(p)} className="w-[45px] h-[45px] bg-yellow-100 text-yellow-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-yellow-200 shadow-md">✏️</button>
                        <button onClick={() => handleDeleteProducto(p.id_producto)} className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md">🗑</button>
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

        {/* ✅ NOTIFICACIONES */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${
                notification.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modal de Vista === */}
        <AnimatePresence>
          {isViewModalOpen && selectedProductForView && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Detalles del Producto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    {selectedProductForView.imagen_producto ? (
                      <img
                        src={selectedProductForView.imagen_producto}
                        alt="Producto"
                        className="w-full h-48 object-contain border rounded-md"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md border">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <div className="font-medium text-gray-600">ID</div>
                      <div>{selectedProductForView.id_producto}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Nombre</div>
                      <div>{selectedProductForView.nombre_producto}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Categoría</div>
                      <div>{getCategoriaNombre(selectedProductForView.id_categoria)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Precio Compra</div>
                      <div>${Number(selectedProductForView.precio_compra || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Precio Venta</div>
                      <div>${Number(selectedProductForView.precio || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">% Ganancia</div>
                      <div>{selectedProductForView.porcentaje_ganancia}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Descuento</div>
                      <div>{selectedProductForView.descuento_producto}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Estado</div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                            selectedProductForView.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedProductForView.estado ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variantes en vista */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Variantes</h4>
                  {variantesGlobales
                    .filter(v => v.id_producto === selectedProductForView.id_producto)
                    .length === 0 ? (
                    <p className="text-gray-500 italic">No hay variantes registradas para este producto.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Color</th>
                            <th className="px-4 py-2 text-left">Talla</th>
                            <th className="px-4 py-2 text-left">Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantesGlobales
                            .filter(v => v.id_producto === selectedProductForView.id_producto)
                            .map((v, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-5 h-5 rounded border"
                                      style={{ backgroundColor: colores.find(c => c.id_color === v.id_color)?.codigo_hex || "#ccc" }}
                                    />
                                    <span>{getColorNombre(v.id_color)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2">{getTallaNombre(v.id_talla)}</td>
                                <td className="px-4 py-2">{v.stock}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modal de Confirmación de Eliminación === */}
        <AnimatePresence>
          {isDeleteConfirmOpen && productoToDelete && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-red-600 mb-4 text-center">Eliminar Producto</h3>
                <p className="text-gray-700 text-center">
                  ¿Está seguro de eliminar el producto{" "}
                  <span className="font-bold">{productoToDelete.nombre_producto}</span>?
                  <br />
                  <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </p>
                <div className="flex justify-center gap-3 pt-6">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modal de Producto (Crear/Editar) === */}
        <AnimatePresence>
        {isProductModalOpen && (
          <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
            <div className="absolute inset-0" onClick={() => setIsProductModalOpen(false)} />
            <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-4xl max-h-[92vh] overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
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

                {/* Variantes */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold text-gray-900">Variantes</h3>
                    <button
                      onClick={() => {
                        setCurrentVariant({ color: "#2563eb", tallas: [{ talla: "", cantidad: "" }] });
                        setIsVariantModalOpen(true);
                      }}
                      className="bg-blue-100 text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-md text-sm"
                    >
                      <Plus size={12} /> Añadir
                    </button>
                  </div>
                  {variants.length > 0 ? (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Color</th>
                            <th className="px-3 py-2 text-left">Talla</th>
                            <th className="px-3 py-2 text-left">Cantidad</th>
                            <th className="px-3 py-2 text-left">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {variants.map((variant, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-5 h-5 rounded border"
                                    style={{ backgroundColor: variant.codigo_hex || "#ccc" }}
                                  />
                                  <span className="text-gray-700">
                                    {variant.codigo_hex || variant.nombre_color || variant.color}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-900">
                                {variant.nombre_talla || variant.talla}
                              </td>
                              <td className="px-3 py-2 text-gray-700">
                                {variant.stock ?? variant.cantidad}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => removeVariant(variant)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center text-gray-500 text-sm">
                      Sin variantes
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button onClick={saveProduct} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
                    Guardar producto
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modales de variantes, color, talla === */}
        {/* (mantenidos sin cambios, como solicitaste) */}

        <AnimatePresence>
          {isVariantModalOpen && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="absolute inset-0" onClick={() => setIsVariantModalOpen(false)} />
              <motion.div
                className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-lg overflow-y-auto"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Añadir Variante</h2>
                  <button
                    onClick={() => setIsVariantModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentVariant.color}
                      onChange={(e) => handleVariantChange("color", e.target.value)}
                      className="w-10 h-10 p-0 border rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 font-mono">{currentVariant.color}</span>
                    <select
                      className="ml-2 w-full p-2 border border-gray-300 rounded-md"
                      value=""
                      onChange={(e) => {
                        const col = colores.find((c) => String(c.id_color) === String(e.target.value));
                        if (col)
                          handleVariantChange("color", col.codigo_hex || col.hex || col.codigo || currentVariant.color);
                      }}
                    >
                      <option value="">Colores del catálogo</option>
                      {colores.map((c) => (
                        <option key={c.id_color} value={c.id_color}>
                          {c.nombre_color} {c.codigo_hex ? `(${c.codigo_hex})` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIsCreateColorOpen(true)}
                      className="w-8 h-8 border rounded flex items-center justify-center text-sm"
                      title="Crear color rápido"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold text-gray-900">Tallas</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addTalla}
                        className="px-2.5 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-md flex items-center gap-1 text-sm"
                      >
                        <Plus size={12} /> Agregar
                      </button>
                      <select
                        className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm"
                        value=""
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (!selectedId) return;
                          const t = tallas.find((tt) => String(tt.id_talla) === String(selectedId));
                          if (t) {
                            setCurrentVariant((prev) => ({
                              ...prev,
                              tallas: [...prev.tallas, { talla: t.nombre_talla, cantidad: "" }],
                            }));
                          }
                          e.target.value = "";
                        }}
                      >
                        <option value="">Tallas disponibles</option>
                        {tallas.map((t) => (
                          <option key={t.id_talla} value={t.id_talla}>
                            {t.nombre_talla}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsCreateTallaOpen(true)}
                        className="w-8 h-8 border rounded flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {currentVariant.tallas.map((talla, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={talla.talla}
                            onChange={(e) => handleTallaChange(index, "talla", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Ej: XL, S, 38"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            min="0"
                            value={talla.cantidad}
                            onChange={(e) => handleTallaChange(index, "cantidad", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="0"
                          />
                        </div>
                        {currentVariant.tallas.length > 1 && (
                          <button
                            onClick={() => removeTalla(index)}
                            className="text-red-600 hover:text-red-800 mb-1 flex items-center justify-center h-8 w-8"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsVariantModalOpen(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                  <button onClick={saveVariant} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm">
                    Guardar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateColorOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/15 backdrop-blur-sm z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-4 rounded-md shadow-lg w-full max-w-xs"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
              >
                <h3 className="font-semibold mb-2 text-sm">Crear color rápido</h3>
                <input
                  type="text"
                  placeholder="Nombre color"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                />
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 p-0 border rounded"
                  />
                  <input readOnly value={newColorHex} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreateColorOpen(false);
                      setNewColorName("");
                      setNewColorHex("#ff0000");
                    }}
                    className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleCreateColor} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                    Crear
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateTallaOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/15 backdrop-blur-sm z-60 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-4 rounded-md shadow-lg w-full max-w-xs"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
              >
                <h3 className="font-semibold mb-2 text-sm">Crear talla rápida</h3>
                <input
                  type="text"
                  placeholder="Nombre talla"
                  value={newTallaName}
                  onChange={(e) => setNewTallaName(e.target.value)}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-md"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreateTallaOpen(false);
                      setNewTallaName("");
                    }}
                    className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleCreateTalla} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                    Crear
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}