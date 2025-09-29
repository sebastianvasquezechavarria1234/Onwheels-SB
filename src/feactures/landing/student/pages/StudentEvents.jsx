import React from "react";
import { StudentLayout } from "../layout/StudentLayout";
import { CalendarDays, MapPin } from "lucide-react";


export const StudentEvents = () => {
  return(
    <StudentLayout>
      <div className="min-h-screen flex flex-col mt-4">
        <section
          className="h-[400px] flex items-center bg-cover bg-center text-white"
          style={{
            backgroundImage:
              "url('https://cdn-blog.superprof.com/blog_es/wp-content/uploads/2023/05/mejores-skaters-historia-1.jpg')",
          }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold mb-2">
              eventos y competiciones de stakeboarding
            </h2>
            <p className="mb-4">vive la emocion sobre ruedas</p>
            <button className="bg-red-600 px-5 py-2 rounded-lg hover:bg-red-800 transition">
              ver calendario
            </button>
          </div>
        </section>

        {/* Categorías y filtros */}
        <div className="container mx-auto flex flex-wrap justify-center gap-6 my-8 px-4">
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition w-48">
            <option>categorias</option>
            <option>competencias</option>
            <option>exhibiciones</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition w-48">
            <option>ciudad</option>
            <option>medellin</option>
            <option>bogotá</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition w-48">
            <option>fecha</option>
            <option>este mes</option>
            <option>proximo mes</option>
          </select>
        </div>

        {/* Eventos destacados */}
        <section className="container mx-auto my-10 px-4">
          <h3 className="text-2xl font-bold mb-6">Eventos destacados</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj8llyKqqSEMBOL5j89JzPYTHKPWS8_98H7A&s"
                alt="evento"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="font-bold text-lg">Demo Pro Rider Tour</h4>
                <p className="text-gray-600 text-sm my-2">
                  Muestra de profesionales en distintas disciplinas del
                  skateboarding.
                </p>
                <p className="text-sm flex items-center gap-4 text-gray-700">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> Medellín
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={16} /> 15 de Septiembre
                  </span>
                </p>
                <button className="mt-3 border px-4 py-2 rounded-lg bg-blue-950 text-amber-100 hover:bg-blue-600 transition">
                  Ver más
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
              <img
                src="https://www.shutterstock.com/image-photo/group-teens-skateboarding-skate-park-260nw-1876354651.jpg"
                alt="evento"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="font-bold text-lg">Go Skate Day</h4>
                <p className="text-gray-600 text-sm my-2">
                  El día internacional del skate se celebra en todo el mundo.
                </p>
                <p className="text-sm flex items-center gap-4 text-gray-700">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> Envigado
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={16} /> 21 de Junio
                  </span>
                </p>
                <button className="mt-3 border px-4 py-2 rounded-lg bg-blue-950 text-amber-100 hover:bg-blue-600 transition">
                  Ver más
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Próximos eventos */}
        <section className="container mx-auto my-10 border-black pb-10 px-4">
          <h3 className="text-2xl font-bold mb-6">Próximos eventos</h3>
          <div className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
            <div className="p-4 hover:bg-gray-50 cursor-pointer transition">
              <h5 className="font-semibold">Skate & Music Festival</h5>
              <p className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <CalendarDays size={16} /> 30 de Septiembre
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> Parque Central
                </span>
              </p>
            </div>
            <div className="p-4 hover:bg-gray-50 cursor-pointer transition">
              <h5 className="font-semibold">Street Session Urbana</h5>
              <p className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <CalendarDays size={16} /> 5 de Octubre
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> Skate Plaza
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Calendario */}
        {/* Calendario estilizado */}
<section className="container mx-auto my-10 px-4">
  <h3 className="text-2xl font-bold text-center mb-6">
    Calendario de eventos
  </h3>

  <div className="grid md:grid-cols-2 bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Panel del día seleccionado */}
    <div className="bg-blue-950 text-white p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-5xl font-bold">19</h2>
        <p className="uppercase tracking-wide">Domingo</p>
        <p className="mt-2 text-sm text-gray-300">3:00 pm</p>
        <p className="text-sm">competencia de skateboard</p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="bg-red-600 rounded-lg px-3 py-2 shadow">
          <p className="text-sm">12:30 PM - 2:00 PM</p>
          <p className="font-semibold">Competencia local</p>
        </div>
        <div className="bg-blue-800 rounded-lg px-3 py-2 shadow">
          <p className="text-sm">3:00 PM - 4:30 PM</p>
          <p className="font-semibold">Entrenamiento Pro</p>
        </div>
        <div className="bg-blue-800 rounded-lg px-3 py-2 shadow">
          <p className="text-sm">7:00 PM - 9:00 PM</p>
          <p className="font-semibold">Jam Session</p>
        </div>
      </div>

  
    </div>

    {/* Panel del mes */}
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <button className="text-blue-950 hover:text-red-600">◀</button>
        <h4 className="font-bold text-lg">Febrero 2025</h4>
        <button className="text-blue-950 hover:text-red-600">▶</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map((day) => (
          <div key={day} className="font-semibold text-gray-700">{day}</div>
        ))}

        {/* Espacios vacíos */}
        {[...Array(6)].map((_, i) => (
          <div key={i}></div>
        ))}

        {/* Días del mes */}
        {Array.from({ length: 29 }).map((_, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg cursor-pointer transition 
              ${
                i + 1 === 19
                  ? "bg-red-600 text-white font-bold shadow-lg"
                  : "hover:bg-blue-100"
              }
            `}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      </div>
    </StudentLayout>
  )
}