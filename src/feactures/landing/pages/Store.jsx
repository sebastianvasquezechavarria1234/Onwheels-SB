import React from "react";
import { Hero } from "../components/shop/Hero";
import { Grid } from "../components/shop/Grid";
import { Footer } from "../layout/Footer";
import { Header } from "../layout/Header";
import { Animation } from "../components/Animation";
import { Layout } from "../layout/Layout";


export const Store = () => {
    return (
        <Layout>
            <Animation />
            <Hero />
            <Grid />

        </Layout>
    )
}