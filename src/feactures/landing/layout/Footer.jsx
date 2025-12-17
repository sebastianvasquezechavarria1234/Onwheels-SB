import React from "react";
import { Link } from "react-router-dom";
import { BtnLink } from "../components/BtnLink";

import { Facebook, Youtube, Twitter, Mail, Phone, Instagram } from "lucide-react";

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

                    {/* Quick Links Overlay */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                        <Link to="/" className="hover:text-gray-300 transition-colors">Inicio</Link>
                        <Link to="/pre-inscripciones" className="hover:text-gray-300 transition-colors">Inscripciones</Link>
                        <Link to="/tienda" className="hover:text-gray-300 transition-colors">Tienda</Link>
                        <Link to="/clases" className="hover:text-gray-300 transition-colors">Clases</Link>
                        <Link to="/eventos" className="hover:text-gray-300 transition-colors">Eventos</Link>
                        <Link to="/sobre-nosotros" className="hover:text-gray-300 transition-colors">Nosotros</Link>
                    </div>

                    {/* Contact & Socials */}
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all group" aria-label="Facebook">
                                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all group" aria-label="Youtube">
                                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all group" aria-label="Twitter">
                                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                            {/* Generic placeholder for TikTok if icon unavailable, or just mapped to Instagram/general video */}
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all group" aria-label="Instagram">
                                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 text-sm opacity-80">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>Onwheels@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>+57 301652456</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            <div className=" max-w-[1500px] mx-auto py-[20px] border-t border-white/40 text-center">
                 <p>© 2025 Performace-SB - Todos los derechos reservados</p>
            </div>
        </footer>
    );
};

export default Footer;
