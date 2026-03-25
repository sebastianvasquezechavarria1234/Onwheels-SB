import React from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export const Coment = () => {
  const reseñas = [
    {
      id: 1,
      nombre: "Emanuel Gonzalez",
      foto: "https://i.pravatar.cc/100?img=11",
      reseña: "Excelente servicio, súper recomendado. La calidad de las tablas es otro nivel.",
      estrellas: 5,
    },
    {
      id: 2,
      nombre: "Laura Zapata",
      foto: "https://i.pravatar.cc/100?img=26",
      reseña: "Muy buena experiencia, los productos son de muy buena calidad. El envío fue rápido.",
      estrellas: 5,
    },
    {
      id: 3,
      nombre: "Carlos Vasquez",
      foto: "https://i.pravatar.cc/100?img=12",
      reseña: "La mejor tienda de skate en Colombia. La atención es personalizada.",
      estrellas: 5,
    },
    {
      id: 4,
      nombre: "Ana Martinez",
      foto: "https://i.pravatar.cc/100?img=44",
      reseña: "Me encantó, atención 10/10. Los profes de la academia son muy pacientes.",
      estrellas: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="bg-zinc-50 py-32 px-4 relative overflow-hidden border-t border-zinc-100">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex flex-col items-center mb-20 text-center space-y-4">
          <span className="text-[var(--color-blue)] text-xs font-black uppercase tracking-[0.4em]">Testimonios</span>
          <h2 className="text-4xl md:text-6xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
            COMUNIDAD <span className="text-zinc-500 italic">SOBRE RUEDAS</span>
          </h2>
          <p className="text-zinc-500 max-w-md text-sm font-medium">
            Lo que nuestros patinadores dicen sobre la experiencia élite.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {reseñas.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative flex flex-col bg-gradient-to-br from-white to-zinc-50 rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/40 p-6 pt-12 transition-all hover:border-[var(--color-blue)]/30 hover:shadow-2xl hover:shadow-[var(--color-blue)]/5"
            >
              {/* Foto - Compact */}
              <div className="absolute -top-6 left-8 w-14 h-14 rounded-2xl border-2 border-white shadow-lg overflow-hidden transition-transform group-hover:scale-110">
                <img
                  src={item.foto}
                  alt={item.nombre}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Quote Mark */}
              <Quote size={32} className="text-zinc-100 absolute bottom-6 right-6 group-hover:text-[var(--color-blue)]/10 transition-colors" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(item.estrellas)].map((_, index) => (
                  <Star key={index} size={12} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Nombre */}
              <h3 className="font-black text-sm text-zinc-950 uppercase tracking-tight mb-3">
                {item.nombre}
              </h3>

              {/* Reseña */}
              <p className="text-zinc-600 text-xs leading-relaxed italic line-clamp-4">
                "{item.reseña}"
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
