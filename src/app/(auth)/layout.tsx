import { CalendarDays, LineChart, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { APP_NAME, ROUTES } from "@/lib/constants";

const sellingPoints = [
  { icon: Sparkles, title: "AI-organized syllabus", text: "Turn PDFs and notes into structured subjects and topics automatically." },
  { icon: CalendarDays, title: "Adaptive study schedules", text: "Plans that adjust when life gets in the way of studying." },
  { icon: LineChart, title: "Clear progress analytics", text: "See completion, streaks, and what to focus on next." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — violet gradient, works in both themes */}
      <aside
        className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden lg:flex"
        style={{ background: "linear-gradient(150deg, #4C1D95 0%, #7C3AED 50%, #0891B2 100%)" }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.10)" }} aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full blur-3xl" style={{ background: "rgba(6,182,212,0.20)" }} aria-hidden />

        <div className="relative px-10 pt-10">
          <BrandLogo href={ROUTES.home} inverted />
        </div>

        <div className="relative space-y-8 px-10 pb-10">
          <div>
            <p className="text-sm font-medium text-white/65">Welcome to</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-white">Your academic command center</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              {APP_NAME} combines intelligent planning with progress analytics so you can focus on learning — not juggling calendars.
            </p>
          </div>
          <ul className="space-y-4">
            {sellingPoints.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[14px] bg-white/15">
                  <Icon className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-sm text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative px-10 pb-8 text-xs text-white/45">Secure sign-in · Your data stays private</p>
      </aside>

      {/* Right panel — adapts to theme */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-10 sm:px-6">
        <div className="mb-8 lg:hidden">
          <BrandLogo href={ROUTES.home} showTagline />
        </div>
        {children}
      </div>
    </div>
  );
}
