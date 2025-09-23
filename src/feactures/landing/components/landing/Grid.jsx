import React from "react";
import { Card } from "./Card";
import { BtnLinkIcon } from "../BtnLinkIcon";
import { ArrowRight, NotebookPen, Play } from "lucide-react";
import { BtnLink } from "../BtnLink";

export const Grid = () => {
  return (
    <>
      {/* ================== SECCIÓN PRODUCTOS ================== */}
      <section className="max-w-[1400px] mx-auto p-20">
        <div className=" flex gap-[10px] justify-between">
          <h3 className="mb-[30px]">
            Explora
            <span className="opacity-90 mx-[15px] font-primary">
              Nuestros productos
            </span>
            <span>Creados para la vida</span>
            <span className="opacity-70 font-primary"> sobre ruedas...</span>
          </h3>

          <div className="flex">
            <BtnLink title={"Ver más"} style={"text-blue-800 "} />
            <ArrowRight strokeWidth={1} className="text-blue-700" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[20px]">
          <Card
            styleImage="scale-[0.7]  group-hover:scale-[0.8]!"
            img="./bg_productosL.jpg"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
            text="Camiseta para hombre"
            dato="$ 20.000"
          />
          <Card
            styleImage="scale-[0.7]  group-hover:scale-[0.8]!"
            img="./bg_produstosL2.jpg"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
            text="Camiseta para hombre"
            dato="$ 20.000"
          />
          <Card
            styleImage="scale-[0.7]  group-hover:scale-[0.8]!"
            img="./bg_productosL.jpg"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
            text="Camiseta para hombre"
            dato="$ 20.000"
          />
        </div>
      </section>

      {/* ================== SECCIÓN EVENTOS ================== */}
      <section className="bg-gray-200">
        <div className="max-w-[1400px] mx-auto p-20">
          <div className="flex gap-[10px] justify-between ">
            <h3 className="mb-[30px]  ">
              Proximos
              <span className="font-primary"> eventos</span>
            </h3>

            <div className="flex gap-[5px]">
              <BtnLink title={"Ver más"} style="text-blue-800" />
              <ArrowRight strokeWidth={1} className="text-blue-700" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[20px]">
            <Card
              img="./bg_eventosL.jpg"
              descripcion="Evento de skateboard en la ciudad de la eterna primavera"
              text="Próximos eventos :"
              dato="2/09/2025"
            />
            <Card
              img="./bg_eventos.jpg"
              descripcion="Evento de skateboard en la ciudad de la eterna primavera"
              text="Próximos eventos :"
              dato="2/09/2025"
            />
            <Card
              img="./bg_eventosL3.jpg"
              descripcion="Evento de skateboard en la ciudad de la eterna primavera"
              text="Próximos eventos :"
              dato="2/09/2025"
            />
          </div>
        </div>
      </section>

      {/* ================== SECCIÓN APRENDER ================== */}
      <section className="max-w-[1400px] mx-auto h-[600px] flex gap-x-20 items-center p-[3rem]">
        {/* Texto */}
        <div className="w-[50%]">
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
          <BtnLinkIcon title={"Preinscribete!"}>
            <NotebookPen size={20} strokeWidth={2} color="white" />
          </BtnLinkIcon>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-3 grid-rows-3 gap-4 max-w-[800px] mx-auto h-[500px]">
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
      <section className="max-w-[1300px] mx-auto bg-red-600 mt-[120px] ">
        <h2>Nuestros mejores reels!</h2>
        
        <div className="grid grid-cols-3 gap-[15px]">
           <article className="relative flex  h-[600px] rounded-[30px] overflow-hidden  cursor-pointer ">
          <video className=" w-full h-full object-cover absolute { "src="./vd_landing1.mp4"></video>
          {/* el gradient del video y todos estos son hermanos del video  */}
          <div className="gradient__reels absolute w-full h-full left-0 top-0 z-10 block"></div>
          <span className="w-[150px] h-[150px] bg-white/20 z-10 rounded-full backdrop-blur-[14px] border-1 border-white/20 flex flex-col justify-center items-center text-white absolute top-[50%] left-[50%] translate-[-50%]">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>
          <p>Reproducir</p>
          </span>
        </article>


        
        <article className="relative flex  h-[600px] rounded-[30px] overflow-hidden  cursor-pointer ">
          <video className=" w-full h-full object-cover absolute { "src="./vd_landing1.mp4"></video>
          {/* el gradient del video y todos estos son hermanos del video  */}
          <div className="gradient__reels absolute w-full h-full left-0 top-0 z-10 block"></div>
          <span className="w-[150px] h-[150px] bg-white/20 z-10 rounded-full backdrop-blur-[14px] border-1 border-white/20 flex flex-col justify-center items-center text-white absolute top-[50%] left-[50%] translate-[-50%]">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>
          <p>Reproducir</p>
          </span>
        </article>


            <article className="relative flex  h-[600px] rounded-[30px] overflow-hidden  cursor-pointer ">
          <video className=" w-full h-full object-cover absolute { "src="./vd_landing1.mp4"></video>
          {/* el gradient del video y todos estos son hermanos del video  */}
          <div className="gradient__reels absolute w-full h-full left-0 top-0 z-10 block"></div>
          <span className="w-[150px] h-[150px] bg-white/20 z-10 rounded-full backdrop-blur-[14px] border-1 border-white/20 flex flex-col justify-center items-center text-white absolute top-[50%] left-[50%] translate-[-50%]">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>
          <p>Reproducir</p>
          </span>
        </article>

        </div>
       
      </section>

      <section className="w-[400px] h-[600px] gradient__reels rounded-[40px] fixed ">
        <div className="w-full h-full object-cover">
            <video className="" src="./vd_landing1.mp4"></video>
        </div>
      </section>
    </>
  );
};
