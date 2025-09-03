import React from "react";
import { Link } from "react-router-dom";
import { BtnLink } from "../components/BtnLink";

export const Footer = () => {
    return(
        <footer className=" bg-[#333] text-white m-[120px_0px_0px_0px]">
            <div className="mt-[120px] max-w-[1500px] mx-auto px-[20px] py-[120px] grid grid-cols-4 gap-[20px]">
                <div className="flex flex-col justify-between">
                    <h3 className="font-primary text-[3rem]!">OnWheels-SB</h3>
                </div>

                <div className="flex flex-col">
                    <h4 className="font-primary mb-[20px]">Enlaces rapidos</h4>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Inicio" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Pre-inscripciones" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Tienda" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Clases" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Eventos" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Sobre nosotros" link=""/>
                    </p>
                   
                </div>
                <div className="flex flex-col">
                    <h4 className="font-primary mb-[20px]">Siguenos en:</h4>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Facebook" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Youtube" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Tik tok" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="X" link=""/>
                    </p>
                   
                </div>
                <div className="flex flex-col">
                    <h4 className="font-primary mb-[20px]">Contacto: </h4>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="Onwheels@gmail.com" link=""/>
                    </p>
                    <p className="flex gap-[10px] items-center py-[5px]">
                        <span className="w-[5px] h-[5px] rounded-full bg-white block"></span>
                        <BtnLink title="+ 57 301652456" link=""/>
                    </p>                    
                </div>

            </div>


            <div className=" max-w-[1500px] mx-auto py-[20px] border-t border-dashed border-white text-center">
                 <p>© 2025 OnWheels-SB - Todos los derechos reservados</p>
            </div>
        </footer>
    )
}

export default Footer;