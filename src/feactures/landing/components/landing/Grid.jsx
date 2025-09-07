import React from "react";
import { Card } from "./Card";
import { BtnLinkIcon } from "../BtnLinkIcon";
import { ShirtIcon } from "lucide-react";

export const Grid = () => {
  return (
    <>
      {/* ================== SECCIÓN PRODUCTOS ================== */}
      <section className="max-w-[1400px] mx-auto p-20">
        <h3 className="mb-[30px]">
          Explora
          <span className="opacity-90 mx-[15px] font-primary">
            Nuestros productos
          </span>
          <span>Creados para la vida</span>
          <span className="opacity-70 font-primary"> sobre ruedas...</span>
        </h3>

        <div className="grid grid-cols-3 gap-[20px]">
          <Card
            img="./bg_hero_shop.jpg"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
            text="Camiseta para hombre"
            dato="$ 20.000"
          />
          <Card
            img="./bg_hero_shop.jpg"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
            text="Camiseta para hombre"
            dato="$ 20.000"
          />
          <Card
            img="./bg_hero_shop.jpg"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit."
            text="Camiseta para hombre"
            dato="$ 20.000"
          />
        </div>
        <div className="flex justify-center mt-[30px]">
            <BtnLinkIcon styleIcon={"bg-white"} style={"text-white bg-[var(--color-blue)]!"}  title={"Ver más productos"} >
                <ShirtIcon  className="text-[var(--color-blue)]!"></ShirtIcon>
            </BtnLinkIcon>
        </div>
      </section>

      {/* ================== SECCIÓN EVENTOS ================== */}
      <section className="bg-gray-200">
        <div className="max-w-[1400px] mx-auto p-20">
          <h3 className="mb-[30px] ">Proximos eventos</h3>

          <div className="grid grid-cols-3 gap-[20px]">
            <Card
              img="./bg_eventos.jpg"
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
              img="./bg_eventos.jpg"
              descripcion="Evento de skateboard en la ciudad de la eterna primavera"
              text="Próximos eventos :"
              dato="2/09/2025"
            />
          </div>
        </div>
      </section>

      {/* ================== SECCIÓN APRENDER ================== */}
      <section className="max-w-[1400px] mx-auto h-[600px] grid grid-cols-2 gap-x-20 items-center p-[3rem]">
        {/* Texto */}
        <div className="max-w-[600px]">
          <h2 className="text-4xl font-bold mb-4">
            ¿Te gustaría aprender con nosotros?
          </h2>
          <p className="text-black text-lg mb-4">
            En Performance SB te ofrecemos clases profesionales, eventos
            emocionantes y los mejores productos para que vivas al máximo tu
            pasión por el skateboarding.
          </p>
          <button className="bg-[#C45151] px-6 py-3 text-white rounded-full hover:opacity-90 transition">
            Preinscribirme
          </button>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-4 gap-6 max-w-[800px] mx-auto">
          <img
            className="col-span-2 row-span-3 object-cover rounded-lg w-full h-full"
            src="./bg_eventos.jpg"
            alt="img"
          />
          <img
            className="col-span-2 row-span-1 object-cover rounded-lg w-full h-full"
            src="./bg_hero_landing.jpg"
            alt="img"
          />
          <img
            className="col-span-1 row-span-3 object-cover rounded-lg w-full h-full"
            src="./bg_eventos.jpg"
            alt="img"
          />
          <img
            className="col-span-1 row-span-1 object-cover rounded-lg w-full h-full"
            src="./bg_hero_landing.jpg"
            alt="img"
          />
        </div>
         <div className="flex justify-center mt-[30px]">
            <BtnLinkIcon styleIcon={"bg-white"} style={"text-white bg-[var(--color-blue)]!"}  title={"Ver más productos"} >
                <ShirtIcon  className="text-[var(--color-blue)]!"></ShirtIcon>
            </BtnLinkIcon>
        </div>
      </section>
    </>
  );
};
