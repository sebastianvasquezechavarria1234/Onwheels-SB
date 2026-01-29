import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, ChevronLeft, ChevronRight, Clock, X, Info } from "lucide-react";
import { Layout } from "../layout/Layout";
import { getEventos, getEventosFuturos } from "../../../services/eventoServices";
import { getCategoriasEventos } from "../../dashboards/admin/pages/services/EventCategory";
import { motion, AnimatePresence } from "framer-motion";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (events) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.fecha_evento);
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
      const [allEvents, future, cats] = await Promise.all([
        getEventos(),
        getEventosFuturos(),
        getCategoriasEventos()
      ]);
      setEvents(allEvents);
      setFutureEvents(future);
      setCategories(cats || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeModal = () => {
    setSelectedEvent(null);
    document.body.style.overflow = 'unset';
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
      const eventDate = new Date(event.fecha_evento);
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
                p-3 rounded-lg cursor-pointer transition relative flex justify-center items-center
                ${isSelected 
                  ? "bg-red-600 text-white font-bold shadow-lg scale-105" 
                  : "hover:bg-blue-100 text-gray-700"
                }
                ${isToday && !isSelected ? "border border-blue-950 font-bold" : ""}
              `}
            >
              {day}
              {dayHasEvent && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
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
      const eventDate = new Date(event.fecha_evento);
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

  return (
    <Layout>
      <div className="min-h-screen flex flex-col mt-4 relative">
        <section
          className="h-[400px] flex items-center bg-cover bg-center text-white relative"
          style={{
            backgroundImage:
              "url('https://cdn-blog.superprof.com/blog_es/wp-content/uploads/2023/05/mejores-skaters-historia-1.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
              Eventos y Competiciones
            </h2>
            <p className="mb-6 text-xl text-gray-200">Vive la emoción sobre ruedas</p>
            <button 
              onClick={() => document.getElementById('calendario').scrollIntoView({ behavior: 'smooth' })}
              className="bg-red-600 px-8 py-3 rounded-full hover:bg-red-700 transition font-bold shadow-lg hover:shadow-red-600/30 transform hover:-translate-y-1"
            >
              Ver Calendario
            </button>
          </div>
        </section>

        {/* Filtros Simplificados */}
        <div className="container mx-auto flex flex-wrap justify-center gap-4 my-10 px-4">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent px-4 py-2 text-gray-700 outline-none cursor-pointer hover:text-blue-600 transition font-medium"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id_categoria_evento} value={cat.nombre_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </select>
            <div className="w-px bg-gray-300 hidden md:block"></div>
            <select 
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-transparent px-4 py-2 text-gray-700 outline-none cursor-pointer hover:text-blue-600 transition font-medium"
            >
              <option value="">Cualquier Fecha</option>
              <option value="Este mes">Este mes</option>
              <option value="Próximo mes">Próximo mes</option>
            </select>
          </div>
        </div>

        {/* Eventos Disponibles */}
        <section className="container mx-auto pb-10 px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-2">
            <span className="w-2 h-8 bg-red-600 rounded-full inline-block"></span>
            Eventos Disponibles
          </h3>
          {loading ? (
             <div className="text-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
               <p className="text-gray-500">Cargando la agenda...</p>
             </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map(event => (
                <div key={event.id_evento} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.imagen || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/1200px-Anonymous_emblem.svg.png"}
                      alt={event.nombre_evento}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-900 shadow-sm uppercase tracking-wide">
                      {event.nombre_categoria}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h4 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-red-600 transition line-clamp-1">{event.nombre_evento}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <CalendarDays size={14} className="text-blue-600" /> 
                          {new Date(event.fecha_evento).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <Clock size={14} className="text-orange-600" /> 
                          {event.hora_inicio?.substring(0, 5)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {event.descripcion}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        <MapPin size={16} className="text-red-500" />
                        <span className="truncate max-w-[120px]">{event.nombre_sede}</span>
                      </div>
                      <button 
                        onClick={() => openModal(event)}
                        className="text-blue-900 font-semibold text-sm hover:text-red-600 transition flex items-center gap-1"
                      >
                        Ver detalle <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
               <Info size={40} className="mx-auto text-gray-400 mb-3" />
               <p className="text-gray-600">No hay eventos disponibles en este momento.</p>
             </div>
          )}
        </section>

        {/* Próximos eventos */}
        <section className="container mx-auto my-10 px-4">
           <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
             <div className="relative z-10 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="text-2xl font-bold mb-4">Próximos Eventos</h3>
                  <p className="text-blue-200 mb-6 text-sm leading-relaxed">
                    Mantente al día con las próximas competiciones y exhibiciones. No te pierdas ninguna fecha importante del calendario skater.
                  </p>
                  <button onClick={() => document.getElementById('calendario').scrollIntoView({ behavior: 'smooth' })} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm">
                    Ver agenda completa
                  </button>
                </div>
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                  {futureEvents.slice(0, 4).map(event => (
                    <div 
                      key={event.id_evento} 
                      onClick={() => openModal(event)}
                      className="bg-blue-800/40 hover:bg-blue-800/60 p-4 rounded-xl cursor-pointer transition border border-blue-700/50 flex items-center gap-4 group"
                    >
                       <div className="bg-blue-600/20 p-3 rounded-lg text-center min-w-[60px]">
                          <span className="block text-xl font-bold">{new Date(event.fecha_evento).getDate()}</span>
                          <span className="block text-xs uppercase opacity-70">{new Date(event.fecha_evento).toLocaleDateString('es-ES', { month: 'short' })}</span>
                       </div>
                       <div>
                         <h5 className="font-bold text-sm group-hover:text-blue-200 transition">{event.nombre_evento}</h5>
                         <p className="text-xs text-blue-300 mt-1 flex items-center gap-1">
                           <MapPin size={12} /> {event.nombre_sede}
                         </p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        </section>

        {/* Calendario Interactivo */}
        <section id="calendario" className="container mx-auto mb-20 px-4">
          <div className="text-center mb-10">
             <h3 className="text-3xl font-bold text-gray-900 inline-block relative">
               Calendario de Eventos
               <span className="absolute bottom-0 left-0 w-full h-1 bg-red-600/20 rounded-full"></span>
             </h3>
          </div>

          <div className="grid lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 min-h-[600px]">
            {/* Panel del día seleccionado */}
            <div className="lg:col-span-4 bg-gray-900 text-white p-8 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-900/20"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-600/20 rounded-full blur-[100px]"></div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                     <h2 className="text-7xl font-bold tracking-tighter">{selectedDate.getDate()}</h2>
                     <div className="flex flex-col">
                        <span className="text-2xl font-light uppercase tracking-widest">{daysOfWeek[selectedDate.getDay()]}</span>
                        <span className="text-gray-400 text-sm">{months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                     </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-[400px]">
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map(event => (
                      <div 
                        key={event.id_evento} 
                        onClick={() => openModal(event)}
                        className="bg-white/5 hover:bg-white/10 transition p-5 rounded-2xl border border-white/10 cursor-pointer group"
                      >
                        <h4 className="font-bold text-lg mb-2 group-hover:text-blue-300 transition">{event.nombre_evento}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-1.5"><Clock size={14} className="text-red-500" /> {event.hora_inicio}</div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{event.descripcion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 opacity-40 border-2 border-dashed border-white/10 rounded-2xl">
                      <CalendarDays size={48} className="mx-auto mb-4" />
                      <p>Sin eventos para este día</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel del calendario */}
            <div className="lg:col-span-8 p-8 lg:p-12 bg-white">
              <div className="flex justify-between items-center mb-10">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-3 rounded-full hover:bg-gray-100 text-gray-700 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <h4 className="font-bold text-2xl text-gray-800 capitalize flex items-center gap-2">
                  {months[currentDate.getMonth()]} <span className="text-gray-400 font-normal">{currentDate.getFullYear()}</span>
                </h4>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-3 rounded-full hover:bg-gray-100 text-gray-700 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-4 mb-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center font-bold text-gray-400 text-xs uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 lg:gap-4 text-center">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </section>

        {/* Modal de Detalle de Evento */}
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="fixed inset-0 bg-black/60 backdrop-blur-md"
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
              >
                {/* Header Image */}
                <div className="relative h-72 md:h-96 flex-shrink-0">
                  <img
                    src={selectedEvent.imagen || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/1200px-Anonymous_emblem.svg.png"}
                    alt={selectedEvent.nombre_evento}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 text- rounded-full backdrop-blur-md transition border border-white/20 z-20"
                  >
                    <X size={24} />
                  </button>

                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                    <span className="bg-red-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-lg shadow-red-900/40">
                      {selectedEvent.nombre_categoria}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-2 drop-shadow-md">{selectedEvent.nombre_evento}</h2>
                    <div className="flex flex-wrap gap-4 text-gray-300 text-sm md:text-base font-medium mt-2">
                       <span className="flex items-center gap-2"><MapPin size={18} className="text-red-500" /> {selectedEvent.nombre_sede}</span>
                       <span className="hidden md:inline text-gray-500">•</span>
                       <span className="flex items-center gap-2"><CalendarDays size={18} className="text-blue-400" /> {new Date(selectedEvent.fecha_evento).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar bg-white">
                  <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                     
                     {/* Detalles principales */}
                     <div className="md:col-span-2 space-y-8">
                        <div>
                          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                            Sobre el evento
                            <span className="h-px bg-gray-200 flex-grow ml-4"></span>
                          </h3>
                          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                            {selectedEvent.descripcion}
                          </p>
                        </div>
                     </div>

                     {/* Sidebar de información */}
                     <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                           <h4 className="font-bold text-gray-900 mb-4 text-lg">Información Clave</h4>
                           
                           <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Clock size={18} /></div>
                                <div>
                                  <span className="block text-xs uppercase text-gray-400 font-bold">Horario</span>
                                  <span className="font-semibold text-gray-800">{selectedEvent.hora_inicio} - {selectedEvent.hora_aproximada_fin}</span>
                                </div>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="p-2 bg-red-100 text-red-700 rounded-lg"><MapPin size={18} /></div>
                                <div>
                                  <span className="block text-xs uppercase text-gray-400 font-bold">Dirección</span>
                                  <span className="font-semibold text-gray-800">{selectedEvent.direccion}</span>
                                </div>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Info size={18} /></div>
                                <div>
                                  <span className="block text-xs uppercase text-gray-400 font-bold">Organizador</span>
                                  <span className="font-semibold text-gray-800">OnWheels SB</span>
                                </div>
                             </li>
                           </ul>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                           <button className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-900/25 transform hover:-translate-y-1">
                             Confirmar Asistencia
                           </button>
                           <button className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition">
                             Compartir Evento
                           </button>
                        </div>

                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Events;
