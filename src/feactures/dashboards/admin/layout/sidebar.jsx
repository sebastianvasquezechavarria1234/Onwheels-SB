import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  Tag,
  ShoppingCart,
  Truck,
  CreditCard,
  Calendar,
  Layers,
  Handshake,
  MapPin,
  GraduationCap,
  ClipboardList,
  FilePlus,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";
import { BtnLink } from "../../../landing/components/BtnLink";

const Sidebar = () => {
  const [openModule, setOpenModule] = useState(true);

  const toggleModule = (module) => {
    setOpenModule(openModule === module ? null : module);
  };

  return (
    <div className="w-64 h-screen bg-[#08152a] text-slate-200 shadow-xl flex flex-col p-4 font-['Outfit',_sans-serif]">
      {/* Contenedor con espacio entre módulos */}
      <div className="flex flex-col space-y-4">
        {/* Dashboard */}
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0f3b82] hover:bg-opacity-20 cursor-pointer transition">
          <LayoutDashboard size={20} className="text-[#9fc5ff]" />
          <span className="font-black text-sm text-white">Dashboard</span>
        </div>

        {/* Compras: primero datos maestros, luego productos y compras */}
        <div>
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#0f3b82] hover:bg-opacity-10 rounded-lg transition"
            onClick={() => toggleModule("compras")}
          >
            <div className="flex items-center gap-3">
              <Package size={20} className="text-slate-300" />
              <span className="font-bold text-sm">Compras</span>
            </div>
          </div>
          {openModule === "compras" && (
            <div className="ml-6 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Tag size={16} className="text-slate-400" />
                <span className="text-sm">Categorías productos</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Truck size={16} className="text-slate-400" />
                <span className="text-sm">Proveedores</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Package size={16} className="text-slate-400" />
                <span className="text-sm"><BtnLink link="productos" title="Productos" /></span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <CreditCard size={16} className="text-slate-400" />
                <span className="text-sm">Compras</span>
              </div>
            </div>
          )}
        </div>

        {/* Eventos: datos maestros antes del CRUD */}
        <div>
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#0f3b82] hover:bg-opacity-10 rounded-lg transition"
            onClick={() => toggleModule("eventos")}
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-slate-300" />
              <span className="font-bold text-sm">Eventos</span>
            </div>
          </div>
          {openModule === "eventos" && (
            <div className="ml-6 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Layers size={16} className="text-slate-400" />
                <span className="text-sm">Categorías eventos</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Handshake size={16} className="text-slate-400" />
                <span className="text-sm">Patrocinadores</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-sm">Sedes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-sm">Eventos</span>
              </div>
            </div>
          )}
        </div>

        {/* Clases: maestros primero (niveles/planes), luego clases y gestión de alumnos */}
        <div>
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#0f3b82] hover:bg-opacity-10 rounded-lg transition"
            onClick={() => toggleModule("clases")}
          >
            <div className="flex items-center gap-3">
              <GraduationCap size={20} className="text-slate-300" />
              <span className="font-bold text-sm">Clases</span>
            </div>
          </div>
          {openModule === "clases" && (
            <div className="ml-6 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <ClipboardList size={16} className="text-slate-400" />
                <span className="text-sm">Niveles de clases</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <BookOpen size={16} className="text-slate-400" />
                <span className="text-sm">Planes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <BookOpen size={16} className="text-slate-400" />
                <span className="text-sm">Clases</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <User size={16} className="text-slate-400" />
                <span className="text-sm">Instructores</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Users size={16} className="text-slate-400" />
                <span className="text-sm"><BtnLink link="estudiantes" title="Estudiantes" /></span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <FilePlus size={16} className="text-slate-400" />
                <span className="text-sm">Preinscripciones</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <CreditCard size={16} className="text-slate-400" />
                <span className="text-sm">Matrículas</span>
              </div>
            </div>
          )}
        </div>

        {/* Ventas: pedidos / ventas */} 
        <div>
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#0f3b82] hover:bg-opacity-10 rounded-lg transition"
            onClick={() => toggleModule("ventas")}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-slate-300" />
              <span className="font-bold text-sm">Ventas</span>
            </div>
          </div>
          {openModule === "ventas" && (
            <div className="ml-6 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <ShoppingCart size={16} className="text-slate-400" />
                <span className="text-sm"><BtnLink link="pedidos" title="Pedidos" /></span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <ShoppingCart size={16} className="text-slate-400" />
                <span className="text-sm"><BtnLink link="ventas" title="Ventas" /></span>
              </div>
            </div>
          )}
        </div>

        {/* Configuración (al final) */} 
        <div>
          <div
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#0f3b82] hover:bg-opacity-10 rounded-lg transition"
            onClick={() => toggleModule("config")}
          >
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-slate-300" />
              <span className="font-bold text-sm">Configuración</span>
            </div>
          </div>
          {openModule === "config" && (
            <div className="ml-6 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Users size={16} className="text-slate-400" />
                <span className="text-sm">Usuarios</span>
              </div>
              <div className="flex items-center gap-2 hover:text-[#9fc5ff] transition">
                <Shield size={16} className="text-slate-400" />
                <span className="text-sm">Roles</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="mt-auto pt-6">
        <button className="flex items-center gap-3 w-full p-3 bg-transparent border border-slate-700 text-slate-200 rounded-xl hover:bg-[#09243d] transition">
          <LogOut size={18} />
          <span className="font-bold text-sm">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

