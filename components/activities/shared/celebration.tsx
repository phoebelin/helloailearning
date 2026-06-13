'use client';

import React, { useEffect, useRef } from 'react';

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
}

const COLORS = ['#967FD8', '#F87171', '#60A5FA', '#4ADE80', '#FDE047', '#F9A8D4'];

interface CelebrationProps {
  active?: boolean;
  duration?: number; // ms
}

export function Celebration({ active = true, duration = 3000 }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Spawn confetti
    piecesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      size: 6 + Math.random() * 8,
      opacity: 1,
    }));

    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fadeFraction = Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3));

      for (const p of piecesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity = fadeFraction;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, duration]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-50"
    />
  );
}
