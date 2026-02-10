
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { BtnLinkIcon } from "../components/BtnLinkIcon";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Detect Scroll for Floating/Accordion Effect
  useEffect(() => {
    const handleScroll = () => {
      // Trigger effect earlier for smoother response
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Inicio", path: "/" },
    { title: "Tienda", path: "/store" },
    { title: "Clases", path: "/training" },
    { title: "Eventos", path: "/events" },
  ];

  return (
    <>
      {/* Navbar container - Fixed */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 pb-2 px-4 transition-all duration-300 pointer-events-none"
      >
        <div
          className={`
            flex items-center justify-between px-6 py-2 rounded-full 
            backdrop-blur-xl pointer-events-auto transition-all duration-500 ease-in-out
            w-[95%] max-w-[1400px]
            ${scrolled
              ? "bg-black/80 border border-white/10 shadow-2xl"
              : "bg-black/40 border border-white/5"
            }
          `}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`
              overflow-hidden transition-all duration-500 border-2 border-[var(--color-blue)]
              ${scrolled ? "w-8 h-8 rounded-full" : "w-10 h-10 rounded-full"}
            `}>
              <img src="/logo.png" alt="OW" className="w-full h-full object-cover" />
            </div>
            <span className={`font-bold uppercase tracking-tighter transition-all duration-500 ${scrolled ? 'text-sm text-white' : 'text-lg text-white'}`}>
              OnWheels
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs font-bold hover:text-[var(--color-blue)] transition-colors uppercase tracking-widest text-white/90 relative group"
              >
                {link.title}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-blue)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <BtnLinkIcon
              title="Carrito"
              link="/shoppingCart"
              style={`transition-all duration-300 hover:text-[var(--color-blue)] text-white ${scrolled ? 'p-1.5' : 'p-2'}`}
              icon={<ShoppingCart size={scrolled ? 18 : 20} />}
            >
              <ShoppingCart size={scrolled ? 18 : 20} />
            </BtnLinkIcon>

            <Link
              to="/login"
              className={`
                bg-white text-black font-bold hover:bg-[var(--color-blue)] hover:text-white transition-all uppercase
                ${scrolled ? "px-5 py-2 text-[10px]" : "px-6 py-2.5 text-xs"}
                rounded-full shadow-lg hover:shadow-[var(--color-blue)]/50
              `}
            >
              Ingresar
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-white p-1"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center h-screen w-screen"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white p-2 border border-white/20 rounded-full hover:bg-white/10 hover:rotate-90 transition-all duration-300"
            >
              <X size={30} />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-bold text-white hover:text-[var(--color-blue)] transition-all uppercase tracking-tighter hover:scale-110"
                >
                  {link.title}
                </Link>
              ))}
              <Link
                to="/preinscriptions"
                onClick={() => setIsOpen(false)}
                className="mt-8 px-10 py-4 bg-[var(--color-blue)] rounded-full text-white text-xl font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(var(--color-blue-rgb),0.5)] hover:shadow-[0_0_40px_rgba(var(--color-blue-rgb),0.7)] transition-all"
              >
                Unirse
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
