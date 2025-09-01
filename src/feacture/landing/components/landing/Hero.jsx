import React from "react";
import { BtnLinkIcon } from "../BtnLinkIcon";
import { NotebookPen, Shirt } from "lucide-react";
// import {bg_hero_landing} from '/bg_hero_landing'

export  const Hero = () =>{

    return(
            
    <section className="relative w-full h-screen">
        {/* Picture de hero */}
        <picture className="absolute  left-0 top-0 w-full h-full">
            <img className="w-full h-full object-cover object-center" src="/bg_hero_landing.jpg" alt="" />
            
            {/* Contenedor con texto y el degradado */}
            <div className=" gradient w-full h-full  left-0 top-0 absolute p-[100px] items-end flex text-white">
                <div className="max-w-[1200px]">
                    <h1 >Bienvenido a OnWheels-SB,
                        <span className="font-primary">el spot donde el skate no es solo un deporte </span>, es un estilo de vida.

                    </h1>
                    <div className="flex gap-[10px] mt-[30px]">
                    <BtnLinkIcon title={"Preinscripciones"}>
                        <NotebookPen size={20} strokeWidth={2} color="white"></NotebookPen>
                    </BtnLinkIcon>
                    <BtnLinkIcon title={"Nuestros Productos"} style="bg-[transparent]! text-white" styleIcon={"bg-white"} >
                        <Shirt size={20} strokeWidth={2} color="black" >

                        </Shirt>

                    </BtnLinkIcon>

                    </div>
                </div>
                
                </div> 
        </picture>
      
    </section>
  
    )
} 