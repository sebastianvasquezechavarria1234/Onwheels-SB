import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

/**
 * CartBadge Component
 * Displays a shopping cart icon with a numerical badge indicating the 
 * number of items currently in the cart.
 * 
 * @param {number} size - The size of the Lucide ShoppingCart icon.
 * @param {string} color - The color of the icon.
 */
export const CartBadge = ({ size = 20, color = "currentColor" }) => {
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;

  return (
    <div className="relative flex items-center justify-center">
      <ShoppingCart size={size} color={color} />
      
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            key={itemCount} // Key change triggers animation on count update
            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 shadow-lg border border-white/20"
            style={{ 
              zIndex: 10,
              boxShadow: "0 0 10px rgba(220, 38, 38, 0.4)"
            }}
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};
