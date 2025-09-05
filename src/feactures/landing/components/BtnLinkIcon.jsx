import { Link } from "react-router-dom"
import { ArrowDown } from "lucide-react"

export const BtnLinkIcon = ({ title, children, style, styleIcon, link }) => {
  const letters = title.split("")

  return (
    <Link
      to={link}
      className={`
        ${style}
        BtnLinkIcon group bg-white text-black/90 inline-flex items-center rounded-full gap-[8px] p-[3px_13px_3px_3px]
        `}
    >
      <span className={
        `${styleIcon} BtnLinkIcon--icon w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full`
      }>
        <span className="BtnLinkIcon--icon__svg">{children}</span>
        
      </span>

      <h4 className="relative overflow-hidden h-6 leading-6" style={{ perspective: "1000px" }}>
        <span className=" left-0 top-0 w-full block will-change-transform">
          {letters.map((letter, index) => (
            <span
              key={`exit-${index}`}
              className="font-primary inline-block transform transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-y-full group-hover:opacity-0 group-hover:rotateX-90 group-hover:scale-110"
              style={{
                transitionDelay: `${index * 15}ms`,
                transformStyle: "preserve-3d",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>

        <span className=" absolute left-0 top-0 w-full block will-change-transform">
          {letters.map((letter, index) => (
            <span
              key={`enter-${index}`}
              className="font-primary inline-block transform translate-y-full opacity-0 rotateX-90 scale-90 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:rotateX-0 group-hover:scale-100"
              style={{
                transitionDelay: `${index * 15 + 25}ms`,
                transformStyle: "preserve-3d",
                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
      </h4>
    </Link>
  )
}
