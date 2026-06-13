import { BrandLogo } from "@/components/brand/brand-logo";
import { ROUTES } from "@/lib/constants";
import { AuthBackground } from "@/components/auth/auth-background";
import { AiOrb } from "@/components/auth/ai-orb";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background">
      {/* Animated background */}
      <AuthBackground />

      {/* ── Navigation header ── */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-5 sm:px-10">
        <BrandLogo href={ROUTES.home} />
        <a
          href={ROUTES.home}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to home
        </a>
      </header>

      {/* ── Main content — single centered column ── */}
      <main className="relative z-10 flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 pb-12 sm:px-6">
        {/* AI Orb — emotional centerpiece */}
        <AiOrb />

        {/* Auth form (children = <AuthForm />) */}
        {children}
      </main>
    </div>
  );
}
