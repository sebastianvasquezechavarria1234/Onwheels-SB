import React from "react";
import { Card } from "./Card";
import { Funnel, Search } from "lucide-react";


export const Grid = () => {
    return (
        <>
            <section className="mt-[120px] max-w-[1500px] mx-auto p-[20px]">

                
                {/* <p className="text-[40px] mb-[30px]">Nuestros productos...</p> */}

                {/* flex */}
                <div className="flex gap-[20px]">
                    {/* Filtros */}
                    <div className="w-[20%]">
                        <form className="sticky top-[100px] border-y border-black/50  border-dashed py-[20px]">
                            <div className="flex items-center gap-[10px] mb-[20px]">
                                <span className="w-[60px] h-[60px] flex justify-center items-center bg-gray-200 rounded-full">
                                    <Funnel color="#333" strokeWidth={1.3} />
                                </span>
                                <h4 className="font-primary">Filtros</h4>
                            </div>
                            <label className="mb-[20px] block">
                                <p className="">Buscar Productos:</p>
                                <div className="relative">
                                    <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                                    <input
                                        className="w-full p-[18px_18px_18px_50px] rounded-full border-1 border-black/40  border-dashed"
                                        type="text"
                                        placeholder="Por ejem: Camisa" />
                                </div>
                            </label>
                            <label className="mb-[20px] block">
                                <p className="">Categorias:</p>
                                <select className="w-full p-[18px] rounded-full border-1 border-black/40 border-dashed" name="" id="">
                                    <option value="">Camisas</option>
                                    <option value="">Gorras</option>
                                </select>
                            </label>
                            <label className="mb-[20px] block">
                                <p className="">Precio:</p>
                                <select className="w-full p-[18px] rounded-full border-1 border-black/40 border-dashed" name="" id="">
                                    <option value="">20.000 - 40.000</option>
                                    <option value="">40.000 - 80.000</option>
                                </select>
                            </label>
                        </form>

                    </div>

                    {/* Grid */}
                    <div className="w-[80%] ">
                        <h3 className="opacity-70 mb-[30px]">Explora
                            <span className="font-primary mx-[10px]">Nuestros productos</span>
                            creados para la vida 
                            <span className="font-primary mx-[10px]">sobre ruedas...</span>
                        </h3>

                        <div className="grid grid-cols-3 gap-[20px]">
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