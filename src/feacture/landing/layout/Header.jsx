import { ShoppingCart, ArrowDown, ArrowDown01, LogIn, User } from "lucide-react"
import { Link } from "react-router-dom"
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { BtnLink } from "../components/BtnLink";

export const Header = () => {
  return (
    <header className="w-[1350px] fixed rounded-full bg-[#333] backdrop-blur-[16px] top-4 left-1/2 transform -translate-x-1/2 z-50 text-white p-[5px]">
      <nav className="flex items-center justify-between">
        <ul className="flex gap-[20px] items-center">
          <li>
            <Link to="">
              <h4 className="font-primary text-[30px]! px-4">Onwheels-SB</h4>
            </Link>
          </li>
          <li>
            <BtnLink link="/" title="Inicio" />
          </li>
          <li>
            <BtnLink link="shop" title="Tienda" />
          </li>
          <li>
            <BtnLink link="../class" title="Clases" />
          </li>
          <li>
            <BtnLink link="" title="Eventos" />
          </li>
          <li>
            <BtnLink link="" title="Pre-inscripciones" />
          </li>
          <li>
            <BtnLink link="" title="Sobre nosotros" />
          </li>
        </ul>
        <ul className="flex gap-[5px] items-center">
          <li>
            <BtnLinkIcon title="Carrito de compras" link="" style="bg-[transparent]! text-white!" styleIcon="bg-white!">
              <ShoppingCart color="black" strokeWidth={1.5} size={20}/>
            </BtnLinkIcon>
          </li>
          <li>
            <BtnLinkIcon title="Iniciar sesión" link="">
              <User color="white" strokeWidth={1.5} size={20}/>
            </BtnLinkIcon>
          </li>
        </ul>
      </nav>
    </header>
  )
}
