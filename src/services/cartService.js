// Cart Service - Manejo del carrito de compras con localStorage
// Basado en la lógica de Ventas para mantener consistencia

const CART_STORAGE_KEY = 'onwheels_cart';

// Estructura del carrito:
// {
//   items: [
//     {
//       id_producto: number,
//       nombre_producto: string,
//       id_variante: number,
//       id_color: number,
//       nombre_color: string,
//       codigo_hex: string,
//       id_talla: number,
//       nombre_talla: string,
//       qty: number,
//       price: number,
//       imagen: string,
//       stockMax: number
//     }
//   ],
//   total: number,
//   itemCount: number
// }

/**
 * Obtener el carrito actual del localStorage
 */
export const getCart = () => {
    try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY);
        if (!cartData) {
            return { items: [], total: 0, itemCount: 0 };
        }
        return JSON.parse(cartData);
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        return { items: [], total: 0, itemCount: 0 };
    }
};

/**
 * Guardar el carrito en localStorage
 */
const saveCart = (cart) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        // Disparar evento personalizado para que los componentes se actualicen
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
        console.error('Error al guardar carrito:', error);
    }
};

/**
 * Calcular totales del carrito
 */
const calculateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    return { total, itemCount };
};

/**
 * Agregar producto al carrito
 * @param {Object} product - Producto con toda la información
 * @param {Object} variant - Variante seleccionada (color, talla, stock)
 * @param {number} quantity - Cantidad a agregar
 */
export const addToCart = (product, variant, quantity = 1) => {
    const cart = getCart();

    // Buscar si ya existe este producto con esta variante
    const existingItemIndex = cart.items.findIndex(
        item => item.id_producto === product.id_producto &&
            item.id_variante === variant.id_variante
    );

    if (existingItemIndex !== -1) {
        // Ya existe, actualizar cantidad
        const newQty = cart.items[existingItemIndex].qty + quantity;

        // Validar stock
        if (newQty > variant.stock) {
            throw new Error(`Stock insuficiente. Disponible: ${variant.stock}`);
        }

        cart.items[existingItemIndex].qty = newQty;
    } else {
        // No existe, agregar nuevo item
        if (quantity > variant.stock) {
            throw new Error(`Stock insuficiente. Disponible: ${variant.stock}`);
        }

        cart.items.push({
            id_producto: product.id_producto,
            nombre_producto: product.nombre_producto,
            id_variante: variant.id_variante,
            id_color: variant.id_color,
            nombre_color: variant.nombre_color,
            codigo_hex: variant.codigo_hex || '#000000',
            id_talla: variant.id_talla,
            nombre_talla: variant.nombre_talla,
            qty: quantity,
            price: product.precio_venta,
            imagen: product.imagen || product.imagenes?.[0]?.imagen_url || '',
            stockMax: variant.stock
        });
    }

    // Recalcular totales
    const totals = calculateTotals(cart.items);
    cart.total = totals.total;
    cart.itemCount = totals.itemCount;

    saveCart(cart);
    return cart;
};

/**
 * Actualizar cantidad de un item
 * @param {number} id_variante - ID de la variante
 * @param {number} newQty - Nueva cantidad
 */
export const updateQuantity = (id_variante, newQty) => {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.id_variante === id_variante);

    if (itemIndex === -1) {
        throw new Error('Producto no encontrado en el carrito');
    }

    if (newQty <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
    }

    if (newQty > cart.items[itemIndex].stockMax) {
        throw new Error(`Stock insuficiente. Disponible: ${cart.items[itemIndex].stockMax}`);
    }

    cart.items[itemIndex].qty = newQty;

    // Recalcular totales
    const totals = calculateTotals(cart.items);
    cart.total = totals.total;
    cart.itemCount = totals.itemCount;

    saveCart(cart);
    return cart;
};

/**
 * Eliminar item del carrito
 * @param {number} id_variante - ID de la variante a eliminar
 */
export const removeFromCart = (id_variante) => {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.id_variante !== id_variante);

    // Recalcular totales
    const totals = calculateTotals(cart.items);
    cart.total = totals.total;
    cart.itemCount = totals.itemCount;

    saveCart(cart);
    return cart;
};

/**
 * Limpiar todo el carrito
 */
export const clearCart = () => {
    const emptyCart = { items: [], total: 0, itemCount: 0 };
    saveCart(emptyCart);
    return emptyCart;
};

/**
 * Obtener cantidad de items en el carrito
 */
export const getCartItemCount = () => {
    const cart = getCart();
    return cart.itemCount || 0;
};

/**
 * Verificar si un producto/variante está en el carrito
 */
export const isInCart = (id_variante) => {
    const cart = getCart();
    return cart.items.some(item => item.id_variante === id_variante);
};

/**
 * Obtener cantidad de un producto específico en el carrito
 */
export const getItemQuantity = (id_variante) => {
    const cart = getCart();
    const item = cart.items.find(item => item.id_variante === id_variante);
    return item ? item.qty : 0;
};
