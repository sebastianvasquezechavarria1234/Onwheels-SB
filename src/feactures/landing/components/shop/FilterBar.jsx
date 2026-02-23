import React from "react";
import { Search, Funnel, Grid, List, ChevronDown } from "lucide-react";

export const FilterBar = ({
    search,
    setSearch,
    categories = [],
    selectedCategory,
    setSelectedCategory,
    selectedPriceRange,
    setSelectedPriceRange,
}) => {
    return (
        <div className=" top-[100px] z-10 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left: Search & Label */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-gray-900">
                        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                            <Funnel size={14} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide hidden sm:block">Filtros</span>
                    </div>

                    <div className="relative flex-1 md:w-[250px]">
                        <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-black focus:border-black block pl-10 p-2.5 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Right: Dropdowns */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                    {/* Category Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl focus:ring-black focus:border-black block w-auto pl-4 pr-10 py-2.5 cursor-pointer hover:border-gray-300 transition-all"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Price Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedPriceRange}
                            onChange={(e) => setSelectedPriceRange(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl focus:ring-black focus:border-black block w-auto pl-4 pr-10 py-2.5 cursor-pointer hover:border-gray-300 transition-all"
                        >
                            <option value="">Cualquier precio</option>
                            <option value="0-50000">Menoste $50k</option>
                            <option value="50000-100000">$50k - $100k</option>
                            <option value="100000-200000">$100k - $200k</option>
                            <option value="200000-999999999">Mayor a $200k</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

            </div>
        </div>
    );
};
