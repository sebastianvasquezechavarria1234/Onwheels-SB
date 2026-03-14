import React from "react";
import { motion } from "framer-motion";
import { Hero } from "../components/abaut/Hero";
import { Layout } from "../layout/Layout";

export const AboutContent = () => {
  const revealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <>
      <Hero />

      {/* === SECTION 1: VISION (DARK THEME) === */}
      <section className="bg-zinc-950 py-32 overflow-hidden border-b border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div
              className="lg:col-span-6 relative group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={revealVariants}
            >
              <div className="absolute -inset-4 bg-[var(--color-blue)]/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative rounded-[3rem] overflow-hidden border border-zinc-800 aspect-[4/5] lg:aspect-auto lg:h-[500px] max-w-[500px] mx-auto lg:mx-0">
                <img
                  className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  src="/animation-3.jpg"
                  alt="Vision Performance SB"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=2000&auto=format&fit=crop" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-6 space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={revealVariants}
            >
              <div className="inline-block px-4 py-1 bg-[var(--color-blue)]/10 border border-[var(--color-blue)]/30 rounded-full">
                <span className="text-[var(--color-blue)] text-[10px] font-black uppercase tracking-widest">Nuestra Visión</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight italic">
                IMPULSANDO LA <br />
                <span className="text-zinc-800 not-italic">CULTURA URBANA</span>
              </h2>
              <p className="text-zinc-400 text-lg md:text-2xl leading-relaxed font-medium border-l-2 border-[var(--color-blue)] pl-6">
                Ser más que una tienda: convertirnos en el motor que impulse la cultura del skate en nuestra comunidad y más allá.
                Queremos inspirar a nuevas generaciones a patinar, crear y compartir... construyendo un espacio donde cada truco,
                cada caída y cada victoria se viva como parte de una misma pasión.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-900">
                <div>
                  <h4 className="text-white font-black text-3xl mb-1">2024</h4>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Lanzamiento Élite</p>
                </div>
                <div>
                  <h4 className="text-[var(--color-blue)] font-black text-3xl mb-1">+500</h4>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Skaters Activos</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === SECTION 2: MISSION (LIGHT THEME) === */}
      <section className="bg-white py-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div
              className="lg:col-span-6 lg:order-2 relative group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={revealVariants}
            >
              <div className="absolute -inset-4 bg-zinc-200 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative rounded-[3rem] overflow-hidden border border-zinc-100 aspect-[4/5] lg:aspect-auto lg:h-[500px] max-w-[500px] mx-auto lg:mx-0 shadow-2xl">
                <img
                  className="w-full h-full object-cover hover:scale-110 transition-all duration-[2000ms]"
                  src="/animation-2.jpg"
                  alt="Misión Performance SB"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1520156555635-f0bfdd79698d?q=80&w=2000&auto=format&fit=crop" }}
                />
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-6 lg:order-1 space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={revealVariants}
            >
              <div className="inline-block px-4 py-1 bg-zinc-100 border border-zinc-200 rounded-full">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nuestra Misión</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-zinc-950 uppercase tracking-tighter leading-tight italic">
                PASIÓN POR <br />
                <span className="text-zinc-200 not-italic">EL SKATEBOARDING</span>
              </h2>
              <p className="text-zinc-500 text-lg md:text-2xl leading-relaxed font-bold border-l-2 border-zinc-950 pl-6 uppercase tracking-tight">
                Brindar a cada patinador las herramientas, la técnica y el estilo necesarios para superar sus propios límites.
                En Performance SB, no solo vendemos equipo; cultivamos el talento y forjamos una identidad propia en el asfalto.
              </p>
              <p className="text-zinc-400 text-base leading-relaxed font-medium">
                Creemos en el skate como una forma de expresión sin límites. Nuestra misión es democratizar el acceso a formación de alta calidad y productos de primera línea para todos los niveles.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export const About = () => {
  return (
    <Layout>
      <AboutContent />
    </Layout>
  );
};