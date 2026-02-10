import React, { useState } from "react";
import { Search, Funnel, ChevronDown, ChevronUp } from "lucide-react";

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group"
      >
        <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">{title}</span>
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[300px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

export const FilterSidebar = ({
  search,
  setSearch,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
}) => {
  return (
    <div className="w-[25%] max-md:w-full">
      <div className="sticky top-[120px] bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200">
            <Funnel size={18} strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">Filtros</h4>
            <p className="text-xs text-gray-500 font-medium">Refina tu búsqueda</p>
          </div>
        </div>

        <div className="flex flex-col">
          {/* Search */}
          <div className="relative mb-6">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all shadow-inner"
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <FilterSection title="Categoría">
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ""}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-5 h-5 border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className={`text-sm ${selectedCategory === "" ? "font-bold text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>Todas</span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-5 h-5 border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className={`text-sm ${selectedCategory === cat ? "font-bold text-gray-900" : "text-gray-600 group-hover:text-gray-900"}`}>{cat}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Filter */}
          <FilterSection title="Precio">
            <select
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all appearance-none"
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
            >
              <option value="">Cualquier precio</option>
              <option value="0-50000">Menos de $50k</option>
              <option value="50000-100000">$50k - $100k</option>
              <option value="100000-200000">$100k - $200k</option>
              <option value="200000-999999999">Más de $200k</option>
            </select>
          </FilterSection>
        </div>
      </div>
    </div>
  );
};
