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
    const [isLoaded, setIsLoaded] = useState(false);

    // Helper para obtener usuario actual
    const getCurrentUser = () => {
        try {
            const userStr = localStorage.getItem("user");
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    };

    // Helper para obtener key del storage
    const getStorageKey = (specificUser = null) => {
        const user = specificUser || getCurrentUser();
        if (user) {
            return `shopping-cart-${user.id_usuario || user.id}`;
        }
        return "shopping-cart-guest";
    };

    // Cargar carrito
    const loadCart = () => {
        const key = getStorageKey();
        const savedCart = localStorage.getItem(key);

        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
                setCart({ items: [], total: 0, itemCount: 0 });
            }
        } else {
            setCart({ items: [], total: 0, itemCount: 0 });
        }
        setIsLoaded(true);
    };

    // Efecto inicial y escucha de cambios de auth/storage
    useEffect(() => {
        loadCart();

        const handleStorageChange = (e) => {
            // Si cambia el usuario (login/logout) o el carrito en otra pestaña
            if (e.key === "user" || e.key === "token" || (e.key && e.key.startsWith("shopping-cart"))) {
                loadCart();
            }
        };

        // Custom event para forzar recarga (login/logout desde app)
        const handleAuthChange = () => loadCart();

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("authChanged", handleAuthChange); // Disparar este evento al hacer login/logout
        window.addEventListener("cartUpdated", loadCart);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("authChanged", handleAuthChange);
            window.removeEventListener("cartUpdated", loadCart);
        };
    }, []);

    // Guardar carrito al cambiar
    useEffect(() => {
        if (!isLoaded) return;
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(cart));
    }, [cart, isLoaded]);

    // Calcular totales
    const calculateTotals = (items) => {
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
        return { items, total, itemCount };
    };

    // Agregar item
    const addToCart = (product, variant, quantity = 1) => {
        // Validation Logic (Outside checking against current state to prevent render crash)
        const currentItems = cart.items;
        const variantId = variant?.id_variante || product.id_producto;
        const existingItem = currentItems.find((item) => item.id_variante === variantId);
        const maxStock = variant?.stock || product.stock || 999;

        if (existingItem) {
            const newQty = existingItem.qty + quantity;
            if (newQty > maxStock) {
                throw new Error(`No puedes agregar más de ${maxStock} unidades.`);
            }
        } else {
            // New item check (usually 1, but just in case)
            if (quantity > maxStock) {
                throw new Error(`No puedes agregar más de ${maxStock} unidades.`);
            }
        }

        setCart((prev) => {
            const currentItems = [...prev.items];
            const existingItemIndex = currentItems.findIndex(
                (item) => item.id_variante === variantId
            );

            if (existingItemIndex > -1) {
                // Actualizar cantidad
                const newQty = currentItems[existingItemIndex].qty + quantity;
                // Double check inside (clamping instead of throwing to be safe)
                if (newQty > maxStock) return prev;

                currentItems[existingItemIndex] = {
                    ...currentItems[existingItemIndex],
                    qty: newQty,
                };
            } else {
                // Nuevo item
                currentItems.push({
                    ...product, // Info producto base
                    ...variant, // Info variante (sobreescribe stock especifico, precio si aplica)
                    id_variante: variantId,
                    nombre_producto: product.nombre_producto, // Asegurar nombre base
                    id_producto: product.id_producto,
                    qty: quantity,
                    price: Number(product.precio_venta), // Precio base
                    imagen: product.imagen // Imagen base (podría ser de variante si existiera)
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
                const item = currentItems[index];
                const maxStock = item.stock || 999;

                if (quantity > maxStock) {
                    // No actualizamos si supera stock
                    return prev;
                }

                currentItems[index] = { ...item, qty: quantity };
                return calculateTotals(currentItems);
            }
            return prev;
        });
    };

    // Limpiar carrito
    const clearCart = () => {
        setCart({ items: [], total: 0, itemCount: 0 });
    };

    // Fusionar carrito de invitado al iniciar sesión
    const mergeGuestCart = (user) => {
        if (!user) return;

        const guestKey = "shopping-cart-guest";
        const guestCartStr = localStorage.getItem(guestKey);

        if (!guestCartStr) {
            // Si no hay carrito de invitado, solo cargamos el del usuario
            loadCart();
            return;
        }

        try {
            const guestCart = JSON.parse(guestCartStr);
            if (guestCart.items.length === 0) {
                loadCart();
                return;
            }

            const userKey = getStorageKey(user);
            const userCartStr = localStorage.getItem(userKey);
            let userCart = userCartStr ? JSON.parse(userCartStr) : { items: [], total: 0, itemCount: 0 };

            // Merge items
            guestCart.items.forEach(guestItem => {
                const existingIndex = userCart.items.findIndex(ui => ui.id_variante === guestItem.id_variante);
                if (existingIndex > -1) {
                    // Sumar cantidades, respetando stock si es posible (simple check here)
                    userCart.items[existingIndex].qty += guestItem.qty;
                } else {
                    userCart.items.push(guestItem);
                }
            });

            // Recalculate totals
            userCart = calculateTotals(userCart.items);

            // Save new user cart
            localStorage.setItem(userKey, JSON.stringify(userCart));

            // Clear guest cart
            localStorage.removeItem(guestKey);

            // Update state
            setCart(userCart);

        } catch (e) {
            console.error("Error merging carts:", e);
        }
    };

    // Listen for login event to merge cart
    useEffect(() => {
        const handleLoginMerge = (e) => {
            if (e.detail) {
                mergeGuestCart(e.detail);
            }
        };

        window.addEventListener("auth:login", handleLoginMerge);
        return () => window.removeEventListener("auth:login", handleLoginMerge);
    }, []);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                mergeGuestCart, // Exposed for AuthContext
                isLoaded
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
