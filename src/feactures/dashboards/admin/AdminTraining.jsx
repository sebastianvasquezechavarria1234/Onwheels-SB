"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Users, Clock, Star, Zap, Trophy, Target } from "lucide-react"
import { StudentLayout } from "../layout/StudentLayout";

const scheduleData = [
  {
    id: "lun",
    day: "Lunes",
    time: "9:00 AM - 11:00 AM",
    level: "Principiante",
    instructor: "Profesor: Daniel",
    limit: "15 cupos",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "mar",
    day: "Martes",
    time: "2:00 PM - 4:00 PM",
    level: "Intermedio",
    instructor: "Profesor: Hernan",
    limit: "12 cupos",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "mie",
    day: "Miércoles",
    time: "10:00 AM - 12:00 PM",
    level: "Principiante",
    instructor: "Profesor: Daniel",
    limit: "15 cupos",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "jue",
    day: "Jueves",
    time: "3:00 PM - 5:00 PM",
    level: "Avanzado",
    instructor: "Profesor: Sebas",
    limit: "8 cupos",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "vie",
    day: "Viernes",
    time: "4:00 PM - 6:00 PM",
    level: "Intermedio",
    instructor: "Profesor: Daniel",
    limit: "12 cupos",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "sab",
    day: "Sábado",
    time: "9:00 AM - 12:00 PM",
    level: "Todos los niveles",
    instructor: "Profesor: Hernan",
    limit: "20 cupos",
    color: "from-green-500 to-teal-500",
  },
]

const pricingPlans = [
  {
    id: "popular",
    name: "Plan Popular",
    price: "$80.000",
    description: ["Acceso ilimitado a clases", "Sesiones grupales", "Ideal para principiantes"],
    highlight: true,
    icon: Users,
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: "$150.000",
    description: ["Acceso a clases + talleres", "Entrenamiento personalizado", "Soporte online"],
    icon: Zap,
  },
  {
    id: "premium",
    name: "Plan Premium",
    price: "$190.000",
    description: ["Todo lo del Pro", "Eventos exclusivos", "Asesoría 1 a 1"],
    icon: Trophy,
  },
]

const benefits = [
  {
    id: "com",
    Icon: Users,
    title: "Comunidad",
    text: "Aprende junto a otros apasionados del skate.",
    color: "text-primary",
  },
  {
    id: "flex",
    Icon: Clock,
    title: "Flexibilidad",
    text: "Horarios adaptados a tu estilo de vida.",
    color: "text-secondary",
  },
  { id: "exp", Icon: Star, title: "Expertos", text: "Profesores con años de experiencia.", color: "text-primary" },
]

const carouselImages = [
  "https://www.madramps.eu/wp-content/uploads/go-x/u/a9e9dd96-5c5c-4e16-8f73-1c4a3adb8d8e/l0,t0,w1500,h2000/image-768x1024.jpg",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
]

export const AdminTraining = () => {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
    <StudentLayout>
      <div className="min-h-screen bg-background">

        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center relative">
            {/* Texto izquierda */}
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
                <button className="bg-blue-900 hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 pulse-glow text-white">
                  Quiero unirme
                </button>
                <button className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                  Ver horarios
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl h-[380px] md:h-[420px] overflow-hidden rounded-3xl shadow-2xl float-animation">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent z-10" />
                <img
                  src={carouselImages[current] || "/placeholder.svg"}
                  alt="Skate carrusel"
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                />
                {/* Puntos de navegación mejorados */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                  {carouselImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        current === idx ? "bg-primary scale-125 shadow-lg" : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="beneficios" className="py-20 bg-muted/30 ">
          <div className="container mx-auto px-6 bg-gray-100 ">
            <div className="text-center mb-16  ">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 p-5 ">¿Por qué unirte?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Descubre las ventajas de formar parte de nuestra comunidad de skaters
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map(({ id, Icon, title, text, color }) => (
                <div
                  key={id}
                  className="group bg-card p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border/50 hover:border-primary/20"
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-8 h-8 ${color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-card-foreground">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="clases" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Horarios de Clases</h2>
              <p className="text-muted-foreground text-lg">
                Encuentra el horario perfecto para tu nivel y disponibilidad
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduleData.map((item) => (
                <article
                  key={item.id}
                  className="group bg-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-border/50 overflow-hidden relative"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {item.day}
                    </h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </p>
                      <p className="font-medium text-card-foreground">{item.level}</p>
                      <p>{item.instructor}</p>
                      <p className="text-primary font-semibold">{item.limit}</p>
                    </div>
                  </div>

                  <button className="mt-4 w-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary py-2 rounded-lg font-medium transition-all duration-300">
                    Reservar cupo
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="planes" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes de Membresía</h2>
              <p className="text-muted-foreground text-lg">Elige el plan que mejor se adapte a tus objetivos</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => {
                const IconComponent = plan.icon
                return (
                  <div
                    key={plan.id}
                    className={`group rounded-3xl p-8 shadow-lg text-center border-2 transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                      plan.highlight
                        ? "border-primary bg-gradient-to-br from-primary/5 to-secondary/5 shadow-2xl"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                          Más Popular
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
                    <div className="text-4xl font-bold mb-6 text-primary">{plan.price}</div>

                    <ul className="space-y-4 mb-8 text-muted-foreground">
                      {plan.description.map((d) => (
                        <li key={d} className="flex items-center gap-3 justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-left">{d}</span>
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
                )
              })}
            </div>
          </div>
        </section>

        <footer
          id="contacto"
          className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground py-20 text-center overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container bg-blue-900  gap-10 p-20  mx-auto px-6 relative">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl text text-amber-50 font-bold mb-6 text-balance">¿Listo para comenzar tu aventura?</h2>
              <p className="mb-8 text-xl leading-relaxed text-primary-foreground/90 text-white">
                Preinscríbete ahora y asegura tu cupo en la próxima clase. ¡Tu tabla te está esperando!
              </p>

              <div className="flex flex-col sm:flex-row gap-7 justify-center">
                <button className="bg-white text-primary px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Preinscribirme Ahora
                </button>
                <button className="border-2 border-white text-white hover:bg-red-800 hover:text-primary px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                  Más información
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

    </StudentLayout>
    </>

  
  )
}

export default AdminTraining
