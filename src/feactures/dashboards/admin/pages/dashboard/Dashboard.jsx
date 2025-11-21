import React from "react";
import { Layout } from "../../layout/layout";
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
  Cell
} from "recharts";

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

const PIE_COLORS = ["#60A5FA", "#FBBF24", "#34D399", "#F87171"];

export default function Dashboard() {
  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Dashboard</h2>

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-[20px] mt-[40px] p-[30px]">
          <article className="bg-green-100 p-[30px] rounded-[30px]">
            <h1 className="text-2xl mb-[10px] opacity-80">$980.000</h1>
            <h3 className="mb-[6px] opacity-60">Ventas totales</h3>
            <p className="text-green-700">+ 12% del mes pasado</p>
          </article>
          <article className="bg-orange-100 p-[30px] rounded-[30px]">
            <h1 className="text-2xl mb-[10px] opacity-80">34</h1>
            <h3 className="mb-[6px] opacity-60">Estudiantes activos</h3>
            <p className="text-green-700">+ 8 nuevos este mes</p>
          </article>
          <article className="bg-yellow-100 p-[30px] rounded-[30px]">
            <h1 className="text-2xl mb-[10px] opacity-80">12</h1>
            <h3 className="mb-[6px] opacity-60">Preinscripciones</h3>
            <p className="text-green-700">5 pendientes para revisar</p>
          </article>
        </div>

        {/* Charts section: 2 columns */}
        <div className="p-[30px]">
          <div className="grid grid-cols-2 gap-[20px]">
            {/* Left column: Line chart - Ventas mensuales */}
            <div className="bg-white p-[20px] rounded-[20px] shadow-md">
              <h3 className="font-medium mb-[12px]">Ventas mensuales</h3>
              <p className="text-sm text-gray-500 mb-[12px]">Ventas por mes (datos de ejemplo)</p>
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlySales} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right column: Products - Bar + Donut */}
            <div className="bg-white p-[20px] rounded-[20px] shadow-md">
              <h3 className="font-medium mb-[12px]">Productos</h3>
              <p className="text-sm text-gray-500 mb-[12px]">Top productos vendidos (datos de ejemplo)</p>

              {/* Bar chart */}
              <div style={{ width: "100%", height: 200 }} className="mb-[18px]">
                <ResponsiveContainer>
                  <BarChart data={productsData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sold" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut / Pie chart */}
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={productShare}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productShare.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
