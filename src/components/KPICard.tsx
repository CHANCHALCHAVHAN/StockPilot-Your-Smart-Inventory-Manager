import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  alert?: boolean;
  subtitle?: string;
  className?: string;
}

export function KPICard({ title, value, icon: Icon, alert, subtitle, className }: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border bg-card p-4 industrial-border",
        alert && "border-primary/50 red-glow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</p>
        <Icon className={cn("h-4 w-4 text-muted-foreground", alert && "text-primary animate-pulse-red")} />
      </div>
      <p className={cn("mt-2 text-2xl font-mono font-bold", alert && "text-primary red-glow-text")}>
        {value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
