"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadHeroProps {
  onUploadClick: () => void;
}

export function UploadHero({ onUploadClick }: UploadHeroProps) {
  return (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Syllabus Intelligence Center</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your syllabus and let AI organize your academic roadmap
        </p>
      </div>
      <Button onClick={onUploadClick} className="h-10 gap-2">
        <Upload className="size-4" />
        Upload Syllabus
      </Button>
    </div>
  );
}
