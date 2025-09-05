import { ShoppingCart } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";


export const Card = () => {
    return (
        <>
            <Link to="" className="group">
                <picture className="relative w-full h-[20vw] flex rounded-[30px] overflow-hidden">
                    <img className="absolute -z-10 w-full h-full object-cover scale-[1.1]  group-hover:scale-[1] duration-300 brightness-80 group-hover:brightness-100" src=".//bg_hero_shop.jpg" alt="avatar" />
                    <h4 className="font-primary absolute top-[10px] left-[10px] bg-white p-[6px_15px] rounded-full">Camisa de hombre</h4>

                    {/* Gradient */}
                    <div className="absolute bottom-[-42%] group-hover:bottom-[-0%] left-0 gradient-backdrop p-[20px] text-white backdrop-[20px] z-30 duration-300">
                        <div className="flex justify-between items-center">
                            <p className="line-clamp-2 w-[70%]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur repudiandae obcaecati totam perferendis velit esse expedita ea reiciendis illo dolor unde consequuntur minima, quia enim corporis, dolorem eum commodi soluta.</p>
                            <p className="font-primary text-[35px]!">$20.000</p>

                        </div>


                        {/* Grid talla color */}
                        <div className="grid grid-cols-2 gap-[20px] mt-[20px]">
                            {/* Talla */}
                            <div className="">
                                <p>Talla:</p>
                                <div className="flex flex-wrap gap-[5px] text-[#333]! ">
                                    <p className="font-bold! w-[40px] h-[40px] flex justify-center items-center bg-white rounded-full">xl</p>
                                    <p className="font-bold! w-[40px] h-[40px] flex justify-center items-center border-1 border-black/40 rounded-full bg-white">l</p>
                                    <p className="font-bold! bg-white !w-[40px] h-[40px] flex justify-center items-center border-1 border-black/40 rounded-full">s</p>

                                </div>
                            </div>
                            {/* Color */}
                            <div className="">
                                <p>Color:</p>
                                <div className="flex flex-wrap gap-[5px]">
                                    <p className="w-[40px] h-[40px] flex justify-center items-center border-1 border-black/40 rounded-full bg-yellow-600"></p>
                                    <p className="w-[40px] h-[40px] flex justify-center items-center border-1 border-black/40 rounded-full bg-red-600"></p>
                                    <p className="w-[40px] h-[40px] flex justify-center items-center border-1 border-black/40 rounded-full bg-pink-600"></p>

                                </div>
                            </div>
                        </div>

                    <button className="p-[18px] flex justify-center items-center bg-blue-600 text-white rounded-full gap-[10px] w-full mt-[20px] cursor-pointer font-primary">

                        <ShoppingCart size={20} strokeWidth={2} color="currentColor" />
                        Añadir al carrito de compras

                    </button>
                    </div>
                </picture>


            </Link>
        </>
    )
}