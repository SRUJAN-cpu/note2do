'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  symbol: string;
}

interface ThemeTransitionProps {
  isTransitioning: boolean;
  theme: 'light' | 'dark';
}

export default function ThemeTransition({ isTransitioning, theme }: ThemeTransitionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isTransitioning) {
      setParticles([]);
      return;
    }

    // Create particles based on theme
    const particleCount = 30;
    const symbols = theme === 'dark'
      ? ['🌙', '⭐', '✨', '💫', '🌟']
      : ['☀️', '🌞', '💛', '✨', '⚡'];

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 15,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.6 + 0.4,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    }));

    setParticles(newParticles);

    // Clear particles after animation
    const timeout = setTimeout(() => {
      setParticles([]);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [isTransitioning, theme]);

  if (!isTransitioning || particles.length === 0) {
    return null;
  }

  return (
    <div className="theme-transition-overlay">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            '--speed-x': particle.speedX,
            '--speed-y': particle.speedY,
          } as React.CSSProperties}
        >
          {particle.symbol}
        </div>
      ))}
    </div>
  );
}
