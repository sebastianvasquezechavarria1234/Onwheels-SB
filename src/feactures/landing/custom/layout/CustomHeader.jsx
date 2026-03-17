import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, ChevronRight, LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
// Corregido: CartContext está en src/context/CartContext.jsx
import { useCart } from "../../../../context/CartContext";
import { UserDropdown } from "../../components/UserDropdown";
import { motion, AnimatePresence } from "framer-motion";

export const CustomHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { cart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartItems = Array.isArray(cart) ? cart : (Array.isArray(cart?.items) ? cart.items : []);
  const totalItems = cartItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);

  const navLinks = [
    { name: "Inicio", path: "/custom/home" },
    { name: "Tienda", path: "/custom/store" },
    { name: "Eventos", path: "/custom/events" },
    { name: "Nosotros", path: "/custom/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled ? "py-3 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/custom/home" className="group flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center transform group-hover:rotate-[360deg] transition-all duration-700 shadow-lg shadow-white/10">
              <span className="text-black font-black text-xl italic tracking-tighter">SB</span>
            </div>
            <div className="absolute -inset-2 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white leading-none tracking-tighter whitespace-nowrap group-hover:text-blue-400 transition">
              Performance SB
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-white group py-2 ${
                location.pathname === link.path ? "text-white" : "text-gray-400"
              }`}
            >
              {link.name}
              <span
                className={`absolute bottom-0 left-0 h-[3px] bg-red-600 transition-all duration-300 ${
                  location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link
            to="/custom/cart"
            className="group relative p-2 text-white/70 hover:text-white transition-colors"
          >
            <ShoppingCart size={22} strokeWidth={2.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group flex items-center gap-4">
               {/* Dashboard Link for Custom Roles */}
               <Link
                to="/custom/dashboard"
                className="hidden xl:flex items-center gap-2 bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <UserDropdown />
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-3 bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
            >
              <LogIn size={14} />
              Acceso
            </Link>
          )}

          <button
            className="lg:hidden p-2 text-white/70 active:text-white transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-4 border-b border-white/5 text-sm font-black uppercase tracking-widest transition ${
                    location.pathname === link.path ? "text-red-600" : "text-white"
                  }`}
                >
                  {link.name}
                  <ChevronRight size={16} className="opacity-50" />
                </Link>
              ))}
              
              {user && (
                <Link
                  to="/custom/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-white/5 text-sm font-black uppercase tracking-widest text-purple-400"
                >
                  Dashboard
                  <LayoutDashboard size={16} className="opacity-50" />
                </Link>
              )}

              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em]"
                >
                  <LogIn size={16} />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
