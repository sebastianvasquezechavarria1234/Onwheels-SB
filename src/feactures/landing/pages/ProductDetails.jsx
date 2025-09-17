import React from "react";
import { Layout } from '../layout/Layout'
import { CreditCard, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export const ProductDetails = () => {
    return (
        <Layout>
            <section className="pt-[120px] max-w-[1200px] mx-auto p-[20px] max-md:p-[10px] flex gap-[40px] max-lg:flex-col">
                {/* left */}
                <article className="w-[60%] max-lg:w-full max-lg:pt-[45px]">
                    <picture className="w-full h-[600px] block rounded-[30px] overflow-hidden max-lg:h-[90vw]">
                        <img
                            className="w-full h-full object-cover object-center"
                            src="https://http2.mlstatic.com/D_NQ_NP_781532-MCO85573883368_062025-O.webp"
                            alt="" />

                    </picture>

                    <div className="flex mt-[10px] gap-[10px]">
                        <picture className="w-[100px] h-[100px] rounded-[30px] overflow-hidden block">
                            <img
                                className="w-full h-full object-cover object-center"
                                src="https://http2.mlstatic.com/D_NQ_NP_781532-MCO85573883368_062025-O.webp"
                                alt="" />

                        </picture>
                        <picture className="w-[100px] h-[100px] rounded-[30px] overflow-hidden block">
                            <img
                                className="w-full h-full object-cover object-center"
                                src="https://http2.mlstatic.com/D_NQ_NP_781532-MCO85573883368_062025-O.webp"
                                alt="" />

                        </picture>
                        <picture className="w-[100px] h-[100px] rounded-[30px] overflow-hidden block">
                            <img
                                className="w-full h-full object-cover object-center"
                                src="https://http2.mlstatic.com/D_NQ_NP_781532-MCO85573883368_062025-O.webp"
                                alt="" />

                        </picture>
                        <picture className="w-[100px] h-[100px] rounded-[30px] overflow-hidden block">
                            <img
                                className="w-full h-full object-cover object-center"
                                src="https://http2.mlstatic.com/D_NQ_NP_781532-MCO85573883368_062025-O.webp"
                                alt="" />

                        </picture>

                    </div>

                </article>

                {/* right */}
                <article className="w-[40%] max-lg:w-full">
                    <div className="flex gap-[20px] items-center mb-[30px]">
                        <p className="text-green-800">+30 vendidos</p>
                        <span className="w-[1px] h-[15px] block bg-[currentColor]"></span>
                        <p>Envió a todo Medellin</p>
                    </div>
                    <h3 className="font-primary">Camisa de hombre</h3>
                    <h2 className="font-primary mb-[20px]">$100.000</h2>
                    <p className="mb-[20px]">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt harum ullam dolores sint maiores dolorem officia sed voluptatem, exercitationem architecto libero, unde voluptatum nulla explicabo itaque? Sequi dignissimos sed ratione?</p>
                    {/* Numbers */}
                    <div className="">
                        <div className="flex gap-[20px] items-center mb-[10px]">
                            <p className="">Cantidad</p>
                            <span className="w-[1px] h-[15px] block bg-[currentColor]"></span>
                            <p className="text-green-800">5 Disponibles</p>
                        </div>
                    </div>
                    <div className="flex gap-[5px] items-center">
                        <span className="w-[60px] h-[60px] flex items-center cursor-pointer justify-center border-1 border-black/50 rounded-full max-md:w-[30px]  max-md:h-[30px]">
                            <svg width="10" height="2" viewBox="0 0 10 2" fill="none">      <rect width="10" height="2" fill="currentColor"></rect>    </svg>
                        </span>
                        <span className="w-[60px] h-[60px] flex items-center justify-center border-1 border-black/50 rounded-full max-md:w-[30px]  max-md:h-[30px]">1</span>
                        <span className="w-[60px] h-[60px] flex items-center cursor-pointer justify-center border-1 border-black/50 rounded-full max-md:w-[30px]  max-md:h-[30px]">
                            <svg class="icon-plus " aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">      <path fill-rule="evenodd" clip-rule="evenodd" d="M4 6L4 10H6V6H10V4H6V0H4L4 4H0V6H4Z" fill="currentColor"></path>    </svg>
                        </span>

                    </div>
                    {/* Grid talla color */}
                    <div className="grid grid-cols-2 gap-[20px] my-[20px]">

                        <div className="">
                            <p>Talla:</p>
                            <div className="flex flex-wrap gap-[5px] text-[#333]! ">
                                <p className="font-bold! w-[60px] h-[60px] flex justify-center items-center bg-white rounded-full border-1 border-black/40">xl</p>
                                <p className="font-bold! w-[60px] h-[60px] flex justify-center items-center border-1 border-black/40 rounded-full bg-white">l</p>
                                <p className="font-bold! bg-white !w-[60px] h-[60px] flex justify-center items-center border-1 border-black/40 rounded-full">s</p>

                            </div>
                        </div>

                        <div className="">
                            <p>Color:</p>
                            <div className="flex flex-wrap gap-[5px]">
                                <p className="w-[60px] h-[60px] flex justify-center items-center border-1 border-black/40 rounded-full bg-yellow-600"></p>
                                <p className="w-[60px] h-[60px] flex justify-center items-center border-1 border-black/40 rounded-full bg-red-600"></p>
                                <p className="w-[60px] h-[60px] flex justify-center items-center border-1 border-black/40 rounded-full bg-pink-600"></p>

                            </div>
                        </div>
                    </div>




                    <div className="flex flex-col gap-[10px]">
                        <button className="btn bg-blue-700 text-white flex items-center justify-center gap-[10px]">
                            <ShoppingCart size={20} />
                            Añadir al carrito de compras
                        </button>
                        <Link to="" className="btn bg-[#333] text-white flex justify-center gap-[10px] items-center">
                            <CreditCard size={20} strokeWidth={1.5} color="white" />
                            Comprar ahora
                        </Link>
                    </div>
                </article>
            </section>

        </Layout>
    )
}