import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../../../services/api";

const PIE_COLORS = ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD"];

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const formatCurrency = (value) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
};

// ────────────────────────────────────────────────────────────────────────────
// Skeleton card while loading
// ────────────────────────────────────────────────────────────────────────────
const SkeletonCard = ({ isPrimary }) => (
  <div
    className={`relative p-6 rounded-[1.5rem] ${
      isPrimary ? "bg-blue-800" : "bg-white border-2 border-slate-100"
    } shadow-lg animate-pulse h-[160px]`}
  >
    <div className={`h-3 rounded-full w-24 mb-4 ${isPrimary ? "bg-white/30" : "bg-slate-200"}`} />
    <div className={`h-9 rounded-full w-32 mb-2 ${isPrimary ? "bg-white/30" : "bg-slate-200"}`} />
    <div className={`h-3 rounded-full w-16 ${isPrimary ? "bg-white/20" : "bg-slate-100"}`} />
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// Metric Card
// ────────────────────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, trend, icon: Icon, color, delay, isPrimary }) => {
  const colorSchemes = {
    blue:   { shadow: "shadow-blue-500/20",   iconBg: "bg-blue-50 text-blue-600",   border: "border-blue-100/50",   primary: "bg-blue-800 text-white" },
    indigo: { shadow: "shadow-indigo-500/20", iconBg: "bg-indigo-50 text-indigo-600", border: "border-indigo-100/50" },
    sky:    { shadow: "shadow-sky-500/20",    iconBg: "bg-sky-50 text-sky-600",      border: "border-sky-100/50" },
    amber:  { shadow: "shadow-amber-500/20",  iconBg: "bg-amber-50 text-amber-600",  border: "border-amber-100/50" },
    rose:   { shadow: "shadow-rose-500/20",   iconBg: "bg-rose-50 text-rose-600",    border: "border-rose-100/50" },
  };

  const scheme = colorSchemes[color] || { shadow: "shadow-slate-200", iconBg: "bg-slate-50 text-slate-400", border: "border-slate-100" };

  if (isPrimary) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`relative p-6 rounded-[2rem] ${scheme.primary} shadow-xl ${scheme.shadow} flex flex-col justify-between h-full min-h-[160px]`}
      >
        <div className="flex justify-between items-start">
          <p className="text-white/80 !text-[12px] font-bold uppercase tracking-wider leading-none m-0 p-0">{title}</p>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
            <Icon size={16} className="text-white" />
          </div>
        </div>
        <div className="mt-2 text-left">
          <p className="!text-[40px] font-black tracking-tight text-white m-0 p-0 leading-none">{value}</p>
          {trend !== undefined && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-white/90">
              <span className="bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold">
                {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trend)}%
              </span>
              <span className="opacity-70 text-[10px] font-medium tracking-tight">vs. mes anterior</span>
            </div>
          )}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative p-6 rounded-[1.5rem] bg-white shadow-lg ${scheme.shadow} border-2 ${scheme.border} flex flex-col justify-between h-full min-h-[160px] hover:scale-[1.01] transition-transform duration-300`}
    >
      <div className="flex justify-between items-start">
        <p className="text-slate-500 !text-[12px] font-bold uppercase tracking-wider leading-none m-0 p-0">{title}</p>
        <div className={`${scheme.iconBg} p-2 rounded-full`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-2 text-left">
        <p className="!text-[40px] font-black tracking-tight text-slate-800 m-0 p-0 leading-none">{value}</p>
        {trend !== undefined && (
          <div className="mt-2.5 flex items-center gap-1.5 text-left">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${trend >= 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
              {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
            <span className="text-slate-400 text-[10px] font-medium tracking-tight">vs. mes anterior</span>
          </div>
        )}
      </div>
    </motion.article>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Tooltip personalizado para área chart
// ────────────────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-0.5">{label}</p>
        <p className="text-blue-600 font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ────────────────────────────────────────────────────────────────────────────
// Dashboard principal
// ────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [userName, setUserName] = useState("Administrador");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || "Administrador");
      } catch (_) {}
    }
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Error al cargar estadísticas del dashboard:", err);
      setError("No se pudieron cargar las estadísticas. Comprueba tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ── Estado de error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-slate-500 text-sm text-center max-w-sm">{error}</p>
        <button
          onClick={fetchStats}
          className="bg-blue-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-800/20 flex items-center gap-2 hover:bg-blue-900 transition-all"
        >
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  const { metricas, ventasPorMes = [], categorias = [] } = stats || {};

  // Calcular porcentaje total de donut para el centro
  const totalDonutPct = categorias.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="w-full">
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h2
            className="text-2xl font-black text-[#0F172A] tracking-tight mb-1"
            style={{ fontFamily: '"Outfit", sans-serif', fontSize: '24px', letterSpacing: '-0.5px' }}
          >
            Dashboard
          </h2>
          <p className="text-slate-400 text-[10px] font-medium">
            Resumen en tiempo real — {today}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-semibold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </motion.div>

      {/* ── Tarjetas de métricas ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {loading ? (
          <>
            <SkeletonCard isPrimary />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <MetricCard
              title="Ventas Totales"
              value={formatCurrency(metricas?.totalVentas ?? 0)}
              trend={metricas?.tendenciaVentas}
              icon={DollarSign}
              color="blue"
              delay={0.1}
              isPrimary
            />
            <MetricCard
              title="Matrículas Activas"
              value={metricas?.matriculasActivas ?? 0}
              trend={metricas?.tendenciaMatriculas}
              icon={Users}
              color="indigo"
              delay={0.2}
            />
            <MetricCard
              title="Preinscripciones Pendientes"
              value={metricas?.preinscripciones ?? 0}
              trend={metricas?.tendenciaPreins}
              icon={Activity}
              color="sky"
              delay={0.3}
            />
            <MetricCard
              title="Nuevos Alumnos (mes)"
              value={metricas?.nuevosAlumnos ?? 0}
              icon={ShoppingBag}
              color="amber"
              delay={0.4}
            />
          </>
        )}
      </div>

      {/* ── Gráficas ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica de área — Ventas por mes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-slate-700 m-0 leading-none">Ventas por Mes</p>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">
                Año {new Date().getFullYear()}
              </p>
            </div>
            <div className="text-blue-500">
              <TrendingUp size={14} />
            </div>
          </div>

          {loading ? (
            <div className="h-[240px] animate-pulse bg-slate-100 rounded-xl" />
          ) : ventasPorMes.length === 0 ? (
            <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-slate-400">
              <Package size={28} className="opacity-40" />
              <p className="text-xs">Sin ventas registradas este año</p>
            </div>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={ventasPorMes} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: 500 }}
                    tickFormatter={(v) => formatCurrency(v)}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    dot={{ fill: "#3B82F6", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#1E3A8A" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Gráfica de dona — Distribución de categorías */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-slate-700 m-0 leading-none">Distribución de Ventas</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">
                Por Categoría de Producto
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 min-h-[200px] animate-pulse bg-slate-100 rounded-xl" />
          ) : categorias.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Package size={28} className="opacity-40" />
              <p className="text-xs">Sin datos de categorías</p>
            </div>
          ) : (
            <>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dona */}
                <div className="h-full min-h-[160px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorias}
                        dataKey="value"
                        innerRadius={45}
                        outerRadius={62}
                        paddingAngle={3}
                      >
                        {categorias.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "11px" }}
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-base font-bold text-slate-700">
                      {totalDonutPct > 0 ? `${categorias[0]?.value ?? 0}%` : "—"}
                    </p>
                    <p className="text-[7px] uppercase font-bold text-slate-500 tracking-[0.2em]">
                      {categorias[0]?.name ?? ""}
                    </p>
                  </div>
                </div>

                {/* Lista */}
                <div className="flex flex-col justify-center space-y-3">
                  {categorias.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx] }}
                        />
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.cantidad} uds.
                        </span>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors min-w-[30px] text-right">
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <p className="text-slate-400 italic">
                    Top {categorias.length} categorías por unidades vendidas
                  </p>
                  {metricas?.tendenciaVentas !== undefined && (
                    <div className={`flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-sm ${metricas.tendenciaVentas >= 0 ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
                      {metricas.tendenciaVentas >= 0 ? <TrendingUp size={9} /> : <ArrowDownRight size={9} />}
                      <span>{metricas.tendenciaVentas >= 0 ? "+" : ""}{metricas.tendenciaVentas}%</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
