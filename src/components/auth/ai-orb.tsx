"use client";

/**
 * AiOrb — Animated AI centerpiece for auth pages.
 *
 * A glowing violet orb with concentric orbit rings and orbiting nodes,
 * positioned between the hero text and the auth card.
 *
 * Entirely CSS-animated — reuses keyframes from globals.css:
 *   - auth-orb-breathe (core pulse)
 *   - hero-rotate / hero-rotate-reverse (ring spin)
 */

const ORBIT_NODES = [
  { angle: 0,   radius: 34, size: 5, dur: "8s",  color: "bg-primary"    },
  { angle: 120, radius: 34, size: 4, dur: "8s",  color: "bg-cyan-400"   },
  { angle: 240, radius: 34, size: 3, dur: "8s",  color: "bg-emerald-400"},
  { angle: 60,  radius: 50, size: 3, dur: "12s", color: "bg-primary/60" },
  { angle: 200, radius: 50, size: 4, dur: "12s", color: "bg-cyan-400/60"},
];

export function AiOrb() {
  return (
    <div className="relative mx-auto my-6 flex h-[100px] w-[100px] items-center justify-center sm:my-8 sm:h-[120px] sm:w-[120px]">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border border-dashed border-primary/15 dark:border-primary/20"
        style={{
          animation: "hero-rotate 20s linear infinite",
          "--rotate-duration": "20s",
        } as React.CSSProperties}
      />

      {/* Middle ring */}
      <div
        className="absolute inset-[15%] rounded-full border border-dotted border-primary/10 dark:border-primary/15"
        style={{
          animation: "hero-rotate 14s linear infinite reverse",
        } as React.CSSProperties}
      />

      {/* Inner glow ring (pulsing) */}
      <div
        className="absolute inset-[30%] rounded-full border border-primary/20 dark:border-primary/30"
        style={{
          animation: "auth-orb-ring-pulse 3s ease-in-out infinite",
        }}
      />

      {/* Core glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.2) 50%, transparent 70%)",
          animation: "auth-orb-breathe 3s ease-in-out infinite",
        }}
      />
      {/* Dark mode core */}
      <div
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 dark:block"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.7) 0%, rgba(167,139,250,0.25) 50%, transparent 70%)",
          animation: "auth-orb-breathe 3s ease-in-out infinite",
        }}
      />

      {/* Core dot */}
      <div className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_rgba(124,58,237,0.5)] dark:bg-primary dark:shadow-[0_0_16px_rgba(167,139,250,0.6)]" />

      {/* Orbiting nodes */}
      {ORBIT_NODES.map((node, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 0,
            height: 0,
            animation: `hero-rotate ${node.dur} linear infinite`,
            animationDelay: `${(i * -1.5)}s`,
          }}
        >
          <div
            className={`absolute rounded-full ${node.color}`}
            style={{
              width: node.size,
              height: node.size,
              transform: `translateX(${node.radius}px) translateY(-${node.size / 2}px)`,
              boxShadow: "0 0 6px rgba(124,58,237,0.3)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
