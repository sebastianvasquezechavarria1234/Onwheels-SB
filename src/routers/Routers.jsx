import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../feacture/landing/pages/Home";

export const Routers = () => {
    return(
        <Routes>
            <Route path="/" element={<Home />}/>
        </Routes>
    )
}