import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Layout } from "../../../layout/layout";
import { getCompras } from "../../../services/comprasService";



export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Estados para modales
  const [modalType, setModalType] = useState(null); // "create" | "edit" | "view"
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [form, setForm] = useState({
    nombre_proveedor: "",
    fecha_compra: "",
    fecha_aproximada_entrega: "",
    total_compra: "",
    estado: "",
  });

  // 🔹 Cargar compras
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCompras();
      setCompras(data);
    } catch (err) {
      console.error("Error al cargar compras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Abrir modal
  const openModal = (type, compra = null) => {
    setModalType(type);
    setSelectedCompra(compra);
    if (type === "edit" && compra) {
      setForm(compra);
    } else if (type === "create") {
      setForm({
        nombre_proveedor: "",
        fecha_compra: "",
        fecha_aproximada_entrega: "",
        total_compra: "",
        estado: "",
      });
    }
  };

  // 🔹 Guardar compra
  const handleSave = async () => {
    try {
      if (modalType === "create") {
        await createCompra(form);
      } else if (modalType === "edit" && selectedCompra) {
        await updateCompra(selectedCompra.id_compra, form);
      }
      fetchData();
      setModalType(null);
    } catch (err) {
      console.error("Error al guardar compra:", err);
    }
  };

  // 🔹 Eliminar compra
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta compra?")) return;
    try {
      await deleteCompra(id);
      fetchData();
    } catch (err) {
      console.error("Error al eliminar compra:", err);
    }
  };

  // 🔹 Filtrar compras
  const comprasFiltradas = compras.filter((c) =>
    c.nombre_proveedor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Compras &gt; Registro de Compras
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar compras..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => openModal("create")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Registrar nueva compra
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID Compra</th>
                  <th className="px-6 py-3">Proveedor</th>
                  <th className="px-6 py-3">Fecha Compra</th>
                  <th className="px-6 py-3">Fecha Entrega</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                      Cargando...
                    </td>
                  </tr>
                ) : comprasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                      No hay compras registradas
                    </td>
                  </tr>
                ) : (
                  comprasFiltradas.map((c) => (
                    <tr
                      key={c.id_compra}
                      className="hover:bg-gray-50 transition border-b"
                    >
                      <td className="px-6 py-3">{c.id_compra}</td>
                      <td className="px-6 py-3">{c.nombre_proveedor}</td>
                      <td className="px-6 py-3">{c.fecha_compra}</td>
                      <td className="px-6 py-3">
                        {c.fecha_aproximada_entrega || "-"}
                      </td>
                      <td className="px-6 py-3">${c.total_compra}</td>
                      <td className="px-6 py-3">{c.estado}</td>
                      <td className="px-6 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => openModal("view", c)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", c)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id_compra)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white w-1/2 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {modalType === "create"
                ? "Registrar nueva compra"
                : modalType === "edit"
                ? "Editar compra"
                : "Detalle de compra"}
            </h3>

            {modalType === "view" && selectedCompra ? (
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Proveedor:</strong> {selectedCompra.nombre_proveedor}
                </p>
                <p>
                  <strong>Fecha compra:</strong> {selectedCompra.fecha_compra}
                </p>
                <p>
                  <strong>Fecha entrega:</strong>{" "}
                  {selectedCompra.fecha_aproximada_entrega || "-"}
                </p>
                <p>
                  <strong>Total:</strong> ${selectedCompra.total_compra}
                </p>
                <p>
                  <strong>Estado:</strong> {selectedCompra.estado}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={form.nombre_proveedor}
                    onChange={(e) =>
                      setForm({ ...form, nombre_proveedor: e.target.value })
                    }
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    value={form.fecha_compra}
                    onChange={(e) =>
                      setForm({ ...form, fecha_compra: e.target.value })
                    }
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    value={form.fecha_aproximada_entrega}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fecha_aproximada_entrega: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Total de la Compra
                  </label>
                  <input
                    type="number"
                    value={form.total_compra}
                    onChange={(e) =>
                      setForm({ ...form, total_compra: e.target.value })
                    }
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-xl transition"
              >
                Cerrar
              </button>
              {modalType !== "view" && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
