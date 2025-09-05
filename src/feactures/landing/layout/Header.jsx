import { ShoppingCart, ArrowDown, ArrowDown01, LogIn, User } from "lucide-react"
import { Link } from "react-router-dom"
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { BtnLink } from "../components/BtnLink";

export const Header = () => {
  return (
    <header className=" w-full flex justify-center fixed z-50 text-white">
      <nav className="flex items-center justify-between w-full   bg-[var(--color-blue)] backdrop-blur-[16px]  p-[5px]">
        <ul className="flex gap-[20px] items-center">
          <li>
            <Link to="">
              <h4 className="font-primary text-[30px]! px-4">Onwheels-SB</h4>
            </Link>
          </li>
          <li>
            <BtnLink link="/#" title="Inicio" />
          </li>
          <li>
            <BtnLink link="../store#" title="Tienda" />
          </li>
          <li>
            <BtnLink link="../class#" title="Clases" />
          </li>
          <li>
            <BtnLink link="../events#" title="Eventos" />
          </li>
          <li>
            <BtnLink link="../preinscriptions#" title="Pre-inscripciones" />
          </li>
          <li>
            <BtnLink link="../about#" title="Sobre nosotros" />
          </li>
        </ul>
        <ul className="flex gap-[5px] items-center">
          <li>
            <BtnLinkIcon title="Carrito de compras" link="" style="bg-[transparent]! text-white!" styleIcon="bg-white!">
              <ShoppingCart color="black" strokeWidth={1.5} size={20}/>
            </BtnLinkIcon>
          </li>
          <li>
            <BtnLinkIcon title="Iniciar sesión" link="../login#">
              <User color="white" strokeWidth={1.5} size={20}/>
            </BtnLinkIcon>
          </li>
        </ul>
      </nav>
    </header>
  )
}