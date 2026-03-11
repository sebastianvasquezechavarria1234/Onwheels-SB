import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../feactures/dashboards/dinamico/context/AuthContext";
import { getHomePath } from "../utils/roleHelpers";

/**
 * RootRedirect component
 * Automatically redirects authenticated users to their role-specific landing/home page.
 * If not authenticated, it renders the landing page (children).
 */
const RootRedirect = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated && user) {
        return <Navigate to={getHomePath(user)} replace />;
    }

    return children;
};

export default RootRedirect;
