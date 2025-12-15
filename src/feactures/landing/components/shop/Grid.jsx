import React, { useEffect, useState } from "react";
import { Card } from "./Card";
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
                    <div className="w-[20%] max-md:w-full">
                        <form className="sticky top-[100px] border-y border-black/30 py-[20px]" onSubmit={e => e.preventDefault()}>
                            <div className="flex items-center gap-[10px] mb-[20px]">
                                <span className="w-[60px] h-[60px] flex justify-center items-center bg-gray-200 rounded-full max-md:w-[30px] max-md:h-[30px]">
                                    <Funnel color="#333" strokeWidth={1.3} />
                                </span>
                                <h4 className="font-primary">Filtros</h4>
                            </div>
                            
                            <div className="flex flex-col max-md:flex-row max-md:items-center max-md:gap-[10px] flex-wrap">
                                {/* Search */}
                                <label className="mb-[20px] block w-full">
                                    <p className="mb-2 font-medium">Buscar:</p>
                                    <div className="relative">
                                        <Search className="absolute top-[50%] left-[15px] translate-y-[-50%] text-gray-400" size={18} />
                                        <input
                                            className="input pl-[40px]! w-full"
                                            type="text"
                                            placeholder="Ej: Camisa..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </label>

                                {/* Category Filter */}
                                <label className="mb-[20px] block w-full">
                                    <p className="mb-2 font-medium">Categoría:</p>
                                    <select 
                                        className="input w-full cursor-pointer" 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </label>

                                {/* Price Filter */}
                                <label className="mb-[20px] block w-full">
                                    <p className="mb-2 font-medium">Precio:</p>
                                    <select 
                                        className="input w-full cursor-pointer"
                                        value={selectedPriceRange}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        <option value="0-50000">$0 - $50.000</option>
                                        <option value="50000-100000">$50.000 - $100.000</option>
                                        <option value="100000-200000">$100.000 - $200.000</option>
                                        <option value="200000-999999999">Más de $200.000</option>
                                    </select>
                                </label>
                            </div>
                        </form>
                    </div>

                    {/* Grid */}
                    <div className="w-[80%] max-md:w-full">
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