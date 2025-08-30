import {React, Link} from "react";
import  bg_hero_shop  from '/bg_hero_shop.jpg'
import { ArrowDown, ArrowRight, ArrowUpToLine } from "lucide-react";


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
                            <p className="italic mb-[30px]">---Tienda</p>
                            <h1 className="mb-[30px]">
                               Todo lo que 
                               <span className="font-primary">
                                    un skater 
                               </span>
                               necesita en un 
                                <span className="font-primary">
                               solo lugar!

                                </span>
                            </h1>
                            <p className="mb-[30px]">Descubre una tienda hecha para skaters auténticos. Encuentra productos inspirados en la cultura urbana y vive la esencia del skate dentro y fuera de la tabla.</p>


                            {/* Flex buttom */}
                            <div className="flex gap-[10px]">
                                <a href="" className="bg-white/90 text-black/90  inline-flex items-center p-[5px_15px_5px_5px] rounded-full gap-[10px] font-primary">
                                    <span className="w-[60px] h-[60px] flex justify-center items-center bg-gray-900 rounded-full">
                                        <ArrowDown color="white" strokeWidth={1.3}/>
                                    </span>
                                    <h4 className="font-primary">
                                        Ver productos
                                    </h4>
                                </a>
                                <a href="" className=" inline-flex items-center p-[5px_15px_5px_5px] rounded-full gap-[10px] font-primary">
                                    <span className="w-[60px] h-[60px] flex justify-center items-center bg-white rounded-full">
                                        <ArrowRight color="#333" strokeWidth={1.8}/>
                                    </span>
                                    <h4 className="font-primary">
                                        Ver Eventos
                                    </h4>
                                </a>
                            </div>

                        </div>
                    </div>

                </picture>
            </section>
        </>

    )
}