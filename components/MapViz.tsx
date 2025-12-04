import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { TransportMode } from '../types';

interface MapVizProps {
  locationQuery: string;
  placeImage?: string | null;
  onManualLocationChange?: (location: string) => void;
  transportMode?: TransportMode;
}

export const MapViz: React.FC<MapVizProps> = ({ 
  locationQuery, 
  placeImage, 
  onManualLocationChange,
  transportMode 
}) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // Re-open overlay when location changes from props
  useEffect(() => {
    if (locationQuery && locationQuery !== "World") {
        setShowOverlay(true);
        setSearchInput(locationQuery);
    }
  }, [locationQuery]);

  const handleManualSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim() && onManualLocationChange) {
          onManualLocationChange(searchInput);
      }
  };

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;

  // Mock data to simulate the Google Maps Places API detail view
  const rating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
  const reviews = Math.floor(Math.random() * 1000) + 50;

  return (
    <GlassCard className="w-full h-full p-0 !rounded-3xl border-cyan-500/20 neon-border relative group overflow-hidden">
      
      {/* MAP IFRAME LAYER */}
      <div className="w-full h-full rounded-2xl overflow-hidden relative bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%) grayscale(20%)' }}
          src={mapUrl}
          allowFullScreen
          title="Map"
          className="relative z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        ></iframe>
      </div>

      {/* FLIGHT PATH VISUALIZATION OVERLAY */}
      {transportMode === TransportMode.FLIGHT && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* Radar Scan Effect */}
          <div className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite] opacity-10">
             <div className="w-[150%] h-[150%] -ml-[25%] -mt-[25%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,255,255,0.2)_60deg,transparent_65deg)] rounded-full"></div>
          </div>

          {/* Flight Path SVG */}
          <svg className="absolute inset-0 w-full h-full">
             <defs>
               <linearGradient id="flightGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
                 <stop offset="100%" stopColor="#22d3ee" />
               </linearGradient>
               <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                 <feMerge>
                   <feMergeNode in="coloredBlur" />
                   <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
             </defs>
             
             {/* The Path Line */}
             <path 
               d="M -50 400 Q 150 350, 400 200 T 900 100" // Simplified bezier curve from bottom-left to top-right
               fill="none" 
               stroke="url(#flightGradient)" 
               strokeWidth="3"
               strokeDasharray="10,5"
               filter="url(#glow)"
               className="opacity-70 animate-[dash_20s_linear_infinite]"
             >
               <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="30s" repeatCount="indefinite" />
             </path>

             {/* Animated Plane Icon along the path */}
             <g>
                <path 
                  d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                  fill="#22d3ee"
                  filter="url(#glow)"
                >
                  <animateMotion 
                    dur="10s" 
                    repeatCount="indefinite" 
                    path="M -50 400 Q 150 350, 400 200 T 900 100"
                    rotate="auto"
                  />
                </path>
             </g>
          </svg>

          {/* Telemetry Data HUD */}
          <div className="absolute top-4 right-1/2 translate-x-1/2 flex gap-8">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">Altitude</span>
                <span className="text-xl font-bold text-cyan-400 font-oswald animate-pulse">32,000<span className="text-xs ml-1 font-normal">FT</span></span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">Speed</span>
                <span className="text-xl font-bold text-cyan-400 font-oswald">540<span className="text-xs ml-1 font-normal">KTS</span></span>
             </div>
          </div>
        </div>
      )}
      
      {/* Google Maps Input Overlay (Top Left) */}
      <div className="absolute top-4 left-4 right-16 z-40 max-w-sm">
         <form onSubmit={handleManualSearch} className="relative group/input">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
            </div>
            <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-black/70 text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-black/90 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm backdrop-blur-md shadow-lg transition-all"
                placeholder="Buscar en Google Maps..."
            />
            <button type="submit" className="absolute inset-y-0 right-0 px-3 flex items-center bg-white/5 hover:bg-white/10 rounded-r-lg border-l border-white/10 transition-colors">
                <span className="text-xs text-cyan-400 font-bold">IR</span>
            </button>
         </form>
      </div>

      {/* MODULAR WINDOW (Place Details Overlay) */}
      {showOverlay && locationQuery !== "World" && (
        <div className="absolute top-16 left-4 bottom-4 w-80 z-30 animate-in slide-in-from-left-4 fade-in duration-500">
          <GlassCard className="h-full flex flex-col !bg-black/80 !backdrop-blur-xl !border-white/10 shadow-2xl overflow-y-auto custom-scrollbar">
            
            {/* Header Image */}
            <div className="relative h-40 w-full shrink-0">
               {placeImage ? (
                   <img src={placeImage} alt={locationQuery} className="w-full h-full object-cover mask-image-b" />
               ) : (
                   <div className="w-full h-full bg-gradient-to-b from-slate-700 to-black/50 flex items-center justify-center">
                       <span className="text-4xl">🗺️</span>
                   </div>
               )}
               <button 
                onClick={() => setShowOverlay(false)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/80 text-white/70 hover:text-white transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                 </svg>
               </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-5">
                
                {/* Title Block */}
                <div>
                    <h2 className="text-2xl font-bold font-oswald text-white tracking-wide">{locationQuery}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-orange-400 font-bold">{rating}</span>
                        <div className="flex text-orange-400 text-xs">
                             {[...Array(5)].map((_, i) => (
                                 <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3 h-3 ${i < Math.floor(parseFloat(rating)) ? 'text-orange-400' : 'text-gray-600'}`}>
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                 </svg>
                             ))}
                        </div>
                        <span className="text-gray-400">({reviews})</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Destino Turístico • Abierto 24hs</p>
                </div>

                {/* Action Buttons (Circular) */}
                <div className="flex justify-between px-2">
                    <ActionButton icon="directions" label="Ir" color="blue" />
                    <ActionButton icon="bookmark" label="Guardar" />
                    <ActionButton icon="share" label="Enviar" />
                    <ActionButton icon="nearby" label="Cerca" />
                </div>

                {/* Details List */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                    <DetailRow icon="location" text={`${locationQuery}, Región Turística`} />
                    <DetailRow icon="globe" text={`www.visit${locationQuery.toLowerCase().replace(/\s/g, '')}.com`} isLink />
                    <DetailRow icon="phone" text="+54 11 1234 5678" />
                    <DetailRow icon="clock" text="Muy concurrido ahora" highlight />
                </div>

                {/* Tabs Visual */}
                <div className="flex border-b border-white/10 pb-2 gap-4 text-sm font-medium text-gray-400">
                    <span className="text-cyan-400 border-b-2 border-cyan-400 pb-2 -mb-2.5">Resumen</span>
                    <span className="hover:text-white cursor-pointer">Reseñas</span>
                    <span className="hover:text-white cursor-pointer">Fotos</span>
                </div>
                
                <div className="text-xs text-gray-400 leading-relaxed">
                    "Un lugar increíble para conectar con la naturaleza y disfrutar de vistas panorámicas. Ideal para {locationQuery.includes('Beach') ? 'tomar sol' : 'caminatas'} y relajarse."
                </div>

            </div>
          </GlassCard>
        </div>
      )}

      {/* Satellite Badge */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/50 text-cyan-400 text-xs font-mono">
        {transportMode === TransportMode.FLIGHT ? 'FLIGHT TRACKING' : 'LIVE SATELLITE'}
      </div>
    </GlassCard>
  );
};

// Helper Components for the Mock UI
const ActionButton = ({ icon, label, color = "gray" }: { icon: string, label: string, color?: string }) => {
    let svgPath = "";
    switch(icon) {
        case "directions": svgPath = "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"; break;
        case "bookmark": svgPath = "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"; break;
        case "share": svgPath = "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"; break;
        case "nearby": svgPath = "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.745 2.555a2.25 2.25 0 010 3.182l-7.5 7.5a2.25 2.25 0 01-3.182-3.182l7.5-7.5a2.25 2.25 0 013.182 0z"; break;
    }
    
    return (
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 transition-all ${color === 'blue' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-white/5 text-cyan-400 group-hover:bg-white/10'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
                </svg>
            </div>
            <span className={`text-[10px] font-medium ${color === 'blue' ? 'text-blue-400' : 'text-cyan-400'}`}>{label}</span>
        </div>
    )
}

const DetailRow = ({ icon, text, isLink, highlight }: { icon: string, text: string, isLink?: boolean, highlight?: boolean }) => {
    let svgPath = "";
    switch(icon) {
        case "location": svgPath = "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M1.5 10.5c0 7.25 9 12 10.5 12s10.5-4.75 10.5-12a10.5 10.5 0 10-21 0z"; break;
        case "globe": svgPath = "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253m0 0A11.953 11.953 0 0112 10.5c2.998 0 5.74-1.1 7.843-2.918"; break;
        case "phone": svgPath = "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"; break;
        case "clock": svgPath = "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"; break;
    }

    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
                </svg>
            </div>
            <div className={`text-xs ${highlight ? 'text-pink-400 font-medium' : isLink ? 'text-blue-400 underline cursor-pointer' : 'text-gray-300'}`}>
                {text}
            </div>
        </div>
    )
}
