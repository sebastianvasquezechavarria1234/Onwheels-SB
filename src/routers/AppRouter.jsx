// src/router/AppRouter.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./protectedRoute";

// pages landing
import { Home } from "../feactures/landing/pages/Home";
import { Store } from "../feactures/landing/pages/Store";
import Class from "../feactures/landing/pages/Class";
import PreinscriptionsLanding from "../feactures/landing/pages/preinscriptions";
import { About } from "../feactures/landing/pages/About";
import { ShoppingCart } from "../feactures/landing/pages/ShoppingCart";
import { ProductDetails } from "../feactures/landing/pages/ProductDetails";
 
// auth
import Login from "../feactures/Auth/pages/Login";
import Register from "../feactures/Auth/pages/Register";

// Dashboard admin
import Compras from "../feactures/dashboards/admin/pages/compras/compras/compras";
// import Ventas from "../feactures/dashboards/admin/pages/ventas/ventas/ventas";
import Categorias from "../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-producto";
import Products from "../feactures/dashboards/admin/pages/compras/productos/Products";
import Proveedores from "../feactures/dashboards/admin/pages/compras/proveedores/proveedores";
import Roles from "../feactures/dashboards/admin/pages/configuracion/roles/Roles";
import Matriculas from "../feactures/dashboards/admin/pages/clases/matriculas/matriculas";
import PlanClasses from "../feactures/dashboards/admin/pages/clases/planes/plans";
import PreinscripcionesAdmin from "../feactures/dashboards/admin/pages/clases/preinscripciones/PreRegistrations";
import Usuarios from "../feactures/dashboards/admin/pages/configuracion/usuarios/usuarios";
import Eventos from "../feactures/dashboards/admin/pages/eventos/eventos/eventos";
import CategoriaEventos from "../feactures/dashboards/admin/pages/eventos/categoria-eventos/categoria-eventos";
import Patrocinadores from "../feactures/dashboards/admin/pages/eventos/patrocinadores/patrocinadores";
import Sedes from "../feactures/dashboards/admin/pages/eventos/sedes/sedes";
import Clases from "../feactures/dashboards/admin/pages/clases/clases/Classes";
import CorreosMasivos from "../feactures/dashboards/admin/pages/eventos/correos/CorreosMasivos"; 



// Dashboard student
import { Setting } from "../feactures/dashboards/student/pages/Setting";
import { MyPurchases } from "../feactures/dashboards/student/pages/MyPurchases";
import { MyClasses } from "../feactures/dashboards/student/pages/MyClasses";

// Dashboard instructor
import { MyStudent } from "../feactures/dashboards/instructor/pages/MyStudent";
import { MyClassesInstructor } from "../feactures/dashboards/instructor/pages/MyClassesInstructor";
import { SettingInstructor } from "../feactures/dashboards/instructor/pages/SettingInstructor";
import { MyPurchasesInstructor } from "../feactures/dashboards/instructor/pages/MyPurchasesInstrutor";

// Landing Student
import { StudentEvents } from "../feactures/landing/student/pages/StudentEvents";
import { StudentStore } from "../feactures/landing/student/pages/StudentStore";
import StudentClass from "../feactures/landing/student/pages/StudentClass";
import { StudentAbout } from "../feactures/landing/student/pages/StudentAbout";
import { StudentHome } from "../feactures/landing/student/pages/StudentHome";
import { StudentShoppingCart } from "../feactures/landing/student/pages/StudentShoppingCart";

// Landing Instructor
import { InstructorHome } from "../feactures/landing/instructor/pages/InstructorHome";
// import { InstructorStore } from "../feactures/landing/instructor/pages/InstructorStore";
import { InstructorClass } from "../feactures/landing/instructor/pages/InstructorClass";
import { InstructorEvents } from "../feactures/landing/instructor/pages/InstructorEvents";
// import { InstructorAbout } from "../feactures/landing/instructor/pages/InstructorAbout";
import { InstructorShoppingCart } from "../feactures/landing/instructor/pages/InstructorShoppingCart";
import { InstructorStore } from "../feactures/landing/instructor/pages/InstructorSore";
import { InstructorAbaut } from "../feactures/landing/instructor/pages/InstructorAbaut";
import Dashboard from "../feactures/dashboards/admin/pages/dashboard/Dashboard";

// Landing Users
import { UsersHome } from "../feactures/landing/users/pages/UsersHome";
import { UsersStore } from "../feactures/landing/users/pages/UsersStore";
import { UsersClass } from "../feactures/landing/users/pages/UsersClass";
import { UsersEvents } from "../feactures/landing/users/pages/UsersEvents";
import { UsersAbaut } from "../feactures/landing/users/pages/UsersAbaut";

// Auth extras
import { RecoverPassword } from "../feactures/Auth/pages/RecoverPassword";
import { ResetPassword } from "../feactures/Auth/pages/ResetPassword";
import { StudentCheckout } from "../feactures/landing/student/pages/StudentCheckout";

const AppRouter = () => {
  const location = useLocation();

  // rutas landing que tendrán animación
  const landingRoutes = [
    "/", "/store", "/class", "/events", "/preinscriptions", "/about", "/shoppingCart"
  ];

  const isLanding = landingRoutes.includes(location.pathname);

  // animaciones de transición
  const blurVariants = {
    initial: { opacity: 0, filter: "blur(20px)" },
    animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.5 } },
    exit: { opacity: 0, filter: "blur(20px)", transition: { duration: 0.3 } },
  };

  const withAnimation = (Component) =>
    isLanding ? (
      <motion.div variants={blurVariants} initial="initial" animate="animate" exit="exit">
        <Component />
      </motion.div>
    ) : <Component />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing */}
        <Route path="recover" element={<RecoverPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route index element={withAnimation(Home)} />
        <Route path="store" element={withAnimation(Store)} />
        <Route path="class" element={withAnimation(Class)} />
        <Route path="events" element={withAnimation(Eventos)} />
        <Route path="preinscriptions" element={withAnimation(PreinscriptionsLanding)} />
        <Route path="about" element={withAnimation(About)} />
        <Route path="productDetails" element={withAnimation(ProductDetails)} />
        <Route path="shoppingCart" element={withAnimation(ShoppingCart)} />

        {/* Auth */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Dashboard Admin - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["administrador"]} />}>
          <Route path="admin/dashboard" element={<Dashboard />} />
          <Route path="admin/matriculas" element={<Matriculas />} />
          <Route path="admin/products" element={<Products />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/preRegistrations" element={<PreinscripcionesAdmin />} />
          <Route path="admin/compras" element={<Compras />} />
          <Route path="admin/proveedores" element={<Proveedores />} />
          {/* <Route path="admin/ventas" element={<Ventas />} /> */}
          <Route path="admin/categoriasProductos" element={<Categorias />} />
          <Route path="admin/categoriasEventos" element={<CategoriaEventos />} />
          <Route path="admin/planclases" element={<PlanClasses />} />
          <Route path="admin/users" element={<Usuarios />} />
          <Route path="admin/eventos" element={<Eventos />} />
          <Route path="admin/patrocinadores" element={<Patrocinadores />} />
          <Route path="admin/sedes" element={<Sedes />} />
          <Route path="admin/correos" element={<CorreosMasivos />} />
          <Route path="admin/clases" element={<Clases />} />
          <Route path="admin/plans" element={<PlanClasses />} />
          {/* <Route path="admin/classLevels" element={<ClassLevels />} /> */}
        </Route>

        {/* Dashboard Student - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
          <Route path="student/setting" element={<Setting />} />
          <Route path="student/myClasses" element={<MyClasses />} />
          <Route path="student/myPurchases" element={<MyPurchases />} />
          <Route path="student/home" element={<StudentHome />} />
          <Route path="student/events" element={<StudentEvents />} />
          <Route path="student/store" element={<StudentStore />} />
          <Route path="student/class" element={<StudentClass />} />
          <Route path="student/abaut" element={<StudentAbout />} />
          <Route path="student/shoppingCart" element={<StudentShoppingCart />} />
          <Route path="student/checkout" element={<StudentCheckout />} />
        </Route>

        {/* Dashboard Instructor - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route path="instructor/setting" element={<SettingInstructor />} />
          <Route path="instructor/myStudent" element={<MyStudent />} />
          <Route path="instructor/myClasses" element={<MyClassesInstructor />} />
          <Route path="instructor/myPurchases" element={<MyPurchasesInstructor />} />
          <Route path="instructor/home" element={<InstructorHome />} />
          <Route path="instructor/store" element={<InstructorStore />} />
          <Route path="instructor/class" element={<InstructorClass />} />
          <Route path="instructor/events" element={<InstructorEvents />} />
          <Route path="instructor/abaut" element={<InstructorAbaut />} />
          
          <Route path="instructor/shoppingCart" element={<InstructorShoppingCart />} />
        </Route>

        {/* Users - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["cliente", "usuario"]} />}>
          <Route path="users/home" element={<UsersHome />} />
          <Route path="users/store" element={<UsersStore />} />
          <Route path="users/class" element={<UsersClass />} />
          <Route path="users/events" element={<UsersEvents />} />
          <Route path="users/abaut" element={<UsersAbaut />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;