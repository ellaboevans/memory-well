"use client";

import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  iconClassName?: string;
}

export function LogoMark({ className, iconClassName }: LogoMarkProps) {
  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground flex items-center justify-center rounded-md",
        className,
      )}>
      <Droplets className={cn("size-4", iconClassName)} />
    </div>
  );
}
