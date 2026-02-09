
import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../../services/api";

export const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get("/productos");
                setProducts(res.data.slice(0, 4));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const BentoItem = ({ product, className }) => (
        <Link 
            to={`/store/product/${product?.id_producto}`} 
            className={`group relative overflow-hidden bg-zinc-900 rounded-2xl border border-white/5 hover:border-[var(--color-blue)] transition-all duration-500 ${className}`}
        >
            <img 
                src={product?.imagen || "/bg_hero_shop.jpg"} 
                alt={product?.nombre_producto} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <div className="flex justify-between items-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div>
                         <h3 className="text-lg font-bold text-white mb-0.5 leading-tight uppercase truncate max-w-[150px]">
                            {product?.nombre_producto}
                         </h3>
                         <p className="text-gray-400 text-xs line-clamp-1">{product?.descripcion}</p>
                    </div>
                    <div className="bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-blue)] hover:text-white scale-75">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
            </div>
            {/* Price Tag - Compact */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 group-hover:border-[var(--color-blue)] transition-colors">
                <span className="text-white text-xs font-mono font-bold">
                    ${new Intl.NumberFormat("es-CO").format(product?.precio_venta)}
                </span>
            </div>
        </Link>
    );

    return (
        <section className="bg-black py-16 px-4">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-end mb-8">
                     <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
                        Nuevos <span className="text-[var(--color-blue)]">Drops</span>
                     </h2>
                     <Link to="/store" className="text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold border-b border-gray-800 pb-1 hover:border-white">
                        Ver Todo
                     </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-auto md:h-[450px]">
                    {/* Main Featured Item (2x2) */}
                    {loading ? (
                         <div className="col-span-2 row-span-2 bg-zinc-900 animate-pulse rounded-2xl"></div>
                    ) : (
                         products[0] && <BentoItem product={products[0]} className="col-span-1 md:col-span-2 md:row-span-2 h-[300px] md:h-full" />
                    )}

                    {/* Secondary Items */}
                     <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-3 h-full">
                        {loading ? (
                            [1,2].map(i => <div key={i} className="bg-zinc-900 animate-pulse rounded-2xl h-[150px]"></div>)
                        ) : (
                            products.slice(1, 3).map(p => (
                                <BentoItem key={p.id_producto} product={p} className="h-[200px] md:h-full" />
                            ))
                        )}
                        {/* Last Item (Wide) */}
                        {loading ? (
                             <div className="col-span-2 bg-zinc-900 animate-pulse rounded-2xl"></div>
                        ) : (
                             products[3] && <BentoItem product={products[3]} className="col-span-2 h-[200px] md:h-full" />
                        )}
                     </div>
                </div>
            </div>
        </section>
    );
};
