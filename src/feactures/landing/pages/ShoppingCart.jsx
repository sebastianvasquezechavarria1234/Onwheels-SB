import React from "react";
import { Layout } from "../layout/Layout";
import { CardProduct } from "../components/CardProduct";
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { CreditCard } from "lucide-react";

export const ShoppingCart = () => {
    return (
        <Layout>
            <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
                <div className="w-[75%] max-lg:w-full">
                    <h2 className="mb-[20px] max-md:mb-[20px]">Carrito de compras.</h2>

                        <article className="p-[30px] border-1 border-black/20 rounded-[30px] max-md:p-[10px] max-md:rounded-[20px]">
                            {/* Header  */}
                            <div className="flex border-b border-black/20 pb-[30px] max-md:pb-[10px]">
                                <h4 className="w-[40%] max-md:text-[11px]! max-md:w-[50%]">Producto</h4>
                                <h4 className="w-[25%] max-md:text-[11px]! max-md:w-[20%]">Cantidad</h4>
                                <h4 className="w-[20%] max-md:text-[11px]! max-md:w-[15%]">Total</h4>
                                <h4 className="w-[10%] max-md:text-[11px]! max-md:w-[5%]">Acciones</h4>

                            </div>
                            <div className="flex flex-col gap-[20px] pt-[30px] max-md:pt-[10px]">
                                <CardProduct />
                                <CardProduct />
                                <CardProduct />

                            </div>
                        </article>

                </div>
                <div className="w-[25%] mt-[115px] border-1 rounded-[30px] border-black/20  p-[30px] max-lg:w-full max-md:p-[10px] max-lg:pl-0 max-lg:mt-[0px] max-md:rounded-[20px]">

                    <div className="sticky top-[200px] max-lg:top-[00px]">
                        <div className="">
                            <div className="flex justify-between mb-[10px]">
                                <p className="font-bold!">Subtotal</p>
                                <p>$1.200.000</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-bold!">Total</p>
                                <p>$1.200.000</p>
                            </div>
                            <form className="mt-[20px]" action="">
                                <label className="mb-[20px] block">
                                    <p className="mb-[10px]">Ingrese una  instrucciones especiales de entrega a continuación:
                                    </p>
                                    <textarea name="" id="" className="input"></textarea>




                                </label>
                            </form>

                        </div>
                        <BtnLinkIcon title="Comprar productos" style="bg-[var(--color-blue)]! text-white w-full max-md:w-[200px]" styleIcon="bg-white!">
                            <CreditCard className="text-[var(--color-blue)]!" />

                        </BtnLinkIcon>

                    </div>
                </div>

            </section>
        </Layout>
    )
}