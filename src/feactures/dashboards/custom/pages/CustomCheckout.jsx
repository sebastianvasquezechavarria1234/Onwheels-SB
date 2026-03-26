import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  AlertTriangle, 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle, 
  Home, 
  MapPin, 
  CreditCard,
  Truck,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckout } from "../../../../hooks/useCheckout";
import { configUi, cn } from "../../admin/pages/configuracion/configUi";

export const CustomCheckout = () => {
    const navigate = useNavigate();
    const {
        cart,
        loading,
        submitting,
        form,
        errors,
        handleInputChange,
        submitOrder
    } = useCheckout();

    const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
    const [isSuccess, setIsSuccess] = useState(false);
    const [finalOrder, setFinalOrder] = useState(null);

    const showNotification = useCallback((message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
    }, []);

    const onConfirm = async (e) => {
        e.preventDefault();
        
        // Guardar resumen antes de que submitOrder limpie el carrito
        const summary = {
            items: [...cart.items],
            total: cart.total,
            itemCount: cart.itemCount
        };

        const result = await submitOrder();

        if (result.success) {
            setFinalOrder({ ...summary, id: result.orderId });
            showNotification("¡Compra realizada exitosamente!", "success");
            setIsSuccess(true);
        } else {
            showNotification(result.message, "error");
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#16315f] rounded-full animate-spin" />
            </div>
        );
    }

    if (cart.items.length === 0 && !isSuccess) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag size={64} className="text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-[#16315f] uppercase tracking-tight">Tu carrito está vacío</h3>
                <p className="text-slate-400 mt-2 mb-8 max-w-xs font-medium">Parece que aún no has agregado artículos para procesar.</p>
                <button onClick={() => navigate("/custom/cart")} className={configUi.primaryButton}>
                    Volver al Carrito
                </button>
            </div>
        );
    }

    return (
        <div className={configUi.pageShell}>
            {/* Header */}
            <div className={configUi.headerRow}>
                <div className={configUi.titleWrap}>
                    <h2 className={configUi.title}>{isSuccess ? "Confirmación" : "Finalizar Compra"}</h2>
                    <span className={configUi.countBadge}>
                        {isSuccess ? "PEDIDO RECIBIDO" : "PROCESO DE PAGO"}
                    </span>
                </div>
                <div className={configUi.toolbar}>
                    {!isSuccess && (
                        <button 
                            onClick={() => navigate("/custom/cart")} 
                            className={configUi.secondaryButton}
                        >
                            <ArrowLeft size={16} />
                            Regresar al Carrito
                        </button>
                    )}
                </div>
            </div>

        <div className="flex flex-col xl:flex-row gap-8 mt-6 overflow-hidden">
            {/* Left Column - Form or Success */}
            <div className="flex-1 min-w-0">
                {isSuccess ? (
                    <div className={cn(configUi.tableCard, "p-12 text-center flex flex-col items-center justify-center min-h-[450px]")}>
                        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100 shadow-lg shadow-emerald-500/5">
                            <CheckCircle size={48} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-[#16315f] mb-4 uppercase tracking-tighter">¡Tu pedido está en camino!</h3>
                            <p className="text-slate-500 mb-10 font-medium max-w-sm leading-relaxed">
                                Hemos recibido la información de tu compra satisfactoriamente. Pronto recibirás un mensaje de confirmación.
                            </p>
                            <button
                                onClick={() => navigate(`/custom/home`)}
                                className={cn(configUi.primaryButton, "px-10 py-5 text-sm")}
                            >
                                <Home size={18} className="mr-2" />
                                Ir al Panel principal
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onConfirm} className={cn(configUi.tableCard, "p-8")}>
                            {/* Shipping Info */}
                            <div className="mb-10">
                                <h3 className="text-sm font-black text-[#16315f] mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <MapPin size={18} className="text-indigo-400" />
                                    Logística de Entrega
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Dirección de Envío *</label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={form.direccion}
                                            onChange={handleInputChange}
                                            className={cn(configUi.input, errors.direccion && "border-rose-300 bg-rose-50/30 font-bold")}
                                            placeholder="Calle, Número, Ciudad, Departamento"
                                        />
                                        {errors.direccion && (
                                            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1 flex items-center gap-1">
                                                <AlertTriangle size={10} /> {errors.direccion}
                                            </p>
                                        )}
                                    </div>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Teléfono de Contacto *</label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={form.telefono}
                                            onChange={handleInputChange}
                                            className={cn(configUi.input, errors.telefono && "border-rose-300 bg-rose-50/30 font-bold")}
                                            placeholder="+57 300 000 0000"
                                        />
                                        {errors.telefono && (
                                            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1 flex items-center gap-1">
                                                <AlertTriangle size={10} /> {errors.telefono}
                                            </p>
                                        )}
                                    </div>

                                    <div className={configUi.fieldGroup}>
                                        <label className={configUi.fieldLabel}>Notas Adicionales</label>
                                        <textarea
                                            name="instrucciones_entrega"
                                            value={form.instrucciones_entrega}
                                            onChange={handleInputChange}
                                            className={cn(configUi.input, "min-h-[100px] resize-none")}
                                            placeholder="Ej: Tocar timbre, tercer piso, entregar a portería..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-10 pt-10 border-t border-slate-100">
                                <h3 className="text-sm font-black text-[#16315f] mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <CreditCard size={18} className="text-indigo-400" />
                                    Forma de Pago
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["Contraentrega", "Transferencia"].map((metodo) => (
                                        <label
                                            key={metodo}
                                            className={cn(
                                                "flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-300 group",
                                                form.metodo_pago === metodo
                                                    ? "border-[#16315f] bg-[#16315f]/5 text-[#16315f] shadow-sm ring-1 ring-[#16315f]/10"
                                                    : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                form.metodo_pago === metodo ? "border-[#16315f]" : "border-slate-300 group-hover:border-slate-400"
                                            )}>
                                                {form.metodo_pago === metodo && <div className="w-2.5 h-2.5 rounded-full bg-[#16315f]" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="metodo_pago"
                                                value={metodo}
                                                checked={form.metodo_pago === metodo}
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <span className="font-black text-xs uppercase tracking-widest">{metodo}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={cn(
                                    configUi.primaryButton, 
                                    "w-full py-5 text-sm uppercase tracking-[0.2em] font-black shadow-2xl shadow-indigo-200 mt-4",
                                    submitting && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        PROCESANDO...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Check size={18} />
                                        CONFIRMAR COMPRA: ${cart.total.toLocaleString()}
                                    </div>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Column - Summary */}
                <div className="w-full xl:w-[400px] shrink-0">
                    <div className={cn(configUi.tableCard, "p-8 sticky top-6")}>
                        <h3 className="text-sm font-black text-[#16315f] mb-6 uppercase tracking-widest flex items-center gap-2">
                            <ShoppingBag size={18} className="text-indigo-400" />
                            Resumen del Pedido
                        </h3>

                        <div className="space-y-4 mb-8 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.items.map((item) => (
                                <div key={item.id_variante} className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0 flex items-center justify-center">
                                        {item.imagen ? (
                                            <img src={item.imagen} alt={item.nombre_producto} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={24} className="text-slate-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-[#16315f] truncate uppercase">{item.nombre_producto}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1 uppercase">
                                            {item.nombre_color} • {item.nombre_talla}
                                        </p>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">x{item.qty}</span>
                                            <span className="font-black text-sm text-[#16315f]">${(item.qty * item.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100">
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <p>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'artículo' : 'artículos'})</p>
                                <p className="text-[#16315f]">${cart.total.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <p className="flex items-center gap-1.5"><Truck size={12} /> Envío Logístico</p>
                                <p className="text-emerald-500 font-black italic">BONIFICADO</p>
                            </div>
                            <div className="flex justify-between items-end pt-6 border-t-2 border-dashed border-slate-100">
                                <p className="font-black text-xs text-slate-400 uppercase tracking-[.2em] mb-1">Total Final</p>
                                <div className="text-right leading-none">
                                    <p className="font-black text-3xl text-[#16315f] tracking-tighter">${cart.total.toLocaleString()}</p>
                                    <span className="text-[9px] text-slate-300 uppercase font-black tracking-[.3em] mt-1 block">COP / NETO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className={cn("fixed top-4 right-4 z-[1000] px-6 py-3 rounded-xl shadow-lg text-white text-sm font-bold flex items-center gap-3", 
                        notification.type === "success" ? "bg-[#16315f]" : "bg-rose-500")}
                    >
                        {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
