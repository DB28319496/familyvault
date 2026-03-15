import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyExact(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthYear(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getPhaseColor(phase: number): string {
  switch (phase) {
    case 1: return "#B85450";
    case 2: return "#B8922E";
    case 3: return "#3B7D62";
    case 4: return "#456282";
    default: return "#9C9A95";
  }
}

export function getPhaseLabel(phase: number): string {
  switch (phase) {
    case 1: return "Stop the Bleeding";
    case 2: return "Build the Foundation";
    case 3: return "Accelerate";
    case 4: return "Build Wealth";
    default: return "Unknown";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "complete": return "text-teal bg-teal/10";
    case "in_progress": return "text-amber bg-amber/10";
    case "not_started": return "text-muted-foreground bg-surface-hover";
    case "needs_review": return "text-coral bg-coral/10";
    default: return "text-muted-foreground bg-surface-hover";
  }
}
