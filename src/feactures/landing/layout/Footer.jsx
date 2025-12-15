import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Twitter, Mail, Phone, Instagram } from "lucide-react";

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--color-blue)] text-white mt-20">
            <div className="max-w-[1500px] mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <h3 className="font-primary text-3xl font-bold tracking-tight">OnWheels-SB</h3>
                        <p className="text-sm opacity-80 text-center md:text-left max-w-xs">
                            Tu destino para todo lo relacionado con patinaje. Clases, tienda y eventos en un solo lugar.
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

                {/* Divider & Copyright */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
                    <p>© {currentYear} OnWheels-SB. Todos los derechos reservados.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="#" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link to="#" className="hover:text-white transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
