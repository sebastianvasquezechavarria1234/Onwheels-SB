import React from "react";
import { Layout } from "../../instructor/layout/layout";
import { Mail, Phone, User } from "lucide-react";

export const SettingInstructor = () => {
    return (
        <Layout>
            <section className="p-[30px] relative w-[100%]">
                <h2 className="font-primary">Mi perfil</h2>


                <div className="flex items-center gap-[30px] mt-[80px]">

                    <picture className="relative w-[200px] h-[200px] rounded-full flex justify-center items-center">
                        <img className="w-full h-full object-cover opacity-50" src="https://tse4.mm.bing.net/th/id/OIP.XmX3OORybgBCLw-Xd6rYrQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" alt="avatar" />
                    </picture>

                    <div className="flex flex-col gap-[10px]">
                        <span className="inline-flex justify-center w-[100px] items-center gap-[5px] px-[15px] py-[7px] rounded-full bg-green-100 text-green-700">
                            <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
                            Activo
                        </span>
                        <h4 className="font-primary">
                            Sebastian vasquez echavraia
                        </h4>

                        {/* flex */}
                        <div className="flex gap-[20px]">
                            <div className="flex gap-[10px] items-center">
                                <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full">
                                    <Phone color="white" size={20} strokeWidth={1.3} />
                                </span>
                                <p className="font-semibold!">301789356</p>
                            </div>
                            <div className="flex gap-[10px] items-center">
                                <span className="w-[60px] h-[60px] flex justify-center items-center bg-[var(--color-blue)] rounded-full">
                                    <Mail color="white" size={20} strokeWidth={1.3} />
                                </span>
                                <p className="font-semibold!">Sebasvasquez1314gmail.com</p>
                            </div>

                        </div>
                    </div>
                    {/* <div className="">
                        <div className="gap-[10px]">
                            <div className="mb-[20px] w-[50%] block">
                                <p className="mb-[0px] translate-x-[20px]">Nombre:
                                </p>
                                <p className=" block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed"> Sebastian</p>
                            </div>
                            <div className="mb-[20px] w-[50%] block">
                                <p className="mb-[0px] translate-x-[20px]">Apellidos:
                                </p>
                                <p className=" block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed">Vasquez echavarria</p>
                            </div>

                        </div>

                    </div> */}

                </div>

            </section>

        </Layout>
    )

}