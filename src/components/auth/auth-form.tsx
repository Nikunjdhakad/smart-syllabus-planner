"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import {
  getPasswordStrength,
  type PasswordStrength,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

// ─── Password strength bar ──────────────────────────────────────

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { label: string; color: string; width: string }
> = {
  weak: { label: "Weak", color: "bg-red-500", width: "w-1/4" },
  fair: { label: "Fair", color: "bg-orange-500", width: "w-2/4" },
  good: { label: "Good", color: "bg-yellow-500", width: "w-3/4" },
  strong: { label: "Strong", color: "bg-green-500", width: "w-full" },
};

function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  const { strength, checks } = getPasswordStrength(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <div className="mt-2.5 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              config.color,
              config.width,
            )}
          />
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            strength === "weak" && "text-red-500",
            strength === "fair" && "text-orange-500",
            strength === "good" && "text-yellow-500",
            strength === "strong" && "text-green-500",
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
        {[
          { key: "minLength", label: "8+ characters" },
          { key: "hasUppercase", label: "Uppercase letter" },
          { key: "hasLowercase", label: "Lowercase letter" },
          { key: "hasNumber", label: "Number" },
        ].map(({ key, label }) => {
          const passed = checks[key as keyof typeof checks];
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-1 transition-colors",
                passed ? "text-green-500" : "text-muted-foreground",
              )}
            >
              {passed ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              )}
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Inline field error ─────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  );
}

// ─── Validation helpers ─────────────────────────────────────────

function validateEmail(email: string): string | undefined {
  if (!email) return undefined; // don't show error for empty
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
}

function validateName(name: string): string | undefined {
  if (!name) return undefined;
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return undefined;
  if (password.length < 8) return "At least 8 characters required";
  if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a number";
  return undefined;
}

// ─── Google icon SVG ────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Trust badges ───────────────────────────────────────────────

function TrustBadges() {
  const badges = [
    { icon: Lock,   label: "Secure Authentication" },
    { icon: Shield, label: "Private Academic Data" },
    { icon: Zap,    label: "Powered by AI" },
  ];

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70"
        >
          <Icon className="size-3" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main form ──────────────────────────────────────────────────

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  // Field values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Touched state (only show errors after user interacts)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Computed validation errors
  const errors = {
    name: !isLogin ? validateName(name) : undefined,
    email: validateEmail(email),
    password: !isLogin ? validatePassword(password) : undefined,
  };

  // Is form valid?
  const isFormValid = isLogin
    ? email.length > 0 && password.length > 0 && !errors.email
    : name.trim().length >= 2 &&
      email.length > 0 &&
      password.length >= 8 &&
      !errors.name &&
      !errors.email &&
      !errors.password;

  const markTouched = useCallback(
    (field: string) =>
      setTouched((prev) => ({ ...prev, [field]: true })),
    [],
  );

  // Clear server error on field change
  useEffect(() => {
    setError(null);
  }, [name, email, password]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Force-show all errors
    setTouched({ name: true, email: true, password: true });
    if (!isFormValid) return;

    setLoading(true);

    const payload = isLogin
      ? { email: email.trim().toLowerCase(), password }
      : {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[480px] auth-stagger">
      {/* ── Hero identity section ── */}
      <div className="mb-6 text-center sm:mb-8">
        {/* Badge */}
        <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary dark:border-primary/20 dark:bg-primary/10">
          <Sparkles className="size-3" />
          AI-Powered Academic Success Platform
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isLogin ? "Welcome Back" : "Create Your Academic Command Center"}
        </h1>

        {/* Subtext */}
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Plan smarter. Track progress. Stay exam ready.
        </p>
      </div>

      {/* ── Auth card ── */}
      <div className="auth-card-reveal auth-card-glass rounded-2xl p-6 sm:p-8">
        {/* Card header */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-base font-semibold text-foreground">
            {isLogin ? "Sign in to your account" : "Get started for free"}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {isLogin
              ? "Pick up your study plan where you left off."
              : "Start planning smarter — it only takes a minute."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[13px] font-medium">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  className={cn(
                    "h-12 rounded-xl border-border/60 bg-background/50 pl-11 pr-4 text-sm shadow-sm transition-all duration-200",
                    "placeholder:text-muted-foreground/40",
                    "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:shadow-[0_0_0_4px_rgba(124,58,237,0.06)]",
                    "dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/20",
                    touched.name &&
                      errors.name &&
                      "border-destructive focus-visible:ring-destructive/20",
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => markTouched("name")}
                />
              </div>
              {touched.name && <FieldError message={errors.name} />}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                autoComplete="email"
                className={cn(
                  "h-12 rounded-xl border-border/60 bg-background/50 pl-11 pr-4 text-sm shadow-sm transition-all duration-200",
                  "placeholder:text-muted-foreground/40",
                  "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:shadow-[0_0_0_4px_rgba(124,58,237,0.06)]",
                  "dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/20",
                  touched.email &&
                    errors.email &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
              />
            </div>
            {touched.email && <FieldError message={errors.email} />}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[13px] font-medium">
                Password
              </Label>
              {isLogin && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={
                  isLogin
                    ? "Enter your password"
                    : "Min 8 chars, uppercase, lowercase & number"
                }
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={cn(
                  "h-12 rounded-xl border-border/60 bg-background/50 pl-11 pr-4 text-sm shadow-sm transition-all duration-200",
                  "placeholder:text-muted-foreground/40",
                  "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:shadow-[0_0_0_4px_rgba(124,58,237,0.06)]",
                  "dark:border-white/10 dark:bg-white/5 dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/20",
                  touched.password &&
                    errors.password &&
                    "border-destructive focus-visible:ring-destructive/20",
                )}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched("password")}
              />
            </div>
            {!isLogin && <PasswordStrengthIndicator password={password} />}
            {isLogin && touched.password && !password && (
              <FieldError message="Password is required" />
            )}
          </div>

          {error && (
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Primary CTA */}
          <Button
            type="submit"
            className={cn(
              "relative mt-3 h-[52px] w-full gap-2 rounded-xl text-sm font-semibold",
              "bg-gradient-to-br from-primary to-[#6D28D9] text-primary-foreground",
              "shadow-[0_2px_8px_rgba(124,58,237,0.3)] dark:shadow-[0_2px_12px_rgba(124,58,237,0.25)]",
              "transition-all duration-200",
              "hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:-translate-y-0.5",
              "active:translate-y-0 active:shadow-[0_1px_4px_rgba(124,58,237,0.3)]",
              "disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_2px_8px_rgba(124,58,237,0.3)]",
            )}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Please wait…
              </>
            ) : (
              <>
                {isLogin ? "Sign in" : "Create account"}{" "}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {/* ── Divider ── */}
        <div className="my-5 flex items-center gap-3 sm:my-6">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
            or
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* ── Social login placeholder ── */}
        <button
          type="button"
          disabled
          className={cn(
            "flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
            "border-border/60 bg-background/30 text-foreground/80",
            "hover:bg-background/60 hover:border-border",
            "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          <GoogleIcon className="size-[18px]" />
          Continue with Google
        </button>
      </div>

      {/* ── Secondary link ── */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? ROUTES.register : ROUTES.login}
          className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
        >
          {isLogin ? "Sign up free" : "Sign in"}
        </Link>
      </p>

      {/* ── Trust badges ── */}
      <TrustBadges />
    </div>
  );
}
