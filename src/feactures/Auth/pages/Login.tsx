"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", { email, password })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Sección de ilustración - Derecha */}
          <div className="lg:w-1/2 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-transparent"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4">inicia sesion</h2>
              <div className="w-80 h-80 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-slate-700 rounded-2xl shadow-xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-700 rounded-lg"></div>
                  </div>
                </div>
                <div className="absolute top-20 right-20 w-8 h-8 bg-white rounded opacity-80"></div>
                <div className="absolute bottom-20 left-20 w-6 h-6 bg-red-500 rounded-full"></div>
                <div className="absolute top-32 left-16 w-4 h-4 bg-white rounded-full opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Formulario - Izquierda */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-slate-50">
            <div className="max-w-md mx-auto w-full">
              {/* <h1 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido de vuelta</h1> */}
             

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo aquí"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-all transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Iniciar Sesión
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-50 text-slate-500">O</span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                </div>
                 <p className="text-slate-600 mb-8 text-center">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="text-blue-800 hover:text-red-600 font-medium transition-colors">
                  Regístrate
                </Link>
              </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
