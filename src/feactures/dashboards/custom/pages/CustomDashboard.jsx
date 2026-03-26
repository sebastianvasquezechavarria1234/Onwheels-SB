import React, { useState, useEffect } from "react";
import { 
  Package, 
  Users, 
  Calendar, 
  ShoppingCart, 
  TrendingUp,
  Info,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../../services/api";
import { configUi, cn } from "../../admin/pages/configuracion/configUi";

export const CustomDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError("No se pudieron cargar las métricas en este momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    return `$${(val / 1000).toFixed(0)}k`;
  };

  const statConfig = [
    { 
      label: "Ventas Totales", 
      count: stats ? formatCurrency(stats.metricas.totalVentas) : "—", 
      trend: stats?.metricas.tendenciaVentas,
      icon: <ShoppingCart size={24} />, 
      color: "from-[#102035] to-[#13263d]" 
    },
    { 
      label: "Matrículas Activas", 
      count: stats ? stats.metricas.matriculasActivas : "—", 
      trend: stats?.metricas.tendenciaMatriculas,
      icon: <Users size={24} />, 
      color: "from-[#2b64d8] to-[#1e4db7]" 
    },
    { 
      label: "Preinscripciones", 
      count: stats ? stats.metricas.preinscripciones : "—", 
      trend: stats?.metricas.tendenciaPreins,
      icon: <Calendar size={24} />, 
      color: "from-[#3b82f6] to-[#2563eb]" 
    },
    { 
      label: "Nuevos Alumnos", 
      count: stats ? stats.metricas.nuevosAlumnos : "—", 
      icon: <Package size={24} />, 
      color: "from-[#223a63] to-[#16315f]" 
    },
  ];

  return (
    <div className={configUi.pageShell}>
      {/* Header & Toolbar */}
      <div className={configUi.headerRow}>
        <div className={configUi.titleWrap}>
          <h2 className={configUi.title}>Mi Actividad</h2>
          <span className={configUi.countBadge}>
            PANEL DE CONTROL
          </span>
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase tracking-wider">
             <Info size={12} />
             ESTADO: ACTIVO
          </div>
        </div>
        <div className={configUi.toolbar}>
          <button 
            onClick={fetchStats}
            disabled={loading}
            className={cn(configUi.secondaryButton, "px-4")}
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
            {loading ? "Sincronizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center my-8">
           <AlertCircle size={40} className="mx-auto text-rose-400 mb-4" />
           <p className="text-rose-900 font-bold mb-4 uppercase tracking-tight text-sm">{error}</p>
           <button onClick={fetchStats} className={configUi.primaryButton}>Reintentar</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 mt-4">
          {statConfig.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group border border-white/10 bg-gradient-to-br min-h-[160px] flex flex-col justify-between",
                stat.color,
                loading && "animate-pulse opacity-70"
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                    {stat.icon}
                  </div>
                  {stat.trend !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-sm",
                      stat.trend >= 0 ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
                    )}>
                      <TrendingUp size={12} className={cn(stat.trend < 0 && "rotate-180")} />
                      {stat.trend >= 0 ? "+" : ""}{stat.trend}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black tracking-tighter">
                    {loading ? "..." : stat.count}
                  </h3>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Welcome Card */}
      <div className={cn(configUi.tableCard, "p-8 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)]")}>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 flex-shrink-0">
             <Info size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#16315f] mb-3 uppercase tracking-tight">Bienvenido a tu Estación Central</h3>
            <p className="text-slate-500 leading-relaxed text-sm max-w-2xl font-medium">
              Este es tu centro de operaciones personalizado. Desde aquí puedes monitorear tus adquisiciones, 
              gestionar tu participación en eventos y administrar tu formación académica. Navega libremente 
              por los módulos laterales optimizados para tu flujo de trabajo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
