import React, { useState, useEffect } from "react";
import { InstructorLayout } from "../../../landing/instructor/layout/InstructorLayout";
import { Users, Search, Loader2 } from "lucide-react";
import { Table } from "../components/myStudent/Table";
import { getEstudiantes } from "../../../dashboards/admin/pages/services/estudiantesServices";

export const MyStudent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getEstudiantes();
        setUsuarios(data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredUsers = usuarios.filter(user =>
    (user.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.documento || "").includes(searchTerm)
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

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="animate-spin text-[#3b82f6] mb-4" size={36} />
                <p className="text-sm font-medium">Cargando estudiantes...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-red-400 font-bold mb-2">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Users className="mb-4 text-gray-600" size={40} />
                <p className="text-sm font-medium">No se encontraron estudiantes</p>
              </div>
            ) : (
              <Table usuarios={filteredUsers} setUsuarios={setUsuarios} />
            )}
          </div>
        </div>
      </section>
    </InstructorLayout>
  );
};

export default MyStudent;
