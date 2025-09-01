import React from "react";
import { Hero } from "../components/abaut/Hero";
import { Header } from '../layout/Header'
import { Footer } from '../layout/Footer'

export const About = () => {
    return (
        <>
        <Header />
            <Hero />
            <section className="mt-[120px] max-w-[1500px] mx-auto p-[20px]">
                <section className="mt-[20px] flex items-center gap-[40px]">
                     <picture className="clip w-[50%] h-[650px]">
                        <img className="  w-full h-full object-cover brightness-70" src=" ./animation-3.jpg" alt="" />

                    </picture>



                    <div className="w-[50%]">
                        <h1 className="font-primary mb-[30px]">Nuestra Vision.</h1>
                        <div className="opacity-70 ">
                            <h3 className="mb-[20px]!">Ser más que una tienda: <span className="font-primary mx-[10px]">convertirnos en el motor</span> que impulse la <span className="font-primary mx-[10px">cultura del skate</span> en nuestra comunidad y más allá. Queremos <span className="font-primary mx-[10px]"> inspirar a nuevas generaciones</span> a patinar, crear y compartir..</h3>
                            <h3>construyendo<span className="font-primary mx-[10px]"> un espacio donde cada</span>  truco, cada caída y cada victoria se viva como <span className="font-primary mx-[10px]"> parte de una misma pasión</span></h3>

                        </div>

                    </div>

                </section>
                <section className="flex items-center gap-[40px] mt-[60px]">
                    <div className="w-[50%]">
                        <h1 className="font-primary mb-[30px]">Nuestra Misión.</h1>
                        <div className="opacity-70 ">
                            <h3 className="mb-[20px]!">Ser más que una tienda: <span className="font-primary mx-[10px]">convertirnos en el motor</span> que impulse la <span className="font-primary mx-[10px">cultura del skate</span> en nuestra comunidad y más allá. Queremos <span className="font-primary mx-[10px]"> inspirar a nuevas generaciones</span> a patinar, crear y compartir..</h3>
                            <h3>construyendo<span className="font-primary mx-[10px]"> un espacio donde cada</span>  truco, cada caída y cada victoria se viva como <span className="font-primary mx-[10px]"> parte de una misma pasión</span></h3>

                        </div>

                    </div>
                    <picture className="clip w-[50%] h-[650px]">
                        <img className="  w-full h-full object-cover brightness-70" src=" ./animation-2.jpg" alt="" />

                    </picture>




                </section>
            </section>

            <Footer />
        </>
    )
}