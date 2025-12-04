import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div 
      className={`
        relative overflow-hidden
        bg-black/40 
        backdrop-blur-xl 
        border border-white/5 
        shadow-lg 
        rounded-2xl
        transition-all duration-300
        ${hoverEffect ? 'hover:bg-black/60 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:border-cyan-400/20' : ''}
        ${className}
      `}
    >
      {/* Glossy reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-30" />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};