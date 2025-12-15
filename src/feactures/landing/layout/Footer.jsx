import React from "react";
import { Link } from "react-router-dom";
import { BtnLink } from "../components/BtnLink";

export const Footer = () => {
    return(
        <footer className=" bg-[var(--color-blue)] text-white m-[120px_0px_0px_0px]">
            <div className="mt-[120px] max-w-[1500px] mx-auto px-[20px] py-[120px] flex max-lg:flex-col max-md:py-[60px]">
                <div className="w-[30%] flex flex-col justify-between max-lg:w-full">
                    <h3 className="font-primary text-[3rem]!">Performace-SB</h3>
                </div>

                <div className="w-[70%] grid grid-cols-3 max-md:grid-cols-2 gap-[10px] max-lg:w-full max-lg:mt-[40px]">
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

            </div>


            <div className=" max-w-[1500px] mx-auto py-[20px] border-t border-t-1 border-white/40 text-center">
                 <p>© 2025 Performace-SB - Todos los derechos reservados</p>
            </div>
        </footer>
    )
}

export default Footer;