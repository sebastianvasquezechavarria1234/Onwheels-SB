import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

    /**
     * Fetches fresh roles/permisos from the server and updates localStorage + state.
     * Called on app startup to reflect role changes (e.g. cliente → estudiante)
     * that happened server-side without requiring the user to log out.
     */
    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await axios.get(`${API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const freshData = res.data; // { id_usuario, email, roles, permisos }

            // Merge fresh server data with existing user display fields (nombre, etc.)
            const storedUser = localStorage.getItem("user");
            const existingUser = storedUser ? JSON.parse(storedUser) : {};

            const updatedUser = {
                ...existingUser,
                id_usuario: freshData.id_usuario,
                email: freshData.email,
                roles: freshData.roles,
                permisos: freshData.permisos,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (err) {
            // Token may be invalid/expired — clear session silently
            if (err?.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            }
            // Other errors: keep current state, don't log out
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        // Hydrate from localStorage first (instant)
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

        // Then silently refresh from server to sync any role changes
        if (token) {
            refreshUser();
        }
    }, [refreshUser]);

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
        <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, refreshUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};