import React from "react";
import { Link } from "react-router-dom";
import { Shirt, Calendar } from "lucide-react";

export const Hero = () => {
    return (
        <section className="relative w-full h-[90vh] min-h-[650px] bg-black text-white overflow-hidden flex items-center">
            
            {/* Background Image */}
            <div className="absolute inset-0">
                <img 
                    src="/bg_hero_shop.jpg" 
                    alt="Hero Shop"
                    className="w-full h-full object-cover scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16">
                
                {/* Top Label */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-10 bg-[var(--color-blue)]"></div>
                    <span className="uppercase tracking-[0.25em] text-xs text-gray-400 font-medium">
                        Tienda Oficial
                    </span>
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[0.95] font-black tracking-tight mb-8 max-w-4xl">
                    TODO LO QUE
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-blue)] to-cyan-400">
                        UN SKATER
                    </span>
                    NECESITA.
                </h1>

                {/* Description */}
                <p className="text-gray-300 text-base md:text-lg max-w-xl leading-relaxed mb-10 border-l border-white/20 pl-6">
                    Descubre una selección premium hecha para skaters auténticos.
                    Diseño, resistencia y estilo callejero en cada producto.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Link 
                        to="#products" 
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold overflow-hidden uppercase text-sm tracking-wide"
                    >
                        <span className="relative z-10 flex items-center gap-2 transition-all group-hover:gap-3">
                            <Shirt size={18} strokeWidth={2.5} />
                            Ver productos
                        </span>
                        <div className="absolute inset-0 bg-[var(--color-blue)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                        <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                            <Shirt size={18} strokeWidth={2.5} />
                            Ver productos
                        </span>
                    </Link>

                    
                </div>

            </div>
        </section>
    );
};
