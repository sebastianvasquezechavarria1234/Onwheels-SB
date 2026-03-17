import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../feactures/dashboards/dinamico/context/AuthContext";
import { 
    getUserRoleSlug, 
    getHomePath, 
    getStoreHomePath, 
    getPreinscriptionPath 
} from "../utils/roleHelpers";

/**
 * AutoRedirect component
 * Detects if an authenticated user is trying to access a public landing route.
 * If so, redirects them to the equivalent protected route for their role.
 * 
 * Example: Authenticated Student at /events -> /student/events
 */
const AutoRedirect = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Wait for auth state

    if (isAuthenticated && user) {
        const roleSlug = getUserRoleSlug(user);
        const path = location.pathname;

        // Map public paths to role-specific paths
        // We use roleHelpers to get the correct dynamic path
        
        if (path === "/") {
            return <Navigate to={getHomePath(user)} replace />;
        }
        
        if (path === "/store") {
            return <Navigate to={getStoreHomePath(user)} replace />;
        }

        if (path === "/events") {
            // Role specific events path logic (standardize to /role/events)
            return <Navigate to={`/${roleSlug}/events`} replace />;
        }

        if (path === "/training") {
            // Training/Class path
            return <Navigate to={`/${roleSlug}/training`} replace />;
        }

        if (path === "/preinscriptions") {
            return <Navigate to={getPreinscriptionPath(user)} replace />;
        }

        if (path === "/about") {
            // Standardizing about to /role/abaut or /role/about based on AppRouter
            // Student uses /student/abaut (typo in current code, we respect it or fix it later)
            const aboutPath = roleSlug === 'student' || roleSlug === 'users' ? `/${roleSlug}/abaut` : `/${roleSlug}/about`;
            return <Navigate to={aboutPath} replace />;
        }

        if (path === "/shoppingCart") {
            // Standardizing cart path
            const cartPath = roleSlug === 'custom' ? '/custom/cart' : `/${roleSlug}/shoppingCart`;
            return <Navigate to={cartPath} replace />;
        }
    }

    return children;
};

export default AutoRedirect;
