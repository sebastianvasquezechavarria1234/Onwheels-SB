import React from "react";
import { Layout } from "../layout/Layout";
import { article } from "framer-motion/client";

export const CardProduct = () => {
    return(
        <article>
            <div className="flex gap-[20px]">
                <picture className="radius-[30px] w-[300px] h-[300px] block overflow-hidden">
                    <img className="w-full h-full object-cover" src="./animation-1.jpg" alt="bg products" />
                </picture>
                <div className="flex flex-col gap-[10px]">
                    <h4 className="font-primary">Camisa de hombre</h4>
                    <p>Precio: $100.000</p>

                </div>

            </div>

            <div className="">
                <p>Cantidad</p>
                <div className="flex gap-[10px]">
                    <span className="w-[60px] h-[60px] flex items-center justify-center border-1 border-black/50 rounded-full">-</span>
                    <span className="w-[60px] h-[60px] flex items-center justify-center border-1 border-black/50 rounded-full">1</span>
                    <span className="w-[60px] h-[60px] flex items-center justify-center border-1 border-black/50 rounded-full">+</span>

                </div>
            </div>
            

        </article>
    )
}