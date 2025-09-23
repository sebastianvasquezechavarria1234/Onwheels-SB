import React from "react";
import { Hero } from "../components/landing/Hero";
import { Layout } from "../layout/Layout";
import { Grid } from "../components/landing/Grid";



export const Home = () => {
    return (
        <Layout>
            <Hero></Hero>
            <Grid></Grid>
        </Layout>
    )
}