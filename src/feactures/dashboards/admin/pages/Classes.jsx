


// import React, { useEffect, useState } from "react";
// import { Layout } from "../../layout/layout";
// import { Eye, Plus, Search, Pencil, Trash2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const Clases = () => {
//   const [clases, setClases] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [modalType, setModalType] = useState(null);

//   const [editForm, setEditForm] = useState({ 
//     nombre_clase: "", 
//     descripcion: "", 
//     estado: true,
//     nivel: "",
//     duracion: "",
//     precio: ""
//   });
//   const [addForm, setAddForm] = useState({ 
//     nombre_clase: "", 
//     descripcion: "", 
//     estado: true,
//     nivel: "",
//     duracion: "",
//     precio: ""
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // búsqueda
//   const [search, setSearch] = useState("");

//   // paginación
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // cerrar con Escape
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") closeModal();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // cargar clases
//   useEffect(() => {
//     fetchClases();
//   }, []);

//   const fetchClases = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Datos mock para ejemplo
//       const mockData = [
//         { id: 1, nombre_clase: "Yoga Básico", descripcion: "Clase introductoria para principiantes", estado: true, nivel: "Básico", duracion: "60 min", precio: "$50.000" },
//         { id: 2, nombre_clase: "Pilates Avanzado", descripcion: "Clase intensiva para nivel avanzado", estado: true, nivel: "Avanzado", duracion: "75 min", precio: "$65.000" },
//         { id: 3, nombre_clase: "Zumba", descripcion: "Clase de baile fitness", estado: false, nivel: "Intermedio", duracion: "50 min", precio: "$45.000" },
//         { id: 4, nombre_clase: "CrossFit", descripcion: "Entrenamiento funcional intenso", estado: true, nivel: "Avanzado", duracion: "90 min", precio: "$70.000" },
//         { id: 5, nombre_clase: "Natación Infantil", descripcion: "Clase para niños de 5 a 10 años", estado: true, nivel: "Básico", duracion: "45 min", precio: "$40.000" },
//         { id: 6, nombre_clase: "Spinning", descripcion: "Clase de ciclismo indoor", estado: true, nivel: "Intermedio", duracion: "60 min", precio: "$55.000" },
//         { id: 7, nombre_clase: "Meditación", descripcion: "Clase de relajación y mindfulness", estado: false, nivel: "Básico", duracion: "40 min", precio: "$35.000" },
//       ];
//       setClases(mockData);
//     } catch (err) {
//       console.error("Error cargando clases:", err);
//       setError("No se pudieron cargar las clases. Revisa la API / CORS.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- Modales ---------------- */
//   const openModal = (type, item) => {
//     setModalType(type);
//     if (type === "add") {
//       setAddForm({ 
//         nombre_clase: "", 
//         descripcion: "", 
//         estado: true,
//         nivel: "",
//         duracion: "",
//         precio: ""
//       });
//       setSelected(null);
//       return;
//     }
//     setSelected(item ? { ...item } : null);
//     if (type === "edit" && item) {
//       setEditForm({ 
//         nombre_clase: item.nombre_clase || "", 
//         descripcion: item.descripcion || "", 
//         estado: !!item.estado,
//         nivel: item.nivel || "",
//         duracion: item.duracion || "",
//         precio: item.precio || ""
//       });
//     }
//   };

//   const closeModal = () => {
//     setSelected(null);
//     setModalType(null);
//   };

//   /* ---------------- CRUD local (in-memory) ---------------- */
//   const confirmDelete = (id) => {
//     setClases((prev) => prev.filter((it) => it.id !== id));
//     closeModal();
//   };

//   const toggleEstado = (id) => {
//     setClases((prev) => prev.map((r) => (r.id === id ? { ...r, estado: !r.estado } : r)));
//   };

//   const handleEditChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//   };

//   const saveEdit = () => {
//     if (!selected) return closeModal();
//     setClases((prev) => prev.map((it) => (it.id === selected.id ? { ...it, ...editForm } : it)));
//     closeModal();
//   };

//   const handleAddChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setAddForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//   };

//   const saveAdd = () => {
//     const newId = clases.length ? Math.max(...clases.map((c) => +c.id)) + 1 : 1;
//     const newClase = {
//       id: newId,
//       nombre_clase: addForm.nombre_clase || `Clase ${newId}`,
//       descripcion: addForm.descripcion || "",
//       estado: typeof addForm.estado === "boolean" ? addForm.estado : true,
//       nivel: addForm.nivel || "",
//       duracion: addForm.duracion || "",
//       precio: addForm.precio || ""
//     };
//     setClases((prev) => [newClase, ...prev]);
//     closeModal();
//   };

//   // Filtrado y paginación
//   const clasesFiltradas = clases.filter((c) => 
//     c.nombre_clase?.toLowerCase().includes(search.toLowerCase()) ||
//     c.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
//     c.nivel?.toLowerCase().includes(search.toLowerCase())
//   );
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentItems = clasesFiltradas.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.max(1, Math.ceil(clasesFiltradas.length / itemsPerPage));

//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(totalPages);
//   }, [totalPages, currentPage]);

//   return (
//     <Layout>
//       <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
//         <h2 className="dashboard__title font-primary p-[30px] font-secundaria">Configuracion / Clases</h2>

//         <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
//           <form action="" className="flex gap-[10px]">
//             <label className="mb-[20px] block">
//               <p className="">Buscar Clase:</p>
//               <div className="relative">
//                 <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
//                 <input
//                   value={search}
//                   onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
//                   className="input pl-[50px]!"
//                   type="text"
//                   placeholder="Por ejem: 'Yoga'"
//                 />
//               </div>
//             </label>
//           </form>

//           <div className="">
//             <button
//               className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
//               onClick={() => openModal("add", null)}
//             >
//               <Plus size={20} strokeWidth={1.8} />
//               Añadir clase
//             </button>
//           </div>
//         </div>

//         <div className="p-[30px]">
//           {/* Encabezados estilo Clases */}
//           <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
//             <p className="w-[20%] font-bold! opacity-80">Nombreeee</p>
//             <p className="w-[25%] font-bold! opacity-80">Descripción</p>
//             <p className="w-[10%] font-bold! opacity-80">Nivel</p>
//             <p className="w-[10%] font-bold! opacity-80">Duración</p>
//             <p className="w-[10%] font-bold! opacity-80">Precio</p>
//             <p className="w-[10%] font-bold! opacity-80">Estado</p>
//             <p className="w-[15%] font-bold! opacity-80">Acciones</p>
//           </article>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left text-gray-600">
//               <thead>
//                 <tr><th className="hidden" /></tr>
//               </thead>

//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-10 text-gray-400 italic">Cargando clases...</td>
//                   </tr>
//                 ) : error ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-10 italic text-red-700">{error}</td>
//                   </tr>
//                 ) : currentItems.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="text-center py-10 italic text-red-700">No hay clases registradas</td>
//                   </tr>
//                 ) : (
//                   currentItems.map((clase) => (
//                     <tr key={clase.id} className="py-[18px] border-b border-black/20 flex items-center">
//                       <td className="px-6 py-[18px] w-[20%]">{clase.nombre_clase}</td>
//                       <td className="px-6 py-[18px] w-[25%] line-clamp-2">{clase.descripcion}</td>
//                       <td className="px-6 py-[18px] w-[10%]">{clase.nivel}</td>
//                       <td className="px-6 py-[18px] w-[10%]">{clase.duracion}</td>
//                       <td className="px-6 py-[18px] w-[10%]">{clase.precio}</td>

//                       <td className="px-6 py-[18px] w-[10%]">
//                         <span
//                           onClick={() => toggleEstado(clase.id)}
//                           className={`px-[15px] py-[7px] rounded-full inline-flex items-center gap-[10px] cursor-pointer ${
//                             clase.estado ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
//                           }`}
//                         >
//                           <span className="w-[10px] h-[10px] block bg-[currentColor] rounded-full"></span>
//                           {clase.estado ? "Activo" : "Inactivo"}
//                         </span>
//                       </td>

//                       <td className="px-6 py-[18px] w-[15%] flex gap-[10px] items-center justify-center">
//                         <motion.button
//                           onClick={() => openModal("details", clase)}
//                           whileHover={{ scale: 1.08 }}
//                           whileTap={{ scale: 0.95 }}
//                           className="w-[45px] h-[45px] bg-green-100 text-green-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-green-300 shadow-md"
//                         >
//                           <Eye className="h-4 w-4" />
//                         </motion.button>

//                         <motion.button
//                           onClick={() => openModal("edit", clase)}
//                           whileHover={{ scale: 1.08 }}
//                           whileTap={{ scale: 0.95 }}
//                           className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </motion.button>

//                         <motion.button
//                           onClick={() => openModal("delete", clase)}
//                           whileHover={{ scale: 1.08 }}
//                           whileTap={{ scale: 0.95 }}
//                           className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </motion.button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Paginación (siempre visible) */}
//           <div className="flex justify-center items-center gap-2 py-4 italic">
//             <button
//               disabled={currentPage === 1}
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               className="btn cursor-pointer bg-gray-200"
//             >
//               Anterior
//             </button>

//             <span className="text-[18px]">Página <span className="text-blue-700">{currentPage}</span> de {totalPages}</span>

//             <button
//               disabled={currentPage === totalPages}
//               onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//               className="btn cursor-pointer bg-gray-200"
//             >
//               Siguiente
//             </button>
//           </div>
//         </div>

//         {/* Modales */}
//         <AnimatePresence>
//           {/* Add */}
//           {modalType === "add" && (
//             <motion.div
//               className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.15 }}
//             >
//               <div className="absolute inset-0" onClick={closeModal} />

//               <motion.div
//                 className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 18 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <h3 className="font-primary text-center mb-[30px]">Agregar clase</h3>

//                 <form>
//                   <label className="block mb-[20px]">
//                     <p className="">Nombre</p>
//                     <input name="nombre_clase" className="input w-full" value={addForm.nombre_clase} onChange={handleAddChange} placeholder="Ej: Yoga Básico" />
//                   </label>

//                   <label className="block mb-[20px]">
//                     <p className="">Descripción:</p>
//                     <textarea name="descripcion" className="input w-full h-[120px]" value={addForm.descripcion} onChange={handleAddChange} placeholder="Ej: Clase introductoria para principiantes" />
//                   </label>

//                   <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
//                     <label className="block">
//                       <p className="">Nivel</p>
//                       <input name="nivel" className="input w-full" value={addForm.nivel} onChange={handleAddChange} placeholder="Ej: Básico" />
//                     </label>

//                     <label className="block">
//                       <p className="">Duración</p>
//                       <input name="duracion" className="input w-full" value={addForm.duracion} onChange={handleAddChange} placeholder="Ej: 60 min" />
//                     </label>
//                   </div>

//                   <label className="block mb-[20px]">
//                     <p className="">Precio</p>
//                     <input name="precio" className="input w-full" value={addForm.precio} onChange={handleAddChange} placeholder="Ej: $50.000" />
//                   </label>

//                   <label className="flex items-center gap-3 mb-[20px]">
//                     <input type="checkbox" name="estado" checked={!!addForm.estado} onChange={handleAddChange} />
//                     <span>Estado (activo)</span>
//                   </label>

//                   <div className="flex justify-end gap-[10px] mt-[20px]">
//                     <button type="button" className="btn bg-gray-200" onClick={closeModal}>
//                       Cancelar
//                     </button>
//                     <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveAdd}>
//                       Guardar
//                     </button>
//                   </div>
//                 </form>
//               </motion.div>
//             </motion.div>
//           )}

//           {/* Details */}
//           {modalType === "details" && selected && (
//             <motion.div
//               className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.15 }}
//             >
//               <div className="absolute inset-0" onClick={closeModal} />

//               <motion.div
//                 className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 18 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <h3 className="font-primary text-center mb-[30px]">Detalles de la clase</h3>

//                 <div className="grid grid-cols-2 gap-[10px]">
//                   <div>
//                     <p className="font-medium">Nombre:</p>
//                     <p className="font-medium">Descripción:</p>
//                     <p className="font-medium">Nivel:</p>
//                     <p className="font-medium">Duración:</p>
//                     <p className="font-medium">Precio:</p>
//                     <p className="font-medium">Estado:</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-700">{selected.nombre_clase}</p>
//                     <p className="text-gray-700">{selected.descripcion}</p>
//                     <p className="text-gray-700">{selected.nivel}</p>
//                     <p className="text-gray-700">{selected.duracion}</p>
//                     <p className="text-gray-700">{selected.precio}</p>
//                     <p className="text-gray-700">{selected.estado ? "Activo" : "Inactivo"}</p>
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-[10px] mt-[30px]">
//                   <button className="btn bg-gray-200" onClick={closeModal}>
//                     Cerrar
//                   </button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}

//           {/* Edit */}
//           {modalType === "edit" && selected && (
//             <motion.div
//               className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.15 }}
//             >
//               <div className="absolute inset-0" onClick={closeModal} />

//               <motion.div
//                 className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 18 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <h3 className="font-primary text-center mb-[30px]">Editar clase</h3>

//                 <form>
//                   <label className="block mb-[20px]">
//                     <p className="">Nombre</p>
//                     <input name="nombre_clase" className="input w-full" value={editForm.nombre_clase} onChange={handleEditChange} placeholder="Ej: Yoga Básico" />
//                   </label>

//                   <label className="block mb-[20px]">
//                     <p className="">Descripción:</p>
//                     <textarea name="descripcion" className="input w-full h-[120px]" value={editForm.descripcion} onChange={handleEditChange} placeholder="Ej: Clase introductoria para principiantes" />
//                   </label>

//                   <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
//                     <label className="block">
//                       <p className="">Nivel</p>
//                       <input name="nivel" className="input w-full" value={editForm.nivel} onChange={handleEditChange} placeholder="Ej: Básico" />
//                     </label>

//                     <label className="block">
//                       <p className="">Duración</p>
//                       <input name="duracion" className="input w-full" value={editForm.duracion} onChange={handleEditChange} placeholder="Ej: 60 min" />
//                     </label>
//                   </div>

//                   <label className="block mb-[20px]">
//                     <p className="">Precio</p>
//                     <input name="precio" className="input w-full" value={editForm.precio} onChange={handleEditChange} placeholder="Ej: $50.000" />
//                   </label>

//                   <label className="flex items-center gap-3 mb-[20px]">
//                     <input type="checkbox" name="estado" checked={!!editForm.estado} onChange={handleEditChange} />
//                     <span>Estado (activo)</span>
//                   </label>

//                   <div className="flex justify-end gap-[10px] mt-[20px]">
//                     <button type="button" className="btn bg-gray-200" onClick={closeModal}>
//                       Cancelar
//                     </button>
//                     <button type="button" className="btn bg-blue-100 text-blue-700" onClick={saveEdit}>
//                       Guardar
//                     </button>
//                   </div>
//                 </form>
//               </motion.div>
//             </motion.div>
//           )}

//           {/* Delete */}
//           {modalType === "delete" && selected && (
//             <motion.div
//               className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.15 }}
//             >
//               <div className="absolute inset-0" onClick={closeModal} />

//               <motion.div
//                 className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 18 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <h3 className="font-primary text-center mb-[30px]">Eliminar clase</h3>
//                 <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar <span className="font-bold">{selected?.nombre_clase}</span>? Esta acción es permanente.</p>
//                 <div className="flex justify-end gap-[10px] mt-[20px]">
//                   <button className="btn bg-gray-200" onClick={closeModal}>
//                     Cancelar
//                   </button>
//                   <button className="btn bg-red-100 text-red-700" onClick={() => confirmDelete(selected.id)}>
//                     Eliminar
//                   </button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </section>
//     </Layout>
//   );
// };

// export default Clases;
