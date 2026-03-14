import { cn } from "@/lib/utils";

const statusConfig: Record<string, { className: string }> = {
  Draft: { className: "bg-muted text-muted-foreground border-border" },
  Waiting: { className: "bg-primary/10 text-primary border-primary/30" },
  Ready: { className: "bg-primary/20 text-primary border-primary/50 red-glow" },
  Done: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  Cancelled: { className: "bg-muted text-muted-foreground/50 border-border line-through" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || statusConfig.Draft;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-mono font-medium",
        config.className,
        className
      )}
    >
      {status}
    </span>
  );
}
