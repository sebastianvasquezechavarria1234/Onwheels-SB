import React from "react";
<<<<<<< HEAD
=======
import { Layout } from "../layout/Layout";
import { article } from "framer-motion/client";
import { Trash2 } from "lucide-react";
>>>>>>> 45ee0ec794f617366472d6863b58dc023d6f49de

export const CardProduct = () => {
    return(
        <article className="flex justify-between mb-[20px] w-full">
            <div className="flex gap-[20px]">
                <picture className="rounded-[30px] w-[300px] h-[300px] block overflow-hidden">
                    <img className="w-full h-full object-cover" src="./animation-1.jpg" alt="bg products" />
                </picture>
                <div className="flex flex-col gap-[10px]">
                    <h4 className="font-primary">Camisa de hombre</h4>
                    <p>Precio: $100.000</p>

                </div>

            </div>

            <div className="">
                <p>Cantidad</p>
                <div className="flex gap-[5px]">
                    <span className="w-[60px] h-[60px] flex items-center cursor-pointer justify-center border-1 border-black/50 rounded-full">
                        <svg width="10" height="2" viewBox="0 0 10 2" fill="none">      <rect width="10" height="2" fill="currentColor"></rect>    </svg>
                    </span>
                    <span className="w-[60px] h-[60px] flex items-center justify-center border-1 border-black/50 rounded-full">1</span>
                    <span className="w-[60px] h-[60px] flex items-center cursor-pointer justify-center border-1 border-black/50 rounded-full">
                        <svg class="icon-plus " aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">      <path fill-rule="evenodd" clip-rule="evenodd" d="M4 6L4 10H6V6H10V4H6V0H4L4 4H0V6H4Z" fill="currentColor"></path>    </svg>
                    </span>
                    <span className="w-[60px] h-[60px] bg-red-600 flex items-center cursor-pointer justify-center border-1 border-white/50 rounded-full">
                        <Trash2 size={20} color="white" strokeWidth={1.5} />
                    </span>

                </div>
            </div>
            

        </article>
    )
}