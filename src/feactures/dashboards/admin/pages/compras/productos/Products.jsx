// src/features/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Search, Eye, Pen, ImageIcon, Tag, MapPin, User, Calendar, Hash, ChevronLeft, ChevronRight, CheckCircle, Clock, Download, ChevronDown, TrendingUp, PlusCircle, AlertTriangle, FileText, Upload, Package, Layers, Box } from "lucide-react";
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

import { cn, configUi } from "../../configuracion/configUi";
import FilterDropdown from "../../configuracion/FilterDropdown";



const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function Productos({ renderLayout = true }) {
  console.log("🚀 [Antigravity] Products.jsx v2 - Grouped Variants Fixed");
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
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
  const [currentStep, setCurrentStep] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);
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
    const hasColor = currentVariant.color && currentVariant.color.trim() !== "" && currentVariant.color !== "—";
    const hasAnyTallaData = currentVariant.tallas.some(t => 
      (t.talla && t.talla.trim() !== "" && t.talla !== "—") || 
      (String(t.cantidad).trim() !== "")
    );
    
    const isInteracting = hasColor || hasAnyTallaData;

    if (!isInteracting) {
      setVariantError("");
      return true;
    }

    // Si tiene color pero no tallas, o tiene tallas pero no color, es válido.
    // Solo es inválido si una talla tiene cantidad pero no nombre, o viceversa, 
    // A MENOS que sea la única talla y el producto sea "solo color".
    
    const validTallas = currentVariant.tallas.filter(t => {
      const hasTallaName = t.talla && t.talla.trim() !== "" && t.talla !== "—";
      const hasQty = String(t.cantidad).trim() !== "";
      // Es válido si: (tiene nombre y cantidad) O (tiene cantidad y NO hay opciones de talla, o sea es "solo color")
      return (hasTallaName && hasQty) || (!hasTallaName && hasQty && hasColor);
    });

    if (validTallas.length === 0 && !hasColor) {
      setVariantError("Debe agregar al menos una variante válida (Color o Talla con cantidad).");
      return false;
    }

    setVariantError("");
    return true;
  };
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    color: "",
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
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resProds, cats, cols, tls, vars] = await Promise.all([
        getProductos(), // Fetch all
        getCategorias(),
        getColores(),
        getTallas(),
        getVariantes(),
      ]);
      
      setProductos(Array.isArray(resProds) ? resProds : (resProds.data || []));
      
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
    setCurrentStep(1);
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
        const colorObj = colores.find(c => c.nombre_color === v.color);
        const id_color = colorObj?.id_color || null;

        if (!v.tallas || v.tallas.length === 0) {
          // Caso: Solo color (sin tallas en el agrupamiento)
          if (id_color) {
            flatVariants.push({
              id_color: id_color,
              id_talla: null,
              stock: 0
            });
          }
          continue;
        }

        for (const t of v.tallas) {
          const tallaObj = tallas.find(tt => tt.nombre_talla === t.talla);
          const id_talla = tallaObj?.id_talla || null;

          if (id_color || id_talla) {
            flatVariants.push({
              id_color: id_color,
              id_talla: id_talla,
              stock: Number(t.cantidad) || 0
            });
          }
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
      const msg = err.response?.data?.mensaje || err.response?.data?.error || err.message || "Error al eliminar";
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
        (t) => (t.talla?.toString().trim() && t.talla !== "—") || String(t.cantidad).trim() !== ""
      );

      const newGrouping = {
        color: (currentVariant.color && currentVariant.color !== "—") ? currentVariant.color : "—",
        tallas: validTallas.map(t => ({ 
          talla: (t.talla && t.talla !== "—") ? t.talla : "—", 
          cantidad: Number(t.cantidad) || 0 
        }))
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

      setCurrentVariant({ color: "", tallas: [{ talla: "", cantidad: "" }] });
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
  const filtered = React.useMemo(() => {
    return (productos || []).filter(p => {
      const q = busqueda.toLowerCase();
      const matchesSearch = (p.nombre_producto || "").toLowerCase().includes(q) || 
                           (p.descripcion || "").toLowerCase().includes(q);
      const matchesCategory = filtroCategoria === "" || Number(p.id_categoria) === Number(filtroCategoria);
      const matchesStatus = statusFilter === "Todos" || 
                           (statusFilter === "Activo" && p.estado) ||
                           (statusFilter === "Inactivo" && !p.estado);
                           
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [productos, busqueda, filtroCategoria, statusFilter]);

  const totalFiltered = filtered.length;
  const totalPaginasLocal = Math.max(1, Math.ceil(totalFiltered / productosPorPagina));
  const currentItems = filtered.slice((paginaActual - 1) * productosPorPagina, paginaActual * productosPorPagina);

  const handleDownload = () => {
    if (!filtered || filtered.length === 0) return;
    const header = ["ID", "Nombre Producto", "Categoria", "Descripcion", "Estado", "Precio Compra", "Precio Venta", "Descuento", "Stock Total"];
    const csvData = filtered.map(p => {
      const totalStock = (variantesGlobales || []).filter(v => v.id_producto === p.id_producto).reduce((acc, v) => acc + (v.stock || 0), 0);
      return [
        p.id_producto,
        `"${p.nombre_producto}"`,
        `"${getCategoriaNombre(p.id_categoria)}"`,
        `"${(p.descripcion || "").replace(/"/g, '""')}"`,
        p.estado ? "Activo" : "Inactivo",
        p.precio_compra,
        p.precio,
        p.descuento_producto || 0,
        totalStock
      ].join(",");
    });

    const csvContent = "\uFEFF" + [header.join(","), ...csvData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_productos_onwheels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoriaNombre = (idCat) => {
    const cat = categorias.find((c) => c.id_categoria === Number(idCat));
    return cat ? cat.nombre_categoria : "—";
  };
  const getTallaNombre = (idTalla) => {
    const t = tallas.find(t => t.id_talla === Number(idTalla));
    return t ? t.nombre_talla : "—";
  };

  const getColorNombre = (idColor) => {
    const c = colores.find(c => c.id_color === Number(idColor));
    return c ? c.nombre_color : "—";
  };

  const content = (
    <>
      <div className={configUi.pageShell}>
        <div className={configUi.headerRow}>
          <div className={configUi.titleWrap}>
            <h2 className={configUi.title} style={{ fontFamily: '"Outfit", sans-serif' }}>
               Productos
            </h2>
          </div>

          <div className={configUi.toolbar}>
            <div className={configUi.searchWrap}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                className={configUi.inputWithIcon}
              />
            </div>

            {/* Filter Dropdown */}
            <FilterDropdown
              value={filtroCategoria}
              onChange={(val) => { setFiltroCategoria(val); setPaginaActual(1); }}
              options={[
                { label: "Todas las Categorías", value: "" },
                ...categorias.map(c => ({ 
                  label: c.nombre_categoria, 
                  value: String(c.id_categoria),
                  icon: Layers
                }))
              ]}
              placeholder="Categoría"
            />

            <FilterDropdown
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPaginaActual(1); }}
              options={[
                { label: "Todos los Estados", value: "Todos" },
                { label: "Activos", value: "Activo", color: "#10b981" },
                { label: "Inactivos", value: "Inactivo", color: "#64748b" }
              ]}
              placeholder="Estado"
              icon={Box}
            />

            {/* Download Button */}
            <button
               onClick={handleDownload}
               className={configUi.iconButton} title="Descargar Reporte"
            >
              <Download size={20} />
            </button>

            {canManage("productos") && (
              <button
                onClick={() => openProductModal(null)}
                className={configUi.primaryButton}
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
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full min-w-[1000px] text-left border-separate border-spacing-0">
              <thead className="bg-[#dbeafe] text-[#16315f] sticky top-0 z-30 shadow-sm">
                <tr>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef] w-12 text-center">#</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef]">Producto / Categoría</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef]">Estado</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef] text-right">Inversión</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef] text-right">Venta</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef] text-right">Stock</th>
                  <th className="px-3 py-2 font-black text-[10px] uppercase tracking-[0.12em] border-b border-[#9ec1ef] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7e5f8]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                         <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Actualizando inventario...</p>
                       </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                         <ImageIcon size={48} />
                         <p className="text-xs font-black uppercase tracking-widest">Sin productos</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p, idx) => {
                    const totalStock = (variantesGlobales || []).filter(v => v.id_producto === p.id_producto).reduce((acc, v) => acc + (v.stock || 0), 0);
                    return (
                      <tr key={p.id_producto} className="group hover:bg-[#f8fbff] transition-all">
                        <td className="px-3 py-2 border-b border-[#d7e5f8] text-center">
                           <span className="text-[10px] font-black text-slate-300">{(paginaActual - 1) * productosPorPagina + idx + 1}</span>
                        </td>
                        <td className="px-3 py-2 border-b border-[#d7e5f8]">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                               {p.imagenes && p.imagenes.length > 0 ? (
                                 <img 
                                   src={p.imagenes[0].url_imagen?.startsWith('http') ? p.imagenes[0].url_imagen : `${API_URL}${p.imagenes[0].url_imagen}`} 
                                   alt={p.nombre_producto} 
                                   className="w-full h-full object-cover" 
                                 />
                               ) : (
                                 <ImageIcon size={14} className="text-slate-200" />
                               )}
                             </div>
                             <div className="flex flex-col min-w-0">
                               <span className="font-bold text-[#16315f] text-sm leading-tight truncate uppercase tracking-tight">{p.nombre_producto}</span>
                               <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase leading-none mt-0.5">{getCategoriaNombre(p.id_categoria)}</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-b border-[#d7e5f8]">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${p.estado ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                            {p.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b border-[#d7e5f8] text-right font-bold text-slate-400 text-[11px] tabular-nums">
                          ${Number(p.precio_compra).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 border-b border-[#d7e5f8] text-right">
                          <div className="flex flex-col items-end">
                             <span className="font-black text-[#16315f] text-[11px] tabular-nums">${Number(p.precio).toLocaleString()}</span>
                             {Number(p.descuento_producto) > 0 && <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 rounded">-{p.descuento_producto}% OFF</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2 border-b border-[#d7e5f8] text-right">
                           <span className={`font-black text-[11px] ${totalStock <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                             {totalStock} <span className="text-[9px] font-bold text-slate-300 ml-0.5">UND</span>
                           </span>
                        </td>
                        <td className="px-3 py-2 border-b border-[#d7e5f8] text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openViewModal(p)} className="p-1.5 rounded-lg bg-white text-[#6a85ad] hover:text-[#16315f] shadow-sm border border-[#bfd1f4] transition-all hover:scale-105" title="Ver Detalle"><Eye size={12} /></button>
                            <button onClick={() => openProductModal(p)} className="p-1.5 rounded-lg bg-white text-[#6a85ad] hover:text-[#16315f] shadow-sm border border-[#bfd1f4] transition-all hover:scale-105" title="Editar"><Pen size={12} /></button>
                            <button onClick={() => { setProductoToDelete(p); setIsDeleteConfirmOpen(true); }} className="p-1.5 rounded-lg bg-[#fff1f3] text-[#d44966] hover:bg-[#ffe4e8] shadow-sm border border-[#f5c4cc] transition-all hover:scale-105" title="Eliminar"><Trash2 size={12} /></button>
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
            {totalPaginasLocal > 1 && (
              <div className="border-t border-[#d7e5f8] px-5 py-4 bg-[#fbfdff] flex items-center justify-between mt-auto">
                <p className="text-sm font-bold text-[#6b84aa]">
                  Página <span className="text-[#16315f]">{paginaActual}</span> de <span className="text-[#16315f]">{totalPaginasLocal}</span>
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
                    disabled={paginaActual === totalPaginasLocal}
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginasLocal, p + 1))}
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
              className={configUi.modalBackdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col overflow-hidden border border-slate-100"
                style={{ maxHeight: "92vh" }}
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-black text-[#16315f] tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
                        {productForm.id_producto ? "Editar Producto" : "Nuevo Producto"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {productForm.id_producto ? "Actualiza la información del producto" : "Completa los campos para agregar un producto"}
                      </p>
                    </div>
                    <button onClick={() => setIsProductModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                  {/* Tabs */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 1, label: "Información" },
                      { id: 2, label: "Precios" },
                      { id: 3, label: "Fotos y Stock" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCurrentStep(tab.id)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                          currentStep === tab.id
                            ? "bg-white text-[#16315f] shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {/* ── TAB 1: INFORMACIÓN ── */}
                    {currentStep === 1 && (
                      <motion.div key="tab1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-7 space-y-5">
                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Nombre del producto *</label>
                          <input
                            autoFocus
                            name="nombre_producto"
                            value={productForm.nombre_producto}
                            onChange={handleProductChange}
                            onBlur={handleProductBlur}
                            placeholder="Ej: Camiseta Deportiva Premium"
                            className={cn(configUi.fieldInput, formErrors.nombre_producto && "border-rose-400 bg-rose-50")}
                          />
                          {formErrors.nombre_producto && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.nombre_producto}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Categoría *</label>
                            <div className="relative">
                              <select name="id_categoria" value={productForm.id_categoria ?? ""} onChange={handleProductChange} onBlur={handleProductBlur} className={cn(configUi.fieldSelect, formErrors.id_categoria && "border-rose-400 bg-rose-50")}>
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                              </select>
                            </div>
                            {formErrors.id_categoria && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.id_categoria}</p>}
                          </div>
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Visibilidad</label>
                            <div className="relative">
                              <select name="estado" value={productForm.estado} onChange={handleProductChange} className={configUi.fieldSelect}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className={configUi.fieldGroup}>
                          <label className={configUi.fieldLabel}>Descripción *</label>
                          <textarea name="descripcion" value={productForm.descripcion} onChange={handleProductChange} onBlur={handleProductBlur} rows={4} placeholder="Describe el producto: materiales, uso, características..." className={cn(configUi.fieldInput, "pt-3 resize-none", formErrors.descripcion && "border-rose-400 bg-rose-50")} />
                          {formErrors.descripcion && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.descripcion}</p>}
                          <p className="text-[10px] text-slate-300 mt-1 text-right">{(productForm.descripcion || "").length}/500</p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── TAB 2: PRECIOS ── */}
                    {currentStep === 2 && (
                      <motion.div key="tab2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-7 space-y-5">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-600 font-medium">
                          💡 Ingresa el <strong>costo</strong> y el <strong>margen</strong> para calcular el precio de venta automáticamente, o ajústalo manualmente.
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Costo de compra *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                              <input type="number" name="precio_compra" value={productForm.precio_compra} onChange={handleProductChange} onBlur={handleProductBlur} placeholder="0" className={cn(configUi.fieldInput, "pl-8 font-bold", formErrors.precio_compra && "border-rose-400 bg-rose-50")} />
                            </div>
                            {formErrors.precio_compra && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.precio_compra}</p>}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Margen de ganancia (%)</label>
                            <div className="relative">
                              <input type="number" name="porcentaje_ganancia" value={productForm.porcentaje_ganancia} onChange={handleProductChange} placeholder="0" className={cn(configUi.fieldInput, "pr-8 font-bold text-emerald-700 bg-emerald-50 border-emerald-200 focus:border-emerald-400")} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">%</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Precio de venta *</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-sm">$</span>
                              <input type="number" name="precio" value={productForm.precio} onChange={handleProductChange} onBlur={handleProductBlur} placeholder="0" className={cn(configUi.fieldInput, "pl-8 font-bold text-indigo-700 bg-indigo-50 border-indigo-200 focus:border-indigo-400", formErrors.precio && "border-rose-400 bg-rose-50")} />
                            </div>
                            {formErrors.precio && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.precio}</p>}
                          </div>

                          <div className={configUi.fieldGroup}>
                            <label className={configUi.fieldLabel}>Descuento promocional (%)</label>
                            <div className="relative">
                              <input type="number" name="descuento_producto" value={productForm.descuento_producto} onChange={handleProductChange} placeholder="0" className={cn(configUi.fieldInput, "pr-8 font-bold text-rose-600 bg-rose-50 border-rose-200 focus:border-rose-400", formErrors.descuento_producto && "border-rose-400 bg-rose-50")} />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">%</span>
                            </div>
                            {formErrors.descuento_producto && <p className="text-rose-500 text-xs font-bold mt-1">{formErrors.descuento_producto}</p>}
                          </div>
                        </div>

                        {Number(productForm.precio) > 0 && (
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio final al cliente</p>
                              {Number(productForm.descuento_producto) > 0 ? (
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-slate-300 line-through text-base font-bold">${Number(productForm.precio).toLocaleString()}</span>
                                  <span className="text-2xl font-black text-[#16315f]">${(Number(productForm.precio) * (1 - Number(productForm.descuento_producto) / 100)).toLocaleString()}</span>
                                  <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">-{productForm.descuento_producto}%</span>
                                </div>
                              ) : (
                                <span className="text-2xl font-black text-[#16315f] mt-1 block">${Number(productForm.precio).toLocaleString()}</span>
                              )}
                            </div>
                            {Number(productForm.precio_compra) > 0 && Number(productForm.precio) > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ganancia unitaria</p>
                                <span className="text-lg font-black text-emerald-600">${(Number(productForm.precio) - Number(productForm.precio_compra)).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── TAB 3: FOTOS & STOCK ── */}
                    {currentStep === 3 && (
                      <motion.div key="tab3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="p-7 space-y-6">
                        {/* Images */}
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Imágenes del producto</h4>
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                            <Upload className="h-5 w-5 text-slate-300 mb-1" />
                            <span className="text-[11px] font-bold text-slate-400">Haz clic para subir imágenes</span>
                            <span className="text-[10px] text-slate-300 mt-0.5">PNG, JPG, WEBP</span>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                          </label>

                          <div className="flex gap-2 mt-3">
                            <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUrlManual()} placeholder="O pega una URL de imagen externa..." className={cn(configUi.fieldInput, "flex-1 text-xs")} />
                            <button type="button" onClick={addUrlManual} className="px-4 bg-[#16315f] text-white rounded-xl hover:bg-[#0d2248] transition-colors text-sm font-bold">+</button>
                          </div>

                          {(imagenesGuardadas.length > 0 || imagenesArchivos.length > 0 || imagenesUrls.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              {imagenesGuardadas.map((img) => (
                                <div key={`db-${img.id_imagen}`} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <img src={img.url_imagen?.startsWith('http') ? img.url_imagen : `${API_URL}${img.url_imagen}`} alt="" className={`w-full h-full object-cover ${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-25' : ''}`} />
                                  <button type="button" onClick={() => toggleConservarImagen(img.id_imagen)} className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity ${!imagenesConservadas?.includes(img.id_imagen) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    {!imagenesConservadas?.includes(img.id_imagen) ? <CheckCircle size={16} /> : <Trash2 size={16} />}
                                  </button>
                                </div>
                              ))}
                              {imagenesArchivos.map((file, idx) => (
                                <div key={`file-${idx}`} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeArchivo(idx)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100"><X size={16} /></button>
                                </div>
                              ))}
                              {imagenesUrls.map((url, idx) => (
                                <div key={`url-${idx}`} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeUrlManual(idx)} className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100"><X size={16} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Variants */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Color y Tallas (Stock)</h4>
                            <button type="button" onClick={saveVariant} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#16315f] text-white rounded-lg hover:bg-[#0d2248] transition-all">
                              + Agregar variante
                            </button>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                            <div className={configUi.fieldGroup}>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Color</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <select value={currentVariant.color} onChange={(e) => handleVariantChange('color', e.target.value)} className={cn(configUi.fieldSelect, "bg-white")}>
                                    <option value="">Seleccionar color...</option>
                                    {colores.map(c => <option key={c.id_color} value={c.nombre_color}>{c.nombre_color}</option>)}
                                  </select>
                                </div>
                                <button type="button" onClick={() => setIsCreateColorOpen(true)} title="Nuevo color" className="px-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#16315f] hover:border-[#16315f] transition-all text-xs font-bold">+ Color</button>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tallas y cantidad</label>
                                <button type="button" onClick={() => setIsCreateTallaOpen(true)} className="text-[10px] font-black text-slate-400 hover:text-[#16315f] uppercase tracking-widest">+ Talla</button>
                              </div>
                              <div className="space-y-2">
                                {currentVariant.tallas.map((t, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                      <select value={t.talla} onChange={(e) => handleTallaChange(idx, 'talla', e.target.value)} className={cn(configUi.fieldSelect, "bg-white")}>
                                        <option value="">Talla...</option>
                                        {tallas.map(tl => <option key={tl.id_talla} value={tl.nombre_talla}>{tl.nombre_talla}</option>)}
                                      </select>
                                    </div>
                                    <input type="number" value={t.cantidad} onChange={(e) => handleTallaChange(idx, 'cantidad', e.target.value)} placeholder="Und." className={cn(configUi.fieldInput, "w-24 bg-white font-bold text-center")} />
                                    {idx === currentVariant.tallas.length - 1 ? (
                                      <button type="button" onClick={addTalla} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"><Plus size={14} /></button>
                                    ) : (
                                      <button type="button" onClick={() => removeTalla(idx)} className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0"><Trash2 size={14} /></button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {variantError && <p className="text-rose-500 text-xs font-bold mt-2">{variantError}</p>}

                          {variants.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Variantes agregadas</p>
                              {variants.map((v, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                  <div>
                                    <span className="text-xs font-black text-[#16315f]">{v.color || "—"}</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {v.tallas.map((t, ti) => (
                                        <span key={ti} className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{t.talla}: {t.cantidad} und.</span>
                                      ))}
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => removeVariant(v)} className="w-8 h-8 flex items-center justify-center text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors shrink-0"><X size={13} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Modal Footer */}
                <div className="px-7 py-5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(step => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        className={cn("w-7 h-1.5 rounded-full transition-all", currentStep === step ? "bg-[#16315f]" : "bg-slate-200 hover:bg-slate-300")}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 items-center">
                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors px-3">
                      Cancelar
                    </button>
                    {currentStep > 1 && (
                      <button type="button" onClick={() => setCurrentStep(s => s - 1)} className={configUi.secondaryButton}>
                        ← Atrás
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button type="button" onClick={() => setCurrentStep(s => s + 1)} className={configUi.primaryButton}>
                        Siguiente →
                      </button>
                    ) : (
                      <button type="button" onClick={saveProduct} className={configUi.primaryButton}>
                        <CheckCircle size={16} />
                        <span>{productForm.id_producto ? "Guardar Cambios" : "Crear Producto"}</span>
                      </button>
                    )}
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
                className="bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden max-w-4xl w-full border border-slate-200"
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
