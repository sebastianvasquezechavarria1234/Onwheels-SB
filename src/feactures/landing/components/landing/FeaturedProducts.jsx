
import React, { useEffect, useState } from "react";
import { ArrowUpRight, Star, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../../services/api";

export const FeaturedProducts = () => {
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
        // Dummy badge logic for visual reference matching
        const badge = index === 0 ? "NEW" : index === 2 ? "SALE" : null;

        return (
            <Link
                to={`/store/product/${product?.id_producto}`}
                className="group flex flex-col gap-4 bg-transparent transition-all duration-300 hover:-translate-y-1"
            >
                {/* Image Container - Light */}
                <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm group-hover:border-(--color-blue)/50 transition-all">

                    {/* Badge */}
                    {badge && (
                        <span className={`absolute top-4 left-4 z-10 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm
                            ${badge === 'SALE' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}
                        `}>
                            {badge}
                        </span>
                    )}

                    <img
                        src={product?.imagen || "/bg_hero_shop.jpg"}
                        alt={product?.nombre_producto}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-slate-900 font-bold text-sm md:text-base leading-tight group-hover:text-(--color-blue) transition-colors">
                            {product?.nombre_producto}
                        </h3>
                        <span className="text-slate-900 font-mono font-bold text-sm">
                            ${new Intl.NumberFormat("es-CO").format(product?.precio_venta)}
                        </span>
                    </div>

                    {/* Stars / Subtitle */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} className="text-yellow-500 fill-yellow-500" />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-2">(12 reviews)</span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg hover:bg-(--color-blue) transition-all shadow-md z-20 relative"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log("Add to cart", product?.id_producto);
                        }}
                    >
                        Agregar <ShoppingBag size={12} />
                    </button>
                </div>
            </Link>
        );
    };

    return (
        <section className="bg-gray-50 py-24 px-4 relative z-0">
            {/* Background decorations - Lighter */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[60%] h-[300px] bg-(--color-blue)/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex flex-col items-center mb-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        Our Featured Items
                    </h2>
                    <p className="text-slate-500 max-w-lg text-sm md:text-base leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus faucibus massa dignissim tempus.
                    </p>
                </div>

                {/* Main Grid: Uniform 4 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col gap-4 animate-pulse">
                                <div className="aspect-square bg-slate-200 rounded-xl w-full" />
                                <div className="flex justify-between">
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                                </div>
                            </div>
                        ))
                    ) : (
                        products.map((product, index) => (
                            <ProductCard key={product.id_producto} product={product} index={index} />
                        ))
                    )}
                </div>

                <div className="flex justify-center mt-20">
                    <Link
                        to="/store"
                        className="
                            group flex items-center gap-2 px-8 py-3 
                            bg-slate-900 text-white font-bold uppercase tracking-widest text-xs rounded-full 
                            hover:bg-(--color-blue) hover:text-white transition-all shadow-lg hover:shadow-(--color-blue)/40
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
