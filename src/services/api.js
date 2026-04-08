import axios from "axios"

// Usar VITE_API_URL (Render) por defecto en producción
// Permitir override solo si se establece VITE_FORCE_LOCAL_API=true en .env.local
const useLocalApi = import.meta.env.VITE_FORCE_LOCAL_API === "true"

const resolvedBaseURL = useLocalApi
  ? "http://localhost:3000/api"
  : (import.meta.env.VITE_API_URL || "https://onwheels-sb-api-sg4j.onrender.com/api")

const api = axios.create({
  baseURL: resolvedBaseURL,
})

// Interceptor para añadir el token a todas las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})



// Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo redirigir si NO estamos en la ruta de login y el error es por token inválido
      const isLoginPage = window.location.pathname === "/login" || window.location.pathname === "/"
      const hasToken = localStorage.getItem("token")


      if (!isLoginPage && hasToken) {
        // Token inválido o expirado en una página protegida
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      } else if (hasToken && isLoginPage) {

        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    return Promise.reject(error)
  },
)


export default api
