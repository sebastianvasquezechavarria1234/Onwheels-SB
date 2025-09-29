import { ShoppingCart } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";


export const Card = () => {
    return (
        <>
            <Link to="" className="group">
                <picture className="relative w-full h-[430px] flex rounded-[30px] overflow-hidden max-md:h-[300px]">
                    <img className="absolute -z-10 w-full h-full object-cover scale-[1.1]  group-hover:scale-[1] duration-300 brightness-80 group-hover:brightness-100" src="/bg_hero_shop.jpg" alt="avatar" />
                    <h4 className="font-primary absolute top-[10px] left-[10px] bg-white p-[6px_15px] rounded-full">Camisa de hombre</h4>

                    {/* Gradient */}
                    <div className="absolute bottom-[-40%] group-hover:bottom-[-0%] left-0 gradient-backdrop p-[20px] text-white backdrop-[20px] z-30 duration-300 max-md:p-[15px] max-md:bottom-[-20%]">
                        <div className="flex justify-between items-center">
                            <p className="line-clamp-2 w-[70%]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur repudiandae obcaecati totam perferendis velit esse expedita ea reiciendis illo dolor unde consequuntur minima, quia enim corporis, dolorem eum commodi soluta.</p>
                            <p className="font-primary text-[35px]!">$20.000</p>

                        </div>




                    <button className="btn flex justify-center items-center bg-[var(--color-blue)] gap-[10px] w-full mt-[20px] max-md:mt-[0px]">

                        <ShoppingCart size={20} strokeWidth={2} color="currentColor" />
                        Añadir al carrito de compras

                    </button>
                    </div>
                </picture>


            </Link>
        </>
    )
}