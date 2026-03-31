// src/features/dashboards/admin/pages/compras/productos/Products.jsx
import React, { useEffect, useState, useMemo } from "react";
import { X, Plus, Trash2, Search, Eye, Pen, ImageIcon, Tag, MapPin, User, Calendar, Hash, ChevronLeft, ChevronRight, CheckCircle, Clock, Download, ChevronDown, TrendingUp, PlusCircle, AlertTriangle, FileText, Upload, Package, Layers, Box, ShoppingCart, Star, Palette, Ruler, Info, ShieldCheck, Mail, Phone, Pencil, ArrowUpDown, Check } from "lucide-react";
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
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [variantesGlobales, setVariantesGlobales] = useState([]);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
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

  const [imagenesArchivos, setImagenesArchivos] = useState([]);
  const [imagenesUrls, setImagenesUrls] = useState([]);
  const [imagenesGuardadas, setImagenesGuardadas] = useState([]);
  const [imagenesConservadas, setImagenesConservadas] = useState([]);
  const [urlInput, setUrlInput] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [variantError, setVariantError] = useState("");
  
  const [selectedProductForView, setSelectedProductForView] = useState(null);
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({
    id_color: "",
    tallas_data: [{ id_talla: "", cantidad: "" }],
  });

  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ff0000");
  const [newTallaName, setNewTallaName] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resProds, cats, cols, tls, vars] = await Promise.all([
        getProductos(),
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
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => {
      let newData = { ...prev, [name]: value };
      const pCompra = parseFloat(newData.precio_compra) || 0;
      const pVenta = parseFloat(newData.precio) || 0;
      const pGanancia = parseFloat(newData.porcentaje_ganancia) || 0;
      
      if (name === "precio_compra" || name === "porcentaje_ganancia") {
        if (pCompra > 0) newData.precio = (pCompra * (1 + pGanancia / 100)).toFixed(0);
      } else if (name === "precio") {
        if (pCompra > 0 && pVenta > 0) newData.porcentaje_ganancia = (((pVenta - pCompra) / pCompra) * 100).toFixed(1);
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenesArchivos((prev) => [...prev, ...files]);
  };
  const removeArchivo = (index) => setImagenesArchivos((prev) => prev.filter((_, i) => i !== index));
  const addUrlManual = () => {
    if (urlInput.trim()) {
      setImagenesUrls((prev) => [...prev, urlInput.trim()]);
      setUrlInput("");
    }
  };
  const removeUrlManual = (index) => setImagenesUrls((prev) => prev.filter((_, i) => i !== index));
  const toggleConservarImagen = (id) => setImagenesConservadas((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const openProductModal = (producto = null) => {
    if (producto) {
      setProductForm({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto || "",
        id_categoria: producto.id_categoria || "",
        precio_compra: String(producto.precio_compra || ""),
        precio: String(producto.precio || ""),
        porcentaje_ganancia: String(producto.porcentaje_ganancia || ""),
        descuento_producto: String(producto.descuento_producto || "0"),
        descripcion: producto.descripcion ?? "",
        estado: producto.estado ? "activo" : "inactivo",
      });
      setImagenesGuardadas(producto.imagenes || []);
      setImagenesConservadas((producto.imagenes || []).map(img => img.id_imagen));
      
      const prodVars = variantesGlobales.filter(v => v.id_producto === producto.id_producto);
      const grouped = prodVars.reduce((acc, v) => {
         const idColor = v.id_color || "default";
         if (!acc[idColor]) acc[idColor] = { id_color: v.id_color, tallas_data: [] };
         acc[idColor].tallas_data.push({ id_talla: v.id_talla, cantidad: v.stock });
         return acc;
      }, {});
      setVariants(Object.values(grouped));
    } else {
      setProductForm({ id_producto: null, nombre_producto: "", id_categoria: "", precio_compra: "", precio: "", porcentaje_ganancia: "30", descuento_producto: "0", descripcion: "", estado: "activo" });
      setImagenesGuardadas([]);
      setImagenesConservadas([]);
      setVariants([]);
    }
    setImagenesArchivos([]);
    setImagenesUrls([]);
    setCurrentStep(1);
    setIsProductModalOpen(true);
  };

  const addVariantToForm = () => {
    const hasColor = currentVariant.id_color !== "";
    const validTallas = currentVariant.tallas_data.filter(t => t.id_talla !== "" && t.cantidad !== "");
    if (!hasColor && validTallas.length === 0) {
      setVariantError("Selecciona al menos un color o talla con cantidad.");
      return;
    }
    setVariants(prev => {
      const idx = prev.findIndex(v => v.id_color === currentVariant.id_color);
      if (idx >= 0) {
         const updated = [...prev];
         const filteredNew = validTallas.filter(nt => !updated[idx].tallas_data.some(ot => ot.id_talla === nt.id_talla));
         updated[idx].tallas_data = [...updated[idx].tallas_data, ...filteredNew];
         return updated;
      }
      return [...prev, { id_color: currentVariant.id_color, tallas_data: validTallas }];
    });
    setCurrentVariant({ id_color: "", tallas_data: [{ id_talla: "", cantidad: "" }] });
    setVariantError("");
  };

  const saveProduct = async () => {
    if (isSaving) return;
    let finalVariants = [...variants];
    const validDraftTallas = currentVariant.tallas_data.filter(t => t.id_talla !== "" && t.cantidad !== "");
    if (currentVariant.id_color !== "" || validDraftTallas.length > 0) {
       finalVariants.push({ id_color: currentVariant.id_color || null, tallas_data: validDraftTallas });
    }
    if (!productForm.nombre_producto || !productForm.id_categoria || !productForm.precio) {
      showNotification("Por favor completa los campos obligatorios.", "error");
      return;
    }
    try {
      setIsSaving(true);
      const fd = new FormData();
      Object.keys(productForm).forEach(key => fd.append(key, productForm[key]));
      fd.set("estado", productForm.estado === "activo" ? "true" : "false");
      imagenesArchivos.forEach(file => fd.append("imagenes_archivos", file));
      fd.append("imagenes_urls", JSON.stringify(imagenesUrls));
      fd.append("imagenes_conservadas", JSON.stringify(imagenesConservadas));
      const flattened = [];
      finalVariants.forEach(v => {
        v.tallas_data.forEach(t => { flattened.push({ id_color: v.id_color || null, id_talla: t.id_talla || null, stock: Number(t.cantidad) || 0 }); });
      });
      fd.append("variantes", JSON.stringify(flattened));
      if (productForm.id_producto) await updateProducto(productForm.id_producto, fd);
      else await createProducto(fd);
      showNotification("Producto guardado con éxito");
      cargarDatos();
      setIsProductModalOpen(false);
    } catch (err) {
      showNotification("Error: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateColor = async () => {
    if (!newColorName.trim()) return;
    const res = await createColor({ nombre_color: newColorName, codigo_hex: newColorHex });
    if (res) { setColores(prev => [...prev, res]); setNewColorName(""); setIsCreateColorOpen(false); }
  };

  const handleCreateTalla = async () => {
    if (!newTallaName.trim()) return;
    const res = await createTalla({ nombre_talla: newTallaName });
    if (res) { setTallas(prev => [...prev, res]); setNewTallaName(""); setIsCreateTallaOpen(false); }
  };

  const filtered = useMemo(() => {
    return productos.filter(p => {
      const q = busqueda.toLowerCase();
      const matchesSearch = p.nombre_producto.toLowerCase().includes(q);
      const matchesCat = filtroCategoria === "" || Number(p.id_categoria) === Number(filtroCategoria);
      return matchesSearch && matchesCat;
    });
  }, [productos, busqueda, filtroCategoria]);

  const currentItems = filtered.slice((paginaActual - 1) * productosPorPagina, paginaActual * productosPorPagina);
  const totalPaginasLocal = Math.ceil(filtered.length / productosPorPagina) || 1;

  const results = (
    <div className={configUi.pageShell}>
      {/* HEADER */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Gestión de Productos</h2>
          <span className={configUi.countBadge}>{filtered.length} productos registrados</span>
        </div>
        <div className={configUi.toolbar}>
          <div className={configUi.searchWrap}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }} className={configUi.inputWithIcon} />
          </div>
          <FilterDropdown value={filtroCategoria} onChange={val => { setFiltroCategoria(val); setPaginaActual(1); }} options={[{ label: "Todas las Categorías", value: "" }, ...categorias.map(c => ({ label: c.nombre_categoria, value: String(c.id_categoria) }))]} placeholder="Categoría" />
          {canManage("productos") && (
            <button onClick={() => openProductModal(null)} className={configUi.primaryButton}>
              <Plus size={18} /> Registrar Producto
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className={configUi.tableCard}>
        <div className={configUi.tableScroll}>
          <table className={configUi.table}>
            <thead className={configUi.thead}>
              <tr>
                <th className={configUi.th}>Producto</th>
                <th className={configUi.th}>Estado</th>
                <th className={configUi.th + " text-right"}>Precios</th>
                <th className={configUi.th + " text-right"}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="4" className={configUi.emptyState}>Cargando...</td></tr>) : currentItems.length === 0 ? (<tr><td colSpan="4" className={configUi.emptyState}>No hay productos.</td></tr>) : (
                currentItems.map(p => (
                  <tr key={p.id_producto} className={configUi.row}>
                    <td className={configUi.td}>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                             {p.imagenes?.[0] ? (<img src={p.imagenes[0].url_imagen.startsWith('http') ? p.imagenes[0].url_imagen : `${API_URL}${p.imagenes[0].url_imagen}`} className="w-full h-full object-cover" />) : <ImageIcon size={18} className="text-slate-300" />}
                          </div>
                          <div>
                             <p className="font-bold text-[#16315f] text-sm">{p.nombre_producto}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase">{categorias.find(c => c.id_categoria === p.id_categoria)?.nombre_categoria || "Sin categoría"}</p>
                          </div>
                       </div>
                    </td>
                    <td className={configUi.td}><span className={p.estado ? configUi.successPill : configUi.dangerPill}>{p.estado ? "Activo" : "Inactivo"}</span></td>
                    <td className={configUi.td + " text-right"}><div className="flex flex-col items-end"><p className="text-sm font-black text-[#16315f]">${Number(p.precio).toLocaleString()}</p><p className="text-[10px] font-bold text-slate-400">Costo: ${Number(p.precio_compra).toLocaleString()}</p></div></td>
                    <td className={configUi.td + " text-right"}>
                       <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setSelectedProductForView(p); setIsViewModalOpen(true); }} className={configUi.actionButton}><Eye size={14} /></button>
                          <button onClick={() => openProductModal(p)} className={configUi.actionButton}><Pen size={14} /></button>
                          <button onClick={() => { setProductoToDelete(p); setIsDeleteConfirmOpen(true); }} className={configUi.actionDangerButton}><Trash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPaginasLocal > 1 && (
          <div className={configUi.paginationBar}>
            <p className="text-sm font-bold text-slate-500">Página {paginaActual} de {totalPaginasLocal}</p>
            <div className="flex gap-2">
               <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => Math.max(1, p - 1))} className={configUi.paginationButton}><ChevronLeft size={18} /></button>
               <button disabled={paginaActual === totalPaginasLocal} onClick={() => setPaginaActual(p => Math.min(totalPaginasLocal, p + 1))} className={configUi.paginationButton}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR */}
      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProductModalOpen(false)}>
            <motion.div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col w-full max-w-2xl mx-4 overflow-hidden" style={{ maxHeight: '94vh' }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div><h3 className="text-2xl font-black text-[#16315f] leading-none mb-1">{productForm.id_producto ? "Editar Producto" : "Nuevo Producto"}</h3><p className="text-xs font-bold text-slate-400">Configure los detalles del inventario.</p></div>
                  <button onClick={() => setIsProductModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-300 hover:text-rose-500 transition-all"><X size={20} /></button>
               </div>
               <div className="flex px-8 py-3 gap-3 bg-white border-b border-slate-50 overflow-x-auto hide-scrollbar">
                  {[{ id: 1, label: "Info", icon: Info }, { id: 2, label: "Precios", icon: TrendingUp }, { id: 3, label: "Stock", icon: Box }].map(tab => (
                    <button key={tab.id} onClick={() => setCurrentStep(tab.id)} className={cn("flex-1 px-4 py-2 rounded-2xl flex items-center justify-center gap-2 transition-all border", currentStep === tab.id ? "bg-[#16315f] text-white border-[#16315f] shadow-lg shadow-[#16315f]/20" : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200")}>
                       <tab.icon size={14} /><span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                  ))}
               </div>
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div key="st1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                         <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Nombre *</label><input name="nombre_producto" value={productForm.nombre_producto} onChange={handleProductChange} placeholder="Nombre del producto" className={configUi.fieldInput} /></div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Categoría *</label><select name="id_categoria" value={productForm.id_categoria} onChange={handleProductChange} className={configUi.fieldSelect}><option value="">Seleccionar...</option>{categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}</select></div>
                            <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Estado</label><select name="estado" value={productForm.estado} onChange={handleProductChange} className={configUi.fieldSelect}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
                         </div>
                         <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Descripción *</label><textarea name="descripcion" value={productForm.descripcion} onChange={handleProductChange} rows={3} className={configUi.fieldInput + " pt-3"} /></div>
                      </motion.div>
                    )}
                    {currentStep === 2 && (
                      <motion.div key="st2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                            <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Costo *</label><input type="number" name="precio_compra" value={productForm.precio_compra} onChange={handleProductChange} className={configUi.fieldInput} /></div>
                            <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Margen (%)</label><input type="number" name="porcentaje_ganancia" value={productForm.porcentaje_ganancia} onChange={handleProductChange} className={configUi.fieldInput} /></div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Descuento (%)</label><input type="number" name="descuento_producto" value={productForm.descuento_producto} onChange={handleProductChange} className={configUi.fieldInput} /></div>
                            <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Venta Sugerido *</label><input type="number" name="precio" value={productForm.precio} onChange={handleProductChange} className={configUi.fieldInput + " font-black text-indigo-600 bg-indigo-50/30"} /></div>
                         </div>
                         <div className="p-6 bg-slate-900 rounded-3xl text-white mt-4 border border-white/5">
                            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Precio Final al Cliente</p>
                            <h4 className="text-4xl font-black">${(Number(productForm.precio) * (1 - (Number(productForm.descuento_producto) || 0) / 100)).toLocaleString()}</h4>
                         </div>
                      </motion.div>
                    )}
                    {currentStep === 3 && (
                      <motion.div key="st3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase mb-4 flex items-center gap-2"><ImageIcon size={14} /> Imágenes</h4>
                            <div className="flex gap-4 items-center">
                               <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white"><Upload size={20} className="text-slate-400" /><input type="file" multiple className="hidden" onChange={handleFileChange} /></label>
                               <div className="flex-1 space-y-2"><input value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addUrlManual()} placeholder="URL imagen..." className={configUi.fieldInput + " h-10 text-xs"} /><button onClick={addUrlManual} className="w-full py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">Añadir URL</button></div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                               {imagenesGuardadas.map(img => (<div key={img.id_imagen} className="relative w-12 h-12 rounded-xl border overflow-hidden"><img src={img.url_imagen.startsWith('http') ? img.url_imagen : `${API_URL}${img.url_imagen}`} className={cn("w-full h-full object-cover", !imagenesConservadas.includes(img.id_imagen) && "opacity-30")} /><button onClick={() => toggleConservarImagen(img.id_imagen)} className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 hover:opacity-100 transition-opacity"><Trash2 size={12} /></button></div>))}
                               {imagenesArchivos.map((f, i) => (<div key={i} className="relative w-12 h-12 rounded-xl border border-indigo-400 overflow-hidden"><img src={URL.createObjectURL(f)} className="w-full h-full object-cover" /><button onClick={() => removeArchivo(i)} className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 hover:opacity-100"><Trash2 size={12} /></button></div>))}
                               {imagenesUrls.map((u, i) => (<div key={i} className="relative w-12 h-12 rounded-xl border border-emerald-400 overflow-hidden"><img src={u} className="w-full h-full object-cover" /><button onClick={() => removeUrlManual(i)} className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 hover:opacity-100"><Trash2 size={12} /></button></div>))}
                            </div>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase mb-4">Stock por Variantes</h4>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                               <select value={currentVariant.id_color} onChange={e => setCurrentVariant(p => ({...p, id_color: e.target.value === "" ? "" : Number(e.target.value)}))} className={configUi.fieldSelect + " h-10 text-xs"}><option value="">Color...</option>{colores.map(c => <option key={c.id_color} value={c.id_color}>{c.nombre_color}</option>)}</select>
                               <div className="flex gap-2">
                                  <select value={currentVariant.tallas_data[0].id_talla} onChange={e => { const nt = [...currentVariant.tallas_data]; nt[0].id_talla = e.target.value === "" ? "" : Number(e.target.value); setCurrentVariant(p => ({...p, tallas_data: nt})); }} className={configUi.fieldSelect + " h-10 text-xs flex-1"}><option value="">Talla...</option>{tallas.map(t => <option key={t.id_talla} value={t.id_talla}>{t.nombre_talla}</option>)}</select>
                                  <input type="number" value={currentVariant.tallas_data[0].cantidad} onChange={e => { const nt = [...currentVariant.tallas_data]; nt[0].cantidad = e.target.value; setCurrentVariant(p => ({...p, tallas_data: nt})); }} placeholder="Und" className="w-16 h-10 px-2 rounded-xl border bg-white text-xs font-black text-center" />
                               </div>
                            </div>
                            <button onClick={addVariantToForm} className="w-full py-3 bg-[#16315f] text-white rounded-2xl text-[10px] font-black uppercase">Vincular Variante</button>
                            <div className="mt-4 space-y-2">
                               {variants.map((v, i) => (
                                 <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl border text-xs"><p className="font-bold">{v.id_color ? colores.find(c => c.id_color === v.id_color)?.nombre_color : "Color Unico"} | {v.tallas_data.map(t => `${tallas.find(tl => tl.id_talla === t.id_talla)?.nombre_talla}: ${t.cantidad}`).join(", ")}</p><button onClick={() => setVariants(p => p.filter((_, idx) => idx !== i))} className="text-rose-400"><Trash2 size={14} /></button></div>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
               <div className="p-8 border-t border-slate-100 flex justify-between bg-slate-50/50">
                  <div className="flex gap-3">
                     <button onClick={() => setIsProductModalOpen(false)} className="px-6 py-3 font-bold text-slate-400">Cancelar</button>
                     {currentStep > 1 && <button onClick={() => setCurrentStep(p => p - 1)} className="px-6 py-3 bg-white border rounded-2xl text-[10px] font-black">Atrás</button>}
                  </div>
                  {currentStep < 3 ? (<button onClick={() => setCurrentStep(p => p + 1)} className="px-10 py-3 bg-[#16315f] text-white rounded-2xl text-[10px] font-black">Siguiente</button>) : (<button onClick={saveProduct} disabled={isSaving} className="px-10 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase">{isSaving ? "Guardando..." : "Finalizar"}</button>)}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL VER DETALLE - REDESIGNED RECENTLY */}
      <AnimatePresence>
        {isViewModalOpen && selectedProductForView && (
          <motion.div className={configUi.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)}>
            <motion.div className="bg-white rounded-[2.5rem] shadow-2xl flex w-full max-w-5xl mx-4 overflow-hidden border border-slate-100" style={{ maxHeight: '90vh' }} initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}>
               {/* LADO IZQUIERDO: IMAGEN Y RESUMEN COMERCIAL */}
               <div className="w-[38%] bg-[#f8fbff] border-r border-slate-100 flex flex-col p-8 overflow-y-auto custom-scrollbar">
                  <div className="relative aspect-square w-full rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden group">
                     {selectedProductForView.imagenes?.[0] ? (
                        <img src={selectedProductForView.imagenes[0].url_imagen.startsWith('http') ? selectedProductForView.imagenes[0].url_imagen : `${API_URL}${selectedProductForView.imagenes[0].url_imagen}`} className="w-full h-full object-cover" />
                     ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-slate-200">
                           <ImageIcon size={64} strokeWidth={1} />
                           <p className="text-[10px] font-black uppercase tracking-widest mt-2">Sin Imagen Principal</p>
                        </div>
                     )}
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-[#16315f]">REF #{selectedProductForView.id_producto}</p>
                     </div>
                  </div>

                  <div className="mt-8 space-y-6">
                     <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><TrendingUp size={16} /></div>
                           <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">Métricas Comerciales</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[11px] font-bold text-slate-400">Venta Público</span>
                              <span className="text-lg font-black text-[#16315f]">${Number(selectedProductForView.precio).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Costo Base</span>
                              <span className="text-sm font-bold text-slate-400">${Number(selectedProductForView.precio_compra).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Margen Bruto</span>
                              <span className="text-sm font-black text-emerald-500">+{selectedProductForView.porcentaje_ganancia}%</span>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                           <Layers className="text-white/40" size={16} />
                           <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-white/50">Stock Total</h4>
                        </div>
                        <div className="relative z-10 flex items-baseline gap-2">
                           <span className="text-4xl font-black">{variantesGlobales.filter(v => v.id_producto === selectedProductForView.id_producto).reduce((acc, v) => acc + (v.stock || 0), 0)}</span>
                           <span className="text-[10px] font-black uppercase text-white/40">Unidades Disponibles</span>
                        </div>
                        {selectedProductForView.descuento_producto > 0 && (
                           <div className="mt-4 px-3 py-1 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                              Promo Activa: -{selectedProductForView.descuento_producto}%
                           </div>
                        )}
                        <div className="absolute -bottom-8 -right-8 text-white/5"><ShoppingCart size={120} /></div>
                     </div>
                  </div>
               </div>

               {/* LADO DERECHO: DETALLES TECNICOS Y VARIANTES */}
               <div className="flex-1 p-10 flex flex-col overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-10">
                     <div className="space-y-2">
                        <div className="flex gap-2">
                           <span className="px-3 py-1 bg-[#16315f] text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                              {categorias.find(c => Number(c.id_categoria) === Number(selectedProductForView.id_categoria))?.nombre_categoria || "Gral"}
                           </span>
                           <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border", selectedProductForView.estado ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100")}>
                              {selectedProductForView.estado ? "Público" : "Habilitado"}
                           </span>
                        </div>
                        <h2 className="text-3xl font-black text-[#16315f] tracking-tight">{selectedProductForView.nombre_producto}</h2>
                     </div>
                     <button onClick={() => setIsViewModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="space-y-10">
                     <section>
                        <div className="flex items-center gap-3 mb-4">
                           <Info size={16} className="text-[#16315f]" />
                           <h4 className="text-[12px] font-black uppercase tracking-widest text-[#16315f]">Descripción del Producto</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                           {selectedProductForView.descripcion || "Sin descripción proporcionada para este producto."}
                        </p>
                     </section>

                     <section>
                        <div className="flex items-center gap-3 mb-6">
                           <Package size={16} className="text-[#16315f]" />
                           <h4 className="text-[12px] font-black uppercase tracking-widest text-[#16315f]">Inventario por Variantes</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {(() => {
                              const vars = variantesGlobales.filter(v => v.id_producto === selectedProductForView.id_producto);
                              const grouped = vars.reduce((acc, v) => {
                                 const idColor = v.id_color || "default";
                                 if (!acc[idColor]) acc[idColor] = { id_color: v.id_color, tallas: [] };
                                 acc[idColor].tallas.push({ id_talla: v.id_talla, stock: v.stock });
                                 return acc;
                              }, {});

                              return Object.values(grouped).map((group, idx) => (
                                 <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:border-indigo-100 transition-all flex flex-col">
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-3">
                                       <div className="w-4 h-4 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: colores.find(c => c.id_color === group.id_color)?.codigo_hex || '#e2e8f0' }} />
                                       <span className="text-[11px] font-black text-[#16315f] uppercase tracking-wide">
                                          {group.id_color ? colores.find(c => c.id_color === group.id_color)?.nombre_color : "Color Unico"}
                                       </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {group.tallas.map((t, tidx) => (
                                          <div key={tidx} className="flex-1 min-w-[60px] bg-slate-50 rounded-xl p-2.5 flex flex-col items-center border border-transparent hover:border-slate-200 transition-all">
                                             <span className="text-[9px] font-black text-slate-400 uppercase">{tallas.find(tl => tl.id_talla === t.id_talla)?.nombre_talla || "U"}</span>
                                             <span className="text-xs font-black text-[#16315f] mt-0.5">{t.stock} <span className="text-[8px] text-slate-400">UND</span></span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              ));
                           })()}
                        </div>
                     </section>
                  </div>

                  <div className="mt-auto pt-10 flex gap-4">
                     <button onClick={() => { setIsViewModalOpen(false); openProductModal(selectedProductForView); }} className="flex-1 py-4 bg-[#16315f] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0d2248] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                        <Pen size={14} /> Editar Información Completa
                     </button>
                     <button onClick={() => setIsViewModalOpen(false)} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cerrar</button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {isDeleteConfirmOpen && productoToDelete && (
          <motion.div className={configUi.modalBackdrop + " z-[500]"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteConfirmOpen(false)}>
            <motion.div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center border border-slate-100" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
               <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-rose-50/50">
                  <Trash2 size={32} />
               </div>
               <h4 className="text-2xl font-black text-[#16315f] mb-2">¿Eliminar Producto?</h4>
               <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">Esta acción es irreversible y eliminará todo el stock asociado a <span className="text-slate-900">"{productoToDelete.nombre_producto}"</span>.</p>
               <div className="flex flex-col gap-3">
                  <button onClick={async () => {
                     await deleteProducto(productoToDelete.id_producto);
                     showNotification("Producto eliminado");
                     cargarDatos();
                     setIsDeleteConfirmOpen(false);
                  }} className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">Si, Eliminar Permanente</button>
                  <button onClick={() => setIsDeleteConfirmOpen(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancelar</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK COLOR MODAL */}
      <AnimatePresence>
        {isCreateColorOpen && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateColorOpen(false)}>
             <motion.div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xs border border-slate-100" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-black text-[#16315f] mb-6 font-primary uppercase tracking-tighter">Nuevo Color</h4>
                <div className="space-y-4">
                   <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Nombre</label><input value={newColorName} onChange={e => setNewColorName(e.target.value)} placeholder="Ej: Azul Mate" className={configUi.fieldInput} /></div>
                   <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Tono</label><div className="flex gap-2"><input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden" /><input value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className={configUi.fieldInput + " flex-1 text-center font-bold uppercase"} /></div></div>
                   <button onClick={handleCreateColor} className="w-full py-4 bg-[#16315f] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d2248] transition-all">Registrar</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK TALLA MODAL */}
      <AnimatePresence>
        {isCreateTallaOpen && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateTallaOpen(false)}>
             <motion.div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-xs border border-slate-100" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-black text-[#16315f] mb-6 uppercase tracking-tighter">Nueva Talla</h4>
                <div className="space-y-4">
                   <div className={configUi.fieldGroup}><label className={configUi.fieldLabel}>Identificador</label><input value={newTallaName} onChange={e => setNewTallaName(e.target.value)} placeholder="Ej: XXL o 43" className={configUi.fieldInput} /></div>
                   <button onClick={handleCreateTalla} className="w-full py-4 bg-[#16315f] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Registrar</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${notification.type === "success" ? "bg-slate-900/90 text-white border-slate-700" : "bg-rose-500/90 text-white border-rose-400"}`}>
             <div className={cn("w-2 h-2 rounded-full animate-pulse", notification.type === "success" ? "bg-emerald-400" : "bg-white")} />
             <span className="text-[12px] font-black uppercase tracking-tight">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return results;
}
