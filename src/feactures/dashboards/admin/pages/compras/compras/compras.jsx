// src/pages/Compras.estilos.actualizados.fixed.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "../../../layout/layout";
import { Search, Plus, Pencil, Trash2, Eye, Package, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCompras,
  getProveedores,
  createCompra,
  updateCompra,
  deleteCompra,
  updateCompraStatus,
  getComprasByProveedor,
  getProductos,
} from "../../services/comprasService";

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCompra, setSelectedCompra] = useState(null);
  const [modal, setModal] = useState(null); // 'crear','editar','ver','eliminar','status','selectProducto'
  const [expandedRow, setExpandedRow] = useState(null);

  const [form, setForm] = useState({
    NIT_proveedor: "",
    fecha_compra: "",
    fecha_aproximada_entrega: "",
    estado: "Pendiente",
    items: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState({});

  const [historialProveedor, setHistorialProveedor] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [comprasData, proveedoresData, productosData] = await Promise.all([
        getCompras(),
        getProveedores(),
        getProductos(),
      ]);
      setCompras(comprasData || []);
      setProveedores(proveedoresData || []);
      setProductos(productosData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-md ${
      type === "success" ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  }, []);

  const openModal = (type, compra = null) => {
    setModal(type);
    setSelectedCompra(compra);

    if (type === "crear") {
      setForm({
        NIT_proveedor: "",
        fecha_compra: new Date().toISOString().split("T")[0],
        fecha_aproximada_entrega: "",
        estado: "Pendiente",
        items: [],
      });
      setHistorialProveedor([]);
    } else if (type === "editar" && compra) {
      setForm({
        NIT_proveedor: compra.NIT_proveedor,
        fecha_compra: compra.fecha_compra?.split("T")[0] || "",
        fecha_aproximada_entrega: compra.fecha_aproximada_entrega ? compra.fecha_aproximada_entrega.split("T")[0] : "",
        estado: compra.estado,
        items: compra.items || [],
      });
      loadHistorial(compra.NIT_proveedor);
    } else if (type === "selectProducto") {
      const initial = {};
      (form.items || []).forEach(it => {
        initial[it.id_producto] = { color: it.id_color || "", talla: it.id_talla || "", qty: it.qty || 0 };
      });
      setSelectedProducts(initial);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedCompra(null);
    setSelectedProducts({});
    setSearchTerm("");
    setExpandedRow(null);
  };

  const loadHistorial = async (nit) => {
    if (!nit) return;
    setLoadingHistorial(true);
    try {
      const historial = await getComprasByProveedor(nit);
      setHistorialProveedor(historial || []);
    } catch (err) {
      console.error("Error cargando historial:", err);
      showToast("Error al cargar historial del proveedor", "error");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleProveedorChange = (e) => {
    const nit = e.target.value;
    setForm((prev) => ({ ...prev, NIT_proveedor: nit }));
    if (nit) loadHistorial(nit);
    else setHistorialProveedor([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.NIT_proveedor) throw new Error("Proveedor es obligatorio");
      if (!form.items || form.items.length === 0) throw new Error("Debe agregar al menos un producto");
      if (form.fecha_aproximada_entrega && new Date(form.fecha_aproximada_entrega) < new Date(form.fecha_compra)) {
        throw new Error("La fecha de entrega no puede ser anterior a la de compra");
      }

      const total_compra = form.items.reduce((sum, item) => sum + (item.qty || 0) * (item.price || 0), 0);
      const data = { ...form, total_compra };

      if (modal === "crear") await createCompra(data);
      else if (modal === "editar" && selectedCompra) await updateCompra(selectedCompra.id_compra, data);

      await fetchData();
      showToast(modal === "crear" ? "Compra registrada" : "Compra actualizada", "success");
      closeModal();
    } catch (err) {
      console.error("Error al guardar:", err);
      showToast(err.message || "Error al guardar la compra", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCompra(selectedCompra.id_compra);
      await fetchData();
      showToast("Compra eliminada", "success");
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showToast(err?.response?.data?.mensaje || "No se pudo eliminar", "error");
    }
  };

  const handleStatusUpdate = async (estado, actualizarStock) => {
    try {
      await updateCompraStatus(selectedCompra.id_compra, { estado, actualizarStock });
      await fetchData();
      showToast(actualizarStock && estado === "Recibido" ? "Estado actualizado y stock incrementado" : "Estado actualizado", "success");
      closeModal();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      showToast(err?.response?.data?.mensaje || "Error al actualizar estado", "error");
    }
  };

  // PRODUCT SELECTOR LOGIC
  const handleProductSelect = (id, checked) => {
    setSelectedProducts(prev => {
      const next = { ...prev };
      if (checked) next[id] = next[id] || { color: "", talla: "", qty: 0 };
      else delete next[id];
      return next;
    });
  };
  const handleColorSelect = (productId, colorId) => setSelectedProducts(prev => ({ ...prev, [productId]: { ...prev[productId], color: colorId } }));
  const handleTallaSelect = (productId, tallaId) => setSelectedProducts(prev => ({ ...prev, [productId]: { ...prev[productId], talla: tallaId } }));
  const handleQtyChange = (productId, qty) => setSelectedProducts(prev => ({ ...prev, [productId]: { ...prev[productId], qty: parseInt(qty) || 0 } }));

  const saveSelectedProducts = () => {
    const newItems = [];
    for (const [productId, sel] of Object.entries(selectedProducts)) {
      if (sel.qty > 0 && (sel.color || sel.talla)) {
        const product = productos.find(p => p.id_producto == productId);
        const variante = product?.variantes?.find(v => v.id_color == sel.color && v.id_talla == sel.talla);
        if (product && variante) {
          newItems.push({
            id_producto: parseInt(productId),
            nombre_producto: product.nombre_producto,
            id_color: sel.color,
            nombre_color: variante.nombre_color,
            id_talla: sel.talla,
            nombre_talla: variante.nombre_talla,
            qty: sel.qty,
            price: product.precio_compra || 0,
          });
        }
      }
    }

    setForm(prev => {
      const updated = [...(prev.items || [])];
      newItems.forEach(newItem => {
        const idx = updated.findIndex(i => i.id_producto === newItem.id_producto && i.id_color === newItem.id_color && i.id_talla === newItem.id_talla);
        if (idx !== -1) updated[idx].qty += newItem.qty;
        else updated.push(newItem);
      });
      return { ...prev, items: updated };
    });

    closeModal();
  };

  const cargarPedidoAnterior = (p, cargar) => {
    if (!p) return;
    if (cargar) setForm(prev => ({ ...prev, items: p.items || [] }));
  };

  const getNombreProveedor = (nit) => proveedores.find(p => p.NIT_proveedor === nit)?.nombre_proveedor || "—";
  const getProveedorInfo = (nit) => {
    const p = proveedores.find(x => x.NIT_proveedor === nit);
    if (!p) return null;
    return {
      direccion: p.direccion || "—",
      productos: p.productos?.join(", ") || "—",
      terminos: p.terminos || "—",
      sitioWeb: p.sitioWeb || "—",
    };
  };

  // filtering + pagination for display
  const filteredCompras = compras.filter(c =>
    String(c.id_compra).includes(searchTerm) ||
    getNombreProveedor(c.NIT_proveedor).toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(c.fecha_compra).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCompras.length / itemsPerPage));
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const visibleItems = filteredCompras.slice(indexFirst, indexLast);

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages]);

  // helpers
  const updateItemField = (idx, field, value) => setForm(prev => { const items = [...(prev.items||[])]; items[idx] = { ...items[idx], [field]: value }; return { ...prev, items }; });
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_,i)=>i!==idx) }));

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Compras &gt; Gestión de Compras</h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar compras:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  placeholder="Por ejemplo: ID, proveedor o fecha"
                  value={searchTerm}
                  onChange={(e)=>{ setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="input !pl-[50px]"
                />
              </div>
            </label>
          </form>

          <div>
            <button onClick={()=>openModal('crear')} className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]">
              <Plus className="h-4 w-4" />
              Registrar nueva compra
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* Encabezados estilo Proveedores */}
            <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
              <p className="w-[10%] font-bold opacity-80">ID</p>
              <p className="w-[25%] font-bold opacity-80">Proveedor</p>
              <p className="w-[15%] font-bold opacity-80">Fecha</p>
              <p className="w-[10%] font-bold opacity-80">Cantidad</p>
              <p className="w-[15%] font-bold opacity-80">Total</p>
              <p className="w-[15%] font-bold opacity-80">Estado</p>
              <p className="w-[10%] font-bold opacity-80">Acciones</p>
            </article>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead>
                  <tr>
                    <th className="hidden" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-400 italic">Cargando...</td>
                    </tr>
                  ) : visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-400 italic">No hay compras registradas</td>
                    </tr>
                  ) : (
                    visibleItems.map(c => (
                      <React.Fragment key={c.id_compra}>
                        <tr className="py-[18px] border-b border-black/20 hover:bg-gray-50 transition" onClick={()=>setExpandedRow(expandedRow===c.id_compra? null : c.id_compra)}>
                          <td className="px-6 py-[18px] w-[10%]">{c.id_compra}</td>
                          <td className="px-6 py-[18px] w-[25%] line-clamp-1">{getNombreProveedor(c.NIT_proveedor)}</td>
                          <td className="px-6 py-[18px] w-[15%]">{new Date(c.fecha_compra).toLocaleDateString()}</td>
                          <td className="px-6 py-[18px] w-[10%]">{c.items?.length||0}</td>
                          <td className="px-6 py-[18px] w-[15%]">${c.total_compra?.toLocaleString()}</td>
                          <td className="px-6 py-[18px] w-[15%]"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.estado==='Recibido' ? 'bg-green-100 text-green-800' : c.estado==='Pendiente' ? 'bg-yellow-100 text-yellow-800' : c.estado==='En tránsito' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>{c.estado}</span></td>

                          <td className="px-6 py-[18px] w-[10%] flex gap-[10px] items-center justify-center">
                            <motion.button onClick={(e)=>{e.stopPropagation(); openModal('ver', c);}} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md">
                              <Eye className="h-4 w-4" />
                            </motion.button>

                            <motion.button onClick={(e)=>{e.stopPropagation(); openModal('editar', c);}} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-[45px] h-[45px] bg-yellow-100 text-yellow-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-yellow-200 shadow-md">
                              <Pencil className="h-4 w-4" />
                            </motion.button>

                            <motion.button onClick={(e)=>{e.stopPropagation(); openModal('eliminar', c);}} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md">
                              <Trash2 className="h-4 w-4" />
                            </motion.button>

                            <motion.button onClick={(e)=>{e.stopPropagation(); openModal('status', c);}} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-200 shadow-md">
                              <Package className="h-4 w-4" />
                            </motion.button>
                          </td>
                        </tr>

                        {expandedRow===c.id_compra && (
                          <tr className="bg-gray-50"><td colSpan="7" className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3">Información del Proveedor</h4>
                                {getProveedorInfo(c.NIT_proveedor) ? (
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Dirección:</strong> {getProveedorInfo(c.NIT_proveedor).direccion}</div>
                                    <div><strong>Productos:</strong> {getProveedorInfo(c.NIT_proveedor).productos}</div>
                                    <div><strong>Términos:</strong> {getProveedorInfo(c.NIT_proveedor).terminos}</div>
                                    <div><strong>Sitio Web:</strong> <a href={getProveedorInfo(c.NIT_proveedor).sitioWeb} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{getProveedorInfo(c.NIT_proveedor).sitioWeb}</a></div>
                                  </div>
                                ) : (
                                  <p className="text-gray-500">Proveedor no encontrado.</p>
                                )}
                              </div>

                              <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3">Pedidos Recientes</h4>
                                {loadingHistorial ? <p className="text-gray-500">Cargando...</p> : historialProveedor.length===0 ? <p className="text-gray-500">Sin pedidos previos.</p> : (
                                  <table className="w-full text-sm text-left text-gray-600"><thead><tr className="border-b"><th className="py-2">ID</th><th className="py-2">Fecha</th><th className="py-2">Total</th><th className="py-2">Estado</th></tr></thead><tbody>{historialProveedor.map(p=> (<tr key={p.id_compra} className="border-b"><td className="py-2">{p.id_compra}</td><td className="py-2">{new Date(p.fecha_compra).toLocaleDateString()}</td><td className="py-2">${p.total_compra?.toLocaleString()}</td><td className="py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.estado==='Recibido' ? 'bg-green-100 text-green-800' : p.estado==='Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{p.estado}</span></td></tr>))}</tbody></table>
                                )}
                              </div>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 py-4 italic">
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} className="btn cursor-pointer bg-gray-200">Anterior</button>
            <span className="text-[18px]">Página <span className="text-blue-700">{currentPage}</span> de {totalPages}</span>
            <button disabled={currentPage>=totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} className="btn cursor-pointer bg-gray-200">Siguiente</button>
          </div>
        </div>

        {/* MODALS (motion) */}
        <AnimatePresence>
          {(modal==='crear' || modal==='editar') && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}>
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[1000px] max-h-[90vh] overflow-y-auto" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} transition={{type:'spring', stiffness:200, damping:18}} onClick={e=>e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X className="h-5 w-5"/></button>
                <h3 className="text-xl font-bold mb-4">{modal==='crear' ? 'Crear nueva compra' : 'Editar compra'}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Proveedor *</label>
                      <select value={form.NIT_proveedor} onChange={handleProveedorChange} className="input w-full" required>
                        <option value="">selecciona proveedor</option>
                        {proveedores.map(p=> (<option key={p.NIT_proveedor} value={p.NIT_proveedor}>{p.nombre_proveedor}</option>))}
                      </select>

                      {form.NIT_proveedor && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                          <h4 className="font-medium text-gray-700 mb-2">Pedidos anteriores:</h4>
                          {loadingHistorial ? <p className="text-sm text-gray-500">Cargando...</p> : historialProveedor.length===0 ? <p className="text-sm text-gray-500">Sin pedidos previos.</p> : historialProveedor.map(p=>(
                            <div key={p.id_compra} className="flex justify-between items-center py-1 text-sm"><span>{p.id_compra} - {new Date(p.fecha_compra).toLocaleDateString()} - ${p.total_compra?.toLocaleString()}</span><div><button type="button" onClick={()=>cargarPedidoAnterior(p,true)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1">Cargar</button><button type="button" onClick={()=>cargarPedidoAnterior(p,false)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Ref.</button></div></div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha de compra</label>
                      <input type="date" value={form.fecha_compra} onChange={e=>setForm(prev=>({...prev, fecha_compra: e.target.value}))} className="input w-full" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                      <input type="date" value={form.fecha_aproximada_entrega} onChange={e=>setForm(prev=>({...prev, fecha_aproximada_entrega: e.target.value}))} className="input w-full" min={form.fecha_compra} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Estado</label>
                      <select value={form.estado} onChange={e=>setForm(prev=>({...prev, estado: e.target.value}))} className="input w-full">
                        <option value="Pendiente">Pendiente</option>
                        <option value="En tránsito">En tránsito</option>
                        <option value="Recibido">Recibido</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Añadir Productos</label>
                    <button type="button" onClick={()=>openModal('selectProducto')} className="btn px-4 py-2 bg-gray-800 text-white rounded-lg text-sm">Seleccionar productos +</button>
                  </div>

                  {form.items && form.items.length > 0 && (
                    <div className="mt-4"><table className="w-full text-sm text-left text-gray-600"><thead><tr className="border-b"><th className="text-left py-2">Producto</th><th className="text-left py-2">Color</th><th className="text-left py-2">Talla</th><th className="text-left py-2">Cantidad</th><th className="text-left py-2">Precio</th><th className="text-left py-2">Subtotal</th><th></th></tr></thead><tbody>{form.items.map((item, idx)=>(<tr key={idx} className="border-b"><td className="py-2">{item.nombre_producto}</td><td className="py-2">{item.nombre_color||'—'}</td><td className="py-2">{item.nombre_talla||'—'}</td><td className="py-2"><input type="number" min="0" value={item.qty} onChange={e=>updateItemField(idx,'qty',Number(e.target.value))} className="input w-16"/></td><td className="py-2"><input type="number" min="0" step="0.01" value={item.price} onChange={e=>updateItemField(idx,'price',Number(e.target.value))} className="input w-20"/></td><td className="py-2">${(item.qty*item.price).toLocaleString()}</td><td><button type="button" onClick={()=>removeItem(idx)} className="text-red-500 hover:text-red-700">✕</button></td></tr>))}</tbody><tfoot><tr><td colSpan="5" className="text-right font-bold">Total:</td><td className="font-bold">${form.items.reduce((s,i)=>s + (i.qty||0)*(i.price||0),0).toLocaleString()}</td><td></td></tr></tfoot></table></div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="btn bg-gray-200">Cerrar</button>
                    <button type="submit" className="btn bg-blue-100 text-blue-700">{modal==='crear'?'Registrar':'Guardar'}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SELECT PRODUCT MODAL */}
        <AnimatePresence>
          {modal==='selectProducto' && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}>
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[1000px] max-h-[90vh] overflow-y-auto" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} transition={{type:'spring', stiffness:200, damping:18}} onClick={e=>e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X className="h-5 w-5"/></button>
                <h3 className="text-xl font-bold mb-4">Selecciona los productos</h3>

                <div className="mb-4"><div className="relative"><Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} /><input type="text" placeholder="Buscar producto" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="input !pl-[50px]" /></div></div>

                <div className="space-y-4">
                  {productos.filter(p => p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) || (p.descripcion||'').toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                    <div key={p.id_producto} className={`p-4 rounded-lg border ${selectedProducts[p.id_producto] ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="flex items-start gap-4">
                        <input type="checkbox" checked={!!selectedProducts[p.id_producto]} onChange={e=>handleProductSelect(p.id_producto, e.target.checked)} className="mt-1" />
                        <div className="flex-shrink-0">{p.imagen_producto ? <img src={p.imagen_producto} alt={p.nombre_producto} className="w-16 h-16 object-cover rounded"/> : <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center"><span className="text-gray-500">No image</span></div>}</div>
                        <div className="flex-grow"><h4 className="font-medium">{p.nombre_producto}</h4><p className="text-sm text-gray-600 line-clamp-2">{p.descripcion || 'Sin descripción'}</p></div>
                      </div>

                      {selectedProducts[p.id_producto] && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div><label className="block text-sm font-medium mb-2">Colores</label><div className="flex flex-wrap gap-2">{p.variantes?.map(v => (<button key={v.id_color} onClick={()=>handleColorSelect(p.id_producto, v.id_color)} className={`w-6 h-6 rounded-full border-2 ${selectedProducts[p.id_producto]?.color===v.id_color ? 'border-black ring-2 ring-offset-2 ring-black' : 'border-gray-300'}`} style={{backgroundColor: v.codigo_hex}} title={v.nombre_color}></button>))}</div></div>

                          <div><label className="block text-sm font-medium mb-2">Tallas</label><div className="flex flex-wrap gap-2">{Array.from(new Set(p.variantes?.map(v=>v.nombre_talla))).map(talla => (<button key={talla} onClick={()=>handleTallaSelect(p.id_producto, p.variantes.find(v=>v.nombre_talla===talla)?.id_talla)} className={`px-2 py-1 text-xs rounded border ${selectedProducts[p.id_producto]?.talla===p.variantes.find(v=>v.nombre_talla===talla)?.id_talla ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>{talla}</button>))}</div></div>

                          <div><label className="block text-sm font-medium mb-2">Cantidad</label><input type="number" min="0" value={selectedProducts[p.id_producto]?.qty || 0} onChange={e=>handleQtyChange(p.id_producto, e.target.value)} className="input w-20" /></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {productos.filter(p => p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) || (p.descripcion||'').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <p className="text-gray-500 text-center py-10">No se encontraron productos.</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={closeModal} className="btn bg-gray-200">Cerrar</button><button type="button" onClick={saveSelectedProducts} className="btn bg-blue-100 text-blue-700">Guardar</button></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW / DELETE / STATUS modals (motion) */}
        <AnimatePresence>
          {modal==='ver' && selectedCompra && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}>
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[420px]" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} transition={{type:'spring', stiffness:200, damping:18}} onClick={e=>e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">Detalles de la Compra</h3>
                <p><strong>ID:</strong> {selectedCompra.id_compra}</p>
                <p><strong>Proveedor:</strong> {getNombreProveedor(selectedCompra.NIT_proveedor)}</p>
                <p><strong>Fecha compra:</strong> {new Date(selectedCompra.fecha_compra).toLocaleDateString('es-CO')}</p>
                <p><strong>Entrega aprox.:</strong> {selectedCompra.fecha_aproximada_entrega ? new Date(selectedCompra.fecha_aproximada_entrega).toLocaleDateString('es-CO') : '—'}</p>
                <p><strong>Total:</strong> {selectedCompra.total_compra !== undefined ? `$${selectedCompra.total_compra.toLocaleString()}` : '—'}</p>
                <p><strong>Estado:</strong> {selectedCompra.estado}</p>
                <div className="flex justify-end mt-4"><button onClick={closeModal} className="btn px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cerrar</button></div>
              </motion.div>
            </motion.div>
          )}

          {modal==='eliminar' && selectedCompra && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}>
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[420px]" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} transition={{type:'spring', stiffness:200, damping:18}} onClick={e=>e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
                <p>¿Seguro que deseas eliminar la compra <strong>{selectedCompra.id_compra}</strong>?</p>
                <div className="flex justify-end gap-2 mt-4"><button onClick={closeModal} className="btn px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button><button onClick={handleDelete} className="btn bg-red-100 text-red-700">Eliminar</button></div>
              </motion.div>
            </motion.div>
          )}

          {modal==='status' && selectedCompra && (
            <motion.div className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}}>
              <div className="absolute inset-0" onClick={closeModal} />
              <motion.div className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[420px]" initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} transition={{type:'spring', stiffness:200, damping:18}} onClick={e=>e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Actualizar Estado del Pedido</h3>
                <form onSubmit={(e)=>{ e.preventDefault(); const fd=new FormData(e.target); const estado=fd.get('estado'); const actualizarStock=fd.get('actualizarStock')==='on'; handleStatusUpdate(estado, actualizarStock); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nuevo Estado</label>
                    <select name="estado" defaultValue={selectedCompra.estado} className="input w-full"><option value="Pendiente">Pendiente</option><option value="En tránsito">En tránsito</option><option value="Recibido">Recibido</option><option value="Cancelado">Cancelado</option></select>
                  </div>

                  <div className="p-3 bg-green-100 text-green-800 rounded-lg flex items-center gap-2"><Check className="h-5 w-5"/><span><strong>Actualización automática de stock</strong><br/>Al marcar como "Recibido", el stock de los productos se actualizará automáticamente.</span></div>

                  <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={closeModal} className="btn px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cerrar</button><button type="submit" className="btn px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Registrar</button></div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </Layout>
  );
}
