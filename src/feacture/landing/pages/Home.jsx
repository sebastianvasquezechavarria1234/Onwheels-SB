import React from "react";
import { Hero } from "../components/landing/Hero";
import { Grid } from "../components/landing/grid";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";

export const Home = () => {
    return (
        <section >
            <Header></Header>
            <Hero></Hero>
            <Grid></Grid>
            <Footer></Footer>

            
       
        </section>



      
    )
}