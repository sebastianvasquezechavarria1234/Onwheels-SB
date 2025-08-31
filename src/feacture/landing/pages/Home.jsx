import React from "react";
import { Sidebar } from "lucide-react";

export const Home = () => {
    return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6">
        <h1 className="text-2xl font-bold">Contenido principal</h1>
        <p className="text-gray-600 mt-2">Aquí va tu página.</p>
      </main>
    </div>
    )
}