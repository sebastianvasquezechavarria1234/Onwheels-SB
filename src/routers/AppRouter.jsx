// src/router/AppRouter.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
import Matriculas from "../feactures/dashboards/admin/pages/clases/matriculas/matriculas";
import Eventos from "../feactures/dashboards/admin/pages/eventos/eventos/eventos";
import Compras from "../feactures/dashboards/admin/pages/compras/compras/compras";
import Proveedores from "../feactures/dashboards/admin/pages/compras/proveedores/proveedores";
import Ventas from "../feactures/dashboards/admin/pages/ventas/ventas/ventas";
import Productos from "../feactures/dashboards/admin/pages/compras/productos/productos";
import Categorias from "../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-producto";
import { Setting } from "../feactures/dashboards/student/pages/Setting";
import { MyClasses } from "../feactures/dashboards/student/pages/MyClasses";
import { MyPurchases } from "../feactures/dashboards/student/pages/MyPurchases";
import { MyStudent } from "../feactures/dashboards/instructor/pages/MyStudent";
import { MyClassesInstructor } from "../feactures/dashboards/instructor/pages/MyClassesInstructor";
import { SettingInstructor } from "../feactures/dashboards/instructor/pages/SettingInstructor";
import { MyPurchasesInstructor } from "../feactures/dashboards/instructor/pages/MyPurchasesInstrutor";
import { ProductDetails } from "../feactures/landing/pages/ProductDetails";
import { Classes } from "../feactures/dashboards/admin/pages/Classes";

export const AppRouter = () => {
  const location = useLocation();

  // Rutas de la landing que tendrán animación
  const landingRoutes = [
    "/", "/store", "/class", "/events", "/preinscriptions", "/about", "/shoppingCart"
  ];

  const isLanding = landingRoutes.includes(location.pathname);

  // Variants para el blur
  const blurVariants = {
    initial: { opacity: 0, filter: "blur(20px)" },
    animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.5 } },
    exit: { opacity: 0, filter: "blur(20px)", transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing con animación */}
        <Route
          index
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Home />
              </motion.div>
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="store"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Store />
              </motion.div>
            ) : (
              <Store />
            )
          }
        />
        <Route
          path="class"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Class />
              </motion.div>
            ) : (
              <Class />
            )
          }
        />
        <Route
          path="events"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Events />
              </motion.div>
            ) : (
              <Events />
            )
          }
        />
        <Route
          path="preinscriptions"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Preinscriptions />
              </motion.div>
            ) : (
              <Preinscriptions />
            )
          }
        />
        <Route
          path="about"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <About />
              </motion.div>
            ) : (
              <About />
            )
          }
        />
        <Route
          path="productDetails"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ProductDetails />
              </motion.div>
            ) : (
              <ProductDetails />
            )
          }
        />
        <Route
          path="shoppingCart"
          element={
            isLanding ? (
              <motion.div
                variants={blurVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ShoppingCart />
              </motion.div>
            ) : (
              <ShoppingCart />
            )
          }
        />

        {/* Auth  */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Dashboard Admin */}
        <Route path="admin/matriculas" element={<Matriculas />} />
        <Route path="admin/classes" element={<Classes />} />
        <Route path="admin/compras" element={<Compras />} />
        <Route path="admin/eventos" element={<Eventos />} />
        <Route path="admin/proveedores" element={<Proveedores />} />
        <Route path="admin/ventas" element={<Ventas />} />
        <Route path="admin/productos" element={<Productos />} />
        <Route path="admin/categoriasProductos" element={<Categorias />} />


        {/* Dasboard Student */}
        <Route path="student/setting" element={<Setting />} />
        <Route path="student/myClasses" element={<MyClasses />} />
        <Route path="student/myPurchases" element={<MyPurchases />} />

        <Route path="instructor/setting" element={<SettingInstructor />} />
        <Route path="instructor/myStudent" element={<MyStudent />} />
        <Route path="instructor/myClasses" element={<MyClassesInstructor />} />
        <Route path="instructor/myPurchases" element={<MyPurchasesInstructor/>} />
      </Routes>
    </AnimatePresence>
  );
};
