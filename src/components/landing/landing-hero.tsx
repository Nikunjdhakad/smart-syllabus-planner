"use client";

import dynamic from "next/dynamic";

/* ── Dynamic imports for client-heavy hero components ── */
const HeroSection = dynamic(
  () => import("@/components/landing/hero-section").then((m) => ({ default: m.HeroSection })),
  { ssr: false },
);
const UploadDemo = dynamic(
  () => import("@/components/landing/upload-demo").then((m) => ({ default: m.UploadDemo })),
  { ssr: false },
);
const TrustCounters = dynamic(
  () => import("@/components/landing/trust-counters").then((m) => ({ default: m.TrustCounters })),
  { ssr: false },
);

export function LandingHero() {
  return (
    <>
      <HeroSection />
      <UploadDemo />
      <TrustCounters />
    </>
  );
}
