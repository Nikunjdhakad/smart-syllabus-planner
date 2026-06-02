"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? { name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")) }
        : { email: String(form.get("email")), password: String(form.get("password")) };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Something went wrong"); return; }
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/15">
          <Sparkles className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin
            ? "Sign in to pick up your study plan where you left off."
            : "Start planning smarter — it only takes a minute."}
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Alex Johnson"
                  required
                  autoComplete="name"
                  className="h-11 pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                required
                autoComplete="email"
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                required
                minLength={isLogin ? 1 : 8}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="h-11 pl-10"
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 h-11 w-full gap-2 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Please wait…</>
            ) : (
              <>{isLogin ? "Sign in" : "Create account"} <ArrowRight className="size-4" /></>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? ROUTES.register : ROUTES.login}
          className={cn("font-medium text-primary underline-offset-4 hover:underline")}
        >
          {isLogin ? "Sign up free" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
