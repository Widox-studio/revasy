"use client";

import React, { useEffect, useRef } from "react";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

const REVASY_PALETTE = [
  "#4f46e5", // Electric Revasy Indigo
  "#8b5cf6", // Royal Violet
  "#10b981", // Fresh Mint-Emerald
  "#f59e0b", // Golden Amber
  "#f97316", // Warm Coral-Peach
  "#0d9488", // Deep Emerald-Teal
  "#f43f5e", // Vivid Coral-Rose
];

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Create particles originating from the center-bottom
    const particleCount = 75;
    const particles: Particle[] = [];

    const originX = width / 2;
    const originY = height * 0.7;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI / 180) * (210 + Math.random() * 120); // upward fan
      const speed = 7 + Math.random() * 9;
      particles.push({
        x: originX + (Math.random() * 60 - 30),
        y: originY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
        vy: Math.sin(angle) * speed * (0.9 + Math.random() * 0.5),
        size: 5 + Math.random() * 6,
        color: REVASY_PALETTE[Math.floor(Math.random() * REVASY_PALETTE.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? "rect" : "circle",
      });
    }

    let animationId: number;
    let startTime: number | null = null;
    const duration = 2500; // 2.5s

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;

      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (const p of particles) {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Gravity
        p.vx *= 0.985; // Drag
        p.rotation += p.rotationSpeed;

        if (elapsed > 1200) {
          p.opacity = Math.max(0, 1 - (elapsed - 1200) / (duration - 1200));
        }

        if (p.opacity > 0 && p.y < height + 50) {
          aliveCount++;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (elapsed < duration && aliveCount > 0) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      if (ctx) ctx.clearRect(0, 0, width, height);
    };
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};
