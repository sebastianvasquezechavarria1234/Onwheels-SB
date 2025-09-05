// src/layout/Layout.jsx
import React from "react";
import { Header } from "./Header";
import Footer from "./Footer";

export const Layout = ({ children }) => {
  return (
    <main>
      <Header />
        {children}
      <Footer />
    </main>
  );
};
