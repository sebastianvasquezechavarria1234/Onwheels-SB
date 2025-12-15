
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pen, Trash2, Eye, Package, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCompras,
  getCompraById, // ✅ Importado para cargar detalles completos
  createCompra,
  updateCompra,
  deleteCompra,
  updateCompraStatus,
  getComprasByProveedor,
  getProveedores,
} from "../../services/comprasService";
import {
  getProductos,
  createProducto,
  updateProducto,
  getColores,
  createColor,
  getTallas,
  createTalla,
  createVariante,
  deleteVariante,
  getVariantes,
} from "../../services/productosServices";
import { getCategorias } from "../../services/categoriasService";

export default function Compras() {
  // ===== Estados principales =====
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]); // Productos con variantes
  const [loading, setLoading] = useState(true);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [modal, setModal] = useState(null); // 'crear','editar','ver','eliminar','status','selectProducto','reviewProducts'
  const [parentModal, setParentModal] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [form, setForm] = useState({
    nit: "",
    fecha_compra: "",
    estado: "Pendiente",
    items: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedorFiltro, setProveedorFiltro] = useState("todos");
  // Selección temporal cuando eliges productos (estructura robusta)
  // { [id_producto]: { variantes: [{ id_variante, id_color, id_talla, qty, price, nombre_color, nombre_talla }] } }
  const [selectedProducts, setSelectedProducts] = useState({});
  // Historial de proveedor (se cargará solo en editar)
  const [historialProveedor, setHistorialProveedor] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Notificaciones
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  // Protecciones contra doble envío/creación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  // Estados copiados de products (para crear producto desde modal)
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
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
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({ color: "#2563eb", tallas: [{ talla: "", cantidad: "" }] });
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ff0000");
  const [newTallaName, setNewTallaName] = useState("");
  // ==== Utilidades ====
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);
  // Combina productos con variantes (para mostrar en selección)
  const combinarProductosConVariantes = (productosList = [], variantesList = []) => {
    const productoMap = new Map();
    productosList.forEach((p) => productoMap.set(p.id_producto, { ...p, variantes: [] }));
    variantesList.forEach((v) => {
      const producto = productoMap.get(v.id_producto);
      if (producto) {
        producto.variantes.push({
          id_variante: v.id_variante,
          id_color: v.id_color,
          id_talla: v.id_talla,
          stock: v.stock,
          nombre_color: v.nombre_color,
          nombre_talla: v.nombre_talla,
          codigo_hex: v.codigo_hex,
        });
      }
    });
    return Array.from(productoMap.values());
  };
  // ==== Fetch inicial ====
  const fetchData = async () => {
    try {
      setLoading(true);
      const [comprasData, proveedoresData, productosData, variantesData, cats, cols, tls] = await Promise.all([
        getCompras(),
        getProveedores(),
        getProductos(),
        getVariantes(),
        getCategorias(),
        getColores(),
        getTallas(),
      ]);
      const productosConVariantes = combinarProductosConVariantes(productosData || [], variantesData || []);
      setCompras(comprasData || []);
      setProveedores(proveedoresData || []);
      setProductos(productosConVariantes);
      setCategorias(cats || []);
      setColores(cols || []);
      setTallas(tls || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  // ==== CORRECCIÓN CLAVE: openModal ahora carga la compra COMPLETA para "ver" ====
  const openModal = async (type, compra = null) => {
    if (type === "selectProducto") {
      // Guardar parent modal y prellenar selectedProducts a partir de form.items actuales
      setParentModal(modal);
      const initial = {};
      (form.items || []).forEach((it) => {
        if (!initial[it.id_producto]) initial[it.id_producto] = { variantes: [] };
        initial[it.id_producto].variantes.push({
          id_variante: it.id_variante ?? null,
          id_color: it.id_color ?? null,
          id_talla: it.id_talla ?? null,
          qty: it.qty ?? it.cantidad ?? 0,
          price: it.price ?? it.precio_unitario ?? 0,
          nombre_color: it.nombre_color ?? "—",
          nombre_talla: it.nombre_talla ?? "—",
        });
      });
      setSelectedProducts(initial);
      setModal(type);
      return;
    } else if (type === "crearProducto") {
      // Reset form producto
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
      setFormErrors({});
      // Abrir modal de producto independiente
      setModal(null);
      // abrimos modal específico para producto (control de estados)
      // para mantener estructura visual: usamos estado secundario
      setIsProductModalOpen(true);
      return;
    } else if (type === "ver" && compra) {
      // ✅ CARGAR COMPRA COMPLETA CON ITEMS
      try {
        const compraCompleta = await getCompraById(compra.id_compra);
        setSelectedCompra(compraCompleta);
        setModal(type);
      } catch (err) {
        console.error("Error al cargar compra completa:", err);
        showNotification("Error al cargar los detalles de la compra", "error");
      }
      return;
    }
    setModal(type);
    setSelectedCompra(compra);
    if (type === "crear") {
      setForm({
        nit: "",
        fecha_compra: new Date().toISOString().split("T")[0],
        estado: "Pendiente",
        items: [],
      });
      setHistorialProveedor([]);
    } else if (type === "editar" && compra) {
  // ✅ Cargar compra COMPLETA con items desde el backend
  try {
    const compraCompleta = await getCompraById(compra.id_compra);
    setForm({
      nit: compraCompleta.nit,
      fecha_compra: compraCompleta.fecha_compra?.split?.("T")[0] || compraCompleta.fecha_compra || "",
      estado: compraCompleta.estado || "Pendiente",
      items: compraCompleta.items ? JSON.parse(JSON.stringify(compraCompleta.items)) : [],
    });
    loadHistorial(compraCompleta.nit);
  } catch (err) {
    console.error("Error al cargar compra para editar:", err);
    showNotification("Error al cargar los datos de la compra", "error");
  }
}
  };
  const closeModal = () => {
    setModal(null);
    setSelectedCompra(null);
    setSelectedProducts({});
    setParentModal(null);
  };
  // ==== Historial proveedor (solo en editar) ====
  const loadHistorial = async (nit) => {
    if (!nit) return;
    setLoadingHistorial(true);
    try {
      const historial = await getComprasByProveedor(nit);
      historial.sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra));
      setHistorialProveedor(historial || []);
    } catch (err) {
      console.error("Error cargando historial:", err);
      showNotification("Error al cargar historial del proveedor", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };
  // Cuando cambias proveedor en el form (crear/editar)
  const handleProveedorChange = (e) => {
    const nit = e.target.value;
    setForm((prev) => ({ ...prev, nit }));
    if (modal === "editar" && nit) loadHistorial(nit);
    else setHistorialProveedor([]);
  };
  // ==== Submit crear / editar compra ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!form.nit) throw new Error("Proveedor es obligatorio");
      if (!form.items || form.items.length === 0) throw new Error("Debe agregar al menos un producto");
      // validar fechas si existen
      if (form.fecha_aproximada_entrega && new Date(form.fecha_aproximada_entrega) < new Date(form.fecha_compra)) {
        throw new Error("La fecha de entrega no puede ser anterior a la de compra");
      }
      // Calcular total
      const total = form.items.reduce((sum, item) => sum + (Number(item.qty || item.cantidad) || 0) * (Number(item.price || item.precio_unitario) || 0), 0);
      // Normalizar payload (backend espera: items: [{ id_producto, id_color, id_talla, qty, price, id_variante? }])
      const payload = {
        ...form,
        total,
        items: (form.items || []).map((item) => ({
          id_producto: Number(item.id_producto),
          id_variante: item.id_variante ?? null,
          id_color: item.id_color === "" ? null : item.id_color,
          id_talla: item.id_talla === "" ? null : item.id_talla,
          qty: Number(item.qty ?? item.cantidad ?? 0),
          price: Number(item.price ?? item.precio_unitario ?? 0),
          nombre_producto: item.nombre_producto ?? item.nombre_producto ?? undefined,
          nombre_color: item.nombre_color ?? undefined,
          nombre_talla: item.nombre_talla ?? undefined,
        })),
      };
      if (modal === "crear") {
        await createCompra(payload);
        showNotification("Compra registrada", "success");
      } else if (modal === "editar" && selectedCompra) {
        await updateCompra(selectedCompra.id_compra, payload);
        showNotification("Compra actualizada", "success");
      }
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
      showNotification(err.message || "Error al guardar la compra", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  // ==== Eliminar compra ====
  const handleDelete = async () => {
    if (!selectedCompra) return;
    try {
      await deleteCompra(selectedCompra.id_compra);
      await fetchData();
      showNotification("Compra eliminada", "success");
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showNotification(err?.response?.data?.mensaje || "No se pudo eliminar", "error");
    }
  };
  // ==== Actualizar estado (incluye creación de variantes y actualización stock en backend) ====
  const handleStatusUpdate = async (estado, actualizarStock) => {
    if (!selectedCompra) return;
    try {
      await updateCompraStatus(selectedCompra.id_compra, { estado, actualizarStock });
      await fetchData();
      showNotification(actualizarStock && estado === "Recibido" ? "Estado actualizado y stock incrementado" : "Estado actualizado", "success");
      closeModal();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      showNotification(err?.response?.data?.mensaje || "Error al actualizar estado", "error");
    }
  };
  // ==== Selección de productos (multivariante) ====
  const addVariantToProduct = (productId) => {
    setSelectedProducts((prev) => {
      const prod = prev[productId] ? { ...prev[productId] } : { variantes: [] };
      prod.variantes = [...(prod.variantes || []), { id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }];
      return { ...prev, [productId]: prod };
    });
  };
  const removeVariantFromProduct = (productId, idx) => {
    setSelectedProducts((prev) => {
      const prod = { ...(prev[productId] || { variantes: [] }) };
      if (!prod.variantes) return prev;
      const newVariants = [...prod.variantes];
      newVariants.splice(idx, 1);
      if (newVariants.length === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { ...prod, variantes: newVariants } };
    });
  };
  const updateVariantField = (productId, idx, field, value) => {
    setSelectedProducts((prev) => {
      const prod = { ...(prev[productId] || { variantes: [] }) };
      const newVariants = [...(prod.variantes || [])];
      newVariants[idx] = { ...newVariants[idx], [field]: value };
      return { ...prev, [productId]: { ...prod, variantes: newVariants } };
    });
  };
  const handleProductSelect = (productId, checked) => {
    if (checked) {
      setSelectedProducts((prev) => ({
        ...prev,
        [productId]: { variantes: [{ id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }] },
      }));
    } else {
      setSelectedProducts((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  // ==== Revisar y confirmar selección ====
  const openReviewModal = () => setModal("reviewProducts");
  const saveSelectedProducts = () => {
    // transforma selectedProducts a form.items
    const newItems = [];
    for (const [productIdKey, productData] of Object.entries(selectedProducts)) {
      const productId = Number(productIdKey);
      const product = productos.find((p) => p.id_producto === productId);
      if (!product || !productData.variantes) continue;
      for (const v of productData.variantes) {
        const qty = Number(v.qty || 0);
        if (qty <= 0) continue;
        if (!v.id_color || !v.id_talla) continue; // requerimos color y talla en la UI
        const varianteExistente = product.variantes?.find((vari) => Number(vari.id_color) === Number(v.id_color) && Number(vari.id_talla) === Number(v.id_talla));
        const newItem = {
          id_producto: productId,
          nombre_producto: product.nombre_producto,
          id_variante: varianteExistente?.id_variante ?? null,
          id_color: Number(v.id_color),
          nombre_color: varianteExistente?.nombre_color ?? (colores.find((c) => Number(c.id_color) === Number(v.id_color))?.nombre_color) ?? "—",
          id_talla: Number(v.id_talla),
          nombre_talla: varianteExistente?.nombre_talla ?? (tallas.find((t) => Number(t.id_talla) === Number(v.id_talla))?.nombre_talla) ?? "—",
          qty,
          price: Number(v.price || product.precio_compra || 0),
        };
        newItems.push(newItem);
      }
    }
    setForm((prev) => {
      const updated = [...(prev.items || [])];
      newItems.forEach((newItem) => {
        const idx = updated.findIndex(
          (i) => Number(i.id_producto) === Number(newItem.id_producto) && Number(i.id_color) === Number(newItem.id_color) && Number(i.id_talla) === Number(newItem.id_talla)
        );
        if (idx !== -1) {
          // sumar cantidades si ya existe
          updated[idx].qty = Number(updated[idx].qty || 0) + Number(newItem.qty || 0);
          // actualizar precio si viene nuevo
          updated[idx].price = newItem.price;
        } else {
          updated.push(newItem);
        }
      });
      return { ...prev, items: updated };
    });
    // limpiar selección temporal
    setSelectedProducts({});
    if (parentModal) {
      setModal(parentModal);
      setParentModal(null);
    } else {
      setModal(null);
    }
  };
  // editar campos de item en la tabla (cantidad, precio)
  const updateItemField = (idx, field, value) =>
    setForm((prev) => {
      const items = [...(prev.items || [])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  const removeItem = (idx) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  // toggle fila expandida
 const toggleRowExpansion = async (idCompra) => {
  // Alternar expansión
  setExpandedRows((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(idCompra)) newSet.delete(idCompra);
    else newSet.add(idCompra);
    return newSet;
  });

  // ✅ Si se está expandiendo (no colapsando), cargar la compra completa
  if (!expandedRows.has(idCompra)) {
    try {
      const compraCompleta = await getCompraById(idCompra);
      // Actualizar solo esta compra en el estado global
      setCompras((prev) =>
        prev.map((c) => (c.id_compra === idCompra ? { ...c, items: compraCompleta.items } : c))
      );
    } catch (err) {
      console.error("Error al cargar compra para detalle expandido:", err);
      showNotification("Error al cargar detalles", "error");
    }
  }
};
  // getters proveedor / info
  const getNombreProveedor = (nit) =>
    proveedores.find((p) => p.nit === nit || p.NIT_proveedor === nit)?.nombre_proveedor || "—";
  const getProveedorInfo = (nit) => {
    const p = proveedores.find((x) => x.nit === nit || x.NIT_proveedor === nit);
    if (!p) return null;
    return {
      nit: p.nit || p.NIT_proveedor || "—",
      nombre_proveedor: p.nombre_proveedor || "—",
      direccion: p.direccion || "—",
      telefono: p.telefono || "—",
      correo: p.email || "—",
      estado: p.estado || "—",
    };
  };
  // ==== Validaciones / product helpers (copiadas y adaptadas) ====
  const validateField = (name, value) => {
    let error = "";
    if (name === "nombre_producto" && (!value || value.trim() === "")) error = "El nombre es obligatorio";
    else if (name === "id_categoria" && !value) error = "Seleccione una categoría";
    else if (name === "precio_compra") {
      const num = Number.parseFloat(value);
      if (isNaN(num) || num <= 0) error = "Debe ser un número > 0";
    } else if (name === "precio") {
      const num = Number.parseFloat(value);
      if (isNaN(num) || num <= 0) error = "Debe ser un número > 0";
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleProductBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  // ==== Guardar producto (crear / actualizar) con protección contra doble envío ====
  const saveProduct = async () => {
    if (isSavingProduct) return;
    // validaciones
    const isNombreValid = validateField("nombre_producto", productForm.nombre_producto);
    const isCategoriaValid = validateField("id_categoria", productForm.id_categoria);
    const isCompraValid = validateField("precio_compra", productForm.precio_compra);
    const isPrecioValid = validateField("precio", productForm.precio);
    if (!isNombreValid || !isCategoriaValid || !isCompraValid || !isPrecioValid) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }
    setIsSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        nombre_producto: productForm.nombre_producto.trim(),
        descripcion: productForm.descripcion?.trim() || "",
        precio_compra: Number(productForm.precio_compra),
        precio: Number(productForm.precio),
        estado: productForm.estado === "activo",
        porcentaje_ganancia: Math.min(Number(productForm.porcentaje_ganancia || 0), 999.99),
        descuento_producto: Math.min(Number(productForm.descuento_producto || 0), 999.99),
        id_categoria: Number(productForm.id_categoria),
        imagen_producto: productForm.imagen_producto || "",
      };
      let nuevoProducto;
      if (productForm.id_producto) {
        nuevoProducto = await updateProducto(productForm.id_producto, payload);
        showNotification("Producto actualizado con éxito", "success");
      } else {
        nuevoProducto = await createProducto(payload);
        if (!nuevoProducto || !nuevoProducto.id_producto) {
          throw new Error("No se recibió ID del producto creado");
        }
        showNotification("Producto creado con éxito", "success");
        // Crear variantes locales (si el usuario añadió variantes en UI)
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
      }
      // Refrescar productos y variantes desde servidor
      const varsActualizadas = await getVariantes();
      const updatedProductos = await getProductos();
      const updatedWithVariants = combinarProductosConVariantes(updatedProductos || [], varsActualizadas || []);
      setProductos(updatedWithVariants);
      setIsProductModalOpen(false);
      // Si fue creación nueva, permitir selección inmediata (no duplicará porque controlamos isSavingProduct)
      if (!productForm.id_producto && nuevoProducto && nuevoProducto.id_producto) {
        setSelectedProducts((prev) => ({
          ...prev,
          [nuevoProducto.id_producto]: { variantes: [{ id_variante: null, id_color: "", id_talla: "", qty: 1, price: 0 }] },
        }));
        // si venías desde selectProducto modal, regresa ahí
        if (modal === "selectProducto" || parentModal === "selectProducto") {
          setModal("selectProducto");
        }
      }
      // Avisa y refresca lista global
      await fetchData();
    } catch (err) {
      console.error("❌ saveProduct error:", err);
      showNotification("Error guardando producto: " + (err.message || err), "error");
    } finally {
      setIsSavingProduct(false);
    }
  };
  // ==== Variantes / colores / tallas (helpers) ====
  const handleVariantChange = (field, value) => setCurrentVariant((prev) => ({ ...prev, [field]: value }));
  const handleTallaChange = (index, field, value) => {
    const newTallas = [...currentVariant.tallas];
    newTallas[index][field] = value;
    setCurrentVariant((prev) => ({ ...prev, tallas: newTallas }));
  };
  const addTalla = () => setCurrentVariant((prev) => ({ ...prev, tallas: [...prev.tallas, { talla: "", cantidad: "" }] }));
  const removeTalla = (index) => {
    const newTallas = [...currentVariant.tallas];
    newTallas.splice(index, 1);
    setCurrentVariant((prev) => ({ ...prev, tallas: newTallas }));
  };
  const saveVariant = async () => {
    try {
      const validTallas = currentVariant.tallas.filter((t) => t.talla?.toString().trim() && Number(t.cantidad) >= 0);
      if (validTallas.length === 0) return showNotification("Agrega al menos una talla con cantidad válida", "error");
      const newVariants = [];
      for (const t of validTallas) {
        let id_color = null;
        let id_talla = null;
        let colorMatch = colores.find(
          (c) =>
            String(c.codigo_hex || c.hex || "").toLowerCase() === String(currentVariant.color).toLowerCase() ||
            c.nombre_color === currentVariant.color,
        );
        if (!colorMatch) {
          const newColor = await createColor({ nombre_color: currentVariant.color, codigo_hex: currentVariant.color });
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
      showNotification("Variante agregada con éxito", "success");
      setIsVariantModalOpen(false);
    } catch (err) {
      console.error("saveVariant error:", err);
      showNotification("Error guardando variante: " + (err.message || err), "error");
    };
  };
  const removeVariant = async (variant) => {
    try {
      if (variant.id_variante) {
        await deleteVariante(variant.id_variante);
        showNotification("Variante eliminada", "success");
        const nuevas = await getVariantes();
        setVariants(nuevas.filter((v) => v.id_producto === productForm.id_producto));
      } else {
        setVariants((prev) => prev.filter((v) => v !== variant));
        showNotification("Variante eliminada", "success");
      }
    } catch (err) {
      console.error("Error eliminando variante:", err);
      showNotification("No se pudo eliminar la variante", "error");
    }
  };
  const getColorNombre = (idColor) => colores.find((c) => c.id_color === idColor)?.nombre_color ?? "—";
  const getTallaNombre = (idTalla) => tallas.find((t) => t.id_talla === idTalla)?.nombre_talla ?? "—";
  // ==== Filtrado / paginación ====
  const filteredCompras = compras.filter((c) => {
    const matchesSearch =
      String(c.id_compra).includes(searchTerm) ||
      getNombreProveedor(c.nit).toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(c.fecha_compra).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProveedor = proveedorFiltro === "todos" || c.nit === proveedorFiltro;
    return matchesSearch && matchesProveedor;
  });
  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage));
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const visibleItems = filteredCompras.slice(indexFirst, indexLast);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);
  // ===== UI =====
  // Estados modales de producto/variante/crear color/talla (controlados por flags)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCreateColorOpen, setIsCreateColorOpen] = useState(false);
  const [isCreateTallaOpen, setIsCreateTallaOpen] = useState(false);
  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-auto h-screen bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Compras / Gestión de Compras</h2>
          {/* Filtros y acciones */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <select
                  value={proveedorFiltro}
                  onChange={(e) => {
                    setProveedorFiltro(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-700"
                >
                  <option value="todos">Todos los proveedores</option>
                  {proveedores.map((p) => (
                    <option key={p.nit || p.NIT_proveedor} value={p.nit || p.NIT_proveedor}>
                      {p.nombre_proveedor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar compras..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Registrar nueva compra
            </button>
          </div>
          {/* Tabla compras */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 w-[5%]">ID</th>
                    <th className="px-6 py-3 w-[25%]">Proveedor</th>
                    <th className="px-6 py-3 w-[15%]">Fecha</th>
                    <th className="px-6 py-3 w-[10%]">Cantidad</th>
                    <th className="px-6 py-3 w-[15%]">Total</th>
                    <th className="px-6 py-3 w-[15%]">Estado</th>
                    <th className="px-6 py-3 w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                        Cargando...
                      </td>
                    </tr>
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                        No hay compras registradas
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((c) => (
                      <React.Fragment key={c.id_compra}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-6 py-4">{c.id_compra}</td>
                          <td className="px-6 py-4 font-medium">{getNombreProveedor(c.nit)}</td>
                          <td className="px-6 py-4">{new Date(c.fecha_compra).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{c.items?.length || 0}</td>
                          <td className="px-6 py-4">${c.total?.toLocaleString?.() ?? c.total}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                c.estado === "Recibido"
                                  ? "bg-green-100 text-green-800"
                                  : c.estado === "Pendiente"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : c.estado === "En tránsito"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {c.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleRowExpansion(c.id_compra)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                title="Ver detalles"
                              >
                                {expandedRows.has(c.id_compra) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal("ver", c)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </motion.button>
                              {c.estado === "Pendiente" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openModal("editar", c)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="Editar"
                                >
                                  <Pen size={16} />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal("eliminar", c)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal("status", c)}
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                                title="Actualizar estado"
                              >
                                <Package size={16} />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                        {/* Detalle compactado (proveedor + productos en una sola tarjeta para mejor estética) */}
                        {expandedRows.has(c.id_compra) && (
                          <tr className="bg-gray-50">
                            <td colSpan="7" className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border">
                                  <h4 className="font-semibold mb-2">Proveedor</h4>
                                  {getProveedorInfo(c.nit) ? (
                                    <div className="text-sm space-y-1 text-gray-700">
                                      <div><strong>NIT:</strong> {getProveedorInfo(c.nit).nit}</div>
                                      <div><strong>Nombre:</strong> {getProveedorInfo(c.nit).nombre_proveedor}</div>
                                      <div><strong>Tel:</strong> {getProveedorInfo(c.nit).telefono}</div>
                                      <div><strong>Correo:</strong> {getProveedorInfo(c.nit).correo}</div>
                                      <div><strong>Dirección:</strong> {getProveedorInfo(c.nit).direccion}</div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Proveedor no encontrado.</p>
                                  )}
                                </div>
                                <div className="bg-white p-4 rounded-lg border">
                                  <h4 className="font-semibold mb-2">Productos ({c.items?.length || 0})</h4>
                                  {c.items && c.items.length > 0 ? (
                                    <div className="text-sm text-gray-700">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="text-left">
                                            <th className="pb-2">Producto</th>
                                            <th className="pb-2">Color</th>
                                            <th className="pb-2">Talla</th>
                                            <th className="pb-2 text-right">Cant</th>
                                            <th className="pb-2 text-right">Subtotal</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {c.items.map((item, idx) => (
                                            <tr key={idx} className="border-t">
                                              <td className="py-2">{item.nombre_producto || "—"}</td>
                                              <td className="py-2">{item.nombre_color || "—"}</td>
                                              <td className="py-2">{item.nombre_talla || "—"}</td>
                                              <td className="py-2 text-right">{item.qty || item.cantidad || 0}</td>
                                              <td className="py-2 text-right">{item.qty ?? 0}</td>
                                              <td className="py-2 text-right">
                                                ${(Number(item.qty ?? 0) * Number(item.price ?? 0)).toLocaleString()}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Sin productos en esta compra.</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Paginación */}
          {filteredCompras.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-6 py-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página <span className="font-semibold text-blue-700">{currentPage}</span> de {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        {/* Notificación */}
        <AnimatePresence>
          {notification.show && (
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ duration: 0.3 }}
              className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded-lg shadow-lg text-white font-medium max-w-xs ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        {/* ===== MODALS: Crear / Editar Compra ===== */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">{modal === "crear" ? "Crear nueva compra" : "Editar compra"}</h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                      <select value={form.nit} onChange={handleProveedorChange} className="w-full p-2 border border-gray-300 rounded-md" required>
                        <option value="">Seleccionar proveedor</option>
                        {proveedores.map((p) => (
                          <option key={p.nit || p.NIT_proveedor} value={p.nit || p.NIT_proveedor}>{p.nombre_proveedor}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de compra</label>
                      <input type="date" value={form.fecha_compra} onChange={(e) => setForm((prev) => ({ ...prev, fecha_compra: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega</label>
                      <input type="date" value={form.fecha_aproximada_entrega || ""} onChange={(e) => setForm((prev) => ({ ...prev, fecha_aproximada_entrega: e.target.value }))} min={form.fecha_compra} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <input type="text" value={form.estado} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                  </div>
                  {/* Compras anteriores: SOLO mostrar en editar */}
                  {form.nit && modal === "editar" && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                      <h4 className="font-medium text-gray-700 mb-2">Compras anteriores:</h4>
                      {loadingHistorial ? (
                        <p className="text-sm text-gray-500">Cargando...</p>
                      ) : historialProveedor.length === 0 ? (
                        <p className="text-sm text-gray-500">Sin compras previas.</p>
                      ) : (
                        historialProveedor.map((p) => (
                          <div key={p.id_compra} className="flex justify-between items-center py-1 text-sm">
                            <span>{p.id_compra} - {new Date(p.fecha_compra).toLocaleDateString()} - ${p.total?.toLocaleString?.() ?? p.total}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {/* Agregar / Ver productos */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agregar Productos</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setParentModal(modal); setModal("selectProducto"); }} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">
                        Seleccionar productos +
                      </button>
                      <button type="button" onClick={openReviewModal} disabled={!form.items || form.items.length === 0} className={`px-4 py-2 rounded-lg text-sm ${form.items?.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                        Ver productos agregados
                      </button>
                    </div>
                  </div>
                  {/* Tabla de items */}
                 {form.items && form.items.length > 0 && (
  <div className="mt-4">
    <table className="w-full text-sm text-left text-gray-600">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Producto</th>
          <th className="text-left py-2">Color</th>
          <th className="text-left py-2">Talla</th>
          <th className="text-left py-2">Cantidad</th>
          <th className="text-left py-2">Precio</th>
          <th className="text-left py-2">Subtotal</th>
          {form.estado === "Pendiente" && <th></th>}
        </tr>
      </thead>
      <tbody>
                        {form.items.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{item.nombre_producto}</td>
                            {/* ✅ COLOR editable */}
                            <td className="py-2">
                              <select
                                value={item.id_color || ""}
                                onChange={(e) => {
                                  const id_color = e.target.value ? Number(e.target.value) : null;
                                  const nombre_color = colores.find(c => c.id_color === id_color)?.nombre_color || "—";
                                  updateItemField(idx, "id_color", id_color);
                                  updateItemField(idx, "nombre_color", nombre_color);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                disabled={form.estado !== "Pendiente"}
                              >
                                <option value="">—</option>
                                {colores.map((c) => (
                                  <option key={c.id_color} value={c.id_color}>
                                    {c.nombre_color} {c.codigo_hex ? `(${c.codigo_hex})` : ""}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {/* ✅ TALLA editable */}
                            <td className="py-2">
                              <select
                                value={item.id_talla || ""}
                                onChange={(e) => {
                                  const id_talla = e.target.value ? Number(e.target.value) : null;
                                  const nombre_talla = tallas.find(t => t.id_talla === id_talla)?.nombre_talla || "—";
                                  updateItemField(idx, "id_talla", id_talla);
                                  updateItemField(idx, "nombre_talla", nombre_talla);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                disabled={form.estado !== "Pendiente"}
                              >
                                <option value="">—</option>
                                {tallas.map((t) => (
                                  <option key={t.id_talla} value={t.id_talla}>
                                    {t.nombre_talla}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {/* CANTIDAD editable (ya lo tienes) */}
                            <td className="py-2">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItemField(idx, "qty", Number(e.target.value))}
                                className="w-16 p-2 border border-gray-300 rounded-md"
                                disabled={form.estado !== "Pendiente"}
                              />
                            </td>
                            {/* PRECIO editable (ya lo tienes) */}
                            <td className="py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateItemField(idx, "price", Number(e.target.value))}
                                className="w-20 p-2 border border-gray-300 rounded-md"
                                disabled={form.estado !== "Pendiente"}
                              />
                            </td>
                            <td className="py-2">${((item.qty || 0) * (item.price || 0)).toLocaleString()}</td>
                            {form.estado === "Pendiente" && (
                              <td>
                                <button
                                  type="button"
                                  onClick={() => removeItem(idx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="5" className="text-right font-bold">Total:</td>
                            <td className="font-bold">${form.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0).toLocaleString()}</td>
                            {form.estado === "Pendiente" && <td></td>}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
                      {isSubmitting ? (modal === "crear" ? "Registrando..." : "Guardando...") : (modal === "crear" ? "Registrar" : "Guardar")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ===== MODAL: SELECT PRODUCTO ===== */}
        <AnimatePresence>
          {modal === "selectProducto" && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
              <div className="absolute inset-0" onClick={() => { if (parentModal) setModal(parentModal); else closeModal(); }} />
              <motion.div className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Seleccionar productos</h2>
                  <div>
                    {/* Mantengo botón crear producto (opcional) pero protegido contra doble creación */}
                    <button type="button" onClick={() => openModal("crearProducto")} className="mr-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md">Crear producto</button>
                    <button onClick={() => { if (parentModal) setModal(parentModal); else closeModal(); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><Search size={18} /></div>
                    <input type="text" placeholder="Buscar producto" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                  </div>
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {productos.filter(
                    (p) => (p.nombre_producto || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((p) => (
                    <div key={p.id_producto} className="p-4 rounded-lg border bg-gray-50">
                      <div className="flex items-start gap-4">
                        <input type="checkbox" checked={!!selectedProducts[p.id_producto]} onChange={(e) => handleProductSelect(p.id_producto, e.target.checked)} className="mt-1" />
                        <div className="flex-shrink-0">
                          {p.imagen_producto ? <img src={p.imagen_producto || "/placeholder.svg"} alt={p.nombre_producto} className="w-16 h-16 object-cover rounded" /> : <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"><span className="text-gray-500">No image</span></div>}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium">{p.nombre_producto}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{p.descripcion || "Sin descripción"}</p>
                        </div>
                      </div>
                      {selectedProducts[p.id_producto] && (
                        <div className="mt-4 space-y-3">
                          {selectedProducts[p.id_producto].variantes.map((v, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-3 bg-white rounded border">
                              <div>
                                <label className="block text-xs font-medium mb-1">Color</label>
                                <select value={v.id_color} onChange={(e) => updateVariantField(p.id_producto, idx, "id_color", e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                  <option value="">Seleccionar</option>
                                  {colores.map((c) => (<option key={c.id_color} value={c.id_color}>{c.nombre_color} {c.codigo_hex ? `(${c.codigo_hex})` : ""}</option>))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Talla</label>
                                <select value={v.id_talla} onChange={(e) => updateVariantField(p.id_producto, idx, "id_talla", e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                  <option value="">Seleccionar</option>
                                  {tallas.map((t) => (<option key={t.id_talla} value={t.id_talla}>{t.nombre_talla}</option>))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Cantidad</label>
                                <input type="number" min="1" value={v.qty} onChange={(e) => updateVariantField(p.id_producto, idx, "qty", e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Precio</label>
                                <input type="number" min="0" step="0.01" value={v.price || p.precio_compra || 0} onChange={(e) => updateVariantField(p.id_producto, idx, "price", e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                              </div>
                              <div className="flex gap-1">
                                <button type="button" onClick={() => addVariantToProduct(p.id_producto)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">+</button>
                                <button type="button" onClick={() => removeVariantFromProduct(p.id_producto, idx)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">−</button>
                              </div>
                            </div>
                          ))}
                          {selectedProducts[p.id_producto].variantes.length === 0 && <div className="p-3 text-center text-gray-500 text-sm">Sin variantes seleccionadas</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  {productos.filter(
                    (p) => (p.nombre_producto || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && <p className="text-gray-500 text-center py-10">No se encontraron productos.</p>}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => { if (parentModal) setModal(parentModal); else closeModal(); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
                  <button type="button" onClick={saveSelectedProducts} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">Confirmar selección</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ===== MODAL: REVIEW (productos agregados) ===== */}
        <AnimatePresence>
          {modal === "reviewProducts" && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
              <div className="absolute inset-0" onClick={() => setModal(parentModal || "crear")} />
              <motion.div className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Productos agregados</h2>
                  <button onClick={() => setModal(parentModal || "crear")} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                {form.items.length === 0 ? <p className="text-gray-500 text-center py-10">No hay productos agregados.</p> : (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">Producto</th>
                            <th className="px-2 py-1 text-left">Color</th>
                            <th className="px-2 py-1 text-left">Talla</th>
                            <th className="px-2 py-1 text-left">Cant.</th>
                            <th className="px-2 py-1 text-left">Precio</th>
                            <th className="px-2 py-1 text-left">Subtotal</th>
                            <th className="px-2 py-1 text-left">Acc.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.map((it, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-2 py-1">{it.nombre_producto}</td>
                              <td className="px-2 py-1">{it.nombre_color}</td>
                              <td className="px-2 py-1">{it.nombre_talla}</td>
                              <td className="px-2 py-1"><input type="number" min="1" value={it.qty} onChange={(e) => updateItemField(i, "qty", Number(e.target.value))} className="w-14 p-1 border rounded text-xs" /></td>
                              <td className="px-2 py-1"><input type="number" min="0" step="0.01" value={it.price} onChange={(e) => updateItemField(i, "price", Number(e.target.value))} className="w-20 p-1 border rounded text-xs" /></td>
                              <td className="px-2 py-1">${((it.qty || 0) * (it.price || 0)).toLocaleString()}</td>
                              <td className="px-2 py-1"><button onClick={() => removeItem(i)} className="text-red-500 text-xs">Eliminar</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pt-4 text-right">
                      <div className="text-lg font-bold">Total: ${form.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={() => setModal(parentModal || "crear")} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Regresar</button>
                  <button type="button" onClick={() => { setModal(parentModal || "crear"); }} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">Confirmar y regresar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ===== MODALS: ver / eliminar / status (igual que antes) ===== */}
        <AnimatePresence>
          {modal === "ver" && selectedCompra && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 20 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h3 className="text-xl font-bold text-gray-800 mb-5 text-center">Detalles de la Compra</h3>
                <div className="space-y-4 mb-6 text-gray-700">
                  <div><div className="font-medium text-gray-600">ID</div><div>{selectedCompra.id_compra}</div></div>
                  <div><div className="font-medium text-gray-600">Proveedor</div><div>{getNombreProveedor(selectedCompra.nit)}</div></div>
                  <div><div className="font-medium text-gray-600">Fecha compra</div><div>{new Date(selectedCompra.fecha_compra).toLocaleDateString("es-CO")}</div></div>
                  <div><div className="font-medium text-gray-600">Total</div><div>{selectedCompra.total !== undefined ? `$${selectedCompra.total.toLocaleString()}` : "—"}</div></div>
                  <div><div className="font-medium text-gray-600">Estado</div><div><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${selectedCompra.estado === "Recibido" ? "bg-green-100 text-green-800" : selectedCompra.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800" : selectedCompra.estado === "En tránsito" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}>{selectedCompra.estado}</span></div></div>
                </div>
                {selectedCompra.items && selectedCompra.items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Productos</h4>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Producto</th>
                            <th className="px-4 py-2 text-left">Color</th>
                            <th className="px-4 py-2 text-left">Talla</th>
                            <th className="px-4 py-2 text-left">Cant</th>
                            <th className="px-4 py-2 text-left">Precio</th>
                            <th className="px-4 py-2 text-left">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCompra.items.map((it, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-4 py-2">{it.nombre_producto}</td>
                              <td className="px-4 py-2">{it.nombre_color}</td>
                              <td className="px-4 py-2">{it.nombre_talla}</td>
                              <td className="px-4 py-2">{it.qty}</td>
                              <td className="px-4 py-2">${it.price?.toLocaleString?.() ?? it.price}</td>
                              <td className="px-4 py-2">${((it.qty || 0) * (it.price || 0)).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="flex justify-center pt-2">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">Cerrar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {modal === "eliminar" && selectedCompra && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 20 }} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-red-600 mb-4 text-center">Eliminar Compra</h3>
                <p className="text-gray-700 text-center">¿Está seguro de eliminar la compra <span className="font-bold">{selectedCompra.id_compra}</span>? <br /><span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span></p>
                <div className="flex justify-center gap-3 pt-6">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {modal === "status" && selectedCompra && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
              <motion.div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 20 }} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Actualizar Estado del Pedido</h3>
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); const estado = fd.get("estado"); const actualizarStock = fd.get("actualizarStock") === "on"; handleStatusUpdate(estado, actualizarStock); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
                    <select name="estado" defaultValue={selectedCompra.estado} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="Pendiente">Pendiente</option>
                      <option value="En tránsito">En tránsito</option>
                      <option value="Recibido">Recibido</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-start gap-2">
                    <Check className="h-5 w-5 mt-0.5" />
                    <span><strong>Actualización automática de stock</strong><br />Al marcar como "Recibido", el stock de los productos se actualizará automáticamente si lo seleccionas.</span>
                  </div>
                  <div className="flex justify-center gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">Registrar</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ===== MODALS: CREAR PRODUCTO / VARIANTE / COLOR / TALLA ===== */}
        <AnimatePresence>
          {isProductModalOpen && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
              <div className="absolute inset-0" onClick={() => setIsProductModalOpen(false)} />
              <motion.div className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">{productForm.id_producto ? "Editar Producto" : "Crear Nuevo Producto"}</h2>
                  <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                {/* formulario producto (igual que antes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input name="nombre_producto" value={productForm.nombre_producto} onChange={handleProductChange} onBlur={handleProductBlur} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Nombre del producto" />
                    {formErrors.nombre_producto && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_producto}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <select name="id_categoria" value={productForm.id_categoria} onChange={handleProductChange} onBlur={handleProductBlur} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((c) => (<option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>))}
                    </select>
                    {formErrors.id_categoria && <p className="text-red-500 text-xs mt-1">{formErrors.id_categoria}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio compra *</label>
                    <input name="precio_compra" type="number" step="0.01" value={productForm.precio_compra} onChange={handleProductChange} onBlur={handleProductBlur} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0.00" />
                    {formErrors.precio_compra && <p className="text-red-500 text-xs mt-1">{formErrors.precio_compra}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio venta *</label>
                    <input name="precio" type="number" step="0.01" value={productForm.precio} onChange={handleProductChange} onBlur={handleProductBlur} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0.00" />
                    {formErrors.precio && <p className="text-red-500 text-xs mt-1">{formErrors.precio}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">% Ganancia</label>
                    <input name="porcentaje_ganancia" type="number" step="0.01" value={productForm.porcentaje_ganancia} onChange={handleProductChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">% Descuento</label>
                    <input name="descuento_producto" type="number" step="0.01" value={productForm.descuento_producto} onChange={handleProductChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea name="descripcion" value={productForm.descripcion} onChange={handleProductChange} className="w-full p-2 border border-gray-300 rounded-md" rows={2} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (URL)</label>
                    <input name="imagen_producto" value={productForm.imagen_producto} onChange={handleProductChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="https://ejemplo.com/imagen.jpg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select name="estado" value={productForm.estado} onChange={handleProductChange} className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
                {/* variantes */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold text-gray-900">Variantes</h3>
                    <button onClick={() => { setCurrentVariant({ color: "#2563eb", tallas: [{ talla: "", cantidad: "" }] }); setIsVariantModalOpen(true); }} className="bg-blue-100 text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-md text-sm"><Plus size={12} /> Añadir</button>
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
                                  <div className="w-5 h-5 rounded border" style={{ backgroundColor: variant.codigo_hex || "#ccc" }} />
                                  <span className="text-gray-700">{variant.codigo_hex || variant.nombre_color || variant.color}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-900">{variant.nombre_talla || variant.talla}</td>
                              <td className="px-3 py-2 text-gray-700">{variant.stock ?? variant.cantidad}</td>
                              <td className="px-3 py-2">
                                <button onClick={() => removeVariant(variant)} className="text-red-600 hover:text-red-800"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center text-gray-500 text-sm">Sin variantes</div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
                  <button onClick={saveProduct} disabled={isSavingProduct} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md">
                    {isSavingProduct ? "Guardando..." : "Guardar producto"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Variant / Create color / create talla modals (copiados y usados arriba) */}
        <AnimatePresence>
          {isVariantModalOpen && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} role="dialog" aria-modal="true">
              <div className="absolute inset-0" onClick={() => setIsVariantModalOpen(false)} />
              <motion.div className="relative z-10 bg-white p-5 rounded-lg w-[90%] max-w-lg overflow-y-auto" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Añadir Variante</h2>
                  <button onClick={() => setIsVariantModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={currentVariant.color} onChange={(e) => handleVariantChange("color", e.target.value)} className="w-10 h-10 p-0 border rounded cursor-pointer" />
                    <span className="text-sm text-gray-600 font-mono">{currentVariant.color}</span>
                    <select className="ml-2 w-full p-2 border border-gray-300 rounded-md" value="" onChange={(e) => { const col = colores.find((c) => String(c.id_color) === String(e.target.value)); if (col) handleVariantChange("color", col.codigo_hex || col.hex || col.codigo || currentVariant.color); }}>
                      <option value="">Colores del catálogo</option>
                      {colores.map((c) => (<option key={c.id_color} value={c.id_color}>{c.nombre_color} {c.codigo_hex ? `(${c.codigo_hex})` : ""}</option>))}
                    </select>
                    <button onClick={() => setIsCreateColorOpen(true)} className="w-8 h-8 border rounded flex items-center justify-center text-sm" title="Crear color rápido">+</button>
                  </div>
                </div>
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold text-gray-900">Tallas</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={addTalla} className="px-2.5 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-md flex items-center gap-1 text-sm"><Plus size={12} /> Agregar</button>
                      <select className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm" value="" onChange={(e) => { const selectedId = e.target.value; if (!selectedId) return; const t = tallas.find((tt) => String(tt.id_talla) === String(selectedId)); if (t) setCurrentVariant((prev) => ({ ...prev, tallas: [...prev.tallas, { talla: t.nombre_talla, cantidad: "" }] })); e.target.value = ""; }}>
                        <option value="">Tallas disponibles</option>
                        {tallas.map((t) => (<option key={t.id_talla} value={t.id_talla}>{t.nombre_talla}</option>))}
                      </select>
                      <button onClick={() => setIsCreateTallaOpen(true)} className="w-8 h-8 border rounded flex items-center justify-center text-sm">+</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {currentVariant.tallas.map((talla, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input type="text" value={talla.talla} onChange={(e) => handleTallaChange(index, "talla", e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ej: XL, S, 38" />
                        </div>
                        <div className="w-20">
                          <input type="number" min="0" value={talla.cantidad} onChange={(e) => handleTallaChange(index, "cantidad", e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="0" />
                        </div>
                        {currentVariant.tallas.length > 1 && (<button onClick={() => removeTalla(index)} className="text-red-600 hover:text-red-800 mb-1 flex items-center justify-center h-8 w-8"><Trash2 size={16} /></button>)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsVariantModalOpen(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm">Cancelar</button>
                  <button onClick={saveVariant} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm">Guardar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isCreateColorOpen && (
            <motion.div className="fixed inset-0 flex items-center justify-center bg-black/15 backdrop-blur-sm z-60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white p-4 rounded-md shadow-lg w-full max-w-xs" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
                <h3 className="font-semibold mb-2 text-sm">Crear color rápido</h3>
                <input type="text" placeholder="Nombre color" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} className="w-full p-2 mb-2 border border-gray-300 rounded-md" />
                <div className="flex items-center gap-2 mb-3">
                  <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-8 h-8 p-0 border rounded" />
                  <input readOnly value={newColorHex} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setIsCreateColorOpen(false); setNewColorName(""); setNewColorHex("#ff0000"); }} className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">Cancelar</button>
                  <button onClick={async () => { if (!newColorName.trim()) return showNotification("Ingrese nombre del color", "error"); const created = await createColor({ nombre_color: newColorName.trim(), codigo_hex: newColorHex }); if (created) setColores((prev) => [...prev, created]); setNewColorName(""); setNewColorHex("#ff0000"); setIsCreateColorOpen(false); showNotification("Color creado con éxito") }} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">Crear</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isCreateTallaOpen && (
            <motion.div className="fixed inset-0 flex items-center justify-center bg-black/15 backdrop-blur-sm z-60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white p-4 rounded-md shadow-lg w-full max-w-xs" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
                <h3 className="font-semibold mb-2 text-sm">Crear talla rápida</h3>
                <input type="text" placeholder="Nombre talla" value={newTallaName} onChange={(e) => setNewTallaName(e.target.value)} className="w-full p-2 mb-3 border border-gray-300 rounded-md" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setIsCreateTallaOpen(false); setNewTallaName(""); }} className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">Cancelar</button>
                  <button onClick={async () => { if (!newTallaName.trim()) return showNotification("Ingrese nombre de talla", "error"); const created = await createTalla({ nombre_talla: newTallaName.trim() }); if (created) setTallas((prev) => [...prev, created]); setNewTallaName(""); setIsCreateTallaOpen(false); showNotification("Talla creada con éxito") }} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">Crear</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
