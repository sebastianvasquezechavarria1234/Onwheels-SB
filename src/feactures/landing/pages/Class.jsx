"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Users, Clock, Star, Target, Trophy, Icon } from "lucide-react";
import { Layout } from "../layout/Layout";

// Horarios por turno (mañana, tarde, noche)
const scheduleData = [
  {
    id: "morning",
    time: "8:00 a.m. – 10:00 a.m.",
    description: "Perfecto para comenzar el día con energía y entrenamiento.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "afternoon",
    time: "2:00 p.m. – 4:00 p.m.",
    description: "Ideal para estudiantes y trabajadores que buscan desconectarse.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "night",
    time: "6:00 p.m. – 8:00 p.m.",
    description: "Ambiente tranquilo para practicar después de la jornada.",
    color: "from-purple-600 to-indigo-800",
  },
];

// Planes actualizados
const pricingPlans = [
  {
    name: "Plan Individual",
    price: "Personalizado",
    description: ["Sesiones 1 a 1", "Seguimiento continuo", "Ritmo personalizado"],
    icon: Target,
  },
  {
    name: "Plan Grupal",
    price: "Desde $70.000",
    description: ["Dinámicas colectivas", "Conoce otros skaters", "Ejercicios en equipo"],
    icon: Users,
  },
  {
    name: "Plan Mensual",
    price: "Todo incluido",
    description: ["Todas las clases del mes", "Descuentos exclusivos", "Seguimiento de progreso"],
    icon: Trophy,
    highlight: true,
  },
];

// Beneficios
const benefits = [
  {
    Icon: Users,
    title: "Comunidad",
    text: "Aprende junto a otros apasionados del skate.",
    color: "text-primary",
  },
  {
    Icon: Clock,
    title: "Flexibilidad",
    text: "Horarios adaptados a tu estilo de vida.",
    color: "text-secondary",
  },
  {
    Icon: Star,
    title: "Expertos",
    text: "Profesores con años de experiencia.",
    color: "text-primary",
  },
];

// Imágenes de clases reales
const classImages = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542258862727-8f0f8a4e8a25?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09c865e852?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517646287270-2e8c5f4e3c5f?auto=format&fit=crop&w=800&q=80",
];

export const Class = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % classImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* HERO */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center relative">
            <div className="slide-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="w-4 h-4" />
                Clases Profesionales
              </div>

              <h1 className="text-foreground text-lg font-medium mb-2">Domina la Tabla</h1>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-balance">
                <span className="gradient-text">Clases de Skate</span> que Rompen Límites
              </h2>

              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
                Aprende desde cero o mejora tus trucos con entrenadores expertos. Horarios flexibles, niveles variados y
                una comunidad vibrante que te impulsa a crecer.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-900 hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Clase de Prueba GRATIS
                </button>
                <button className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                  Ver horarios
                </button>
              </div>
            </div>

            {/* Carrusel Hero */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl h-[380px] md:h-[420px] overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent z-10" />
                <img
                  src={classImages[currentImage] || "/placeholder.svg"}
                  alt="Clases de skate en acción"
                  className="w-full h-full object-cover transition-all duration-700"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                  {classImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentImage === idx ? "bg-primary scale-125 shadow-lg" : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GALERÍA DE CLASES */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Así son nuestras clases</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Entrenamiento seguro, divertido y profesional en nuestras sedes acondicionadas de Medellín.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {classImages.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={img}
                    alt={`Clase de skate ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section id="beneficios" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué unirte?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Descubre las ventajas de formar parte de nuestra comunidad de skaters
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map(({  title, text, color }, idx) => (
                <div
                  key={idx}
                  className="group bg-card p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border/50 hover:border-primary/20"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      {/* <Icon className="w-8 h-8" /> */}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HORARIOS */}
        <section id="horarios" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Horarios Disponibles</h2>
              <p className="text-muted-foreground text-lg">
                Elige el turno que mejor se adapte a tu rutina
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {scheduleData.map((item) => (
                <article
                  key={item.id}
                  className="group bg-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-border/50 overflow-hidden relative"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {item.time}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes y Tarifas</h2>
              <p className="text-muted-foreground text-lg">Elige el plan que mejor se adapte a tus objetivos</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, idx) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={idx}
                    className={`group rounded-3xl p-8 shadow-lg text-center border-2 transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                      plan.highlight
                        ? "border-primary bg-gradient-to-br from-primary/5 to-secondary/5 shadow-2xl"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                          Recomendado
                        </span>
                      </div>
                    )}

                    <div className="flex justify-center mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          plan.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <IconComponent className="w-8 h-8" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2 text-card-foreground">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-6 text-primary">{plan.price}</div>

                    <ul className="space-y-3 mb-8 text-muted-foreground">
                      {plan.description.map((d, i) => (
                        <li key={i} className="flex items-center gap-3 justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        plan.highlight
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                          : "bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground"
                      }`}
                    >
                      Elegir Plan
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Class;
