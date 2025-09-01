import React from "react";
import { Card } from "./Card";

export const Grid =()=>{

    return(
        <>
        <section className="max-w-[1400px] mx-auto p-20">
            {/* Vamos a poner un h2 ExploraNuestros productoscreados para la vidasobre ruedas...
 */}
                <h3 className="mb-[30px]"> Explora   
                <span className="opacity-90 mx-[15px] font-primary">Nuestros productos </span>
                <span>Creados para la vida  </span>
                <span className=" opacity-70 font-primary">Sobre ruedas... </span>
               </h3>
            {/*Griid  */}
               <div className="grid grid-cols-3 gap-[20px] ">
                <Card img="./bg_hero_shop.jpg" descripcion={"Lorem ipsum, dolor sit amet consectetur adipisicing elit."}></Card>
                <Card img="./bg_hero_shop.jpg" descripcion={"Lorem ipsum, dolor sit amet consectetur adipisicing elit."}></Card>
                <Card img="./bg_hero_shop.jpg" descripcion={"Lorem ipsum, dolor sit amet consectetur adipisicing elit."}></Card>

                
                



               </div>
        </section>

<section className="max-w-[1400px] mx-auto p-20">
            {/* Vamos a poner un h2 ExploraNuestros productoscreados para la vidasobre ruedas...
 */}
               <h3 className="mb-[30px]  ">Eventos :</h3>
            {/*Griid  */}
               <div className="grid grid-cols-3 gap-[20px] ">
                <Card img="./bg_eventos.jpg" descripcion={" Evento de skateboard en la ciudad de la eterna primavera"}></Card>
                <Card img="./bg_eventos.jpg" descripcion={ "Evento de skateboard en la ciudad de la eterna primavera"}></Card>
                <Card img="./bg_eventos.jpg" descripcion={ "Evento de skateboard en la ciudad de la eterna primavera"}></Card>
                



               </div>
        </section>

        </>
        
        
        
    )
}