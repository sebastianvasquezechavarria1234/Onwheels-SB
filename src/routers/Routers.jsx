import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "../feacture/landing/pages/Home";
import { Shop } from "../feacture/landing/pages/Store";
import { Class } from "../feacture/landing/components/class/class";
import Preinscriptions from "../feacture/landing/pages/preinscriptions";
import Events from "../feacture/landing/events/events";
import Login from "../feacture/landing/Auth/Login";
import Register from "../feacture/landing/Auth/Register";

// Layout administrativo
import { Layout } from "../feacture/dashboard/layout-dashboard/Layout";

// Componentes del dashboard
import Usuarios from "../feacture/dashboard/pages/usuarios/Usuarios";
import Roles from "../feacture/dashboard/pages/roles/Roles";
import Estudiantes from "../feacture/dashboard/pages/estudiantes/Estudiantes";
import Productos from "../feacture/dashboard/pages/productos/Productos";
import Categorias from "../feacture/dashboard/pages/categorias/Categorias";
import Proveedores from "../feacture/dashboard/pages/proveedores/Proveedores";
import Sedes from "../feacture/dashboard/pages/sedes/Sedes";
import Patrocinadores from "../feacture/dashboard/pages/patrocinadores/Patrocinadores";
import CategoriasEventos from "../feacture/dashboard/pages/categorias-eventos/CategoriasEventos";
import Eventos from "../feacture/dashboard/pages/eventos/Eventos";

// Componentes para otras secciones del dashboard (puedes crearlos después)
const DashboardDefault = () => <div><h2>Dashboard Principal</h2></div>;
const ClasesPage = () => <div><h2>Gestión de Clases</h2></div>;
const ClassLevelsPage = () => <div><h2>Niveles de Clases</h2></div>;
const PreRegistrationsPage = () => <div><h2>Preinscripciones</h2></div>;
const MatriculasPage = () => <div><h2>Matrículas</h2></div>;
const PlansPage = () => <div><h2>Planes</h2></div>;
const ComprasPage = () => <div><h2>Compras</h2></div>;

export const Routers = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="shop" element={<Shop />} />
      <Route path="class" element={<Class />} />
      <Route path="preinscriptions" element={<Preinscriptions />} />
      <Route path="events" element={<Events />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Rutas del dashboard administrativo */}
      <Route path="admin" element={<Layout />}>
        <Route index element={<Usuarios />} />
        <Route path="dashboard" element={<DashboardDefault />} />
        <Route path="users" element={<Usuarios />} />
        <Route path="roles" element={<Roles />} />
        <Route path="estudiantes" element={<Estudiantes />} />
        <Route path="products" element={<Productos />} />
        <Route path="categoriasProductos" element={<Categorias />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="compras" element={<ComprasPage />} />
        <Route path="sedes" element={<Sedes />} />
        <Route path="patrocinadores" element={<Patrocinadores />} />
        <Route path="categoriasEventos" element={<CategoriasEventos />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="clases" element={<ClasesPage />} />
        <Route path="classLevels" element={<ClassLevelsPage />} />
        <Route path="preRegistrations" element={<PreRegistrationsPage />} />
        <Route path="matriculas" element={<MatriculasPage />} />
        <Route path="plans" element={<PlansPage />} />
      </Route>

      {/* Ruta fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  )};