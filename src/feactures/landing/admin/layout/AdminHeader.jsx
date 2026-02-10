"use client"

import { useEffect, useRef, useState } from "react"
import { LogOut, Menu, ShoppingCart, User, X, LayoutDashboard } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { BtnLinkIcon } from "../../components/BtnLinkIcon"
import { BtnLink } from "../../components/BtnLink"

// Header para Admin con botón destacado de Dashboard
export const AdminHeader = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const firstLinkRef = useRef(null)
  const closeButtonRef = useRef(null)
  const modalRef = useRef(null)
  const navigate = useNavigate()

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Bloqueo de scroll cuando modal abierto
    document.body.style.overflow = open ? "hidden" : ""

    // foco automático al abrir
    if (open) {
      const t = setTimeout(() => {
        firstLinkRef.current?.focus()
      }, 120)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if (!open) return
      if (e.key === "Escape") {
        setOpen(false)
        return
      }

      // Simple focus trap: si el modal está abierto, cicla entre primer link y el botón cerrar
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const handleLogout = () => {
    // Eliminar token y usuario del localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Redirigir a login
    navigate("/login")
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const sheetVariants = {
    hidden: { y: -20, opacity: 0, scale: 0.99 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: { y: -12, opacity: 0, transition: { duration: 0.16 } },
  }

  const items = [
    { title: "Inicio", to: "/admin/home" },
    { title: "Tienda", to: "/admin/store" },
    { title: "Clases", to: "/admin/class" },
    { title: "Eventos", to: "/admin/events" },
    { title: "Sobre nosotros", to: "/admin/about" },
  ]

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 pb-2 px-4 transition-all duration-300 pointer-events-none"
    >
      <nav
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
        <ul className="flex gap-[20px] items-center">
          <li>
            <Link to="/">
              <h4 className={`font-primary transition-all duration-300 px-4 ${scrolled ? "text-[18px]" : "text-[30px] max-lg:text-[18px] max-lg:px-[10px]"}`}>
                Performance-SB admin
              </h4>
            </Link>
          </li>

          {items.map((it) => (
            <li key={it.to} className="max-xl:hidden">
              <BtnLink
                link={it.to + "#"}
                title={it.title}
                className={`transition-all duration-300 ${scrolled ? 'text-xs' : 'text-sm'}`}
              />
            </li>
          ))}
        </ul>

        <ul className="flex gap-[5px] items-center">
          {/* BOTON DASHBOARD DESTACADO - Exclusivo del admin */}
          <li>
            <Link
              to="/admin/dashboard"
              title="Ir al Dashboard"
              className={`cursor-pointer bg-emerald-200 text-emerald-700 inline-flex items-center rounded-full gap-[8px] hover:bg-emerald-300 transition-colors max-xl:hidden ${scrolled ? 'p-[2px_10px_2px_2px]' : 'p-[3px_13px_3px_3px]'}`}
              aria-label="Ir al Dashboard"
            >
              <div className={`flex justify-center items-center bg-emerald-600 rounded-full transition-all duration-300 ${scrolled ? "w-[35px] h-[35px]" : "w-[60px] h-[60px] max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[30px] max-md:h-[30px]"}`}>
                <LayoutDashboard color="white" strokeWidth={1.8} size={scrolled ? 16 : 20} />
              </div>

            </Link>
          </li>

          <li>
            <BtnLinkIcon
              title=""
              link="../admin/shoppingCart"
              style="bg-[transparent]! text-white! max-xl:hidden"
              styleIcon="bg-white!"
            >
              <ShoppingCart color="black" strokeWidth={1.5} size={scrolled ? 18 : 20} className="transition-all" />
            </BtnLinkIcon>
          </li>

          <li>
            <BtnLinkIcon
              link="../admin/profile"
              style="bg-[transparent]! text-white! max-xl:hidden"
              styleIcon="bg-white!"
            >
              <User className="text-black transition-all" strokeWidth={1.8} size={scrolled ? 18 : 20} />
            </BtnLinkIcon>
          </li>

          <li>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className={`cursor-pointer bg-red-200 text-red-700 inline-flex items-center rounded-full gap-[8px] transition-all ${scrolled ? 'p-[2px_10px_2px_2px]' : 'p-[3px_13px_3px_3px]'}`}
              aria-label="Cerrar sesión"
            >
              <div className={`flex justify-center items-center bg-red-600 rounded-full transition-all duration-300 ${scrolled ? "w-[35px] h-[35px]" : "w-[60px] h-[60px] max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[30px] max-md:h-[30px]"}`}>
                <LogOut color="white" strokeWidth={1.8} size={scrolled ? 16 : 20} />
              </div>
              {/* <p>Cerrar sesión</p> */}
            </button>
          </li>

          {/* Botón de menú móvil */}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-label="Abrir menú"
              title="Menu"
              className="hidden! max-xl:flex! bg-white p-[1px_8px_1px_1px] rounded-full justify-center items-center gap-[3px] cursor-pointer"
            >
              <span className={`flex justify-center items-center bg-[var(--color-blue)] rounded-full transition-all duration-300 ${scrolled ? "w-[35px] h-[35px]" : "w-[60px] h-[60px] max-2xl:w-[45px] max-2xl:h-[45px] max-md:w-[30px] max-md:h-[30px]"}`}>
                <Menu className="text-white" strokeWidth={1.5} size={scrolled ? 16 : 20} />
              </span>
              <h4 className={`text-black transition-all ${scrolled ? "text-xs" : ""}`}>Menu</h4>
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
              variants={sheetVariants}
            >
              <motion.div
                ref={modalRef}
                className="relative rounded-2xl bg-white/95 text-black shadow-2xl p-6 ring-1 ring-black/6"
                role="dialog"
                aria-modal="true"
                aria-label="Menú principal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-primary text-xl">Menú</h3>
                  <div className="flex items-center gap-2">
                    <BtnLinkIcon
                      title="Carrito"
                      link="../admin/shoppingCart"
                      style="hidden! max-xl:flex! border-1 border-black/10 "
                      styleIcon="bg-white!"
                    >
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
                    {/* Opción Dashboard en el modal móvil */}
                    <li>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setOpen(false)}
                        className="text-[14px]! italic py-[5px] block font-semibold text-emerald-600"
                      >
                        Dashboard (Administración)
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/profile"
                        onClick={() => setOpen(false)}
                        className="text-[14px]! italic py-[5px] block"
                      >
                        Mi Perfil
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/purchases"
                        onClick={() => setOpen(false)}
                        className="text-[14px]! italic py-[5px] block"
                      >
                        Mis Compras
                      </Link>
                    </li>
                  </ul>
                </nav>

                <div className="mt-6 flex items-center gap-3 justify-end">
                  {/* BOTÓN DE CERRAR SESIÓN EN EL MODAL */}
                  <button
                    onClick={() => {
                      handleLogout()
                      setOpen(false)
                    }}
                    className="bg-[var(--color-blue)] text-white px-4 py-2 rounded-lg text-[14px] hover:bg-blue-700 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                  <BtnLink link="../admin/store#" style="text-[14px]!" title="Tienda" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
