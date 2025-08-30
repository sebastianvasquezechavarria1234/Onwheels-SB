import { ShoppingCart, User } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
    return(
        <header className="absolute top-0 left-0 z-100 w-full text-white p-[20px]">
            <nav className="flex items-center justify-between">
                <ul>
                    <li>
                        <Link to="">
                            <h4 className="font-primary text-[26px]!">Onwheels-SB</h4>
                        </Link>
                    </li>
                </ul>
                <ul className="flex gap-[20px] items-center">
                    <li>
                        <Link to="">Inicio</Link>
                    </li>
                    <li>
                        <Link to="">Tienda</Link>
                    </li>
                    <li>
                        <Link to="">Clases</Link>
                    </li>
                    <li>
                        <Link to="">Eventos</Link>
                    </li>
                    <li>
                        <Link to="">Sobre nosotros</Link>
                    </li>
                    <li className="h-[20px] w-[1px] block bg-white"></li>
                    <li>
                        <Link to="">
                            <ShoppingCart color="currentColor" strokeWidth="1.5"/>
                        </Link>
                    </li>
                    <li>
                        <Link to="">
                            <User color="currentColor" strokeWidth="1.5"/>
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>

    )
}