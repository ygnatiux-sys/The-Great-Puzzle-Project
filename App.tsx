import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, generateHeroImage } from './services/geminiService';
import { Itinerary, Message, TravelStyle, TransportMode } from './types';
import { GlassCard } from './components/GlassCard';
import { ItinerarySidebar } from './components/ItinerarySidebar';
import { Hero } from './components/Hero';
import { MapViz } from './components/MapViz';

function App() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola viajero! Soy tu Profesor de Turismo IA. ¿Qué tipo de viaje te gustaría planear hoy?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>(TravelStyle.RELAX);
  const [transportMode, setTransportMode] = useState<TransportMode>(TransportMode.FLIGHT);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("World");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | undefined>();
  const [isMuted, setIsMuted] = useState(false); // Default to sound on, but requires interaction

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio Control Effect
  useEffect(() => {
    const audio = document.getElementById('ambient-audio') as HTMLAudioElement;
    if (audio) {
        if (isMuted) {
            audio.pause();
        } else {
            audio.volume = 0.15;
            // Browser policy requires interaction before playing. 
            // We just attempt it; if it fails, the user will click eventually.
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Auto-play was prevented
                    console.log("Audio autoplay prevented. User interaction required.");
                });
            }
        }
    }
  }, [isMuted]);

  // Initial Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserCoords({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
        });
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractJson = (text: string): Itinerary | null => {
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (e) {
      console.error("Failed to parse JSON itinerary", e);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // API Call
      const response = await sendMessageToGemini(
          userMsg.text, 
          messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
          selectedStyle,
          transportMode,
          userCoords
      );
      
      const botMsg: Message = { 
          role: 'model', 
          text: response.text, 
          timestamp: Date.now(),
          groundingLinks: response.links
      };
      
      setMessages(prev => [...prev, botMsg]);

      // Check for Itinerary JSON
      const parsedItinerary = extractJson(response.text);
      if (parsedItinerary) {
        setItinerary(parsedItinerary);
        
        // Auto-generate hero image for destination
        if (parsedItinerary.steps.length > 0) {
           setCurrentLocation(parsedItinerary.steps[0].location);
           const img = await generateHeroImage(parsedItinerary.steps[0].location + " landscape view");
           if (img) setHeroImage(img);
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, tuve un problema conectando con el satélite. Intenta de nuevo.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRequest = async (location: string) => {
      // Manually trigger hero image update from sidebar click
      const img = await generateHeroImage(location);
      if(img) {
          setHeroImage(img);
          setCurrentLocation(location);
      }
  };

  const handleManualMapLocation = async (location: string) => {
      setCurrentLocation(location);
      // Optionally also fetch a new image for this manual location
      const img = await generateHeroImage(location + " scenic view");
      if(img) setHeroImage(img);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 text-slate-200">
      
      {/* Top Bar: Title & Global Actions */}
      <div className="flex justify-between items-center px-2">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
            <h1 className="font-oswald text-xl tracking-[0.2em] text-white">GLOSSY<span className="text-cyan-400 font-bold">TRAVEL</span>.AI</h1>
         </div>
         <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-full border border-white/10 transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'}`}
            title={isMuted ? "Unmute Ambient" : "Silence Customer"}
         >
            {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 9.336a.75.75 0 010 1.328l-8.625 5.75A.75.75 0 019 15.657V8.343a.75.75 0 011.164-.648l8.95 5.641z" />
                </svg>
            )}
         </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* LEFT COLUMN: Sidebar (Itinerary) */}
        <div className="hidden md:flex flex-col w-1/4 h-full min-w-[300px]">
            <GlassCard className="flex-1 h-full rounded-3xl !bg-black/60 border-white/10">
            <ItinerarySidebar itinerary={itinerary} onImageRequest={handleImageRequest} />
            </GlassCard>
        </div>

        {/* CENTER/MAIN: Dashboard */}
        <div className="flex-1 flex flex-col gap-4 h-full min-w-0">
            
            {/* TOP ROW: Map & Hero */}
            <div className="flex-[0.4] flex gap-4 min-h-[250px]">
                <div className="flex-1 relative">
                    {/* MapViz now takes placeImage and manual handler */}
                    <MapViz 
                        locationQuery={currentLocation} 
                        placeImage={heroImage} 
                        onManualLocationChange={handleManualMapLocation}
                        transportMode={transportMode}
                    />
                </div>
                <div className="flex-1 hidden lg:block">
                    {heroImage ? (
                        <Hero imageUrl={heroImage} title={currentLocation} />
                    ) : (
                        <GlassCard className="flex items-center justify-center h-full text-white/10 !bg-black/60">
                            <span className="font-oswald text-xl uppercase tracking-widest">Esperando Destino...</span>
                        </GlassCard>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW: Chat Interface */}
            <GlassCard className="flex-[0.6] flex flex-col p-4 !rounded-3xl border-t border-white/10 !bg-black/50">
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-md ${msg.role === 'user' ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'bg-white/5 text-gray-200 border border-white/5'}`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text.replace(/```json[\s\S]*?```/, '')}</p> 
                                {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                                        {msg.groundingLinks.map((link, idx) => (
                                            <a 
                                                key={idx} 
                                                href={link.uri} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-[10px] bg-black/40 border border-white/10 px-2 py-1 rounded flex items-center gap-1 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
                                            >
                                                <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                                                {link.title}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 p-4 rounded-2xl flex gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area / Tools */}
                <div className="flex flex-col gap-3">
                    {/* Action Bar / Style Switcher / Transport Switch */}
                    <div className="flex items-center justify-between px-1 gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        
                        {/* Transport Mode Switch */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 shrink-0">
                             {Object.values(TransportMode).map(mode => {
                                 let iconPath = "";
                                 switch(mode) {
                                     case TransportMode.FLIGHT: iconPath = "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"; break;
                                     case TransportMode.BUS: iconPath = "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"; break;
                                     case TransportMode.CAR: iconPath = "M3.75 15a.75.75 0 100 1.5.75.75 0 000-1.5zm0 0v-4.687c0-.068.004-.135.01-.202m0 4.89h16.5m-16.5 0h.375a.375.375 0 01.375.375v.375c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-.375a.375.375 0 01.375-.375h9a.375.375 0 01.375.375v.375c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-.375a.375.375 0 01.375-.375h.375m0 0v-4.889c0-.067-.004-.135-.011-.202m0 4.89l-.26.26a.75.75 0 01-1.06 0l-.433-.433m-14.75 0l-.433.433a.75.75 0 01-1.06 0l-.26-.26m0-4.89h16.5v.033c0 .546-.436.993-.982 1.009l-7.268.22a3.003 3.003 0 01-2.984 0l-7.268-.22a.99.99 0 01-.982-1.009V9.75zm16.5 0a2.25 2.25 0 10-4.5 0m4.5 0a2.25 2.25 0 00-4.5 0"; break;
                                     case TransportMode.BOAT: iconPath = "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253m0 0A11.953 11.953 0 0112 10.5c2.998 0 5.74-1.1 7.843-2.918"; break;
                                 }
                                 return (
                                     <button
                                         key={mode}
                                         onClick={() => setTransportMode(mode)}
                                         title={mode}
                                         className={`p-1.5 rounded transition-all ${transportMode === mode ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                     >
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                             <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                                         </svg>
                                     </button>
                                 )
                             })}
                        </div>

                         <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                            {Object.values(TravelStyle).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap
                                        ${selectedStyle === style 
                                            ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                                            : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5'}
                                    `}
                                >
                                    {style.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Modern Input Group */}
                    <div className="relative flex items-end gap-2 bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-cyan-500/30 transition-colors">
                        {/* Action Plus Button */}
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message or @ to mention..."
                            className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 py-3 font-light text-sm"
                        />
                        
                        {/* Send Button */}
                        <button 
                            onClick={handleSend}
                            disabled={loading}
                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-white/10 text-gray-500'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default App;
