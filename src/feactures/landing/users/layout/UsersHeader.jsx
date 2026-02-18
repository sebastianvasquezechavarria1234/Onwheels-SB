import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { BtnLinkIcon } from "../../components/BtnLinkIcon";

/* ================================
   TOOLTIP ANIMADO (EXACTO AL ORIGINAL)
================================ */
const IconWithTooltip = ({ label, children, className = "" }) => {
  const [hover, setHover] = useState(false);

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.9,
      rotateX: 18,
      transformPerspective: 800,
      transformOrigin: "50% 0%",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transformPerspective: 800,
      transformOrigin: "50% 0%",
      transition: {
        type: "spring",
        stiffness: 700,
        damping: 20,
        mass: 0.7,
      },
    },
    exit: {
      opacity: 0,
      y: -6,
      scale: 0.98,
      transition: { duration: 0.14, ease: "easeIn" },
    },
  };

  const popPulse = {
    initial: { scale: 1 },
    hover: { scale: 1.03, transition: { yoyo: Infinity, duration: 0.9 } },
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <motion.div
        className="flex items-center"
        initial="initial"
        animate={hover ? "hover" : "initial"}
        variants={popPulse}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tooltipVariants}
            className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 whitespace-nowrap"
            style={{ pointerEvents: "none", perspective: 800 }}
          >
            <div className="inline-flex flex-col items-center">
              {/* Flecha */}
              <svg
                width="16"
                height="8"
                viewBox="0 0 16 8"
                style={{ marginBottom: -6 }}
                aria-hidden="true"
              >
                <path
                  d="M8 0 L16 8 H0 Z"
                  fill="white"
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth="0.6"
                />
              </svg>

              {/* Texto */}
              <div className="rounded-lg px-3 py-1.5 text-[13px] font-semibold italic bg-white text-black shadow-[0_8px_30px_rgba(16,24,40,0.18)]">
                {label}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================================
   USERS HEADER (MISMO DISEÑO)
   CORRECCIÓN: evitar salto al scrollear
================================ */
export const UsersHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { title: "Inicio", path: "/users/home" },
    { title: "Pre-inscripciones", path: "/users/preinscriptions" },
    { title: "Tienda", path: "/users/store" },
    { title: "Clases", path: "/users/training" },
    { title: "Eventos", path: "/users/events" },
  ];

  return (
    <>
      {/* HEADER FLOTANTE */}
      <motion.header
        className="top-0 left-0 right-0 z-[100] flex justify-center pt-4 pb-2 px-4 pointer-events-none sticky top-0 mb-[-120px]"
        style={{ perspective: "1200px" }}
      >
        <div
          className={`
            flex items-center justify-between px-3 py-1 rounded-full
            backdrop-blur-xl pointer-events-auto transition-all duration-500 ease-in-out
            ${
              scrolled
                ? "bg-black/80 border border-white/10 shadow-2xl w-[95%] md:w-[80%] lg:w-[80%] max-w-[1400px] mx-auto"
                : "bg-black/40 border border-white/5 w-full max-w-[1400px]"
            }
          `}
        >
          {/* LOGO */}
          <Link to="/users/home" className="flex items-center gap-2">
            <div className="w-[50px] h-[50px] bg-white rounded-full overflow-hidden border-2 border-[var(--color-blue)]">
              <img
                src="/logo.png"
                alt="logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-lg uppercase tracking-tighter text-white">
              Performance SB
            </span>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group relative text-xs font-bold uppercase tracking-widest text-white/90"
              >
                {link.title}

                <span
                  className="
      absolute left-0 top-[110%]
      block h-[1px] w-full
      bg-white
      opacity-0
      transition-opacity duration-300
      group-hover:opacity-100
    "
                />
              </Link>
            ))}
          </nav>

          {/* ACCIONES */}
          <div className="flex items-center gap-2">
            <IconWithTooltip label="Carrito de compras">
              <BtnLinkIcon
                title=""
                link="/users/shoppingCart"
                style="bg-transparent
                     
                      text-white
                      gap-[0px]!
                      p-[1px_1px_1px_1px]! 
                      
                      rounded-full
                      overflow-hidden"
              >
                <ShoppingCart size={18} />
              </BtnLinkIcon>
            </IconWithTooltip>

            <IconWithTooltip label="Mi cuenta">
              <BtnLinkIcon
                title=""
                link="/users/setting"
                style="bg-transparent
                     
                      text-white
                      gap-[0px]!
                      p-[1px_1px_1px_1px]! 
                      
                      rounded-full
                      overflow-hidden"
              >
                <User size={18} />
              </BtnLinkIcon>
            </IconWithTooltip>

            <IconWithTooltip label="Cerrar sesión">
              <button
                onClick={handleLogout}
                className="w-[60px] cursor-pointer h-[60px] bg-red-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} color="white" />
              </button>
            </IconWithTooltip>

            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-white p-2"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MENÚ MOBILE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white p-2 border border-white/20 rounded-full"
              aria-label="Cerrar menú"
            >
              <X size={30} />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-bold uppercase text-white hover:text-[var(--color-blue)]"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
