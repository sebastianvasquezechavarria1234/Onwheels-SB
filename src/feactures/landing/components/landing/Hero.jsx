
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const y2 = useTransform(scrollY, [0, 500], [0, -50]);

    return (
        <section className="relative w-full h-[85vh] md:h-[90vh] bg-black text-white overflow-hidden flex flex-col md:flex-row pt-20">
            {/* Left: Typography & Content - COMPACT */}
            <div className="w-full md:w-5/12 p-6 md:p-10 lg:p-14 flex flex-col justify-center relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-[1px] w-8 bg-[var(--color-blue)]"></div>
                        <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs text-gray-400 font-medium">Est. 2024 Colombia</span>
                    </div>

                    {/* SCALED DOWN Typography */}
                    <h1 className="text-4xl md:text-5xl lg:text-7xl leading-[0.95] font-black mb-6 relative tracking-tight">
                        FLUJO
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-blue)] to-cyan-500 pl-1">
                            URBANO
                        </span>
                        <motion.div
                            style={{ y: y2 }}
                            className="absolute -top-6 -right-6 text-[6rem] md:text-[8rem] opacity-5 font-black pointer-events-none select-none z-[-1]"
                        >
                            SB
                        </motion.div>
                    </h1>

                    <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed mb-8 border-l border-white/20 pl-4">
                        Redefiniendo el skateboarding. Diseño premium y rendimiento callejero.
                    </p>

                    <div className="flex gap-3">
                        <Link to="/store" className="group relative px-6 py-3 bg-white text-black rounded-full font-bold overflow-hidden text-sm">
                            <span className="relative z-10 flex items-center gap-2 group-hover:gap-2 transition-all uppercase">
                                Ver Tienda <ArrowUpRight size={16} />
                            </span>
                            <div className="absolute inset-0 bg-[var(--color-blue)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                            <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                                Ver Tienda <ArrowUpRight size={16} />
                            </span>
                        </Link>
                        <Link to="/preinscriptions" className="px-6 py-3 border border-white/20 rounded-full font-bold hover:bg-white/5 transition-all uppercase text-sm">
                            Unirse
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Right: Immersive Visuals - BETTER ASPECT RATIO */}
            <div className="w-full md:w-7/12 h-[50vh] md:h-auto relative">
                <motion.div
                    style={{ y: y1 }}
                    className="absolute inset-4 md:inset-8 lg:inset-10 overflow-hidden rounded-[2rem] md:rounded-[3rem]"
                >
                    <img
                        src="/bg_hero_landing.jpg"
                        alt="Skate Life shadow-2xl"
                        className="w-full h-full object-cover scale-105 filter contrast-110 saturate-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Floating Badge - Smaller */}
                    <div className="absolute bottom-6 left-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <h4 className="text-xl font-bold">25+</h4>
                        <p className="text-[10px] uppercase tracking-wider opacity-80">Coaches</p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};