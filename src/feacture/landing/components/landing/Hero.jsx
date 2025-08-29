import React from "react";
// import {bg_hero_landing} from '/bg_hero_landing'

export  const Hero = () =>{

    return(
  
    <section className="relative w-full h-screen">
        {/* Picture de hero */}
        <picture className="absolute  left-0 top-0 w-full h-full">
            <img className="w-full h-full object-cover object-center" src="/bg_hero_landing.jpg" alt="" />
            
            {/* Contenedor con texto y el degradado */}
            <div className=" gradient w-full h-full  left-0 top-0 absolute p-[100px] items-end flex text-white">
                <div className="max-w[700px]">
                    <h1>Onwhels-SB</h1>
                </div>
                
                </div> 
        </picture>
      
    </section>
  
    )
} 