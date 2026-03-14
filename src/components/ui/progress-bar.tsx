import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  color = "bg-teal",
  className,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-surface-hover rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground mt-1 block text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
