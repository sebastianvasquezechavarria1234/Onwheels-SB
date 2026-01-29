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
    <div className="w-64 h-screen bg-white shadow-md flex flex-col p-4">
      {/* Contenedor con espacio entre módulos */}
      <div className="flex flex-col space-y-4">
        {/* Dashboard */}
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>

        {/* Configuración */}
        <div>
          <div
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 rounded-md"
            onClick={() => toggleModule("config")}
          >
            <div className="flex items-center gap-3">
              <Shield size={20} />
              <span>Configuración</span>
            </div>
          </div>
          {openModule === "config" && (
            <div className="ml-8 mt-2 space-y-3">
              <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <Users size={18} />
                <span>Usuarios</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                <Shield size={18} />
                <span>Roles</span>
              </div>
            </div>
          )}
        </div>

        {/* Compras */}
        <div>
          <div
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 rounded-md"
            onClick={() => toggleModule("compras")}
          >
            <div className="flex items-center gap-3">
              <Package size={20} />
              <span>Compras</span>
            </div>
          </div>
          {openModule === "compras" && (
            <div className="ml-8 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Tag size={18} />
                <span>Categorías productos</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Truck size={18} />
                <span>Proveedores</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Package size={18} />
                <span>  <BtnLink link="productos" title="Productos" /></span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <CreditCard size={18} />
                <span>Compras</span>
              </div>
            </div>
          )}
        </div>

        {/* Eventos */}
        <div>
          <div
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 rounded-md"
            onClick={() => toggleModule("eventos")}
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} />
              <span>Eventos</span>
            </div>
          </div>
          {openModule === "eventos" && (
            <div className="ml-8 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Layers size={18} />
                <span>Categorías eventos</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Handshake size={18} />
                <span>Patrocinadores</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <MapPin size={18} />
                <span>Sedes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Calendar size={18} />
                <span>Eventos</span>
              </div>
            </div>

          )}
        </div>

        {/* Clases */}
        <div>
          <div
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 rounded-md"
            onClick={() => toggleModule("clases")}
          >
            <div className="flex items-center gap-3">
              <GraduationCap size={20} />
              <span>Clases</span>
            </div>
          </div>
          {openModule === "clases" && (
            <div className="ml-8 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-blue-600">
                <ClipboardList size={18} />
                <span>Niveles de clases</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <BookOpen size={18} />
                <span>Clases</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <User size={18} />
                <span>Instructores</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <Users size={18} />

                <span> <BtnLink link="estudiantes" title="etudiantes" /></span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <FilePlus size={18} />
                <span>Preinscripciones</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <ClipboardList size={18} />
                <span>Planes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-600">
                <CreditCard size={18} />
                <span>Matrículas</span>
              </div>
            </div>
          )}
        </div>

        {/* Ventas */}
        <div>
          <div
            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 rounded-md"
            onClick={() => toggleModule("ventas")}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} />
              <span>Ventas</span>
            </div>
          </div>
          {openModule === "ventas" && (
            <div className="ml-8 mt-2 space-y-3">
              <div className="flex items-center gap-2 hover:text-blue-600">
                <ShoppingCart size={18} />
                <span><BtnLink link="ventas" title="Ventas" /></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="mt-auto pt-4">
        <button className="flex items-center  mb-15 gap-2 w-full p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

