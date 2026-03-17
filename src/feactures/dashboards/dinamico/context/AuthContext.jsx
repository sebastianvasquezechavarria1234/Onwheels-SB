import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../../../../services/api";

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

    const syncUserState = useCallback((userData) => {
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            return;
        }

        localStorage.removeItem("user");
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        let parsedStoredUser = null;

        if (!token) {
            syncUserState(null);
            return null;
        }

        if (storedUser) {
            try {
                parsedStoredUser = JSON.parse(storedUser);
            } catch (e) {
                console.error("Error parsing user from storage", e);
                localStorage.removeItem("user");
            }
        }

        try {
            const { data } = await api.get("/auth/me");
            const mergedUser = {
                ...(parsedStoredUser || {}),
                ...(data || {}),
                roles: data?.roles || parsedStoredUser?.roles || [],
                permisos: data?.permisos || parsedStoredUser?.permisos || [],
            };
            syncUserState(mergedUser);
            return mergedUser;
        } catch (error) {
            if (parsedStoredUser) {
                syncUserState(parsedStoredUser);
            } else {
                syncUserState(null);
            }
            return parsedStoredUser;
        }
    }, [syncUserState]);

    useEffect(() => {
        let mounted = true;

        const bootstrapAuth = async () => {
            try {
                await refreshUser();
            } finally {
                if (mounted) setLoading(false);
            }
        };

        bootstrapAuth();

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                refreshUser();
            }
        };

        const handleFocus = () => {
            refreshUser();
        };

        const handleAuthChanged = () => {
            refreshUser();
        };

        const handleStorage = (event) => {
            if (event.key === "token" || event.key === "user") {
                refreshUser();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("authChanged", handleAuthChanged);
        window.addEventListener("storage", handleStorage);

        // Poll every 30 seconds to detect role changes (e.g. admin enrolls user as student)
        const pollInterval = setInterval(() => {
            if (localStorage.getItem("token")) {
                refreshUser();
            }
        }, 30000);

        return () => {
            mounted = false;
            clearInterval(pollInterval);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("authChanged", handleAuthChanged);
            window.removeEventListener("storage", handleStorage);
        };
    }, [refreshUser]);

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        syncUserState(userData);

        // Dispatch simple event for standard reload listeners
        window.dispatchEvent(new Event("authChanged"));

        // Dispatch specific event for Cart merging with user data
        window.dispatchEvent(new CustomEvent("auth:login", { detail: userData }));
    };

    const logout = () => {
        localStorage.removeItem("token");
        syncUserState(null);
        window.location.href = "/login";
    };

    const hasPermission = (permiso) => {
        return user?.roles?.includes("administrador") || user?.permisos?.includes(permiso);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, hasPermission, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};