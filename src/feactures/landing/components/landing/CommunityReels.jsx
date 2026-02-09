
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play } from 'lucide-react';

export const CommunityReels = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

    const videos = [
        { src: "/vd_landing1.mp4", desc: "Parque", user: "@skater_01" },
        { src: "/vd_landing2.mp4", desc: "Urbano", user: "@city" },
        { src: "/vd_landing3.mp4", desc: "Torneo", user: "@pro" },
        { src: "/vd_landing1.mp4", desc: "Night", user: "@owl" },
    ];

    return (
        <section className="bg-black py-24 border-t border-zinc-900">
            <div className="max-w-[1200px] mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-6 text-center md:text-left">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        Community <span className="text-[var(--color-blue)]">Reels</span>
                    </h2>
                    <p className="text-zinc-400 text-sm max-w-[400px]">
                        Los mejores momentos de nuestra comunidad. Etiquétanos para aparecer aquí.
                    </p>
                </div>
                <div className="hidden md:block h-[1px] flex-1 bg-zinc-800 mx-8 mb-4"></div>
            </div>

            {/* Static Grid - Professional & Clean */}
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {videos.map((video, i) => (
                        <div
                            key={i}
                            className="relative group w-full aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-[var(--color-blue)] transition-all shadow-lg"
                        >
                            <video
                                className="w-full h-full object-cover"
                                src={video.src}
                                controls
                                preload="metadata"
                                poster="/bg_hero_shop.jpg" // Fallback poster if available, or just black
                            />

                            {/* Overlay info - Visible only when paused or initial? 
                                Native controls might hide this. 
                                Let's keep a subtle gradient at bottom for text if controls don't overlay it.
                                Actually with native controls, overlays can get in the way. 
                                Let's put info BELOW the video or strictly overlay with pointer-events-none.
                            */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100" />

                            <div className="absolute bottom-3 left-3 pointer-events-none">
                                <h4 className="text-xs font-bold text-white drop-shadow-md">{video.desc}</h4>
                                <p className="text-[10px] text-zinc-300 drop-shadow-md">{video.user}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
