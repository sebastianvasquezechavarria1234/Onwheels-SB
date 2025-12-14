import React from "react";

export const Animation = () => {
    return(
        <section className="animation fixed  text-white w-full h-screen absolute top-0 left-0 z-100 flex justify-center items-center">
            <div className="">
                {/* Card imagen */}
                <div className="bg__animation relative block flex bg-red-600 rounded-[0px] border-[10px] border-white flex justify-center">
                    {/* Title */}
                    <h4 className="font-primary absolute top-[30px] text-[30px]!">Performace-SB</h4>
                    {/* Gradient */}
                    <div className="bg__animation--gradient w-full h-full"></div>
                </div>

                {/* Barra */}
                <div className="relative border-[1px] border-white Barra block w-[350px] h-[10px]  mt-[20px]"></div>

                <h4 className="animation__text text-center font-primary mt-[20px] max-w-[350px]">Expertos en skatoboarding y ciendo los mejores!</h4>

                {/* Line delay */}
                <div className="animation__line--delay w-[1px] bg-white block absolute top-0 left-[50%] translate-x-[-50%]"></div>
            </div>
            
        </section>
    )
}