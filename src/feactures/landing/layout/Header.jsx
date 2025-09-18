import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart, User, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { BtnLink } from "../components/BtnLink";

// Header con modal (sheet) pulido y sin errores
export const Header = () => {
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef(null);
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

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
    { title: "Inicio", to: "/" },
    { title: "Tienda", to: "/store" },
    { title: "Clases", to: "/class" },
    { title: "Eventos", to: "/events" },
    { title: "Pre-inscripciones", to: "/preinscriptions" },
    { title: "Sobre nosotros", to: "/about" },
  ];

  return (
    <header className="w-full flex justify-center fixed z-50 text-white">
      <nav className="flex items-center justify-between w-full bg-[var(--color-blue)] backdrop-blur-[16px] p-[5px]">
        <ul className="flex gap-[20px] items-center">
          <li>
            <Link to="/">
              <h4 className="font-primary text-[30px]! px-4 max-lg:text-[18px]! max-lg:px-[10px]">
                Onwheels-SB
              </h4>
            </Link>
          </li>

          {items.map((it) => (
            <li key={it.to} className="max-xl:hidden">
              <BtnLink link={it.to + "#"} title={it.title} />
            </li>
          ))}
        </ul>

        <ul className="flex gap-[5px] items-center">
          <li>
            <BtnLinkIcon
              title="Carrito de compras"
              link="../shoppingCart"
              style="bg-[transparent]! text-white! max-xl:hidden"
              styleIcon="bg-white!"
            >
              <ShoppingCart color="black" strokeWidth={1.5} size={20} />
            </BtnLinkIcon>
          </li>

          <li>
            <BtnLinkIcon
              title="Iniciar sesión"
              link="../login#"
              style="max-lg:bg-[transparent]! max-lg:text-white!"
              styleIcon="max-xl:bg-white!"
            >
              <User className="text-white max-xl:text-black" strokeWidth={1.5} size={20} />
            </BtnLinkIcon>
          </li>

          {/* Botón de menú (usando button nativo para asegurar onClick) */}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Abrir menú"
              title="Menu"
              className="hidden! max-xl:flex! items-center gap-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              <User className="text-white max-xl:text-black" strokeWidth={1.5} size={20} />
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence initial={false}>
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

            {/* sheet/modal container (z-50) */}
            <motion.div
              className="fixed left-0 right-0 top-6 z-50 mx-auto max-w-[900px] px-4"
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                ref={modalRef}
                className="relative rounded-2xl bg-white/95 text-black shadow-2xl p-6 ring-1 ring-black/6"
                variants={sheetVariants}
                role="dialog"
                aria-modal="true"
                aria-label="Menú principal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-primary text-xl">Menú</h3>
                  <div className="flex items-center gap-2">
                    <BtnLinkIcon title="Carrito" link="../shoppingCart" style="hidden! max-xl:flex!" styleIcon="bg-white!">
                      <ShoppingCart color="black" strokeWidth={1.5} size={18} />
                    </BtnLinkIcon>

                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={() => setOpen(false)}
                      className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black/40"
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
                          className="block rounded-lg px-4 py-3 hover:bg-black/5 transition-all"
                        >
                          {it.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-6 flex items-center gap-3 justify-end">
                  <BtnLink link="../login#" title="Iniciar sesión" />
                  <BtnLink link="../store#" title="Tienda" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
