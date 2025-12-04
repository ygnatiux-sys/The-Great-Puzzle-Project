import React from 'react';

interface HeroProps {
  imageUrl: string | null;
  title?: string;
}

export const Hero: React.FC<HeroProps> = ({ imageUrl, title }) => {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-black/20 z-10" /> {/* Overlay darkening */}
      
      {/* Image with Ken Burns */}
      <img 
        src={imageUrl} 
        alt="Travel Destination" 
        className="w-full h-full object-cover animate-ken-burns origin-center"
      />

      {/* Title Overlay */}
      {title && (
        <div className="absolute bottom-6 left-6 z-20">
          <h2 className="text-4xl font-bold font-oswald text-white drop-shadow-lg neon-text">
            {title}
          </h2>
        </div>
      )}
    </div>
  );
};