
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// pages landing
import { Home } from '../feactures/landing/pages/Home';
import { Store } from "../feactures/landing/pages/Store";
import Class from "../feactures/landing/pages/Class";
import Events from "../feactures/landing/pages/Events";
import Preinscriptions from "../feactures/landing/pages/preinscriptions";
import { About } from "../feactures/landing/pages/About";
// auth 
import Login from "../feactures/Auth/pages/Login";
import Register from "../feactures/Auth/pages/Register";
// Dashboard
import Matriculas from "../feactures/dashboards/admin/pages/clases/matriculas/matriculas";
import Eventos from "../feactures/dashboards/admin/pages/eventos/eventos/eventos";
import Compras from "../feactures/dashboards/admin/pages/compras/compras/compras";
import Proveedores from "../feactures/dashboards/admin/pages/compras/proveedores/proveedores";
import Ventas from "../feactures/dashboards/admin/pages/ventas/ventas/ventas";
import Productos from "../feactures/dashboards/admin/pages/compras/productos/productos";
import Categorias from "../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-producto";
// import CategoriasEventos from "../feactures/dashboards/admin/pages/configuracion/usuarios/usuarios";
import { ShoppingCart } from "../feactures/landing/pages/ShoppingCart";

export const AppRouter = () => {

  return (
    <Routes >
      <Route index element={<Home />} />
      <Route path="store" element={<Store />} />
      <Route path="class" element={<Class />} />
      <Route path="events" element={<Events />} />
      <Route path="preinscriptions" element={<Preinscriptions />} />
      <Route path="about" element={<About />} />
      <Route path="login" element={<Login />} />
      <Route path="shoppingCart" element={<ShoppingCart />} />
      <Route path="register" element={<Register />} />


      <Route path="admin/matriculas" element={<Matriculas />} />
      <Route path="admin/compras" element={<Compras />} />
      <Route path="admin/eventos" element={<Eventos />} />
      {/* <Route path="admin/categorias-eventos" element={<CategoriasEventos />} /> */}
      <Route path="admin/proveedores" element={<Proveedores />} />
      <Route path="admin/ventas" element={<Ventas />} />
      <Route path="admin/productos" element={<Productos />} />
      <Route path="admin/categoriasProductos" element={<Categorias />} />
    </Routes>

  );
};
