import React, { useEffect, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, X } from "lucide-react";
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-[120px]">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
              placeholder="Ej: 900123456, Nombre Proveedor"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <button
              onClick={() => openModal("crear")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              <Plus size={18} />
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

                      <td className="px-6 py-[18px] w-[10%]">
                        <div className="flex gap-2 items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal("editar", prov)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal("eliminar", prov)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                  <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
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
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Guardar</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {modal === "eliminar" && selected && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-primary text-center mb-[30px] text-red-600">Eliminar Proveedor</h3>
                <p className="text-gray-600 mb-4">¿Estás seguro que deseas eliminar al proveedor <strong>{selected?.nombre_proveedor}</strong>?</p>
                <div className="flex justify-end gap-[10px] mt-[20px]">
                  <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancelar</button>
                  <button onClick={handleEliminar} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Eliminar</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
}
