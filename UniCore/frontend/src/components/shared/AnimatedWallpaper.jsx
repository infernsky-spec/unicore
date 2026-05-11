import React from 'react';

/**
 * AnimatedWallpaper - A premium 3D background component.
 * Features a perspective grid, moving ambient orbs, and a fine grain noise overlay.
 */
const AnimatedWallpaper = () => {
  return (
    <div className="wallpaper-3d-container">
      {/* 3D Perspective Grid */}
      <div className="wallpaper-grid"></div>

      {/* Ambient Moving Orbs */}
      <div className="wallpaper-orb wallpaper-orb-1"></div>
      <div className="wallpaper-orb wallpaper-orb-2"></div>
      <div className="wallpaper-orb wallpaper-orb-3"></div>

      {/* Fine Grain Texture */}
      <div className="wallpaper-noise"></div>
      
      {/* Radial overlay to focus attention on center */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, var(--surface-0) 90%)',
          opacity: 0.6
        }}
      ></div>
    </div>
  );
};

export default AnimatedWallpaper;
