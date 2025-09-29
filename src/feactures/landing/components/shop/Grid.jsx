import React from "react";
import { Card } from "./Card";
import { Funnel, Search } from "lucide-react";


export const Grid = () => {
    return (
        <>
            <section className="mt-[120px] max-w-[1500px] mx-auto p-[20px] max-md:p-[10px] max-md:mt-[30px]">

                
       

                {/* flex */}
                <div className="flex gap-[20px]  max-md:gap-[10px] max-md:flex-col">
                    {/* Filtros */}
                    <div className="w-[20%] max-md:w-full">
                        <form className="sticky top-[100px] border-y border-black/30  py-[20px]">
                            <div className="flex items-center gap-[10px] mb-[20px]">
                                <span className="w-[60px] h-[60px] flex justify-center items-center bg-gray-200 rounded-full max-md:w-[30px] max-md:h-[30px]">
                                    <Funnel color="#333" strokeWidth={1.3} />
                                </span>
                                <h4 className="font-primary">Filtros</h4>
                            </div>
                            <div className="flex flex-col max-md:flex-row max-md:items-center max-md:gap-[10px]">
                                <label className="mb-[20px] block">
                                    <p className="">Buscar Productos:</p>
                                    <div className="relative">
                                        <Search className="absolute top-[50%] left-[20px] translate-y-[-50%] max-md:left-[10px]" strokeWidth={1.3} />
                                        <input
                                            className="input pl-[50px]! max-md:pl-[30px]!"
                                            type="text"
                                            placeholder="Por ejem: Camisa" />
                                    </div>
                                </label>
                                <label className="mb-[20px] block">
                                    <p className="">Categorias:</p>
                                    <select className="input" name="" id="">
                                        <option value="">Camisas</option>
                                        <option value="">Gorras</option>
                                    </select>
                                </label>
                                <label className="mb-[20px] block">
                                    <p className="">Precio:</p>
                                    <select className="input" name="" id="">
                                        <option value="">20.000 - 40.000</option>
                                        <option value="">40.000 - 80.000</option>
                                    </select>
                                </label>

                            </div>
                        </form>

                    </div>

                    {/* Grid */}
                    <div className="w-[80%] max-md:w-full">
                        <h3 className="opacity-70 mb-[30px]">Explora
                            <span className="font-primary mx-[10px]">Nuestros productos</span>
                            creados para la vida 
                            <span className="font-primary mx-[10px]">sobre ruedas...</span>
                        </h3>

                        <div className="grid grid-cols-3 gap-[20px] max-2xl:gap-[10px] max-xl:grid-cols-2">
                            <Card></Card>
                            <Card></Card>
                            <Card></Card>
                            <Card></Card>
                            <Card></Card>
                            <Card></Card>
                            <Card></Card>
                            <Card></Card>

                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}