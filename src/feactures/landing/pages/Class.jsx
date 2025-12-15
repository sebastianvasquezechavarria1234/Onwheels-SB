// src/pages/LandingSkate.jsx
import React from "react";
import { Layout } from "../layout/Layout";

const Class = () => {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col font-sans">

        {/* === HERO: FULLSCREEN VIDEO / IMAGE + TEXT OVERLAY === */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Video de fondo (opcional) o imagen con overlay */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-[-1]"
            poster="https://images.unsplash.com/photo-1600817179420-1a1b6a1b5b5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-skater-riding-on-a-ramp-41514-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/60 z-0"></div>

          <div className="container mx-auto px-6 text-center text-white relative z-10 max-w-5xl">
            {/* Badge de temporada */}
            <div className="inline-block bg-red-600 px-6 py-2 rounded-full text-sm font-bold tracking-wide mb-8">
              ¡NUEVA TEMPORADA 2025!
            </div>

            {/* Título FORMACIÓN con efecto split */}
            <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter mb-6">
              <span className="block">FORMA</span>
              <span className="block text-red-500 -mt-4 md:-mt-6">CIÓN</span>
            </h1>

            {/* Subtítulo inspirador — más largo, más creativo */}
            <p className="max-w-3xl mx-auto text-base md:text-lg opacity-90 mb-10 font-light leading-relaxed">
              Donde cada caída es un paso hacia el primer kickflip. Donde los errores no son fracasos, sino lecciones grabadas en asfalto. Clases reales, con profesores que fueron patinadores antes de ser instructores. Comunidad que crece, se apoya y celebra cada truco logrado —por pequeño que sea. Porque aquí no enseñamos a patinar. Enseñamos a volar.
            </p>

            {/* Botones como en tu imagen */}
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/preinscripcion"
                className="group relative px-8 py-4 bg-red-600 text-white font-bold rounded-full overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10">Empieza hoy</span>
                <span className="absolute inset-0 bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>
              <a
                href="#por-why"
                className="group px-8 py-4 border-2 border-white text-white font-bold rounded-full transition-all duration-300 hover:bg-white hover:text-blue-900"
              >
                Conoce el método
              </a>
            </div>
          </div>

          {/* Curva blanca en la base (como en tu imagen) */}
          <svg
            className="absolute bottom-0 left-0 w-full h-24 md:h-32 text-white"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path
              fill="white"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </section>

        {/* === GALLERY: IMÁGENES GRANDES CON ESPACIO === */}
        <section id="gallery" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-blue-900 mb-16">Mira cómo sucede</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/10 rounded-3xl overflow-hidden h-96 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1543090848-bd32b4a4e006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Clase de skate 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-6">
                <div className="bg-black/10 rounded-2xl h-48 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1600817179420-1a1b6a1b5b5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Clase de skate 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-black/10 rounded-2xl h-48 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1600814863151-8f7b9b8a6a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Clase de skate 3"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === POR QUÉ FORMACIÓN — NARRATIVA PROFUNDA + IMÁGENES === */}
        <section id="por-why" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-4">No es solo una clase.</h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Es tu primera comunidad real sobre ruedas. Donde los errores se celebran, los trucos se comparten, y el progreso se mide en sonrisas, no en metros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Profesores que skatan",
                  desc: "No son ‘instructores’. Son skaters que han vivido la calle, las caídas, los triunfos y las frustraciones. Te enseñan desde la experiencia, no desde un manual. Porque saben que lo más importante no es el truco, sino cómo te sientes al intentarlo.",
                  img: "https://images.unsplash.com/photo-1543090848-bd32b4a4e006?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                },
                {
                  title: "Espacio 100% seguro",
                  desc: "Pista diseñada para aprender sin miedo. Suelo de goma, rampas suaves, equipo de primeros auxilios siempre listo. Aquí no importa si eres principiante o avanzado: todos tienen su lugar, su ritmo y su espacio para crecer. Porque el skate no es competencia. Es libertad.",
                  img: "https://images.unsplash.com/photo-1600817179420-1a1b6a1b5b5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                },
                {
                  title: "Progreso real, no promesas vacías",
                  desc: "Seguimiento semanal, videos de tu evolución, metas personalizadas y retroalimentación honesta. No te diremos que eres ‘el mejor’ si aún no lo eres. Pero sí te diremos qué hacer para llegar allí. Porque tu progreso es nuestro orgullo.",
                  img: "https://images.unsplash.com/photo-1600814863151-8f7b9b8a6a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group p-8 bg-white border border-gray-200 rounded-3xl transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg mb-6"
                  />
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">{item.title}</h3>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === PLANES — CON HISTORIA Y PERSONALIDAD === */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900">Elige tu ruta</h2>
              <p className="text-gray-700 mt-4">No hay “uno para todos”. Aquí tu plan crece contigo —como tu habilidad, como tu pasión.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 p-8 border-2 border-gray-200 rounded-3xl hover:border-red-500 transition-colors">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">RUTA INICIAL</h3>
                <p className="text-4xl font-extrabold text-red-600 mb-6">$45.000/mes</p>
                <ul className="space-y-3 mb-8">
                  {["2 clases semanales", "Acceso a pista", "Seguro incluido", "Reporte mensual"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span> {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-600 mb-6">Ideal para quienes empiezan, pero no quieren quedarse atrás.</p>
                <a
                  href="/preinscripcion"
                  className="inline-block text-red-600 font-bold border-b-2 border-red-600 pb-1 hover:border-red-800"
                >
                  Empieza tu camino →
                </a>
              </div>

              <div className="flex-1 p-8 bg-blue-950 text-white rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  TOP
                </div>
                <h3 className="text-2xl font-bold mb-4">RUTA PRO</h3>
                <p className="text-4xl font-extrabold mb-6">$75.000/mes</p>
                <ul className="space-y-3 mb-8">
                  {["4 clases semanales", "Equipo incluido", "Videos de análisis", "Acceso a eventos", "Mentoría 1:1"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-300 mt-1">•</span> {item}
                    </li>
                  ))}
                </ul>
                <p className="text-white/80 mb-6">Para quienes ya no quieren solo aprender. Quieren dominar.</p>
                <a
                  href="/preinscripcion"
                  className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition"
                >
                  Únete a la élite
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* === CTA FINAL — EMOCIONAL Y DIRECTO === */}
        <section className="py-24 bg-gradient-to-r from-blue-900 to-red-700 text-white text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-black mb-6">¿Y si hoy fuera el día?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-10 opacity-90">
              No necesitas ser bueno. Solo necesitas empezar. Porque el mejor truco no es el que más altura tiene, sino el que te hace sentir libre. ¿Listo para subirte a tu tabla?
            </p>
            <a
              href="/preinscripcion"
              className="inline-block bg-white text-blue-900 px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
            >
              Reserva tu clase GRATIS
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Class;
