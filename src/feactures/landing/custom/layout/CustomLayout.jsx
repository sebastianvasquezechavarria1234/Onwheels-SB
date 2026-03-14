"use client"

import { CustomHeader } from "./CustomHeader"
import { Footer } from "../../layout/Footer"
import { useEffect, useState } from "react"

export const CustomLayout = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <>
      <CustomHeader />
      <div className="flex justify-center pt-24 pb-4">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">SB</div>
          <span className="text-white font-bold tracking-tighter text-sm whitespace-nowrap">Performance SB</span>
        </div>
      </div>
      <main>{children}</main>
      <Footer />
    </>
  )
}
