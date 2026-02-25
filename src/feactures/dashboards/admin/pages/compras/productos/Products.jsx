// src/features/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, Eye, Pen, ImageIcon, Tag, MapPin, User, Calendar, Hash, ChevronLeft, ChevronRight, CheckCircle, Clock } from "lucide-react";
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



// Helper para clases condicionales
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const API_URL = "http://localhost:3000";

export default function Productos({ renderLayout = true }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("");
  const [filtroAlfabetico, setFiltroAlfabetico] = useState("");
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
    estado: "activo",
  });

  // Image handling states
  const [imagenesArchivos, setImagenesArchivos] = useState([]);
  const [imagenesUrls, setImagenesUrls] = useState([]);
  const [imagenesGuardadas, setImagenesGuardadas] = useState([]);
  const [imagenesConservadas, setImagenesConservadas] = useState([]);
  const [urlInput, setUrlInput] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [variantError, setVariantError] = useState("");

  const validateField = (name, value, currentForm = productForm) => {
    let error = "";
    const v = (value || "").toString().trim();

    switch (name) {
      case "id_categoria":
        if (!v || v === "0") error = "Debe seleccionar una categoría.";
        break;
      case "nombre_producto":
        if (!v) error = "El nombre del producto es obligatorio.";
        else {
          const nombreDuplicado = productos.some(
            (p) =>
              p.nombre_producto.trim().toLowerCase() === v.toLowerCase() &&
              p.id_producto !== currentForm.id_producto
          );
          if (nombreDuplicado) error = "Ya existe un producto con este nombre.";
        }
        break;
      case "descripcion":
        if (!v) error = "La descripción es obligatoria.";
        else if (v.length > 500) error = "La descripción no puede superar los 500 caracteres.";
        break;
      case "precio_compra":
        if (!v) error = "El precio de compra es obligatorio.";
        else if (!/^\d+(\.\d+)?$/.test(v)) error = "Ingrese un valor numérico válido.";
        else if (Number(v) < 0) error = "El precio no puede ser negativo.";
        break;
      case "precio":
        if (!v) error = "El precio de venta es obligatorio.";
        else if (!/^\d+(\.\d+)?$/.test(v)) error = "Ingrese un valor numérico válido.";
        else if (Number(v) < 0) error = "El precio no puede ser negativo.";
        break;
      case "descuento_producto":
        if (v) {
          if (!/^\d+(\.\d+)?$/.test(v)) error = "El descuento debe ser un valor numérico.";
          else if (Number(v) < 0) error = "El descuento no puede ser negativo.";
          else if (Number(v) > 100) error = "El descuento no puede superar el 100%.";
        }
        break;
      case "porcentaje_ganancia":
        if (v) {
          if (!/^\d+(\.\d+)?$/.test(v)) error = "Ingrese un porcentaje válido.";
        }
        break;
      case "estado":
        if (!v) error = "Debe seleccionar el estado del producto.";
        break;
      default:
        break;
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateVariantsInline = () => {
    // Determine whether user interacted with currentVariant
    const isInteractingWithTallas = currentVariant.tallas.some(t => t.talla.trim() !== "" || String(t.cantidad).trim() !== "");
    const isInteracting = isInteractingWithTallas || (currentVariant.color && currentVariant.color !== "#2563eb");

    if (!isInteracting) {
      setVariantError("");
      return true;
    }

    const isIncomplete = currentVariant.tallas.some(t =>
      (t.talla.trim() !== "" && String(t.cantidad).trim() === "") ||
      (t.talla.trim() === "" && String(t.cantidad).trim() !== "")
    );

    if (isIncomplete) {
      setVariantError("No puede guardar variantes incompletas. Complete la información de talla y cantidad.");
      return false;
    }

    const validTallas = currentVariant.tallas.filter(
      (t) => t.talla.trim() !== "" && String(t.cantidad).trim() !== "" && Number(t.cantidad) >= 0
    );

    if (validTallas.length === 0) {
      setVariantError("Debe agregar al menos una variante válida.");
      return false;
    }

    setVariantError("");
    return true;
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

    // Limpiar error al escribir
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

  // Image Handlers
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenesArchivos((prev) => [...prev, ...files]);
  };
  const removeArchivo = (index) => {
    setImagenesArchivos((prev) => prev.filter((_, i) => i !== index));
  };
  const addUrlManual = () => {
    if (urlInput.trim()) {
      setImagenesUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput("");
    }
  };
  const removeUrlManual = (index) => {
    setImagenesUrls((prev) => prev.filter((_, i) => i !== index));
  };
  const toggleConservarImagen = (id_imagen) => {
    setImagenesConservadas((prev) =>
      prev.includes(id_imagen) ? prev.filter((id) => id !== id_imagen) : [...prev, id_imagen]
    );
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
        estado: producto.estado ? "activo" : "inactivo",
      });
      const imgdb = producto.imagenes || [];
      setImagenesGuardadas(imgdb);
      setImagenesConservadas(imgdb.map(img => img.id_imagen));
      setImagenesArchivos([]);
      setImagenesUrls([]);

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
        estado: "activo",
      });
      setImagenesGuardadas([]);
      setImagenesConservadas([]);
      setImagenesArchivos([]);
      setImagenesUrls([]);
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
    const fieldsToValidate = [
      "nombre_producto", "id_categoria", "precio_compra", "precio",
      "descripcion", "estado", "descuento_producto", "porcentaje_ganancia"
    ];
    let isFormValid = true;
    for (const field of fieldsToValidate) {
      if (!validateField(field, productForm[field])) {
        isFormValid = false;
      }
    }

    const isVariantsValid = validateVariantsInline();

    if (!isFormValid || !isVariantsValid) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre_producto", productForm.nombre_producto.trim());
      formData.append("descripcion", productForm.descripcion?.trim() || "");
      formData.append("precio_compra", Number(productForm.precio_compra));
      formData.append("precio", Number(productForm.precio));
      formData.append("estado", productForm.estado === "activo" ? "true" : "false");
      formData.append("porcentaje_ganancia", Math.min(Number(productForm.porcentaje_ganancia || 0), 999.99));
      formData.append("descuento_producto", Math.min(Number(productForm.descuento_producto || 0), 999.99));
      formData.append("id_categoria", Number(productForm.id_categoria));

      // Archivos físicos
      imagenesArchivos.forEach(file => {
        formData.append("imagenes_archivos", file);
      });
      // Urls nuevas
      formData.append("imagenes_urls", JSON.stringify(imagenesUrls));
      // Imágenes que no borramos de la DB
      formData.append("imagenes_conservadas", JSON.stringify(imagenesConservadas));
      // Variantes local states -> stringified
      formData.append("variantes", JSON.stringify(variants));

      let resAPI;
      if (productForm.id_producto) {
        resAPI = await updateProducto(productForm.id_producto, formData);
        showNotification("Producto actualizado con éxito");
      } else {
        resAPI = await createProducto(formData);
        showNotification("Producto creado con éxito");
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
        estado: "activo",
      });
      setImagenesArchivos([]);
      setImagenesUrls([]);
      setImagenesGuardadas([]);
      setImagenesConservadas([]);
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
    if (variantError) setVariantError("");
  };
  const handleTallaChange = (index, field, value) => {
    const newTallas = [...currentVariant.tallas];
    newTallas[index][field] = value;
    setCurrentVariant((prev) => ({ ...prev, tallas: newTallas }));
    if (variantError) setVariantError("");
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
      if (!validateVariantsInline()) return;

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
  let productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(p.id_producto).includes(busqueda);
    const matchCategoria = filtroCategoria ? String(p.id_categoria) === String(filtroCategoria) : true;
    return matchBusqueda && matchCategoria;
  });

  if (filtroPrecio) {
    productosFiltrados.sort((a, b) => filtroPrecio === "asc" ? Number(a.precio) - Number(b.precio) : Number(b.precio) - Number(a.precio));
  } else if (filtroAlfabetico) {
    productosFiltrados.sort((a, b) => filtroAlfabetico === "asc" ? a.nombre_producto.localeCompare(b.nombre_producto) : b.nombre_producto.localeCompare(a.nombre_producto));
  }

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
      <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden">

        {/* --- SECTION 1: HEADER & TOOLBAR (Fixed) --- */}
        <div className="shrink-0 flex flex-col gap-3 p-4 pb-2">

          {/* Row 1: Minimal Header */}
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold! whitespace-nowrap uppercase tracking-wider">
                Gestión de Productos
              </h2>

              {/* Compact Stats */}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="flex font-bold! items-center gap-1.5 px-2 py-0.5 rounded-md ">
                  <Hash className="h-3 w-3 " />
                  <span className="text-xs font-bold!">{productosFiltrados.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Active Toolbar (Big Buttons) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-xl border border-[#040529]/5 px-4 py-3 shadow-sm">
            {/* Search & Create Group */}
            <div className="flex flex-1 w-full sm:w-auto gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                  placeholder="Buscar productos..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition"
                />
                {busqueda && (
                  <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                value={filtroCategoria}
                onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaActual(1); }}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition bg-gray-50 text-gray-700"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
                ))}
              </select>
              <select
                value={filtroPrecio}
                onChange={(e) => { setFiltroPrecio(e.target.value); setFiltroAlfabetico(""); setPaginaActual(1); }}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition bg-gray-50 text-gray-700"
              >
                <option value="">Precio (Todos)</option>
                <option value="asc">Menor a mayor</option>
                <option value="desc">Mayor a menor</option>
              </select>
              <select
                value={filtroAlfabetico}
                onChange={(e) => { setFiltroAlfabetico(e.target.value); setFiltroPrecio(""); setPaginaActual(1); }}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#040529]/10 outline-none transition bg-gray-50 text-gray-700"
              >
                <option value="">Alfabético (Todos)</option>
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
              {canManage("productos") && (
                <button
                  onClick={() => openProductModal(null)}
                  className="flex items-center gap-2 px-5 py-2 bg-[#040529] hover:bg-[#040529]/90 text-white rounded-lg text-sm font-bold transition shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  Crear Producto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TABLE AREA --- */}
        <div className="flex-1 p-4 pt-0 overflow-hidden flex flex-col min-h-0">
          <div className="bg-white rounded-2xl border border-[#040529]/8 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <table className="w-full text-left relative">
                <thead className="bg-[#F0E6E6] text-[#040529] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Imagen</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[20%]">Nombre</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Categoría</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Precios</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[15%]">Stock Var.</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider w-[10%]">Estado</th>
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-right w-[15%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productosActuales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Tag className="h-8 w-8" />
                          <p className="text-sm">No se encontraron productos</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    productosActuales.map((p) => {
                      const pVars = variantesGlobales.filter(v => v.id_producto === p.id_producto);
                      const totalStock = pVars.reduce((acc, v) => acc + (v.stock || 0), 0);

                      return (
                        <tr key={p.id_producto} className="group hover:bg-[#F0E6E6]/30 transition-colors">
                          <td className="px-5 py-4">
                            <div className="h-12 w-16 shrink-0 bg-white border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                              {p.imagenes && p.imagenes.length > 0 ? (
                                <img src={p.imagenes[0].url_imagen?.startsWith('http') ? p.imagenes[0].url_imagen : `${API_URL}${p.imagenes[0].url_imagen}`} alt="Producto" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-[#040529] text-sm">{p.nombre_producto}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {getCategoriaNombre(p.id_categoria)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-1 mb-1">
                              <span className="text-xs text-gray-400 w-12">Compra:</span>
                              <span className="text-xs font-semibold text-gray-600">${Number(p.precio_compra || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-400 w-12">Venta:</span>
                              <span className={`text-xs font-bold ${Number(p.descuento_producto || 0) > 0 ? 'text-gray-400 line-through' : 'text-[#040529]'}`}>${Number(p.precio || 0).toFixed(2)}</span>
                            </div>
                            {Number(p.descuento_producto || 0) > 0 && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold text-white bg-red-500 px-1 rounded">-{p.descuento_producto}%</span>
                                <span className="text-sm font-bold text-green-600">${(Number(p.precio || 0) - (Number(p.precio || 0) * Number(p.descuento_producto || 0) / 100)).toFixed(2)}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-[#040529]">Total: {totalStock} und.</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${p.estado ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${p.estado ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                              {p.estado ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openViewModal(p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Ver"><Eye className="h-4 w-4" /></button>
                              {canManage("productos") && (
                                <>
                                  <button onClick={() => openProductModal(p)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-[#040529] hover:text-white transition shadow-sm border border-gray-100" title="Editar"><Pen className="h-4 w-4" /></button>
                                  <button onClick={() => openDeleteConfirm(p)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            {totalPaginas > 1 && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium">
                  Mostrando <span className="font-bold text-[#040529]">{Math.min(productosActuales.length, productosPorPagina)}</span> de <span className="font-bold text-[#040529]">{productosFiltrados.length}</span> resultados
                </p>
                <div className="flex items-center gap-2">
                  <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronLeft className="h-4 w-4 text-gray-600" /></button>
                  <span className="text-sm font-bold text-[#040529] px-2">{paginaActual}</span>
                  <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(p => p + 1)} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"><ChevronRight className="h-4 w-4 text-gray-600" /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- NOTIFICATIONS --- */}
        <AnimatePresence>
          {notification.show && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 right-4 z-[1000] px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === "success" ? "bg-[#040529]" : "bg-red-500"}`}>
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODALS --- */}
        <AnimatePresence>
          {isProductModalOpen && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl relative overflow-hidden max-w-4xl w-full"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col lg:flex-row h-[500px] lg:h-[600px]">

                  {/* Left Side (Image Preview & Summary) */}
                  <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col border-r border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pattern-grid-lg" />
                    {/* Image Area */}
                    <div className="h-1/2 w-full p-6 flex flex-col items-center justify-center relative z-10 border-b border-gray-200/50">
                      {(() => {
                        const getFullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : null;
                        const dbImg = imagenesGuardadas.find(img => !imagenesConservadas || imagenesConservadas.includes(img.id_imagen))?.url_imagen;

                        const previewImgUrl =
                          getFullUrl(dbImg)
                          || getFullUrl(imagenesUrls[0])
                          || (imagenesArchivos.length > 0 ? URL.createObjectURL(imagenesArchivos[0]) : null);

                        return previewImgUrl ? (
                          <div className="w-full h-full rounded-xl overflow-hidden shadow-sm bg-white p-2 border border-gray-100">
                            <img src={previewImgUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
                            <div className="w-full h-full items-center justify-center bg-gray-50 hidden text-xs text-gray-400">Error al cargar imagen</div>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white/50 text-gray-400 gap-2">
                            <ImageIcon size={32} />
                            <span className="text-xs font-medium">Sin imagen</span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Summary Info */}
                    <div className="flex-1 p-6 z-10 overflow-y-auto">
                      <h4 className="text-[#040529] font-bold text-lg leading-tight mb-4">{productForm.nombre_producto || "Nuevo Producto"}</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <Tag size={16} className="mt-0.5 text-blue-500 shrink-0" />
                          <span>{getCategoriaNombre(productForm.id_categoria) || "Categoría sin definir"}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <MapPin size={16} className="mt-0.5 text-green-500 shrink-0" />
                          <span>Precio Venta: ${productForm.precio || "0.00"}</span>
                        </div>
                        {Number(productForm.descuento_producto) > 0 && (
                          <div className="flex items-start gap-3 text-sm text-gray-600 font-bold text-green-600">
                            <Tag size={16} className="mt-0.5 shrink-0" />
                            <span>Precio Final: ${(Number(productForm.precio || 0) - (Number(productForm.precio || 0) * Number(productForm.descuento_producto || 0) / 100)).toFixed(2)} (-{productForm.descuento_producto}%)</span>
                          </div>
                        )}
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <User size={16} className="mt-0.5 text-orange-500 shrink-0" />
                          <span>Ganancia: {productForm.porcentaje_ganancia || "0"}%</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <Calendar size={16} className="mt-0.5 text-purple-500 shrink-0" />
                          <span>Variantes a agregar: {variants.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side (Form) */}
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                      <h3 className="text-xl font-bold text-[#040529]">
                        {productForm.id_producto ? "Editar Producto" : "Registrar Producto"}
                      </h3>
                      <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                        {/* Group 1: Basics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Producto *</label>
                            <input
                              autoFocus
                              name="nombre_producto"
                              value={productForm.nombre_producto}
                              onChange={handleProductChange}
                              onBlur={handleProductBlur}
                              placeholder="Ej: Camiseta de Verano"
                              className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.nombre_producto ? "border-red-500" : "border-gray-200"}`}
                            />
                            {formErrors.nombre_producto && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.nombre_producto}</p>}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Categoría *</label>
                            <div className="relative mt-1">
                              <select
                                name="id_categoria"
                                value={productForm.id_categoria ?? ""}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] appearance-none ${formErrors.id_categoria ? "border-red-500" : "border-gray-200"}`}
                              >
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                              </select>
                              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                            {formErrors.id_categoria && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.id_categoria}</p>}
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estado *</label>
                            <div className="relative mt-1">
                              <select
                                name="estado"
                                value={productForm.estado}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] appearance-none"
                              >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                              </select>
                              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                            {formErrors.estado && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.estado}</p>}
                          </div>
                        </div>

                        {/* Group 2: Prices */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Clock size={14} /> Gestión de Precios</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Compra *</label>
                              <input
                                name="precio_compra"
                                type="number"
                                step="0.01"
                                value={productForm.precio_compra}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.precio_compra ? "border-red-500" : "border-gray-200"}`}
                              />
                              {formErrors.precio_compra && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.precio_compra}</p>}
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Venta *</label>
                              <input
                                name="precio"
                                type="number"
                                step="0.01"
                                value={productForm.precio}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.precio ? "border-red-500" : "border-gray-200"}`}
                              />
                              {formErrors.precio && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.precio}</p>}
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">% Ganancia</label>
                              <input
                                name="porcentaje_ganancia"
                                type="number"
                                step="0.01"
                                value={productForm.porcentaje_ganancia}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.porcentaje_ganancia ? "border-red-500" : "border-gray-200"}`}
                              />
                              {formErrors.porcentaje_ganancia && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.porcentaje_ganancia}</p>}
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Desc. %</label>
                              <input
                                name="descuento_producto"
                                type="number"
                                step="0.01"
                                value={productForm.descuento_producto}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className={`w-full mt-1 px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm ${formErrors.descuento_producto ? "border-red-500" : "border-gray-200"}`}
                              />
                              {formErrors.descuento_producto && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.descuento_producto}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Group 3: Description & Image */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Descripción *</label>
                            <textarea
                              name="descripcion"
                              value={productForm.descripcion}
                              onChange={handleProductChange}
                              onBlur={handleProductBlur}
                              placeholder="Detalles del producto..."
                              rows={3}
                              className={`w-full mt-1 px-3 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-[#040529]/20 outline-none transition text-sm text-[#040529] ${formErrors.descripcion ? "border-red-500" : "border-gray-200"}`}
                            />
                            {formErrors.descripcion && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.descripcion}</p>}
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Imágenes del Producto *</label>
                            <div className="flex flex-col gap-3 mt-1">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#040529] file:text-white hover:file:bg-[#040529]/90 transition cursor-pointer"
                              />

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={urlInput}
                                  onChange={(e) => setUrlInput(e.target.value)}
                                  placeholder="O cargar URL manual..."
                                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#040529] outline-none focus:ring-2 focus:ring-[#040529]/20"
                                />
                                <button type="button" onClick={addUrlManual} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-sm transition shrink-0">Añadir URL</button>
                              </div>

                              {(imagenesGuardadas.length > 0 || imagenesArchivos.length > 0 || imagenesUrls.length > 0) && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {imagenesGuardadas.map((img) => {
                                    const isKept = !imagenesConservadas || imagenesConservadas.includes(img.id_imagen);
                                    const imgSrc = img.url_imagen || img.url;
                                    const fullImgSrc = imgSrc?.startsWith('http') ? imgSrc : `${API_URL}${imgSrc}`;
                                    return (
                                      <div key={img.id_imagen} className={`relative w-20 h-20 border rounded-md overflow-hidden ${!isKept ? 'opacity-30 border-red-300' : 'border-gray-200'}`}>
                                        <img src={fullImgSrc} alt="saved" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => toggleConservarImagen(img.id_imagen)} title={!isKept ? "Deshacer eliminación" : "Eliminar"} className={`absolute top-1 right-1 rounded-full p-1 transition ${!isKept ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'}`}>
                                          {isKept ? <X size={12} /> : <Plus size={12} className="rotate-45" />}
                                        </button>
                                      </div>
                                    )
                                  })}
                                  {imagenesUrls.map((url, idx) => (
                                    <div key={`url-${idx}`} className="relative w-20 h-20 border border-blue-200 rounded-md overflow-hidden">
                                      <img src={url} alt="url" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => removeUrlManual(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                  {imagenesArchivos.map((file, idx) => {
                                    const objectUrl = URL.createObjectURL(file);
                                    return (
                                      <div key={`file-${idx}`} className="relative w-20 h-20 border border-green-200 rounded-md overflow-hidden">
                                        <img src={objectUrl} alt="file" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(objectUrl)} />
                                        <button type="button" onClick={() => removeArchivo(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                                          <X size={12} />
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* === Gestión de Variantes === */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden mt-6">
                          <div className="bg-[#F0E6E6] px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="text-sm font-bold text-[#040529] uppercase tracking-wider">Variantes (Color/Talla)</h4>
                          </div>
                          <div className="p-4 bg-gray-50">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-wrap gap-2 items-end">
                                {/* Color */}
                                <div className="flex-1 min-w-[120px]">
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
                                  <div className="flex gap-1">
                                    <select
                                      value={currentVariant.color}
                                      onChange={(e) => handleVariantChange('color', e.target.value)}
                                      onBlur={validateVariantsInline}
                                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#040529] outline-none focus:ring-2 focus:ring-[#040529]/20"
                                    >
                                      <option value="">Seleccionar...</option>
                                      {colores.map(c => (
                                        <option key={c.id_color} value={c.nombre_color}>{c.nombre_color}</option>
                                      ))}
                                    </select>
                                    <button onClick={() => setIsCreateColorOpen(true)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-600" title="Nuevo color"><Plus size={16} /></button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 items-end mt-2">
                                {/* Tallas */}
                                <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                                  <label className="block text-xs font-semibold text-gray-600">Tallas</label>
                                  {currentVariant.tallas.map((t, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <div className="flex flex-1 gap-1">
                                        <select
                                          value={t.talla}
                                          onChange={(e) => handleTallaChange(idx, 'talla', e.target.value)}
                                          onBlur={validateVariantsInline}
                                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#040529] outline-none focus:ring-2 focus:ring-[#040529]/20 flex-1"
                                        >
                                          <option value="">Seleccionar talla</option>
                                          {tallas.map(tl => <option key={tl.id_talla} value={tl.nombre_talla}>{tl.nombre_talla}</option>)}
                                        </select>
                                        <button
                                          onClick={() => setIsCreateTallaOpen(true)}
                                          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-600"
                                          title="Crear nueva talla"
                                        >
                                          <Plus size={16} />
                                        </button>
                                      </div>
                                      <input
                                        type="number"
                                        placeholder="Cantidad"
                                        value={t.cantidad}
                                        onChange={(e) => handleTallaChange(idx, 'cantidad', e.target.value)}
                                        onBlur={validateVariantsInline}
                                        className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-[#040529] outline-none focus:ring-2 focus:ring-[#040529]/20"
                                      />
                                      {idx === currentVariant.tallas.length - 1 && (
                                        <button onClick={addTalla} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Agregar otra fila de talla">
                                          <Plus size={16} />
                                        </button>
                                      )}
                                      {currentVariant.tallas.length > 1 && (
                                        <button onClick={() => removeTalla(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Quitar talla">
                                          <X size={16} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={saveVariant}
                                className="mt-3 px-4 py-2 bg-[#040529] text-white rounded-lg text-sm font-bold hover:bg-[#040529]/90 transition w-full md:w-auto self-end shadow-sm"
                              >
                                Agregar variante a la lista
                              </button>
                              {variantError && <p className="text-red-500 text-xs mt-1 font-medium">{variantError}</p>}
                            </div>

                            {/* Lista de variantes agregadas */}
                            {variants.length > 0 ? (
                              <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-white">
                                <table className="w-full text-sm">
                                  <thead className="bg-[#F0E6E6] text-xs text-[#040529] uppercase tracking-wider">
                                    <tr>
                                      <th className="px-4 py-2 text-left font-bold">Color</th>
                                      <th className="px-4 py-2 text-left font-bold">Talla</th>
                                      <th className="px-4 py-2 text-left font-bold">Stock</th>
                                      <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {variants.map((v, i) => (
                                      <tr key={i} className="group hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{v.nombre_color}</td>
                                        <td className="px-4 py-2 text-gray-600">{v.nombre_talla}</td>
                                        <td className="px-4 py-2 text-gray-600">{v.stock}</td>
                                        <td className="px-4 py-2 text-right">
                                          <button onClick={() => removeVariant(v)} className="text-red-400 hover:text-red-600 p-1">
                                            <Trash2 size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic text-center mt-4">No se han agregado variantes a este producto</p>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Footer Base Form */}
                    <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50 flex justify-end gap-3">
                      <button
                        onClick={() => setIsProductModalOpen(false)}
                        className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveProduct}
                        className="px-5 py-2 text-sm font-bold text-white bg-[#040529] rounded-lg hover:bg-[#040529]/90 transition shadow-md hover:shadow-lg"
                      >
                        Guardar Producto
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modal de Vista === */}
        <AnimatePresence>
          {isViewModalOpen && selectedProductForView && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl relative overflow-hidden max-w-4xl w-full"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col lg:flex-row h-[500px] lg:h-[600px]">

                  {/* Left Side (Image Preview & Summary) */}
                  <div className="hidden lg:flex w-1/3 bg-gray-50 flex-col border-r border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pattern-grid-lg" />

                    {/* Image Area */}
                    <div className="h-[40%] lg:h-1/2 w-full p-6 flex flex-col items-center justify-center relative z-10 border-b border-gray-200/50 bg-white">
                      {selectedProductForView.imagenes && selectedProductForView.imagenes.length > 0 ? (
                        <div className="w-full h-full flex overflow-x-auto gap-4 snap-x pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                          {selectedProductForView.imagenes.map((img) => {
                            const fullUrl = img.url_imagen?.startsWith('http') ? img.url_imagen : `${API_URL}${img.url_imagen}`;
                            return (
                              <div key={img.id_imagen} className="shrink-0 w-full sm:w-64 h-full rounded-xl overflow-hidden shadow-sm border border-gray-100 snap-center relative group">
                                <img src={fullUrl} alt="Preview" className="w-full h-full object-contain bg-white" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                                <div className="absolute inset-0 bg-gray-50 hidden flex-col items-center justify-center text-xs text-gray-400">
                                  <ImageIcon size={24} className="mb-2 opacity-50" />
                                  Error al cargar
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50/50 text-gray-400 gap-2">
                          <ImageIcon size={32} />
                          <span className="text-xs font-medium">Sin imagen</span>
                        </div>
                      )}
                    </div>

                    {/* Summary Info */}
                    <div className="flex-1 p-6 z-10 overflow-y-auto">
                      <h4 className="text-[#040529] font-bold text-lg leading-tight mb-4">{selectedProductForView.nombre_producto}</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <Tag size={16} className="mt-0.5 text-blue-500 shrink-0" />
                          <span>{getCategoriaNombre(selectedProductForView.id_categoria) || "Categoría sin definir"}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <MapPin size={16} className="mt-0.5 text-green-500 shrink-0" />
                          <span>Precio Venta: ${Number(selectedProductForView.precio || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <CheckCircle size={16} className="mt-0.5 text-purple-500 shrink-0" />
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${selectedProductForView.estado ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            {selectedProductForView.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side (Form ReadOnly) */}
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                      <h3 className="text-xl font-bold text-[#040529]">
                        Detalles del Producto
                      </h3>
                      <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-[#040529]"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-sm">
                          <div>
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">ID Producto</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{selectedProductForView.id_producto}</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">Nombre</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{selectedProductForView.nombre_producto}</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">Categoría</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{getCategoriaNombre(selectedProductForView.id_categoria)}</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">Precio Compra</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">${Number(selectedProductForView.precio_compra || 0).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">Precio Venta</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">${Number(selectedProductForView.precio || 0).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">% Ganancia</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{selectedProductForView.porcentaje_ganancia}%</div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="font-bold text-gray-500 uppercase text-xs mb-1">Descripción</div>
                            <div className="text-[#040529] font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 whitespace-pre-wrap">{selectedProductForView.descripcion || "—"}</div>
                          </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden mt-6">
                          <div className="bg-[#F0E6E6] px-4 py-3 border-b border-gray-200">
                            <h4 className="text-sm font-bold text-[#040529] uppercase tracking-wider">Variantes Disponibles</h4>
                          </div>
                          <div className="p-4 bg-gray-50">
                            {variantesGlobales
                              .filter(v => v.id_producto === selectedProductForView.id_producto)
                              .length === 0 ? (
                              <p className="text-sm text-gray-500 italic text-center py-4 bg-white rounded-lg border border-gray-100 shadow-sm">No hay variantes registradas para este producto.</p>
                            ) : (
                              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-[#F0E6E6]/50 text-xs text-[#040529] uppercase tracking-wider">
                                    <tr>
                                      <th className="px-4 py-3 font-bold">Color</th>
                                      <th className="px-4 py-3 font-bold">Talla</th>
                                      <th className="px-4 py-3 font-bold">Stock</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {variantesGlobales
                                      .filter(v => v.id_producto === selectedProductForView.id_producto)
                                      .map((v, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
                                                style={{ backgroundColor: colores.find(c => c.id_color === v.id_color)?.codigo_hex || "#ccc" }}
                                              />
                                              <span className="font-medium text-gray-800">{getColorNombre(v.id_color)}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">{getTallaNombre(v.id_talla)}</td>
                                          <td className="px-4 py-3 font-bold text-[#040529]">{v.stock}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50 flex justify-end">
                      <button
                        onClick={() => setIsViewModalOpen(false)}
                        className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                      >
                        Cerrar Vista
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modal de Confirmación de Eliminación === */}
        <AnimatePresence>
          {isDeleteConfirmOpen && productoToDelete && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl max-w-md w-full relative overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#040529] mb-2">Eliminar Producto</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    ¿Estás seguro de que deseas eliminar el producto <span className="font-bold text-[#040529]">"{productoToDelete.nombre_producto}"</span>?<br />
                    <span className="text-xs text-red-400 block mt-2">Esta acción no se puede deshacer.</span>
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="px-5 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-5 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow-md hover:shadow-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === Modales para Color/Talla rápida === */}
        <AnimatePresence>
          {isCreateColorOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xs"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              >
                <h3 className="font-bold text-lg text-[#040529] mb-4">Crear color rápido</h3>
                <input
                  type="text"
                  placeholder="Nombre color"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full px-3 py-2 mb-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529] outline-none focus:ring-2 focus:ring-[#040529]/20"
                />
                <div className="flex items-center gap-3 mb-5">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 p-0 border border-gray-200 rounded-lg cursor-pointer"
                  />
                  <input readOnly value={newColorHex} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529]" />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreateColorOpen(false);
                      setNewColorName("");
                      setNewColorHex("#ff0000");
                    }}
                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleCreateColor} className="px-4 py-2 text-sm font-bold text-white bg-[#040529] rounded-lg hover:bg-[#040529]/90 transition shadow-md">
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
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xs"
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              >
                <h3 className="font-bold text-lg text-[#040529] mb-4">Crear talla rápida</h3>
                <input
                  type="text"
                  placeholder="Nombre talla"
                  value={newTallaName}
                  onChange={(e) => setNewTallaName(e.target.value)}
                  className="w-full px-3 py-2 mb-5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#040529] outline-none focus:ring-2 focus:ring-[#040529]/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsCreateTallaOpen(false);
                      setNewTallaName("");
                    }}
                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleCreateTalla} className="px-4 py-2 text-sm font-bold text-white bg-[#040529] rounded-lg hover:bg-[#040529]/90 transition shadow-md">
                    Crear
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );

  return content;
}