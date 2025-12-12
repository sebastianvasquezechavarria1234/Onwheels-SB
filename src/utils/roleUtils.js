/**
 * Utilidades para detección y manejo de roles
 */

/**
 * Roles fijos del sistema
 */
export const FIXED_ROLES = {
  ADMIN: "administrador",
  STUDENT: "estudiante",
  INSTRUCTOR: "instructor",
  CLIENT: "cliente",
}

/**
 * Obtener los roles del usuario actual
 * @returns {Array<string>}
 */
export const getUserRoles = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    return user.roles || []
  } catch (error) {
    console.error("Error getting user roles:", error)
    return []
  }
}

/**
 * Verificar si el usuario tiene un rol personalizado
 * @returns {boolean}
 */
export const hasCustomRole = () => {
  const roles = getUserRoles()
  const fixedRoleValues = Object.values(FIXED_ROLES)

  return roles.some((role) => !fixedRoleValues.includes(role.toLowerCase()))
}

/**
 * Obtener el rol principal del usuario
 * Para roles múltiples, prioriza: admin > instructor > estudiante > custom > cliente
 * @returns {string}
 */
export const getPrimaryRole = () => {
  const roles = getUserRoles()

  console.log("[v0] User roles:", roles)

  // Prioridad 1: Administrador
  if (roles.some((r) => r.toLowerCase() === FIXED_ROLES.ADMIN)) {
    console.log("[v0] Detected role: ADMIN")
    return FIXED_ROLES.ADMIN
  }

  // Prioridad 2: Instructor
  if (roles.some((r) => r.toLowerCase() === FIXED_ROLES.INSTRUCTOR)) {
    console.log("[v0] Detected role: INSTRUCTOR")
    return FIXED_ROLES.INSTRUCTOR
  }

  // Prioridad 3: Estudiante
  if (roles.some((r) => r.toLowerCase() === FIXED_ROLES.STUDENT)) {
    console.log("[v0] Detected role: STUDENT")
    return FIXED_ROLES.STUDENT
  }

  const hasCustom = hasCustomRole()
  console.log("[v0] Has custom role:", hasCustom)

  if (hasCustom) {
    console.log("[v0] Detected role: CUSTOM")
    return "custom"
  }

  if (roles.some((r) => r.toLowerCase() === FIXED_ROLES.CLIENT)) {
    console.log("[v0] Detected role: CLIENT")
    return FIXED_ROLES.CLIENT
  }

  // Si no tiene ningún rol, por defecto cliente
  console.log("[v0] Detected role: DEFAULT (cliente)")
  return FIXED_ROLES.CLIENT
}

/**
 * Obtener la ruta de redirección según el rol del usuario
 * @returns {string}
 */
export const getRoleHomePath = () => {
  const primaryRole = getPrimaryRole()

  switch (primaryRole) {
    case FIXED_ROLES.ADMIN:
      return "/admin/home"
    case FIXED_ROLES.INSTRUCTOR:
      return "/instructor/setting"
    case FIXED_ROLES.STUDENT:
      return "/student/setting"
    case "custom":
      return "/custom/home"
    case FIXED_ROLES.CLIENT:
      return "/users/home"
    default:
      return "/custom/home"
  }
}
