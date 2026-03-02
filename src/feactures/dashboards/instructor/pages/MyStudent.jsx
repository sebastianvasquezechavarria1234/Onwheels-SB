import React, { useEffect, useState } from "react";
import { Layout } from "../../instructor/layout/layout";
import { Table } from "../components/myStudent/Table";
import { useAuth } from "../../dinamico/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const MyStudent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMisEstudiantes();
  }, []);

  const fetchMisEstudiantes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id_usuario;

      if (!userId || !token) {
        setError("No se encontró sesión activa.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/matriculas/instructor/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener estudiantes");

      const data = await res.json();

      const mapped = data.map(e => {
        const partes = (e.nombre_completo || "").trim().split(" ");
        return {
          id: e.id_estudiante,
          name: partes[0] || "",
          lastName: partes.slice(1).join(" ") || "",
          email: e.email || "",
          phone: e.telefono || "",
          nivel: e.nombre_nivel || "",
          clase: `${e.nombre_nivel || ""} - ${e.dia_semana || ""} ${e.hora_inicio || ""}`.trim(),
          estado: e.estado || "",
        };
      });

      setUsuarios(mapped);
    } catch (err) {
      console.error("Error cargando mis estudiantes:", err);
      setError("No se pudieron cargar los estudiantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="pr-[10px] w-full overflow-hidden h-screen">
        <h2 className="sticky top-0 z-50 p-[30px] pb-[80px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-primary">
          Mis estudiantes
        </h2>

        {loading ? (
          <p className="text-center py-10 text-gray-400 italic">Cargando estudiantes...</p>
        ) : error ? (
          <p className="text-center py-10 text-red-600 italic">{error}</p>
        ) : usuarios.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic">
            No tienes estudiantes asignados a tus clases
          </p>
        ) : (
          <Table usuarios={usuarios} setUsuarios={setUsuarios} />
        )}
      </section>
    </Layout>
  );
};

export default MyStudent;
