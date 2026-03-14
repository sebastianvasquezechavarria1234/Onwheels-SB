import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover object-center opacity-70 grayscale-[50%] scale-105"
          src="/bg_hero_shop.jpg"
          alt="Performance SB Community"
        />
        {/* Advanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="flex justify-center items-center gap-4 mb-8">
            <span className="h-[2px] w-12 bg-[var(--color-blue)]"></span>
            <span className="uppercase tracking-[0.6em] text-[10px] md:text-sm text-[var(--color-blue)] font-black">Nuestra Historia</span>
            <span className="h-[2px] w-12 bg-[var(--color-blue)]"></span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-none tracking-tighter mb-10 uppercase italic text-white">
            SOMOS LA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-blue)] to-cyan-500 not-italic">CALLE</span>
          </h1>

          <p className="text-zinc-300 text-base md:text-2xl max-w-3xl mx-auto leading-relaxed mb-16 font-medium italic">
            "Skate, estilo y pasión sin pausa. Más que una tienda, somos el motor de la cultura urbana."
          </p>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center"
          >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50">
              <ArrowDown size={24} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Side Decorative Text */}
      <div className="absolute right-10 top-1/2 -rotate-90 origin-right hidden lg:block">
        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 whitespace-nowrap">
          EST. 2024 — Performance SB Academy
        </span>
      </div>
    </section>
  );
};