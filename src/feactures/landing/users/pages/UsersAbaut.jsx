import { Hero } from "../../components/abaut/Hero";
import { UsersLayout } from "../layout/UsersLayout";


export const UsersAbaut = () => {
    return (
        <UsersLayout>
            <Hero />
            <section className="mt-[120px] max-w-[1500px] mx-auto p-[20px] max-lg:mt-[60px]">
                <section className="mt-[20px] flex items-center gap-[40px] max-lg:flex-col ">
                    <picture className="clip w-[50%] h-[650px] max-lg:w-full max-lg:h-[80vw]">
                        <img className="  w-full h-full object-cover brightness-70" src="/animation-3.jpg" alt="imagen mision" />

                    </picture>



                    <div className="w-[50%] max-lg:w-full">
                        <h1 className=" mb-[30px] max-md:mb-[20px]">Nuestra Vision.</h1>
                        <div className="opacity-70 ">
                            <p className="text-[26px]! font-semibold! opacity-80 tracking-[-0.8px] leading-[30px] max-md:text-[16px]!">
                                Ser más que una tienda: convertirnos en el motor que impulse la cultura del skate en nuestra comunidad y más allá.
                                Queremos inspirar a nuevas generaciones a patinar, crear y compartir... construyendo un espacio donde cada truco,
                                cada caída y cada victoria se viva como parte de una misma pasión.
                            </p>



                        </div>

                    </div>

                </section>
                <section className="flex items-center gap-[40px] mt-[60px] max-lg:flex-col-reverse">
                    <div className="w-[50%] max-lg:w-full">
                        <h1 className="font-primary mb-[30px]">Nuestra Misión.</h1>
                        <div className="opacity-70 ">
                            <p className="text-[26px]! font-semibold! opacity-80 tracking-[-0.8px] leading-[30px] max-md:text-[16px]!">
                                Ser más que una tienda: convertirnos en el motor que impulse la cultura del skate en nuestra comunidad y más allá.
                                Queremos inspirar a nuevas generaciones a patinar, crear y compartir... construyendo un espacio donde cada truco,
                                cada caída y cada victoria se viva como parte de una misma pasión.
                            </p>

                        </div>

                    </div>
                    <picture className="clip w-[50%] h-[650px] max-lg:w-full max-lg:h-[80vw]">
                        <img className="  w-full h-full object-cover brightness-70" src="/animation-1.jpg" alt="imagen visison" />

                    </picture>




                </section>
            </section>
        </UsersLayout>


    )
}