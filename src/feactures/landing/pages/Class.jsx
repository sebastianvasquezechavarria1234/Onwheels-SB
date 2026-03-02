// src/feactures/landing/pages/Class.jsx
import React, { useEffect, useState } from "react";
import { Layout } from "../layout/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, MapPin, Clock, Star, Check, Shield, Zap, Target, Play, BarChart, Users, Trophy } from "lucide-react";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { getPreinscriptionPath } from "../../../utils/roleHelpers";
import { getClases, getPlanes } from "../../../services/claseServices";

export const ClassContent = () => {
  const { user } = useAuth();
  const joinPath = getPreinscriptionPath(user);

  const [clases, setClases] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clasesData, planesData] = await Promise.all([
          getClases(),
          getPlanes()
        ]);
        setClases(clasesData.slice(0, 3));
        setPlanes(planesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-zinc-950 text-white overflow-x-hidden">
      {/* === HERO: IMMERSIVE VIDEO === */}
      <section className="relative w-full h-[90vh] bg-black overflow-hidden flex flex-col items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60 scale-105"
            poster="/bg_hero_landing.jpg"
          >
            <source src="/vd_landing1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/10"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex justify-center items-center gap-4 mb-8">
              <span className="h-[2px] w-12 bg-[var(--color-blue)]"></span>
              <span className="uppercase tracking-[0.6em] text-[10px] md:text-sm text-[var(--color-blue)] font-black">Academia de Formación</span>
              <span className="h-[2px] w-12 bg-[var(--color-blue)]"></span>
            </div>

            <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black leading-none tracking-tighter mb-10 uppercase italic">
              ÉLITE<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-blue)] to-cyan-500 not-italic">SB</span>
            </h1>

            <p className="text-zinc-400 text-base md:text-2xl max-w-3xl mx-auto leading-relaxed mb-16 font-medium">
              No somos una escuela común. Somos un centro de alto rendimiento donde la técnica se encuentra con la cultura urbana. Tu camino profesional inicia aquí.
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <Link to={joinPath} className="group relative px-12 py-6 bg-white text-black rounded-full font-black overflow-hidden text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10">
                <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest">
                  Comienza tu Viaje <ArrowUpRight size={20} />
                </span>
                <div className="absolute inset-0 bg-[var(--color-blue)] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-widest">
                  Comienza tu Viaje <ArrowUpRight size={20} />
                </span>
              </Link>
              <div className="flex items-center gap-6 text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em]">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800" />)}
                </div>
                +500 Alumnos Activos
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === NARRATIVE: THE JOURNEY === */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 space-y-8 sticky top-32">
              <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">El Proceso Performance SB</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                TU EVOLUCIÓN <br />
                <span className="text-zinc-800 italic">SIN LÍMITES</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-medium border-l-2 border-[var(--color-blue)] pl-6">
                Entendemos que cada skater tiene un ritmo único. Nuestra formación no es lineal; es circular, centrada en fortalecer los cimientos para que el estilo surja de manera natural y segura.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-900">
                <div>
                  <h4 className="text-white font-black text-3xl mb-1">98%</h4>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Tasa de Progreso</p>
                </div>
                <div>
                  <h4 className="text-[var(--color-blue)] font-black text-3xl mb-1">1:5</h4>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Coach por Alumnos</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-12 pl-0 lg:pl-12">
              {[
                {
                  step: "01",
                  title: "Fundamentos Sólidos",
                  desc: "Antes de saltar, hay que saber rodar. Nos enfocamos en la postura, el equilibrio dinámico y la cinemática del cuerpo sobre la tabla. Sin bases, no hay trucos.",
                  icon: <BarChart size={24} className="text-[var(--color-blue)]" />
                },
                {
                  step: "02",
                  title: "Técnica Creativa",
                  desc: "Una vez dominas la tabla, aprendes a manipularla. Entramos en ollies, grinds y transiciones, analizando cada milímetro de movimiento para optimizar el pop.",
                  icon: <Zap size={24} className="text-[var(--color-blue)]" />
                },
                {
                  step: "03",
                  title: "Estilo Propio (Mastery)",
                  desc: "El nivel final es cuando la técnica se vuelve invisible. Te ayudamos a encontrar tu 'flow', combinando fluidez con dificultad técnica en cualquier terreno.",
                  icon: <Trophy size={24} className="text-[var(--color-blue)]" />
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group relative bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-900 hover:border-zinc-800 transition-all"
                >
                  <div className="absolute top-8 right-10 text-6xl font-black text-white/5 italic">{item.step}</div>
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:bg-[var(--color-blue)] group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div className="max-w-md">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{item.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === SESSIONS: CALENDAR GRID === */}
      <section className="py-32 bg-zinc-950 border-t border-zinc-900 relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-24 max-w-3xl mx-auto space-y-6">
            <span className="text-[var(--color-blue)] text-xs font-black uppercase tracking-[0.4em]">Optimiza tu Tiempo</span>
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              SESIONES DE <br />
              <span className="text-zinc-800 italic">ENTRENAMIENTO</span>
            </h2>
            <p className="text-zinc-500 text-sm md:text-lg font-medium leading-relaxed">
              Consulta nuestra disponibilidad en tiempo real. Grupos reducidos para garantizar una atención personalizada por cada instructor élite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-72 bg-zinc-900/50 rounded-[2.5rem] animate-pulse" />
              ))
            ) : clases.length > 0 ? (
              clases.map((clase, i) => (
                <motion.div
                  key={clase.id_clase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col bg-zinc-900/30 hover:bg-zinc-900 border border-zinc-800/50 hover:border-[var(--color-blue)]/30 rounded-[2.5rem] p-10 transition-all duration-500 relative"
                >
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-[9px] font-black px-4 py-2 bg-zinc-950 rounded-full text-zinc-400 uppercase tracking-widest border border-zinc-800 group-hover:bg-[var(--color-blue)] group-hover:text-white transition-colors">
                      {clase.nombre_nivel || "Cualquier Nivel"}
                    </span>
                    <Clock size={20} className="text-zinc-800 group-hover:text-[var(--color-blue)] transition-colors" />
                  </div>

                  <div className="space-y-4 mb-10">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-[var(--color-blue)] transition-colors leading-tight">
                      {clase.descripcion || `Clase en ${clase.nombre_sede}`}
                    </h3>
                    <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                      <MapPin size={16} className="text-[var(--color-blue)]" />
                      {clase.nombre_sede}
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-zinc-800/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-1">Horario</span>
                      <span className="text-white text-xs font-black uppercase tracking-tighter flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-600" /> {clase.hora_inicio?.slice(0, 5)} - {clase.hora_fin?.slice(0, 5)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-1">Coach</span>
                      <span className="text-zinc-400 text-xs font-black uppercase tracking-widest block italic underline decoration-[var(--color-blue)] decoration-2 underline-offset-4">
                        {clase.instructores?.[0]?.nombre_instructor?.split(' ')[0] || "Staff SB"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-zinc-800 font-black uppercase tracking-[0.5em] border-2 border-dashed border-zinc-900 rounded-[3rem]">
                Cargando itinerarios...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* === VISUALS: CREATIVE GALLERY === */}
      <section className="bg-zinc-950 py-32 border-y border-zinc-900 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-20 text-center">
          <span className="text-red-600 text-xs font-black uppercase tracking-[0.6em] mb-4 block">Action Proof</span>
          <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            ESTILO EN <br />
            <span className="text-[var(--color-blue)]">MOVIMIENTO</span>
          </h2>
          <p className="text-zinc-500 font-medium max-w-2xl mx-auto text-sm md:text-lg">
            No dejes que te lo cuenten. Estas son las vibraciones reales que se viven en cada una de nuestras sedes. Técnica, comunidad y mucha tabla.
          </p>
        </div>

        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-12 gap-6 h-[700px]">
            {/* Main Video Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-6 relative rounded-[3rem] overflow-hidden bg-zinc-900 group border border-zinc-800/50"
            >
              <video src="/vd_landing1.mp4" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" muted loop playsInline onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
              <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Play size={30} fill="white" className="ml-2" />
                </div>
              </div>
              <div className="absolute bottom-12 left-12 right-12 z-10">
                <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Dominio del Park</h4>
                <p className="text-zinc-400 text-xs font-black uppercase tracking-widest italic">Sesión de Formación Élite / Sede Central</p>
              </div>
            </motion.div>

            {/* Right Staggered Column */}
            <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-6 h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-[2.5rem] overflow-hidden bg-zinc-900 group border border-zinc-800/50 shadow-inner"
              >
                <video src="/vd_landing2.mp4" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" muted loop playsInline onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[10px] font-black text-white/50 bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest">Street Focus</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative rounded-[2.5rem] overflow-hidden bg-zinc-900 group border border-zinc-800/50 shadow-inner"
              >
                <video src="/vd_landing3.mp4" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" muted loop playsInline onMouseEnter={e => e.target.play()} onMouseLeave={e => e.target.pause()} />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[10px] font-black text-white/50 bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest">Bowl Session</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="col-span-2 relative h-[320px] rounded-[3rem] overflow-hidden group border border-zinc-800/50"
              >
                <img src="/bg_eventosL3.jpg" className="w-full h-full object-cover grayscale-100 brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000" alt="Training" />
                <div className="absolute inset-x-0 bottom-0 p-12 bg-linear-to-t from-zinc-950 to-transparent">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Galería de Progreso</h4>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Visita nuestro Instagram para más contenido</p>
                    </div>
                    <ArrowUpRight className="text-[var(--color-blue)]" size={32} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* === PLANES: REFINED PROPORTIONS (DYNAMIC DATA) === */}
      <section className="py-32 bg-zinc-950 text-white relative border-t border-zinc-900">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-24 space-y-8 max-w-4xl mx-auto">
            <div className="h-1.5 w-16 bg-[var(--color-blue)] rounded-full"></div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              INVIERTE EN <br />
              <span className="text-zinc-800 italic">TU TALENTO</span>
            </h2>
            <p className="text-zinc-500 text-sm md:text-lg font-bold uppercase tracking-tight leading-relaxed">
              Nuestros planes están diseñados para maximizar tu aprendizaje. Desde iniciación hasta entrenamiento intensivo de competencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[550px] bg-zinc-900 rounded-[3rem] animate-pulse" />
              ))
            ) : planes.map((plan) => (
              <div key={plan.id_plan} className={`flex flex-col group p-12 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden ${parseFloat(plan.precio) > 100000 ? 'bg-zinc-900 text-white border-[var(--color-blue)]/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] scale-105 z-10' : 'bg-zinc-900/30 text-white border-zinc-900 hover:border-zinc-800'}`}>
                {parseFloat(plan.precio) > 100000 && <div className="absolute top-0 right-0 py-2 px-12 bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rotate-45 translate-x-10 translate-y-6">Best Choice</div>}

                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className={parseFloat(plan.precio) > 100000 ? 'text-red-600' : 'text-[var(--color-blue)]'} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Acceso Académico</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">{plan.nombre_plan}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-6xl font-black ${parseFloat(plan.precio) > 100000 ? 'text-red-500' : 'text-white'}`}>${parseInt(plan.precio).toLocaleString()}</span>
                    <span className="text-xs font-black opacity-30 uppercase tracking-widest ml-2">/ mensual</span>
                  </div>
                </div>

                <p className={`text-sm mb-12 leading-relaxed font-bold uppercase tracking-tight min-h-[48px] text-zinc-500`}>
                  {plan.descripcion || "Formación de alto rendimiento impulsada por el sistema SB."}
                </p>

                <ul className="space-y-6 mb-16 border-t border-zinc-100/10 pt-8">
                  {[
                    `${plan.numero_clases || 4} Sesiones Mensuales`,
                    "Seguro Deportivo Mensual",
                    plan.descuento_porcentaje > 0 ? `${plan.descuento_porcentaje}% Descuento Store` : "Certificación de Nivel",
                    "Pack Welcome Performance SB"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                      <div className={`mt-0.5 shrink-0 ${parseFloat(plan.precio) > 100000 ? 'text-red-600' : 'text-[var(--color-blue)]'}`}><Check size={18} strokeWidth={4} /></div>
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`mt-auto w-full py-5 rounded-[2rem] text-center font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-xl ${parseFloat(plan.precio) > 100000 ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-[1.03] shadow-red-600/20' : 'bg-white text-black hover:bg-[var(--color-blue)] hover:text-white shadow-white/5'}`}
                >
                  Adquirir Ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA: FINAL PUSH === */}
      <section className="py-40 bg-zinc-950 border-t border-zinc-900 flex flex-col items-center text-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25rem] md:text-[45rem] font-black text-white/[0.01] pointer-events-none select-none italic z-0 leading-none">
          EVOLVE
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl"
        >
          <div className="flex justify-center mb-10">
            <div className="px-6 py-2 bg-[var(--color-blue)]/10 border border-[var(--color-blue)]/30 rounded-full animate-pulse">
              <span className="text-[var(--color-blue)] text-xs font-black uppercase tracking-widest">Inscripciones Abiertas</span>
            </div>
          </div>
          <h2 className="text-6xl md:text-[10rem] font-black text-white mb-12 uppercase tracking-tighter leading-[0.8]">
            TU MOMENTO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 italic">ES AHORA</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto mb-20 font-black uppercase tracking-[0.4em] text-[10px] md:text-sm leading-relaxed">
            La diferencia entre un amateur y un profesional es la formación. Únete a la comunidad de skate más grande del país.
          </p>
          <Link to={joinPath} className="inline-flex items-center gap-4 text-white font-black text-sm md:text-2xl hover:text-[var(--color-blue)] transition-all uppercase tracking-[0.5em] border-b-8 border-[var(--color-blue)] pb-6 hover:gap-8 active:scale-95 text-glow">
            RESERVAR MI LUGAR <ArrowUpRight size={32} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

const Class = () => {
  return (
    <Layout>
      <ClassContent />
    </Layout>
  );
};

export default Class;
