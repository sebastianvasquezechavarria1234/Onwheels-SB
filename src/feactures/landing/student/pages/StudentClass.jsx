import { useState, useEffect } from "react"
import { CheckCircle2, Users, Clock, Star, Zap, Trophy, Target, BookOpen, MapPin, Calendar } from "lucide-react"
import { StudentLayout } from "../layout/StudentLayout";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const scheduleData = [
  { id: "lun", day: "Lunes",      time: "9:00 AM - 11:00 AM",  level: "Principiante",      instructor: "Profesor: Daniel", limit: "15 cupos", color: "from-cyan-500 to-blue-500" },
  { id: "mar", day: "Martes",     time: "2:00 PM - 4:00 PM",   level: "Intermedio",        instructor: "Profesor: Hernan", limit: "12 cupos", color: "from-purple-500 to-pink-500" },
  { id: "mie", day: "MiÃ©rcoles",  time: "10:00 AM - 12:00 PM", level: "Principiante",      instructor: "Profesor: Daniel", limit: "15 cupos", color: "from-cyan-500 to-blue-500" },
  { id: "jue", day: "Jueves",     time: "3:00 PM - 5:00 PM",   level: "Avanzado",          instructor: "Profesor: Sebas",  limit: "8 cupos",  color: "from-orange-500 to-red-500" },
  { id: "vie", day: "Viernes",    time: "4:00 PM - 6:00 PM",   level: "Intermedio",        instructor: "Profesor: Daniel", limit: "12 cupos", color: "from-purple-500 to-pink-500" },
  { id: "sab", day: "SÃ¡bado",     time: "9:00 AM - 12:00 PM",  level: "Todos los niveles", instructor: "Profesor: Hernan", limit: "20 cupos", color: "from-green-500 to-teal-500" },
]

const pricingPlans = [
  { id: "popular", name: "Plan Popular", price: "$80.000",  description: ["Acceso ilimitado a clases", "Sesiones grupales", "Ideal para principiantes"], highlight: true, icon: Users },
  { id: "pro",     name: "Plan Pro",     price: "$150.000", description: ["Acceso a clases + talleres", "Entrenamiento personalizado", "Soporte online"], icon: Zap },
  { id: "premium", name: "Plan Premium", price: "$190.000", description: ["Todo lo del Pro", "Eventos exclusivos", "AsesorÃ­a 1 a 1"], icon: Trophy },
]

const benefits = [
  { id: "com",  Icon: Users, title: "Comunidad",   text: "Aprende junto a otros apasionados del skate.", color: "text-primary" },
  { id: "flex", Icon: Clock, title: "Flexibilidad", text: "Horarios adaptados a tu estilo de vida.",      color: "text-secondary" },
  { id: "exp",  Icon: Star,  title: "Expertos",     text: "Profesores con aÃ±os de experiencia.",          color: "text-primary" },
]

const carouselImages = [
  "https://www.madramps.eu/wp-content/uploads/go-x/u/a9e9dd96-5c5c-4e16-8f73-1c4a3adb8d8e/l0,t0,w1500,h2000/image-768x1024.jpg",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80",
]

const estadoConfig = {
  Activa:    { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  Vencida:   { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  Cancelada: { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
}

export const StudentClass = () => {
  const [current, setCurrent] = useState(0)
  const [misMatriculas, setMisMatriculas] = useState([])
  const [loadingMatricula, setLoadingMatricula] = useState(true)
  const [errorMatricula, setErrorMatricula] = useState(null)

  // Carrusel automÃ¡tico
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Fetch matrÃ­culas del estudiante
  useEffect(() => {
    const fetchMisMatriculas = async () => {
      setLoadingMatricula(true)
      setErrorMatricula(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) { setErrorMatricula("No hay sesiÃ³n activa."); return; }

        const res = await fetch(`${API_BASE}/api/matriculas/mis-matriculas`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Error al obtener matrÃ­culas")

        const data = await res.json()
        setMisMatriculas(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setErrorMatricula("No se pudo cargar tu clase asignada.")
      } finally {
        setLoadingMatricula(false)
      }
    }
    fetchMisMatriculas()
  }, [])

  const matriculaActiva = misMatriculas.find(m => m.estado === "Activa") || misMatriculas[0] || null

  return (
    <>
      <StudentLayout>
        <div className="min-h-screen bg-background">

          {/* â”€â”€ Tu clase asignada â”€â”€ */}
          <section className="py-10 px-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="text-primary w-6 h-6" />
              Mi Clase Asignada
            </h2>

            {loadingMatricula ? (
              <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 italic">Cargando tu clase...</p>
              </div>
            ) : errorMatricula ? (
              <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-600 italic">
                {errorMatricula}
              </div>
            ) : !matriculaActiva ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400 italic text-center">
                No tienes ninguna clase asignada aÃºn.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Card matrÃ­cula activa */}
                <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-secondary" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {matriculaActiva.nombre_nivel || "Clase"}
                    </h3>
                    {(() => {
                      const cfg = estadoConfig[matriculaActiva.estado] || estadoConfig.Activa
                      return (
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                          {matriculaActiva.estado}
                        </span>
                      )
                    })()}
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">DÃ­a:</span> {matriculaActiva.dia_semana || "â€”"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Horario:</span>{" "}
                      {matriculaActiva.hora_inicio && matriculaActiva.hora_fin
                        ? `${matriculaActiva.hora_inicio} - ${matriculaActiva.hora_fin}`
                        : "â€”"}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">Sede:</span> {matriculaActiva.nombre_sede || "â€”"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">Plan:</span> {matriculaActiva.nombre_plan || "â€”"}
                    </p>
                    {matriculaActiva.clases_restantes !== undefined && (
                      <p className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-medium">Clases restantes:</span> {matriculaActiva.clases_restantes ?? "â€”"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Historial */}
                {misMatriculas.length > 1 && (
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                      Historial de matrÃ­culas
                    </h4>
                    <div className="space-y-3">
                      {misMatriculas.slice(1).map((m, i) => {
                        const cfg = estadoConfig[m.estado] || estadoConfig.Vencida
                        return (
                          <div key={i} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-gray-100">
                            <div>
                              <p className="font-medium text-gray-800">{m.nombre_nivel}</p>
                              <p className="text-gray-400 text-xs">{m.dia_semana} Â· {m.nombre_plan}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                              {m.estado}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* â”€â”€ Hero â”€â”€ */}
          <div className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-secondary/10">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
            </div>

            <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center relative">
              <div className="slide-in-up">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Target className="w-4 h-4" /> Clases Profesionales
                </div>
                <h1 className="text-foreground text-lg font-medium mb-2">Domina la Tabla</h1>
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-balance">
                  <span className="gradient-text">Clases de Skate</span> que Rompen LÃ­mites
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
                  Aprende desde cero o mejora tus trucos con entrenadores expertos. Horarios flexibles, niveles variados y una comunidad vibrante que te impulsa a crecer.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-blue-900 hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">Quiero unirme</button>
                  <button className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">Ver horarios</button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative w-full max-w-2xl h-[380px] md:h-[420px] overflow-hidden rounded-3xl shadow-2xl">
                  <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent z-10" />
                  <img
                    src={carouselImages[current] || "/placeholder.svg"}
                    alt="Skate carrusel"
                    className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                    {carouselImages.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrent(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${current === idx ? "bg-primary scale-125 shadow-lg" : "bg-white/50 hover:bg-white/80"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* â”€â”€ Beneficios â”€â”€ */}
          <section id="beneficios" className="py-20 bg-muted/30">
            <div className="container mx-auto px-6 bg-gray-100">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 p-5">Â¿Por quÃ© unirte?</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Descubre las ventajas de formar parte de nuestra comunidad de skaters</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {benefits.map(({ id, Icon, title, text, color }) => (
                  <div key={id} className="group bg-card p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border/50 hover:border-primary/20">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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

          {/* â”€â”€ Horarios â”€â”€ */}
          <section id="clases" className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Horarios de Clases</h2>
                <p className="text-muted-foreground text-lg">Encuentra el horario perfecto para tu nivel y disponibilidad</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduleData.map((item) => (
                  <article key={item.id} className="group bg-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-border/50 overflow-hidden relative">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${item.color}`} />
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">{item.day}</h3>
                      <div className="space-y-2 text-muted-foreground">
                        <p className="flex items-center gap-2"><Clock className="w-4 h-4" />{item.time}</p>
                        <p className="font-medium text-card-foreground">{item.level}</p>
                        <p>{item.instructor}</p>
                        <p className="text-primary font-semibold">{item.limit}</p>
                      </div>
                    </div>
                    <button className="mt-4 w-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary py-2 rounded-lg font-medium transition-all duration-300">Reservar cupo</button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* â”€â”€ Planes â”€â”€ */}
          <section id="planes" className="py-20 bg-muted/30">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes de MembresÃ­a</h2>
                <p className="text-muted-foreground text-lg">Elige el plan que mejor se adapte a tus objetivos</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((plan) => {
                  const IconComponent = plan.icon
                  return (
                    <div key={plan.id} className={`group rounded-3xl p-8 shadow-lg text-center border-2 transition-all duration-300 hover:scale-105 relative overflow-hidden ${plan.highlight ? "border-primary bg-linear-to-br from-primary/5 to-secondary/5 shadow-2xl" : "border-border bg-card hover:border-primary/30"}`}>
                      {plan.highlight && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">MÃ¡s Popular</span>
                        </div>
                      )}
                      <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${plan.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-card-foreground">{plan.name}</h3>
                      <div className="text-4xl font-bold mb-6 text-primary">{plan.price}</div>
                      <ul className="space-y-4 mb-8 text-muted-foreground">
                        {plan.description.map((d) => (
                          <li key={d} className="flex items-center gap-3 justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-left">{d}</span>
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.highlight ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl" : "bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground"}`}>Elegir Plan</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* â”€â”€ Footer â”€â”€ */}
          <footer id="contacto" className="relative bg-linear-to-br from-primary via-primary/90 to-secondary text-primary-foreground py-20 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")` }} />
            </div>
            <div className="container bg-blue-900 gap-10 p-20 mx-auto px-6 relative">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-amber-50">Â¿Listo para comenzar tu aventura?</h2>
                <p className="mb-8 text-xl leading-relaxed text-white">PreincrÃ­bete ahora y asegura tu cupo en la prÃ³xima clase. Â¡Tu tabla te estÃ¡ esperando!</p>
                <div className="flex flex-col sm:flex-row gap-7 justify-center">
                  <button className="bg-white text-primary px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">Preinscribirme Ahora</button>
                  <button className="border-2 border-white text-white hover:bg-red-800 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300">MÃ¡s informaciÃ³n</button>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </StudentLayout>
    </>
  )
}

export default StudentClass
