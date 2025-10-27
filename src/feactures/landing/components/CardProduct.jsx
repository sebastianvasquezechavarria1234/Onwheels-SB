import React from "react";


import { Minus, Plus, Trash2 } from "lucide-react";

export const CardProduct = () => {
    return(
        <article className="flex items-center w-full">
            <div className="flex w-[40%] gap-[20px] items-center max-md:gap-[10px] max-lg:w-[50%]!">
                <picture className="rounded-[30px] w-[120px] h-[120px] block overflow-hidden max-lg:w-[50px] max-lg:h-[50px] max-md:rounded-[15px]">
                    <img className="w-full h-full object-cover" src="/animation-1.jpg" alt="bg products" />
                </picture>
                <div className="flex flex-col">
                    <h4 className="font-primary">Camisa de hombre</h4>
                    <p>Color: amarillo</p>
                    <p>Talla: XL</p>

                </div>

            </div>

            {/* Cantidad */}
            <div className="w-[25%]  max-lg:w-[22%]">

                <div className="inline-flex  border-1 border-black/30 p-[3px] rounded-full">
                    <span className="w-[50px] h-[50px] flex items-center cursor-pointer justify-center  rounded-full max-lg:w-[20px] max-lg:h-[20px] hover:bg-black/10 duration-200">
                        <Minus size={18}/>
                    </span>
                    <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full max-lg:w-[20px] max-lg:h-[20px] max-md:text-[12px]">1</span>
                    <span className="w-[50px] h-[50px] flex items-center cursor-pointer justify-center rounded-full max-lg:w-[20px] max-lg:h-[20px] hover:bg-black/10 duration-200">
                        <Plus size={18}/>
                    </span>
                  

                </div>
            </div>

            {/* Total */}
            <div className="w-[25%] max-lg:w-[20%]">
                <h3 className="max-lg:text-[16px]!">$120.000</h3>
            </div>

            {/* Acciones */}
            <div className="w-[10%] max-lg:w-[5%]">
                  <span className="w-[60px] h-[60px] bg-[var(--color-blue)] flex items-center cursor-pointer justify-center border-1 border-white/50 rounded-full max-lg:w-[30px] max-lg:h-[30px]">
                        <Trash2 size={20} color="white" strokeWidth={1.5} />
                    </span>
            </div>
            

        </article>
    )
}