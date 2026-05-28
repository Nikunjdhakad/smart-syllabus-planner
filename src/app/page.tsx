import Link from "next/link";
import {
  Bot,
  CalendarDays,
  LineChart,
  Sparkles,
  Upload,
} from "lucide-react";

import { APP_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    icon: Upload,
    title: "Smart syllabus upload",
    description:
      "Upload PDFs or images and let AI extract subjects and topics.",
  },
  {
    icon: CalendarDays,
    title: "Personalized study plans",
    description:
      "Generate daily and weekly schedules based on your exam dates and availability.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    description:
      "Track completion, streaks, and subject-wise performance on your dashboard.",
  },
  {
    icon: Bot,
    title: "AI study assistant",
    description:
      "Get guidance, task suggestions, and recovery plans when you fall behind.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-5" />
            {APP_NAME}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href={ROUTES.login} />}>
              Sign in
            </Button>
            <Button render={<Link href={ROUTES.register} />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-16">
        <section className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            AI-powered academic planning
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Complete your syllabus on time, with less stress
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {APP_NAME} helps students organize syllabi, build adaptive study
            schedules, track progress, and recover when plans slip.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href={ROUTES.register} />}>
              Create free account
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href={ROUTES.login} />}
            >
              Sign in
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {highlights.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built for students — syllabus planning, revisions, and exam prep in one
        place.
      </footer>
    </div>
  );
}
