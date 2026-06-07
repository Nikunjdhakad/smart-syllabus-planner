import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href,
  className,
  showTagline = false,
  inverted = false,
}: {
  href?: string;
  className?: string;
  showTagline?: boolean;
  inverted?: boolean;
}) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-[14px]",
          inverted
            ? "bg-white/20 text-white"
            : "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(124,58,237,0.35)]",
        )}
      >
        <GraduationCap className="size-4" strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <span className={cn("block text-sm font-bold tracking-tight", inverted ? "text-white" : "text-foreground")}>
          {APP_NAME}
        </span>
        {showTagline && (
          <span className={cn("block text-[0.6875rem]", inverted ? "text-white/65" : "text-muted-foreground")}>
            Academic planner
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="transition-opacity hover:opacity-80">{content}</Link>;
  }
  return content;
}
