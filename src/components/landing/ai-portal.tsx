"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function AIPortal() {
  /* ── Orbiting particles ── */
  const orbitParticles = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      radius: 60 + seededRandom(i * 7) * 100,
      size: 2 + seededRandom(i * 11) * 4,
      duration: 6 + seededRandom(i * 13) * 14,
      startAngle: seededRandom(i * 17) * 360,
      opacity: 0.4 + seededRandom(i * 19) * 0.5,
      isViolet: seededRandom(i * 23) > 0.35,
      isBright: seededRandom(i * 29) > 0.7,
    }));
  }, []);

  /* ── Energy beams radiating from core ── */
  const energyBeams = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: i * 60,
      length: 90 + seededRandom(i * 47) * 50,
      opacity: 0.15 + seededRandom(i * 53) * 0.2,
      duration: 3 + seededRandom(i * 59) * 2,
    }));
  }, []);

  const portalSize = 340;
  const half = portalSize / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: portalSize, height: portalSize }}>
      {/* ── Outer ambient glow ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: portalSize + 60,
          height: portalSize + 60,
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.06) 35%, transparent 65%)",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Ring 1 — outermost (dashed, slow) ── */}
      <div
        className="hero-rotate absolute"
        style={{ width: 320, height: 320, "--rotate-duration": "30s" } as React.CSSProperties}
      >
        <svg width="320" height="320" viewBox="0 0 320 320" fill="none" className="absolute inset-0">
          <defs>
            <linearGradient id="ring1-g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="160" r="155" stroke="url(#ring1-g)" strokeWidth="1" strokeDasharray="8 12" fill="none" />
        </svg>
      </div>

      {/* ── Ring 2 — second outer (dotted, reverse) ── */}
      <div
        className="hero-rotate-reverse absolute"
        style={{ width: 280, height: 280, "--rotate-duration": "22s" } as React.CSSProperties}
      >
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" className="absolute inset-0">
          <defs>
            <linearGradient id="ring2-g" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle cx="140" cy="140" r="135" stroke="url(#ring2-g)" strokeWidth="1.5" strokeDasharray="3 8" fill="none" />
        </svg>
      </div>

      {/* ── Ring 3 — mid (solid, faster) ── */}
      <div
        className="hero-rotate absolute"
        style={{ width: 220, height: 220, "--rotate-duration": "16s" } as React.CSSProperties}
      >
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" className="absolute inset-0">
          <defs>
            <linearGradient id="ring3-g" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r="105" stroke="url(#ring3-g)" strokeWidth="0.8" fill="none" opacity="0.7" />
        </svg>
      </div>

      {/* ── Ring 4 — inner (dashed, reverse, fast) ── */}
      <div
        className="hero-rotate-reverse absolute"
        style={{ width: 160, height: 160, "--rotate-duration": "10s" } as React.CSSProperties}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" className="absolute inset-0">
          <defs>
            <linearGradient id="ring4-g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="75" stroke="url(#ring4-g)" strokeWidth="1.2" strokeDasharray="5 7" fill="none" />
        </svg>
      </div>

      {/* ── Ring 5 — innermost (solid, very fast) ── */}
      <div
        className="hero-rotate absolute"
        style={{ width: 100, height: 100, "--rotate-duration": "7s" } as React.CSSProperties}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="absolute inset-0">
          <circle cx="50" cy="50" r="45" stroke="rgba(167,139,250,0.3)" strokeWidth="0.6" fill="none" />
        </svg>
      </div>

      {/* ── Energy beams from core ── */}
      {energyBeams.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute"
          style={{
            left: half,
            top: half,
            width: 2,
            height: beam.length,
            transformOrigin: "top center",
            transform: `rotate(${beam.angle}deg)`,
            background: `linear-gradient(180deg, rgba(167,139,250,${beam.opacity * 1.5}) 0%, transparent 100%)`,
            borderRadius: 1,
          }}
          animate={{ opacity: [beam.opacity * 0.3, beam.opacity, beam.opacity * 0.3], height: [beam.length * 0.7, beam.length, beam.length * 0.7] }}
          transition={{ duration: beam.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Scanning line (rotates, like a radar sweep) ── */}
      <motion.div
        className="absolute"
        style={{
          left: half,
          top: half,
          width: 1,
          height: 140,
          transformOrigin: "top center",
          background: "linear-gradient(180deg, rgba(103,232,249,0.5) 0%, transparent 100%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* ── Core glow layers ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 60,
          height: 60,
          background: "radial-gradient(circle, rgba(167,139,250,0.8) 0%, rgba(124,58,237,0.3) 50%, transparent 80%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Bright inner core ── */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 24,
          height: 24,
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(199,180,255,0.6) 40%, transparent 70%)",
          boxShadow: "0 0 30px rgba(167,139,250,0.5), 0 0 60px rgba(124,58,237,0.3)",
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── AI label ── */}
      <motion.span
        className="absolute text-[10px] font-bold tracking-[0.3em] text-violet-300/50"
        style={{ top: half + 35 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        AI ENGINE
      </motion.span>

      {/* ── Orbiting particles ── */}
      {orbitParticles.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 0,
            height: 0,
            animation: `hero-orbit ${p.duration}s linear infinite`,
            "--orbit-radius": `${p.radius}px`,
            "--orbit-start": `${p.startAngle}deg`,
          } as React.CSSProperties}
        >
          <div
            className="rounded-full"
            style={{
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              background: p.isViolet
                ? `rgba(167, 139, 250, ${p.opacity})`
                : `rgba(103, 232, 249, ${p.opacity})`,
              boxShadow: p.isBright
                ? p.isViolet
                  ? `0 0 8px rgba(167,139,250,${p.opacity}), 0 0 16px rgba(167,139,250,${p.opacity * 0.3})`
                  : `0 0 8px rgba(103,232,249,${p.opacity}), 0 0 16px rgba(103,232,249,${p.opacity * 0.3})`
                : p.isViolet
                  ? `0 0 4px rgba(167,139,250,${p.opacity * 0.4})`
                  : `0 0 4px rgba(103,232,249,${p.opacity * 0.4})`,
            }}
          />
        </div>
      ))}

      {/* ── Hexagonal accent (cosmetic SVG) ── */}
      <div
        className="hero-rotate-reverse absolute opacity-[0.08]"
        style={{ width: 260, height: 260, "--rotate-duration": "50s" } as React.CSSProperties}
      >
        <svg width="260" height="260" viewBox="0 0 260 260" fill="none" className="absolute inset-0">
          <polygon
            points="130,10 240,70 240,190 130,250 20,190 20,70"
            stroke="#A78BFA"
            strokeWidth="0.8"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
