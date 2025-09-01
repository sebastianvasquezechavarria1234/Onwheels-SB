import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../feacture/landing/pages/Home";
import { Shop } from "../feacture/landing/pages/Store";
import { Class } from "../feacture/landing/components/class/class";
import Preinscriptions from "../feacture/landing/pages/preinscriptions";

import { About } from "../feacture/landing/pages/About";

import Events from "../feacture/landing/events/events";
import Sidebar from "../feacture/dashboard/sidebar/sidebar";
import Estudiantes from "../feacture/dashboard/sidebar/configuracion/usuarios/usuarios";
import Productos from "../feacture/dashboard/sidebar/compras/productos/productos";
import Categorias from "../feacture/dashboard/sidebar/compras/categoria-productos/categoria-producto";
import Proveedores from "../feacture/dashboard/sidebar/compras/proveedores/proveedores";

export const Routers = () => {
    return(
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="shop" element={<Shop />}/>
            <Route path="class" element={<Class />}/>
            <Route path="preinscriptions" element={<Preinscriptions />}/>

            <Route path="events" element={<Events />}/>
            <Route path="sidebar" element={<Sidebar />}/>
            <Route path="estudiantes" element={<Estudiantes />}/>
            <Route path="productos" element={<Productos />}/>
            <Route path="categoria-productos" element={<Categorias />}/>
            <Route path="proveedores" element={<Proveedores/>}/>



        </Routes>
    )
}