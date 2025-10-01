// src/router/AppRouter.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// pages landing
import { Home } from "../feactures/landing/pages/Home";
import { Store } from "../feactures/landing/pages/Store";
import Class from "../feactures/landing/pages/Class";
import Events from "../feactures/landing/pages/Events";
import Preinscriptions from "../feactures/landing/pages/preinscriptions";
import { About } from "../feactures/landing/pages/About";
import { ShoppingCart } from "../feactures/landing/pages/ShoppingCart";

// auth
import Login from "../feactures/Auth/pages/Login";
import Register from "../feactures/Auth/pages/Register";

// Dashboard
import Eventos from "../feactures/dashboards/admin/pages/eventos/eventos/eventos";
import Compras from "../feactures/dashboards/admin/pages/compras/compras/compras";
// import Proveedores from "../feactures/dashboards/admin/pages/compras/proveedores/proveedores";
import Ventas from "../feactures/dashboards/admin/pages/ventas/ventas/ventas";
import Categorias from "../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-producto";
// import Productos from "../feactures/dashboards/admin/pages/compras/productos/productos";
// import Categorias from "../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-producto";
import { Setting } from "../feactures/dashboards/student/pages/Setting";
import { MyPurchases } from "../feactures/dashboards/student/pages/MyPurchases";
import { MyStudent } from "../feactures/dashboards/instructor/pages/MyStudent";
import { MyClassesInstructor } from "../feactures/dashboards/instructor/pages/MyClassesInstructor";
import { SettingInstructor } from "../feactures/dashboards/instructor/pages/SettingInstructor";
import { MyPurchasesInstructor } from "../feactures/dashboards/instructor/pages/MyPurchasesInstrutor";
import { ProductDetails } from "../feactures/landing/pages/ProductDetails";

import Products from "../feactures/dashboards/admin/pages/compras/productos/Products";
// import ClassLevels from "../feactures/dashboards/admin/pages/ClassLevels";
import Users from "../feactures/dashboards/admin/pages/configuracion/usuarios/Users";
// import Clases from "../feactures/dashboards/admin/pages/clases/clases/Classes";
import MyClasses from "../feactures/dashboards/student/pages/MyClasses";
import Proveedores from "../feactures/dashboards/admin/pages/compras/proveedores/proveedores";
import Roles from "../feactures/dashboards/admin/pages/configuracion/roles/Roles";
import Matriculas from "../feactures/dashboards/admin/pages/clases/matriculas/matriculas";
import PlanClasses from "../feactures/dashboards/admin/pages/clases/planes/plans";
import EventCategory from "../feactures/dashboards/admin/pages/eventos/categoria-eventos/categoria-eventos";
import Preinscripciones from "../feactures/dashboards/admin/pages/clases/preinscripciones/PreRegistrations";
import { StudentEvents } from "../feactures/landing/student/pages/StudentEvents";
import { StudentStore } from "../feactures/landing/student/pages/StudentStore";
import StudentClass from "../feactures/landing/student/pages/StudentClass";
import { StudentAbout } from "../feactures/landing/student/pages/StudentAbout";
import { StudentHome } from "../feactures/landing/student/pages/StudentHome";
import { StudentShoppingCart } from "../feactures/landing/student/pages/StudentShoppingCart";
import { InstructorHome } from "../feactures/landing/instructor/pages/InstructorHome";
import { InstructorStore } from "../feactures/landing/instructor/pages/InstructorSore";
import { InstructorClass } from "../feactures/landing/instructor/pages/InstructorClass";
import { InstructorEvents } from "../feactures/landing/instructor/pages/InstructorEvents";
import { InstructorAbaut } from "../feactures/landing/instructor/pages/InstructorAbaut";
import { InstructorShoppingCart } from "../feactures/landing/instructor/pages/InstructorShoppingCart";

export const AppRouter = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Landing (sin animación) */}
      <Route index element={<Home />} />
      <Route path="store" element={<Store />} />
      <Route path="class" element={<Class />} />
      <Route path="events" element={<Events />} />
      <Route path="preinscriptions" element={<Preinscriptions />} />
      <Route path="about" element={<About />} />
      <Route path="productDetails" element={<ProductDetails />} />
      <Route path="shoppingCart" element={<ShoppingCart />} />

      {/* Auth  */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Dashboard Admin */}
      <Route path="admin/matriculas" element={<Matriculas />} />
      {/* <Route path="admin/classes" element={<Clases />} /> */}
      <Route path="admin/products" element={<Products />} />
      <Route path="admin/roles" element={<Roles />} />
      <Route path="admin/users" element={<Users />} />
      {/* <Route path="admin/classLevels" element={<ClassEvent />} /> */}
      <Route path="admin/preRegistrations" element={<Preinscripciones />} />
      <Route path="admin/compras" element={<Compras />} />
      <Route path="admin/proveedores" element={<Proveedores />} />
      <Route path="admin/ventas" element={<Ventas />} />
      <Route path="admin/categoriasProductos" element={<Categorias />} />
      <Route path="admin/eventCategory" element={<EventCategory />} />
      <Route path="admin/planclases" element={<PlanClasses/>} />

      {/* <Route path="admin/productos" element={<Productos />} /> */}

      {/* Dashboard Student */}
      <Route path="student/setting" element={<Setting />} />
      <Route path="student/myClasses" element={<MyClasses />} />
      <Route path="student/myPurchases" element={<MyPurchases />} />

      <Route path="student/home" element={<StudentHome />} />
      <Route path="student/events" element={<StudentEvents />} />
      <Route path="student/store" element={<StudentStore />} />
      <Route path="student/Class" element={<StudentClass />} />
      <Route path="student/Abaut" element={<StudentAbout />} />
      <Route path="student/shoppingCart" element={<StudentShoppingCart />} />




      {/* Dashboard Instructor */}
      <Route path="instructor/setting" element={<SettingInstructor />} />
      <Route path="instructor/myStudent" element={<MyStudent />} />
      <Route path="instructor/myClasses" element={<MyClassesInstructor />} />
      <Route path="instructor/myPurchases" element={<MyPurchasesInstructor/>} />


      <Route path="instructor/home" element={<InstructorHome />} />
      <Route path="instructor/store" element={<InstructorStore />} />
      <Route path="instructor/class" element={<InstructorClass />} />
      <Route path="instructor/events" element={<InstructorEvents />} />
      <Route path="instructor/abaut" element={<InstructorAbaut />} />
      <Route path="instructor/shoppingCart" element={<InstructorShoppingCart />} />


    </Routes>
  );
};
