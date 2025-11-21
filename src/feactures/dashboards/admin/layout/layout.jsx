  import React, { useEffect, useState } from "react";
  import '../../hooks/dashboard.css'

  import { motion } from "framer-motion";
  import { BtnSideBar } from "../../BtnSideBar";
  import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";
  import { ArrowLeft, Calendar, ChartBarIncreasing, LayoutDashboard, MapPinHouse, School, Settings, Shield, Shirt, ShoppingBag, User, UserPlus, Users, X } from "lucide-react";

  export const Layout = ({ children }) => {
    const [, setNow] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setNow(new Date()), 1000); // actualiza cada segundo
      return () => clearInterval(timer);
    }, []);

    

    

    return (
      <main
        className="relative w-full h-screen flex gap-[10px] overflow-hidden"
        style={{ perspective: "1200px" }}
      >
        {/* Sidebar */}
        <nav className=" h-full w-[20%] p-[30px] border-r pb-[10px] border-black/20  z-10 max-2xl:p-[15px] ">
          <h2 className="mb-[20px] border-b pb-[30px] border-black/20 font-primary max-2xl:pb-[15px] dashboard__title">
            Admin
          </h2>
          <div className="sidebar flex flex-col justify-between  overflow-y-scroll h-[85%]">
            <li>
              <BtnSideBar title="Dashboard" link="../admin/dashboard">
                <LayoutDashboard size={20} strokeWidth={1.5} />
              </BtnSideBar>
            </li>
            {/* configuracion */}
            <h4 className="font-primary mb-[10px]">Configuración:</h4>
            <ul className="pl-[0px]">
              <li>
                <BtnSideBar title="Usuarios" link="../admin/users">
                  <Users size={20} strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Roles" link="../admin/roles">
                  <Shield size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
            </ul>


            {/* compras */}
            <h4 className="font-primary mb-[10px]">Compras:</h4>
            <ul className="pl-[0px]">
              <li>
                <BtnSideBar title="Productos" link="../admin/products">
                  <Shirt size={20} strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Categoria de productos" link="../admin/categoriasProductos">
                  <ChartBarIncreasing size={20} className="text-black/80" strokeWidth={1.8} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Proveedores" link="../admin/proveedores">
                  <Users size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Compras" link="../admin/compras">
                  <ShoppingBag size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
            </ul>
            {/* eventos */}
            <h4 className="font-primary mb-[10px]">Eventos:</h4>
            <ul className="pl-[0px]">
              <li>
                <BtnSideBar title="Eventos" link="../admin/eventos">
                  <Calendar size={20} strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Categoria de eventos" link="../admin/categoriasEventos">
                  <ChartBarIncreasing size={20} className="text-black/80" strokeWidth={1.8} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Sedes" link="../admin/sedes">
                  <MapPinHouse size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Patrocinadores" link="../admin/patrocinadores">
                  <Users size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
            </ul>

            {/* clases */}
            <h4 className="font-primary mb-[10px]">Clases:</h4>
            <ul className="pl-[0px]">
              <li>
                <BtnSideBar title="Clases" link="../admin/clases">
                  <Calendar size={20} strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Niveles de clases" link="../admin/classLevels">
                  <ChartBarIncreasing size={20} className="text-black/80" strokeWidth={1.8} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="PreInscrpciones" link="../admin/preRegistrations">
                  <UserPlus size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Matriculas" link="../admin/matriculas">
                  <Users size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
              <li>
                <BtnSideBar title="Planes" link="../admin/plans">
                  <Users size={20} className="text-black/80" strokeWidth={1.5} />
                </BtnSideBar>
              </li>
            </ul>

            {/* Footer */}
            <ul className="bottom-0 bg-gray-100 p-[20px] rounded-[30px] border-1 border-black/10 max-2xl:p-[15px]">
              <div className="flex flex-col gap-[10px] mb-[10px]">
                {/* <p className="text-sm capitalize">{dateStr}</p>
                <p className="flex gap-[10px] items-center">
                  <span className="w-[10px] h-[10px] block bg-green-600 rounded-full"></span>
                  {timeStr}
                </p> */}
              </div>
              <BtnLinkIcon
                title="Cerrar Dashboard"
                style="bg-[var(--color-blue)]! text-white pr-[25px] w-full"
                styleIcon="bg-white!"
              >
                <ArrowLeft className="text-[var(--color-blue)]" strokeWidth={2} />
              </BtnLinkIcon>

            </ul>

          </div>
        </nav>

        {/* Contenido animado con entrada y salida mejoradas */}
        <motion.section
          className="w-[80%] hide-scrollbar"
          initial={{
            opacity: 0,
            scale: 0.3,
            rotateX: -45,
            rotateY: 10,
            filter: "blur(20px)",
            transformOrigin: "center center",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            filter: "blur(0px)",
          }}
          transition={{
            delay: 0.1,
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            height: "100%",
            overflowY: "auto",
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </motion.section>
      </main>
    );
  };
