// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import "./App.css";
import { AuthProvider } from "./feactures/dashboards/dinamico/context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);