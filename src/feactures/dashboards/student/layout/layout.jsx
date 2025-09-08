import React from "react";
import Sidebar from "./sideBar";
const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-50 p-[30px] h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
