import React, { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getEventosFuturos } from "../../../../services/eventoServices";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";

export const UpcomingEvents = () => {
  const { user } = useAuth();
  const roleSlug = user ? (user.roles?.includes('administrador') ? 'admin' : (user.roles?.includes('estudiante') ? 'student' : (user.roles?.includes('instructor') ? 'instructor' : (user.roles?.includes('cliente') ? 'users' : 'custom')))) : 'store';
  const eventsPath = roleSlug === 'store' ? "/events" : `/${roleSlug}/events`;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3000';

  const getImageUrl = (url) => {
    if (!url) return "/bg_eventosL.jpg";
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getEventosFuturos();
        // getEventosFuturos ya normaliza la respuesta a un array
        const allEvents = Array.isArray(data) ? data : [];

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const futureEvents = allEvents
          .filter((e) => {
            const rawDate = e?.fecha_evento || e?.fecha;
            if (!rawDate) return false;
            
            // Si la fecha viene como YYYY-MM-DD, New Date(rawDate) puede interpretarlo como UTC.
            // Para asegurar consistencia local, podemos parsearlo manualmente si es necesario, 
            // pero al menos compararemos contra el inicio del día de hoy.
            const eventDate = new Date(rawDate);
            if (isNaN(eventDate)) return false;
            
            // Normalizar eventDate al inicio del día para la comparación
            const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            
            return eventDay >= today;
          })
          .sort(
            (a, b) =>
              new Date(a.fecha_evento || a.fecha) -
              new Date(b.fecha_evento || b.fecha)
          );

        setEvents(futureEvents.slice(0, 3));
      } catch (err) {
        console.error("Error fetching events:", err);
        // No mostramos error para no afectar la landing si la API no responde
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="bg-zinc-950 py-10 md:py-16 border-t border-zinc-900">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            Próximos <span className="text-zinc-500">Eventos</span>
          </h2>
          <Link
            to={eventsPath}
            className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-wider hover:underline"
          >
            Ver Calendario
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            [1, 2].map((n) => (
              <div
                key={n}
                className="h-24 bg-zinc-900 rounded-xl animate-pulse"
              />
            ))
          ) : events.length === 0 ? (
            <div className="text-gray-500 text-sm bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              No hay eventos próximos.
            </div>
          ) : (
            events.map((event, index) => {
              const dateObj = new Date(
                event?.fecha_evento || event?.fecha || Date.now()
              );

              const day = dateObj.getDate();
              const month = dateObj
                .toLocaleString("es-CO", { month: "short" })
                .replace(".", "");

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-all hover:border-[var(--color-blue)] hover:shadow-lg group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto sm:mr-6 shrink-0">
                    {/* Event Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-zinc-700">
                      <img
                        src={getImageUrl(event?.imagen)}
                        alt={event?.nombre_evento}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800 rounded-lg group-hover:bg-[var(--color-blue)] transition-colors shrink-0">
                      <span className="text-lg sm:text-xl font-bold text-white leading-none">
                        {isNaN(dateObj.getDate()) ? "--" : dateObj.getDate()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 group-hover:text-blue-100 uppercase leading-none mt-1">
                        {isNaN(dateObj.getDate()) ? "???" : month}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 w-full min-w-0 sm:pr-4">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate group-hover:text-[var(--color-blue)] transition-colors">
                      {event?.nombre_evento ||
                        event?.descripcion ||
                        "Evento General"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {dateObj.toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <MapPin size={12} />
                        Skatepark Central
                      </span>
                    </div>

                    {/* Botón de Inscripción */}
                    {(event.google_forms || event.link_google_forms) && (
                      <div className="mt-3 flex gap-2">
                        {Array.isArray(event.google_forms) && event.google_forms.length > 0 ? (
                          event.google_forms.map((url, idx) => (
                            <a
                              key={idx}
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-[var(--color-blue)] text-white py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Inscribirme al evento {event.google_forms.length > 1 ? `(${idx + 1})` : ""}
                            </a>
                          ))
                        ) : (
                          (typeof event.google_forms === 'string' || typeof event.link_google_forms === 'string') && (
                            <a
                              href={(event.google_forms || event.link_google_forms).startsWith('http') 
                                ? (event.google_forms || event.link_google_forms) 
                                : `https://${event.google_forms || event.link_google_forms}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-[var(--color-blue)] text-white py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Inscribirme al evento
                            </a>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    to={eventsPath}
                    className="hidden sm:flex w-10 h-10 rounded-full border border-zinc-700 items-center justify-center text-white hover:bg-white hover:text-black transition-colors shrink-0"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
