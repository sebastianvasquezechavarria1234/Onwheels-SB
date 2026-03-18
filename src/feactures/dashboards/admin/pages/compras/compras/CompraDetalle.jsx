import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCompraById } from "../../services/comprasService";
import { ArrowLeft, Truck, Calendar, DollarSign, Package, AlertCircle, CheckCircle, ChevronLeft, ShoppingCart, Info } from "lucide-react";
import { cn, configUi } from "../../configUi";

export default function CompraDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/custom') ? '/custom' : '/admin';
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        setLoading(true);
        const data = await getCompraById(id);
        setCompra(data);
      } catch (err) {
        console.error("Error fetching compra:", err);
        setError("Error al cargar los detalles de la compra.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCompra();
  }, [id]);

  if (loading) {
    return (
      <div className={`${configUi.pageShell} items-center justify-center`}>
        <div className="text-[#6b84aa] text-sm font-bold flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#bfd1f4] border-t-[#16315f] rounded-full animate-spin" />
          Cargando detalles de la compra...
        </div>
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className={`${configUi.pageShell} items-center justify-center`}>
        <div className="text-red-500 font-bold mb-4 flex flex-col items-center gap-2">
            <AlertCircle size={32} />
            {error || "Compra no encontrada"}
        </div>
        <button onClick={() => navigate(`${basePath}/compras`)} className={configUi.primarySoftButton}>Volver</button>
      </div>
    );
  }

  return (
    <div className={configUi.pageShell}>
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-2 shrink-0">
        <button
          onClick={() => navigate(`${basePath}/compras`)}
          className={configUi.iconButton}
          title="Volver"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className={configUi.title}>Detalle de Compra #{compra.id_compra}</h2>
          <p className="text-sm text-[#6b84aa] mt-1 flex items-center gap-1">
            <Calendar size={14} className="text-[#a9c7ef]" />
            Registrada el {new Date(compra.fecha_compra).toLocaleDateString('es-CO')}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar mt-2 space-y-6 pr-2">
        {/* TOP CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#16315f] mb-4">
              <Truck size={16} className="text-[#6a85ad]" />
              Proveedor
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6b84aa] uppercase block mb-1">Empresa</label>
                <div className={configUi.readOnlyField}>{compra.nombre_proveedor || "—"}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#6b84aa] uppercase block mb-1">NIT / Identificación</label>
                <div className={configUi.readOnlyField}>{compra.nit_proveedor || "No asignado"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#16315f] mb-4">
              <Info size={16} className="text-[#6a85ad]" />
              Información del Registro
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#6b84aa] uppercase block mb-1">Estado</label>
                <div className="flex items-center h-[46px]">
                  {compra.estado === 'Recibida' ? (
                     <span className={configUi.successPill}>Recibida</span>
                  ) : compra.estado === 'Pendiente' ? (
                     <span className={configUi.pill}>Pendiente</span>
                  ) : (
                     <span className={configUi.dangerPill}>{compra.estado}</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#6b84aa] uppercase block mb-1">Total Ítems</label>
                  <div className={configUi.readOnlyField}>{compra.items?.length || 0}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6b84aa] uppercase block mb-1">Valor Total</label>
                  <div className={`${configUi.readOnlyField} font-bold text-[#16315f]`}>
                    ${parseFloat(compra.total_compra).toLocaleString('es-CO')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="rounded-[1.5rem] border border-[#d7e5f8] bg-[#fbfdff] p-6 shadow-sm flex flex-col">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#16315f] mb-4">
            <Package size={16} className="text-[#6a85ad]" />
            Productos Adquiridos
          </h3>
          <div className="overflow-x-auto border border-[#d7e5f8] rounded-2xl">
            <table className={configUi.table}>
              <thead className="bg-[#f8fbff] text-[#16315f]">
                <tr>
                  <th className={`${configUi.th} border-0 rounded-tl-2xl`}>Producto</th>
                  <th className={`${configUi.th} border-0`}>Variante</th>
                  <th className={`${configUi.th} border-0 text-center`}>Cantidad</th>
                  <th className={`${configUi.th} border-0 text-right`}>Precio Unit.</th>
                  <th className={`${configUi.th} border-0 text-right rounded-tr-2xl`}>Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7e5f8]">
                {compra.items?.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-3 py-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#16315f]">{item.nombre_producto}</span>
                        <span className="text-xs text-[#6b84aa] mt-0.5">SKU: {item.sku || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {item.nombre_color && item.nombre_color !== "—" && (
                          <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: item.hex_color || '#cbd5e1' }}></div>
                        )}
                        <span className="text-xs text-[#16315f] font-medium">{item.nombre_color || "Único"} - {item.nombre_talla || "Única"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-middle text-center">
                      <span className="font-mono text-sm font-bold text-[#16315f] bg-[#f8fbff] px-2 py-1 rounded-md border border-[#d7e5f8]">{item.cantidad}</span>
                    </td>
                    <td className="px-3 py-4 align-middle text-right">
                      <span className="text-sm font-medium text-[#6b84aa]">${parseFloat(item.precio_unitario).toLocaleString('es-CO')}</span>
                    </td>
                    <td className="px-3 py-4 align-middle text-right">
                      <span className="text-sm font-bold text-[#16315f]">${(item.cantidad * item.precio_unitario).toLocaleString('es-CO')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
