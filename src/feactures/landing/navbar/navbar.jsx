import { ShoppingCart, User } from "lucide-react";
import React from "react";

const Navbar = () => {
    <>
    <nav className="bg-white shadow-md">
<div className="container mx-auto flex items-center justify-between p-4">
    <h1 className="text-xl font-bold text-purple-800">Owheels SB</h1>
     
     <ul className="hidden md:flex gap-6 text-gray-700">
            <li><a href="#" className="hover:text-purple-600">Inicio</a></li>
            <li><a href="#" className="hover:text-purple-600">Eventos</a></li>
            <li><a href="#" className="hover:text-purple-600">Clases</a></li>
            <li><a href="#" className="hover:text-purple-600">Tienda</a></li>
          </ul>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 border px-3 py-2 rounded-lg">
              <User size={18}/> Mi cuenta
            </button>
            <button className="flex items-center gap-2 border px-3 py-2 rounded-lg">
              <ShoppingCart size={18}/> Carrito
            </button>
          </div>
        </div>
      </nav>
      </>
}
export default Navbar;