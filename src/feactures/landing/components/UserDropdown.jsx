import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ShoppingBag, BookOpen, LayoutDashboard, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { getProfilePath, getPurchasesPath, getUserRoleSlug } from "../../../utils/roleHelpers";

export const UserDropdown = ({ isScrolled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (logout) {
            logout();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
        setIsOpen(false);
    };

    const roleSlug = getUserRoleSlug(user);
    const profilePath = getProfilePath(user);
    const purchasesPath = getPurchasesPath(user);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const menuOptions = [
        {
            label: "Área Administrativa",
            icon: <LayoutDashboard size={16} />,
            path: roleSlug === 'admin' ? '/admin/dashboard' : '/custom/dashboard',
            show: roleSlug === "admin" || roleSlug === "custom",
        },
        {
            label: "Mi Perfil",
            icon: <User size={16} />,
            path: profilePath,
            show: roleSlug !== "store",
        },
        {
            label: "Mis Compras",
            icon: <ShoppingBag size={16} />,
            path: purchasesPath,
            show: roleSlug !== "store",
        },
        {
            label: "Mis Clases",
            icon: <BookOpen size={16} />,
            path: `/${roleSlug}/myClasses`,
            show: roleSlug === "student" || roleSlug === "instructor",
        },
    ];

    const userInitial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U";

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden border-2
          ${isOpen ? "ring-2 ring-[#3b82f6] border-[#3b82f6]" : "border-white/10 hover:border-white/40"}
          bg-[#121821] text-white
        `}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {user?.foto_perfil ? (
                    <img src={user.foto_perfil} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-black text-[#3b82f6]">{userInitial}</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#121821] border border-gray-800 shadow-2xl overflow-hidden z-[500]"
                    >
                        {/* Cabecera del Dropdown */}
                        <div className="px-5 py-4 border-b border-gray-800 bg-[#0B0F14] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 bg-[#121821] flex items-center justify-center shadow-inner">
                                {user?.foto_perfil ? (
                                    <img src={user.foto_perfil} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-[#3b82f6]">{userInitial}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white truncate uppercase tracking-tight">
                                    {user?.nombre} {user?.apellido}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Star size={10} className="text-[#3b82f6]" fill="currentColor" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {roleSlug || "Usuario"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Opciones */}
                        <div className="py-2">
                            {menuOptions
                                .filter((opt) => opt.show)
                                .map((opt, idx) => (
                                    <Link
                                        key={idx}
                                        to={opt.path}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-5 py-3 text-sm text-gray-400 hover:bg-[#0B0F14] hover:text-white transition-all group"
                                    >
                                        <span className="text-gray-500 group-hover:text-[#3b82f6] transition-colors">{opt.icon}</span>
                                        <span className="font-bold uppercase tracking-wider text-[11px]">{opt.label}</span>
                                    </Link>
                                ))}
                        </div>

                        {/* Cerrar sesión */}
                        <div className="border-t border-gray-800 bg-[#0B0F14]/50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-400 hover:bg-red-400/5 transition-colors text-left group"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                <span className="font-black uppercase tracking-widest text-[11px]">Cerrar Sesión</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
