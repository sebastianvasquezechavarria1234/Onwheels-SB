import React from "react"
import { Link } from "react-router-dom"
import { ArrowDown } from "lucide-react"

export const BtnSideBar = ({ title, children, style, styleIcon, link, isCollapsed }) => {
  const letters = title.split("")

  return (
    <Link
      to={link}
      className={`
        ${style}
        group transition-all duration-300 flex items-center rounded-2xl
        ${isCollapsed ? "p-0 justify-center w-12 h-12 mx-auto" : "gap-3 px-3 py-2 hover:bg-slate-50"}
        `}
      title={isCollapsed ? title : ""}
    >
      <span className={
        `${styleIcon} transition-all duration-200 flex justify-center items-center rounded-xl shrink-0
         ${isCollapsed ? "w-11 h-11 bg-white shadow-md border border-slate-50" : "w-10 h-10 bg-slate-50"}
         text-slate-400 group-hover:text-blue-800 group-hover:bg-blue-50/50 group-hover:shadow-sm
        `
      }>
        <span className="flex items-center justify-center">
          {React.cloneElement(children, { size: isCollapsed ? 20 : 18, strokeWidth: 2.2 })}
        </span>
      </span>

      {!isCollapsed && (
        <p className="text-[15px] font-bold tracking-tight text-slate-500 group-hover:text-slate-900 transition-colors" style={{ fontFamily: '"Outfit", sans-serif' }}>
          {title}
        </p>
      )}
    </Link>
  )
}
