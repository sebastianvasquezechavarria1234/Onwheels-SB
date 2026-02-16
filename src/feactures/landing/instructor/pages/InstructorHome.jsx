import React from "react";
import { Hero } from "../../components/landing/Hero";
import { InstructorLayout } from "../layout/InstructorLayout";
import { Home } from "../../pages/Home"



export const InstructorHome = () => {
    return (
        <InstructorLayout>
            <Hero></Hero>
            <Home></Home>
        </InstructorLayout>
    )
}