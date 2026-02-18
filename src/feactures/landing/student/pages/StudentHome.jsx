import React from "react";
import { Hero } from "../../components/landing/Hero";
import { StudentLayout } from "../layout/StudentLayout";
import { Home } from "../../pages/Home"



export const StudentHome = () => {
    return (
        <StudentLayout>
            <Hero></Hero>
            <Home></Home>
        </StudentLayout>
    )
}