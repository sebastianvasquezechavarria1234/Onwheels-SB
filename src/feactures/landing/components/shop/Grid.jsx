import React, { useEffect, useState } from "react";
import { Card } from "./Card";
import { FilterSidebar } from "./FilterSidebar";
import { Funnel, Search } from "lucide-react";


export const Grid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Estados para filtros
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPriceRange, setSelectedPriceRange] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/productos");
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                } else {
                    console.error("Error fetching products");
                }
            } catch (error) {
                console.error("Connection error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // 1. Obtener categorías únicas dinámicamente
    const categories = Array.from(new Set(products.map(p => p.nombre_categoria).filter(Boolean)));

    // 2. Lógica de filtrado combinada
    const filteredProducts = products.filter(p => {
        // Filtro texto (nombre)
        const matchSearch = p.nombre_producto?.toLowerCase().includes(search.toLowerCase());

        // Filtro Categoría
        const matchCategory = selectedCategory ? p.nombre_categoria === selectedCategory : true;

        // Filtro Precio
        let matchPrice = true;
        if (selectedPriceRange) {
            const price = Number(p.precio_venta) || 0;
            const [min, max] = selectedPriceRange.split("-").map(Number);
            if (max) {
                matchPrice = price >= min && price <= max;
            } else {
                matchPrice = price >= min; // Caso "Mayor a X"
            }
        }

        return matchSearch && matchCategory && matchPrice;
    });

    return (
        <>
            <section className="mt-[120px] max-w-[1500px] mx-auto p-[20px] max-md:p-[10px] max-md:mt-[30px] min-h-[60vh]">
                <div className="flex gap-[20px] max-md:gap-[10px] max-md:flex-col">
                    {/* Filtros */}
                    {/* Filtros */}
                    <FilterSidebar
                        search={search}
                        setSearch={setSearch}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedPriceRange={selectedPriceRange}
                        setSelectedPriceRange={setSelectedPriceRange}
                    />

                    {/* Grid */}
                    <div className="flex-1 max-md:w-full">
                        <h3 className="opacity-70 mb-[30px]">Explora
                            <span className="font-primary mx-[10px]">Nuestros productos</span>
                            creados para la vida
                            <span className="font-primary mx-[10px]">sobre ruedas...</span>
                        </h3>

                        {loading ? (
                            <div className="py-20 text-center text-gray-500">Cargando productos...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-xl">
                                No se encontraron productos con estos filtros.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-[20px] max-2xl:gap-[10px] max-xl:grid-cols-2 max-sm:grid-cols-1">
                                {filteredProducts.map((p) => (
                                    <Card key={p.id_producto} product={p} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}