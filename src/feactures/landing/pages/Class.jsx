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
      <section className="relative w-full h-auto min-h-screen md:h-[90vh] bg-black overflow-hidden flex flex-col items-center justify-center pt-24 md:pt-20 pb-10 md:pb-0">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-30 scale-105"
            poster="/bg_hero_landing.jpg"
          >
            <source src="/vd_landing1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]"></div>
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

            <h1 className="text-3xl sm:text-5xl md:text-9xl lg:text-[12rem] font-black leading-none tracking-tighter mb-6 md:mb-10 uppercase italic">
              PERFORMANCE<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-blue)] to-cyan-500 not-italic">SB</span>
            </h1>

            <p className="text-zinc-400 text-sm md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8 md:mb-16 font-medium px-4 md:px-0">
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
      <section className="py-16 md:py-32 bg-zinc-950">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
              <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">El Proceso Performance SB</span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
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
                  className="group relative bg-zinc-900/40 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-900 hover:border-zinc-800 transition-all"
                >
                  <div className="absolute top-6 right-6 md:top-8 md:right-10 text-4xl md:text-6xl font-black text-white/5 italic">{item.step}</div>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start">
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

      {/* === SESSIONS: CALENDAR GRID (LIGHT THEME) === */}
      <section className="py-16 md:py-32 bg-white relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-24 max-w-3xl mx-auto space-y-4 md:space-y-6">
            <span className="text-[var(--color-blue)] text-xs font-black uppercase tracking-[0.4em]">Optimiza tu Tiempo</span>
            <h2 className="text-3xl sm:text-5xl md:text-8xl font-black text-zinc-950 uppercase tracking-tighter leading-none">
              SESIONES DE <br />
              <span className="text-zinc-100 italic">ENTRENAMIENTO</span>
            </h2>
            <p className="text-zinc-500 text-sm md:text-lg font-medium leading-relaxed">
              Consulta nuestra disponibilidad en tiempo real. Grupos reducidos para garantizar una atención personalizada por cada instructor élite.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="h-72 bg-zinc-100 rounded-[2.5rem] animate-pulse" />
              ))
            ) : clases.length > 0 ? (
              clases.map((clase, i) => (
                <motion.div
                  key={clase.id_clase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group flex flex-col md:flex-row bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-[2rem] p-4 transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] gap-6 items-center"
                >
                  <div className="w-full md:w-[200px] h-[200px] shrink-0 relative rounded-[1.5rem] overflow-hidden bg-zinc-900">
                    {clase.url_imagen ? (
                      <img
                        src={clase.url_imagen}
                        alt={clase.descripcion || "Imagen de la clase"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <MapPin size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
                  </div>

                  <div className="flex-grow flex flex-col py-4 pr-6 w-full">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black px-3 py-1 bg-zinc-900 rounded-lg text-[var(--color-blue)] uppercase tracking-widest border border-zinc-800 transition-colors">
                        {clase.nombre_nivel || "Cualquier Nivel"}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight group-hover:text-zinc-300 transition-colors leading-tight mb-2 line-clamp-2">
                      {clase.descripcion || `Clase en ${clase.nombre_sede}`}
                    </h3>

                    <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-6">
                      <MapPin size={14} className="text-zinc-600" />
                      {clase.nombre_sede}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-zinc-900 pt-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Horario</span>
                        <span className="text-zinc-300 text-xs font-black uppercase tracking-tighter flex items-center gap-1.5">
                          <Clock size={12} className="text-zinc-500" />
                          {clase.dia_semana || clase.dia || "General"} • {clase.hora_inicio?.slice(0, 5)} - {clase.hora_fin?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Coach</span>
                        <span className="text-zinc-400 text-xs font-black uppercase tracking-widest block italic">
                          {clase.instructores?.[0]?.nombre_instructor?.split(' ')[0] || "Staff SB"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center text-zinc-300 font-black uppercase tracking-[0.5em] border-2 border-dashed border-zinc-100 rounded-[3rem]">
                Cargando itinerarios...
              </div>
            )}
          </div>
        </div>
      </section>


      {/* === PLANES: REFINED PROPORTIONS (DYNAMIC DATA) === */}
      <section className="py-16 md:py-32 bg-zinc-950 text-white relative border-t border-zinc-900">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12 md:mb-24 space-y-6 md:space-y-8 max-w-4xl mx-auto">
            <div className="h-1.5 w-16 bg-[var(--color-blue)] rounded-full"></div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              INVIERTE EN <br />
              <span className="text-zinc-800 italic">TU TALENTO</span>
            </h2>
            <p className="text-zinc-500 text-sm md:text-lg font-bold uppercase tracking-tight leading-relaxed">
              Nuestros planes están diseñados para maximizar tu aprendizaje. Desde iniciación hasta entrenamiento intensivo de competencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-zinc-900 rounded-[2rem] animate-pulse" />
              ))
            ) : planes.map((plan) => (
              <div key={plan.id_plan} className={`flex flex-col group p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${parseFloat(plan.precio) > 100000 ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-[var(--color-blue)]/50 shadow-xl shadow-[var(--color-blue)]/10 scale-100 md:scale-105 z-10' : 'bg-zinc-950/50 text-white border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800'}`}>
                {parseFloat(plan.precio) > 100000 && <div className="absolute top-0 right-0 py-1.5 px-10 bg-[var(--color-blue)] text-white text-[9px] font-black uppercase tracking-[0.2em] rotate-45 translate-x-8 translate-y-6 shadow-lg shadow-[var(--color-blue)]/50">Recomendado</div>}

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className={parseFloat(plan.precio) > 100000 ? 'text-[var(--color-blue)]' : 'text-zinc-600'} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Plan Académico</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{plan.nombre_plan}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl lg:text-5xl font-black ${parseFloat(plan.precio) > 100000 ? 'text-[var(--color-blue)]' : 'text-white'}`}>${parseInt(plan.precio).toLocaleString()}</span>
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 ml-1">/ MES</span>
                  </div>
                </div>

                <div className="flex-grow">
                  <p className="text-xs leading-relaxed font-semibold uppercase tracking-tight text-zinc-400 whitespace-pre-line">
                    {plan.descripcion}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900 w-full flex justify-end">
                  <ArrowUpRight size={24} className={parseFloat(plan.precio) > 100000 ? 'text-[var(--color-blue)]' : 'text-zinc-600 group-hover:text-white transition-colors'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA: FINAL PUSH === */}
      <section className="py-20 md:py-40 bg-zinc-950 border-t border-zinc-900 flex flex-col items-center text-center px-4 md:px-6 relative overflow-hidden">
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
          <h2 className="text-4xl sm:text-6xl md:text-[10rem] font-black text-white mb-8 md:mb-12 uppercase tracking-tighter leading-[0.8]">
            TU MOMENTO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 italic">ES AHORA</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto mb-10 md:mb-20 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-sm leading-relaxed">
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
