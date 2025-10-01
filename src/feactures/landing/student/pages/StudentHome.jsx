import React from "react";
import { Hero } from "../../components/landing/Hero";
import { StudentLayout } from "../layout/StudentLayout";
import { Grid } from "../../components/landing/Grid";



export const StudentHome = () => {
    return (
        <StudentLayout>
            <Hero></Hero>
            <Grid></Grid>
        </StudentLayout>
    )
}