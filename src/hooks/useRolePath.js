import { useAuth } from "../feactures/dashboards/dinamico/context/AuthContext";
import { getUserRoleSlug } from "../utils/roleHelpers";

/**
 * Hook to get the current user's role path prefix.
 * @returns {string} The role slug with leading slash (e.g. "/student", "/users") or empty string if guest.
 */
export const useRolePath = () => {
    const { user } = useAuth();

    // If not logged in, return empty string for public paths
    if (!user) return "";

    const roleSlug = getUserRoleSlug(user);

    // "store" means guest/public in our helper, so return empty string
    if (roleSlug === 'store') return "";

    return `/${roleSlug}`;
};
