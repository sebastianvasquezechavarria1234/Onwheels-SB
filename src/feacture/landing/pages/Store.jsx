import React from "react";
import { Hero } from "../components/shop/Hero";
import { Grid } from "../components/shop/Grid";
import { Footer } from "../layout/Footer";
import { Header } from "../layout/Header";


export const Shop = () => {
    return(
        <>
            <section class="">
                {/* <Header /> */}
                <Hero />
                <Grid/>
                <Footer />
            </section>
        </>

    )
}