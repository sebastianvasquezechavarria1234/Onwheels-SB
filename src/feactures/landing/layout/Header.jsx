
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { BtnLinkIcon } from "../components/BtnLinkIcon";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Detect Scroll for Floating Effect
  useEffect(() => {
    const handleScroll = () => {
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
      {/* Navbar container - Fixed full width */}
      <motion.header
        className=" top-0 left-0 right-0 z-[100] flex justify-center pt-4 pb-2 px-4 transition-all duration-300 pointer-events-none sticky top-0 mb-[-120px]"
        style={{ perspective: "1200px" }}
      >
        <div
          className={`
                        flex items-center justify-between px-6 py-2 rounded-full 
                        backdrop-blur-xl pointer-events-auto transition-all duration-500 ease-in-out
                        ${scrolled
              ? "bg-black/80 border border-white/10 shadow-2xl w-[95%] md:w-[80%] lg:w-[60%]"
              : "bg-black/40 border border-white/5 w-full max-w-[1400px]"
            }
                    `}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-blue)]">
              <img src="/logo.png" alt="OW" className="w-full h-full object-cover" />
            </div>
            <span className={`font-bold text-lg uppercase tracking-tighter ${scrolled ? 'text-white' : 'text-white'}`}>
              OnWheels
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs font-bold hover:text-[var(--color-blue)] transition-colors uppercase tracking-widest text-white/90"
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <BtnLinkIcon
              title="Carrito"
              link="/shoppingCart"
              style="bg-transparent hover:bg-white/10 text-white p-2 rounded-full transition"
              icon={<ShoppingCart size={18} />}
            >
              <ShoppingCart size={18} />
            </BtnLinkIcon>

            <Link
              to="/login"
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[var(--color-blue)] hover:text-white transition-all uppercase"
            >
              Ingresar
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-white p-2"
            >
              <Menu size={20} />
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center h-screen w-screen"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white p-2 border border-white/20 rounded-full hover:bg-white/10"
            >
              <X size={30} />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-bold text-white hover:text-[var(--color-blue)] transition-all uppercase tracking-tighter"
                >
                  {link.title}
                </Link>
              ))}
              <Link
                to="/preinscriptions"
                onClick={() => setIsOpen(false)}
                className="mt-8 px-8 py-4 bg-[var(--color-blue)] rounded-full text-white text-xl font-bold uppercase tracking-wide"
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
