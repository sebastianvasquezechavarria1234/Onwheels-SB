
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
        <section ref={containerRef} className="bg-black py-20 overflow-hidden relative border-t border-zinc-900">

            <div className="max-w-[1200px] mx-auto px-6 mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                    Comunidad <span className="text-[var(--color-blue)]">OnWheels</span>
                </h2>
            </div>

            {/* Film Strip - Smaller */}
            <motion.div
                style={{ x }}
                className="flex gap-4 px-6 w-max"
            >
                {videos.map((video, i) => (
                    <div
                        key={i}
                        className="relative group w-[200px] md:w-[260px] aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-[var(--color-blue)] transition-all transform hover:scale-105 duration-300 shadow-xl"
                    >
                        <video
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                            src={video.src}
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.target.play()}
                            onMouseLeave={(e) => {
                                e.target.pause();
                                e.target.currentTime = 0;
                            }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-sm font-bold text-white">{video.desc}</h4>
                                    <p className="text-[10px] text-gray-400">{video.user}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                    <Play size={12} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </section>
    );
};
