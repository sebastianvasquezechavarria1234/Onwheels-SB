import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../feacture/landing/pages/Home";
import { Shop } from "../feacture/landing/pages/Store";

export const Routers = () => {
    return(
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="shop" element={<Shop />}/>
        </Routes>
    )
}