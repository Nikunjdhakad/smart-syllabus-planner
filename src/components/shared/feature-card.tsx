import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
