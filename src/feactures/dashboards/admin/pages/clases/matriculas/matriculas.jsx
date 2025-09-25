import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";

import { Layout } from "../../../layout/layout";
import { createMatricula, deleteMatricula, getMatriculas, updateMatricula }
 from "../../../services/matriculaService";

 function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id_preinscripcion: "",
    id_clase: "",
    id_plan: "",
    id_metodo_pago: "",
    fecha_matricula: "",
    valor_matricula: "",
  });
  const [editId, setEditId] = useState(null);

  // ✅ Cargar datos al iniciar
  useEffect(() => {
    fetchMatriculas();
  }, []);

  const fetchMatriculas = async () => {
    const data = await getMatriculas();
    setMatriculas(data);
  };

  // ✅ Manejo de inputs
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Guardar (crear/editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateMatricula(editId, form);
    } else {
      await createMatricula(form);
    }
    resetForm();
    fetchMatriculas();
  };

  const handleEdit = (matricula) => {
    setForm(matricula);
    setEditId(matricula.id_matricula);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta matrícula?")) {
      await deleteMatricula(id);
      fetchMatriculas();
    }
  };

  const resetForm = () => {
    setForm({
      id_preinscripcion: "",
      id_clase: "",
      id_plan: "",
      id_metodo_pago: "",
      fecha_matricula: "",
      valor_matricula: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  // ✅ Filtro de búsqueda
  const filtered = matriculas.filter((m) =>
    Object.values(m).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200">
          {/* Encabezado */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-700">
              Matrículas &gt; Gestión de Matrículas
            </h2>
          </div>

          {/* Barra de búsqueda y botón */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Buscar matrículas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Registrar nueva matrícula
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-6 py-3">ID Matrícula</th>
                  <th className="px-6 py-3">Preinscripción</th>
                  <th className="px-6 py-3">Clase</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Método de Pago</th>
                  <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((m) => (
                    <tr
                      key={m.id_matricula}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-3">{m.id_matricula}</td>
                      <td className="px-6 py-3">{m.id_preinscripcion}</td>
                      <td className="px-6 py-3">{m.id_clase}</td>
                      <td className="px-6 py-3">{m.id_plan}</td>
                      <td className="px-6 py-3">
                        {new Date(m.fecha_matricula).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">{m.valor_matricula}</td>
                      <td className="px-6 py-3">{m.id_metodo_pago}</td>
                      <td className="px-6 py-3 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id_matricula)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-gray-50 transition">
                    <td
                      colSpan="8"
                      className="text-center py-10 text-gray-400 italic"
                    >
                      No hay matrículas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal/Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg w-1/2 p-6 relative">
              <button
                onClick={resetForm}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4">
                {editId ? "Editar Matrícula" : "Registrar Matrícula"}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="id_preinscripcion"
                  placeholder="ID Preinscripción"
                  value={form.id_preinscripcion}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="id_clase"
                  placeholder="ID Clase"
                  value={form.id_clase}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="id_plan"
                  placeholder="ID Plan"
                  value={form.id_plan}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="id_metodo_pago"
                  placeholder="ID Método Pago"
                  value={form.id_metodo_pago}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="date"
                  name="fecha_matricula"
                  value={form.fecha_matricula}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                  required
                />
                <input
                  type="number"
                  name="valor_matricula"
                  placeholder="Valor Matrícula"
                  value={form.valor_matricula}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2"
                  required
                />

                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editId ? "Actualizar" : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Matriculas;