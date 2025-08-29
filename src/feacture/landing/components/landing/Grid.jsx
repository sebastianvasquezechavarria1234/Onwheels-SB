import React from "react";
import { Card } from "./Card";

export const Grid =()=>{

    return(
        <section className="max-w-[1400px] mx-auto p-20">
            {/* Vamos a poner un h2  */}
               <h2 className="mb-[30px]">Proximos Eventos</h2>
            {/*Griid  */}
               <div className="grid grid-cols-3 gap-[20px]">
                <Card></Card>
                <Card></Card>
                <Card></Card>



               </div>
        </section>
    )
}