import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, ShoppingBag, Search } from "lucide-react";
import { Layout } from "../layout/Layout";
import { useAuth } from "../../dashboards/dinamico/context/AuthContext";
import { getHomePath } from "../../../utils/roleHelpers";

const NotFound = () => {
  const { user } = useAuth();
  const homePath = getHomePath(user);

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--color-blue)]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>

        <div className="max-w-2xl w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block">
              <motion.h1 
                className="text-[120px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 select-none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                404
              </motion.h1>
              
              <motion.div 
                className="absolute -top-4 -right-4 md:-top-8 md:-right-8 bg-[var(--color-blue)] p-4 rounded-2xl shadow-2xl rotate-12"
                animate={{ y: [0, -10, 0], rotate: [12, 15, 12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search size={32} className="text-white" />
              </motion.div>
            </div>

            <motion.h2 
              className="text-2xl md:text-4xl font-bold text-white mb-6 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ¡Vaya! Parece que te has salido de la pista
            </motion.h2>

            <motion.p 
              className="text-gray-400 text-lg mb-12 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              La página que buscas no existe o ha sido movida. No te preocupes, ¡aquí tienes el camino de vuelta!
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link
                to={homePath}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-[var(--color-blue)] hover:text-white transition-all duration-300 group shadow-lg hover:shadow-[var(--color-blue)]/40 w-full sm:w-auto"
              >
                <Home size={20} />
                Volver al Inicio
                <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/store"
                className="flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-bold rounded-full hover:bg-white/10 border border-white/10 transition-all duration-300 w-full sm:w-auto"
              >
                <ShoppingBag size={20} />
                Ir a la Tienda
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative icons */}
        <motion.div 
          className="absolute top-1/3 right-[10%] opacity-20 hidden lg:block"
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <div className="w-12 h-12 border-2 border-[var(--color-blue)] rounded-lg rotate-45"></div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/4 left-[10%] opacity-20 hidden lg:block"
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        >
          <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFound;
