import React from "react";
import Layout from "../layout/layout";
import { Mail, Phone, PhoneCall, Shirt, User } from "lucide-react";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";

export const MyPurchases = () => {
    return (
        <Layout>
            <section className="w-full h-full  rounded-[30px] p-[30px] bg-white border border-black/20">
            <div className="flex justify-between">
                <h1 className="font-primary">Mis Compras.</h1>
                <BtnLinkIcon title="Ver Tienda">
                    <Shirt color="white" strokeWidth={1.3} size={20}/>
                </BtnLinkIcon>

            </div>


                <div className="mt-[80px] grid grid-cols-2 gap-[20px]">
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">17/08/2025</h4>
                            <p>Categoria: Camisa</p>
                            <p>Precio: $100.000</p>
                            <p className="w-[130px] bg-yellow-100 text-yellow-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Pendiente</p>

                        </div>
                    </div>
               
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">17/08/2025</h4>
                            <p>Categoria: Camisa</p>
                            <p>Precio: $100.000</p>
                            <p className="w-[130px] bg-yellow-100 text-yellow-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Pendiente</p>

                        </div>
                    </div>
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">17/08/2025</h4>
                            <p>Categoria: Camisa</p>
                            <p>Precio: $100.000</p>
                            <p className="w-[130px] bg-yellow-100 text-yellow-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Pendiente</p>

                        </div>
                    </div>
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">17/08/2025</h4>
                            <p>Categoria: Camisa</p>
                            <p>Precio: $100.000</p>
                            <p className="w-[130px] bg-green-100 text-green-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Entragado</p>

                        </div>
                    </div>
                   
                   
                </div>
            </section>
        </Layout>
    )

}