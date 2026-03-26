import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { configUi, cn } from "./configUi";

const FilterDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Filtrar por", 
  icon: Icon = SlidersHorizontal,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 items-center gap-3 rounded-2xl border px-4 transition-all duration-300",
          isOpen || selectedOption 
            ? "border-[#7da7e8] bg-[#f0f7ff] ring-4 ring-[#dbeafe]" 
            : "border-[#bfd1f4] bg-white hover:border-[#9fbce7] hover:bg-[#f8fbff]",
          "w-full sm:w-auto min-w-[160px]"
        )}
      >
        <Icon 
          size={18} 
          className={cn(
            "transition-colors duration-300",
            selectedOption ? "text-[#1d4f91]" : "text-[#6a85ad]"
          )} 
        />
        
        <span className={cn(
          "flex-1 text-left text-sm font-bold truncate",
          selectedOption ? "text-[#16315f]" : "text-[#86a0c6]"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown 
          size={16} 
          className={cn(
            "text-[#6a85ad] transition-transform duration-300",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+8px)] z-[100] w-full min-w-[220px] overflow-hidden rounded-2xl border border-[#d7e5f8] bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(20,35,70,0.3)] backdrop-blur-sm sm:left-auto sm:right-0"
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                    value === option.value
                      ? "bg-[#edf5ff] text-[#1d4f91]"
                      : "text-[#587399] hover:bg-[#f8fbff] hover:text-[#16315f]"
                  )}
                >
                  {/* Indicator or Icon if provided */}
                  {option.color ? (
                    <div 
                      className="h-2 w-2 rounded-full shadow-sm" 
                      style={{ backgroundColor: option.color }}
                    />
                  ) : option.icon ? (
                    <option.icon size={16} className="opacity-70" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                  )}

                  <span className="flex-1 text-[13px] font-bold">
                    {option.label}
                  </span>

                  {value === option.value && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d4f91] text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
