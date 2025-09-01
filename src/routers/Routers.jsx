import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../feacture/landing/pages/Home";
import { Shop } from "../feacture/landing/pages/Store";
import { Class } from "../feacture/landing/components/class/class";
import Preinscriptions from "../feacture/landing/pages/preinscriptions";
import { About } from "../feacture/landing/pages/About";

export const Routers = () => {
    return(
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="shop" element={<Shop />}/>
            <Route path="class" element={<Class />}/>
            <Route path="preinscriptions" element={<Preinscriptions />}/>
            <Route path="/about" element={<About />}/>

        </Routes>
    )
}