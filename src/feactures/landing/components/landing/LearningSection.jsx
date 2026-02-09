
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const LearningSection = () => {
    return (
        <section className="relative w-full py-24 flex items-center justify-center overflow-hidden bg-zinc-950 border-t border-zinc-900">

            <div className="relative z-10 max-w-[1000px] w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="order-2 md:order-1 relative rounded-2xl overflow-hidden aspect-video md:aspect-square"
                >
                    <img src="/bg_eventosL3.jpg" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity duration-700 filter grayscale hover:grayscale-0" alt="" />
                    <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 order-1 md:order-2"
                >
                    <div className="text-[var(--color-blue)] text-xs font-bold uppercase tracking-widest">
                        Academia Performance
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                        DOMINA <br />
                        <span className="text-zinc-600">LA TABLA</span>
                    </h2>

                    <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                        Instrucción profesional para todos los niveles. Aprende con los mejores en un ambiente seguro y progresivo.
                    </p>

                    <div className="flex gap-4">
                        <Link to="/preinscriptions" className="flex items-center gap-2 text-white font-bold text-sm hover:text-[var(--color-blue)] transition-colors uppercase tracking-wide">
                            Inscribirse <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
