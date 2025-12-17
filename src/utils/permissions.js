/**
 * Sistema de permisos para roles dinámicos
 * Trabaja con el array de permisos que viene del backend
 */

/**
 * Obtener permisos del usuario actual
 * @returns {Array<string>} Array de permisos del usuario
 */
export const getUserPermissions = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    // Los permisos vienen directamente en user.permisos como array
    if (user.permisos && Array.isArray(user.permisos)) {
      return user.permisos
    }

    return []
  } catch (error) {
    console.error("Error getting permissions:", error)
    return []
  }
}

/**
 * Verificar si el usuario tiene un permiso específico
 * @param {string} permission - Permiso a verificar (ej: "ver_usuarios", "gestionar_productos")
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  // Administradores tienen acceso total
  if (hasRole("administrador")) return true

  const permissions = getUserPermissions()
  return permissions.includes(permission)
}

/**
 * Verificar si el usuario tiene TODOS los permisos requeridos
 * @param {Array<string>} requiredPermissions - Array de permisos requeridos
 * @returns {boolean}
 */
export const hasAllPermissions = (requiredPermissions) => {
  if (hasRole("administrador")) return true

  const permissions = getUserPermissions()
  return requiredPermissions.every((p) => permissions.includes(p))
}

/**
 * Verificar si el usuario tiene AL MENOS UNO de los permisos
 * @param {Array<string>} requiredPermissions - Array de permisos
 * @returns {boolean}
 */
export const hasAnyPermission = (requiredPermissions) => {
  if (hasRole("administrador")) return true

  const permissions = getUserPermissions()
  return requiredPermissions.some((p) => permissions.includes(p))
}

/**
 * Verificar si el usuario puede VER un recurso
 * @param {string} resource - Nombre del recurso (ej: "usuarios", "productos")
 * @returns {boolean}
 */
export const canView = (resource) => {
  if (hasRole("administrador")) return true
  return hasPermission(`ver_${resource}`)
}

/**
 * Verificar si el usuario puede GESTIONAR un recurso (crear/editar/eliminar)
 * @param {string} resource - Nombre del recurso (ej: "usuarios", "productos")
 * @returns {boolean}
 */
export const canManage = (resource) => {
  if (hasRole("administrador")) return true
  return hasPermission(`gestionar_${resource}`)
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param {string} roleName - Nombre del rol a verificar
 * @returns {boolean}
 */
export const hasRole = (roleName) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some((role) => role.toLowerCase() === roleName.toLowerCase())
    }
    return false
  } catch (error) {
    return false
  }
}
