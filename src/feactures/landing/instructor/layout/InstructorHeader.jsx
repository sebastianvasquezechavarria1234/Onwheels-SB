import React, { useEffect, useRef, useState } from "react";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BtnLinkIcon } from "../../components/BtnLinkIcon";
import { BtnLink } from "../../components/BtnLink";

// Header con modal (sheet) pulido y sin errores
export const InstructorHeader = () => {
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef(null);
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirigir a login
    navigate('/login');
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
    { title: "Inicio", to: "/instructor/home" },
    { title: "Tienda", to: "/instructor/store" },
    { title: "Clases", to: "/instructor/class" },
    { title: "Eventos", to: "/instructor/events" },
    { title: "Sobre nosotros", to: "/instructor/abaut" },
  ];

  return (
    <header className="w-full flex justify-center fixed z-50 text-white">
      <nav className="flex items-center justify-between w-full bg-[var(--color-blue)] backdrop-blur-[16px] p-[5px]">
        <ul className="flex gap-[20px] items-center">
          <li>
            <Link to="/">
              <h4 className="font-primary text-[30px]! px-4 max-lg:text-[18px]! max-lg:px-[10px]">
                Performance-SB intructor
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
              link="../instructor/shoppingCart"
              style="bg-[transparent]! text-white! max-xl:hidden"
              styleIcon="bg-white!"
            >
              <ShoppingCart color="black" strokeWidth={1.5} size={20} />
            </BtnLinkIcon>
          </li>

          {/* BOTÓN DE CERRAR SESIÓN CON LOS ESTILOS ORIGINALES */}

          <li>
            <BtnLinkIcon
              title="Mi cuenta"
              link="../instructor/setting"
              style="bg-[transparent]! text-white! max-xl:hidden"
              styleIcon="bg-white!"
            >
              <User className="text-black" strokeWidth={1.8} size={20} />
            </BtnLinkIcon>
          </li>

          <li>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="cursor-pointer bg-red-200 text-red-700 inline-flex items-center rounded-full gap-[8px] p-[3px_13px_3px_3px] max-2xl:p-[2px_13px_2px_2px] max-2xl:p-12px_11px_1px_1px]"
              aria-label="Cerrar sesión"
            >
              <div className=" w-[60px] h-[60px] flex justify-center items-center bg-red-600 rounded-full max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[30px] max-md:h-[30px]">
                <LogOut color="white" strokeWidth={1.8} size={20} />
              </div>
              <p>Cerrar seccion</p>
            </button>
          </li>


          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Abrir menú"
              title="Menu"
              className="hidden! max-xl:flex! bg-white p-[1px_8px_1px_1px] rounded-full justify-center items-center gap-[3px] cursor-pointer"
            >
              <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[30px] max-md:h-[30px]">
                <Menu className="text-white" strokeWidth={1.5} size={20} />
              </span>
              <h4 className="text-black">Menu</h4>
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
              className="fixed left-0 right-0 top-[20px] z-50 mx-auto max-w-[900px] px-4"
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
                    <BtnLinkIcon title="Carrito" link="../shoppingCart" style="hidden! max-xl:flex! border-1 border-black/10 " styleIcon="bg-white!">
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
                          className="text-[14px]! italic py-[5px] block"
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
                  <BtnLink link="../store#" style="text-[14px]!" title="Tienda" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
