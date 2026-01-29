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
import { canManage } from "../../../../../../utils/permissions";


export default function Productos({ renderLayout = true }) {
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

    // DEBUG: Ver qué llega del select
    if (name === "id_categoria") {
      console.log("🛠️ [DEBUG] Select Change:", { value, type: typeof value });
    }

    setProductForm((prev) => {
      let finalValue = value;
      // Transformación estricta para id_categoria
      if (name === "id_categoria") {
        // Asegurar que si el valor no es vacío, sea un número válido
        if (value === "") {
          finalValue = null;
        } else {
          finalValue = Number(value);
          if (isNaN(finalValue)) finalValue = null; // Protección extra
        }
      }

      let newData = { ...prev, [name]: finalValue };

      // Autocálculos
      const pCompra = parseFloat(newData.precio_compra) || 0;
      const pVenta = parseFloat(newData.precio) || 0;
      const pGanancia = parseFloat(newData.porcentaje_ganancia) || 0;

      if (name === "precio_compra" || name === "porcentaje_ganancia") {
        // Si cambia costo o margen -> Calcula Precio Venta
        if (pCompra > 0 && pGanancia >= 0) {
          const nuevoPrecio = pCompra * (1 + pGanancia / 100);
          newData.precio = nuevoPrecio.toFixed(2);
        }
      } else if (name === "precio") {
        // Si cambia precio venta -> Calcula Margen (si hay costo)
        if (pCompra > 0 && pVenta > 0) {
          const nuevoMargen = ((pVenta - pCompra) / pCompra) * 100;
          newData.porcentaje_ganancia = nuevoMargen.toFixed(2);
        }
      }

      return newData;
    });
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

    // Validar nombre duplicado
    const nombreDuplicado = productos.some(
      (p) =>
        p.nombre_producto.trim().toLowerCase() === productForm.nombre_producto.trim().toLowerCase() &&
        p.id_producto !== productForm.id_producto
    );

    if (nombreDuplicado) {
      showNotification("El nombre del producto ya existe", "error");
      return;
    }
    const isCompraValid = validateField("precio_compra", productForm.precio_compra);
    const isPrecioValid = validateField("precio", productForm.precio);
    if (!isNombreValid || !isCategoriaValid || !isCompraValid || !isPrecioValid) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }

    // Validación de seguridad para categoría
    if (!productForm.id_categoria || productForm.id_categoria === "" || productForm.id_categoria === "0") {
      showNotification("Selecciona una categoría válida", "error");
      return;
    }

    console.log("🛠️ [DEBUG] saveProduct - Form State:", productForm);
    console.log("🛠️ [DEBUG] saveProduct - id_categoria TYPE:", typeof productForm.id_categoria);
    console.log("🛠️ [DEBUG] saveProduct - id_categoria VALUE:", productForm.id_categoria);

    try {
      const payload = {
        ...productForm,
        nombre_producto: productForm.nombre_producto.trim(),
        descripcion: productForm.descripcion?.trim() || "",
        precio_compra: Number(productForm.precio_compra),
        precio: Number(productForm.precio),
        estado: productForm.estado === "activo", // booleano
        porcentaje_ganancia: Math.min(Number(productForm.porcentaje_ganancia || 0), 999.99),
        descuento_producto: Math.min(Number(productForm.descuento_producto || 0), 999.99),
        id_categoria: Number(productForm.id_categoria),
        imagen_producto: productForm.imagen_producto || "",
        variantes: variants // Enviamos las variantes junto con el producto
      };

      console.log("🛠️ [DEBUG] saveProduct - Final Payload:", payload);

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
      }

      // Ya no necesitamos crear variantes individualmente porque las maneja el backend
      // await createVariante(...) se elimina

      // Recargar datos y cerrar modal
      await cargarDatos();
      setIsProductModalOpen(false);

      // Limpiar formulario y estados
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
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Error al guardar";
      showNotification("Error guardando producto: " + msg, "error");
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
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Error al eliminar";
      showNotification(msg, "error");
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
    // Como ahora enviamos todas las variantes en bloque al guardar, 
    // podemos eliminarlas de la lista visual sin problemas.
    setVariants((prev) => prev.filter((v) => v !== variant));
    showNotification("Variante eliminada (Guardar cambios para aplicar)", "info");
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
  const content = (
    <>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos / Gestión de Productos</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input !pl-[50px] w-full p-2"
              />
            </div>
            {canManage("productos") && (
              <button
                onClick={() => openProductModal(null)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
              >
                <Plus size={18} />
                Registrar nuevo producto
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[5%]">ID</th>
                    <th className="px-6 py-3 w-[8%]">Img</th>
                    <th className="px-6 py-3 w-[18%]">Nombre</th>
                    <th className="px-6 py-3 w-[20%]">Descripción</th>
                    <th className="px-6 py-3 w-[12%]">Categoría</th>
                    <th className="px-6 py-3 w-[8%]">P. Compra</th>
                    <th className="px-6 py-3 w-[8%]">P. Venta</th>
                    <th className="px-6 py-3 w-[6%]">%Ganancia</th>
                    <th className="px-6 py-3 w-[6%]">Desc</th>
                    <th className="px-6 py-3 w-[7%]">Estado</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosActuales.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-8 text-center text-gray-500 italic">
                        No hay productos registrados
                      </td>
                    </tr>
                  ) : (
                    productosActuales.map((p) => (
                      <tr key={p.id_producto} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">{p.id_producto}</td>
                        <td className="px-6 py-4">
                          {p.imagen_producto ? (
                            <img
                              src={p.imagen_producto}
                              alt="Producto"
                              className="w-10 h-10 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{p.nombre_producto}</td>
                        <td className="px-6 py-4">{p.descripcion || "—"}</td>
                        <td className="px-6 py-4">{getCategoriaNombre(p.id_categoria)}</td>
                        <td className="px-6 py-4">${Number(p.precio_compra || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">${Number(p.precio || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">{p.porcentaje_ganancia}%</td>
                        <td className="px-6 py-4">{p.descuento_producto}%</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                          >
                            {p.estado ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openViewModal(p)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            {canManage("productos") && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openProductModal(p)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="Editar"
                                >
                                  <Pen size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openDeleteConfirm(p)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {productosFiltrados.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${paginaActual === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-blue-700">{paginaActual}</span> de {totalPaginas}
              </span>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                className={`px-4 py-2 rounded-lg ${paginaActual === totalPaginas
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* ✅ NOTIFICACIONES */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
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
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${selectedProductForView.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="absolute inset-0" onClick={() => setIsProductModalOpen(false)} />
              <motion.div
                className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">
                    {productForm.id_producto ? "Editar Producto" : "Crear Nuevo Producto"}
                  </h2>
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      name="nombre_producto"
                      value={productForm.nombre_producto}
                      onChange={handleProductChange}
                      onBlur={handleProductBlur}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nombre del producto"
                    />
                    {formErrors.nombre_producto && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_producto}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <select
                      name="id_categoria"
                      value={productForm.id_categoria ?? ""}
                      onChange={handleProductChange}
                      onBlur={handleProductBlur}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria} value={c.id_categoria}>
                          {c.nombre_categoria}
                        </option>
                      ))}
                    </select>
                    {formErrors.id_categoria && <p className="text-red-500 text-xs mt-1">{formErrors.id_categoria}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio compra *</label>
                    <input
                      name="precio_compra"
                      type="number"
                      step="0.01"
                      value={productForm.precio_compra}
                      onChange={handleProductChange}
                      onBlur={handleProductBlur}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                    {formErrors.precio_compra && <p className="text-red-500 text-xs mt-1">{formErrors.precio_compra}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio venta *</label>
                    <input
                      name="precio"
                      type="number"
                      step="0.01"
                      value={productForm.precio}
                      onChange={handleProductChange}
                      onBlur={handleProductBlur}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                    {formErrors.precio && <p className="text-red-500 text-xs mt-1">{formErrors.precio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">% Ganancia</label>
                    <input
                      name="porcentaje_ganancia"
                      type="number"
                      step="0.01"
                      value={productForm.porcentaje_ganancia}
                      onChange={handleProductChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">% Descuento</label>
                    <input
                      name="descuento_producto"
                      type="number"
                      step="0.01"
                      value={productForm.descuento_producto}
                      onChange={handleProductChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={productForm.descripcion}
                      onChange={handleProductChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (URL)</label>
                    <input
                      name="imagen_producto"
                      value={productForm.imagen_producto}
                      onChange={handleProductChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      name="estado"
                      value={productForm.estado}
                      onChange={handleProductChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* === Gestión de Variantes en Modal === */}
                <div className="mb-6 border-t pt-4">
                  <h3 className="text-md font-bold text-gray-800 mb-3">Variantes (Color/Talla/Stock)</h3>

                  {/* Selector y Inputs para agregar variante */}
                  <div className="bg-gray-50 p-3 rounded-md mb-3 space-y-3">
                    <div className="flex flex-wrap gap-2 items-end">

                      {/* Color */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-semibold text-gray-600">Color</label>
                        <div className="flex gap-1">
                          <select
                            value={currentVariant.color}
                            onChange={(e) => handleVariantChange('color', e.target.value)}
                            className="w-full p-1.5 border rounded text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {colores.map(c => (
                              <option key={c.id_color} value={c.nombre_color}>{c.nombre_color}</option>
                            ))}
                          </select>
                          <button onClick={() => setIsCreateColorOpen(true)} className="p-1.5 bg-gray-200 rounded hover:bg-gray-300" title="Nuevo color">+</button>
                        </div>
                      </div>

                      {/* Tallas (simple por ahora) */}
                      <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                        {currentVariant.tallas.map((t, idx) => (
                          <div key={idx} className="flex gap-1 items-center">
                            <div className="flex flex-1 gap-1">
                              <select
                                value={t.talla}
                                onChange={(e) => handleTallaChange(idx, 'talla', e.target.value)}
                                className="p-1.5 border rounded text-sm flex-1"
                              >
                                <option value="">Talla</option>
                                {tallas.map(tl => <option key={tl.id_talla} value={tl.nombre_talla}>{tl.nombre_talla}</option>)}
                              </select>
                              <button
                                onClick={() => setIsCreateTallaOpen(true)}
                                className="p-1.5 bg-gray-200 rounded hover:bg-gray-300 text-gray-600"
                                title="Crear nueva talla"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <input
                              type="number"
                              placeholder="Cant."
                              value={t.cantidad}
                              onChange={(e) => handleTallaChange(idx, 'cantidad', e.target.value)}
                              className="w-16 p-1.5 border rounded text-sm"
                            />
                            {idx === currentVariant.tallas.length - 1 && (
                              <button onClick={addTalla} className="p-1.5 bg-blue-100 text-blue-600 rounded" title="Agregar otra fila de talla">
                                <Plus size={14} />
                              </button>
                            )}
                            {currentVariant.tallas.length > 1 && (
                              <button onClick={() => removeTalla(idx)} className="p-1.5 bg-red-100 text-red-600 rounded" title="Quitar talla">
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={saveVariant}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 h-9"
                      >
                        Agregar al listado
                      </button>
                    </div>
                  </div>

                  {/* Lista de variantes agregadas (TEMPORALES) */}
                  {variants.length > 0 ? (
                    <div className="border rounded-md overflow-hidden max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-xs">
                          <tr>
                            <th className="px-3 py-1 text-left">Color</th>
                            <th className="px-3 py-1 text-left">Talla</th>
                            <th className="px-3 py-1 text-left">Stock</th>
                            <th className="px-3 py-1 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, i) => (
                            <tr key={i} className="border-t text-gray-700">
                              <td className="px-3 py-1">{v.nombre_color}</td>
                              <td className="px-3 py-1">{v.nombre_talla}</td>
                              <td className="px-3 py-1">{v.stock}</td>
                              <td className="px-3 py-1 text-right">
                                <button onClick={() => removeVariant(v)} className="text-red-500 hover:text-red-700">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-2">Agrega variantes arriba (se crean al guardar el producto)</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Guardar Producto
                  </button>
                </div>

                {/* Modales anidados para Color/Talla rápida */}
                {isCreateColorOpen && (
                  <div className="absolute inset-x-4 top-20 bg-white shadow-xl border p-4 rounded z-20">
                    <h5 className="font-bold text-sm mb-2">Nuevo Color</h5>
                    <input
                      className="border p-1 w-full mb-2 text-sm"
                      placeholder="Nombre Color"
                      value={newColorName}
                      onChange={e => setNewColorName(e.target.value)}
                    />
                    <input
                      type="color"
                      className="w-full h-8 mb-2"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsCreateColorOpen(false)} className="text-xs p-1 bg-gray-200 rounded">Cancelar</button>
                      <button onClick={handleCreateColor} className="text-xs p-1 bg-green-500 text-white rounded">Crear</button>
                    </div>
                  </div>
                )}
                {/* Similar para talla si se implementa modal rápido... */}

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
    </>
  );



  return content;
}