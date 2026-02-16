import React from "react";
import { Hero } from "../../components/landing/Hero";
import { Home } from "../../pages/Home"
import { UsersLayout } from "../layout/UsersLayout";



export const UsersHome = () => {
    return (
        <UsersLayout>
            <Hero></Hero>
            <Home></Home>
        </UsersLayout>
    )
}