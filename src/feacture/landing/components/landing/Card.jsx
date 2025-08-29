import React from "react";
import { Link } from "react-router-dom";
import {ShoppingCart} from "lucide-react";

export const Card = ()=>{
    return(
        <>
            
            <Link to="" className="group">
            <picture className="w-full h-[350px] block rounded-[8px] overflow-hidden ">
                <img className="w-full h-full object-cover scale-[1.1] group-hover:scale-[1] duration-300" src="bg_hero_landing.jpg " alt="skate" />
            </picture>
            
            <h4 className="my-[20px]">Productos destacados</h4>
            <p className="line-clamp-2">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro possimus perspiciatis, laudantium a esse recusandae quidem cupiditate doloribus qui odio maxime itaque adipisci consequuntur cumque delectus voluptas quaerat. Vel, accusantium.</p>
            {/* grid */}
            {/* se crea este contenedor para hacer dos columnas */}
            <div className="grid grid-cols-2 gap-[20px] mt-[20px]">
                {/* separacion para coger el 50% */}
                <div className="">
                    <p>Talla:</p>
                    <div className="flex gap-[10px] flex-wrap">
                        <p className="w-[50px] h-[50px] flex justify-center items-center border-1 border-black/40 rounded-full">L</p>
                         <p className="w-[50px] h-[50px] flex justify-center items-center border-1 border-black/40 rounded-full">L</p>
                          <p className="w-[50px] h-[50px] flex justify-center items-center border-1 border-black/40 rounded-full">L</p>
                    </div>
                </div>
                <div className="">
                    <p>Color:</p>
                    <div className="flex gap-[10px] flex-wrap">
                        <p className="w-[50px] h-[50px] flex justify-center items-center border-1 border-black/40 rounded-full bg-yellow-600 "></p>
                         <p className="w-[50px] h-[50px] flex justify-center items-center border-1 border-black/40 rounded-full bg-blue-500"></p>
                          <p className="w-[50px] h-[50px] flex justify-center items-center border-1 border-black/40 rounded-full bg-sky-400"></p> 
                    
                    </div>
                </div>
            </div>

            {/* boton añadir */}
            <button className="p-[18px] flex justify-center items-center bg-blue-600 rounded-[8px] gap-[10px] w-full mt-[20px] text-white">
               <ShoppingCart size={20} strokeWidth={2} color="currentColor" />
               Añadir al carrito
            </button>

            </Link>
        </>
    )
}