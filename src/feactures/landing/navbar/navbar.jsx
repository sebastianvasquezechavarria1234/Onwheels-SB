import { ShoppingCart, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
    <>
    <nav className="bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-purple-800">Owheels SB</h1>
             
             <ul className="hidden md:flex gap-6 text-gray-700">
                    <li><Link to="/" className="hover:text-purple-600">Inicio</Link></li>
                    <li><Link to="/events" className="hover:text-purple-600">Eventos</Link></li>
                    <li><Link to="/training" className="hover:text-purple-600">Clases</Link></li>
                    <li><Link to="/store" className="hover:text-purple-600">Tienda</Link></li>
                  </ul>

                  <div className="flex gap-3">
                    <Link to="/login" className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-50">
                      <User size={18}/> Mi cuenta
                    </Link>
                    <Link to="/shoppingCart" className="flex items-center gap-2 border px-3 py-2 rounded-lg hover:bg-gray-50">
                      <ShoppingCart size={18}/> Carrito
                    </Link>
                  </div>
                </div>
              </nav>
      </>
)
export default Navbar;