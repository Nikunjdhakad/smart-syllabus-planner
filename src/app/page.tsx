import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  LineChart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Upload,
    title: "AI Syllabus Extraction",
    description: "Upload any PDF or image. Our AI reads it and structures every subject and topic automatically.",
    gradient: "from-violet-500/20 via-violet-500/10 to-transparent",
    iconBg: "bg-violet-500/15 text-violet-400",
    border: "border-violet-500/20",
  },
  {
    icon: CalendarDays,
    title: "Adaptive Study Plans",
    description: "Set your exam date and daily hours. Get a personalized schedule that adjusts when life happens.",
    gradient: "from-sky-500/20 via-sky-500/10 to-transparent",
    iconBg: "bg-sky-500/15 text-sky-400",
    border: "border-sky-500/20",
  },
  {
    icon: LineChart,
    title: "Progress Analytics",
    description: "Track completion rates, study streaks, and subject-wise progress with beautiful charts.",
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    icon: Bot,
    title: "AI Study Assistant",
    description: "Ask anything. Get daily task suggestions, crash plans, and personalized study guidance.",
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-400",
    border: "border-amber-500/20",
  },
  {
    icon: RotateCcw,
    title: "Spaced Revision System",
    description: "Topics are automatically scheduled for revision at 1, 3, 7, and 14-day intervals.",
    gradient: "from-pink-500/20 via-pink-500/10 to-transparent",
    iconBg: "bg-pink-500/15 text-pink-400",
    border: "border-pink-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Smart Recovery Center",
    description: "Fell behind? One click generates a recovery plan that redistributes missed tasks intelligently.",
    gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
    iconBg: "bg-orange-500/15 text-orange-400",
    border: "border-orange-500/20",
  },
];

const stats = [
  { value: "6", label: "Core modules" },
  { value: "AI", label: "Powered extraction" },
  { value: "∞", label: "Study plans" },
  { value: "100%", label: "Free to use" },
];

const workflow = [
  { step: "01", title: "Upload your syllabus", desc: "PDF, image, or paste text. AI extracts everything." },
  { step: "02", title: "Set your exam date", desc: "Tell us when and how many hours you can study daily." },
  { step: "03", title: "Follow your plan", desc: "Complete tasks, track progress, get revision reminders." },
  { step: "04", title: "Ace your exams", desc: "AI adjusts your plan if you fall behind. No stress." },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 bg-hero-gradient" aria-hidden />
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-100" aria-hidden />

      {/* Floating blobs */}
      <div
        className="pointer-events-none fixed -left-32 -top-32 size-96 blob opacity-20"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.22 270 / 0.6), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-32 top-1/3 size-80 blob opacity-15"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.18 200 / 0.5), transparent 70%)", animationDelay: "-3s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 size-96 blob opacity-10"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.18 300 / 0.4), transparent 70%)", animationDelay: "-6s" }}
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-20 border-b border-white/8 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo href={ROUTES.home} />
          <nav className="flex items-center gap-2">
            <Link
              href={ROUTES.login}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:text-foreground")}
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.register}
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              Get started free
              <ArrowRight className="size-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
          <div className="fade-in-up">
            <Badge
              variant="secondary"
              className="mb-6 gap-2 border border-primary/20 bg-primary/10 px-4 py-1.5 text-primary"
            >
              <Sparkles className="size-3.5" />
              AI-powered academic planning
            </Badge>
          </div>

          <h1
            className="fade-in-up mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            <span className="text-gradient-hero">Finish Your Syllabus</span>
            <br />
            <span className="text-foreground/90">Before Exams. Without Stress.</span>
          </h1>

          <p
            className="fade-in-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            Upload your syllabus, set your exam date, and let AI build a personalized study plan.
            Track progress, get revision reminders, and recover when you fall behind — all in one place.
          </p>

          <div
            className="fade-in-up mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href={ROUTES.register}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25",
              )}
            >
              <Sparkles className="size-4" />
              Start planning for free
            </Link>
            <Link
              href={ROUTES.login}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-8 text-base border-white/15 bg-white/5 hover:bg-white/10",
              )}
            >
              Sign in
            </Link>
          </div>

          <ul
            className="fade-in-up mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
            style={{ animationDelay: "320ms" }}
          >
            {["AI syllabus extraction", "Adaptive scheduling", "Spaced revision reminders", "Smart recovery plans"].map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* Stats bar */}
        <section className="relative border-y border-white/8 bg-white/3 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-bold text-gradient-primary">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="text-gradient-primary">ace your exams</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Six powerful modules working together to make academic planning effortless.
            </p>
          </div>

          <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, gradient, iconBg, border }) => (
              <div
                key={title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-6 card-hover",
                  "bg-card/60 backdrop-blur-sm",
                  border,
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} aria-hidden />
                <div className="relative">
                  <div className={cn("mb-4 inline-flex size-11 items-center justify-center rounded-xl", iconBg)}>
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-white/8 bg-white/2">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                From syllabus to exam-ready in{" "}
                <span className="text-gradient-primary">4 steps</span>
              </h2>
            </div>
            <div className="stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map(({ step, title, desc }) => (
                <div key={step} className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                      {step}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent lg:hidden" />
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-primary/8 blur-3xl" aria-hidden />
            <div className="relative">
              <Zap className="mx-auto mb-4 size-10 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to study smarter?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join students who use {APP_NAME} to organize their syllabi, stay on track, and walk into exams with confidence.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={ROUTES.register}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25",
                  )}
                >
                  Create free account
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8 py-8 text-center text-sm text-muted-foreground">
        <p>{APP_NAME} — AI-powered academic planning for students.</p>
      </footer>
    </div>
  );
}
