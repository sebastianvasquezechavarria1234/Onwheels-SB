import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ShoppingBag, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { getProfilePath, getPurchasesPath, getUserRoleSlug } from "../../../utils/roleHelpers";

export const UserDropdown = ({ isScrolled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // ... rest of useEffect remains same ...



    console.log("USER:", user);




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

    // Use helpers for dynamic paths
    const profilePath = getProfilePath(user);
    const purchasesPath = getPurchasesPath(user);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // Definición de menú dinámico basado en roleHelpers
    const menuOptions = [
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

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
          hover:bg-gray-800 ${isOpen ? "bg-gray-800 ring-2 ring-[var(--color-blue)]" : "bg-transparent"}
          text-white
        `}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <User size={isScrolled ? 18 : 20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#121821] border border-gray-800 shadow-2xl overflow-hidden z-[500]"
                    >
                        {/* Cabecera del Dropdown */}
                        <div className="px-4 py-3 border-b border-gray-800 bg-[#0B0F14]">
                            <p className="text-sm font-bold text-white truncate">
                                {user?.nombre} {user?.apellido}
                            </p>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                                {roleSlug || "Invitado"}
                            </p>
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
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                                    >
                                        <span className="text-gray-400 group-hover:text-blue-400">{opt.icon}</span>
                                        <span className="font-medium">{opt.label}</span>
                                    </Link>
                                ))}
                        </div>

                        {/* Cerrar sesión */}
                        <div className="border-t border-gray-800 py-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
                            >
                                <LogOut size={16} />
                                <span className="font-bold">Cerrar Sesión</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
