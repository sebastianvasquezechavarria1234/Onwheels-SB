import React from "react";
import { Hero } from "../../components/landing/Hero";
import { Grid } from "../../components/landing/Grid";
import { UsersLayout } from "../layout/UsersLayout";



export const UsersHome = () => {
    return (
        <UsersLayout>
            <Hero></Hero>
            <Grid></Grid>
        </UsersLayout>
    )
}