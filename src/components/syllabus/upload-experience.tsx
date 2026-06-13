"use client";

import { useState } from "react";
import { FileText, FileImage, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadMethod = "pdf" | "image" | "manual" | null;

interface UploadExperienceProps {
  onMethodSelect?: (method: UploadMethod) => void;
  selectedMethod?: UploadMethod;
}

export function UploadExperience({
  onMethodSelect,
  selectedMethod = null,
}: UploadExperienceProps) {
  const [selected, setSelected] = useState<UploadMethod>(selectedMethod);

  const handleSelect = (method: UploadMethod) => {
    setSelected(method);
    onMethodSelect?.(method);
  };

  const methods = [
    { 
      id: "pdf" as const, 
      label: "PDF Upload", 
      icon: FileText,
      description: "Upload your syllabus as a PDF document"
    },
    { 
      id: "image" as const, 
      label: "Image Upload", 
      icon: FileImage,
      description: "Use photos of printed syllabi"
    },
    { 
      id: "manual" as const, 
      label: "Manual Entry", 
      icon: PenLine,
      description: "Type or paste your syllabus content"
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Choose Upload Method</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {methods.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSelect(id)}
            className={cn(
              "flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border p-6 transition-all hover:scale-[1.02] hover:shadow-md",
              selected === id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/60 bg-card hover:border-primary/50"
            )}
          >
            <Icon className="size-12 text-primary" />
            <span className="text-base font-medium">{label}</span>
            <span className="text-sm text-muted-foreground text-center">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
