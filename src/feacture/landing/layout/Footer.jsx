import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
    return(
        <footer className="mt-[120px] bg-[#333] text-white">
            <div className="mt-[120px] max-w-[1500px] mx-auto px-[20px] py-[120px] grid grid-cols-4 gap-[20px]">
                <div className="flex flex-col justify-between">
                    <h3 className="font-primary text-[3rem]!">OnWheels-SB</h3>
                </div>

                <div className="flex flex-col">
                    <h4 className="font-primary mb-[20px]">Enlaces rapidos</h4>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Inicio
                    </Link>
                    <Link className="hover:pl-[10px] duration-200 py-[5px]" to="">
                        Tienda
                    </Link>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Inicio
                    </Link>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Clases
                    </Link>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Eventos
                    </Link>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Sobre nosotros
                    </Link>
                </div>
                <div className="flex flex-col">
                    <h4 className="font-primary mb-[20px]">Siguenos en:</h4>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Facebook
                    </Link>
                    <Link className="hover:pl-[10px] duration-200 py-[5px]" to="">
                        Youtube
                    </Link>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Tik tok
                    </Link>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        X
                    </Link>
                   
                </div>
                <div className="flex flex-col">
                    <h4 className="font-primary mb-[20px]">Contacto: </h4>
                    <Link to="" className="hover:pl-[10px] duration-200 py-[5px]">
                        Onwheels@gmail.com
                    </Link>
                    <Link className="hover:pl-[10px] duration-200 py-[5px]" to="">
                        + 57 301652456
                    </Link>
                    
                </div>

            </div>


            <div className=" max-w-[1500px] mx-auto py-[20px] border-t border-dashed border-white text-center">
                 <p>© 2025 OnWheels-SB - Todos los derechos reservados</p>
            </div>
        </footer>
    )
}

export default Footer;