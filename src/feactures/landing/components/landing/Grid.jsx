import React, { useEffect, useState } from "react";
import { Card as ProductCard } from "../shop/Card"; // Reutilizamos tarjeta de tienda
import { Card as GenericCard } from "./Card"; // Tarjeta genérica para eventos
import { BtnLinkIcon } from "../BtnLinkIcon";
import { ArrowRight, NotebookPen } from "lucide-react";
import { BtnLink } from "../BtnLink";
import { Link } from "react-router-dom";
import { getEventosFuturos } from "../../../../services/eventoServices";

export const Grid = () => {
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lista de videos con descripción (Estática por ahora)
  const videos = [
    { src: "/vd_landing1.mp4", desc: "Reel 1: Skate en el parque" },
    { src: "/vd_landing2.mp4", desc: "Reel 2: Trucos urbanos" },
    { src: "/vd_landing3.mp4", desc: "Reel 3: Competencia local" },
  ];

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch Productos (Traemos todos y cortamos, o idealmente un endpoint 'featured')
            const resProd = await fetch("http://localhost:3000/api/productos");
            if (resProd.ok) {
                const dataProd = await resProd.json();
                setProducts(dataProd.slice(0, 3)); // Solo 3
            }

            // 2. Fetch Eventos Futuros
            try {
                const dataEvents = await getEventosFuturos();
                setEvents(dataEvents.slice(0, 3));
            } catch (err) {
                 console.error("Error fetching future events:", err);
            }
        } catch (error) {
            console.error("Error cargando datos home:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* ================== SECCIÓN PRODUCTOS ================== */}
      <section className="Products max-w-[1400px] mx-auto p-[20px] max-md:p-[10px] mt-[60px]">
        <div className="flex gap-[5px] justify-between max-md:flex-col max-md:gap-0">
          <h3 className="mb-[20px]">
            Explora
            <span className="opacity-90 mx-[15px] font-primary">
              Nuestros productos
            </span>
            <span>Creados para la vida</span>
            <span className="opacity-70 font-primary"> sobre ruedas...</span>
          </h3>
          <div className="flex">
            <BtnLink title={"Ver más"} link="/store" style={"text-blue-800 "} />
            <ArrowRight strokeWidth={1} className="text-blue-700" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[20px] max-lg:grid-cols-2 max-md:gap-[10px] ">
           {loading ? <p>Cargando productos...</p> : products.map(p => (
               <ProductCard key={p.id_producto} product={p} />
           ))}
           {!loading && products.length === 0 && <p>No hay productos destacados.</p>}
        </div>
      </section>

      {/* ================== SECCIÓN EVENTOS ================== */}
      <section className="bg-gray-200 mt-[60px]">
        <div className="max-w-[1400px] mx-auto p-20 max-md: p-[20px]" >
          <div className="flex gap-[10px] justify-between max-md:flex-col max-md:gap-0 ">
            <h3 className="mb-[30px]">
              Proximos
              <span className="font-primary"> eventos</span>
            </h3>
            <div className="flex gap-[5px]">
              <BtnLink title={"Ver más"} link="/events" style="text-blue-800" />
              <ArrowRight strokeWidth={1} className="text-blue-700" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[20px] max-lg:grid-cols-2 max-md:gap-[10px]">
             {loading ? <p>Cargando eventos...</p> : events.map(e => (
                 <GenericCard 
                    key={e.id_evento}
                    img={e.imagen || "./bg_eventosL.jpg"}
                    text="Próximo evento"
                    descripcion={e.descripcion}
                    dato={new Date(e.fecha_evento).toLocaleDateString()}
                    styleImage=""
                 />
             ))}
             {!loading && events.length === 0 && <p>No hay eventos próximos.</p>}
          </div>
        </div>
      </section>

      {/* ================== SECCIÓN APRENDER ================== */}
      <section className="max-w-[1400px] mt-[60px] mx-auto h-[600px] flex gap-x-20 items-center p-[3rem] max-lg:flex-col max-md:p-[10px] max-md:gap-[25px]">
        {/* Texto */}
        <div className="w-[50%] max-lg:w-full">
          <h2 className="text-4xl font-bold mb-4">
            ¿Te <span className="font-primary"> gustaría</span>
            <h2>aprender con</h2>
            <span className="font-primary"> nosotros?</span>
          </h2>
          <h4 className="text-black text-lg mb-4 opacity-60">
            En Performance SB te ofrecemos clases profesionales, eventos
            emocionantes y los mejores productos para que vivas al máximo tu
            pasión por el skateboarding.
          </h4>
          <BtnLinkIcon title={"Preinscribete!"} link="/preinscriptions">
            <NotebookPen size={20} strokeWidth={2} color="white" />
          </BtnLinkIcon>
        </div>
        {/* Grid de imágenes */}
        <div className="grid grid-cols-3 grid-rows-3 gap-4 max-w-[800px] mx-auto h-[500px] max-md:h-[60vw] max-md:gap-[10px]">
          <img
            className="col-span-2 row-span-3 object-cover rounded-lg w-full h-full"
            src="./bg_eventosL3.jpg"
            alt="img"
          />
          <img
            className="col-span-1 row-span-2 object-cover rounded-lg w-full h-full"
            src="./bg_eventos.jpg"
            alt="img"
          />
          <img
            className="col-span-1 row-span-1 object-cover rounded-lg w-full h-full"
            src="./bg_hero_landing.jpg"
            alt="img"
          />
        </div>
      </section>

      {/* ================== SECCIÓN REELS ================== */}
      <section className="max-w-[1600px] mx-auto mt-[120px] px-4 max-md:p-[30px]  ">
        <h2 className="text-2xl font-bold mb-6 text-center">¡Nuestros mejores reels!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-md:gap-[10px] ">
          {videos.map((video, i) => (
            <article
              key={i}
              className="relative group rounded-2xl overflow-hidden aspect-video shadow-xl transition-transform hover:scale-[1.04] bg-black"
            >
              <video
                className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
                src={video.src}
                muted
                loop
                preload="metadata"
                onMouseEnter={(e) => e.target.play()}
                onMouseLeave={(e) => {
                  e.target.pause();
                  e.target.currentTime = 0; // Reinicia al salir
                }}
              />
              {/* Degradado y overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
              {/* Descripción */}
              <span className="absolute bottom-6 left-6 z-20 text-white text-lg font-semibold drop-shadow">
                {video.desc}
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};
