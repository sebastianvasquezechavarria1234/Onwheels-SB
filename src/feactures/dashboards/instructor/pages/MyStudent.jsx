import React from "react";
import Layout from "../layout/layout";
import { Mail, Phone, PhoneCall, Search, Shirt, User, User2, User2Icon } from "lucide-react";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";

export const MyStudent = () => {
    return (
        <Layout>
            <section className="w-full h-full  rounded-[30px] p-[30px] bg-white border border-black/20">
                <div className="flex justify-between">
                    <h1 className="font-primary">Mis Estudiantes.</h1>
                </div>

                <div className="flex justify-between mt-[120px]">
                    <label className="mb-[20px] block">
                        <p className="translate-x-[0px] mb-[5px]">Buscar Estudiante:</p>
                        <div className="relative">
                            <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                            <input
                                className="w-full p-[18px_18px_18px_50px] rounded-full border-1 border-black/40  border-dashed"
                                type="text"
                                placeholder="Por ejem: Sebastian" />
                        </div>
                    </label>

                    <BtnLinkIcon title="Agregar estudiante">
                        <User color="white" size={20} strokeWidth={1.8}/>
                    </BtnLinkIcon>
                </div>


                <div className="flex mt-[20px] opacity-80 border-b border-dashed border-black/40 py-[20px]">
                    <p className="w-[20%] font-bold! italic ">Nombre:</p>
                    <p className="w-[20%] font-bold! italic ">Correo:</p>
                    <p className="w-[20%] font-bold! italic ">Teléfono:</p>
                    <p className="w-[20%] font-bold! italic ">Nivel:</p>
                    <p className="w-[20%] font-bold! italic ">Acciones:</p>
                </div>
                <div className="flex mt-[20px] opacity-80 border-b border-dashed border-black/40 py-[20px]">
                    <div className="w-[20%] flex gap-[15px] items-center font-bold! italic ">
                        <span className="w-[70px] h-[70px] bg-red-600 rounded-full flex justify-center items-center">
                            <User />
                        </span>
                        <div className="">
                            <h4 className="font-primary">Sebastian</h4>
                            <p>Vasquez echavarria</p>

                        </div>

                    </div>
                    <p className="w-[20%] font-bold! italic ">Correo:</p>
                    <p className="w-[20%] font-bold! italic ">Teléfono:</p>
                    <p className="w-[20%] font-bold! italic ">Nivel:</p>
                    <p className="w-[20%] font-bold! italic ">Acciones:</p>
                </div>
               
            </section>
        </Layout>
    )

}