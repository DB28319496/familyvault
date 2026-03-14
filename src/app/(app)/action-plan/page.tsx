"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  CalendarDays,
  StickyNote,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn, getPhaseColor, getPhaseLabel } from "@/lib/utils";
import { useActionItems } from "@/lib/hooks/use-data";
import type { ActionItem } from "@/lib/types";

type Status = "not_started" | "in_progress" | "complete";

const STATUS_CYCLE: Status[] = ["not_started", "in_progress", "complete"];

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof Circle; className: string }> = {
  not_started: { label: "Not Started", icon: Circle, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  in_progress: { label: "In Progress", icon: Clock, className: "bg-amber/15 text-amber" },
  complete: { label: "Complete", icon: CheckCircle2, className: "bg-teal/15 text-teal" },
};

const PHASE_COLORS: Record<number, string> = {
  1: "#E24B4A",
  2: "#EF9F27",
  3: "#1D9E75",
  4: "#2C5282",
};

export default function ActionPlanPage() {
  const { data: items, loading, update } = useActionItems();
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  const togglePhase = (phase: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const cycleStatus = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const currentIdx = STATUS_CYCLE.indexOf(item.status as Status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    await update(itemId, {
      status: nextStatus,
      completed_date: nextStatus === "complete" ? new Date().toISOString().split("T")[0] : null,
    });
  };

  const phases = [1, 2, 3, 4] as const;

  const phaseItems = useMemo(() => {
    const map: Record<number, ActionItem[]> = { 1: [], 2: [], 3: [], 4: [] };
    items.forEach((item) => {
      if (map[item.phase]) map[item.phase].push(item);
    });
    return map;
  }, [items]);

  const phaseProgress = useMemo(() => {
    const progress: Record<number, { completed: number; total: number; percent: number }> = {};
    phases.forEach((phase) => {
      const phaseList = phaseItems[phase];
      const completed = phaseList.filter((i) => i.status === "complete").length;
      progress[phase] = {
        completed,
        total: phaseList.length,
        percent: phaseList.length > 0 ? (completed / phaseList.length) * 100 : 0,
      };
    });
    return progress;
  }, [phaseItems]);

  const overallCompleted = items.filter((i) => i.status === "complete").length;
  const overallPercent = items.length > 0 ? (overallCompleted / items.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Action Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">Loading...</p>
        </div>
        <Card>
          <div className="h-32 animate-pulse bg-surface-hover rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Action Plan</h1>
        <p className="text-muted-foreground text-sm mt-1">Your financial roadmap — phase by phase</p>
      </div>

      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Overall Progress</CardTitle>
          <span className="text-sm font-bold text-foreground">
            {overallCompleted}/{items.length} complete
          </span>
        </div>
        <ProgressBar value={overallPercent} color="bg-teal" size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {Math.round(overallPercent)}% of your financial plan is complete
        </p>

        {/* Phase summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {phases.map((phase) => (
            <div
              key={phase}
              className="rounded-lg p-3 border border-border"
              style={{ borderLeftWidth: 3, borderLeftColor: PHASE_COLORS[phase] }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: PHASE_COLORS[phase] }}>
                Phase {phase}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{getPhaseLabel(phase)}</p>
              <div className="flex items-center gap-2 mt-2">
                <ProgressBar
                  value={phaseProgress[phase].percent}
                  color={`bg-[${PHASE_COLORS[phase]}]`}
                  size="sm"
                  className="flex-1"
                />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {phaseProgress[phase].completed}/{phaseProgress[phase].total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline / Phase Sections */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase);
          const progress = phaseProgress[phase];
          const color = PHASE_COLORS[phase];

          return (
            <Card key={phase} className="overflow-hidden p-0">
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase)}
                className="w-full flex items-center gap-4 p-5 hover:bg-surface-hover transition text-left"
              >
                {/* Color indicator */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: color }}
                >
                  {phase}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{getPhaseLabel(phase)}</h2>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      Phase {phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <ProgressBar value={progress.percent} size="sm" className="flex-1 max-w-48" />
                    <span className="text-xs text-muted-foreground">
                      {progress.completed}/{progress.total} complete
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Action items */}
              {isExpanded && (
                <div className="border-t border-border">
                  {phaseItems[phase].map((item, idx) => {
                    const status = item.status as Status;
                    const config = STATUS_CONFIG[status];
                    const StatusIcon = config.icon;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-4 p-5",
                          idx < phaseItems[phase].length - 1 && "border-b border-border"
                        )}
                      >
                        {/* Timeline dot */}
                        <div className="relative flex flex-col items-center pt-1">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                status === "complete"
                                  ? "#1D9E75"
                                  : status === "in_progress"
                                  ? "#EF9F27"
                                  : `${color}40`,
                            }}
                          />
                          {idx < phaseItems[phase].length - 1 && (
                            <div className="w-px flex-1 bg-border mt-2 min-h-[20px]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p
                                className={cn(
                                  "font-medium text-foreground",
                                  status === "complete" && "line-through text-muted-foreground"
                                )}
                              >
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                              )}
                            </div>

                            {/* Status badge */}
                            <button
                              onClick={() => cycleStatus(item.id)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition hover:opacity-80",
                                config.className
                              )}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {config.label}
                            </button>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-4 mt-2">
                            {item.target_date && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>
                                  Target:{" "}
                                  {new Date(item.target_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {item.notes && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <StickyNote className="w-3.5 h-3.5" />
                                <span>{item.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardTitle>Status Legend</CardTitle>
        <div className="flex flex-wrap gap-4 mt-3">
          {STATUS_CYCLE.map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </div>
                <span className="text-xs text-muted-foreground">Click to cycle</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
