import React from "react";


import { Minus, Plus, Trash2 } from "lucide-react";

export const CardProduct = () => {
    return(
        <article className="flex justify-between mb-[20px] w-full">
            <div className="flex gap-[20px] max-md:gap-[10px]">
                <picture className="rounded-[30px] w-[300px] h-[300px] block overflow-hidden max-lg:w-[100px] max-lg:h-[100px] max-md:rounded-[20px]">
                    <img className="w-full h-full object-cover" src="/animation-1.jpg" alt="bg products" />
                </picture>
                <div className="flex flex-col gap-[10px]">
                    <h4 className="font-primary">Camisa de hombre</h4>
                    <p>Precio: $100.000</p>

                </div>

            </div>

            <div className="">
                <p>Cantidad</p>
                <div className="flex gap-[5px]">
                    <span className="w-[60px] h-[60px] flex items-center cursor-pointer justify-center border-1 border-black/30 rounded-full max-lg:w-[30px] max-lg:h-[30px]">
                        <Minus/>
                    </span>
                    <span className="w-[60px] h-[60px] flex items-center justify-center border-1 border-black/30 rounded-full max-lg:w-[30px] max-lg:h-[30px] max-md:text-[12px]">1</span>
                    <span className="w-[60px] h-[60px] flex items-center cursor-pointer justify-center border-1 border-black/30 rounded-full max-lg:w-[30px] max-lg:h-[30px]">
                        <Plus />
                    </span>
                    <span className="w-[60px] h-[60px] bg-red-600 flex items-center cursor-pointer justify-center border-1 border-white/50 rounded-full max-lg:w-[30px] max-lg:h-[30px]">
                        <Trash2 size={20} color="white" strokeWidth={1.5} />
                    </span>

                </div>
            </div>
            

        </article>
    )
}