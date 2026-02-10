import React from "react";
import { Link } from "react-router-dom";
import bg_hero_shop from '/bg_hero_shop.jpg'
import { ArrowDown, ArrowRight, ArrowUpToLine, Calendar, Shirt } from "lucide-react";
import { BtnLinkIcon } from "../BtnLinkIcon";


export const Hero = () => {
    return (
        <>
            <section className="relative w-full h-[60vh] min-h-[500px] max-h-[700px]">
                {/* Picture */}
                <picture className="absolute left-0 top-0 w-full h-full">
                    <img className="w-full h-full object-cover object-center" src="/bg_hero_shop.jpg" alt="Hero" />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Container */}
                    <div className="absolute inset-0 flex items-center justify-start p-[80px] text-white max-md:p-[30px]">
                        <div className="max-w-[600px] relative z-10 animate-fade-in-up">
                            <p className="italic mb-4 text-gray-200 font-medium tracking-wider uppercase text-sm">--- Tienda Oficial</p>
                            <h1 className="mb-6 text-5xl lg:text-7xl font-bold leading-tight">
                                Todo lo que
                                <span className="font-primary text-[var(--color-blue)] block mt-2">
                                    un skater
                                </span>
                                necesita.
                            </h1>
                            <p className="mb-8 text-lg text-gray-200 font-light leading-relaxed max-w-[90%]">
                                Descubre una selección premium hecha para skaters auténticos.
                                La esencia del skate, ahora a un clic de distancia.
                            </p>


                            {/* Buttons */}
                            <div className="flex gap-4">
                                <Link to="#products" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-[var(--color-blue)] hover:text-white transition-all flex items-center gap-2">
                                    <Shirt size={18} strokeWidth={2.5} />
                                    Ver productos
                                </Link>
                                <Link to="/events" className="px-6 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all flex items-center gap-2">
                                    <Calendar size={18} strokeWidth={2.5} />
                                    Próximos eventos
                                </Link>
                            </div>

                        </div>
                    </div>

                </picture>
            </section>
        </>

    )
}