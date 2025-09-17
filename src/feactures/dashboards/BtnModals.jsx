import { Link } from "react-router-dom"

export const BtnModals = ({ title, link, style, target}) => {
  const letters = title.split("")

  return (
    <Link
      target={target}
      to={link}
      className="group p-[18px_20px_18px_20px]"
    >
      <p className={`${style} relative overflow-hidden h-6 leading-6`}>
        <span className=" left-0 top-0 w-full block will-change-transform">
          {letters.map((letter, index) => (
            <span
              key={`exit-${index}`}
              className="inline-block transform transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-y-full group-hover:opacity-0 group-hover:rotateX-90 group-hover:scale-110"
              style={{
                transitionDelay: `${index * 10}ms`,
                transformStyle: "preserve-3d",
             
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
              className="inline-block transform translate-y-full opacity-0 rotateX-90 scale-90 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:rotateX-0 group-hover:scale-100"
              style={{
                transitionDelay: `${index * 10 + 20}ms`,
                transformStyle: "preserve-3d",
                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </span>
      </p>
    </Link>
  )
}
