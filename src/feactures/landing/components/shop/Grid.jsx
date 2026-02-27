import React, { useEffect, useState } from "react";
import { Card } from "./Card";
import { FilterBar } from "./FilterBar";

export const Grid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

    const categories = Array.from(
        new Set(products.map(p => p.nombre_categoria).filter(Boolean))
    );

    const filteredProducts = products.filter(p => {
        const matchSearch = p.nombre_producto
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchCategory = selectedCategory
            ? p.nombre_categoria === selectedCategory
            : true;

        let matchPrice = true;
        if (selectedPriceRange) {
            const price = Number(p.precio_venta) || 0;
            const [min, max] = selectedPriceRange.split("-").map(Number);
            if (max) {
                matchPrice = price >= min && price <= max;
            } else {
                matchPrice = price >= min;
            }
        }

        return matchSearch && matchCategory && matchPrice;
    });

    return (
        <section id="products" className="w-full bg-[#0B0F14] pt-24 pb-24 transition-colors duration-500 text-white">
            <div className="max-w-[1500px] mx-auto px-6 md:px-10">

                <div className="mb-16 text-center flex flex-col items-center">

                    <h2 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9] mb-6 text-white">
                        EXPLORA
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#DC2626]">
                            NUESTROS PRODUCTOS
                        </span>
                    </h2>

                    <p className="text-[#9CA3AF] text-xl md:text-2xl max-w-3xl leading-relaxed font-semibold">
                        Equipamiento y estilo diseñados para la vida urbana.
                        Calidad, resistencia y actitud en cada detalle.
                    </p>

                </div>

                {/* FILTER BAR con más presencia */}
                <div className="mb-14 bg-[#121821] border border-gray-800/50 rounded-2xl shadow-lg p-6 md:p-8">
                    <FilterBar
                        search={search}
                        setSearch={setSearch}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedPriceRange={selectedPriceRange}
                        setSelectedPriceRange={setSelectedPriceRange}
                    />
                </div>

                {/* GRID */}
                {loading ? (
                    <div className="py-24 text-center text-[#9CA3AF]">
                        Cargando productos...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-24 text-center text-[#9CA3AF] bg-[#121821] rounded-2xl border border-gray-800/50">
                        No se encontraron productos con estos filtros.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {filteredProducts.map((p) => (
                            <Card key={p.id_producto} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
