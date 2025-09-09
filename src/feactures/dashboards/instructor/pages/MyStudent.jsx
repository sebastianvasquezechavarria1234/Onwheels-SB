import React, { useState } from "react";
import { Layout } from "../../instructor/layout/layout";
import { AnimatePresence } from "framer-motion";
import { Table } from "../components/myStudent/Table";
import { ModalDetails } from "../components/myStudent/ModalDetails";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  return (
    <Layout>
      <section className="pr-[10px] w-full bg-[var(--gray-bg-body)]">
        <h2 className="sticky top-0 z-50 bg-[var(--gray-bg-body)] p-[30px] pb-[80px] shadow-[0px_20px_20px_var(--gray-bg-body)] font-primary">
          Mis estudiantes
        </h2>

        <Table
          usuarios={usuarios}
          setUsuarios={setUsuarios}
          setUsuarioSeleccionado={setUsuarioSeleccionado}
          setModalOpen={setModalOpen}
        />

        <AnimatePresence>
          {modalOpen && (
            <ModalDetails
              usuarioSeleccionado={usuarioSeleccionado}
              setUsuarioSeleccionado={setUsuarioSeleccionado}
              setModalOpen={setModalOpen}
            />
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default MyStudent;
