
import React, { useState } from 'react';
import { Itinerary } from '../types';
import { GlassCard } from './GlassCard';

interface ShareToolbarProps {
  itinerary: Itinerary;
  onSave?: () => void;
}

type ActiveModal = 'none' | 'card' | 'site' | 'thread';

export const ShareToolbar: React.FC<ShareToolbarProps> = ({ itinerary, onSave }) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- ACTIONS ---

  const handleSave = () => {
    // Simulation of Cloud Save
    showNotification("Análisis guardado en la nube ☁️");
    if (onSave) onSave();
  };

  const handleExport = () => {
    // Export as .txt
    const content = `TRIP: ${itinerary.title}\n\nSUMMARY: ${itinerary.summary}\n\nITINERARY:\n${itinerary.steps.map(s => `- [${s.time}] ${s.title} @ ${s.location}: ${s.description}`).join('\n')}`;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "glossy_travel_plan.txt";
    document.body.appendChild(element);
    element.click();
    showNotification("Contenido exportado a TXT 📄");
  };

  const handleCalendar = () => {
    showNotification("Evento programado en Calendario 📅");
  };

  // --- RENDER HELPERS ---

  const renderModalContent = () => {
    switch(activeModal) {
      case 'card': // Visual Summary Card
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-oswald text-cyan-400">Nota Rápida</h3>
            <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-white/20 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/20 blur-3xl rounded-full"></div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4 opacity-70">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-xs font-mono uppercase tracking-widest">Glossy Travel Insight</span>
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2 leading-tight">"{itinerary.title}"</h2>
                 <p className="text-gray-300 italic text-sm border-l-2 border-cyan-500 pl-3">
                   {itinerary.summary}
                 </p>
               </div>
            </div>
            <p className="text-xs text-center text-gray-500">Listo para compartir en Dashboard</p>
          </div>
        );

      case 'site': // Micro-Site / Landing Page
        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-oswald text-pink-400">Vista Previa Web</h3>
                <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">index.html</span>
            </div>
            
            <div className="flex-1 bg-white text-black rounded-lg overflow-y-auto custom-scrollbar p-0 relative">
               {/* Mock Browser Header */}
               <div className="sticky top-0 bg-gray-100 border-b border-gray-300 p-2 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <div className="flex-1 bg-white mx-2 rounded px-2 text-[10px] flex items-center text-gray-400">glossy.travel/my-trip</div>
               </div>
               
               {/* Content */}
               <div className="p-8 font-serif">
                  <h1 className="text-4xl font-black mb-4">{itinerary.title}</h1>
                  <img src="https://picsum.photos/seed/travel/800/300" className="w-full h-32 object-cover mb-6 grayscale hover:grayscale-0 transition-all rounded-sm" alt="hero"/>
                  <p className="text-lg leading-relaxed mb-6 font-light">{itinerary.summary}</p>
                  <hr className="border-black/10 my-6" />
                  {itinerary.steps.slice(0,3).map((s, i) => (
                      <div key={i} className="mb-4">
                          <h4 className="font-bold text-sm uppercase tracking-wide text-gray-500">{s.time} • {s.location}</h4>
                          <p className="font-bold text-xl">{s.title}</p>
                          <p className="text-gray-600">{s.description}</p>
                      </div>
                  ))}
               </div>
            </div>
            <button className="w-full py-2 bg-pink-600 text-white rounded hover:bg-pink-500 transition">Publicar Landing Page</button>
          </div>
        );

      case 'thread': // Twitter Thread
        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                 <h3 className="text-xl font-oswald text-blue-400">Generar Hilo</h3>
                 <span className="text-xs text-gray-400">{itinerary.steps.length + 1} tweets</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {/* Tweet 1: Hook */}
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                        <div className="flex gap-1 items-center"><span className="font-bold text-sm text-white">User</span> <span className="text-xs text-gray-500">@traveler</span></div>
                        <p className="text-sm text-gray-200">🧵 Voy a compartir mi plan para {itinerary.title}. <br/><br/>{itinerary.summary} 👇</p>
                    </div>
                </div>
                {/* Steps */}
                {itinerary.steps.map((step, i) => (
                   <div key={i} className="flex gap-3 relative">
                        <div className="absolute left-5 top-[-20px] bottom-8 w-0.5 bg-gray-700 -z-10"></div>
                        <div className="w-10 h-10 rounded-full bg-cyan-900/40 flex items-center justify-center flex-shrink-0 text-xs border border-white/10">{i+1}</div>
                        <div className="flex-1 space-y-1">
                             <div className="flex gap-1 items-center"><span className="font-bold text-sm text-white">User</span> <span className="text-xs text-gray-500">@traveler</span></div>
                             <p className="text-sm text-gray-300">{step.title} en {step.location}. 🕒 {step.time}. <br/>{step.description.substring(0, 150)}...</p>
                        </div>
                   </div> 
                ))}
            </div>
            <button className="w-full py-2 bg-[#1DA1F2] text-white font-bold rounded hover:bg-[#1a91da] transition">Postear en X</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-2 mb-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
        <ToolButton icon="save" label="Guardar" onClick={handleSave} />
        <ToolButton icon="export" label="Exportar" onClick={handleExport} />
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <ToolButton icon="card" label="Nota" onClick={() => setActiveModal('card')} />
        <ToolButton icon="site" label="Site" onClick={() => setActiveModal('site')} />
        <ToolButton icon="thread" label="Hilo" onClick={() => setActiveModal('thread')} />
        <ToolButton icon="calendar" label="Agenda" onClick={handleCalendar} />
      </div>

      {/* Toast Notification */}
      {notification && (
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
              <div className="mt-4 bg-cyan-500/90 text-black px-4 py-2 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] font-bold text-sm animate-in fade-in slide-in-from-top-4">
                  {notification}
              </div>
          </div>
      )}

      {/* Modal Overlay */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <GlassCard className="w-full max-w-lg max-h-[80vh] flex flex-col relative !bg-black/90 !border-white/20">
              <button 
                onClick={() => setActiveModal('none')}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>
              <div className="p-6 h-full overflow-hidden">
                {renderModalContent()}
              </div>
           </GlassCard>
        </div>
      )}
    </>
  );
};

const ToolButton = ({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) => {
    let svg = null;
    // Icons mapping
    switch(icon) {
        case 'save': svg = <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />; break; // Using bookmark style for save draft
        case 'export': svg = <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />; break;
        case 'card': svg = <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />; break;
        case 'site': svg = <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253m0 0A11.953 11.953 0 0112 10.5c2.998 0 5.74-1.1 7.843-2.918" />; break;
        case 'thread': svg = <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />; break;
        case 'calendar': svg = <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />; break;
    }

    return (
        <button 
            onClick={onClick}
            className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-all flex flex-col items-center gap-1 group relative"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                {svg}
            </svg>
            <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-black/80 px-1 rounded whitespace-nowrap">{label}</span>
        </button>
    )
}
