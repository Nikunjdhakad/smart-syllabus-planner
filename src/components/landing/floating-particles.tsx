"use client";

import { useMemo } from "react";

interface FloatingParticlesProps {
  mouseX: number; // normalized -1 to 1
  mouseY: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function FloatingParticles({ mouseX, mouseY }: FloatingParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const r = seededRandom;
      return {
        id: i,
        left: `${r(i * 1) * 100}%`,
        top: `${r(i * 2 + 50) * 100}%`,
        size: 2 + r(i * 3 + 100) * 4,
        opacity: 0.15 + r(i * 4 + 150) * 0.25,
        duration: 8 + r(i * 5 + 200) * 12,
        driftX1: (r(i * 6 + 250) - 0.5) * 20,
        driftY1: (r(i * 7 + 300) - 0.5) * 20,
        driftX2: (r(i * 8 + 350) - 0.5) * 30,
        driftY2: (r(i * 9 + 400) - 0.5) * 30,
        driftX3: (r(i * 10 + 450) - 0.5) * 15,
        driftY3: (r(i * 11 + 500) - 0.5) * 15,
        delay: r(i * 12 + 550) * -20,
        isViolet: r(i * 13 + 600) > 0.5,
      };
    });
  }, []);

  const parallaxX = mouseX * 8;
  const parallaxY = mouseY * 8;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      style={{
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.isViolet
              ? "rgba(167, 139, 250, 0.6)"
              : "rgba(103, 232, 249, 0.5)",
            opacity: p.opacity,
            animation: `hero-particle-drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            "--drift-x1": `${p.driftX1}px`,
            "--drift-y1": `${p.driftY1}px`,
            "--drift-x2": `${p.driftX2}px`,
            "--drift-y2": `${p.driftY2}px`,
            "--drift-x3": `${p.driftX3}px`,
            "--drift-y3": `${p.driftY3}px`,
            "--particle-opacity": p.opacity,
            willChange: "transform",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
