import React from "react";
import { Hero } from "../components/landing/Hero";
import { Grid } from "../components/landing/grid";
import { Layout } from "../layout/Layout";



export const Home = () => {
    return (
        <Layout>
            <Hero></Hero>
            <Grid></Grid>
        </Layout>
    )
}