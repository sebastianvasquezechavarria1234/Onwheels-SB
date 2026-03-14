import { Package, Users, Calendar, ShoppingCart } from "lucide-react"

export const CustomDashboard = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h2 className="text-2xl font-bold text-[#040529] mb-6">Bienvenido a tu Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-6 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Productos</p>
              <h3 className="text-3xl font-bold mt-1">124</h3>
            </div>
            <Package size={40} className="opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] p-6 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Usuarios</p>
              <h3 className="text-3xl font-bold mt-1">89</h3>
            </div>
            <Users size={40} className="opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] p-6 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Eventos Activos</p>
              <h3 className="text-3xl font-bold mt-1">12</h3>
            </div>
            <Calendar size={40} className="opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#43e97b] to-[#38f9d7] p-6 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Ventas del Mes</p>
              <h3 className="text-3xl font-bold mt-1">$2.5M</h3>
            </div>
            <ShoppingCart size={40} className="opacity-70" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-[#040529] mb-2">Información</h3>
        <p className="text-gray-500 leading-relaxed text-sm">
          Este es tu dashboard personalizado. Usa el menú lateral para navegar entre las
          diferentes secciones según tus permisos asignados.
        </p>
      </div>
    </div>
  )
}
