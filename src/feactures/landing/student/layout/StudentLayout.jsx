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
        <div className="fixed bottom-4 right-4 bg-white backdrop-blur-[16px] rounded-full p-[4px_18px] ">
          <p className="text-gray-800 font-bold!">
            Bienvenido: <span className="italic">{userName}</span>
          </p>
        </div>
      )}
    </main>
  );
};
