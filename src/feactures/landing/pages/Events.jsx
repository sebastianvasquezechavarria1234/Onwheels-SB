import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, ChevronLeft, ChevronRight, ChevronDown, Clock, Info } from "lucide-react";
import { Layout } from "../layout/Layout";
import { getEventos, getEventosFuturos } from "../../../services/eventoServices";
import { getCategoriasEventos } from "../../dashboards/admin/pages/services/EventCategory";
import { motion } from "framer-motion";

export const EventsContent = () => {
  const [events, setEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3000';

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1564429238961-bf8f8bfa8c75?w=500&q=80";
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    return `${API_URL}${url}`;
  };

  // Filters State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (events && events.length > 0) {
      const dayEvents = events.filter(event => {
        const rawDate = event?.fecha_evento || event?.fecha;
        if (!rawDate) return false;
        const eventDate = new Date(rawDate);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setSelectedDayEvents(dayEvents);
    }
  }, [selectedDate, events]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allEvents, future, cats] = await Promise.all([
        getEventos().catch(() => []),
        getEventosFuturos().catch(() => []),
        getCategoriasEventos().catch(() => [])
      ]);

      const safeAll = Array.isArray(allEvents) ? allEvents : [];
      const safeFuture = Array.isArray(future) ? future : [];

      setEvents(safeAll);
      setFutureEvents(safeFuture);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  };

  // Calendar Logic
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
  };

  const hasEvent = (day) => {
    return events.some(event => {
      const rawDate = event?.fecha_evento || event?.fecha;
      if (!rawDate) return false;
      const eventDate = new Date(rawDate);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <>
        {blanks.map((_, i) => (
          <div key={`blank-${i}`}></div>
        ))}
        {days.map(day => {
          const isSelected =
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear();

          const isToday =
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          const dayHasEvent = hasEvent(day);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                p-3 rounded-lg cursor-pointer transition relative flex justify-center items-center text-sm
                ${isSelected
                  ? "bg-(--color-blue) text-white font-bold shadow-lg shadow-blue-500/20 scale-105"
                  : "hover:bg-zinc-800 text-gray-400"
                }
                ${isToday && !isSelected ? "border border-zinc-600 text-white font-bold" : ""}
              `}
            >
              {day}
              {dayHasEvent && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-(--color-blue) rounded-full"></span>
              )}
            </div>
          );
        })}
      </>
    );
  };

  // Filtrado de eventos
  const filteredEvents = events.filter((event) => {
    let matchCategory = true;
    let matchDate = true;

    if (selectedCategory) {
      matchCategory = event.nombre_categoria === selectedCategory;
    }

    if (selectedDateFilter) {
      const rawDate = event?.fecha_evento || event?.fecha;
      if (!rawDate) return false;
      const eventDate = new Date(rawDate);
      const now = new Date();

      if (selectedDateFilter === "Este mes") {
        matchDate =
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear();
      } else if (selectedDateFilter === "Próximo mes") {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        matchDate =
          eventDate.getMonth() === nextMonth.getMonth() &&
          eventDate.getFullYear() === nextMonth.getFullYear();
      }
    }

    return matchCategory && matchDate;
  });

  const formatEventDate = (event) => {
    const rawDate = event?.fecha_evento || event?.fecha;
    if (!rawDate) return { day: "--", month: "---", full: "Sin fecha" };
    const dateObj = new Date(rawDate);
    return {
      day: dateObj.getDate(),
      month: dateObj.toLocaleString("es-CO", { month: "short" }).replace(".", ""),
      full: dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
    };
  };

  return (
    <div className="bg-zinc-950 min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[400px] md:h-[480px] flex items-end overflow-hidden">
        <img
          src="https://cdn-blog.superprof.com/blog_es/wp-content/uploads/2023/05/mejores-skaters-historia-1.jpg"
          alt="Eventos"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="relative z-10 max-w-[1000px] mx-auto w-full px-6 pb-16">
          <span className="inline-block text-[10px] font-bold text-(--color-blue) uppercase tracking-[0.35em] mb-4">
            Performance SB — Agenda
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
            Eventos<br />
            <span className="text-zinc-500">&amp; Competiciones</span>
          </h1>
          <p className="text-zinc-400 mt-5 text-sm max-w-xs leading-relaxed">
            Vive la emoción sobre ruedas. Descubre toda la agenda de la comunidad.
          </p>
        </div>
      </section>

      {/* ── EVENTOS DISPONIBLES (con filtros integrados) ─────── */}
      <section className="bg-white">
        <div className="max-w-[1000px] mx-auto px-6 pt-14 pb-16">

          {/* Cabecera + filtros */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-7">
              <div>
                <p className="text-[10px] font-bold text-(--color-blue) uppercase tracking-[0.35em] mb-1.5">Agenda</p>
                <h2 className="text-3xl md:text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none">
                  Eventos disponibles
                </h2>
              </div>
              {/* Filtro fecha — dropdown custom */}
              <div
                className="relative shrink-0"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDateDropdownOpen(false);
                }}
              >
                <button
                  onClick={() => setDateDropdownOpen((v) => !v)}
                  className={`flex items-center gap-2 border text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-all cursor-pointer outline-none ${
                    selectedDateFilter
                      ? "bg-(--color-blue) text-white border-(--color-blue) shadow-md shadow-(--color-blue)/20"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-(--color-blue) hover:text-(--color-blue)"
                  }`}
                >
                  <CalendarDays size={12} className="shrink-0" />
                  {selectedDateFilter || "Cualquier fecha"}
                  <ChevronDown
                    size={13}
                    className={`shrink-0 transition-transform duration-200 ${dateDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dateDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden z-30 min-w-[190px]">
                    {[
                      { label: "Cualquier fecha", value: "" },
                      { label: "Este mes",        value: "Este mes" },
                      { label: "Próximo mes",     value: "Próximo mes" },
                    ].map(({ label, value }) => (
                      <button
                        key={label}
                        tabIndex={0}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedDateFilter(value);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                          selectedDateFilter === value
                            ? "bg-(--color-blue) text-white"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-(--color-blue)"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filtros de categoría — solo categorías presentes en los eventos */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border active:scale-95 ${
                  selectedCategory === ""
                    ? "bg-(--color-blue) text-white border-(--color-blue) shadow-md shadow-(--color-blue)/20"
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700"
                }`}
              >
                Todas
              </button>
              {[...new Set(events.map(e => e.nombre_categoria).filter(Boolean))].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border active:scale-95 ${
                    selectedCategory === cat
                      ? "bg-(--color-blue) text-white border-(--color-blue) shadow-md shadow-(--color-blue)/20"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
              {filteredEvents.length > 0 && (
                <span className="ml-auto text-xs text-zinc-400 font-medium hidden sm:block">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "evento" : "eventos"}
                </span>
              )}
            </div>
          </div>

          {/* Grid de eventos */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl overflow-hidden border border-zinc-100 animate-pulse bg-">
                  <div className="h-44 bg-zinc-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded-full w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 px-5 py-4 rounded-2xl text-sm">
              <Info size={16} className="shrink-0" />
              {error}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event, i) => {
                const { day, month, full } = formatEventDate(event);
                return (
                  <motion.div
                    key={event.id_evento}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:shadow-zinc-200/80 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Imagen */}
                    <div className="relative h-44 overflow-hidden bg-zinc-100 shrink-0">
                      <img
                        src={getImageUrl(event.imagen)}
                        alt={event.nombre_evento}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                      {/* Fecha */}
                      <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1.5 text-center shadow-lg min-w-11">
                        <span className="block text-xl font-black text-zinc-900 leading-none">{day}</span>
                        <span className="block text-[9px] text-zinc-500 uppercase font-bold leading-none mt-0.5">{month}</span>
                      </div>

                      {/* Categoría */}
                      {event.nombre_categoria && (
                        <span className="absolute top-3 right-3 bg-(--color-blue) text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-md">
                          {event.nombre_categoria}
                        </span>
                      )}

                      {/* Nombre sobre la imagen */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                        <h3 className="font-black text-white text-base leading-snug line-clamp-2 drop-shadow-md">
                          {event?.nombre_evento || "Evento General"}
                        </h3>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Fecha completa */}
                      <p className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                        <CalendarDays size={11} className="text-(--color-blue) shrink-0" />
                        {full}
                      </p>

                      <div className="space-y-1.5 mb-4">
                        <p className="flex items-center gap-2 text-zinc-500 text-xs">
                          <Clock size={11} className="text-(--color-blue) shrink-0" />
                          {event.hora_inicio?.substring(0, 5) || "Por definir"}
                          {event.hora_aproximada_fin && (
                            <span className="text-zinc-400">— {event.hora_aproximada_fin.substring(0, 5)}</span>
                          )}
                        </p>
                        {event.nombre_sede && (
                          <p className="flex items-center gap-2 text-zinc-500 text-xs">
                            <MapPin size={11} className="text-(--color-blue) shrink-0" />
                            <span className="truncate">{event.nombre_sede}</span>
                          </p>
                        )}
                      </div>

                      {/* Descripción breve */}
                      {event.descripcion && (
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-4">
                          {event.descripcion}
                        </p>
                      )}

                      {/* Dirección si existe */}
                      {event.direccion && (
                        <p className="text-zinc-400 text-xs flex items-start gap-1.5 mt-auto pt-3 border-t border-zinc-100">
                          <MapPin size={10} className="text-zinc-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{event.direccion}</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
              <CalendarDays size={36} className="mx-auto text-zinc-300 mb-3" />
              <p className="text-zinc-400 font-medium text-sm">No hay eventos para los filtros seleccionados.</p>
              <button
                onClick={() => { setSelectedCategory(""); setSelectedDateFilter(""); }}
                className="mt-4 text-xs text-(--color-blue) font-bold uppercase tracking-wider hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── PRÓXIMOS EVENTOS ─────────────────────────────────── */}
      {futureEvents.length > 0 && (
        <section className="max-w-[1000px] mx-auto px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-(--color-blue) uppercase tracking-[0.35em] mb-1.5">Calendario</p>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                Próximos eventos
              </h2>
            </div>
            <button
              onClick={() => document.getElementById("calendario").scrollIntoView({ behavior: "smooth" })}
              className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider hover:text-(--color-blue) transition"
            >
              Ver calendario →
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {futureEvents.slice(0, 4).map((event) => {
              const { day, month } = formatEventDate(event);
              return (
                <div
                  key={event.id_evento}
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                >
                  <div className="shrink-0 w-14 h-14 bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white leading-none">{day}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold mt-0.5">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate mb-1">
                      {event.nombre_evento}
                    </h4>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 truncate">
                      <MapPin size={10} className="shrink-0" />
                      {event.nombre_sede || "Por definir"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── CALENDARIO INTERACTIVO ───────────────────────────── */}
      <section id="calendario" className="max-w-[1000px] mx-auto px-6 pb-24">
        <div className="mb-8">
          <p className="text-[10px] font-bold text-(--color-blue) uppercase tracking-[0.35em] mb-1.5">Interactivo</p>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
            Calendario de eventos
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
          {/* Panel día seleccionado */}
          <div className="lg:col-span-4 bg-zinc-950 text-white p-6 lg:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 min-h-[420px]">
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black tracking-tighter leading-none">{selectedDate.getDate()}</span>
                <div>
                  <span className="block text-base font-light uppercase tracking-widest text-zinc-500">
                    {daysOfWeek[selectedDate.getDay()]}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </span>
                </div>
              </div>
              <div className="w-10 h-0.5 bg-(--color-blue) mt-3 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {selectedDayEvents.length > 0 ? (
                selectedDayEvents.map((event) => (
                  <div
                    key={event.id_evento}
                    className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl"
                  >
                    <h4 className="font-bold text-sm text-white truncate mb-1.5">
                      {event.nombre_evento}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {event.hora_inicio?.substring(0, 5)}</span>
                      {event.nombre_sede && (
                        <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {event.nombre_sede}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-zinc-800 rounded-xl">
                  <CalendarDays size={28} className="text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600">Sin eventos este día</p>
                </div>
              )}
            </div>
          </div>

          {/* Grid del calendario */}
          <div className="lg:col-span-8 p-6 lg:p-10">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition"
              >
                <ChevronLeft size={18} />
              </button>
              <h4 className="font-black text-xl text-white tracking-tight">
                {months[currentDate.getMonth()]}{" "}
                <span className="text-zinc-600 font-normal text-lg">{currentDate.getFullYear()}</span>
              </h4>
              <button
                onClick={() => changeMonth(1)}
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export const Events = () => {
  return (
    <Layout>
      <EventsContent />
    </Layout>
  );
};
export default Events;

