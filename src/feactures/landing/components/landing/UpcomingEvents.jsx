import React, { useEffect, useState } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getEventos } from "../../../../services/eventoServices";

export const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getEventos();

        let allEvents = [];

        if (Array.isArray(data)) {
          allEvents = data;
        } else if (data?.eventos && Array.isArray(data.eventos)) {
          allEvents = data.eventos;
        }

        const now = new Date();

        const futureEvents = allEvents
          .filter((e) => {
            const rawDate = e?.fecha_evento || e?.fecha;
            if (!rawDate) return false;

            const eventDate = new Date(rawDate);
            return !isNaN(eventDate) && eventDate >= now;
          })
          .sort(
            (a, b) =>
              new Date(a.fecha_evento || a.fecha) -
              new Date(b.fecha_evento || b.fecha)
          );

        setEvents(futureEvents.slice(0, 3));
      } catch (err) {
        console.error("Error fetching events:", err);

        // Si es 401 simplemente dejamos la lista vacía
        if (err.response?.status === 401) {
          setError("No autorizado para ver eventos.");
        } else {
          setError("No se pudieron cargar los eventos.");
        }

        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="bg-zinc-950 py-16 border-t border-zinc-900">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            Próximos <span className="text-zinc-600">Eventos</span>
          </h2>
          <Link
            to="/events"
            className="text-xs font-bold text-(--color-blue) uppercase tracking-wider hover:underline"
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
          ) : error ? (
            <div className="text-red-500 text-sm bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              {error}
            </div>
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
                  className="flex items-center bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-all hover:border-(--color-blue) hover:shadow-lg group"
                >
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-zinc-800 rounded-lg group-hover:bg-(--color-blue) transition-colors shrink-0 mr-6">
                    <span className="text-xl font-bold text-white leading-none">
                      {day}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-blue-100 uppercase leading-none mt-1">
                      {month}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-(--color-blue) transition-colors">
                      {event?.descripcion ||
                        event?.nombre_evento ||
                        "Evento General"}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-500 text-xs text-nowrap">
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
                  </div>

                  <Link
                    to="/events"
                    className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors shrink-0"
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
