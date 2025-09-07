import React from "react";
import { Layout } from "../layout/Layout";
import { CardProduct } from "../components/CardProduct";
import { BtnLinkIcon } from "../components/BtnLinkIcon";
import { CreditCard } from "lucide-react";

export const ShoppingCart = () => {
    return (
        <Layout>
            <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px]">
                <div className="w-[75%]">
                    <h1 className="mb-[60px]">Carrito de <span className="font-primary">compras.</span></h1>
                    <CardProduct />
                    <CardProduct />
                    <CardProduct />

                </div>
                <div className="w-[25%] pt-[110px] border-l border-black/60  border-dashed pl-[30px]">

                    <div className="sticky top-[200px]">
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
                                    <textarea name="" id="" className="w-full h-[100px] block p-[18px] rounded-[30px] border-1 border-black/40  border-dashed"></textarea>




                                </label>
                            </form>

                        </div>
                        <BtnLinkIcon title="Comprar productos" style="bg-[var(--color-blue)]! text-white w-full" styleIcon="bg-white!">
                            <CreditCard className="text-[var(--color-blue)]!" />

                        </BtnLinkIcon>

                    </div>
                </div>

            </section>
        </Layout>
    )
}