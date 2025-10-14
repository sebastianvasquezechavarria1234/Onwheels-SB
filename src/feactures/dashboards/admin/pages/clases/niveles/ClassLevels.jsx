// import React, { useEffect, useState } from "react";
// import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
// import {  AnimatePresence } from "framer-motion";
// // import {
// //   getMatriculas,
// //   createMatricula,
// //   updateMatricula,
// //   deleteMatricula,
// // } from "../";
// import { Layout } from "../layout/layout";

// export default function ClassLevels() {
//   const [matriculas, setMatriculas] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [selected, setSelected] = useState(null);
//   const [modalType, setModalType] = useState(null);

//   const [addForm, setAddForm] = useState({
//     id_preinscripcion: "",
//     id_clase: "",
//     id_plan: "",
//     id_metodo_pago: "",
//     fecha_matricula: "",
//     valor_matricula: "",
//   });

//   const [editForm, setEditForm] = useState({ ...addForm });

//   useEffect(() => {
//     fetchMatriculas();
//   }, []);

//   const fetchMatriculas = async () => {
//     setLoading(true);
//     try {
//       const data = await getMatriculas();
//       setMatriculas(data);
//     } catch (err) {
//       console.error(err);
//       setError("Error al cargar matrículas.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* --- CRUD --- */
//   const saveAdd = async () => {
//     try {
//       const res = await createMatricula(addForm);
//       setMatriculas((prev) => [res.data.matricula, ...prev]);
//       closeModal();
//     } catch (err) {
//       console.error("Error creando matrícula:", err);
//     }
//   };

//   const saveEdit = async () => {
//     if (!selected) return;
//     try {
//       await updateMatricula(selected.id_matricula, editForm);
//       setMatriculas((prev) =>
//         prev.map((m) =>
//           m.id_matricula === selected.id_matricula ? { ...m, ...editForm } : m
//         )
//       );
//       closeModal();
//     } catch (err) {
//       console.error("Error editando matrícula:", err);
//     }
//   };

//   const confirmDelete = async (id) => {
//     try {
//       await deleteMatricula(id);
//       setMatriculas((prev) => prev.filter((m) => m.id_matricula !== id));
//       closeModal();
//     } catch (err) {
//       console.error("Error eliminando matrícula:", err);
//     }
//   };


//   /* --- Modal helpers --- */
//   const openModal = (type, item) => {
//     setModalType(type);
//     if (type === "add") {
//       setAddForm({
//         id_preinscripcion: "",
//         id_clase: "",
//         id_plan: "",
//         id_metodo_pago: "",
//         fecha_matricula: "",
//         valor_matricula: "",
//       });
//       setSelected(null);
//       return;
//     }
//     if (item) {
//       setSelected(item);
//       setEditForm({ ...item });
//     }
//   };

//   const closeModal = () => {
//     setSelected(null);
//     setModalType(null);
//   };

//   const handleChange = (e, formSetter) => {
//     const { name, value } = e.target;
//     formSetter((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <Layout>
//       <div className="p-6 bg-gray-50 min-h-screen w-full">
//         <div className="bg-white rounded-2xl shadow-md border border-gray-200">
//           {/* Encabezado */}
//           <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-700">
//               matrículas &gt; Gestión de Matrículas
//             </h2>
//           </div>

//           {/* Barra búsqueda + botón */}
//           <div className="flex justify-between items-center p-4">
//             <div className="relative w-1/3">
//               <input
//                 type="text"
//                 placeholder="Buscar matrículas..."
//                 className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//             </div>
//             <button
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
//               onClick={() => openModal("add")}
//             >
//               <Plus className="h-4 w-4" />
//               Registrar nueva matrícula
//             </button>
//           </div>

//           {/* Tabla */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left text-gray-600">
//               <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
//                 <tr>
//                   <th className="px-6 py-3">ID Matrícula</th>
//                   <th className="px-6 py-3">Preinscripción</th>
//                   <th className="px-6 py-3">Clase</th>
//                   <th className="px-6 py-3">Plan</th>
//                   <th className="px-6 py-3">Fecha Matrícula</th>
//                   <th className="px-6 py-3">Valor Matrícula</th>
//                   <th className="px-6 py-3">Método de Pago</th>
//                   <th className="px-6 py-3 text-center">Acciones</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading && (
//                   <tr>
//                     <td colSpan="8" className="text-center py-10">
//                       Cargando...
//                     </td>
//                   </tr>
//                 )}
//                 {error && (
//                   <tr>
//                     <td colSpan="8" className="text-center py-10 text-red-500">
//                       {error}
//                     </td>
//                   </tr>
//                 )}
//                 {!loading && !error && matriculas.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="8"
//                       className="text-center py-10 text-gray-400 italic"
//                     >
//                       No hay matrículas registradas
//                     </td>
//                   </tr>
//                 )}
//                 {matriculas.map((m) => (
//                   <tr key={m.id_matricula} className="hover:bg-gray-50">
//                     <td className="px-6 py-2">{m.id_matricula}</td>
//                     <td className="px-6 py-2">{m.id_preinscripcion}</td>
//                     <td className="px-6 py-2">{m.id_clase}</td>
//                     <td className="px-6 py-2">{m.id_plan}</td>
//                     <td className="px-6 py-2">{m.fecha_matricula}</td>
//                     <td className="px-6 py-2">{m.valor_matricula}</td>
//                     <td className="px-6 py-2">{m.id_metodo_pago}</td>
//                     <td className="px-6 py-2 flex gap-2 justify-center">
//                       <button
//                         onClick={() => openModal("edit", m)}
//                         className="text-blue-600 hover:text-blue-800"
//                       >
//                         <Pencil size={18} />
//                       </button>
//                       <button
//                         onClick={() => openModal("delete", m)}
//                         className="text-red-600 hover:text-red-800"
//                       >
//                         <Trash2 size={18} />
//                       </button>
//                       <button
//                         onClick={() => openModal("details", m)}
//                         className="text-green-600 hover:text-green-800"
//                       >
//                         <Eye size={18} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Modales */}
//       <AnimatePresence>
//         {modalType === "add" && (
//           <ModalWrapper onClose={closeModal}>
//             <h3 className="font-bold mb-4">Nueva Matrícula</h3>
//             <form>
//               <input
//                 name="id_preinscripcion"
//                 value={addForm.id_preinscripcion}
//                 onChange={(e) => handleChange(e, setAddForm)}
//                 className="input w-full mb-2"
//                 placeholder="Preinscripción"
//               />
//               <input
//                 name="id_clase"
//                 value={addForm.id_clase}
//                 onChange={(e) => handleChange(e, setAddForm)}
//                 className="input w-full mb-2"
//                 placeholder="Clase"
//               />
//               <input
//                 name="id_plan"
//                 value={addForm.id_plan}
//                 onChange={(e) => handleChange(e, setAddForm)}
//                 className="input w-full mb-2"
//                 placeholder="Plan"
//               />
//               <input
//                 type="date"
//                 name="fecha_matricula"
//                 value={addForm.fecha_matricula}
//                 onChange={(e) => handleChange(e, setAddForm)}
//                 className="input w-full mb-2"
//               />
//               <input
//                 type="number"
//                 name="valor_matricula"
//                 value={addForm.valor_matricula}
//                 onChange={(e) => handleChange(e, setAddForm)}
//                 className="input w-full mb-2"
//                 placeholder="Valor matrícula"
//               />
//               <input
//                 name="id_metodo_pago"
//                 value={addForm.id_metodo_pago}
//                 onChange={(e) => handleChange(e, setAddForm)}
//                 className="input w-full mb-2"
//                 placeholder="Método de pago"
//               />
//               <button
//                 type="button"
//                 className="btn bg-blue-500 text-white"
//                 onClick={saveAdd}
//               >
//                 Guardar
//               </button>
//             </form>
//           </ModalWrapper>
//         )}

//         {modalType === "edit" && selected && (
//           <ModalWrapper onClose={closeModal}>
//             <h3 className="font-bold mb-4">Editar Matrícula</h3>
//             <form>
//               <input
//                 name="valor_matricula"
//                 value={editForm.valor_matricula}
//                 onChange={(e) => handleChange(e, setEditForm)}
//                 className="input w-full mb-2"
//               />
//               <button
//                 type="button"
//                 className="btn bg-blue-500 text-white"
//                 onClick={saveEdit}
//               >
//                 Guardar cambios
//               </button>
//             </form>
//           </ModalWrapper>
//         )}

//         {modalType === "delete" && selected && (
//           <ModalWrapper onClose={closeModal}>
//             <h3 className="font-bold mb-4">Eliminar Matrícula</h3>
//             <p>
//               ¿Seguro que deseas eliminar la matrícula{" "}
//               <b>{selected.id_matricula}</b>?
//             </p>
//             <div className="flex justify-end gap-2 mt-4">
//               <button className="btn bg-gray-200" onClick={closeModal}>
//                 Cancelar
//               </button>
//               <button
//                 className="btn bg-red-500 text-white"
//                 onClick={() => confirmDelete(selected.id_matricula)}
//               >
//                 Eliminar
//               </button>
//             </div>
//           </ModalWrapper>
//         )}

//         {modalType === "details" && selected && (
//           <ModalWrapper onClose={closeModal}>
//             <h3 className="font-bold mb-4">Detalles Matrícula</h3>
//             <pre className="bg-gray-100 p-4 rounded">
//               {JSON.stringify(selected, null, 2)}
//             </pre>
//             <button className="btn bg-gray-200 mt-4" onClick={closeModal}>
//               Cerrar
//             </button>
//           </ModalWrapper>
//         )}
//       </AnimatePresence>
//     </Layout>
//   );
// }

// /* === Modal Wrapper === */
// const ModalWrapper = ({ children, onClose }) => (
//   <motion.div
//     className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//   >
//     <motion.div
//       className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-lg relative"
//       initial={{ scale: 0.9, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       exit={{ scale: 0.9, opacity: 0 }}
//     >
//       {children}
//     </motion.div>
//     <div className="absolute inset-0" onClick={onClose}></div>
//   </motion.div>
// );
