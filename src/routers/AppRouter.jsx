import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./protectedRoute";
import TokenRedirect from "./TokenRedirect";
import { Layout } from "../feactures/landing/layout/Layout";

// --- Lazy Load Pages ---

// Landing Pages
const Home = lazy(() => import("../feactures/landing/pages/Home").then(module => ({ default: module.Home })));
const Store = lazy(() => import("../feactures/landing/pages/Store").then(module => ({ default: module.Store })));
const Class = lazy(() => import("../feactures/landing/pages/Class")); // Default export check
const PreinscriptionsLanding = lazy(() => import("../feactures/landing/pages/preinscriptions"));
const About = lazy(() => import("../feactures/landing/pages/About").then(module => ({ default: module.About })));
const ShoppingCart = lazy(() => import("../feactures/landing/pages/ShoppingCart").then(module => ({ default: module.ShoppingCart })));
const ProductDetails = lazy(() => import("../feactures/landing/pages/ProductDetails").then(module => ({ default: module.ProductDetails })));
const Events = lazy(() => import("../feactures/landing/pages/Events")); // Added Events import

// Auth
const Login = lazy(() => import("../feactures/Auth/pages/Login"));
const Register = lazy(() => import("../feactures/Auth/pages/Register"));
const RecoverPassword = lazy(() => import("../feactures/Auth/pages/RecoverPassword").then(module => ({ default: module.RecoverPassword })));
const ResetPassword = lazy(() => import("../feactures/Auth/pages/ResetPassword").then(module => ({ default: module.ResetPassword })));

// Dashboard Admin
const Dashboard = lazy(() => import("../feactures/dashboards/admin/pages/dashboard/Dashboard"));
const Matriculas = lazy(() => import("../feactures/dashboards/admin/pages/clases/matriculas/matriculas"));
const Products = lazy(() => import("../feactures/dashboards/admin/pages/compras/productos/Products"));
const Roles = lazy(() => import("../feactures/dashboards/admin/pages/configuracion/roles/Roles"));
const PreinscripcionesAdmin = lazy(() => import("../feactures/dashboards/admin/pages/clases/preinscripciones/PreRegistrations"));
const Compras = lazy(() => import("../feactures/dashboards/admin/pages/compras/compras/compras"));
const Proveedores = lazy(() => import("../feactures/dashboards/admin/pages/compras/proveedores/proveedores"));
const Categorias = lazy(() => import("../feactures/dashboards/admin/pages/compras/categoria-productos/categoria-producto"));
const CategoriaEventos = lazy(() => import("../feactures/dashboards/admin/pages/eventos/categoria-eventos/categoria-eventos"));
const PlanClasses = lazy(() => import("../feactures/dashboards/admin/pages/clases/planes/plans"));
const Usuarios = lazy(() => import("../feactures/dashboards/admin/pages/configuracion/usuarios/usuarios"));
const Eventos = lazy(() => import("../feactures/dashboards/admin/pages/eventos/eventos/eventos"));
const Patrocinadores = lazy(() => import("../feactures/dashboards/admin/pages/eventos/patrocinadores/patrocinadores"));
const Sedes = lazy(() => import("../feactures/dashboards/admin/pages/eventos/sedes/sedes"));
const Clases = lazy(() => import("../feactures/dashboards/admin/pages/clases/clases/Classes"));
const Administradores = lazy(() => import("../feactures/dashboards/admin/pages/configuracion/admin/Administradores"));
const EnviarCorreosMasivos = lazy(() => import("../feactures/dashboards/admin/pages/eventos/correos/CorreosMasivos"));

// Dashboard Student
const Setting = lazy(() => import("../feactures/dashboards/student/pages/Setting").then(module => ({ default: module.Setting })));
const MyPurchases = lazy(() => import("../feactures/dashboards/student/pages/MyPurchases").then(module => ({ default: module.MyPurchases })));
const MyClasses = lazy(() => import("../feactures/dashboards/student/pages/MyClasses").then(module => ({ default: module.MyClasses })));
const StudentCheckout = lazy(() => import("../feactures/landing/student/pages/StudentCheckout").then(module => ({ default: module.StudentCheckout })));
const StudentHome = lazy(() => import("../feactures/landing/student/pages/StudentHome").then(module => ({ default: module.StudentHome })));
const StudentEvents = lazy(() => import("../feactures/landing/student/pages/StudentEvents").then(module => ({ default: module.StudentEvents })));
const StudentStore = lazy(() => import("../feactures/landing/student/pages/StudentStore").then(module => ({ default: module.StudentStore })));
const StudentClass = lazy(() => import("../feactures/landing/student/pages/StudentClass"));
const StudentAbout = lazy(() => import("../feactures/landing/student/pages/StudentAbout").then(module => ({ default: module.StudentAbout })));
const StudentShoppingCart = lazy(() => import("../feactures/landing/student/pages/StudentShoppingCart").then(module => ({ default: module.StudentShoppingCart })));
const StudentOrderConfirm = lazy(() => import("../feactures/landing/student/pages/StudentOrderConfirm"));

// Dashboard Instructor
const MyStudent = lazy(() => import("../feactures/dashboards/instructor/pages/MyStudent").then(module => ({ default: module.MyStudent })));
const MyClassesInstructor = lazy(() => import("../feactures/dashboards/instructor/pages/MyClassesInstructor").then(module => ({ default: module.MyClassesInstructor })));
const SettingInstructor = lazy(() => import("../feactures/dashboards/instructor/pages/SettingInstructor").then(module => ({ default: module.SettingInstructor })));
const MyPurchasesInstructor = lazy(() => import("../feactures/dashboards/instructor/pages/MyPurchasesInstrutor").then(module => ({ default: module.MyPurchasesInstructor })));
const InstructorHome = lazy(() => import("../feactures/landing/instructor/pages/InstructorHome").then(module => ({ default: module.InstructorHome })));
const InstructorStore = lazy(() => import("../feactures/landing/instructor/pages/InstructorSore").then(module => ({ default: module.InstructorStore })));
const InstructorClass = lazy(() => import("../feactures/landing/instructor/pages/InstructorClass")); // Default export
const InstructorEvents = lazy(() => import("../feactures/landing/instructor/pages/InstructorEvents").then(module => ({ default: module.InstructorEvents })));
const InstructorAbaut = lazy(() => import("../feactures/landing/instructor/pages/InstructorAbaut").then(module => ({ default: module.InstructorAbaut })));
const InstructorShoppingCart = lazy(() => import("../feactures/landing/instructor/pages/InstructorShoppingCart").then(module => ({ default: module.InstructorShoppingCart })));
const InstructorCheckout = lazy(() => import("../feactures/landing/instructor/pages/InstructorCheckout").then(module => ({ default: module.InstructorCheckout })));
const InstructorOrderConfirm = lazy(() => import("../feactures/landing/instructor/pages/InstructorOrderConfirm").then(module => ({ default: module.InstructorOrderConfirm })));

// Users
const UsersHome = lazy(() => import("../feactures/landing/users/pages/UsersHome").then(module => ({ default: module.UsersHome })));
const UsersStore = lazy(() => import("../feactures/landing/users/pages/UsersStore").then(module => ({ default: module.UsersStore })));
const UsersClass = lazy(() => import("../feactures/landing/users/pages/UsersClass").then(module => ({ default: module.UsersClass })));
const UsersEvents = lazy(() => import("../feactures/landing/users/pages/UsersEvents").then(module => ({ default: module.UsersEvents })));
const UsersAbaut = lazy(() => import("../feactures/landing/users/pages/UsersAbaut").then(module => ({ default: module.UsersAbaut })));
const UsersShoppingCart = lazy(() => import("../feactures/landing/users/pages/UsersShoppingCart").then(module => ({ default: module.UsersShoppingCart })));
const UsersCheckout = lazy(() => import("../feactures/landing/users/pages/UsersCheckout").then(module => ({ default: module.UsersCheckout })));
const UsersOrderConfirm = lazy(() => import("../feactures/landing/users/pages/UsersOrderConfirm"));
const UsersSetting = lazy(() => import("../feactures/dashboards/users/pages/UsersSetting").then(module => ({ default: module.UsersSetting })));
const UsersMyPurchases = lazy(() => import("../feactures/dashboards/users/pages/UsersMyPurchases").then(module => ({ default: module.UsersMyPurchases })));
const UsersPreinscriptions = lazy(() => import("../feactures/landing/users/pages/UsersPreinscriptions"));

// Error Page
const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
    <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
    <p className="text-lg mb-6">No tienes permisos para acceder a esta página</p>
    <button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 font-medium py-2 px-6 rounded-lg">
      Volver atrás
    </button>
  </div>
);

// Loading Component
const LoadingFallback = () => (
  <Layout>
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  </Layout>
);


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
    <>
      <TokenRedirect />
      
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            {/* Landing */}
            <Route path="recover" element={<RecoverPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            <Route index element={withAnimation(Home)} />
            <Route path="store" element={withAnimation(Store)} />
            <Route path="training" element={withAnimation(Class)} />
            <Route path="events" element={withAnimation(Events)} /> {/* Added events route */}
            <Route path="preinscriptions" element={withAnimation(PreinscriptionsLanding)} />
            <Route path="about" element={withAnimation(About)} />
            <Route path="store/product/:id" element={withAnimation(ProductDetails)} />
            <Route path="shoppingCart" element={withAnimation(ShoppingCart)} />

            {/* Auth */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Ruta no autorizado */}
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* Dashboard Admin - PROTEGIDAS */}
            <Route element={<ProtectedRoute allowedRoles={["administrador"]} />}>
                <Route path="admin/dashboard" element={<Dashboard />} />
                <Route path="admin/matriculas" element={<Matriculas />} />
                <Route path="admin/products" element={<Products />} />
                <Route path="admin/roles" element={<Roles />} />
                <Route path="admin/preRegistrations" element={<PreinscripcionesAdmin />} />
                <Route path="admin/compras" element={<Compras />} />
                <Route path="admin/proveedores" element={<Proveedores />} />
                <Route path="admin/categoriasProductos" element={<Categorias />} />
                <Route path="admin/categoriasEventos" element={<CategoriaEventos />} />
                <Route path="admin/planclases" element={<PlanClasses />} />
                <Route path="admin/users" element={<Usuarios />} />
                <Route path="admin/eventos" element={<Eventos />} />
                <Route path="admin/patrocinadores" element={<Patrocinadores />} />
                <Route path="admin/sedes" element={<Sedes />} />
                <Route path="admin/clases" element={<Clases />} />
                <Route path="admin/plans" element={<PlanClasses />} />
                <Route path="admin/admins" element={<Administradores />} />
                <Route path="admin/correos-masivos" element={<EnviarCorreosMasivos/>} />
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
            </Route>

            {/* Dashboard Instructor - PROTEGIDAS */}
            <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
                <Route path="instructor/setting" element={<SettingInstructor />} />
                <Route path="instructor/myStudent" element={<MyStudent />} />
                <Route path="instructor/myClasses" element={<MyClassesInstructor />} />
                <Route path="instructor/myPurchases" element={<MyPurchasesInstructor />} />
                <Route path="instructor/home" element={<InstructorHome />} />
                <Route path="instructor/store" element={<InstructorStore />} />
                <Route path="instructor/training" element={<InstructorClass />} />
                <Route path="instructor/events" element={<InstructorEvents />} />
                <Route path="instructor/abaut" element={<InstructorAbaut />} />
                <Route path="instructor/shoppingCart" element={<InstructorShoppingCart />} />
                <Route path="instructor/checkout" element={<InstructorCheckout />} />
                <Route path="instructor/orderConfirm" element={<InstructorOrderConfirm />} />
            </Route>

            {/* Users - PROTEGIDAS */}
            <Route element={<ProtectedRoute allowedRoles={["cliente", "usuario"]} />}>
                <Route path="users/home" element={<UsersHome />} />
                <Route path="users/preinscriptions" element={<UsersPreinscriptions />} />
                <Route path="users/store" element={<UsersStore />} />
                <Route path="users/training" element={<UsersClass />} />
                <Route path="users/events" element={<UsersEvents />} />
                <Route path="users/abaut" element={<UsersAbaut />} />
                <Route path="users/shoppingCart" element={<UsersShoppingCart />} />
                <Route path="users/checkout" element={<UsersCheckout />} />
                <Route path="users/orderConfirm" element={<UsersOrderConfirm />} />
                <Route path="users/setting" element={<UsersSetting/>} />
                <Route path="users/myPurchases" element={<UsersMyPurchases/>} />
            </Route>
            </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
};

export default AppRouter;
