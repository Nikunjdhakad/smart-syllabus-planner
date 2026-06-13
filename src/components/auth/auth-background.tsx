"use client";

/**
 * AuthBackground — Animated full-screen background for Login / Register pages.
 *
 * Renders:
 * 1. Mesh gradient layer (radial blobs in brand violet / cyan / emerald)
 * 2. Ultra-faint dot-grid texture
 * 3. ~16 floating CSS-animated particles
 * 4. Two large ambient glow blobs that drift slowly
 *
 * Entirely CSS-driven — no canvas, no JS timers.
 */

// Particle presets — positions, sizes, durations, delays are randomised at build time
// so they look organic without any runtime randomness.
const PARTICLES: {
  x: string; y: string; size: number; opacity: number; dur: string; delay: string;
}[] = [
  { x: "12%", y: "18%", size: 3,  opacity: 0.18, dur: "14s", delay: "0s"   },
  { x: "78%", y: "8%",  size: 2,  opacity: 0.22, dur: "18s", delay: "2s"   },
  { x: "25%", y: "72%", size: 4,  opacity: 0.15, dur: "16s", delay: "1s"   },
  { x: "65%", y: "82%", size: 2,  opacity: 0.20, dur: "20s", delay: "3s"   },
  { x: "90%", y: "35%", size: 3,  opacity: 0.14, dur: "15s", delay: "0.5s" },
  { x: "5%",  y: "55%", size: 2,  opacity: 0.25, dur: "17s", delay: "4s"   },
  { x: "42%", y: "12%", size: 3,  opacity: 0.16, dur: "19s", delay: "1.5s" },
  { x: "55%", y: "90%", size: 2,  opacity: 0.20, dur: "13s", delay: "2.5s" },
  { x: "82%", y: "60%", size: 4,  opacity: 0.12, dur: "22s", delay: "0s"   },
  { x: "18%", y: "40%", size: 2,  opacity: 0.18, dur: "16s", delay: "3.5s" },
  { x: "35%", y: "28%", size: 3,  opacity: 0.14, dur: "21s", delay: "1s"   },
  { x: "70%", y: "48%", size: 2,  opacity: 0.22, dur: "14s", delay: "4.5s" },
  { x: "50%", y: "65%", size: 3,  opacity: 0.16, dur: "18s", delay: "2s"   },
  { x: "8%",  y: "85%", size: 2,  opacity: 0.19, dur: "15s", delay: "0.8s" },
  { x: "95%", y: "15%", size: 3,  opacity: 0.13, dur: "20s", delay: "3s"   },
  { x: "48%", y: "45%", size: 2,  opacity: 0.17, dur: "17s", delay: "1.8s" },
];

export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* ── Layer 1: Mesh gradients ── */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(124,58,237,0.08) 0%, transparent 55%)",
            "radial-gradient(ellipse 70% 50% at 75% 30%, rgba(6,182,212,0.06) 0%, transparent 50%)",
            "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(16,185,129,0.04) 0%, transparent 50%)",
            "radial-gradient(ellipse 90% 70% at 60% 50%, rgba(99,102,241,0.03) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Dark mode override */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(124,58,237,0.16) 0%, transparent 55%)",
            "radial-gradient(ellipse 70% 50% at 75% 30%, rgba(6,182,212,0.10) 0%, transparent 50%)",
            "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(16,185,129,0.06) 0%, transparent 50%)",
            "radial-gradient(ellipse 90% 70% at 60% 50%, rgba(99,102,241,0.05) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* ── Layer 2: Grid texture ── */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Layer 3: Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/60 dark:bg-primary/40"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            "--px": "0px",
            "--py": "0px",
            "--ps": "1",
            "--po": String(p.opacity),
            animation: `auth-particle-float ${p.dur} ease-in-out ${p.delay} infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* ── Layer 4: Ambient glow blobs ── */}
      <div
        className="absolute -left-32 -top-32 size-[420px] rounded-full opacity-30 blur-[100px] dark:opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
          animation: "auth-glow-drift-1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-40 -right-24 size-[360px] rounded-full opacity-25 blur-[90px] dark:opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.30) 0%, transparent 70%)",
          animation: "auth-glow-drift-2 30s ease-in-out infinite",
        }}
      />

      {/* ── Layer 5: Top edge glow (very subtle) ── */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.15) 50%, transparent 90%)",
        }}
      />
    </div>
  );
}
