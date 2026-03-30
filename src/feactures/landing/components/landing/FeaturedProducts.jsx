
import React, { useEffect, useState } from "react";
import { ArrowUpRight, Star, ShoppingBag, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import { useAuth } from "../../../dashboards/dinamico/context/AuthContext";
import { getStoreHomePath, getProductDetailPath } from "../../../../utils/roleHelpers";

export const FeaturedProducts = () => {
    const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get("/productos");
                // Limit to 4 items for the clean grid
                setProducts(res.data.slice(0, 4));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const ProductCard = ({ product, index }) => {
        // Correct image consumption
        const imageUrl = product.imagenes && product.imagenes.length > 0
            ? (product.imagenes[0].url_imagen?.startsWith('http') 
                ? product.imagenes[0].url_imagen 
                : `${API_URL}${product.imagenes[0].url_imagen}`)
            : "/bg_hero_shop.jpg";

        const hasDiscount = Number(product?.descuento_producto) > 0;
        const discountAmount = Number(product?.descuento_producto) || 0;
        const precioBase = Number(product?.precio) || 0;
        const precioFinal = hasDiscount ? precioBase * (1 - discountAmount / 100) : precioBase;

        return (
            <Link
                to={getProductDetailPath(user, product?.id_producto)}
                className="group relative flex flex-col bg-zinc-900/60 border border-zinc-800/50 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-blue)]/50 hover:shadow-2xl hover:shadow-[var(--color-blue)]/10"
            >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900/40">
                    <img
                        src={imageUrl}
                        alt={product?.nombre_producto}
                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60" />

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl shadow-red-900/20 border border-red-500/50 animate-pulse">
                                -{discountAmount}% OFF
                            </span>
                        </div>
                    )}
                </div>

                {/* Content - Compact */}
                <div className="p-4 md:p-6 pt-2 flex flex-col gap-2 md:gap-3">
                    <div className="space-y-0.5">
                        <span className="text-[var(--color-blue)] text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-80">Premium Gear</span>
                        <h3 className="text-white font-bold text-xs md:text-sm lg:text-base leading-tight group-hover:text-[var(--color-blue)] transition-colors line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                            {product?.nombre_producto}
                        </h3>
                    </div>

                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={9} className="text-yellow-500 fill-yellow-500" />
                            ))}
                            <span className="text-[9px] text-zinc-500 ml-1.5 font-bold uppercase tracking-widest">(12)</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-white font-mono font-black text-sm md:text-base">
                                ${new Intl.NumberFormat("es-CO").format(precioFinal)}
                            </span>
                            {hasDiscount && (
                                <span className="text-[9px] md:text-[10px] text-zinc-500 line-through font-bold opacity-70">
                                    ${new Intl.NumberFormat("es-CO").format(precioBase)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* CTA Button - Smaller */}
                    <div
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-black text-[9px] uppercase tracking-[0.2em] py-3 rounded-xl hover:bg-[var(--color-blue)] hover:text-white transition-all shadow-xl"
                    >
                        Ver Detalles <Eye size={12} />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <section className="bg-zinc-950 py-16 md:py-32 px-4 relative z-0 border-t border-zinc-900">
            {/* Background decorations - Lighter */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[60%] h-[300px] bg-[var(--color-blue)]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                {/* ... existing content ... */}
                <div className="flex flex-col items-center mb-10 md:mb-20 text-center space-y-4">
                    <span className="text-[var(--color-blue)] text-xs font-black uppercase tracking-[0.4em]">Performance Shop</span>
                    <h2 className="text-3xl sm:text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                        ITEMS <span className="text-zinc-800 italic">DESTACADOS</span>
                    </h2>
                    <p className="text-zinc-500 max-w-lg text-sm md:text-base font-medium leading-relaxed">
                        Equipamiento profesional seleccionado por nuestro equipo élite para maximizar tu progresión.
                    </p>
                </div>

                {/* Main Grid: Uniform 4 columns */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col gap-6 animate-pulse">
                                <div className="aspect-square bg-zinc-900 rounded-[2rem] w-full" />
                                <div className="space-y-3">
                                    <div className="h-4 bg-zinc-900 rounded w-3/4" />
                                    <div className="h-4 bg-zinc-900 rounded w-1/4" />
                                </div>
                            </div>
                        ))
                    ) : (
                        products.map((product, index) => (
                            <ProductCard key={product.id_producto} product={product} index={index} />
                        ))
                    )}
                </div>

                <div className="flex justify-center mt-10 md:mt-20">
                    <Link
                        to={getStoreHomePath(user)}
                        className="
                            group flex items-center gap-3 px-10 py-4 
                            bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-full 
                            hover:bg-[var(--color-blue)] hover:text-white transition-all shadow-2xl hover:shadow-[var(--color-blue)]/40
                        "
                    >
                        Ver Todo
                        <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
