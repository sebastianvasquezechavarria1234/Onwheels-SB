/**
 * roleHelpers.js
 * Centralized logic for role-based routing.
 */

// Normalized roles map
const ROLE_PATH_MAP = {
    'estudiante': 'student',
    'instructor': 'instructor',
    'administrador': 'admin',
    'cliente': 'users',
    'invitado': 'store' // Fallback
};

/**
 * Get the standardized role slug for a user.
 * Prioritizes 'administrador' if the user has multiple roles.
 * @param {Object} user 
 * @returns {string} - 'student', 'admin', 'users', 'instructor', 'custom', or 'store' (guest)
 */
export const getUserRoleSlug = (user) => {
    if (!user) return 'store';

    // Extraction of roles from different possible structures
    const rolesArray = Array.isArray(user.roles)
        ? user.roles.map(r => (typeof r === 'string' ? r : r.nombre_rol).toLowerCase())
        : (user.rol ? [user.rol.toLowerCase()] : []);

    if (rolesArray.length === 0) return 'store';

    // Prioritize 'administrador'
    if (rolesArray.includes('administrador')) return 'admin';
    if (rolesArray.includes('custom')) return 'custom';
    if (rolesArray.includes('instructor')) return 'instructor';
    if (rolesArray.includes('estudiante')) return 'student';
    if (rolesArray.includes('cliente')) return 'users';

    return ROLE_PATH_MAP[rolesArray[0]] || 'store';
};

/**
 * Get the user's profile path.
 */
export const getProfilePath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'admin') return '/admin/profile';
    if (roleSlug === 'store') return '/login';
    return `/${roleSlug}/setting`;
};

/**
 * Get the user's purchases history path.
 */
export const getPurchasesPath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'admin') return '/admin/purchases';
    if (roleSlug === 'custom') return '/custom/my-purchases';
    if (roleSlug === 'store') return '/login';
    return `/${roleSlug}/myPurchases`;
};

/**
 * Get the product detail path for the current user.
 * @param {Object} user - The authenticated user object (nullable)
 * @param {string|number} productId - The product ID
 * @returns {string} - The absolute path to the product detail page
 */
export const getProductDetailPath = (user, productId) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'store') {
        return `/store/product/${productId}`;
    }
    return `/${roleSlug}/store/product/${productId}`;
};

/**
 * Get the home path for the current user.
 */
export const getHomePath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'store') return '/';
    return `/${roleSlug}/home`;
};

/**
 * Get the store home path for the current user.
 */
export const getStoreHomePath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'store') {
        return '/store';
    }
    return `/${roleSlug}/store`;
};
// ... existing code ...
/**
 * Get the checkout path for the current user based on their role.
 * @param {Object} user 
 * @returns {string}
 */
export const getCheckoutPath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'store') {
        return '/login'; // Should technically not happen if guard is correct, but safe fallback
    }
    // Map 'users' (client) to their specific checkout if different, or standard convention
    // Based on AppRouter:
    // Student -> /student/checkout
    // Instructor -> /instructor/checkout
    // Client (users) -> /users/checkout
    // Admin -> /admin/checkout
    // Custom -> /custom/checkout

    return `/${roleSlug}/checkout`;
};

/**
 * Get the shopping cart path for the current user.
 * @param {Object} user 
 * @returns {string}
 */
export const getCartPath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'store') {
        return '/shoppingCart';
    }
    // Custom role has a different path structure for cart
    if (roleSlug === 'custom') {
        return '/custom/cart';
    }
    return `/${roleSlug}/shoppingCart`;
};

/**
 * Get the preinscription path for the current user.
 * @param {Object} user 
 * @returns {string}
 */
export const getPreinscriptionPath = (user) => {
    const roleSlug = getUserRoleSlug(user);
    if (roleSlug === 'store') return '/register'; // Guests must register before pre-inscribing
    if (roleSlug === 'users') return '/users/preinscriptions';
    if (roleSlug === 'admin') return '/admin/preRegistrations';
    if (roleSlug === 'custom') return '/custom/preinscripciones';
    return `/${roleSlug}/home`; // Fallback for roles that might not need this (student/instructor)
};
