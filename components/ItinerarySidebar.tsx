
import React, { useState } from 'react';
import { Itinerary, ItineraryStep } from '../types';
import { GlassCard } from './GlassCard';
import { generateSpeech } from '../services/geminiService';
import { ShareToolbar } from './ShareToolbar';

interface SidebarProps {
  itinerary: Itinerary | null;
  onImageRequest: (location: string) => void;
}

export const ItinerarySidebar: React.FC<SidebarProps> = ({ itinerary, onImageRequest }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayAudio = async (text: string, index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null); // Stop logic would go here if we kept the audio context ref
      return;
    }
    
    setPlayingIndex(index);
    const audioBuffer = await generateSpeech(text);
    if (audioBuffer) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await ctx.decodeAudioData(audioBuffer);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingIndex(null);
        source.start(0);
    } else {
        setPlayingIndex(null);
    }
  };

  if (!itinerary) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-gray-400 p-6">
        <div className="text-6xl mb-4 opacity-20">✈️</div>
        <p className="text-center font-light">Genera tu primer viaje para ver el plan aquí.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20 p-2 relative">
      
      {/* TOOLBAR ADDITION */}
      <div className="sticky top-0 z-30 mb-2">
         <ShareToolbar itinerary={itinerary} />
      </div>

      <div className="mb-6 p-2">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-oswald uppercase tracking-widest">
          {itinerary.title}
        </h2>
        <p className="text-sm text-gray-300 mt-2 font-light">{itinerary.summary}</p>
      </div>

      <div className="space-y-4 relative">
        {/* Blue Route Line (CSS visual) */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 opacity-50" />

        {itinerary.steps.map((step, idx) => (
          <GlassCard key={idx} hoverEffect className="ml-2 mr-2 p-4 flex gap-4 items-start group">
            {/* Timeline Dot */}
            <div className="absolute -left-4 top-6 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10"></div>
            
            {/* Thumbnail Placeholder */}
            <div 
                className="w-16 h-16 shrink-0 rounded-lg bg-white/10 overflow-hidden border border-white/20 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onImageRequest(step.location)}
                title="Ver imagen generada"
            >
               <img src={`https://picsum.photos/seed/${idx}${step.location.replace(/\s/g, '')}/200`} alt="thumb" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-mono text-cyan-300 border border-cyan-500/30 px-1 rounded">{step.time}</span>
                <button 
                  onClick={() => handlePlayAudio(step.description, idx)}
                  className={`p-1.5 rounded-full transition-all ${playingIndex === idx ? 'bg-cyan-500 text-black shadow-[0_0_10px_cyan]' : 'bg-white/10 hover:bg-white/20 text-cyan-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    {playingIndex === idx ? (
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    ) : (
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 9.336a.75.75 0 010 1.328l-8.625 5.75A.75.75 0 019 15.657V8.343a.75.75 0 011.164-.648l8.95 5.641z" />
                    )}
                  </svg>
                </button>
              </div>
              <h3 className="font-bold text-white text-sm truncate">{step.title}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-3">{step.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
