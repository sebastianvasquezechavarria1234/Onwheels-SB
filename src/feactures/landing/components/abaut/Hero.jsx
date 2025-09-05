import {React, Link} from "react";
import  bg_hero_shop  from '/bg_hero_shop.jpg'
import { ArrowDown, ArrowRight, ArrowUpToLine, Calendar, Shirt } from "lucide-react";
import { BtnLinkIcon } from "../BtnLinkIcon";


export const Hero = () => {
    return(
        <>
            <section className="relative w-full h-screen">
                {/* Picture */}
                <picture className="absolute left-0 top-0 w-full h-full">
                    <img className="w-full h-full object-cover object-center" src="/bg_hero_shop.jpg" alt="Hero" />

                    {/* Container text and gradient */}
                    <div className="gradient absolute left-0 top-0 w-full h-full bg-red-600 p-[100px] items-end flex text-white">
                        <div className="max-w-[900px]">
                            <p className="italic mb-[30px]">---Sobre nosotros</p>
                             

                            <h1 className="mb-[30px]">
                               Somos la 
                               <span className="font-primary">
                                    calle sobre cuatro ruedas
                               </span>
                               Skate, estilo y
                                <span className="font-primary">
                                pasión sin pausa.

                                </span>
                            </h1>
                            <p className="mb-[30px]">Descubre una tienda hecha para skaters auténticos. Encuentra productos inspirados en la cultura urbana y vive la esencia del skate dentro y fuera de la tabla.</p>


                            {/* Flex buttom */}
                            <div className="flex gap-[10px]">
                                 <BtnLinkIcon title="Ver Productos" link="">
                                        <Shirt color="white" strokeWidth={1.5} size={20}/>
                                </BtnLinkIcon>
                                 <BtnLinkIcon title="Ver Eventos" link="" style="bg-[transparent]! text-white" styleIcon="bg-white">
                                        <Calendar color="black" strokeWidth={1.8} size={20}/>
                                </BtnLinkIcon>
                                
                            </div>

                        </div>
                    </div>

                </picture>
            </section>
        </>

    )
}