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
                    <div className="gradient absolute left-0 top-0 w-full h-full bg-red-600 p-[100px] items-end flex text-white max-md:p-[30px]">
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
                            

                        </div>
                    </div>

                </picture>
            </section>
        </>

    )
}