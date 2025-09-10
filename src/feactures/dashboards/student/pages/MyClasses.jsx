import React from "react";
import Layout from "../layout/layout";
import { Mail, Phone, PhoneCall, User } from "lucide-react";
import { BtnLinkIcon } from "../../../landing/components/BtnLinkIcon";

export const MyClasses = () => {
    return (
        <Layout>
            <section className="w-full h-full  rounded-[30px] p-[30px] bg-white border border-black/20">
            <div className="flex justify-between">
                <h1 className="font-primary">Mis clases.</h1>
                <BtnLinkIcon title="Cotizar otra clase">
                    <PhoneCall color="white" strokeWidth={1.3} size={20}/>
                </BtnLinkIcon>

            </div>


                <div className="mt-[80px] grid grid-cols-2 gap-[20px]">
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">Instructor: Daniel</h4>
                            <p>Ubicación: Estadio</p>
                            <p>Dirección: Calle 5 54- 61 int 138</p>
                            <p>Dia: Lunes</p>
                            <p>Hora de inicio: 1 pm</p>
                            <p>Hora de finalización: 2 pm</p>
                            <p className="w-[130px] bg-orange-100 text-orange-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Intermedio</p>
                           

                        </div>
                    </div>
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">Instructor: Daniel</h4>
                            <p>Ubicación: Estadio</p>
                            <p>Dirección: Calle 5 54- 61 int 138</p>
                            <p>Dia: Lunes</p>
                            <p>Hora de inicio: 1 pm</p>
                            <p>Hora de finalización: 2 pm</p>
                            <p className="w-[130px] bg-orange-100 text-orange-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Intermedio</p>
                           

                        </div>
                    </div>
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">Instructor: Daniel</h4>
                            <p>Ubicación: Estadio</p>
                            <p>Dirección: Calle 5 54- 61 int 138</p>
                            <p>Dia: Lunes</p>
                            <p>Hora de inicio: 1 pm</p>
                            <p>Hora de finalización: 2 pm</p>
                            <p className="w-[130px] bg-orange-100 text-orange-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Intermedio</p>
                           

                        </div>
                    </div>
                    <div className="flex gap-[35px] rounded-20px">
                        <picture className="relative w-[50%] block rounded-[30px] overflow-hidden h-[300px]">
                            <img className="w-full h-full object-cover " src="https://tse1.mm.bing.net/th/id/OIP.r6uFBHkbiNuM-Z3rdI0kOgHaD4?r=0&w=1200&h=630&rs=1&pid=ImgDetMain&o=7&rm=3" alt="estadio" />
                            <div className="gradient-student absolute w-full h-full left-0 top-0"></div>
                        </picture>

                        <div className="flex flex-col gap-[10px]">
                            <h4 className="font-primary">Instructor: Daniel</h4>
                            <p>Ubicación: Estadio</p>
                            <p>Dirección: Calle 5 54- 61 int 138</p>
                            <p>Dia: Lunes</p>
                            <p>Hora de inicio: 1 pm</p>
                            <p>Hora de finalización: 2 pm</p>
                            <p className="w-[130px] bg-orange-100 text-orange-700 rounded-full p-[5px_15px_5px_15px] flex justify-center font-bold!">Intermedio</p>
                           

                        </div>
                    </div>
                   
                   
                </div>
            </section>
        </Layout>
    )

}