import React from "react";
import Layout from "../layout/layout";

export const Setting = () => {
    return (
        <Layout>
            <section className="w-full h-full bg-red-600 rounded-[30px] p-[30px] bg-white border border-black/20">
                <h1 className="font-primary">Mi perfil.</h1>


                <div className="max-w-[600px]">

                    <div className="flex gap-[10px]">
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
                    <div className="flex gap-[10px]">
                        <div className="mb-[20px] w-[50%] block">
                            <p className="mb-[0px] translate-x-[20px]">Telefono:
                            </p>
                            <p className=" block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed"> 3017683456</p>
                        </div>
                        <div className="mb-[20px] w-[50%] block">
                            <p className="mb-[0px] translate-x-[20px]">Correo electronico:
                            </p>
                            <p className=" block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed">sebasVasquez1314@gmail.com</p>
                        </div>

                    </div>
                    <div className="flex gap-[10px]">
                        <div className="mb-[20px] w-[50%] block">
                            <p className="mb-[0px] translate-x-[20px]">Telefono:
                            </p>
                            <p className=" block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed"> 3017683456</p>
                        </div>
                        <div className="mb-[20px] w-[50%] block">
                            <p className="mb-[0px] translate-x-[20px]">Correo electronico:
                            </p>
                            <p className=" block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed">sebasVasquez1314@gmail.com</p>
                        </div>

                    </div>
                </div>
            </section>
        </Layout>
    )

}