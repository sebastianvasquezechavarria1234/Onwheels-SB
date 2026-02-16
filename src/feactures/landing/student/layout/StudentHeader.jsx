import React, { useEffect, useRef, useState } from "react";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BtnLinkIcon } from "../../components/BtnLinkIcon";
import { BtnLink } from "../../components/BtnLink";

// Helper: wrapper para íconos con tooltip animado (blanco con texto negro y animación "pro")
const IconWithTooltip = ({ label, children, className = "", onClick }) => {
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
      {/* elemento visible (ícono / button / link) */}
      <motion.div
        onClick={onClick}
        aria-describedby={`tooltip-${label.replace(/\s+/g, "-")}`}
        className="flex items-center"
        initial="initial"
        animate={hover ? "hover" : "initial"}
        variants={popPulse}
      >
        {children}
      </motion.div>

      {/* tooltip animado blanco con texto negro y flecha encima del texto */}
      <AnimatePresence>
        {hover && (
          <motion.div
            key="tooltip"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tooltipVariants}
            role="status"
            aria-hidden={!hover}
            className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 whitespace-nowrap"
            style={{ pointerEvents: "none", perspective: 800 }}
          >
            <div className="inline-flex flex-col items-center">
              {/* Arrow (triángulo) ARRIBA del texto, pegado al cuadro */}
              <svg
                width="16"
                height="8"
                viewBox="0 0 16 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: -6 }} /* pega la flecha al cuadro del texto */
                aria-hidden="true"
              >
                <path d="M8 0 L16 8 H0 Z" fill="white" stroke="rgba(0,0,0,0.06)" strokeWidth="0.6" />
              </svg>

              {/* Texto un poco más gordito y en italic */}
              <div
                className="inline-block rounded-lg px-3 py-1.5 text-[13px] font-semibold italic shadow-[0_8px_30px_rgba(16,24,40,0.18)] bg-white text-black"
                style={{ minWidth: 96, textAlign: "center" }}
              >
                {label}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Header con estilos basados en el header de ejemplo (flotante, contenedor redondeado centrado)
export const StudentHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // solo para efecto visual como en el ejemplo
  const firstLinkRef = useRef(null);
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Bloqueo de scroll cuando modal abierto
    document.body.style.overflow = open ? "hidden" : "";

    // foco automático al abrir
    if (open) {
      const t = setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      // Simple focus trap: si el modal está abierto, cicla entre primer link y el botón cerrar
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = () => {
    // Eliminar token y usuario del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirigir a login
    navigate("/login");
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const sheetVariants = {
    hidden: { y: -20, opacity: 0, scale: 0.99 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { y: -12, opacity: 0, transition: { duration: 0.16 } },
  };

  const items = [
    { title: "Inicio", to: "/student/home" },
    { title: "Tienda", to: "/student/store" },
    { title: "Formacion", to: "/student/training" },
    { title: "Eventos", to: "/student/events" },
    { title: "Sobre nosotros", to: "/student/abaut" },
  ];

  return (
    <>
      {/* HEADER FLOTANTE - estilo igual al ejemplo */}
      <motion.header
        className="top-0 left-0 right-0 z-[100] flex justify-center pt-4 pb-2 px-4 pointer-events-none sticky top-0 mb-[-120px]"
        style={{ perspective: "1200px" }}
      >
        <div
          className={`
            flex items-center justify-between px-3 py-1 rounded-full
            backdrop-blur-xl pointer-events-auto transition-all duration-500 ease-in-out
            ${scrolled
              ? "bg-black/80 border border-white/10 shadow-2xl w-[95%] md:w-[80%] lg:w-[60%] max-w-[1400px] mx-auto"
              : "bg-black/40 border border-white/5 w-full max-w-[1400px]"
            }
          `}
        >
          {/* LOGO */}
          <Link to="../student/home" className="flex items-center gap-2">
            <div className="w-[50px] h-[50px] bg-white rounded-full overflow-hidden border-2 border-[var(--color-blue)]">
              <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg uppercase tracking-tighter text-white">
              Performance SB
            </span>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-6">
            {items.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="group relative text-xs font-bold uppercase tracking-widest text-white/90"
              >
                {it.title}
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
                link="../student/shoppingCart"
                style="bg-transparent text-white p-[1px_1px_1px_1px]! gap-[0px]! rounded-full overflow-hidden"
              >
                <ShoppingCart size={18} />
              </BtnLinkIcon>
            </IconWithTooltip>

            <IconWithTooltip label="Mi perfil">
              <BtnLinkIcon
                title=""
                link="../student/setting"
                style="bg-transparent text-white p-[1px_1px_1px_1px]! gap-[0px]! rounded-full overflow-hidden"
              >
                <User size={18} />
              </BtnLinkIcon>
            </IconWithTooltip>

            <IconWithTooltip label="Cerrar sesión">
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="w-[60px] cursor-pointer h-[60px] bg-red-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform max-2xl:w-[45px]! max-2xl:h-[45px]! max-xld:w-[30px]! max-md:h-[30px]!"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} color="white" />
              </button>
            </IconWithTooltip>

            {/* Botón de menú móvil */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden text-white p-2"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MENÚ / SHEET - MOBILE (estilo acorde al ejemplo: drawer/full overlay) */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay (z-40) */}
            <motion.div
              className="fixed inset-0 z-40"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
            </motion.div>

            {/* drawer desde la derecha, centrado en pantalla (similar al menú móvil del ejemplo) */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.28 }}
            >
              <motion.div
                ref={modalRef}
                className="relative w-full max-w-[900px] rounded-2xl bg-white/95 text-black shadow-2xl p-6 ring-1 ring-black/6"
                variants={sheetVariants}
                role="dialog"
                aria-modal="true"
                aria-label="Menú principal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-primary text-xl">Menú</h3>
                  <div className="flex items-center gap-2">
                    <BtnLinkIcon title="Carrito" link="../student/shoppingCart" style="hidden! max-xl:flex! border-1 border-black/10 " styleIcon="bg-white!">
                      <ShoppingCart color="black" strokeWidth={1.5} size={18} />
                    </BtnLinkIcon>

                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-[35px] h-[35px] cursor-pointer rounded-full flex justify-center items-center border-1 border-black/10  bg-white"
                      aria-label="Cerrar menú"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <nav>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {items.map((it, idx) => (
                      <li key={it.to}>
                        <Link
                          to={it.to}
                          onClick={() => setOpen(false)}
                          ref={idx === 0 ? firstLinkRef : null}
                          className="text-[18px] font-bold italic py-[8px] block"
                        >
                          {it.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-6 flex items-center gap-3 justify-end">
                  {/* BOTÓN DE CERRAR SESIÓN EN EL MODAL CON ESTILOS CONSISTENTES */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="bg-[var(--color-blue)] text-white px-4 py-2 rounded-lg text-[14px] hover:bg-blue-700 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                  <BtnLink link="../student/store#" style="text-[14px]!" title="Tienda" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
