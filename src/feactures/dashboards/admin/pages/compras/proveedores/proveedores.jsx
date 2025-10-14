import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Layout } from "../../../layout/layout";
import { motion, AnimatePresence } from "framer-motion";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔹 Modales y formularios
  const [modal, setModal] = useState(null); // "crear" | "editar" | "eliminar"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ NIT_proveedor: "", nombre_proveedor: "", email: "", telefono: "", direccion: "" });

  // 🔹 Cargar proveedores desde la API
  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/proveedores"); // Ajusta al puerto de tu backend
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  // Filtrar proveedores por nombre o NIT
  const proveedoresFiltrados = proveedores.filter(
    (prov) =>
      prov.nombre_proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prov.NIT_proveedor?.toString().includes(busqueda)
  );

  // Paginación derivada
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = proveedoresFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(proveedoresFiltrados.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Abrir modal
  const openModal = (type, prov = null) => {
    setModal(type);
    setSelected(prov);
    setForm(
      prov || {
        NIT_proveedor: "",
        nombre_proveedor: "",
        email: "",
        telefono: "",
        direccion: "",
      }
    );
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ NIT_proveedor: "", nombre_proveedor: "", email: "", telefono: "", direccion: "" });
  };

  // Guardar (crear o editar)
  const handleGuardar = async (e) => {
    e && e.preventDefault();
    try {
      if (modal === "crear") {
        await fetch("http://localhost:3000/api/proveedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else if (modal === "editar" && selected) {
        await fetch(`http://localhost:3000/api/proveedores/${selected.NIT_proveedor}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      await fetchProveedores();
      closeModal();
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
    }
  };

  // Eliminar
  const handleEliminar = async () => {
    try {
      if (!selected) return;
      await fetch(`http://localhost:3000/api/proveedores/${selected.NIT_proveedor}`, {
        method: "DELETE",
      });
      await fetchProveedores();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
    }
  };

  return (
    <Layout>
      <section className="dashboard__pages relative w-full overflow-y-scroll sidebar h-screen">
        <h2 className="dashboard__title font-primary p-[30px] font-secundaria">
          Compras &gt; Proveedores
        </h2>

        <div className="flex justify-between p-[0px_40px_0px_20px] mt-[120px]">
          <form action="" className="flex gap-[10px]">
            <label className="mb-[20px] block">
              <p className="">Buscar proveedores:</p>
              <div className="relative">
                <Search className="absolute top-[50%] left-[20px] translate-y-[-50%]" strokeWidth={1.3} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                  placeholder="Ej: 900123456, Nombre Proveedor"
                  className="input pl-[50px]!"
                />
              </div>
            </label>
          </form>

          <div>
            <button
              onClick={() => openModal("crear")}
              className="btn bg-blue-100 text-blue-700 flex items-center gap-[10px]"
            >
              <Plus className="h-4 w-4" />
              Registrar nuevo proveedor
            </button>
          </div>
        </div>

        <div className="p-[30px]">
          {/* Encabezados estilo Roles */}
          <article className="font-semibold italic mt-[40px] flex items-center border-b border-black/20 pb-[20px]">
            <p className="w-[15%] font-bold! opacity-80">NIT</p>
            <p className="w-[25%] font-bold! opacity-80">Nombre Proveedor</p>
            <p className="w-[20%] font-bold! opacity-80">Email</p>
            <p className="w-[15%] font-bold! opacity-80">Teléfono</p>
            <p className="w-[15%] font-bold! opacity-80">Dirección</p>
            <p className="w-[10%] font-bold! opacity-80">Acciones</p>
          </article>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr>
                  <th className="hidden" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">Cargando proveedores...</td>
                  </tr>
                ) : proveedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 italic text-red-700">No hay proveedores registrados</td>
                  </tr>
                ) : (
                  currentItems.map((prov) => (
                    <tr key={prov.NIT_proveedor} className="py-[18px] border-b border-black/20">
                      <td className="px-6 py-[18px] w-[15%]">{prov.NIT_proveedor}</td>
                      <td className="px-6 py-[18px] w-[25%] line-clamp-1">{prov.nombre_proveedor}</td>
                      <td className="px-6 py-[18px] w-[20%] line-clamp-1">{prov.email}</td>
                      <td className="px-6 py-[18px] w-[15%]">{prov.telefono}</td>
                      <td className="px-6 py-[18px] w-[15%] line-clamp-1">{prov.direccion}</td>

                      <td className="px-6 py-[18px] w-[10%] flex gap-[10px] items-center justify-center">
                        <motion.button
                          onClick={() => openModal("editar", prov)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-blue-100 text-blue-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-blue-200 shadow-md"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                          </svg>
                        </motion.button>

                        <motion.button
                          onClick={() => openModal("eliminar", prov)}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-[45px] h-[45px] bg-red-100 text-red-700 flex justify-center items-center rounded-[18px] cursor-pointer border border-red-200 shadow-md"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                          </svg>
                        </motion.button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-2 py-4 italic">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Anterior
            </button>

            <span className="text-[18px]">Página <span className="text-blue-700">{currentPage}</span> de {totalPages}</span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn cursor-pointer bg-gray-200"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Modales */}
        <AnimatePresence>
          {(modal === "crear" || modal === "editar") && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px]">{modal === "crear" ? "Registrar Proveedor" : "Editar Proveedor"}</h3>

                <form onSubmit={handleGuardar} className="grid grid-cols-2 gap-[16px]">
                  <label className="block col-span-1">
                    <p className="">NIT</p>
                    <input
                      type="text"
                      value={form.NIT_proveedor}
                      onChange={(e) => setForm({ ...form, NIT_proveedor: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: 900123456"
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Nombre</p>
                    <input
                      type="text"
                      value={form.nombre_proveedor}
                      onChange={(e) => setForm({ ...form, nombre_proveedor: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: Proveedor S.A."
                      required
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Email</p>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: contacto@proveedor.com"
                    />
                  </label>

                  <label className="block col-span-1">
                    <p className="">Teléfono</p>
                    <input
                      type="text"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: +57 300 123 4567"
                    />
                  </label>

                  <label className="block col-span-2">
                    <p className="">Dirección</p>
                    <input
                      type="text"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      className="input w-full"
                      placeholder="Ej: Calle 123 #45-67"
                    />
                  </label>

                  <div className="flex justify-end gap-[10px] mt-[10px] col-span-2">
                    <button type="button" onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                    <button type="submit" className="btn bg-blue-100 text-blue-700">Guardar</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {modal === "eliminar" && selected && (
            <motion.div
              className="modal py-[60px] fixed w-full min-h-screen top-0 left-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="absolute inset-0" onClick={closeModal} />

              <motion.div
                className="relative z-10 bg-white p-[30px] rounded-[30px] w-[90%] max-w-[640px]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px] text-red-600">Eliminar Proveedor</h3>
                <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar al proveedor <strong>{selected?.nombre_proveedor}</strong>?</p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button onClick={closeModal} className="btn bg-gray-200">Cancelar</button>
                  <button onClick={handleEliminar} className="btn bg-red-100 text-red-700">Eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
