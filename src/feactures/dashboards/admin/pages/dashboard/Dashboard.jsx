import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  ShoppingBag,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Search,
  Bell,
  Mail,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

const monthlySales = [
  { month: "Ene", sales: 40000 },
  { month: "Feb", sales: 35000 },
  { month: "Mar", sales: 48000 },
  { month: "Abr", sales: 52000 },
  { month: "May", sales: 61000 },
  { month: "Jun", sales: 58000 },
  { month: "Jul", sales: 69000 },
  { month: "Ago", sales: 72000 },
  { month: "Sep", sales: 65000 },
  { month: "Oct", sales: 77000 },
  { month: "Nov", sales: 83000 },
  { month: "Dic", sales: 90000 }
];

const productsData = [
  { name: "Decks", sold: 120 },
  { name: "Wheels", sold: 90 },
  { name: "Trucks", sold: 75 },
  { name: "Bearings", sold: 60 },
  { name: "Grip", sold: 45 }
];

const productShare = [
  { name: "Decks", value: 35 },
  { name: "Wheels", value: 25 },
  { name: "Trucks", value: 20 },
  { name: "Other", value: 20 }
];

const PIE_COLORS = ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD"];

const MetricCard = ({ title, value, trend, icon: Icon, color, delay, isPrimary }) => {
  const colorSchemes = {
    blue: {
      shadow: "shadow-blue-500/20",
      iconBg: "bg-blue-50 text-blue-600",
      border: "border-blue-100/50",
      primary: "bg-blue-800 text-white"
    },
    indigo: {
      shadow: "shadow-indigo-500/20",
      iconBg: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-100/50"
    },
    sky: {
      shadow: "shadow-sky-500/20",
      iconBg: "bg-sky-50 text-sky-600",
      border: "border-sky-100/50"
    },
    amber: {
      shadow: "shadow-amber-500/20",
      iconBg: "bg-amber-50 text-amber-600",
      border: "border-amber-100/50"
    },
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
          <h3 className="text-white/80 text-sm font-medium tracking-tight">{title}</h3>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
            <Icon size={18} className="text-white" />
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">{value}</h1>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-white/90">
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight size={12} />
                {trend}%
              </span>
              <span className="opacity-70 text-[10px]">Aumento este mes</span>
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
      className={`relative p-6 rounded-[1.5rem] bg-white shadow-lg ${scheme.shadow} border-2 ${scheme.border} flex flex-col justify-between h-full min-h-[160px] hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-slate-500 text-sm font-medium tracking-tight">{title}</h3>
        <div className={`${scheme.iconBg} p-2 rounded-full`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800">{value}</h1>
        {trend && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${trend > 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
            <span className="text-slate-400 text-[10px]">Aumento este mes</span>
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default function Dashboard() {
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || "Administrador");
      } catch (e) { }
    }
  }, []);

  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="w-full">
      {/* Page Title Section */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            Planifica, prioriza y logra tus objetivos con facilidad hoy {today}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-blue-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-800/20 flex items-center gap-2 hover:bg-blue-900 transition-all">
            + Nuevo Pedido
          </button>
          <button className="bg-white text-slate-700 border border-slate-100 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
            Exportar Datos
          </button>
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <MetricCard
          title="Ventas Totales"
          value="$980k"
          trend={12.5}
          icon={DollarSign}
          color="blue"
          delay={0.1}
          isPrimary={true}
        />
        <MetricCard
          title="Estudiantes Activos"
          value="34"
          trend={8.2}
          icon={Users}
          color="indigo"
          delay={0.2}
        />
        <MetricCard
          title="Preinscripciones"
          value="12"
          trend={-2.4}
          icon={Activity}
          color="sky"
          delay={0.3}
        />
        <MetricCard
          title="Nuevos Alumnos"
          value="5"
          icon={ShoppingBag}
          color="amber"
          delay={0.4}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xs font-semibold text-slate-700">Crecimiento de Ventas</h3>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">Acumulado</p>
            </div>
            <div className="text-blue-500">
              <TrendingUp size={14} />
            </div>
          </div>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlySales} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 15, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 15, fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '10px',
                    color: '#1E293B'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Products Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-semibold text-slate-700">Distribución</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1.5">Categorías</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donut Chart */}
            <div className="h-full min-h-[160px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productShare}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {productShare.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-base font-bold text-slate-700">85%</p>
                <p className="text-[7px] uppercase font-bold text-slate-500 tracking-[0.2em]">Stock</p>
              </div>
            </div>

            {/* Simple Stats List */}
            <div className="flex flex-col justify-center space-y-2">
              {productShare.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></div>
                    <span className="text-[15px] font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-[15px] font-bold text-slate-600 group-hover:text-blue-700 transition-colors">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-[15px]">
              <p className="font-large text-slate-500 italic">Tendencia Positiva</p>
              <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-sm">
                <TrendingUp size={9} />
                <span>+14%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
