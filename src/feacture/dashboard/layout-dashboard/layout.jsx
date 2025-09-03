import React from "react";
import Sidebar from "./sidebar";
const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
