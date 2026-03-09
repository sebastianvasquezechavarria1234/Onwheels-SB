import React, { useState } from "react";
import { InstructorLayout } from "../../../landing/instructor/layout/InstructorLayout";
import { Users, Search } from "lucide-react";
import { Table } from "../components/myStudent/Table";

const initialUsuarios = [
  { id: 1, name: "Andrés", lastName: "Gómez", email: "andres.gomez@example.com", phone: "+57 300 111 2222", nivel: "Profesional" },
  { id: 2, name: "María", lastName: "López", email: "maria.lopez@example.com", phone: "+57 310 333 4444", nivel: "Principiante" },
  { id: 3, name: "Sebastián", lastName: "Vásquez", email: "sebastian.vasquez@example.com", phone: "+57 320 555 6666", nivel: "Intermedio" },
  { id: 4, name: "Camila", lastName: "Ramírez", email: "camila.ramirez@example.com", phone: "+57 321 777 8888", nivel: "Avanzado" },
  { id: 5, name: "Daniel", lastName: "Torres", email: "daniel.torres@example.com", phone: "+57 322 999 0000", nivel: "Intermedio" },
  { id: 6, name: "Laura", lastName: "Pérez", email: "laura.perez@example.com", phone: "+57 323 123 4567", nivel: "Profesional" },
];

export const MyStudent = () => {
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usuarios.filter(user =>
    `${user.name} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <InstructorLayout>
      <section className="min-h-screen bg-[#0B0F14] text-white font-primary pb-24 pt-[100px]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-6 border-b border-gray-800">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                <Users className="text-[#3b82f6]" size={36} />
                Mis Estudiantes
              </h2>
              <p className="text-[#9CA3AF] mt-2 font-medium">Gestiona y revisa el progreso de tus estudiantes inscritos</p>
            </div>
          </div>

          <div className="bg-[#121821] border border-gray-800 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0B0F14]">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121821] border border-gray-800 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors text-sm"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              </div>
              <div className="px-6 py-2 bg-[#1E3A8A]/20 border border-[#1E3A8A]/30 text-[#3b82f6] rounded-xl font-black text-xs uppercase tracking-widest hidden sm:block">
                {filteredUsers.length} Estudiantes
              </div>
            </div>

            <Table usuarios={filteredUsers} setUsuarios={setUsuarios} />
          </div>
        </div>
      </section>
    </InstructorLayout>
  );
};

export default MyStudent;
