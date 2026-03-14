"use client"
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import ProtectedRoute from "./ProtectedRoute"
import { AdminLayoutWrapper } from "./AdminLayoutWrapper"
import RootRedirect from "./RootRedirect"

// pages landing

import { Home } from "../feactures/landing/pages/Home";
import { Store } from "../feactures/landing/pages/Store";
import Class from "../feactures/landing/pages/Class";
import PreinscriptionsLanding from "../feactures/landing/pages/preinscriptions";
import { About } from "../feactures/landing/pages/About";
import { Events } from "../feactures/landing/pages/Events";
import { ShoppingCart } from "../feactures/landing/pages/ShoppingCart";
import { PublicProductDetail, AdminProductDetail, StudentProductDetail, InstructorProductDetail, UserProductDetail, CustomProductDetail } from "../feactures/landing/pages/ProductDetails";
// import { Event } from "../feactures/landing/pages/Eventos";


// auth
import Login from "../feactures/Auth/pages/Login"
import Register from "../feactures/Auth/pages/Register"
import ActivationPage from "../feactures/Auth/pages/ActivationPage"

// Dashboard admin

import Compras from "../feactures/dashboards/admin/pages/compras/compras/compras"
import CompraDetalle from "../feactures/dashboards/admin/pages/compras/compras/CompraDetalle"
import CompraEditar from "../feactures/dashboards/admin/pages/compras/compras/CompraEditar"
import Products from "../feactures/dashboards/admin/pages/compras/productos/Products"
import Proveedores from "../feactures/dashboards/admin/pages/compras/proveedores/proveedores"
import Roles from "../feactures/dashboards/admin/pages/configuracion/roles/Roles"
import Matriculas from "../feactures/dashboards/admin/pages/clases/matriculas/matriculas"
import Estudiantes from "../feactures/dashboards/admin/pages/clases/estudiantes/students"
import Instructores from "../feactures/dashboards/admin/pages/clases/instructores/Instructores"
import PreinscripcionesAdmin from "../feactures/dashboards/admin/pages/clases/preinscripciones/PreRegistrations"
import Usuarios from "../feactures/dashboards/admin/pages/configuracion/usuarios/usuarios"
import Eventos from "../feactures/dashboards/admin/pages/eventos/eventos/eventos"
import CategoriaEventos from "../feactures/dashboards/admin/pages/eventos/categoria-eventos/categoria-eventos"
import Patrocinadores from "../feactures/dashboards/admin/pages/eventos/patrocinadores/patrocinadores"
import Sedes from "../feactures/dashboards/admin/pages/eventos/sedes/sedes"
import { Clases } from "../feactures/dashboards/admin/pages/clases/clases/Classes";
import ClassLevels from "../feactures/dashboards/admin/pages/clases/niveles/ClassLevels";

import PlanClasses from "../feactures/dashboards/admin/pages/clases/planes/plans";
import Administradores from "../feactures/dashboards/admin/pages/configuracion/admin/Administradores";
import Dashboard from "../feactures/dashboards/admin/pages/dashboard/Dashboard"
import { AdminShoppingCart } from "../feactures/dashboards/admin/pages/AdminShoppingCart"
import { AdminCheckout } from "../feactures/dashboards/admin/pages/AdminCheckout"
// import Clientes from "../feactures/dashboards/admin/pages/ventas/clientes/clientes"

// Dashboard student
import { Setting } from "../feactures/dashboards/student/pages/Setting"
import { MyPurchases } from "../feactures/dashboards/student/pages/MyPurchases"
import { MyClasses } from "../feactures/dashboards/student/pages/MyClasses"

// Dashboard instructor
import { SettingInstructor } from "../feactures/dashboards/instructor/pages/SettingInstructor"
import { MyStudent } from "../feactures/dashboards/instructor/pages/MyStudent"
import { MyClassesInstructor } from "../feactures/dashboards/instructor/pages/MyClassesInstructor"
import { MyPurchasesInstrutor as MyPurchasesInstructor } from "../feactures/dashboards/instructor/pages/MyPurchasesInstrutor"
import { MyPurchasesDetailInstructor } from "../feactures/dashboards/instructor/pages/MyPurchasesDetailInstructor"
// Landing Student
import { StudentEvents } from "../feactures/landing/student/pages/StudentEvents"
import { StudentStore } from "../feactures/landing/student/pages/StudentStore"
import StudentClass from "../feactures/landing/student/pages/StudentClass"
import { StudentAbout } from "../feactures/landing/student/pages/StudentAbout"
import { StudentHome } from "../feactures/landing/student/pages/StudentHome"
import { StudentShoppingCart } from "../feactures/landing/student/pages/StudentShoppingCart"
import { StudentCheckout } from "../feactures/landing/student/pages/StudentCheckout"

// Landing Instructor
import { InstructorHome } from "../feactures/landing/instructor/pages/InstructorHome"
import { InstructorStore } from "../feactures/landing/instructor/pages/InstructorStore"
import { UsersShoppingCart as InstructorShoppingCart } from "../feactures/landing/instructor/pages/InstructorShoppingCart"
import { InstructorCheckout } from "../feactures/landing/instructor/pages/InstructorCheckout"
import { InstructorClass } from "../feactures/landing/instructor/pages/InstructorClass"

// Landing Users
import { UsersHome } from "../feactures/landing/users/pages/UsersHome"
import { UsersStore } from "../feactures/landing/users/pages/UsersStore"
import { UsersClass } from "../feactures/landing/users/pages/UsersClass"
import { UsersEvents } from "../feactures/landing/users/pages/UsersEvents"
import { UsersAbaut } from "../feactures/landing/users/pages/UsersAbaut"

// Auth extras

import { RecoverPassword } from "../feactures/Auth/pages/RecoverPassword";
import { ResetPassword } from "../feactures/Auth/pages/ResetPassword";
import StudentOrderConfirm from "../feactures/landing/student/pages/StudentOrderConfirm";
// import { InstructorOrderConfirm } from "../feactures/landing/instructor/pages/UsersOrderConfirm";
// import { InstructorCheckout } from "../feactures/landing/instructor/pages/UsersCheckout";
import { UsersShoppingCart } from "../feactures/landing/users/pages/UsersShoppingCart";
import { UsersCheckout } from "../feactures/landing/users/pages/UsersCheckout";
import UsersOrderConfirm from "../feactures/landing/users/pages/UsersOrderConfirm";
import { UsersSetting } from "../feactures/dashboards/users/pages/UsersSetting";
import { UsersMyPurchases } from "../feactures/dashboards/users/pages/UsersMyPurchases";
import UsersPurchaseDetail from "../feactures/dashboards/users/pages/UsersPurchaseDetail";
import UsersPreinscriptions from "../feactures/landing/users/pages/UsersPreinscriptions";
import EnviarCorreosMasivos from "../feactures/dashboards/admin/pages/eventos/correos/CorreosMasivos";


// Landing Admin
import { AdminHome } from "../feactures/landing/admin/pages/AdminHome"
import { AdminStore } from "../feactures/landing/admin/pages/AdminStore"
import { AdminProfile } from "../feactures/landing/admin/pages/AdminProfile"
import { AdminPurchases } from "../feactures/landing/admin/pages/AdminPurchases"
import AdminPurchaseDetail from "../feactures/landing/admin/pages/AdminPurchaseDetail"
import { AdminEvents } from "../feactures/landing/admin/pages/AdminEvents"
import { AdminTraining } from "../feactures/landing/admin/pages/AdminTraining"
import { AdminAbout } from "../feactures/landing/admin/pages/AdminAbout"

// Custom Roles
import { CustomHome } from "../feactures/landing/custom/pages/CustomHome"
import { CustomStore } from "../feactures/landing/custom/pages/CustomStore"
import { CustomEvents } from "../feactures/landing/custom/pages/CustomEvents"
import { CustomAbout } from "../feactures/landing/custom/pages/CustomAbout"
import { CustomTraining } from "../feactures/landing/custom/pages/CustomTraining"
import { CustomProfile } from "../feactures/dashboards/custom/pages/CustomProfile"
import { CustomMyPurchases } from "../feactures/dashboards/custom/pages/CustomMyPurchases"
import { CustomPurchases } from "../feactures/landing/custom/pages/CustomPurchases"
import { CustomDashboard } from "../feactures/dashboards/custom/pages/CustomDashboard"
import CategoriaProductos from "../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-productos"
import Ventas from "../feactures/dashboards/admin/pages/ventas/ventas/ventas"
import VentaDetalle from "../feactures/dashboards/admin/pages/ventas/ventas/VentaDetalle"
import VentaEditar from "../feactures/dashboards/admin/pages/ventas/ventas/VentaEditar"
import Pedidos from "../feactures/dashboards/admin/pages/ventas/pedidos/pedidos"
import PedidoDetalle from "../feactures/dashboards/admin/pages/ventas/pedidos/PedidoDetalle"
import PedidoEditar from "../feactures/dashboards/admin/pages/ventas/pedidos/PedidoEditar"
import Clientes from "../feactures/dashboards/admin/pages/ventas/clientes/clientes"
import { CustomShoppingCart } from "../feactures/dashboards/custom/pages/CustomShoppingCart"
import { CustomCheckout } from "../feactures/dashboards/custom/pages/CustomCheckout"
import { CustomLayoutWrapper } from "../feactures/dashboards/custom/layout/CustomLayoutWrapper"


const AppRouter = () => {
  const location = useLocation()

  // rutas landing que tendrán animación
  const landingRoutes = ["/", "/store", "/class", "/events", "/preinscriptions", "/about", "/shoppingCart"]

  const isLanding = landingRoutes.includes(location.pathname)

  // animaciones de transición
  const blurVariants = {
    initial: { opacity: 0, filter: "blur(20px)" },
    animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.5 } },
    exit: { opacity: 0, filter: "blur(20px)", transition: { duration: 0.3 } },
  }

  const withAnimation = (Component) =>
    isLanding ? (
      <motion.div variants={blurVariants} initial="initial" animate="animate" exit="exit">
        <Component />
      </motion.div>
    ) : (
      <Component />
    )

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing */}
        <Route path="recover" element={<RecoverPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="activar-cuenta" element={<ActivationPage />} />


        <Route index element={<RootRedirect>{withAnimation(Home)}</RootRedirect>} />
        <Route path="store" element={withAnimation(Store)} />
        <Route path="events" element={withAnimation(Events)} />
        <Route path="training" element={withAnimation(Class)} />
        <Route path="preinscriptions" element={withAnimation(PreinscriptionsLanding)} />
        <Route path="about" element={withAnimation(About)} />
        <Route path="store/product/:id" element={withAnimation(PublicProductDetail)} />
        <Route path="shoppingCart" element={withAnimation(ShoppingCart)} />

        {/* Auth */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />



        {/* Dashboard Admin - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["administrador"]} />}>
          {/* Admin Landing Pages (Public-facing for admins, NO Sidebar) */}
          <Route path="admin/home" element={<AdminHome />} />
          <Route path="admin/store" element={<AdminStore />} />
          <Route path="admin/events" element={<AdminEvents />} />
          <Route path="admin/training" element={<AdminTraining />} />
          <Route path="admin/about" element={<AdminAbout />} />
          <Route path="admin/profile" element={<AdminProfile />} />
          <Route path="admin/purchases" element={<AdminPurchases />} />
          <Route path="admin/myPurchases/:id" element={<AdminPurchaseDetail />} />
          <Route path="admin/shoppingCart" element={<AdminShoppingCart />} />
          <Route path="admin/checkout" element={<AdminCheckout />} />
          <Route path="admin/store/product/:id" element={withAnimation(AdminProductDetail)} />

          {/* Admin Dashboard Pages (Management tools, WITH Sidebar) */}
          <Route element={<AdminLayoutWrapper />}>
            <Route path="admin/dashboard" element={<Dashboard />} />
            <Route path="admin/matriculas" element={<Matriculas />} />
            <Route path="admin/products" element={<Products />} />
            <Route path="admin/roles" element={<Roles />} />
            <Route path="admin/preRegistrations" element={<PreinscripcionesAdmin />} />
            <Route path="admin/compras" element={<Compras />} />
            <Route path="admin/proveedores" element={<Proveedores />} />
            <Route path="admin/categoriasProductos" element={<CategoriaProductos />} />
            <Route path="admin/categoriasEventos" element={<CategoriaEventos />} />
            <Route path="admin/planclases" element={<PlanClasses />} />
            <Route path="admin/users" element={<Usuarios />} />
            <Route path="admin/eventos" element={<Eventos />} />
            <Route path="admin/patrocinadores" element={<Patrocinadores />} />
            <Route path="admin/sedes" element={<Sedes />} />
            <Route path="admin/clases" element={<Clases />} />
            <Route path="admin/classLevels" element={<ClassLevels />} />
            <Route path="admin/plans" element={<PlanClasses />} />
            <Route path="admin/instructores" element={<Instructores />} />
            <Route path="admin/estudiantes" element={<Estudiantes />} />
            <Route path="admin/admins" element={<Administradores />} />
            <Route path="admin/ventas" element={<Ventas />} />
            <Route path="admin/ventas/crear" element={<VentaEditar />} />
            <Route path="admin/ventas/editar/:id" element={<VentaEditar />} />
            <Route path="admin/ventas/detalle/:id" element={<VentaDetalle />} />
            <Route path="admin/pedidos" element={<Pedidos />} />
            <Route path="admin/pedidos/crear" element={<PedidoEditar />} />
            <Route path="admin/pedidos/editar/:id" element={<PedidoEditar />} />
            <Route path="admin/pedidos/detalle/:id" element={<PedidoDetalle />} />
            <Route path="admin/clientes" element={<Clientes />} />
            <Route path="admin/compras/detalle/:id" element={<CompraDetalle />} />
            <Route path="admin/compras/editar/:id" element={<CompraEditar />} />
            <Route path="admin/compras/crear" element={<CompraEditar />} />
            <Route path="admin/correos-masivos" element={<EnviarCorreosMasivos />} />
          </Route>
        </Route>

        {/* Dashboard Student - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
          <Route path="student/setting" element={<Setting />} />
          <Route path="student/myClasses" element={<MyClasses />} />
          <Route path="student/myPurchases" element={<MyPurchases />} />
          <Route path="student/home" element={<StudentHome />} />
          <Route path="student/events" element={<StudentEvents />} />
          <Route path="student/store" element={<StudentStore />} />
          <Route path="student/training" element={<StudentClass />} />
          <Route path="student/abaut" element={<StudentAbout />} />
          <Route path="student/shoppingCart" element={<StudentShoppingCart />} />
          <Route path="student/checkout" element={<StudentCheckout />} />
          <Route path="student/orderConfirm" element={<StudentOrderConfirm />} />
          <Route path="student/store/product/:id" element={withAnimation(StudentProductDetail)} />
        </Route>

        {/* Dashboard Instructor - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
          <Route path="instructor/setting" element={<SettingInstructor />} />
          <Route path="instructor/myStudent" element={<MyStudent />} />
          <Route path="instructor/myClasses" element={<MyClassesInstructor />} />
          <Route path="instructor/myPurchases" element={<MyPurchasesInstructor />} />
          <Route path="instructor/myPurchases/:id" element={<MyPurchasesDetailInstructor />} />
          <Route path="instructor/home" element={<InstructorHome />} />
          <Route path="instructor/training" element={<InstructorClass />} />
          <Route path="instructor/store" element={<InstructorStore />} />
          <Route path="instructor/shoppingCart" element={<InstructorShoppingCart />} />
          <Route path="instructor/checkout" element={<InstructorCheckout />} />
          <Route path="instructor/orderConfirm" element={<UsersOrderConfirm />} />
          <Route path="instructor/store/product/:id" element={withAnimation(InstructorProductDetail)} />

        </Route>

        {/* Users - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["cliente"]} />}>
          <Route path="users/home" element={<UsersHome />} />
          <Route path="users/preinscriptions" element={<UsersPreinscriptions />} />
          <Route path="users/store" element={<UsersStore />} />
          <Route path="users/training" element={<UsersClass />} />
          <Route path="users/events" element={<UsersEvents />} />
          <Route path="users/abaut" element={<UsersAbaut />} />
          <Route path="users/shoppingCart" element={<UsersShoppingCart />} />
          <Route path="users/checkout" element={<UsersCheckout />} />
          <Route path="users/orderConfirm" element={<UsersOrderConfirm />} />
          <Route path="users/setting" element={<UsersSetting />} />
          <Route path="users/myPurchases" element={<UsersMyPurchases />} />
          <Route path="users/myPurchases/:id" element={<UsersPurchaseDetail />} />
          <Route path="users/store/product/:id" element={withAnimation(UserProductDetail)} />
        </Route>

        {/* Custom Roles - PROTEGIDAS */}
        <Route element={<ProtectedRoute allowedRoles={["custom"]} />}>
          {/* Landing personalizada (sin sidebar) */}
          <Route path="custom/home" element={<CustomHome />} />
          <Route path="custom/store" element={<CustomStore />} />
          <Route path="custom/events" element={<CustomEvents />} />
          <Route path="custom/about" element={<CustomAbout />} />
          <Route path="custom/training" element={<CustomTraining />} />
          <Route path="custom/store/product/:id" element={withAnimation(CustomProductDetail)} />
          <Route path="custom/purchases" element={<CustomPurchases />} />
          <Route path="custom/profile" element={<CustomProfile />} />
          <Route path="custom/my-purchases" element={<CustomMyPurchases />} />
          <Route path="custom/cart" element={<CustomShoppingCart />} />
          <Route path="custom/checkout" element={<CustomCheckout />} />

          {/* Dashboard personalizado (con sidebar via CustomLayoutWrapper) */}
          <Route element={<CustomLayoutWrapper />}>
            <Route path="custom/dashboard" element={<CustomDashboard />} />
            <Route path="custom/usuarios" element={<Usuarios />} />
            <Route path="custom/roles" element={<Roles />} />
            <Route path="custom/productos" element={<Products />} />
            <Route path="custom/categorias" element={<CategoriaProductos />} />
            <Route path="custom/proveedores" element={<Proveedores />} />
            <Route path="custom/compras" element={<Compras />} />
            <Route path="custom/compras/detalle/:id" element={<CompraDetalle />} />
            <Route path="custom/compras/editar/:id" element={<CompraEditar />} />
            <Route path="custom/compras/crear" element={<CompraEditar />} />
            <Route path="custom/ventas" element={<Ventas />} />
            <Route path="custom/ventas/detalle/:id" element={<VentaDetalle />} />
            <Route path="custom/ventas/editar/:id" element={<VentaEditar />} />
            <Route path="custom/ventas/crear" element={<VentaEditar />} />
            <Route path="custom/pedidos" element={<Pedidos />} />
            <Route path="custom/pedidos/detalle/:id" element={<PedidoDetalle />} />
            <Route path="custom/pedidos/editar/:id" element={<PedidoEditar />} />
            <Route path="custom/pedidos/crear" element={<PedidoEditar />} />
            <Route path="custom/clientes" element={<Clientes />} />
            <Route path="custom/eventos" element={<Eventos />} />
            <Route path="custom/categoria-eventos" element={<CategoriaEventos />} />
            <Route path="custom/sedes" element={<Sedes />} />
            <Route path="custom/patrocinadores" element={<Patrocinadores />} />
            <Route path="custom/clases" element={<Clases />} />
            <Route path="custom/niveles" element={<ClassLevels />} />
            <Route path="custom/estudiantes" element={<Estudiantes />} />
            <Route path="custom/instructores" element={<Instructores />} />
            <Route path="custom/preinscripciones" element={<PreinscripcionesAdmin />} />
            <Route path="custom/matriculas" element={<Matriculas />} />
            <Route path="custom/planes" element={<PlanClasses />} />
            <Route path="custom/plans" element={<PlanClasses />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default AppRouter;