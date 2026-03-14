import React from "react";
import { Play } from "lucide-react";

export const CommunityReels = () => {
  const videos = [
    { id: "jwL2x9AI62s", desc: "Elite Training", user: "@onwheels_sb" },
    { id: "LW6xlv_RzYw", desc: "Street Session", user: "@skate_life" },
    { id: "qetM-uesIL8", desc: "Pro Tricks", user: "@pro_skater" },
    { id: "Fenv2Q_7iwM", desc: "Night Ride", user: "@onwheels_community" },
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
        <div className="hidden md:block h-px flex-1 bg-zinc-800 mx-8 mb-4"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {videos.map((video, i) => (
            <div
              key={i}
              className="relative group w-full aspect-[9/16] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 hover:border-[var(--color-blue)] transition-all shadow-2xl"
            >
              {/* YouTube Embed */}
              <iframe
                className="w-full h-full object-cover"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=0&controls=1&rel=0&modestbranding=1`}
                title={video.desc}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              {/* Overlay subtle gradient - Modified for iframe visibility */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

              <div className="absolute bottom-4 left-4 pointer-events-none z-20">
                <h4 className="text-xs font-black text-white uppercase tracking-wider drop-shadow-lg mb-0.5">
                  {video.desc}
                </h4>
                <p className="text-[10px] text-[var(--color-blue)] font-bold drop-shadow-md">
                  {video.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
