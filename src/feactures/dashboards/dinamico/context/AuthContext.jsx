import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

// Hook personalizado con validación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        // Hydrate from localStorage
        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Error parsing user from storage", e);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        // Dispatch simple event for standard reload listeners
        window.dispatchEvent(new Event("authChanged"));

        // Dispatch specific event for Cart merging with user data
        window.dispatchEvent(new CustomEvent("auth:login", { detail: userData }));
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
    };

    const hasPermission = (permiso) => {
        return user?.roles?.includes("administrador") || user?.permisos?.includes(permiso);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};