import { InstructorLayout } from "../layout/InstructorLayout";
import  CardProduct  from "../../components/CardProduct";
import { BtnLinkIcon } from "../../components/BtnLinkIcon";
import { CreditCard } from "lucide-react";

export const InstructorShoppingCart = () => {
    return (
        <InstructorLayout>
            <section className="pt-[120px] max-w-[1500px] mx-auto p-[20px] flex gap-[30px] max-lg:flex-col max-md:p-[10px] max-md:pt-[80px]">
                <div className="w-[75%] max-lg:w-full">
                    <h2 className="mb-[60px] max-md:mb-[20px]">Carrito de compras.</h2>
                    <CardProduct />
                    <CardProduct />
                    <CardProduct />

                </div>
                <div className="w-[25%] pt-[110px] border-l border-black/20  pl-[30px] max-lg:w-full max-lg:border-none max-md:pt-[20px] max-lg:pl-0">

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
                                    <textarea name="" id="" className="input"></textarea>




                                </label>
                            </form>

                        </div>
                        <BtnLinkIcon title="Comprar productos" style="bg-[var(--color-blue)]! text-white " styleIcon="bg-white!">
                            <CreditCard className="text-[var(--color-blue)]!" />

                        </BtnLinkIcon>

                    </div>
                </div>

            </section>
        </InstructorLayout>
    )
}