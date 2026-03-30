
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Youtube, Twitter, Mail, Phone, Instagram, MapPin } from "lucide-react";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { getHomePath, getStoreHomePath, getPreinscriptionPath } from "../../../utils/roleHelpers";

export const Footer = () => {
    const { user } = useAuth();
    const homePath = getHomePath(user);
    const storePath = getStoreHomePath(user);
    const joinPath = getPreinscriptionPath(user);
    const roleSlug = user ? (Array.isArray(user.roles) ? user.roles[0] : user.rol) : null;
    
    // Dynamic about path (respecting the abaut/about variations in router)
    const aboutPath = user && (user.roles?.includes('estudiante') || user.roles?.includes('cliente')) 
        ? `/${user.roles?.includes('estudiante') ? 'student' : 'users'}/abaut` 
        : (user ? `/${user.roles ? (user.roles.includes('administrador') ? 'admin' : (user.roles.includes('instructor') ? 'instructor' : 'custom')) : 'custom'}/about` : "/about");

    // Dynamic training path
    const trainingPath = user ? `/${user.roles?.includes('administrador') ? 'admin' : (user.roles?.includes('estudiante') ? 'student' : (user.roles?.includes('instructor') ? 'instructor' : (user.roles?.includes('cliente') ? 'users' : 'custom')))}/training` : "/training";
    
    // Dynamic events path
    const eventsPath = user ? `/${user.roles?.includes('administrador') ? 'admin' : (user.roles?.includes('estudiante') ? 'student' : (user.roles?.includes('instructor') ? 'instructor' : (user.roles?.includes('cliente') ? 'users' : 'custom')))}/events` : "/events";

    return (
        <footer className="relative bg-black pt-10 md:pt-16 pb-8 overflow-hidden">
            {/* Glass Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-blue)] to-transparent opacity-50"></div>

            <div className="relative z-20 max-w-[1200px] mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12">

                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                    <Link to="/" className="flex items-center gap-2 mb-4 group">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-blue)] group-hover:scale-110 transition-transform">
                            <img src="/logo.png" alt="OW" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold uppercase text-white tracking-tight">Performance SB</span>
                    </Link>
                    <p className="text-gray-500 text-xs leading-relaxed mb-6 max-w-[200px]">
                        Tu comunidad de skate en Colombia. Eventos, tienda y academia.
                    </p>
                    <div className="flex gap-3">
                        {[
                            { Icon: Facebook, url: "https://www.facebook.com/PerformanceCor/" },
                            { Icon: Instagram, url: "https://www.instagram.com/corp_performance/" },
                            { Icon: Youtube, url: "https://www.youtube.com/@escuelaskateboardingmedell4715" }
                        ].map(({ Icon, url }, i) => (
                            <a 
                                key={i} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-[var(--color-blue)] transition-colors text-white/50 hover:text-white"
                            >
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Compact Links */}
                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Mapa</h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li><Link to={homePath} className="hover:text-white transition-colors">Inicio</Link></li>
                        <li><Link to={storePath} className="hover:text-white transition-colors">Tienda</Link></li>
                        <li><Link to={eventsPath} className="hover:text-white transition-colors">Eventos</Link></li>
                        <li><Link to={trainingPath} className="hover:text-white transition-colors">Academia</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Legal</h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li><Link to={aboutPath} className="hover:text-white transition-colors">Nosotros</Link></li>
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
                            <span>hola@Performance SB.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-20 max-w-[1200px] mx-auto px-6 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest">
                <p>© 2025 Performance SB SB.</p>
                <p className="hover:text-[var(--color-blue)] transition-colors cursor-pointer">Created by Performance Team</p>
            </div>
        </footer>
    );
};

export default Footer;
