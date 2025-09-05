
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
import Eventos from "../feactures/dashboards/admin/pages/eventos/eventos/eventos";

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
      <Route path="register" element={<Register />} />


      <Route path="dashboard" element={<Eventos />} />
    </Routes>

  );
};
