"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface NextStepCTAProps {
  onGeneratePlan?: () => void;
}

export function NextStepCTA({ onGeneratePlan }: NextStepCTAProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onGeneratePlan) {
      onGeneratePlan();
    } else {
      router.push("/planner");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center md:p-12">
      <h2 className="text-2xl font-semibold">Ready to Start Studying?</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Create a personalized schedule based on your syllabus
      </p>
      <Button onClick={handleClick} size="lg" className="h-12 gap-2 px-8">
        <Sparkles className="size-5" />
        Generate Study Plan
      </Button>
    </div>
  );
}
