import React from "react";
import { Layout } from "../layout/Layout";
import { CardProduct } from "../components/CardProduct";

export const ShoppingCart = () => {
    return(
        <Layout>
            <section className="mt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[20px]">
                <div className="">
                    <h1>Carrito de <span className="font-primary">compras.</span></h1>
                    <CardProduct />

                </div>
                <div className=""></div>

            </section>
        </Layout>
    )
}