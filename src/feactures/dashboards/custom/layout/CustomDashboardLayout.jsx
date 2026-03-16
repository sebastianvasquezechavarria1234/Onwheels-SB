"use client"

import { CustomSidebar } from "./CustomSidebar"
import { AdminLayoutContext } from "../../context/AdminLayoutContext"
import { motion } from "framer-motion"

export const CustomDashboardLayout = ({ children }) => {
  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-100/50">
      <CustomSidebar />

      <section className="flex-1 h-full overflow-hidden flex flex-col bg-slate-100/50">
        <div className="flex-1 overflow-hidden p-3 md:p-5 pt-4 md:pt-5 relative flex flex-col">
          <motion.section
            className="flex-1 overflow-auto bg-white rounded-[2rem] p-3 md:p-5 shadow-[0_15px_40px_-12px_rgba(0,0,0,0.12)] border border-white flex flex-col"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <AdminLayoutContext.Provider value={{ showSidebar: false }}>
              {children}
            </AdminLayoutContext.Provider>
          </motion.section>
        </div>
      </section>
    </main>
  )
}
