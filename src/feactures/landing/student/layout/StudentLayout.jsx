import { useState, useEffect } from 'react';
import Footer from "../../layout/Footer";
import { StudentHeader } from "./StudentHeader";

export const StudentLayout = ({ children }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Obtener el usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.nombre || 'Estudiante');
      } catch (error) {
        console.error('Error parsing user ', error);
      }
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <StudentHeader />
      
      <div className="flex-grow">
        {children}
      </div>
      
      <Footer />
      
      {/* Sticky welcome message at bottom right */}
      {userName && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 z-50 border border-gray-200">
          <h2 className="text-sm font-medium text-gray-800">
            Bienvenido: <span className="font-bold text-blue-800">{userName}</span>
          </h2>
        </div>
      )}
    </main>
  );
};
