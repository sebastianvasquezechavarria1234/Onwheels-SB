import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../feacture/landing/pages/Home";
import Shop from "../feacture/landing/pages/Store";
import Class from "../feacture/landing/components/class/class";
import Preinscriptions from "../feacture/landing/pages/preinscriptions";
import Events from "../feacture/landing/events/events";
import Sidebar from "../feacture/dashboard/layout-dashboard/sidebar";
import Estudiantes from "../feacture/dashboard/sidebar/configuracion/usuarios/usuarios";
import Productos from "../feacture/dashboard/sidebar/compras/productos/productos";
import Categorias from "../feacture/dashboard/sidebar/compras/categoria-productos/categoria-producto";
import Proveedores from "../feacture/dashboard/sidebar/compras/proveedores/proveedores";
import Sedes from "../feacture/dashboard/eventos/sedes/sedes";
import Patrocinadores from "../feacture/dashboard/eventos/patrocinadores/patrocinadores";
import CategoriasEventos from "../feacture/dashboard/eventos/categoria-eventos/categoria-eventos";
import Eventos from "../feacture/dashboard/eventos/eventos/eventos";
import Login from "../feacture/landing/Auth/Login";
import Register from "../feacture/landing/Auth/Register";

export const Routers = () => {
    return(
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="shop" element={<Shop />}/>
            <Route path="class" element={<Class />}/>
            <Route path="preinscriptions" element={<Preinscriptions />}/>
            <Route path="events" element={<Events />}/>
            <Route path="sidebar" element={<Sidebar />}/>
            <Route path="dashboard" element={<Estudiantes />}/>
            <Route path="/dashboard/estudiantes" element={<Estudiantes />}/>
            <Route path="/dashboard/productos" element={<Productos />}/>
            <Route path="/dashboard/categoria-productos" element={<Categorias />}/>
            <Route path="/dashboard/proveedores" element={<Proveedores/>}/>
            <Route path="/dashboard/sedes" element={<Sedes />}/>
            <Route path="/dashboard/patrocinadores" element={<Patrocinadores />}/> 
            <Route path="/dashboard/categorias-eventos" element={<CategoriasEventos/>}/> 
            <Route path="/dashboard/eventos" element={<Eventos/>}/> 
            <Route path="login" element={<Login/>}/>
            <Route path="register" element={<Register/>}/>
        </Routes>
    )
}