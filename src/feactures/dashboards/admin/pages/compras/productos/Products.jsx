// src/features/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, Eye, Pen, ImageIcon, Tag, MapPin, User, Calendar, Hash, ChevronLeft, ChevronRight, CheckCircle, Clock, Download, ChevronDown, TrendingUp, PlusCircle, AlertTriangle, FileText, Upload } from "lucide-react";
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
  console.log("🚀 [Antigravity] Products.jsx v2 - Grouped Variants Fixed");
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
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const productosPorPagina = 10;
  
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      cargarDatos();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [paginaActual, busqueda, filtroCategoria]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resProds, cats, cols, tls, vars] = await Promise.all([
        getProductos({ 
          page: paginaActual, 
          limit: productosPorPagina, 
          search: busqueda,
          id_categoria: filtroCategoria 
        }),
        getCategorias(),
        getColores(),
        getTallas(),
        getVariantes(),
      ]);
      
      if (resProds && resProds.data) {
        setProductos(resProds.data);
        setTotalPaginas(resProds.totalPages || 1);
        setTotalItems(resProds.total || 0);
      } else {
        setProductos(Array.isArray(resProds) ? resProds : []);
        setTotalPaginas(1);
        setTotalItems(Array.isArray(resProds) ? resProds.length : 0);
      }
      
      setCategorias(cats || []);
      setColores(cols || []);
      setTallas(tls || []);
      setVariantesGlobales(vars || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showNotification("Error cargando datos", "error");
    } finally {
      setLoading(false);
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
      // Agrupar variantes por color para el UI
      const grouped = vars.reduce((acc, v) => {
        const colorName = getColorNombre(v.id_color);
        if (!acc[colorName]) acc[colorName] = { color: colorName, tallas: [] };
        acc[colorName].tallas.push({ talla: getTallaNombre(v.id_talla), cantidad: v.stock });
        return acc;
      }, {});
      setVariants(Object.values(grouped));
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

    const hasImages = imagenesArchivos.length > 0 || imagenesUrls.length > 0 || imagenesConservadas.length > 0;

    if (!isFormValid || !isVariantsValid) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }

    if (!hasImages) {
      showNotification("Debes incluir al menos una imagen para el producto.", "error");
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
      // Flatten grouped variants for backend
      const flatVariants = [];
      for (const v of variants) {
        if (!v.tallas) continue;
        for (const t of v.tallas) {
          const colorObj = colores.find(c => c.nombre_color === v.color);
          const tallaObj = tallas.find(tt => tt.nombre_talla === t.talla);
          flatVariants.push({
            id_color: colorObj?.id_color,
            id_talla: tallaObj?.id_talla,
            stock: Number(t.cantidad)
          });
        }
      }
      formData.append("variantes", JSON.stringify(flatVariants));

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

      const newGrouping = {
        color: currentVariant.color,
        tallas: validTallas.map(t => ({ talla: t.talla, cantidad: Number(t.cantidad) }))
      };

      setVariants(prev => {
        const idx = prev.findIndex(v => v.color === newGrouping.color);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newGrouping;
          return updated;
        }
        return [...prev, newGrouping];
      });

      setCurrentVariant({ color: "#2563eb", tallas: [{ talla: "", cantidad: "" }] });
      showNotification("Variante agregada con éxito");
    } catch (err) {
      console.error("saveVariant error:", err);
      showNotification("Error guardando variante", "error");
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

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 px-6 pt-6">
          <h2 className="text-[28px] font-black text-[#040529] tracking-tight whitespace-nowrap" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Gestión de Productos
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#bfd1f4] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#dbeafe] focus:border-[#7da7e8] transition-all text-[#16315f] placeholder:text-[#86a0c6]"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={filtroCategoria}
                onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaActual(1); }}
                className="appearance-none bg-white border border-[#bfd1f4] text-[#16315f] py-2.5 pl-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#dbeafe] focus:border-[#7da7e8] cursor-pointer w-48"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>

            {/* Download Button */}
            <button
               className="flex items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#040529] hover:bg-slate-50 transition shadow-sm" title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {canManage("productos") && (
              <button
                onClick={() => openProductModal(null)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#040529] hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Plus size={18} />
                Registrar Producto
              </button>
            )}
          </div>
        </div>
        {/* Table Area */}
        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="bg-white rounded-[1.6rem] border border-[#bfd1f4] shadow-[0_16px_40px_-28px_rgba(34,58,99,0.8)] flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <table className="w-full min-w-[1080px] text-left relative border-separate border-spacing-0">
                <thead className="bg-[#dbeafe] text-[#16315f] sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-[10%]">Imagen</th>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-[25%]">Nombre</th>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-[15%]">Categoría</th>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-[20%]">Precios</th>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-[10%]">Stock</th>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] w-[10%] text-center">Estado</th>
                    <th className="px-3 py-3 font-black text-[10px] uppercase tracking-[0.14em] border-b border-[#9ec1ef] text-right w-[10%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                          <p className="text-sm text-slate-500 font-medium">Cargando productos...</p>
                        </div>
                      </td>
                    </tr>
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Tag className="h-12 w-12" />
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-slate-600">No se encontraron productos</p>
                            <p className="text-sm">Prueba ajustando los filtros o la búsqueda</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    productos.map((p) => {
                      const pVars = variantesGlobales.filter(v => v.id_producto === p.id_producto);
                      const totalStock = pVars.reduce((acc, v) => acc + (v.stock || 0), 0);

                      return (
                        <tr key={p.id_producto} className="group hover:bg-[#f8fbff] transition-colors">
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8]">
                            <div className="h-14 w-14 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                              {p.imagenes && p.imagenes.length > 0 ? (
                                <img 
                                  src={p.imagenes[0].url_imagen?.startsWith('http') ? p.imagenes[0].url_imagen : `${API_URL}${p.imagenes[0].url_imagen}`} 
                                  alt={p.nombre_producto} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-slate-300" />
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8]">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm leading-snug">{p.nombre_producto}</span>
                              <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-tight">ID: {p.id_producto}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8]">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {getCategoriaNombre(p.id_categoria)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8]">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">$</span>
                                <span className={`text-sm font-bold ${Number(p.descuento_producto || 0) > 0 ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {Number(p.precio || 0).toLocaleString()}
                                </span>
                              </div>
                              {Number(p.descuento_producto || 0) > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">-{p.descuento_producto}%</span>
                                  <span className="text-sm font-black text-emerald-600">
                                    ${(Number(p.precio || 0) * (1 - Number(p.descuento_producto || 0) / 100)).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8]">
                            <div className="flex flex-col">
                              <span className={`text-sm font-black ${totalStock <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                                {totalStock} <span className="text-[10px] font-bold text-slate-400 ml-1">und.</span>
                              </span>
                              {totalStock <= 5 && <span className="text-[10px] font-bold text-rose-400 mt-0.5">Stock bajo</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8] text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${p.estado ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${p.estado ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              {p.estado ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 border-b border-[#d7e5f8] text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openViewModal(p)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100" title="Ver"><Eye className="h-4 w-4" /></button>
                              {canManage("productos") && (
                                <>
                                  <button onClick={() => openProductModal(p)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100" title="Editar"><Pen className="h-4 w-4" /></button>
                                  <button onClick={() => openDeleteConfirm(p)} className="p-2 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
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
            {totalPaginas > 0 && (
              <div className="border-t border-[#d7e5f8] px-5 py-4 bg-[#fbfdff] flex items-center justify-between mt-auto">
                <p className="text-sm font-bold text-[#6b84aa]">
                  Página <span className="text-[#16315f]">{paginaActual}</span> de <span className="text-[#16315f]">{totalPaginas}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#bfd1f4] bg-white text-[#6a85ad] hover:bg-[#f8fbff] hover:text-[#16315f] disabled:opacity-50 transition shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#bfd1f4] bg-white text-[#6a85ad] hover:bg-[#f8fbff] hover:text-[#16315f] disabled:opacity-50 transition shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProductModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-[600px] overflow-hidden">
                {/* Left Side (Visual Preview) */}
                <div className="hidden lg:flex w-1/3 bg-slate-50 flex-col relative overflow-hidden border-r border-slate-100">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                       <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    </div>
                    
                    <div className="h-48 w-full p-8 flex flex-col items-center justify-center relative z-10">
                      {(() => {
                        const getFullUrl = (url) => url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : null;
                        const dbImg = imagenesGuardadas.find(img => !imagenesConservadas || imagenesConservadas.includes(img.id_imagen))?.url_imagen;
                        const fileImg = imagenesArchivos[0] ? URL.createObjectURL(imagenesArchivos[0]) : null;
                        const urlImg = imagenesUrls[0] || null;
                        const currentDisplay = dbImg || fileImg || urlImg;

                        if (currentDisplay) {
                          return <img src={currentDisplay.startsWith('blob:') ? currentDisplay : getFullUrl(currentDisplay)} alt="Preview" className="h-full w-full object-contain drop-shadow-2xl" />;
                        }
                        return (
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <ImageIcon size={48} />
                            <p className="font-black text-[10px] uppercase tracking-[0.2em]">Sin imagen</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex-1 p-8 z-10 overflow-y-auto">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vista Previa</p>
                          <h4 className="text-slate-900 font-bold text-xl leading-tight font-['Outfit']">{productForm.nombre_producto || "Nuevo Producto"}</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                              <Tag size={16} />
                            </div>
                            <span>{getCategoriaNombre(productForm.id_categoria) || "Sin categoría"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                              <MapPin size={16} />
                            </div>
                            <span>Venta: ${Number(productForm.precio || 0).toLocaleString()}</span>
                          </div>
                          {Number(productForm.descuento_producto) > 0 && (
                            <div className="flex items-center gap-3 text-sm text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                              <div className="p-1 px-2 bg-rose-500 rounded-lg text-white text-[10px] font-black uppercase">
                                -{productForm.descuento_producto}%
                              </div>
                              <span>Final: ${(Number(productForm.precio || 0) * (1 - Number(productForm.descuento_producto || 0) / 100)).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side (Form) */}
                  <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 font-['Outfit'] tracking-tight">
                          {productForm.id_producto ? "Editar Producto" : "Nuevo Producto"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Complete la información detallada del artículo</p>
                      </div>
                      <button 
                        onClick={() => setIsProductModalOpen(false)} 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

                        {/* Group 1: Basics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nombre del Producto *</label>
                            <input
                              autoFocus
                              name="nombre_producto"
                              value={productForm.nombre_producto}
                              onChange={handleProductChange}
                              onBlur={handleProductBlur}
                              placeholder="Ej: Camiseta de Verano"
                              className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 outline-none transition-all text-sm font-medium text-slate-700 ${formErrors.nombre_producto ? "border-rose-400 bg-rose-50" : "border-slate-300 focus:border-[#040529]"}`}
                            />
                            {formErrors.nombre_producto && <p className="text-rose-500 text-[10px] mt-2 font-black uppercase tracking-wider ml-1">{formErrors.nombre_producto}</p>}
                          </div>

                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Categoría *</label>
                            <div className="relative">
                              <select
                                name="id_categoria"
                                value={productForm.id_categoria ?? ""}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 outline-none transition-all text-sm font-medium text-slate-700 appearance-none cursor-pointer ${formErrors.id_categoria ? "border-rose-400 bg-rose-50" : "border-slate-300 focus:border-[#040529]"}`}
                              >
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            {formErrors.id_categoria && <p className="text-rose-500 text-[10px] mt-2 font-black uppercase tracking-wider ml-1">{formErrors.id_categoria}</p>}
                          </div>

                          <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Estado *</label>
                            <div className="relative">
                              <select
                                name="estado"
                                value={productForm.estado}
                                onChange={handleProductChange}
                                onBlur={handleProductBlur}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-medium text-slate-700 appearance-none cursor-pointer"
                              >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                          </div>
                        </div>

                        {/* Group 2: Prices */}
                        <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <TrendingUp size={14} className="text-emerald-500" /> 
                             Gestión de Precios
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Compra *</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                                <input
                                  name="precio_compra"
                                  type="number"
                                  step="0.01"
                                  value={productForm.precio_compra}
                                  onChange={handleProductChange}
                                  onBlur={handleProductBlur}
                                  className={`w-full pl-7 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-bold text-slate-700 ${formErrors.precio_compra ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
                                />
                              </div>
                              {formErrors.precio_compra && <p className="text-rose-500 text-[10px] mt-1.5 font-black uppercase tracking-wider ml-1">{formErrors.precio_compra}</p>}
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Venta *</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                                <input
                                  name="precio"
                                  type="number"
                                  step="0.01"
                                  value={productForm.precio}
                                  onChange={handleProductChange}
                                  onBlur={handleProductBlur}
                                  className={`w-full pl-7 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-bold text-slate-700 ${formErrors.precio ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
                                />
                              </div>
                              {formErrors.precio && <p className="text-rose-500 text-[10px] mt-1.5 font-black uppercase tracking-wider ml-1">{formErrors.precio}</p>}
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">% Ganancia</label>
                              <div className="relative">
                                <input
                                  name="porcentaje_ganancia"
                                  type="number"
                                  step="0.01"
                                  value={productForm.porcentaje_ganancia}
                                  onChange={handleProductChange}
                                  onBlur={handleProductBlur}
                                  className={`w-full pr-8 pl-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-bold text-slate-700 ${formErrors.porcentaje_ganancia ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                              </div>
                              {formErrors.porcentaje_ganancia && <p className="text-rose-500 text-[10px] mt-1.5 font-black uppercase tracking-wider ml-1">{formErrors.porcentaje_ganancia}</p>}
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Desc. %</label>
                              <div className="relative">
                                <input
                                  name="descuento_producto"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="any"
                                  value={productForm.descuento_producto}
                                  onChange={handleProductChange}
                                  onBlur={handleProductBlur}
                                  className={`w-full pr-8 pl-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-bold text-slate-700 ${formErrors.descuento_producto ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 text-sm font-bold">%</span>
                              </div>
                              {formErrors.descuento_producto && <p className="text-rose-500 text-[10px] mt-1.5 font-black uppercase tracking-wider ml-1">{formErrors.descuento_producto}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Group 3: Description & Image */}
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Descripción *</label>
                            <textarea
                              name="descripcion"
                              value={productForm.descripcion}
                              onChange={handleProductChange}
                              onBlur={handleProductBlur}
                              placeholder="Detalles sobre materiales, uso, o características especiales..."
                              rows={3}
                              className={`w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-medium text-slate-700 ${formErrors.descripcion ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
                            />
                            {formErrors.descripcion && <p className="text-rose-500 text-[10px] mt-2 font-black uppercase tracking-wider ml-1">{formErrors.descripcion}</p>}
                          </div>

                          <div className="md:col-span-2 space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Galería de Imágenes *</label>
                            
                            <div className="flex flex-col gap-4">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-[1.5rem] bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="h-6 w-6 text-slate-400 group-hover:text-slate-600 mb-2 transition-colors" />
                                  <p className="text-xs text-slate-500 font-bold group-hover:text-slate-700 transition-colors">Click para subir o arrastra y suelta</p>
                                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">PNG, JPG o WEBP</p>
                                </div>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                              </label>

                              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                                <input
                                  type="text"
                                  value={urlInput}
                                  onChange={(e) => setUrlInput(e.target.value)}
                                  placeholder="O pega una URL de imagen..."
                                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all"
                                />
                                <button type="button" onClick={addUrlManual} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-sm active:scale-95">Añadir</button>
                              </div>

                              {(imagenesGuardadas.length > 0 || imagenesArchivos.length > 0 || imagenesUrls.length > 0) && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                                  {/* Existing Images */}
                                  {imagenesGuardadas.map((img) => (
                                    <div key={`db-${img.id_imagen}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                                      <img src={img.url_imagen?.startsWith('http') ? img.url_imagen : `${API_URL}${img.url_imagen}`} alt="Existente" className={`w-full h-full object-cover transition-opacity ${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-30' : 'opacity-100'}`} />
                                      <button
                                        type="button"
                                        onClick={() => toggleConservarImagen(img.id_imagen)}
                                        className={`absolute top-1 right-1 p-1 rounded-full shadow-md transition-all ${!imagenesConservadas?.includes(img.id_imagen) ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white opacity-0 group-hover:opacity-100'}`}
                                      >
                                        {!imagenesConservadas?.includes(img.id_imagen) ? <CheckCircle size={10} strokeWidth={4} /> : <Trash2 size={10} strokeWidth={4} />}
                                      </button>
                                    </div>
                                  ))}
                                  {imagenesArchivos.map((file, idx) => (
                                    <div key={`file-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                                      <img src={URL.createObjectURL(file)} alt="Nueva" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => removeArchivo(idx)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-all">
                                        <X size={10} strokeWidth={4} />
                                      </button>
                                    </div>
                                  ))}
                                  {imagenesUrls.map((url, idx) => (
                                    <div key={`url-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                                      <img src={url} alt="URL" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => removeUrlManual(idx)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-all">
                                        <X size={10} strokeWidth={4} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {formErrors.imagenes && <p className="text-rose-500 text-[10px] mt-2 font-black uppercase tracking-wider ml-1">{formErrors.imagenes}</p>}
                          </div>
                        </div>


                        {/* === Gestión de Variantes === */}
                        <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                            <div>
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                 <PlusCircle size={14} className="text-indigo-500" /> 
                                 Atributos y Stock
                               </h4>
                               <p className="text-[11px] text-slate-400 font-medium">Defina las combinaciones de color y tallas disponibles</p>
                            </div>
                            {canManage("productos") && (
                                <button 
                                  type="button" 
                                  onClick={saveVariant}
                                  className="px-5 py-2.5 bg-slate-900 text-white rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center gap-2"
                                >
                                <Plus size={14} strokeWidth={3} /> Guardar Combinación
                              </button>
                            )}
                          </div>

                          <div className="bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-6 lg:p-8 space-y-8 relative overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                              {/* Color Selection */}
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Color de la Prenda</label>
                                <div className="flex gap-2">
                                   <div className="relative flex-1">
                                      <select
                                        value={currentVariant.color}
                                        onChange={(e) => handleVariantChange('color', e.target.value)}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                                      >
                                        <option value="">Seleccionar color...</option>
                                        {colores.map(c => <option key={c.id_color} value={c.nombre_color}>{c.nombre_color}</option>)}
                                      </select>
                                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                   </div>
                                   <button type="button" onClick={() => setIsCreateColorOpen(true)} className="p-3.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors shadow-sm"><Plus size={20} /></button>
                                </div>
                              </div>

                              {/* Tallas and Cantidad */}
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Distribución de Tallas</label>
                                <div className="space-y-3">
                                  {currentVariant.tallas.map((t, idx) => (
                                      <div key={idx} className="flex gap-2 group animate-in slide-in-from-right-4 duration-300">
                                        <div className="relative flex-1">
                                          <select
                                            value={t.talla}
                                            onChange={(e) => handleTallaChange(idx, 'talla', e.target.value)}
                                            className="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                                          >
                                            <option value="">Talla...</option>
                                            {tallas.map(tl => <option key={tl.id_talla} value={tl.nombre_talla}>{tl.nombre_talla}</option>)}
                                          </select>
                                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        </div>
                                        <div className="relative w-32">
                                          <input
                                            type="number"
                                            placeholder="Cant."
                                            value={t.cantidad}
                                            onChange={(e) => handleTallaChange(idx, 'cantidad', e.target.value)}
                                            className="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#040529]/10 focus:border-[#040529] outline-none transition-all text-sm font-black text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                                          />
                                        </div>
                                        {idx === currentVariant.tallas.length - 1 ? (
                                          <button type="button" onClick={addTalla} className="p-3.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:bg-[#040529] hover:text-white transition-colors shadow-sm" title="Añadir talla"><Plus size={20} /></button>
                                        ) : (
                                          <button type="button" onClick={() => removeTalla(idx)} className="p-3.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors shadow-sm" title="Quitar talla"><Trash2 size={20} /></button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {variantError && <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 animate-shake"><AlertTriangle size={14} /><p className="text-[10px] font-black uppercase tracking-wider">{variantError}</p></div>}
                            {variants.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {variants.map((v, idx) => (
                                    <div key={idx} className="p-4 bg-white border-2 border-slate-200 rounded-[1.5rem] shadow-sm flex items-center justify-between group hover:border-slate-400 transition-all">
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{v.color}</span>
                                        <div className="flex flex-wrap gap-1">
                                          {v.tallas?.map((t, tid) => (
                                            <span key={tid} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-500">
                                              {t.talla}: {t.cantidad}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      <button onClick={() => removeVariant(v)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center bg-slate-100/50 rounded-[1.5rem] border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sin variantes registradas</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                      <button
                        onClick={() => setIsProductModalOpen(false)}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveProduct}
                        className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                      >
                        Guardar Cambios
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
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setIsViewModalOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden max-w-5xl w-full border border-slate-200"
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col lg:flex-row h-[600px] lg:h-[750px]">
                  
                  {/* Left Side: Media Showcase */}
                  <div className="lg:w-[45%] bg-slate-50 relative flex flex-col">
                    <div className="flex-1 p-8 flex items-center justify-center bg-white m-4 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group">
                      {selectedProductForView.imagenes && selectedProductForView.imagenes.length > 0 ? (
                        <img 
                          src={selectedProductForView.imagenes[0].url_imagen?.startsWith('http') ? selectedProductForView.imagenes[0].url_imagen : `${API_URL}${selectedProductForView.imagenes[0].url_imagen}`} 
                          alt={selectedProductForView.nombre_producto}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <ImageIcon size={64} />
                          <p className="font-black text-xs uppercase tracking-widest">Sin imagen</p>
                        </div>
                      )}
                    </div>

                  </div>
                  {/* Right Side: Details */}
                  <div className="flex-1 flex flex-col h-full bg-white relative">
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                      <div className="space-y-10">
                        {/* Header Section */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                               {getCategoriaNombre(selectedProductForView.id_categoria)}
                             </span>
                             {selectedProductForView.estado ? (
                               <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100">Activo</span>
                             ) : (
                               <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-200">Inactivo</span>
                             )}
                           </div>
                           <h2 className="text-4xl font-bold text-slate-800 font-['Outfit'] tracking-tighter leading-none">
                             {selectedProductForView.nombre_producto}
                           </h2>
                           <p className="text-slate-400 font-medium text-sm">ID del producto: #{selectedProductForView.id_producto}</p>
                        </div>

                        {/* Price Area */}
                        <div className="flex items-end gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio Online</p>
                            <div className="flex items-center gap-3">
                              <span className={`text-4xl font-bold text-slate-800 font-['Outfit'] ${Number(selectedProductForView.descuento_producto) > 0 ? 'text-slate-300 line-through text-2xl' : ''}`}>
                                ${Number(selectedProductForView.precio).toLocaleString()}
                              </span>
                              {Number(selectedProductForView.descuento_producto) > 0 && (
                                <div className="flex items-center gap-3">
                                   <span className="text-4xl font-black text-rose-500 font-['Outfit']">
                                     ${(Number(selectedProductForView.precio) * (1 - Number(selectedProductForView.descuento_producto) / 100)).toLocaleString()}
                                   </span>
                                   <div className="p-1 px-2 bg-rose-500 rounded-lg text-white text-[10px] font-black uppercase">
                                     -{selectedProductForView.descuento_producto}%
                                   </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Inventory Section */}
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={14} className="text-indigo-500" /> Stock por Atributos
                              </h4>
                              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                Total: {(variantesGlobales || []).filter(v => v.id_producto === selectedProductForView.id_producto).reduce((acc, v) => acc + (v.stock || 0), 0)} und.
                              </span>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                             {(() => {
                               const prodVars = (variantesGlobales || []).filter(v => v.id_producto === selectedProductForView.id_producto);
                               const grouped = prodVars.reduce((acc, v) => {
                                 const cName = getColorNombre(v.id_color);
                                 if (!acc[cName]) acc[cName] = { color: cName, tallas: [] };
                                 acc[cName].tallas.push({ talla: getTallaNombre(v.id_talla), stock: v.stock });
                                 return acc;
                               }, {});
                               return Object.values(grouped).map((v, vIdx) => (
                                 <div key={vIdx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 group hover:border-slate-300 transition-all">
                                   <div className="flex flex-col gap-1.5">
                                     <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{v.color}</span>
                                     <div className="flex flex-wrap gap-1">
                                       {(v.tallas || []).map((t, tIdx) => (
                                         <div key={tIdx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                                           <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{t.talla}</span>
                                           <span className={`text-[10px] font-bold ${t.stock <= 5 ? 'text-rose-500' : 'text-slate-400'}`}>{t.stock}</span>
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 </div>
                               ));
                             })()}
                           </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-3">
                           <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <FileText size={14} className="text-amber-500" /> Descripción Técnica
                           </h4>
                           <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                             "{selectedProductForView.descripcion || "Este producto no cuenta con una descripción detallada en este momento."}"
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 shrink-0 flex gap-4">
                       <button 
                         onClick={() => { setIsViewModalOpen(false); openProductModal(selectedProductForView); }}
                         className="flex-1 py-4 bg-slate-900 text-white rounded-3xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
                       >
                         <Pen size={18} /> Editar Producto
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
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full relative overflow-hidden border border-slate-100"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 text-center space-y-6">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                    <Trash2 size={32} className="text-rose-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-['Outfit']">¿Eliminar Producto?</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed px-2">
                      Estás por eliminar <span className="text-slate-900 font-bold">"{productoToDelete.nombre_producto}"</span>. Esta acción borrará permanentemente todos sus registros y stock.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={confirmDelete}
                      className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95"
                    >
                      Sí, Eliminar Permanentemente
                    </button>
                    <button
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      No, Mantenerlo
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
              className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-[200] p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-slate-100"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                     <Plus className="text-white" size={24} />
                   </div>
                   <div>
                     <h3 className="font-bold text-xl text-slate-800 tracking-tight font-['Outfit']">Nuevo Color</h3>
                     <p className="text-xs text-slate-400 font-medium">Agréguelo instantáneamente</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                     <input
                       type="text"
                       placeholder="Ej: Azul Medianoche"
                       value={newColorName}
                       onChange={(e) => setNewColorName(e.target.value)}
                       className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:ring-8 focus:ring-slate-100 outline-none transition-all text-sm font-bold text-slate-700"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selector de Tono</label>
                     <div className="flex items-center gap-3">
                       <input
                         type="color"
                         value={newColorHex}
                         onChange={(e) => setNewColorHex(e.target.value)}
                         className="w-14 h-14 p-0 border-2 border-slate-300 rounded-2xl cursor-pointer overflow-hidden shadow-sm hover:scale-105 transition-transform"
                       />
                       <div className="flex-1 px-5 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest">
                         {newColorHex}
                       </div>
                     </div>
                   </div>
                </div>

                <div className="flex justify-end gap-3 mt-10">
                  <button
                    onClick={() => {
                      setIsCreateColorOpen(false);
                      setNewColorName("");
                      setNewColorHex("#ff0000");
                    }}
                    className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button onClick={handleCreateColor} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                    Registrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateTallaOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-[200] p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-slate-100"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                     <Plus className="text-white" size={24} />
                   </div>
                   <div>
                     <h3 className="font-bold text-xl text-slate-800 tracking-tight font-['Outfit']">Nueva Talla</h3>
                     <p className="text-xs text-slate-400 font-medium">Expanda sus existencias</p>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre / Identificación</label>
                   <input
                     type="text"
                     placeholder="Ej: XXL o 42"
                     value={newTallaName}
                     onChange={(e) => setNewTallaName(e.target.value)}
                     className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:ring-8 focus:ring-slate-100 outline-none transition-all text-sm font-bold text-slate-700"
                   />
                </div>

                <div className="flex justify-end gap-3 mt-10">
                  <button
                    onClick={() => {
                      setIsCreateTallaOpen(false);
                      setNewTallaName("");
                    }}
                    className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button onClick={handleCreateTalla} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                    Registrar
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