"use client"

import { useAuth } from "../../../dashboards/dinamico/context/AuthContext"
import { AdminHeader } from "./AdminHeader"
import { Footer } from "../../layout/Footer"

export const AdminLayout = ({ children }) => {
  const { user } = useAuth()
  const userName = user?.nombre || ""

  return (
    <main className="min-h-screen flex flex-col">
      <AdminHeader />
      <div className="flex-grow">{children}</div>

      <Footer />

      {/* Sticky welcome message at bottom right */}
      {userName && (
        <div className="fixed bottom-4 right-4 bg-white backdrop-blur-[16px] rounded-full p-[4px_18px] ">
          <p className="text-gray-800 font-bold!">
            Bienvenido Admin: <span className="italic">{userName}</span>
          </p>
        </div>
      )}
    </main>
  )
}
