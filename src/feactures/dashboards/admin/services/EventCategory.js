import React, { useEffect, useState } from "react";
// Ajusta la ruta según dónde tengas EventCategory.js
import EventCategory from "../../EventCategory"; // <- revisa y corrige la ruta si hace falta

const Eventos = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("http://localhost:3000/getCategorias", { signal: controller.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // asume que la API devuelve un array de categorías
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error cargando categorías:", err);
                    setError(err.message || "Error al obtener categorías");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();

        return () => controller.abort();
    }, []);

    if (loading) return <div className="p-6">Cargando categorías...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    // Pasa las categorías al componente EventCategory
    return <EventCategory categoriesFromApi={categories} />;
};

export default Eventos;
