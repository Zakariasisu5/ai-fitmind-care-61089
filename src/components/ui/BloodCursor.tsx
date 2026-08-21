
import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  opacity: number;
  color: string;
  size: number;
}

const colors = [
  '#F2FCE2', // Soft Green
  '#FEF7CD', // Soft Yellow
  '#FEC6A1', // Soft Orange
  '#E5DEFF', // Soft Purple
  '#FFDEE2', // Soft Pink
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
  '#0EA5E9'  // Ocean Blue
];

export const BloodCursor = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newStar = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1 // Random size between 1-4px
      };
      
      setStars(prev => [...prev, newStar]);
    };

    // Clean up old stars
    const cleanupInterval = setInterval(() => {
      setStars(prev => prev.filter(star => {
        const age = Date.now() - star.id;
        return age < 2000; // Remove stars older than 2 seconds
      }));
    }, 100);

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.x,
            top: star.y,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
            animation: 'star-fall 2s forwards',
          }}
        />
      ))}
    </div>
  );
};

