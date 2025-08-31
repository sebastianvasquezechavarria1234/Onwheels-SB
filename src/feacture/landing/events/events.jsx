import React from "react";
import { CalendarDays, MapPin } from "lucide-react";
import Navbar from "../navbar/navbar";

const Events = () => {
  return (
    <>
    <Navbar/>
       <div className="min-h-screen flex flex-col">
    
        <section className="h-[400px] flex items-center bg-cover bg-center text-white"
        style={{
            backgroundImage:
            "url('https://cdn-blog.superprof.com/blog_es/wp-content/uploads/2023/05/mejores-skaters-historia-1.jpg')",
        }}
        >
            <div className="container mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-2">
                    eventos y competiciones de stakeboarding
                </h2>
                <p className="mb-4">vive la emocion sobre ruedas</p>
                <button className="bg-red-600 px-5 py-2 rounded-lg">
                    ver calendario
                </button>

            </div>
            
        </section>
<div className="container mx-auto flex justify-center gap-4 my-6">
    <select className="boder rounded-lg px-3 py-6  ">
        <option >categorias</option>
        <option>competencias</option>
        <option>exhibiciones</option>
    </select>
        <select className="boder rounded-lg px-3 py-6">
        <option>ciudad</option>
        <option>medellin</option>
        <option>bogotá</option>
    </select>
        <select className="boder rounded-lg px-3 py-6">
        <option>fecha</option>
        <option>este mes</option>
        <option>proximo mes</option>
    </select>
</div>

<section className="container mx-auto my-10">
    <h3 className="text-2xl font-bold mb-6">Eventos destacados</h3>
    <div className="grid md:grid-cols-2 gap-6">

        
 <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj8llyKqqSEMBOL5j89JzPYTHKPWS8_98H7A&s"
              alt="evento"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h4 className="font-bold text-lg">Demo Pro Rider Tour</h4>
              <p className="text-gray-600 text-sm my-2">
                Muestra de profesionales en distintas disciplinas del skateboarding.
              </p>
              <p className="text-sm flex items-center gap-2">
                <MapPin size={16}/> Medellín 
                <CalendarDays size={16}/> 15 de Septiembre
              </p>
              <button className="mt-3 border px-4 py-2 rounded-lg">
                Ver más
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
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
              <p className="text-sm flex items-center gap-2">
                <MapPin size={16}/> Envigado 
                <CalendarDays size={16}/> 21 de Junio
              </p>
              <button className="mt-3 border px-4 py-2 rounded-lg">
                Ver más
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto my-10">
        <h3 className="text-2xl font-bold mb-6">Próximos eventos</h3>
        <div className="bg-white shadow-md rounded-lg divide-y">
          <div className="p-4 hover:bg-gray-50 cursor-pointer">
            <h5 className="font-semibold">Skate & Music Festival</h5>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <CalendarDays size={16}/> 30 de Septiembre 
              <MapPin size={16}/> Parque Central
            </p>
          </div>
          <div className="p-4 hover:bg-gray-50 cursor-pointer">
            <h5 className="font-semibold">Street Session Urbana</h5>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <CalendarDays size={16}/> 5 de Octubre 
              <MapPin size={16}/> Skate Plaza
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto my-10">
        <h3 className="text-2xl font-bold text-center mb-6">Calendario de eventos</h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                i % 6 === 0 ? "bg-blue-900 text-white" : "bg-purple-200"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white mt-10">
        <div className="container mx-auto flex justify-between p-4">
          <p>© 2025 OnWheels SB</p>
          <div className="flex gap-4">
            <a href="#">Políticas</a>
            <a href="#">Contacto</a>
            <a href="#">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
export default Events;
