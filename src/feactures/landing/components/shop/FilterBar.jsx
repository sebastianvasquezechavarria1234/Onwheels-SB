import React, { useState, useRef, useEffect } from "react";
import { Search, Funnel, ChevronDown, Check } from "lucide-react";

const CustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || { label: placeholder };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full sm:min-w-[200px] bg-[#0B0F14] border ${isOpen ? "border-[#1E3A8A] ring-1 ring-[#1E3A8A]" : "border-gray-800 hover:border-gray-700"} text-sm font-medium rounded-xl px-4 py-2.5 transition-all outline-none`}
            >
                <span className={value ? "text-white truncate pr-2" : "text-[#9CA3AF] truncate pr-2"}>{selectedOption.label}</span>
                <ChevronDown className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#1E3A8A]" : ""}`} size={16} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#121821] border border-gray-800 rounded-xl shadow-2xl shadow-black/80 z-50 overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar">
                    <button
                        type="button"
                        onClick={() => { onChange(""); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-800 flex items-center justify-between ${value === "" ? "text-white font-bold" : "text-[#9CA3AF]"}`}
                    >
                        {placeholder}
                        {value === "" && <Check size={14} className="text-[#1E3A8A]" />}
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-800 flex items-center justify-between ${value === opt.value ? "text-white font-bold" : "text-[#9CA3AF]"}`}
                        >
                            {opt.label}
                            {value === opt.value && <Check size={14} className="text-[#1E3A8A]" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FilterBar = ({
    search,
    setSearch,
    categories = [],
    selectedCategory,
    setSelectedCategory,
    selectedPriceRange,
    setSelectedPriceRange,
}) => {
    const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));
    const priceOptions = [
        { value: "0-50000", label: "Menos de $50,000" },
        { value: "50000-100000", label: "$50,000 - $100,000" },
        { value: "100000-200000", label: "$100,000 - $200,000" },
        { value: "200000-999999999", label: "Mayor a $200,000" }
    ];

    return (
        <div className="top-[100px] z-20 bg-[#121821]/95 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-lg shadow-black/20 border border-gray-800/80 mb-8 w-full transition-all">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">

                {/* Left: Search & Label */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-3 text-white self-start sm:self-auto shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center border border-[#1E3A8A]/20">
                            <Funnel size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider text-white">Filtros</span>
                    </div>

                    <div className="relative w-full sm:w-[300px] group">
                        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 group-focus-within:text-[#1E3A8A] transition-colors" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre..."
                            className="w-full h-11 bg-[#0B0F14] border border-gray-800 text-white text-sm rounded-xl focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] block pl-12 pr-4 transition-all outline-none placeholder-[#9CA3AF] shadow-inner"
                        />
                    </div>
                </div>

                {/* Right: Dropdowns */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
                    <div className="w-full sm:w-auto z-[60]">
                        <CustomSelect
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categoryOptions}
                            placeholder="Categorías"
                        />
                    </div>
                    <div className="w-full sm:w-auto z-[50]">
                        <CustomSelect
                            value={selectedPriceRange}
                            onChange={setSelectedPriceRange}
                            options={priceOptions}
                            placeholder="Rango de Precio"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};
