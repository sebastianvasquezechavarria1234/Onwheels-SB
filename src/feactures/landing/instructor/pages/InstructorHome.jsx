import React from "react";
import { Hero } from "../../components/landing/Hero";
import { InstructorLayout } from "../layout/InstructorLayout";
import { Grid } from "../../components/landing/Grid";



export const InstructorHome = () => {
    return (
        <InstructorLayout>
            <Hero></Hero>
            <Grid></Grid>
        </InstructorLayout>
    )
}