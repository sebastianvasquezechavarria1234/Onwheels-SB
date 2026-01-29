
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Twitter, Mail, Phone, Instagram, MapPin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="relative bg-black pt-16 pb-8 overflow-hidden">
            {/* Glass Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-blue)] to-transparent opacity-50"></div>

            <div className="relative z-20 max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

                {/* Brand */}
                <div className="md:col-span-1">
                    <Link to="/" className="flex items-center gap-2 mb-4 group">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-blue)] group-hover:scale-110 transition-transform">
                            <img src="/logo.png" alt="OW" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold uppercase text-white tracking-tight">OnWheels</span>
                    </Link>
                    <p className="text-gray-500 text-xs leading-relaxed mb-6 max-w-[200px]">
                        Tu comunidad de skate en Colombia. Eventos, tienda y academia.
                    </p>
                    <div className="flex gap-3">
                        {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                            <a key={i} href="#" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-[var(--color-blue)] transition-colors text-white/50 hover:text-white">
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Compact Links */}
                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Mapa</h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                        <li><Link to="/store" className="hover:text-white transition-colors">Tienda</Link></li>
                        <li><Link to="/events" className="hover:text-white transition-colors">Eventos</Link></li>
                        <li><Link to="/training" className="hover:text-white transition-colors">Academia</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Legal</h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li><Link to="/about" className="hover:text-white transition-colors">Nosotros</Link></li>
                        <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Contacto</h4>
                    <ul className="space-y-3 text-xs text-gray-400">
                        <li className="flex gap-2">
                            <MapPin size={14} className="text-[var(--color-blue)]" />
                            <span>Bogotá, Colombia</span>
                        </li>
                        <li className="flex gap-2">
                            <Mail size={14} className="text-[var(--color-blue)]" />
                            <span>hola@onwheels.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-20 max-w-[1200px] mx-auto px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest">
                <p>© 2025 OnWheels SB.</p>
                <p className="hover:text-[var(--color-blue)] transition-colors cursor-pointer">Created by Performance Team</p>
            </div>
        </footer>
    );
};

export default Footer;
