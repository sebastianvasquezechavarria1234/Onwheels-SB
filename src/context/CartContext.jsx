import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe ser usado dentro de un CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });

    // Cargar carrito al iniciar y escuchar cambios externos
    useEffect(() => {
        const loadCart = () => {
            const savedCart = localStorage.getItem("shopping-cart");
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Error parsing cart:", e);
                }
            }
        };

        loadCart();

        const handleStorageChange = (e) => {
            if (e.key === "shopping-cart") {
                loadCart();
            }
        };

        // Escuchar eventos de otras pestañas o componentes legado
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("cartUpdated", loadCart); // Para compatibilidad con cartService.js

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("cartUpdated", loadCart);
        };
    }, []);

    // Guardar carrito al cambiar
    useEffect(() => {
        localStorage.setItem("shopping-cart", JSON.stringify(cart));
    }, [cart]);

    // Agregar item
    const addToCart = (product, quantity = 1) => {
        setCart((prev) => {
            const currentItems = [...prev.items];

            // La clave única es id_variante
            const existingItemIndex = currentItems.findIndex(
                (item) => item.id_variante === product.id_variante
            );

            if (existingItemIndex > -1) {
                // Actualizar cantidad
                const newQty = currentItems[existingItemIndex].qty + quantity;

                // Validación básica de stock (si el producto trae datos de stock)
                if (product.stock && newQty > product.stock) {
                    // Opcional: Notificar error si hay sistema de notificaciones
                    console.warn("Stock insuficiente");
                    return prev;
                }

                currentItems[existingItemIndex] = {
                    ...currentItems[existingItemIndex],
                    qty: newQty,
                };
            } else {
                // Nuevo item
                currentItems.push({
                    ...product,
                    qty: quantity,
                    price: Number(product.precio_venta) || 0, // Asegurar numero
                });
            }

            return calculateTotals(currentItems);
        });
    };

    // Remover item
    const removeFromCart = (id_variante) => {
        setCart((prev) => {
            const newItems = prev.items.filter((item) => item.id_variante !== id_variante);
            return calculateTotals(newItems);
        });
    };

    // Actualizar cantidad exacta
    const updateQuantity = (id_variante, quantity) => {
        if (quantity < 1) return;

        setCart((prev) => {
            const currentItems = [...prev.items];
            const index = currentItems.findIndex((item) => item.id_variante === id_variante);

            if (index > -1) {
                // Validación Stock
                if (currentItems[index].stock && quantity > currentItems[index].stock) {
                    console.warn("Stock insuficiente");
                    quantity = currentItems[index].stock;
                }

                currentItems[index] = { ...currentItems[index], qty: quantity };
                return calculateTotals(currentItems);
            }
            return prev;
        });
    };

    // Limpiar carrito
    const clearCart = () => {
        setCart({ items: [], total: 0, itemCount: 0 });
    };

    // Calcular totales
    const calculateTotals = (items) => {
        const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
        return { items, total, itemCount };
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
